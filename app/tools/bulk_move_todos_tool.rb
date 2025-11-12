class BulkMoveTodosTool < RubyLLM::Tool
  description "Move multiple todos to a different priority window at once."

  params do
    array :todo_ids, of: :integer, description: "Array of todo IDs to move"

    string :priority_window, description: "The target priority window to move all todos to", enum: Todo::PRIORITY_WINDOWS.map(&:to_s)
  end

  def execute(todo_ids:, priority_window:)
    user = Current.user
    service = TodoService.new(user.todos, user: user)
    todos = service.bulk_move_todos!(
      todo_ids: todo_ids,
      priority_window: priority_window
    )

    moved_count = todos.count { |t| t.priority_window.to_s == priority_window.to_s }
    if moved_count == 1
      "Moved '#{todos.first.title}' to #{priority_window}."
    else
      "Moved #{moved_count} todos to #{priority_window}."
    end
  end
end
