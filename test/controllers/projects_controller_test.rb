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

  # Reorder tests

  test "reorder returns 200 on valid reorder" do
    user = users(:one)
    user.projects.destroy_all

    project1 = user.projects.create!(name: "First", section: :active, position: 1)
    project2 = user.projects.create!(name: "Second", section: :active, position: 2)

    patch reorder_projects_url, params: {
      order: [ project2.id, project1.id ],
      section: "active"
    }

    assert_response :ok
  end

  test "reorder updates positions correctly" do
    user = users(:one)
    user.projects.destroy_all

    project1 = user.projects.create!(name: "First", section: :active, position: 1)
    project2 = user.projects.create!(name: "Second", section: :active, position: 2)
    project3 = user.projects.create!(name: "Third", section: :active, position: 3)

    patch reorder_projects_url, params: {
      order: [ project3.id, project1.id, project2.id ],
      section: "active"
    }

    assert_response :ok
    assert_equal 1, project3.reload.position
    assert_equal 2, project1.reload.position
    assert_equal 3, project2.reload.position
  end

  test "reorder returns 422 when order is empty" do
    patch reorder_projects_url, params: {
      order: [],
      section: "active"
    }

    assert_response :unprocessable_entity
  end

  test "reorder returns 422 when order is missing" do
    patch reorder_projects_url, params: {
      section: "active"
    }

    assert_response :unprocessable_entity
  end

  test "reorder returns 422 when section is blank" do
    user = users(:one)
    user.projects.destroy_all
    project = user.projects.create!(name: "Project", section: :active, position: 1)

    patch reorder_projects_url, params: {
      order: [ project.id ],
      section: ""
    }

    assert_response :unprocessable_entity
  end

  test "reorder returns 422 when section is missing" do
    user = users(:one)
    user.projects.destroy_all
    project = user.projects.create!(name: "Project", section: :active, position: 1)

    patch reorder_projects_url, params: {
      order: [ project.id ]
    }

    assert_response :unprocessable_entity
  end

  test "reorder returns 422 on invalid section" do
    user = users(:one)
    user.projects.destroy_all
    project = user.projects.create!(name: "Project", section: :active, position: 1)

    patch reorder_projects_url, params: {
      order: [ project.id ],
      section: "invalid_section"
    }

    assert_response :unprocessable_entity
  end

  test "reorder returns 422 when ids don't match section" do
    user = users(:one)
    user.projects.destroy_all

    active_project = user.projects.create!(name: "Active", section: :active, position: 1)
    other_project = user.projects.create!(name: "Other", section: :this_month, position: 1)

    patch reorder_projects_url, params: {
      order: [ active_project.id, other_project.id ],
      section: "active"
    }

    assert_response :unprocessable_entity
  end

  test "reorder requires authentication" do
    sign_out

    patch reorder_projects_url, params: {
      order: [ 1, 2 ],
      section: "active"
    }

    assert_redirected_to new_session_url
  end

  test "reorder does not affect other users projects" do
    user = users(:one)
    other_user = users(:two)
    user.projects.destroy_all
    other_user.projects.destroy_all

    project1 = user.projects.create!(name: "User1 First", section: :active, position: 1)
    project2 = user.projects.create!(name: "User1 Second", section: :active, position: 2)
    other_project = other_user.projects.create!(name: "User2 Project", section: :active, position: 1)

    patch reorder_projects_url, params: {
      order: [ project2.id, project1.id ],
      section: "active"
    }

    assert_response :ok
    assert_equal 1, other_project.reload.position  # Unchanged
  end

  test "reorder does not affect other sections" do
    user = users(:one)
    user.projects.destroy_all

    active1 = user.projects.create!(name: "Active 1", section: :active, position: 1)
    active2 = user.projects.create!(name: "Active 2", section: :active, position: 2)
    this_month = user.projects.create!(name: "This Month", section: :this_month, position: 1)

    patch reorder_projects_url, params: {
      order: [ active2.id, active1.id ],
      section: "active"
    }

    assert_response :ok
    assert_equal 1, active2.reload.position
    assert_equal 2, active1.reload.position
    assert_equal 1, this_month.reload.position  # Unchanged
  end

  test "reorder cannot reorder other users projects" do
    other_user = users(:two)
    other_user.projects.destroy_all
    other_project = other_user.projects.create!(name: "Their Project", section: :active, position: 1)

    patch reorder_projects_url, params: {
      order: [ other_project.id ],
      section: "active"
    }

    assert_response :unprocessable_entity
    assert_equal 1, other_project.reload.position  # Unchanged
  end
end
