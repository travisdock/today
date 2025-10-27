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

  test "active scope returns non-archived todos in creation order" do
    Todo.delete_all
    first = Todo.create!(user: users(:one), title: "First")
    second = Todo.create!(user: users(:one), title: "Second")
    Todo.create!(user: users(:one), title: "Archived", archived_at: Time.current)

    assert_equal [ first, second ], Todo.active.to_a
  end

  test "assigns position sequentially for active todos" do
    user = users(:one)
    existing_max = user.todos.active.maximum(:position).to_i

    todo = user.todos.create!(title: "Sequence test")

    assert_equal existing_max + 1, todo.position
  end

  test "active scope orders by position" do
    Todo.delete_all
    user = users(:one)
    todo_a = user.todos.create!(title: "A")
    todo_b = user.todos.create!(title: "B")

    todo_a.update!(position: todo_b.position + 1)

    assert_equal [ todo_b, todo_a ], user.todos.active.to_a
  end
end
