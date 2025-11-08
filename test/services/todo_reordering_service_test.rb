require "test_helper"

class TodoReorderingServiceTest < ActiveSupport::TestCase
  def setup
    @user = users(:one)
    # Clean up fixture todos to avoid position conflicts
    @user.todos.destroy_all
    @service = TodoReorderingService.new(@user)
  end

  test "reorders todos within a window" do
    todo1 = @user.todos.create!(title: "First", priority_window: :today, position: 1)
    todo2 = @user.todos.create!(title: "Second", priority_window: :today, position: 2)
    todo3 = @user.todos.create!(title: "Third", priority_window: :today, position: 3)

    # Reverse the order
    @service.reorder!(
      ordered_ids: [todo3.id, todo2.id, todo1.id],
      priority_window: :today
    )

    assert_equal 1, todo3.reload.position
    assert_equal 2, todo2.reload.position
    assert_equal 3, todo1.reload.position
  end

  test "accepts priority_window as string or symbol" do
    todo1 = @user.todos.create!(title: "First", priority_window: :today, position: 1)
    todo2 = @user.todos.create!(title: "Second", priority_window: :today, position: 2)

    # Test with string
    @service.reorder!(
      ordered_ids: [todo2.id, todo1.id],
      priority_window: "today"
    )

    assert_equal 1, todo2.reload.position
    assert_equal 2, todo1.reload.position

    # Test with symbol
    @service.reorder!(
      ordered_ids: [todo1.id, todo2.id],
      priority_window: :today
    )

    assert_equal 1, todo1.reload.position
    assert_equal 2, todo2.reload.position
  end

  test "raises error if priority window is invalid" do
    todo = @user.todos.create!(title: "Task", priority_window: :today)

    error = assert_raises(TodoReorderingService::InvalidWindowError) do
      @service.reorder!(
        ordered_ids: [todo.id],
        priority_window: :invalid_window
      )
    end

    assert_match(/Invalid priority window/, error.message)
    assert_match(/invalid_window/, error.message)
  end

  test "raises error if ordered_ids is empty" do
    error = assert_raises(TodoReorderingService::InvalidIdsError) do
      @service.reorder!(
        ordered_ids: [],
        priority_window: :today
      )
    end

    assert_match(/cannot be empty/, error.message)
  end

  test "raises error if ordered_ids contains non-integers" do
    error = assert_raises(TodoReorderingService::InvalidIdsError) do
      @service.reorder!(
        ordered_ids: [1, "2", 3],
        priority_window: :today
      )
    end

    assert_match(/must contain only positive integers/, error.message)
  end

  test "raises error if ordered_ids contains zero or negative numbers" do
    error = assert_raises(TodoReorderingService::InvalidIdsError) do
      @service.reorder!(
        ordered_ids: [1, 0, -1],
        priority_window: :today
      )
    end

    assert_match(/must contain only positive integers/, error.message)
  end

  test "raises error if ordered_ids contains duplicates" do
    error = assert_raises(TodoReorderingService::InvalidIdsError) do
      @service.reorder!(
        ordered_ids: [1, 2, 2, 3],
        priority_window: :today
      )
    end

    assert_match(/contains duplicates/, error.message)
  end

  test "raises error if ordered_ids doesn't include all window todos" do
    todo1 = @user.todos.create!(title: "First", priority_window: :today, position: 1)
    todo2 = @user.todos.create!(title: "Second", priority_window: :today, position: 2)
    todo3 = @user.todos.create!(title: "Third", priority_window: :today, position: 3)

    # Only include 2 of 3 todos
    error = assert_raises(TodoReorderingService::PartialReorderError) do
      @service.reorder!(
        ordered_ids: [todo1.id, todo2.id],
        priority_window: :today
      )
    end

    assert_match(/must include all todos in window/, error.message)
    assert_match(/Missing IDs: #{todo3.id}/, error.message)
  end

  test "raises error if ordered_ids includes todos from different window" do
    today_todo = @user.todos.create!(title: "Today", priority_window: :today, position: 1)
    tomorrow_todo = @user.todos.create!(title: "Tomorrow", priority_window: :tomorrow, position: 1)

    error = assert_raises(TodoReorderingService::PartialReorderError) do
      @service.reorder!(
        ordered_ids: [today_todo.id, tomorrow_todo.id],
        priority_window: :today
      )
    end

    assert_match(/must include all todos in window/, error.message)
    assert_match(/Extra IDs: #{tomorrow_todo.id}/, error.message)
  end

  test "raises error if todo doesn't belong to user" do
    other_user = users(:two)
    other_user.todos.destroy_all  # Clean up other user's fixtures too
    other_todo = other_user.todos.create!(title: "Other", priority_window: :today, position: 1)

    # The service validates that ordered_ids match the window's todos,
    # so it will raise PartialReorderError (not RecordNotFound) because
    # the other user's todo won't be in the current user's window
    error = assert_raises(TodoReorderingService::PartialReorderError) do
      @service.reorder!(
        ordered_ids: [other_todo.id],
        priority_window: :today
      )
    end

    assert_match(/Extra IDs: #{other_todo.id}/, error.message)
  end

  test "doesn't affect todos in other windows" do
    today1 = @user.todos.create!(title: "Today 1", priority_window: :today, position: 1)
    today2 = @user.todos.create!(title: "Today 2", priority_window: :today, position: 2)
    tomorrow1 = @user.todos.create!(title: "Tomorrow 1", priority_window: :tomorrow, position: 1)

    @service.reorder!(
      ordered_ids: [today2.id, today1.id],
      priority_window: :today
    )

    assert_equal 1, today2.reload.position
    assert_equal 2, today1.reload.position
    assert_equal 1, tomorrow1.reload.position  # Unchanged
  end

  test "doesn't affect other users' todos" do
    other_user = users(:two)
    other_user.todos.destroy_all  # Clean up fixtures
    @user.todos.create!(title: "User 1 Todo", priority_window: :today, position: 1)
    other_todo = other_user.todos.create!(title: "User 2 Todo", priority_window: :today, position: 1)

    @service.reorder!(
      ordered_ids: [@user.todos.first.id],
      priority_window: :today
    )

    assert_equal 1, other_todo.reload.position  # Unchanged
  end

  test "doesn't affect completed todos" do
    active1 = @user.todos.create!(title: "Active 1", priority_window: :today, position: 1)
    active2 = @user.todos.create!(title: "Active 2", priority_window: :today, position: 2)
    completed = @user.todos.create!(title: "Completed", priority_window: :today, position: 3, completed_at: 1.day.ago)

    @service.reorder!(
      ordered_ids: [active2.id, active1.id],
      priority_window: :today
    )

    assert_equal 1, active2.reload.position
    assert_equal 2, active1.reload.position
    assert_equal 3, completed.reload.position  # Unchanged
  end

  test "current_order returns todos in correct order" do
    todo3 = @user.todos.create!(title: "Third", priority_window: :today, position: 3)
    todo1 = @user.todos.create!(title: "First", priority_window: :today, position: 1)
    todo2 = @user.todos.create!(title: "Second", priority_window: :today, position: 2)

    ordered = @service.current_order(priority_window: :today)

    assert_equal [todo1.id, todo2.id, todo3.id], ordered.pluck(:id)
  end

  test "current_order validates priority window" do
    error = assert_raises(TodoReorderingService::InvalidWindowError) do
      @service.current_order(priority_window: :invalid)
    end

    assert_match(/Invalid priority window/, error.message)
  end

  test "handles reordering large lists efficiently" do
    # Create 50 todos
    todos = 50.times.map do |i|
      @user.todos.create!(title: "Todo #{i}", priority_window: :today, position: i + 1)
    end

    # Reverse the entire list
    reversed_ids = todos.map(&:id).reverse

    @service.reorder!(
      ordered_ids: reversed_ids,
      priority_window: :today
    )

    # Verify all positions are correct
    todos.each_with_index do |todo, index|
      expected_position = 50 - index
      assert_equal expected_position, todo.reload.position
    end
  end

  test "updates updated_at timestamp" do
    todo1 = @user.todos.create!(title: "First", priority_window: :today, position: 1)
    todo2 = @user.todos.create!(title: "Second", priority_window: :today, position: 2)

    original_updated_at = todo1.updated_at

    # Wait a tiny bit to ensure timestamp changes
    sleep 0.01

    @service.reorder!(
      ordered_ids: [todo2.id, todo1.id],
      priority_window: :today
    )

    assert todo1.reload.updated_at > original_updated_at
  end

  test "is atomic - rolls back on error" do
    todo1 = @user.todos.create!(title: "First", priority_window: :today, position: 1)
    todo2 = @user.todos.create!(title: "Second", priority_window: :today, position: 2)

    # Try to reorder with invalid ID (should fail validation and not change positions)
    # The service validates IDs first, so it raises PartialReorderError
    assert_raises(TodoReorderingService::PartialReorderError) do
      @service.reorder!(
        ordered_ids: [todo1.id, 99999],
        priority_window: :today
      )
    end

    # Verify positions unchanged (validation happened before any updates)
    assert_equal 1, todo1.reload.position
    assert_equal 2, todo2.reload.position
  end

  test "works with all priority windows" do
    Todo::PRIORITY_WINDOWS.each do |window|
      todo1 = @user.todos.create!(title: "First", priority_window: window, position: 1)
      todo2 = @user.todos.create!(title: "Second", priority_window: window, position: 2)

      @service.reorder!(
        ordered_ids: [todo2.id, todo1.id],
        priority_window: window
      )

      assert_equal 1, todo2.reload.position
      assert_equal 2, todo1.reload.position

      # Clean up for next iteration
      @user.todos.destroy_all
    end
  end
end
