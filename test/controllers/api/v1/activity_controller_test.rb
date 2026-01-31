require "test_helper"

class Api::V1::ActivityControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @token, @plaintext_token = ApiToken.generate_for(user: @user, name: "Test Token", scopes: "read")
    @auth_header = { "Authorization" => "Bearer #{@plaintext_token}" }
  end

  test "returns unauthorized without token" do
    get api_v1_activity_url
    assert_response :unauthorized
  end

  test "returns forbidden without read scope" do
    _token, plaintext_token = ApiToken.generate_for(user: @user, name: "Write Only Token", scopes: "write")
    write_only_header = { "Authorization" => "Bearer #{plaintext_token}" }

    get api_v1_activity_url, headers: write_only_header
    assert_response :forbidden

    json = JSON.parse(response.body)
    assert_equal "Insufficient scope. Required: read", json["error"]
  end

  test "returns activity with expected structure" do
    get api_v1_activity_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)

    assert json.key?("period")
    assert json.key?("summary")
    assert json.key?("todos")
    assert json.key?("projects")
    assert json.key?("milestones")
    assert json.key?("events")
    assert json.key?("thoughts")
    assert json.key?("resources")
    assert json.key?("journal_entries")
    assert json.key?("generated_at")
  end

  test "period contains expected fields" do
    get api_v1_activity_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    period = json["period"]

    assert period.key?("name")
    assert period.key?("start_date")
    assert period.key?("end_date")
  end

  test "defaults to this_week period" do
    get api_v1_activity_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal "this_week", json["period"]["name"]
  end

  test "accepts named period parameter" do
    get api_v1_activity_url, params: { period: "last_month" }, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal "last_month", json["period"]["name"]
  end

  test "accepts custom date range" do
    get api_v1_activity_url, params: {
      start_date: "2025-01-01",
      end_date: "2025-01-31"
    }, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    assert_nil json["period"]["name"]
    assert_includes json["period"]["start_date"], "2025-01-01"
    assert_includes json["period"]["end_date"], "2025-01-31"
  end

  test "returns error for invalid period" do
    get api_v1_activity_url, params: { period: "invalid_period" }, headers: @auth_header
    assert_response :bad_request

    json = JSON.parse(response.body)
    assert_match(/Invalid period/, json["error"])
  end

  test "returns error for date range exceeding max days" do
    get api_v1_activity_url, params: {
      start_date: "2024-01-01",
      end_date: "2026-01-01"
    }, headers: @auth_header
    assert_response :bad_request

    json = JSON.parse(response.body)
    assert_match(/cannot exceed/, json["error"])
  end

  test "returns error when start_date provided without end_date" do
    get api_v1_activity_url, params: { start_date: "2025-01-01" }, headers: @auth_header
    assert_response :bad_request

    json = JSON.parse(response.body)
    assert_match(/end_date is required/, json["error"])
  end

  test "filters response with include parameter" do
    get api_v1_activity_url, params: { include: "todos,projects" }, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)

    assert json.key?("todos")
    assert json.key?("projects")
    refute json.key?("milestones")
    refute json.key?("events")
    refute json.key?("thoughts")
    refute json.key?("resources")
    refute json.key?("journal_entries")
  end

  test "summary counts only included types" do
    get api_v1_activity_url, params: { include: "todos" }, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    summary = json["summary"]

    assert summary.key?("todos_created")
    assert summary.key?("todos_completed")
    refute summary.key?("projects_created")
    refute summary.key?("events_occurred")
  end

  test "todos structure includes created and completed" do
    get api_v1_activity_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    todos = json["todos"]

    assert todos.key?("created")
    assert todos.key?("completed")
    assert_kind_of Array, todos["created"]
    assert_kind_of Array, todos["completed"]
  end

  test "completed todos within period are returned" do
    todo = todos(:today_one)
    todo.update!(completed_at: Time.current)

    get api_v1_activity_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    completed_titles = json["todos"]["completed"].map { |t| t["title"] }

    assert_includes completed_titles, "Review pull requests"
  end

  test "todo includes milestone and project cross-references" do
    milestone = milestones(:one)
    todo = todos(:today_one)
    todo.update!(milestone: milestone, completed_at: Time.current)

    get api_v1_activity_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    completed_todo = json["todos"]["completed"].find { |t| t["title"] == "Review pull requests" }

    assert_not_nil completed_todo["milestone"]
    assert_equal "Research Phase", completed_todo["milestone"]["name"]
    assert_not_nil completed_todo["project"]
    assert_equal "My Project", completed_todo["project"]["name"]
  end

  test "excludes other users data" do
    other_todo = todos(:other_user)
    other_todo.update!(completed_at: Time.current)

    get api_v1_activity_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    completed_titles = json["todos"]["completed"].map { |t| t["title"] }

    refute_includes completed_titles, "Their task"
  end

  test "projects structure includes created and completed" do
    get api_v1_activity_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    projects = json["projects"]

    assert projects.key?("created")
    assert projects.key?("completed")
    assert_kind_of Array, projects["created"]
    assert_kind_of Array, projects["completed"]
  end

  test "events structure includes occurred" do
    get api_v1_activity_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    events = json["events"]

    assert events.key?("occurred")
    assert_kind_of Array, events["occurred"]
  end

  test "all period types are valid" do
    %w[this_week last_week this_month last_month this_quarter last_quarter this_year last_year].each do |period|
      get api_v1_activity_url, params: { period: period }, headers: @auth_header
      assert_response :success, "Period '#{period}' should be valid"

      json = JSON.parse(response.body)
      assert_equal period, json["period"]["name"]
    end
  end
end
