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
    second = Todo.create!(user: users(:one), title: "Second", archived_at: nil)
    Todo.create!(user: users(:one), title: "Archived", archived_at: Time.current)

    assert_equal [ first, second ], Todo.active.to_a
  end
end
