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
end
