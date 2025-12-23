class CreateThoughts < ActiveRecord::Migration[8.1]
  def change
    create_table :thoughts do |t|
      t.references :project, null: false, foreign_key: { on_delete: :cascade }
      t.text :content, null: false

      t.timestamps
    end

    add_index :thoughts, [ :project_id, :created_at ], order: { created_at: :desc }
  end
end
