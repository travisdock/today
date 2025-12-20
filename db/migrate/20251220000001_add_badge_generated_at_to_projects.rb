class AddBadgeGeneratedAtToProjects < ActiveRecord::Migration[8.0]
  def change
    add_column :projects, :badge_generated_at, :datetime
  end
end
