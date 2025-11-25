require "websocket-client-simple"
require "json"
require "base64"

class GeminiStreamingService
  GEMINI_WS_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent"

  attr_reader :extracted_todos

  def initialize(user:)
    @ws = nil
    @user = user
    @extracted_todos = []
    @on_todo_callback = nil
    @setup_complete = false
  end

  def connect
    api_key = Rails.application.credentials.gemini_api_key
    url = "#{GEMINI_WS_URL}?key=#{api_key}&alt=ws"

    @ws = WebSocket::Client::Simple.connect(url)

    client = self

    @ws.on :open do
      Rails.logger.info("[GeminiStreaming] Gemini connection established")
      client.send(:send_setup_message)
    end

    @ws.on :message do |msg|
      client.send(:handle_gemini_message, msg.data)
    end

    @ws.on :close do |e|
      Rails.logger.info("[GeminiStreaming] Gemini connection closed: #{e}")
    end

    @ws.on :error do |e|
      Rails.logger.error("[GeminiStreaming] Gemini error: #{e}")
    end
  end

  def send_audio_chunk(pcm_data)
    return unless @setup_complete

    base64_audio = Base64.strict_encode64(pcm_data)

    message = {
      realtime_input: {
        media_chunks: [ {
          mime_type: "audio/pcm",
          data: base64_audio
        } ]
      }
    }

    @ws.send(message.to_json)
  end

  def on_todo(&block)
    @on_todo_callback = block
  end

  def close
    @ws&.close
  end

  private

  def send_setup_message
    setup = {
      setup: {
        model: "models/gemini-2.0-flash-exp",
        generation_config: {
          response_modalities: [ "TEXT" ]
        },
        system_instruction: {
          parts: [ {
            text: <<~INSTRUCTION
              You are a helpful todo assistant. Extract action items from user speech and create todos with appropriate priority windows. If no time is specified, default to "today".

              Priority windows:
              - today: Tasks for today
              - tomorrow: Tasks for tomorrow
              - this_week: Tasks for this week
              - next_week: Tasks for next week

              It is possible that a user will say something like "Tomorrow I need to clean the kitchen.." and you will call createTodos with "clean the kitchen" and "tomorrow" as the priority window. Then the user will continue speaking with ".. and buy groceries." In this case, you should call createTodos again with "buy groceries" and "tomorrow" as the priority window because the user was mentioning the next task in the same phrase. Be sure to group task priority windows correctly based on user phrasing.

              Examples:
              - "Add buy milk" → createTodos({items: ["Buy milk"], priority_window: "today"})
              - "Add call dentist tomorrow" → createTodos({items: ["Call dentist"], priority_window: "tomorrow"})
              - "Add buy groceries and clean house to my todos" → createTodos({items: ["Buy groceries", "Clean house"], priority_window: "today"})

              Be responsive and extract todos in real-time as the user speaks.`
            INSTRUCTION
          } ]
        },
        tools: [
          {
            function_declarations: [
              {
                name: "createTodos",
                description: "Create todo items from user speech",
                parameters: {
                  type: "object",
                  properties: {
                    todos: {
                      type: "array",
                      description: "Array of todo items to create",
                      items: {
                        type: "object",
                        properties: {
                          title: {
                            type: "string",
                            description: "The todo item description"
                          },
                          priority_window: {
                            type: "string",
                            description: "When the todo should be done",
                            enum: [ "today", "tomorrow", "this_week", "next_week" ]
                          }
                        },
                        required: [ "title", "priority_window" ]
                      }
                    }
                  },
                  required: [ "todos" ]
                }
              }
            ]
          }
        ]
      }
    }

    @ws.send(setup.to_json)
    Rails.logger.info("[GeminiStreaming] Setup message sent")
  end

  def handle_gemini_message(data)
    message = JSON.parse(data)

    if message["setupComplete"]
      @setup_complete = true
      Rails.logger.info("[GeminiStreaming] ✅ Setup complete, ready to receive audio")
    end

    if message["toolCall"]
      handle_tool_call(message["toolCall"])
    end

    if message["serverContent"]
      server_content = message["serverContent"]
      turn_complete = server_content["turnComplete"]

      if turn_complete
        Rails.logger.info("[GeminiStreaming] ✅ Turn complete")
      end
    end
  rescue JSON::ParserError => e
    Rails.logger.error("[GeminiStreaming] Failed to parse Gemini message: #{e.message}")
  end

  def handle_tool_call(tool_call)
    function_calls = tool_call["functionCalls"] || []

    function_calls.each do |call|
      call_id = call["id"]
      name = call["name"]
      args = call["args"]

      Rails.logger.info("[GeminiStreaming] 🔧 Tool called: #{name}")
      Rails.logger.info("[GeminiStreaming] 📋 Arguments: #{args.to_json}")

      if name == "createTodos"
        todos = args["todos"] || []
        created_todos = []

        todos.each do |todo_data|
          Rails.logger.info("[GeminiStreaming] ⚡ TODO EXTRACTED: #{todo_data.to_json}")

          begin
            # Create the todo in the database
            todo = @user.todos.create!(
              title: todo_data["title"],
              priority_window: todo_data["priority_window"]
            )

            created_todos << todo
            @extracted_todos << todo
            @on_todo_callback&.call(todo)

            Rails.logger.info("[GeminiStreaming] ✅ TODO CREATED: ##{todo.id} - #{todo.title}")
          rescue ActiveRecord::RecordInvalid => e
            Rails.logger.error("[GeminiStreaming] ❌ Failed to create todo: #{e.message}")
            # Continue processing other todos
          end
        end

        # Send positive response
        send_tool_response(call_id, name, {
          success: true,
          created: created_todos.length,
          message: "Created #{created_todos.length} todo(s)"
        })
      end
    end
  end

  def send_tool_response(call_id, name, response)
    message = {
      tool_response: {
        function_responses: [
          {
            id: call_id,
            name: name,
            response: response
          }
        ]
      }
    }

    @ws.send(message.to_json)
    Rails.logger.info("[GeminiStreaming] ✅ Tool response sent: #{response.to_json}")
  end
end
