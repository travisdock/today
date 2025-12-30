class CreateJournalEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :journal_entries do |t|
      t.references :project, null: false, foreign_key: { on_delete: :cascade }
      t.text :content

      t.timestamps
    end

    add_index :journal_entries, [ :project_id, :created_at ], order: { created_at: :desc }
  end
end
