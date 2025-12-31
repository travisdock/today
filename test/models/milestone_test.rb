require "test_helper"

class MilestoneTest < ActiveSupport::TestCase
  setup do
    @project = projects(:one)
    @milestone = milestones(:one)
  end

  test "valid with name and project" do
    milestone = Milestone.new(name: "Test", project: @project)
    assert milestone.valid?
  end

  test "invalid without name" do
    milestone = Milestone.new(project: @project)
    assert_not milestone.valid?
    assert_includes milestone.errors[:name], "can't be blank"
  end

  test "invalid without project" do
    milestone = Milestone.new(name: "Test")
    assert_not milestone.valid?
    assert_includes milestone.errors[:project], "must exist"
  end

  test "name cannot exceed 255 characters" do
    milestone = Milestone.new(name: "a" * 256, project: @project)
    assert_not milestone.valid?
    assert_includes milestone.errors[:name], "is too long (maximum is 255 characters)"
  end

  test "completed? returns false when completed_at is nil" do
    @milestone.completed_at = nil
    assert_not @milestone.completed?
  end

  test "completed? returns true when completed_at is set" do
    @milestone.completed_at = Time.current
    assert @milestone.completed?
  end

  test "complete! sets completed_at" do
    assert_nil @milestone.completed_at
    @milestone.complete!
    assert_not_nil @milestone.completed_at
  end

  test "uncomplete! clears completed_at" do
    @milestone.complete!
    assert_not_nil @milestone.completed_at
    @milestone.uncomplete!
    assert_nil @milestone.completed_at
  end

  test "active scope returns only uncompleted milestones" do
    active = @project.milestones.active
    assert active.all? { |m| m.completed_at.nil? }
  end

  test "completed scope returns only completed milestones" do
    completed = @project.milestones.completed
    assert completed.all? { |m| m.completed_at.present? }
  end

  test "assigns position on create" do
    milestone = @project.milestones.create!(name: "New Milestone")
    assert milestone.position > 0
  end

  test "deleting milestone nullifies todos" do
    todo = Todo.create!(
      title: "Test Todo",
      user: users(:one),
      milestone: @milestone,
      priority_window: :today
    )

    assert_equal @milestone, todo.milestone

    @milestone.destroy

    assert_nil todo.reload.milestone_id
  end

  test "with_active_todos_count preloads count via subquery" do
    # Create some todos for the milestone
    user = users(:one)
    Todo.create!(title: "Active 1", user: user, milestone: @milestone, priority_window: :today)
    Todo.create!(title: "Active 2", user: user, milestone: @milestone, priority_window: :today)
    Todo.create!(title: "Completed", user: user, milestone: @milestone, priority_window: :today, completed_at: Time.current)

    milestone = @project.milestones.with_active_todos_count.find(@milestone.id)

    # Should have the preloaded count attribute
    assert_equal 2, milestone.active_todos_count
  end

  test "active_todos_count returns preloaded value without additional query" do
    user = users(:one)
    Todo.create!(title: "Active", user: user, milestone: @milestone, priority_window: :today)

    milestone = @project.milestones.with_active_todos_count.find(@milestone.id)

    # Access count - should not trigger additional query
    query_count = count_queries { milestone.active_todos_count }
    assert_equal 0, query_count
    assert_equal 1, milestone.active_todos_count
  end

  test "active_todos_count falls back to query when not preloaded" do
    user = users(:one)
    Todo.create!(title: "Active", user: user, milestone: @milestone, priority_window: :today)

    # Load without the scope
    milestone = @project.milestones.find(@milestone.id)

    # Should still return correct count (via query)
    assert_equal 1, milestone.active_todos_count
  end

  test "active_todos method returns active todos ordered correctly" do
    user = users(:one)
    todo1 = Todo.create!(title: "Tomorrow", user: user, milestone: @milestone, priority_window: :tomorrow)
    todo2 = Todo.create!(title: "Today", user: user, milestone: @milestone, priority_window: :today)
    Todo.create!(title: "Completed", user: user, milestone: @milestone, priority_window: :today, completed_at: Time.current)

    active = @milestone.active_todos

    assert_equal 2, active.count
    assert_equal todo2, active.first  # today comes before tomorrow
    assert_equal todo1, active.second
  end

  test "recent_completed_todos returns completed todos ordered by completion date" do
    user = users(:one)
    Todo.create!(title: "Active", user: user, milestone: @milestone, priority_window: :today)
    old = Todo.create!(title: "Old", user: user, milestone: @milestone, priority_window: :today, completed_at: 2.days.ago)
    recent = Todo.create!(title: "Recent", user: user, milestone: @milestone, priority_window: :today, completed_at: 1.day.ago)

    completed = @milestone.recent_completed_todos

    assert_equal 2, completed.count
    assert_equal recent, completed.first  # most recent first
    assert_equal old, completed.second
  end

  private

  def count_queries(&block)
    count = 0
    counter = ->(_name, _start, _finish, _id, payload) {
      count += 1 unless payload[:name] == "SCHEMA"
    }
    ActiveSupport::Notifications.subscribed(counter, "sql.active_record", &block)
    count
  end
end
