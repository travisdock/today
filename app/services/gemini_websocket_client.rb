# frozen_string_literal: true

require "websocket-client-simple"
require "json"

# WebSocket client for connecting to Gemini Live API
# Handles bidirectional audio streaming and tool calling
class GeminiWebsocketClient
  GEMINI_MODEL = "gemini-2.5-flash-native-audio-preview-09-2025"
  GEMINI_WS_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent"

  attr_reader :user, :channel

  def initialize(user:, channel:)
    @user = user
    @channel = channel
    @ws = nil
    @connected = false
    @setup_complete = false
    @response_timeout_timer = nil
  end

  # Connect to Gemini WebSocket API
  def connect
    api_key = Rails.application.credentials.gemini_api_key || ENV["GEMINI_API_KEY"]
    unless api_key
      Rails.logger.error("[GeminiWS] No API key found!")
      raise "Gemini API key not configured"
    end

    url = "#{GEMINI_WS_URL}?key=#{api_key}&alt=ws"

    Rails.logger.info("[GeminiWS] Connecting to Gemini Live API for user #{user.id}")
    Rails.logger.info("[GeminiWS] URL: #{url[0..100]}...") # Log first 100 chars

    begin
      @ws = WebSocket::Client::Simple.connect(url)
      Rails.logger.info("[GeminiWS] WebSocket client created, setting up handlers")
    rescue => e
      Rails.logger.error("[GeminiWS] Failed to create WebSocket client: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      raise
    end

    # Capture self to use in callbacks (where 'self' becomes the WebSocket object)
    client = self

    @ws.on :open do
      Rails.logger.info("[GeminiWS] WebSocket opened!")
      client.instance_variable_set(:@connected, true)
      client.send(:send_setup_message)
    end

    @ws.on :message do |msg|
      Rails.logger.debug("[GeminiWS] Received message (#{msg.data.length} bytes)")
      client.send(:handle_message, msg.data)
    end

    @ws.on :close do |e|
      Rails.logger.info("[GeminiWS] WebSocket closed: #{e}")
      client.instance_variable_set(:@connected, false)
      client.instance_variable_set(:@setup_complete, false)
      client.send(:notify_channel, :closed)
    end

    @ws.on :error do |e|
      Rails.logger.error("[GeminiWS] WebSocket error: #{e}")
      client.send(:notify_channel, :error, { message: "Connection error" })
    end

    Rails.logger.info("[GeminiWS] Connection handlers configured")
  end

  # Send audio data to Gemini
  def send_audio(base64_pcm_data)
    return unless @ws && @setup_complete

    message = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: "audio/pcm;rate=16000",
            data: base64_pcm_data
          }
        ]
      }
    }

    @ws.send(message.to_json)
  end

  # Signal end of audio stream
  def send_audio_stream_end
    return unless @ws && @setup_complete

    Rails.logger.info("[GeminiWS] Sending audio stream end signal")

    message = {
      realtimeInput: {}
    }

    @ws.send(message.to_json)
    Rails.logger.info("[GeminiWS] Audio stream end sent - waiting for Gemini response...")

    # Start timeout timer (8 seconds) - if no response, force turn complete
    start_response_timeout
  end

  # Start a timeout timer for Gemini's response
  def start_response_timeout
    cancel_response_timeout

    @response_timeout_timer = Thread.new do
      sleep 8 # Wait 8 seconds for Gemini to respond
      if @connected && @setup_complete
        Rails.logger.warn("[GeminiWS] Response timeout - Gemini did not respond within 8 seconds")
        Rails.logger.info("[GeminiWS] Forcing turn complete and closing connection")
        notify_channel(:turn_complete)
        disconnect
      end
    end
  end

  # Cancel the response timeout timer
  def cancel_response_timeout
    if @response_timeout_timer
      @response_timeout_timer.kill
      @response_timeout_timer = nil
    end
  end

  # Close the WebSocket connection
  def disconnect
    Rails.logger.info("[GeminiWS] Disconnecting")
    cancel_response_timeout
    @ws&.close
    @ws = nil
    @connected = false
    @setup_complete = false
  end

  def connected?
    @connected && @setup_complete
  end

  private

  # Send initial setup message to configure Gemini
  def send_setup_message
    Rails.logger.info("[GeminiWS] Building setup message")
    tools = build_tools
    system_instruction = build_system_instruction

    setup_message = {
      setup: {
        model: "models/#{GEMINI_MODEL}",
        generationConfig: {
          responseModalities: [ "AUDIO" ]
        },
        systemInstruction: system_instruction,
        tools: [ { functionDeclarations: tools } ]
      }
    }

    Rails.logger.info("[GeminiWS] Sending setup message (#{setup_message.to_json.length} bytes)")
    begin
      @ws.send(setup_message.to_json)
      Rails.logger.info("[GeminiWS] Setup message sent")
    rescue => e
      Rails.logger.error("[GeminiWS] Failed to send setup message: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
    end
  end

  # Handle incoming messages from Gemini
  def handle_message(data)
    Rails.logger.debug("[GeminiWS] Parsing message...")
    message = JSON.parse(data)
    Rails.logger.info("[GeminiWS] Received message with keys: #{message.keys.join(', ')}")

    # Setup complete - ready to receive audio
    if message["setupComplete"]
      Rails.logger.info("[GeminiWS] Setup complete!")
      @setup_complete = true
      notify_channel(:ready)
      return
    end

    # Handle tool calls
    if message["toolCall"]
      Rails.logger.info("[GeminiWS] Received tool call")
      cancel_response_timeout # Got a response, cancel timeout
      handle_tool_call(message["toolCall"])
    end

    # Handle turn completion
    if message.dig("serverContent", "turnComplete")
      Rails.logger.info("[GeminiWS] Turn complete")
      cancel_response_timeout # Got turn complete, cancel timeout
      notify_channel(:turn_complete)
    end

    # Log if we received a message we don't recognize
    if !message["setupComplete"] && !message["toolCall"] && !message.dig("serverContent", "turnComplete")
      Rails.logger.info("[GeminiWS] Unhandled message type: #{message.inspect[0..500]}")
    end
  rescue JSON::ParserError => e
    Rails.logger.error("[GeminiWS] Failed to parse message: #{e}")
    Rails.logger.error("[GeminiWS] Raw data: #{data[0..200]}")
  rescue => e
    Rails.logger.error("[GeminiWS] Error handling message: #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
  end

  # Process tool calls from Gemini
  def handle_tool_call(tool_call_data)
    Rails.logger.info("[GeminiWS] Processing tool call data: #{tool_call_data.inspect}")
    function_calls = tool_call_data["functionCalls"]
    unless function_calls
      Rails.logger.warn("[GeminiWS] No functionCalls in tool call data")
      return
    end

    Rails.logger.info("[GeminiWS] Found #{function_calls.length} function calls")
    function_calls.each do |fc|
      Rails.logger.info("[GeminiWS] Function: #{fc['name']}")
      if fc["name"] == "createTodos"
        process_create_todos(fc)
      else
        Rails.logger.warn("[GeminiWS] Unknown function: #{fc['name']}")
      end
    end
  end

  # Execute createTodos tool call
  def process_create_todos(function_call)
    args = function_call["args"]
    items = args["items"]
    priority_window = args["priority_window"]

    Rails.logger.info("[GeminiWS] Creating #{items.length} todos in #{priority_window}: #{items.inspect}")

    # Create todos using existing service
    service = TodoService.new(user.todos, user: user)
    todos_data = items.map { |title| { title: title, priority_window: priority_window } }
    Rails.logger.info("[GeminiWS] Calling bulk_create_todos with: #{todos_data.inspect}")
    todos = service.bulk_create_todos!(todos: todos_data)
    Rails.logger.info("[GeminiWS] Created #{todos.length} todos successfully")

    # Send tool response back to Gemini
    send_tool_response(function_call["id"], function_call["name"], {
      result: "Created #{todos.length} todos."
    })

    # Notify channel to update UI
    notify_channel(:todos_created, {
      priority_window: priority_window,
      todos: todos.map { |t| { id: t.id, title: t.title } }
    })
    Rails.logger.info("[GeminiWS] Notified channel of todos_created")
  rescue StandardError => e
    Rails.logger.error("[GeminiWS] Failed to create todos: #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
    send_tool_response(function_call["id"], function_call["name"], {
      error: "Failed to create todos"
    })
  end

  # Send tool response back to Gemini
  def send_tool_response(function_call_id, function_name, response)
    message = {
      toolResponse: {
        functionResponses: [
          {
            id: function_call_id,
            name: function_name,
            response: response
          }
        ]
      }
    }

    @ws.send(message.to_json)
  end

  # Notify the Action Cable channel of events
  def notify_channel(event, data = {})
    channel.handle_gemini_event(event, data)
  end

  # Build tool declarations for Gemini
  def build_tools
    [
      {
        name: "createTodos",
        description: "Creates new todo items from user speech. Extract action items and assign them to appropriate time windows.",
        parameters: {
          type: "OBJECT",
          properties: {
            items: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "List of NEW todo items mentioned by user."
            },
            priority_window: {
              type: "STRING",
              enum: [ "today", "tomorrow", "this_week", "next_week" ],
              description: "Time window for these todos. Infer from user speech (default: today)."
            }
          },
          required: [ "items", "priority_window" ]
        }
      }
    ]
  end

  # Build system instruction for Gemini
  def build_system_instruction
    {
      parts: [
        {
          text: <<~INSTRUCTION
              You are a helpful todo assistant. Extract action items from user speech and create todos with appropriate priority windows.

              Priority windows:
              - today: Tasks for today
              - tomorrow: Tasks for tomorrow
              - this_week: Tasks for this week
              - next_week: Tasks for next week

              CRITICAL RULES:
              1. ONLY extract todos from the CURRENT audio stream (between when recording starts and audioStreamEnd signal)
              2. When the user mentions a task, immediately call the createTodos function with the appropriate priority window
              3. If no time is specified, default to "today"
              4. Do NOT generate any verbal responses or confirmations
              5. Complete your turn immediately after calling all necessary tool functions


              Extract todos as the user speaks. You can call createTodos multiple times if the user mentions multiple tasks within the CURRENT audio stream. After the audio stream ends, finish processing any remaining todos from THIS stream only and complete your turn.

              It is possible that a user will say something like "Tomorrow I need to clean the kitchen.." and you will call createTodos with "clean the kitchen" and "tomorrow" as the priority window. Then the user will continue speaking with ".. and also buy groceries." In this case, you should call createTodos again with "buy groceries" and "tomorrow" as the priority window if it seems the user was mentioning these todos in the same phrase.

              Examples:
              - "Add buy milk" → createTodos({items: ["Buy milk"], priority_window: "today"})
              - "Add call dentist tomorrow" → createTodos({items: ["Call dentist"], priority_window: "tomorrow"})
              - "Add buy groceries and clean house to my todos" → createTodos({items: ["Buy groceries", "Clean house"], priority_window: "today"})

              Be responsive and extract todos in real-time as the user speaks.`
          INSTRUCTION
        }
      ]
    }
  end
end
