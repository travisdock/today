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

ActiveRecord::Schema[8.1].define(version: 2025_12_31_212540) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "journal_entries", force: :cascade do |t|
    t.text "content"
    t.datetime "created_at", null: false
    t.integer "project_id", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id", "created_at"], name: "index_journal_entries_on_project_id_and_created_at", order: { created_at: :desc }
    t.index ["project_id"], name: "index_journal_entries_on_project_id"
  end

  create_table "milestones", force: :cascade do |t|
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", limit: 255, null: false
    t.integer "position", default: 0, null: false
    t.integer "project_id", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id", "position"], name: "index_milestones_on_project_id_and_position"
    t.index ["project_id"], name: "index_milestones_on_project_id"
  end

  create_table "projects", force: :cascade do |t|
    t.datetime "archived_at"
    t.datetime "badge_generated_at"
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "journal_entries_count", default: 0, null: false
    t.string "name", null: false
    t.integer "position", default: 0
    t.integer "resources_count", default: 0, null: false
    t.string "section", default: "next_year", null: false
    t.integer "thoughts_count", default: 0, null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id", "archived_at", "created_at"], name: "index_projects_on_user_active_created"
    t.index ["user_id", "section"], name: "index_projects_on_user_section"
    t.index ["user_id"], name: "index_projects_on_user_id"
    t.check_constraint "section IN ('this_month', 'next_month', 'this_year', 'next_year')", name: "section_check"
  end

  create_table "resources", force: :cascade do |t|
    t.text "content"
    t.datetime "created_at", null: false
    t.integer "project_id", null: false
    t.datetime "updated_at", null: false
    t.string "url"
    t.index ["project_id", "created_at"], name: "index_resources_on_project_id_and_created_at", order: { created_at: :desc }
    t.index ["project_id"], name: "index_resources_on_project_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "thoughts", force: :cascade do |t|
    t.text "content"
    t.datetime "created_at", null: false
    t.integer "project_id", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id", "created_at"], name: "index_thoughts_on_project_id_and_created_at", order: { created_at: :desc }
    t.index ["project_id"], name: "index_thoughts_on_project_id"
  end

  create_table "todos", force: :cascade do |t|
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.integer "milestone_id"
    t.integer "position", default: 0, null: false
    t.string "priority_window", default: "today", null: false
    t.string "title", limit: 255, null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["milestone_id"], name: "index_todos_on_milestone_id"
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

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "journal_entries", "projects", on_delete: :cascade
  add_foreign_key "milestones", "projects"
  add_foreign_key "projects", "users"
  add_foreign_key "resources", "projects", on_delete: :cascade
  add_foreign_key "sessions", "users"
  add_foreign_key "thoughts", "projects", on_delete: :cascade
  add_foreign_key "todos", "milestones"
  add_foreign_key "todos", "users", on_delete: :cascade
end
