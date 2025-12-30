class AddSectionToProjects < ActiveRecord::Migration[8.1]
  def change
    add_column :projects, :section, :string, null: false, default: "next_year"

    add_index :projects, [ :user_id, :section ], name: "index_projects_on_user_section"

    add_check_constraint :projects,
                         "section IN ('this_month', 'next_month', 'this_year', 'next_year')",
                         name: "section_check"
  end
end
