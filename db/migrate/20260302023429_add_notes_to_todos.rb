class AddNotesToTodos < ActiveRecord::Migration[8.1]
  def change
    add_column :todos, :notes, :text
  end
end
