class ReorderTodosTool < RubyLLM::Tool
  description "Reorder todos within a specific priority window by providing all todo IDs for that window in the desired order."

  params do
    string :priority_window, description: "The priority window to reorder todos in", enum: Todo::PRIORITY_WINDOWS.map(&:to_s)

    array :ordered_ids, of: :integer, description: "Array of todo IDs in the desired order"
  end

  def execute(priority_window:, ordered_ids:)
    user = Current.user
    service = TodoService.new(user.todos, user: user)
    service.reorder_todos!(
      priority_window: priority_window,
      ordered_ids: ordered_ids
    )

    "Reordered todos in #{priority_window}."
  end
end
