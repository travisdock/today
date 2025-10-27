class AddPositionToTodos < ActiveRecord::Migration[8.1]
  class MigrationTodo < ActiveRecord::Base
    self.table_name = "todos"
  end

  def up
    add_column :todos, :position, :integer, null: false, default: 0
    say_with_time "Backfilling todo positions" do
      MigrationTodo.reset_column_information

      MigrationTodo.order(:user_id, :archived_at, :created_at, :id)
                   .group_by { |todo| [ todo.user_id, todo.archived_at.present? ] }
                   .each_value do |todos|
        next if todos.empty?

        sql_parts = todos.each_with_index.map { |todo, index| "WHEN #{todo.id} THEN #{index + 1}" }
        MigrationTodo.where(id: todos.map(&:id))
                     .update_all("position = CASE id #{sql_parts.join(' ')} END")
      end
    end

    add_index :todos, [ :user_id, :position ],
      unique: true,
      where: "archived_at IS NULL",
      name: "index_todos_active_position"
  end

  def down
    remove_index :todos, name: "index_todos_active_position"
    remove_column :todos, :position
  end
end
