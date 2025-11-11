class BulkCreateTodosTool < RubyLLM::Tool
  description "Add several todos at once, preserving their order."

  params do
    array :todos, description: "Array of todos to create" do
      object do
        string :title

        any_of :priority_window, description: "The priority window for this todo. Defaults to 'today' if not specified." do
          string enum: Todo::PRIORITY_WINDOWS.map(&:to_s)
          null
        end

        any_of :position, description: "Target position (1-based) in the priority window" do
          integer minimum: 1
          null
        end
      end
    end
  end

  def execute(todos:)
    user = Current.user
    service = TodoService.new(user.todos, user: user)
    created_todos = service.bulk_create_todos!(todos: todos)

    if created_todos.length == 1
      "Added '#{created_todos.first.title}' to #{created_todos.first.priority_window}."
    else
      todo_list = created_todos.map { |t| "'#{t.title}'" }.join(", ")
      "Added #{created_todos.length} todos: #{todo_list}."
    end
  end
end
