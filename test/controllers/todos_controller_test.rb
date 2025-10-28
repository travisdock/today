require "test_helper"

class TodosControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in_as(users(:one))
  end

  test "requires authentication" do
    sign_out

    get todos_url
    assert_redirected_to new_session_url
  end

  test "shows index" do
    get todos_url
    assert_response :success
    assert_match "Plan tomorrow", response.body
  end

  test "index does not include other users todos" do
    get todos_url
    assert_response :success
    assert_no_match "Their task", response.body
  end

  test "prevents mass assignment of protected attributes" do
    other_user = users(:two)
    freeze_time do
      post todos_url, params: {
        todo: {
          title: "Protect attributes",
          user_id: other_user.id,
          completed_at: Time.current,
          archived_at: Time.current
        }
      }
    end

    todo = Todo.order(:created_at).last
    assert_equal users(:one), todo.user
    assert_nil todo.completed_at
    assert_nil todo.archived_at
  end

  test "reorders active todos" do
    first = todos(:active)
    second = todos(:completed)

    patch reorder_todos_url, params: { order: [ second.id, first.id ] }

    assert_response :success
    assert_equal [ second.id, first.id ], users(:one).todos.active.pluck(:id)
  end

  test "rejects reorder with invalid ids" do
    patch reorder_todos_url, params: { order: [ todos(:active).id, todos(:other_user).id ] }

    assert_response :unprocessable_entity
  end

  test "creates todo for current user" do
    assert_difference -> { Todo.where(user: users(:one)).count }, 1 do
      post todos_url, params: { todo: { title: "Write tests" } }
    end

    assert_redirected_to todos_url
  end

  test "does not create todo with blank title" do
    assert_no_difference -> { Todo.where(user: users(:one)).count } do
      post todos_url, params: { todo: { title: "" } }
    end

    assert_response :unprocessable_entity
    assert_select "li", "Title can't be blank"
  end

  test "toggles completion" do
    todo = todos(:active)

    patch complete_todo_url(todo)
    assert_redirected_to todos_url
    assert todo.reload.completed?

    patch complete_todo_url(todo)
    assert_redirected_to todos_url
    assert_not todo.reload.completed?
  end

  test "toggles archive state" do
    todo = todos(:active)

    patch archive_todo_url(todo)
    assert_redirected_to todos_url
    assert todo.reload.archived?

    patch archive_todo_url(todo)
    assert_redirected_to todos_url
    assert_not todo.reload.archived?
  end

  test "destroys todo" do
    todo = todos(:active)

    assert_difference -> { Todo.where(user: users(:one)).count }, -1 do
      delete todo_url(todo)
    end

    assert_redirected_to todos_url
  end

  test "scopes todos to current user" do
    patch complete_todo_url(todos(:other_user))
    assert_response :not_found
  end

  test "prevents archiving other users todos" do
    patch archive_todo_url(todos(:other_user))
    assert_response :not_found
  end

  test "prevents destroying other users todos" do
    delete todo_url(todos(:other_user))
    assert_response :not_found
  end

  test "complete responds with turbo stream" do
    todo = todos(:active)

    patch complete_todo_url(todo), as: :turbo_stream

    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    dom_id = ActionView::RecordIdentifier.dom_id(todo)
    assert_includes response.body, %(<turbo-stream action="replace" target="flash">)
    assert_includes response.body, %(<turbo-stream action="replace" target="#{dom_id}">)
  end

  test "creates todos from voice input" do
    stubbed_result = VoiceTodoExtractionService::Result.new(
      todos: [
        { title: "Call the dentist" },
        { title: "Order groceries" }
      ]
    )

    VoiceTodoExtractionService.stub(:extract, stubbed_result) do
      assert_difference -> { Todo.where(user: users(:one)).count }, 2 do
        post create_from_voice_todos_url,
          params: { audio: fixture_file_upload("sample.webm", "audio/webm") },
          as: :turbo_stream
      end
    end

    assert_response :success
    assert_includes response.body, "Call the dentist"
    assert_includes response.body, "Order groceries"
  end

  test "handles voice input errors" do
    stubbed_result = VoiceTodoExtractionService::Result.new(error: "No todos found.")

    VoiceTodoExtractionService.stub(:extract, stubbed_result) do
      assert_no_difference -> { Todo.where(user: users(:one)).count } do
        post create_from_voice_todos_url,
          params: { audio: fixture_file_upload("sample.webm", "audio/webm") },
          as: :turbo_stream
      end
    end

    assert_response :unprocessable_entity
    assert_includes response.body, "No todos found."
  end
end
