require "test_helper"

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in_as(users(:one))
    @project = projects(:one)
  end

  test "toggle_complete marks project as complete" do
    assert_nil @project.completed_at

    patch toggle_complete_project_url(@project)

    assert_redirected_to projects_url
    assert_equal "Project completed.", flash[:notice]
    assert_not_nil @project.reload.completed_at
  end

  test "toggle_complete marks completed project as active" do
    @project.complete!
    assert_not_nil @project.completed_at

    patch toggle_complete_project_url(@project)

    assert_redirected_to projects_url
    assert_equal "Project marked as active.", flash[:notice]
    assert_nil @project.reload.completed_at
  end

  test "toggle_complete requires authentication" do
    sign_out

    patch toggle_complete_project_url(@project)
    assert_redirected_to new_session_url
  end

  test "cannot toggle_complete other users project" do
    other_project = projects(:other_user)

    patch toggle_complete_project_url(other_project)
    assert_response :not_found
  end

  test "responds with turbo stream on toggle_complete" do
    patch toggle_complete_project_url(@project), as: :turbo_stream

    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="flash">)
    assert_includes response.body, %(<turbo-stream action="replace" target="project_lists">)
    assert_includes response.body, %(<turbo-stream action="replace" target="completed_projects_list">)
  end

  test "turbo stream toggle_complete sets completed_at" do
    assert_nil @project.completed_at

    patch toggle_complete_project_url(@project), as: :turbo_stream

    assert_response :success
    assert_not_nil @project.reload.completed_at
  end

  test "turbo stream toggle_complete clears completed_at when already complete" do
    @project.complete!
    assert_not_nil @project.completed_at

    patch toggle_complete_project_url(@project), as: :turbo_stream

    assert_response :success
    assert_nil @project.reload.completed_at
  end
end
