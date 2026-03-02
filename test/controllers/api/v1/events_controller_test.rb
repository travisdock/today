require "test_helper"

class Api::V1::EventsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @token, @plaintext_token = ApiToken.generate_for(user: @user, name: "Test Token", scopes: "read_write")
    @auth_header = { "Authorization" => "Bearer #{@plaintext_token}" }
  end

  test "index returns unauthorized without token" do
    get api_v1_events_url(start_date: Date.today, end_date: Date.today)
    assert_response :unauthorized
  end

  test "index returns forbidden without read scope" do
    _token, plaintext_token = ApiToken.generate_for(user: @user, name: "Write Only Token", scopes: "write")
    write_only_header = { "Authorization" => "Bearer #{plaintext_token}" }

    get api_v1_events_url(start_date: Date.today, end_date: Date.today), headers: write_only_header
    assert_response :forbidden
  end

  test "index requires start_date and end_date" do
    get api_v1_events_url, headers: @auth_header
    assert_response :bad_request

    json = JSON.parse(response.body)
    assert_match(/start_date.*end_date/, json["error"])
  end

  test "index requires both dates present" do
    get api_v1_events_url(start_date: Date.today.iso8601), headers: @auth_header
    assert_response :bad_request
  end

  test "index rejects end_date before start_date" do
    get api_v1_events_url(start_date: Date.today.iso8601, end_date: 1.day.ago.to_date.iso8601), headers: @auth_header
    assert_response :bad_request

    json = JSON.parse(response.body)
    assert_equal "end_date must be on or after start_date", json["error"]
  end

  test "index rejects date range exceeding 366 days" do
    get api_v1_events_url(start_date: Date.today.iso8601, end_date: (Date.today + 367).iso8601), headers: @auth_header
    assert_response :bad_request

    json = JSON.parse(response.body)
    assert_match(/366/, json["error"])
  end

  test "index returns events within date range" do
    start_date = Date.today
    end_date = 7.days.from_now.to_date

    get api_v1_events_url(start_date: start_date.iso8601, end_date: end_date.iso8601), headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    assert json.key?("events")
    assert_kind_of Array, json["events"]

    # Should include future events within range belonging to user :one
    titles = json["events"].map { |e| e["title"] }
    assert_includes titles, "Team standup"
    assert_not_includes titles, "Their event" # other user's event
  end

  test "index returns correct event fields" do
    start_date = Date.today
    end_date = 7.days.from_now.to_date

    get api_v1_events_url(start_date: start_date.iso8601, end_date: end_date.iso8601), headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    event = json["events"].find { |e| e["title"] == "Team standup" }
    assert_not_nil event

    assert event.key?("id")
    assert event.key?("title")
    assert event.key?("description")
    assert event.key?("location")
    assert event.key?("starts_at")
    assert event.key?("ends_at")
    assert event.key?("all_day")
    assert event.key?("event_type")
    assert event.key?("project_id")
    assert event.key?("created_at")
    assert event.key?("updated_at")
  end

  test "index excludes events outside date range" do
    # Query only past dates - should not include future events
    start_date = 10.days.ago.to_date
    end_date = 4.days.ago.to_date

    get api_v1_events_url(start_date: start_date.iso8601, end_date: end_date.iso8601), headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    titles = json["events"].map { |e| e["title"] }
    assert_includes titles, "Past meeting"
    assert_not_includes titles, "Team standup"
  end

  test "index returns events ordered by starts_at" do
    start_date = Date.today
    end_date = 10.days.from_now.to_date

    get api_v1_events_url(start_date: start_date.iso8601, end_date: end_date.iso8601), headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    starts = json["events"].map { |e| Time.parse(e["starts_at"]) }
    assert_equal starts, starts.sort
  end
end
