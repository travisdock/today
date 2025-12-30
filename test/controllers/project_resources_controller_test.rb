require "test_helper"

class ProjectResourcesControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in_as(users(:one))
    @project = projects(:one)
  end

  test "requires authentication" do
    sign_out

    post project_resources_url(@project), params: { resource: { content: "Test" } }
    assert_redirected_to new_session_url
  end

  test "creates resource with content" do
    assert_difference -> { @project.resources.count }, 1 do
      post project_resources_url(@project), params: { resource: { content: "A new resource" } }
    end

    assert_redirected_to project_url(@project)
  end

  test "creates resource with url only" do
    assert_difference -> { @project.resources.count }, 1 do
      post project_resources_url(@project), params: { resource: { url: "https://example.com" } }
    end

    assert_redirected_to project_url(@project)
    assert_equal "https://example.com", @project.resources.last.url
  end

  test "creates resource with both content and url" do
    assert_difference -> { @project.resources.count }, 1 do
      post project_resources_url(@project), params: {
        resource: { content: "Great video", url: "https://youtube.com/watch?v=abc" }
      }
    end

    resource = @project.resources.last
    assert_equal "Great video", resource.content
    assert_equal "https://youtube.com/watch?v=abc", resource.url
  end

  test "does not create resource without content or url" do
    assert_no_difference -> { @project.resources.count } do
      post project_resources_url(@project), params: { resource: { content: "", url: "" } }
    end

    assert_redirected_to project_url(@project)
    assert_equal "Could not add resource.", flash[:alert]
  end

  test "does not create resource with invalid url" do
    assert_no_difference -> { @project.resources.count } do
      post project_resources_url(@project), params: { resource: { url: "javascript:alert(1)" } }
    end

    assert_redirected_to project_url(@project)
  end

  test "prevents creating resources on other users projects" do
    other_project = projects(:other_user)

    assert_no_difference -> { Resource.count } do
      post project_resources_url(other_project), params: { resource: { content: "Sneaky" } }
    end

    assert_response :not_found
  end

  test "prevents mass assignment of project_id" do
    other_project = projects(:other_user)

    post project_resources_url(@project), params: {
      resource: {
        content: "Test resource",
        project_id: other_project.id
      }
    }

    resource = Resource.order(:created_at).last
    assert_equal @project, resource.project
  end

  test "responds with turbo stream on success" do
    post project_resources_url(@project),
         params: { resource: { content: "Turbo resource" } },
         as: :turbo_stream

    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="flash">)
    assert_includes response.body, %(<turbo-stream action="replace" target="resource_form">)
    assert_includes response.body, %(<turbo-stream action="replace" target="resources_list">)
  end

  test "responds with turbo stream on failure" do
    post project_resources_url(@project),
         params: { resource: { content: "", url: "" } },
         as: :turbo_stream

    assert_response :unprocessable_entity
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="resource_form">)
  end
end
