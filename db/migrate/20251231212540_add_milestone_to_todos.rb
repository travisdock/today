class AddMilestoneToTodos < ActiveRecord::Migration[8.1]
  def change
    add_reference :todos, :milestone, null: true, foreign_key: { on_delete: :nullify }
  end
end
