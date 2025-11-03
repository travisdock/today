class RemoveOldPositionIndexAndAddNewOne < ActiveRecord::Migration[8.1]
  def change
    # Remove the old unique index on (user_id, position)
    remove_index :todos, name: "index_todos_active_position"

    # Add new unique index on (user_id, priority_window, position) for active todos
    add_index :todos, [ :user_id, :priority_window, :position ],
              unique: true,
              where: "archived_at IS NULL",
              name: "index_todos_active_window_position"
  end
end
