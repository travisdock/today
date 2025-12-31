class CreateMilestones < ActiveRecord::Migration[8.1]
  def change
    create_table :milestones do |t|
      t.string :name, null: false, limit: 255
      t.text :description
      t.integer :position, null: false, default: 0
      t.datetime :completed_at
      t.references :project, null: false, foreign_key: true

      t.timestamps
    end

    add_index :milestones, [ :project_id, :position ]
  end
end
