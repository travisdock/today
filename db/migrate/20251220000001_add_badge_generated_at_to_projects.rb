class AddBadgeGeneratedAtToProjects < ActiveRecord::Migration[8.1]
  def change
    add_column :projects, :badge_generated_at, :datetime
  end
end
