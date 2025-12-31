require "test_helper"

class MilestoneTodosControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in_as(users(:one))
    @project = projects(:one)
    @milestone = milestones(:one)
  end

  test "requires authentication" do
    sign_out

    post project_milestone_todos_url(@project, @milestone), params: { todo: { title: "Test", priority_window: "today" } }
    assert_redirected_to new_session_url
  end

  test "creates todo for milestone" do
    assert_difference -> { @milestone.todos.count }, 1 do
      post project_milestone_todos_url(@project, @milestone), params: { todo: { title: "New Todo", priority_window: "today" } }
    end

    assert_redirected_to project_milestone_url(@project, @milestone)
    todo = Todo.order(:created_at).last
    assert_equal @milestone, todo.milestone
    assert_equal "New Todo", todo.title
  end

  test "does not create todo without title" do
    assert_no_difference -> { Todo.count } do
      post project_milestone_todos_url(@project, @milestone), params: { todo: { title: "", priority_window: "today" } }
    end

    assert_redirected_to project_milestone_url(@project, @milestone)
    assert_equal "Could not add todo.", flash[:alert]
  end

  test "prevents creating todos on other users milestone" do
    other_project = projects(:other_user)
    other_milestone = milestones(:other_project)

    assert_no_difference -> { Todo.count } do
      post project_milestone_todos_url(other_project, other_milestone), params: { todo: { title: "Sneaky", priority_window: "today" } }
    end

    assert_response :not_found
  end

  test "responds with turbo stream on success" do
    post project_milestone_todos_url(@project, @milestone),
         params: { todo: { title: "Turbo Todo", priority_window: "today" } },
         as: :turbo_stream

    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="flash">)
    assert_includes response.body, %(<turbo-stream action="replace" target="milestone_todo_form">)
    assert_includes response.body, %(<turbo-stream action="replace" target="milestone_todos_list">)
  end

  test "responds with turbo stream on failure" do
    post project_milestone_todos_url(@project, @milestone),
         params: { todo: { title: "", priority_window: "today" } },
         as: :turbo_stream

    assert_response :unprocessable_entity
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="milestone_todo_form">)
  end

  test "todo belongs to current user" do
    post project_milestone_todos_url(@project, @milestone), params: { todo: { title: "My Todo", priority_window: "today" } }

    todo = Todo.order(:created_at).last
    assert_equal users(:one), todo.user
  end
end
