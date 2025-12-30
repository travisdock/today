class CreateResources < ActiveRecord::Migration[8.1]
  def change
    create_table :resources do |t|
      t.references :project, null: false, foreign_key: { on_delete: :cascade }
      t.text :content
      t.string :url

      t.timestamps
    end

    add_index :resources, [ :project_id, :created_at ], order: { created_at: :desc }
  end
end
