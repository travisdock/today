class CreateEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :events do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.references :project, null: true, foreign_key: { on_delete: :nullify }
      t.string :title, null: false, limit: 255
      t.text :description
      t.string :location, limit: 500
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false
      t.boolean :all_day, null: false, default: false
      t.string :event_type, null: false, default: "personal"
      t.string :uid, null: false, limit: 255
      t.timestamps
    end

    add_index :events, [ :user_id, :starts_at ]
    add_index :events, [ :user_id, :event_type ]
    add_index :events, [ :user_id, :uid ], unique: true
  end
end
