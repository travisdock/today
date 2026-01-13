class AddActiveToProjectSections < ActiveRecord::Migration[8.1]
  def change
    remove_check_constraint :projects, name: "section_check"
    add_check_constraint :projects,
                         "section IN ('active', 'this_month', 'next_month', 'this_year', 'next_year')",
                         name: "section_check"
  end
end
