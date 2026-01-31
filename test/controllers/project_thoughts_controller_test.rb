require "test_helper"

class ProjectThoughtsControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in_as(users(:one))
    @project = projects(:one)
  end

  test "requires authentication" do
    sign_out

    post project_thoughts_url(@project), params: { thought: { content: "Test" } }
    assert_redirected_to new_session_url
  end

  test "creates thought for project" do
    assert_difference -> { @project.thoughts.count }, 1 do
      post project_thoughts_url(@project), params: { thought: { content: "A new thought" } }
    end

    assert_redirected_to project_url(@project)
  end

  test "does not create thought without content or image" do
    assert_no_difference -> { @project.thoughts.count } do
      post project_thoughts_url(@project), params: { thought: { content: "" } }
    end

    assert_redirected_to project_url(@project)
    assert_equal "Could not add thought.", flash[:alert]
  end

  test "creates thought with image only" do
    image = fixture_file_upload("test_image.jpg", "image/jpeg")

    assert_difference -> { @project.thoughts.count }, 1 do
      post project_thoughts_url(@project), params: { thought: { content: "", image: image } }
    end

    assert_redirected_to project_url(@project)
    assert @project.thoughts.last.image.attached?
  end

  test "creates thought with both content and image" do
    image = fixture_file_upload("test_image.jpg", "image/jpeg")

    assert_difference -> { @project.thoughts.count }, 1 do
      post project_thoughts_url(@project), params: { thought: { content: "With image", image: image } }
    end

    thought = @project.thoughts.last
    assert_equal "With image", thought.content
    assert thought.image.attached?
  end

  test "prevents creating thoughts on other users projects" do
    other_project = projects(:other_user)

    assert_no_difference -> { Thought.count } do
      post project_thoughts_url(other_project), params: { thought: { content: "Sneaky" } }
    end

    assert_response :not_found
  end

  test "prevents mass assignment of project_id" do
    other_project = projects(:other_user)

    post project_thoughts_url(@project), params: {
      thought: {
        content: "Test thought",
        project_id: other_project.id
      }
    }

    thought = Thought.order(:created_at).last
    assert_equal @project, thought.project
  end

  test "responds with turbo stream on success" do
    post project_thoughts_url(@project), params: { thought: { content: "Turbo thought" } }, as: :turbo_stream

    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="flash">)
    assert_includes response.body, %(<turbo-stream action="replace" target="thought_form">)
    assert_includes response.body, %(<turbo-stream action="replace" target="thoughts_list">)
  end

  test "responds with turbo stream on failure" do
    post project_thoughts_url(@project), params: { thought: { content: "" } }, as: :turbo_stream

    assert_response :unprocessable_entity
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="thought_form">)
  end

  test "destroys thought" do
    thought = thoughts(:one)

    assert_difference -> { @project.thoughts.count }, -1 do
      delete project_thought_url(@project, thought)
    end

    assert_redirected_to project_url(@project)
    assert_equal "Thought deleted.", flash[:notice]
  end

  test "destroys thought with turbo stream" do
    thought = thoughts(:one)

    assert_difference -> { @project.thoughts.count }, -1 do
      delete project_thought_url(@project, thought), as: :turbo_stream
    end

    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="flash">)
    assert_includes response.body, %(<turbo-stream action="replace" target="thoughts_list">)
  end

  test "prevents deleting thoughts on other users projects" do
    other_thought = thoughts(:other_user)

    assert_no_difference -> { Thought.count } do
      delete project_thought_url(projects(:other_user), other_thought)
    end

    assert_response :not_found
  end
end
