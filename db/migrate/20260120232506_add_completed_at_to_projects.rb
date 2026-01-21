class AddCompletedAtToProjects < ActiveRecord::Migration[8.1]
  def change
    add_column :projects, :completed_at, :datetime
  end
end
