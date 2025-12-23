class AddThoughtsCountToProjects < ActiveRecord::Migration[8.1]
  def change
    add_column :projects, :thoughts_count, :integer, default: 0, null: false

    reversible do |dir|
      dir.up do
        execute <<-SQL.squish
          UPDATE projects
          SET thoughts_count = (
            SELECT COUNT(*) FROM thoughts WHERE thoughts.project_id = projects.id
          )
        SQL
      end
    end
  end
end
