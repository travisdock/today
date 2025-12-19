class AddIndexesAndFixForeignKeyOnProjects < ActiveRecord::Migration[8.1]
  def change
    # Add composite index for the common query: user.projects.active.order(created_at: :desc)
    add_index :projects, [ :user_id, :archived_at, :created_at ],
              name: "index_projects_on_user_active_created"
  end
end
