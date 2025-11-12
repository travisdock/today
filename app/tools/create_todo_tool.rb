class CreateTodoTool < RubyLLM::Tool
  description "Create a new todo item with a title, priority window, and optional target position (1-based)."

  params do
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

  def execute(title:, priority_window: "today", position: nil)
    user = Current.user
    service = TodoService.new(user.todos, user: user)
    todo = service.create_todo!(
      title: title,
      priority_window: priority_window,
      position: position
    )

    "Added '#{todo.title}' to #{todo.priority_window}."
  end
end
