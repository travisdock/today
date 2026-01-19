require "test_helper"

class Api::V1::TodosWeekReviewTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @token, @plaintext_token = ApiToken.generate_for(user: @user, name: "Test Token", scopes: "read")
    @auth_header = { "Authorization" => "Bearer #{@plaintext_token}" }
  end

  test "returns unauthorized without token" do
    get week_review_api_v1_todos_url
    assert_response :unauthorized
  end

  test "returns forbidden without read scope" do
    _token, plaintext_token = ApiToken.generate_for(user: @user, name: "Write Only Token", scopes: "write")
    write_only_header = { "Authorization" => "Bearer #{plaintext_token}" }

    get week_review_api_v1_todos_url, headers: write_only_header
    assert_response :forbidden

    json = JSON.parse(response.body)
    assert_equal "Insufficient scope. Required: read", json["error"]
  end

  test "returns week review with expected structure" do
    get week_review_api_v1_todos_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)

    assert json.key?("todos")
    assert json.key?("milestones")
    assert json.key?("projects")
    assert json.key?("summary")
    assert json.key?("generated_at")

    assert_kind_of Array, json["todos"]
    assert_kind_of Array, json["milestones"]
    assert_kind_of Array, json["projects"]
    assert_kind_of Hash, json["summary"]
  end

  test "summary contains expected fields" do
    get week_review_api_v1_todos_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    summary = json["summary"]

    assert summary.key?("week_start")
    assert summary.key?("week_end")
    assert summary.key?("total_completed")
    assert_kind_of Integer, summary["total_completed"]
  end

  test "returns todos completed this week" do
    todo = todos(:today_one)
    todo.update!(completed_at: Time.current)

    get week_review_api_v1_todos_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    todo_titles = json["todos"].map { |t| t["title"] }

    assert_includes todo_titles, "Review pull requests"
  end

  test "excludes todos completed before this week" do
    get week_review_api_v1_todos_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    todo_titles = json["todos"].map { |t| t["title"] }

    refute_includes todo_titles, "Review notes"
    refute_includes todo_titles, "Old reminder"
  end

  test "excludes other users todos" do
    other_todo = todos(:other_user)
    other_todo.update!(completed_at: Time.current)

    get week_review_api_v1_todos_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    todo_titles = json["todos"].map { |t| t["title"] }

    refute_includes todo_titles, "Their task"
  end

  test "includes milestone and project for linked todos" do
    milestone = milestones(:one)
    todo = todos(:today_one)
    todo.update!(milestone: milestone, completed_at: Time.current)

    get week_review_api_v1_todos_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    linked_todo = json["todos"].find { |t| t["title"] == "Review pull requests" }

    assert_not_nil linked_todo["milestone"]
    assert_equal "Research Phase", linked_todo["milestone"]["name"]
    assert_not_nil linked_todo["project"]
    assert_equal "My Project", linked_todo["project"]["name"]
  end

  test "returns null for milestone and project when not linked" do
    todo = todos(:today_one)
    todo.update!(completed_at: Time.current, milestone: nil)

    get week_review_api_v1_todos_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    unlinked_todo = json["todos"].find { |t| t["title"] == "Review pull requests" }

    assert_nil unlinked_todo["milestone"]
    assert_nil unlinked_todo["project"]
  end

  test "milestones list contains unique milestones from completed todos" do
    milestone = milestones(:one)
    todo1 = todos(:today_one)
    todo2 = todos(:today_two)
    todo1.update!(milestone: milestone, completed_at: Time.current)
    todo2.update!(milestone: milestone, completed_at: Time.current)

    get week_review_api_v1_todos_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    milestone_names = json["milestones"].map { |m| m["name"] }

    assert_includes milestone_names, "Research Phase"
    assert_equal 1, milestone_names.count("Research Phase")
  end

  test "projects list contains unique projects from completed todos" do
    milestone = milestones(:one)
    todo1 = todos(:today_one)
    todo2 = todos(:today_two)
    todo1.update!(milestone: milestone, completed_at: Time.current)
    todo2.update!(milestone: milestone, completed_at: Time.current)

    get week_review_api_v1_todos_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    project_names = json["projects"].map { |p| p["name"] }

    assert_includes project_names, "My Project"
    assert_equal 1, project_names.count("My Project")
  end

  test "orders todos by completed_at descending" do
    todo1 = todos(:today_one)
    todo2 = todos(:today_two)
    todo1.update!(completed_at: 1.hour.ago)
    todo2.update!(completed_at: Time.current)

    get week_review_api_v1_todos_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    titles = json["todos"].map { |t| t["title"] }

    assert_equal "Write project update", titles.first
    assert_equal "Review pull requests", titles.second
  end

  test "todo contains expected fields" do
    todo = todos(:today_one)
    todo.update!(completed_at: Time.current)

    get week_review_api_v1_todos_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    returned_todo = json["todos"].first

    assert returned_todo.key?("id")
    assert returned_todo.key?("title")
    assert returned_todo.key?("completed_at")
    assert returned_todo.key?("milestone")
    assert returned_todo.key?("project")
  end
end
