class CreateTodos < ActiveRecord::Migration[8.1]
  def change
    create_table :todos do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.string :title, null: false, limit: 255
      t.datetime :completed_at
      t.datetime :archived_at

      t.timestamps
    end

    add_index :todos, [ :user_id, :archived_at, :created_at ], name: "index_todos_on_user_active"
    add_index :todos, [ :user_id, :archived_at ], where: "archived_at IS NOT NULL", name: "index_todos_on_user_archived"
  end
end
