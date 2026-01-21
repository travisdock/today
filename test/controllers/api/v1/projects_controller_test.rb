require "test_helper"

class Api::V1::ProjectsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @project = projects(:one)
    @token, @plaintext_token = ApiToken.generate_for(user: @user, name: "Test Token", scopes: "read_write")
    @auth_header = { "Authorization" => "Bearer #{@plaintext_token}" }
  end

  test "toggle_complete returns unauthorized without token" do
    patch toggle_complete_api_v1_project_url(@project)
    assert_response :unauthorized
  end

  test "toggle_complete returns forbidden without write scope" do
    _token, plaintext_token = ApiToken.generate_for(user: @user, name: "Read Only Token", scopes: "read")
    read_only_header = { "Authorization" => "Bearer #{plaintext_token}" }

    patch toggle_complete_api_v1_project_url(@project), headers: read_only_header
    assert_response :forbidden

    json = JSON.parse(response.body)
    assert_equal "Insufficient scope. Required: write", json["error"]
  end

  test "toggle_complete marks project as complete" do
    assert_nil @project.completed_at

    patch toggle_complete_api_v1_project_url(@project), headers: @auth_header
    assert_response :success

    @project.reload
    assert_not_nil @project.completed_at
  end

  test "toggle_complete marks completed project as active" do
    @project.complete!
    assert_not_nil @project.completed_at

    patch toggle_complete_api_v1_project_url(@project), headers: @auth_header
    assert_response :success

    @project.reload
    assert_nil @project.completed_at
  end

  test "toggle_complete returns project JSON with completed_at when completing" do
    patch toggle_complete_api_v1_project_url(@project), headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    assert json.key?("project")
    assert_not_nil json["project"]["completed_at"]
    assert_equal @project.reload.completed_at.iso8601, json["project"]["completed_at"]
  end

  test "toggle_complete returns project JSON with null completed_at when uncompleting" do
    @project.complete!

    patch toggle_complete_api_v1_project_url(@project), headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    assert json.key?("project")
    assert_nil json["project"]["completed_at"]
  end

  test "toggle_complete returns full project JSON structure" do
    patch toggle_complete_api_v1_project_url(@project), headers: @auth_header
    assert_response :success

    json = JSON.parse(response.body)
    project_json = json["project"]

    assert_equal @project.id, project_json["id"]
    assert_equal @project.name, project_json["name"]
    assert_equal @project.description, project_json["description"]
    assert_equal @project.section, project_json["section"]
    assert project_json.key?("completed_at")
    assert project_json.key?("thoughts_count")
    assert project_json.key?("resources_count")
    assert project_json.key?("journal_entries_count")
    assert project_json.key?("created_at")
    assert project_json.key?("updated_at")
  end

  test "toggle_complete returns not found for other users project" do
    other_project = projects(:other_user)

    patch toggle_complete_api_v1_project_url(other_project), headers: @auth_header
    assert_response :not_found
  end
end
