# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

user = User.find_or_create_by!(email_address: "travis@test.com") do |u|
  u.password = "password"
  u.streaming_voice_enabled = true
end

project = user.projects.find_or_create_by!(name: "Sample Project") do |p|
  p.description = "A sample project for testing"
end

project.thoughts.find_or_create_by!(content: "First thought on this project")
