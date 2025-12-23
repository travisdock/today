require "test_helper"

class ThoughtTest < ActiveSupport::TestCase
  test "requires content" do
    thought = Thought.new(project: projects(:one), content: "")
    assert_not thought.valid?
    assert_includes thought.errors[:content], "can't be blank"
  end

  test "requires project" do
    thought = Thought.new(content: "Some thought")
    assert_not thought.valid?
    assert_includes thought.errors[:project], "must exist"
  end

  test "rejects content over 30000 characters" do
    thought = Thought.new(project: projects(:one), content: "a" * 30_001)
    assert_not thought.valid?
    assert_includes thought.errors[:content], "is too long (maximum is 30000 characters)"
  end

  test "accepts content at 30000 characters" do
    thought = Thought.new(project: projects(:one), content: "a" * 30_000)
    assert thought.valid?
  end

  test "last_two returns most recent two thoughts" do
    project = projects(:one)
    project.thoughts.delete_all

    oldest = project.thoughts.create!(content: "Oldest")
    middle = project.thoughts.create!(content: "Middle")
    newest = project.thoughts.create!(content: "Newest")

    result = project.thoughts.last_two
    assert_equal 2, result.count
    assert_equal [ newest, middle ], result.to_a
  end

  test "increments counter cache on create" do
    project = projects(:one)
    initial_count = project.thoughts_count

    project.thoughts.create!(content: "New thought")

    assert_equal initial_count + 1, project.reload.thoughts_count
  end

  test "decrements counter cache on destroy" do
    project = projects(:one)
    thought = project.thoughts.create!(content: "To be deleted")
    count_after_create = project.reload.thoughts_count

    thought.destroy!

    assert_equal count_after_create - 1, project.reload.thoughts_count
  end
end
