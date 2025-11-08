module OpenRouter
  class Agent
    def initialize(client: OpenRouter::Client.new)
      @client = client
    end

    def run(instructions:, user: nil)
      user ||= Current.user
      raise ArgumentError, "Current user required" unless user

      service = TodoService.new(user.todos.active)

      messages = [
        {
          role: "system",
          content: [
            { type: "text", text: "You manage a todo list organized into priority windows: 'today', 'tomorrow', 'this_week', and 'next_week'. Available tools: create_todo, bulk_create_todos, reorder_todos, move_todo, bulk_move_todos. When creating todos, assign them to the appropriate priority window based on the user's intent. Use move_todo to move a single todo or bulk_move_todos to move multiple todos between priority windows. Issue at most one tool call per response and wait for the application's reply before calling another tool. Prefer tool calls for any changes." }
          ]
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Current todos grouped by priority window (JSON):\n" + JSON.pretty_generate(service.list_for_context) },
            { type: "text", text: "Instruction: #{instructions}" }
          ]
        }
      ]

      response = @client.chat(messages: messages, tools: Tools::TOOL_LIST)
      tool_calls = []
      iterations = 0

      user.todos.transaction do
        loop do
          Rails.logger.debug response
          assistant_message = response.dig("choices", 0, "message")
          break unless assistant_message

          messages << format_assistant_message(assistant_message)

          tool_call = extract_tool_call(assistant_message)
          break unless tool_call

          iterations += 1
          raise IterationLimitExceeded, "Agent reached the maximum number of tool calls (#{MAX_TOOL_ITERATIONS})." if iterations > MAX_TOOL_ITERATIONS

          tool_calls << tool_call

          case tool_call[:name]
          when "create_todo"
            args = safe_json(tool_call[:arguments]) || {}
            created = service.create_todo!(
              title: args["title"],
              position: args["position"],
              priority_window: args["priority_window"] || "today"
            )
            tool_result = {
              status: "ok",
              todo: {
                id: created.id,
                title: created.title,
                position: created.position,
                priority_window: created.priority_window
              }
            }
          when "bulk_create_todos"
            args = safe_json(tool_call[:arguments]) || {}
            created = service.bulk_create_todos!(todos: args["todos"] || [])
            tool_result = {
              status: "ok",
              todos: created.map { |todo| {
                id: todo.id,
                title: todo.title,
                position: todo.position,
                priority_window: todo.priority_window
              } }
            }
          when "reorder_todos"
            args = safe_json(tool_call[:arguments]) || {}
            service.reorder_todos!(
              ordered_ids: args["ordered_ids"] || [],
              priority_window: args["priority_window"]
            )
            tool_result = { status: "ok" }
          when "move_todo"
            args = safe_json(tool_call[:arguments]) || {}
            moved = service.move_todo!(
              todo_id: args["todo_id"],
              priority_window: args["priority_window"]
            )
            tool_result = {
              status: "ok",
              todo: {
                id: moved.id,
                title: moved.title,
                position: moved.position,
                priority_window: moved.priority_window
              }
            }
          when "bulk_move_todos"
            args = safe_json(tool_call[:arguments]) || {}
            moved = service.bulk_move_todos!(
              todo_ids: args["todo_ids"] || [],
              priority_window: args["priority_window"]
            )
            tool_result = {
              status: "ok",
              todos: moved.map { |todo| {
                id: todo.id,
                title: todo.title,
                position: todo.position,
                priority_window: todo.priority_window
              } }
            }
          else
            tool_result = { status: "ignored_unknown_tool" }
          end

          messages << {
            role: "tool",
            tool_call_id: tool_call[:id],
            content: JSON.generate(tool_result)
          }

          response = @client.chat(messages: messages, tools: Tools::TOOL_LIST)
        end
      end

      {
        todos: service.list_for_context,
        tool_calls: tool_calls
      }
    end

    private
    MAX_TOOL_ITERATIONS = 4
    IterationLimitExceeded = Class.new(StandardError)

    def extract_tool_call(message)
      call = message.fetch("tool_calls", []).first
      return unless call

      {
        id: call["id"],
        name: call.dig("function", "name"),
        arguments: call.dig("function", "arguments")
      }
    end

    def format_assistant_message(message)
      msg = {
        role: message["role"] || "assistant"
      }
      msg[:content] = message["content"] unless message["content"].nil?
      first_tool_call = message.fetch("tool_calls", []).first
      msg[:tool_calls] = [ first_tool_call ] if first_tool_call
      msg
    end

    def safe_json(str)
      JSON.parse(str.to_s)
    rescue JSON::ParserError => e
      Rails.logger.warn("Failed to parse JSON in OpenRouter::Agent: #{e.message}")
      nil
    end
  end
end
