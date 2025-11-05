class AddPriorityWindowToTodos < ActiveRecord::Migration[8.1]
  def change
    # Add priority_window as required enum field
    add_column :todos, :priority_window, :string, null: false, default: 'today'

    # Backfill existing todos to 'today' window without loading the model
    reversible do |dir|
      dir.up do
        execute <<~SQL
          UPDATE todos
          SET priority_window = 'today'
          WHERE priority_window IS NULL
        SQL
      end
    end

    # Add composite index for efficient window + position queries
    add_index :todos, [ :user_id, :priority_window, :position, :archived_at ],
              name: 'index_todos_on_user_window_position'

    # Add check constraint to ensure valid values
    add_check_constraint :todos,
                        "priority_window IN ('today', 'tomorrow', 'this_week', 'next_week')",
                        name: 'priority_window_check'
  end
end
