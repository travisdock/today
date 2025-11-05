class RemoveArchivedAtFromTodos < ActiveRecord::Migration[8.1]
  def change
    # Remove indexes that reference archived_at
    remove_index :todos, name: "index_todos_on_user_active", if_exists: true
    remove_index :todos, name: "index_todos_on_user_archived", if_exists: true
    remove_index :todos, name: "index_todos_on_user_window_position", if_exists: true
    remove_index :todos, name: "index_todos_active_window_position", if_exists: true

    # Remove the archived_at column
    remove_column :todos, :archived_at, :datetime

    # Recreate the unique index on active todos (now filtered by completed_at instead)
    add_index :todos, [ :user_id, :priority_window, :position ],
              name: "index_todos_active_window_position",
              unique: true,
              where: "completed_at IS NULL"

    # Add optimized partial index for recent completed todos lookups
    add_index :todos, [ :user_id, :completed_at ],
              name: "index_todos_on_user_completed",
              order: { completed_at: :desc },
              where: "completed_at IS NOT NULL"
  end
end
