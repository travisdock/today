require "test_helper"

class TodoTest < ActiveSupport::TestCase
  test "requires a title" do
    todo = Todo.new(user: users(:one), title: "")
    assert_not todo.valid?
    assert_includes todo.errors[:title], "can't be blank"
  end

  test "handles nil title gracefully" do
    todo = Todo.new(user: users(:one), title: nil)
    assert_not todo.valid?
    assert_includes todo.errors[:title], "can't be blank"
  end

  test "rejects whitespace only titles" do
    todo = Todo.new(user: users(:one), title: "   ")
    assert_not todo.valid?
    assert_includes todo.errors[:title], "can't be blank"
  end

  test "strips surrounding whitespace from title" do
    todo = Todo.create!(user: users(:one), title: "  Walk dog  ")
    assert_equal "Walk dog", todo.title
  end

  test "active scope returns non-completed todos in priority window order" do
    Todo.delete_all
    first = Todo.create!(user: users(:one), title: "First", priority_window: "today")
    second = Todo.create!(user: users(:one), title: "Second", priority_window: "today")
    Todo.create!(user: users(:one), title: "Completed", priority_window: "today", completed_at: Time.current)

    assert_equal [ first, second ], Todo.active.to_a
  end

  test "assigns position sequentially for active todos" do
    user = users(:one)
    priority_window = "today"
    existing_max = user.todos.where(priority_window: priority_window, completed_at: nil).maximum(:position).to_i

    todo = user.todos.create!(title: "Sequence test", priority_window: priority_window)

    assert_equal existing_max + 1, todo.position
  end

  test "active scope orders by priority window and position" do
    Todo.delete_all
    user = users(:one)
    todo_a = user.todos.create!(title: "A", priority_window: "today", position: 2)
    todo_b = user.todos.create!(title: "B", priority_window: "today", position: 1)

    assert_equal [ todo_b, todo_a ], user.todos.active.to_a
  end

  test "allows milestone from user's own project" do
    user = users(:one)
    project = user.projects.create!(name: "Test Project")
    milestone = project.milestones.create!(name: "Test Milestone")

    todo = user.todos.build(title: "Test", priority_window: "today", milestone: milestone)
    assert todo.valid?
  end

  test "rejects milestone from another user's project" do
    user_one = users(:one)
    user_two = users(:two)
    other_project = user_two.projects.create!(name: "Other Project")
    other_milestone = other_project.milestones.create!(name: "Other Milestone")

    todo = user_one.todos.build(title: "Test", priority_window: "today", milestone: other_milestone)
    assert_not todo.valid?
    assert_includes todo.errors[:milestone], "must belong to one of your projects"
  end

  test "allows todo without milestone" do
    user = users(:one)
    todo = user.todos.build(title: "Test", priority_window: "today", milestone: nil)
    assert todo.valid?
  end
end
