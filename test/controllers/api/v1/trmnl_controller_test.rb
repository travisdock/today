require "test_helper"

class Api::V1::TrmnlControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @token, @plaintext_token = ApiToken.generate_for(user: @user, name: "Test Token", scopes: "read")
    @auth_header = { "Authorization" => "Bearer #{@plaintext_token}" }
  end

  test "returns unauthorized without token" do
    get api_v1_trmnl_dashboard_url
    assert_response :unauthorized
  end

  test "returns dashboard with todos grouped by priority window" do
    get api_v1_trmnl_dashboard_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)

    assert json.key?("todos")
    assert json.key?("counts")
    assert json.key?("generated_at")

    assert json["todos"].key?("today")
    assert json["todos"].key?("tomorrow")

    assert_kind_of Integer, json["counts"]["today"]
    assert_kind_of Integer, json["counts"]["tomorrow"]
  end

  test "returns today todos for current user" do
    get api_v1_trmnl_dashboard_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    today_titles = json["todos"]["today"].map { |t| t["title"] }

    assert_includes today_titles, "Review pull requests"
    assert_includes today_titles, "Write project update"
    refute_includes today_titles, "Their task"
  end

  test "returns tomorrow todos for current user" do
    get api_v1_trmnl_dashboard_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    tomorrow_titles = json["todos"]["tomorrow"].map { |t| t["title"] }

    assert_includes tomorrow_titles, "Team meeting prep"
    assert_includes tomorrow_titles, "Update documentation"
  end

  test "excludes completed todos" do
    get api_v1_trmnl_dashboard_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    all_titles = json["todos"]["today"].map { |t| t["title"] } +
                 json["todos"]["tomorrow"].map { |t| t["title"] }

    refute_includes all_titles, "Review notes"
  end

  test "includes milestone and project for linked todos" do
    milestone = milestones(:one)
    todo = todos(:today_one)
    todo.update!(milestone: milestone)

    get api_v1_trmnl_dashboard_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    linked_todo = json["todos"]["today"].find { |t| t["title"] == "Review pull requests" }

    assert_equal "Research Phase", linked_todo["milestone"]
    assert_equal "My Project", linked_todo["project"]
  end

  test "returns null for milestone and project when not linked" do
    get api_v1_trmnl_dashboard_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    unlinked_todo = json["todos"]["today"].find { |t| t["title"] == "Write project update" }

    assert_nil unlinked_todo["milestone"]
    assert_nil unlinked_todo["project"]
  end

  test "returns correct counts" do
    get api_v1_trmnl_dashboard_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)

    assert_equal 2, json["counts"]["today"]
    assert_equal 2, json["counts"]["tomorrow"]
  end

  test "orders todos by position" do
    get api_v1_trmnl_dashboard_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    today_titles = json["todos"]["today"].map { |t| t["title"] }

    assert_equal "Review pull requests", today_titles.first
    assert_equal "Write project update", today_titles.last
  end

  test "includes completed_today section" do
    get api_v1_trmnl_dashboard_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)

    assert json["todos"].key?("completed_today")
    assert json["counts"].key?("completed_today")
    assert_kind_of Integer, json["counts"]["completed_today"]
  end

  test "returns todos completed today" do
    todo = todos(:today_one)
    todo.update!(completed_at: Time.current)

    get api_v1_trmnl_dashboard_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    completed_titles = json["todos"]["completed_today"].map { |t| t["title"] }

    assert_includes completed_titles, "Review pull requests"
    assert_equal 1, json["counts"]["completed_today"]
  end

  test "excludes todos completed before today" do
    get api_v1_trmnl_dashboard_url, headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    completed_titles = json["todos"]["completed_today"].map { |t| t["title"] }

    refute_includes completed_titles, "Review notes"
  end
end
