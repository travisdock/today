require "test_helper"

class ProjectMilestonesControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in_as(users(:one))
    @project = projects(:one)
    @milestone = milestones(:one)
  end

  test "requires authentication" do
    sign_out

    post project_milestones_url(@project), params: { milestone: { name: "Test" } }
    assert_redirected_to new_session_url
  end

  test "creates milestone for project" do
    assert_difference -> { @project.milestones.count }, 1 do
      post project_milestones_url(@project), params: { milestone: { name: "New Milestone" } }
    end

    assert_redirected_to project_url(@project)
  end

  test "does not create milestone without name" do
    assert_no_difference -> { @project.milestones.count } do
      post project_milestones_url(@project), params: { milestone: { name: "" } }
    end

    assert_redirected_to project_url(@project)
    assert_equal "Could not add milestone.", flash[:alert]
  end

  test "creates milestone with description" do
    assert_difference -> { @project.milestones.count }, 1 do
      post project_milestones_url(@project), params: { milestone: { name: "Test", description: "A description" } }
    end

    milestone = @project.milestones.order(:created_at).last
    assert_equal "Test", milestone.name
    assert_equal "A description", milestone.description
  end

  test "prevents creating milestones on other users projects" do
    other_project = projects(:other_user)

    assert_no_difference -> { Milestone.count } do
      post project_milestones_url(other_project), params: { milestone: { name: "Sneaky" } }
    end

    assert_response :not_found
  end

  test "updates milestone" do
    patch project_milestone_url(@project, @milestone), params: { milestone: { name: "Updated Name" } }

    assert_redirected_to project_url(@project)
    assert_equal "Updated Name", @milestone.reload.name
  end

  test "deletes milestone" do
    assert_difference -> { @project.milestones.count }, -1 do
      delete project_milestone_url(@project, @milestone)
    end

    assert_redirected_to project_url(@project)
  end

  test "toggle_complete marks milestone as complete" do
    assert_nil @milestone.completed_at

    patch toggle_complete_project_milestone_url(@project, @milestone)

    assert_redirected_to project_url(@project)
    assert_not_nil @milestone.reload.completed_at
  end

  test "toggle_complete marks milestone as active" do
    @milestone.complete!
    assert_not_nil @milestone.completed_at

    patch toggle_complete_project_milestone_url(@project, @milestone)

    assert_redirected_to project_url(@project)
    assert_nil @milestone.reload.completed_at
  end

  test "responds with turbo stream on create success" do
    post project_milestones_url(@project), params: { milestone: { name: "Turbo Milestone" } }, as: :turbo_stream

    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="flash">)
    assert_includes response.body, %(<turbo-stream action="replace" target="milestone_form">)
    assert_includes response.body, %(<turbo-stream action="replace" target="milestones_list">)
  end

  test "responds with turbo stream on create failure" do
    post project_milestones_url(@project), params: { milestone: { name: "" } }, as: :turbo_stream

    assert_response :unprocessable_entity
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="milestone_form">)
  end

  test "responds with turbo stream on toggle complete" do
    patch toggle_complete_project_milestone_url(@project, @milestone), as: :turbo_stream

    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="milestones_list">)
    assert_includes response.body, %(<turbo-stream action="replace" target="completed_milestones_list">)
  end

  test "assigns position automatically" do
    post project_milestones_url(@project), params: { milestone: { name: "First" } }
    first = @project.milestones.order(:created_at).last

    post project_milestones_url(@project), params: { milestone: { name: "Second" } }
    second = @project.milestones.order(:created_at).last

    assert second.position > first.position
  end

  test "show displays milestone with todos" do
    get project_milestone_url(@project, @milestone)

    assert_response :success
    assert_select "h1", text: @milestone.name
  end

  test "show requires authentication" do
    sign_out

    get project_milestone_url(@project, @milestone)
    assert_redirected_to new_session_url
  end

  test "cannot view other users milestone" do
    other_milestone = milestones(:other_project)

    get project_milestone_url(projects(:other_user), other_milestone)
    assert_response :not_found
  end
end
