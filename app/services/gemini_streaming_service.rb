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
    @todo_service = TodoService.new(@user.todos, user: @user)
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
    # Get current todos context
    todos_context = @todo_service.list_for_context
    todos_json = JSON.pretty_generate(todos_context)

    setup = {
      setup: {
        model: "models/gemini-2.0-flash-exp",
        generation_config: {
          response_modalities: [ "TEXT" ]
        },
        system_instruction: {
          parts: [ {
            text: <<~INSTRUCTION
              You are a voice-controlled todo list assistant. The user will give you voice commands to manage their todos.

              Todos are organized into 4 priority windows:
              - today: Tasks for today
              - tomorrow: Tasks for tomorrow
              - this_week: Tasks for this week
              - next_week: Tasks for next week

              CURRENT TODOS (grouped by priority window with IDs and positions):
              #{todos_json}

              Available tools:
              1. createTodos - Create multiple todos at once with titles and priority windows
              2. moveTodo - Move a single todo to a different priority window (requires todo_id)
              3. bulkMoveTodos - Move multiple todos to a different priority window at once (requires todo_ids array)
              4. reorderTodos - Reorder all todos within a priority window by providing the complete ordered list of IDs

              CRITICAL RULES:
              - You MUST use the tools to make changes - NEVER just respond with text
              - ALWAYS call the appropriate tool before or while responding
              - If you need to create todos, call createTodos
              - If you need to move a todo, call moveTodo or bulkMoveTodos
              - If you need to reorder todos, call reorderTodos
              - After each successful tool call, you will receive updated_context with the current state of all todos
              - Use this updated context for subsequent commands in the same conversation

              When the user refers to a todo by title (e.g., "move walk the dogs to today"), you MUST:
              1. Look up the todo in the CURRENT TODOS list above (or in updated_context from recent tool responses) to find its ID
              2. Use that ID in the tool call

              Examples:
              - "Tomorrow I need to walk the dogs and buy groceries" → CALL createTodos with 2 todos for tomorrow
              - "Move walk the dogs to today" → Find "walk the dogs" ID in the list above, then CALL moveTodo with that ID
              - "Put buy groceries first tomorrow" → Find all todo IDs for tomorrow, CALL reorderTodos with buy groceries ID first

              Be responsive and process commands in real-time as the user speaks.
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
              },
              {
                name: "moveTodo",
                description: "Move a single todo to a different priority window",
                parameters: {
                  type: "object",
                  properties: {
                    todo_id: {
                      type: "integer",
                      description: "The ID of the todo to move"
                    },
                    priority_window: {
                      type: "string",
                      description: "The target priority window to move the todo to",
                      enum: [ "today", "tomorrow", "this_week", "next_week" ]
                    }
                  },
                  required: [ "todo_id", "priority_window" ]
                }
              },
              {
                name: "bulkMoveTodos",
                description: "Move multiple todos to a different priority window at once",
                parameters: {
                  type: "object",
                  properties: {
                    todo_ids: {
                      type: "array",
                      items: { type: "integer" },
                      description: "Array of todo IDs to move"
                    },
                    priority_window: {
                      type: "string",
                      description: "The target priority window to move all todos to",
                      enum: [ "today", "tomorrow", "this_week", "next_week" ]
                    }
                  },
                  required: [ "todo_ids", "priority_window" ]
                }
              },
              {
                name: "reorderTodos",
                description: "Reorder todos within a specific priority window by providing all todo IDs for that window in the desired order",
                parameters: {
                  type: "object",
                  properties: {
                    priority_window: {
                      type: "string",
                      description: "The priority window to reorder todos in",
                      enum: [ "today", "tomorrow", "this_week", "next_week" ]
                    },
                    ordered_ids: {
                      type: "array",
                      items: { type: "integer" },
                      description: "Array of todo IDs in the desired order"
                    }
                  },
                  required: [ "priority_window", "ordered_ids" ]
                }
              }
            ]
          }
        ]
      }
    }

    @ws.send(setup.to_json)
    Rails.logger.debug("[GeminiStreaming] Setup message sent")
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
        Rails.logger.debug("[GeminiStreaming] ✅ Turn complete")
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

      Rails.logger.debug("[GeminiStreaming] Tool called: #{name} with args: #{args.to_json}")

      case name
      when "createTodos"
        todos_data = args["todos"] || []

        begin
          # Use TodoService to create todos (handles transactions and position assignment)
          created_todos = @todo_service.bulk_create_todos!(todos: todos_data)

          # Track and notify for each created todo
          created_todos.each do |todo|
            @extracted_todos << todo
            @on_todo_callback&.call(todo)
          end

          Rails.logger.info("[GeminiStreaming] Created #{created_todos.length} todo(s)")

          # Send positive response
          send_tool_response(call_id, name, {
            success: true,
            message: "Created #{created_todos.length} todo(s)"
          })
        rescue ArgumentError, ActiveRecord::RecordInvalid => e
          Rails.logger.error("[GeminiStreaming] ❌ Failed to create todos: #{e.message}")

          # Send error response to Gemini
          send_tool_response(call_id, name, {
            success: false,
            error: e.message
          })
        end

      when "moveTodo"
        todo_id = args["todo_id"]
        priority_window = args["priority_window"]

        begin
          todo, old_priority_window = @todo_service.move_todo!(
            todo_id: todo_id,
            priority_window: priority_window
          )

          # Notify about the moved todo with both old and new windows
          @on_todo_callback&.call(todo, old_priority_window)

          send_tool_response(call_id, name, {
            success: true,
            message: "Moved '#{todo.title}' to #{priority_window}"
          })
        rescue ArgumentError, ActiveRecord::RecordNotFound => e
          Rails.logger.error("[GeminiStreaming] ❌ Failed to move todo: #{e.message}")

          send_tool_response(call_id, name, {
            success: false,
            error: e.message
          })
        end

      when "bulkMoveTodos"
        todo_ids = args["todo_ids"] || []
        priority_window = args["priority_window"]

        begin
          todos, old_priority_windows = @todo_service.bulk_move_todos!(
            todo_ids: todo_ids,
            priority_window: priority_window
          )

          # Notify about first moved todo with all old windows to trigger UI updates
          if todos.any?
            @on_todo_callback&.call(todos.first, old_priority_windows)
          end

          moved_count = todos.count { |t| t.priority_window.to_s == priority_window.to_s }

          message = if moved_count == 1
            "Moved '#{todos.first.title}' to #{priority_window}"
          else
            "Moved #{moved_count} todos to #{priority_window}"
          end

          send_tool_response(call_id, name, {
            success: true,
            message: message
          })
        rescue ArgumentError, ActiveRecord::RecordNotFound => e
          Rails.logger.error("[GeminiStreaming] ❌ Failed to move todos: #{e.message}")

          send_tool_response(call_id, name, {
            success: false,
            error: e.message
          })
        end

      when "reorderTodos"
        priority_window = args["priority_window"]
        ordered_ids = args["ordered_ids"] || []

        begin
          @todo_service.reorder_todos!(
            priority_window: priority_window,
            ordered_ids: ordered_ids
          )

          # Notify about reorder (send first todo to trigger UI update)
          if ordered_ids.any?
            first_todo = @user.todos.find(ordered_ids.first)
            @on_todo_callback&.call(first_todo)
          end

          send_tool_response(call_id, name, {
            success: true,
            message: "Reordered todos in #{priority_window}"
          })
        rescue ArgumentError, ActiveRecord::RecordNotFound => e
          Rails.logger.error("[GeminiStreaming] ❌ Failed to reorder todos: #{e.message}")

          send_tool_response(call_id, name, {
            success: false,
            error: e.message
          })
        end
      end
    end
  end

  def send_tool_response(call_id, name, response)
    # Add fresh context after successful changes
    if response[:success]
      todos_context = @todo_service.list_for_context
      response[:updated_context] = todos_context
    end

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
    Rails.logger.debug("[GeminiStreaming] Tool response sent for #{name}")
  end
end
