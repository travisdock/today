# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_12_18_125341) do
  create_table "projects", force: :cascade do |t|
    t.datetime "archived_at"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.integer "position", default: 0
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "todos", force: :cascade do |t|
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.integer "position", default: 0, null: false
    t.string "priority_window", default: "today", null: false
    t.string "title", limit: 255, null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id", "completed_at"], name: "index_todos_on_user_completed", order: { completed_at: :desc }, where: "completed_at IS NOT NULL"
    t.index ["user_id", "priority_window", "position"], name: "index_todos_active_window_position", unique: true, where: "completed_at IS NULL"
    t.index ["user_id"], name: "index_todos_on_user_id"
    t.check_constraint "priority_window IN ('today', 'tomorrow', 'this_week', 'next_week')", name: "priority_window_check"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.boolean "streaming_voice_enabled", default: false, null: false
    t.datetime "updated_at", null: false
    t.boolean "voice_agent_enabled", default: false, null: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  add_foreign_key "projects", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "todos", "users", on_delete: :cascade
end
