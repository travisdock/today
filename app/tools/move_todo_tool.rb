class MoveTodoTool < RubyLLM::Tool
  description "Move a todo to a different priority window."

  params do
    integer :todo_id, description: "The ID of the todo to move"

    string :priority_window, description: "The target priority window to move the todo to", enum: Todo::PRIORITY_WINDOWS.map(&:to_s)
  end

  def execute(todo_id:, priority_window:)
    user = Current.user
    service = TodoService.new(user.todos, user: user)
    todo = service.move_todo!(
      todo_id: todo_id,
      priority_window: priority_window
    )

    "Moved '#{todo.title}' to #{todo.priority_window}."
  end
end
