class AddJournalEntriesCountToProjects < ActiveRecord::Migration[8.1]
  def change
    add_column :projects, :journal_entries_count, :integer, default: 0, null: false
  end
end
