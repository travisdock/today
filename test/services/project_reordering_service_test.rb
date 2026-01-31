require "test_helper"

class ProjectReorderingServiceTest < ActiveSupport::TestCase
  def setup
    @user = users(:one)
    # Clean up fixture projects to avoid position conflicts
    @user.projects.destroy_all
    @service = ProjectReorderingService.new(@user)
  end

  test "reorders projects within a section" do
    project1 = @user.projects.create!(name: "First", section: :active, position: 1)
    project2 = @user.projects.create!(name: "Second", section: :active, position: 2)
    project3 = @user.projects.create!(name: "Third", section: :active, position: 3)

    # Reverse the order
    @service.reorder!(
      ordered_ids: [ project3.id, project2.id, project1.id ],
      section: :active
    )

    assert_equal 1, project3.reload.position
    assert_equal 2, project2.reload.position
    assert_equal 3, project1.reload.position
  end

  test "accepts section as string or symbol" do
    project1 = @user.projects.create!(name: "First", section: :active, position: 1)
    project2 = @user.projects.create!(name: "Second", section: :active, position: 2)

    # Test with string
    @service.reorder!(
      ordered_ids: [ project2.id, project1.id ],
      section: "active"
    )

    assert_equal 1, project2.reload.position
    assert_equal 2, project1.reload.position

    # Test with symbol
    @service.reorder!(
      ordered_ids: [ project1.id, project2.id ],
      section: :active
    )

    assert_equal 1, project1.reload.position
    assert_equal 2, project2.reload.position
  end

  test "raises error if section is invalid" do
    project = @user.projects.create!(name: "Project", section: :active)

    error = assert_raises(ProjectReorderingService::InvalidSectionError) do
      @service.reorder!(
        ordered_ids: [ project.id ],
        section: :invalid_section
      )
    end

    assert_match(/Invalid section/, error.message)
    assert_match(/invalid_section/, error.message)
  end

  test "raises error if ordered_ids is empty" do
    error = assert_raises(ProjectReorderingService::InvalidIdsError) do
      @service.reorder!(
        ordered_ids: [],
        section: :active
      )
    end

    assert_match(/cannot be empty/, error.message)
  end

  test "raises error if ordered_ids contains non-integers" do
    error = assert_raises(ProjectReorderingService::InvalidIdsError) do
      @service.reorder!(
        ordered_ids: [ 1, "2", 3 ],
        section: :active
      )
    end

    assert_match(/must contain only positive integers/, error.message)
  end

  test "raises error if ordered_ids contains zero or negative numbers" do
    error = assert_raises(ProjectReorderingService::InvalidIdsError) do
      @service.reorder!(
        ordered_ids: [ 1, 0, -1 ],
        section: :active
      )
    end

    assert_match(/must contain only positive integers/, error.message)
  end

  test "raises error if ordered_ids contains duplicates" do
    error = assert_raises(ProjectReorderingService::InvalidIdsError) do
      @service.reorder!(
        ordered_ids: [ 1, 2, 2, 3 ],
        section: :active
      )
    end

    assert_match(/contains duplicates/, error.message)
  end

  test "raises error if ordered_ids doesn't include all section projects" do
    project1 = @user.projects.create!(name: "First", section: :active, position: 1)
    project2 = @user.projects.create!(name: "Second", section: :active, position: 2)
    project3 = @user.projects.create!(name: "Third", section: :active, position: 3)

    # Only include 2 of 3 projects
    error = assert_raises(ProjectReorderingService::PartialReorderError) do
      @service.reorder!(
        ordered_ids: [ project1.id, project2.id ],
        section: :active
      )
    end

    assert_match(/must include all projects in section/, error.message)
    assert_match(/Missing IDs: #{project3.id}/, error.message)
  end

  test "raises error if ordered_ids includes projects from different section" do
    active_project = @user.projects.create!(name: "Active", section: :active, position: 1)
    this_month_project = @user.projects.create!(name: "This Month", section: :this_month, position: 1)

    error = assert_raises(ProjectReorderingService::PartialReorderError) do
      @service.reorder!(
        ordered_ids: [ active_project.id, this_month_project.id ],
        section: :active
      )
    end

    assert_match(/must include all projects in section/, error.message)
    assert_match(/Extra IDs: #{this_month_project.id}/, error.message)
  end

  test "raises error if project doesn't belong to user" do
    other_user = users(:two)
    other_user.projects.destroy_all
    other_project = other_user.projects.create!(name: "Other", section: :active, position: 1)

    # The service validates that ordered_ids match the section's projects,
    # so it will raise PartialReorderError because the other user's project
    # won't be in the current user's section
    error = assert_raises(ProjectReorderingService::PartialReorderError) do
      @service.reorder!(
        ordered_ids: [ other_project.id ],
        section: :active
      )
    end

    assert_match(/Extra IDs: #{other_project.id}/, error.message)
  end

  test "doesn't affect projects in other sections" do
    active1 = @user.projects.create!(name: "Active 1", section: :active, position: 1)
    active2 = @user.projects.create!(name: "Active 2", section: :active, position: 2)
    this_month1 = @user.projects.create!(name: "This Month 1", section: :this_month, position: 1)

    @service.reorder!(
      ordered_ids: [ active2.id, active1.id ],
      section: :active
    )

    assert_equal 1, active2.reload.position
    assert_equal 2, active1.reload.position
    assert_equal 1, this_month1.reload.position  # Unchanged
  end

  test "doesn't affect other users' projects" do
    other_user = users(:two)
    other_user.projects.destroy_all
    @user.projects.create!(name: "User 1 Project", section: :active, position: 1)
    other_project = other_user.projects.create!(name: "User 2 Project", section: :active, position: 1)

    @service.reorder!(
      ordered_ids: [ @user.projects.first.id ],
      section: :active
    )

    assert_equal 1, other_project.reload.position  # Unchanged
  end

  test "doesn't affect completed projects" do
    active1 = @user.projects.create!(name: "Active 1", section: :active, position: 1)
    active2 = @user.projects.create!(name: "Active 2", section: :active, position: 2)
    completed = @user.projects.create!(name: "Completed", section: :active, position: 3, completed_at: 1.day.ago)

    @service.reorder!(
      ordered_ids: [ active2.id, active1.id ],
      section: :active
    )

    assert_equal 1, active2.reload.position
    assert_equal 2, active1.reload.position
    assert_equal 3, completed.reload.position  # Unchanged
  end

  test "doesn't affect archived projects" do
    active1 = @user.projects.create!(name: "Active 1", section: :active, position: 1)
    active2 = @user.projects.create!(name: "Active 2", section: :active, position: 2)
    archived = @user.projects.create!(name: "Archived", section: :active, position: 3, archived_at: 1.day.ago)

    @service.reorder!(
      ordered_ids: [ active2.id, active1.id ],
      section: :active
    )

    assert_equal 1, active2.reload.position
    assert_equal 2, active1.reload.position
    assert_equal 3, archived.reload.position  # Unchanged
  end

  test "handles reordering large lists efficiently" do
    # Create 50 projects
    projects = 50.times.map do |i|
      @user.projects.create!(name: "Project #{i}", section: :active, position: i + 1)
    end

    # Reverse the entire list
    reversed_ids = projects.map(&:id).reverse

    @service.reorder!(
      ordered_ids: reversed_ids,
      section: :active
    )

    # Verify all positions are correct
    projects.each_with_index do |project, index|
      expected_position = 50 - index
      assert_equal expected_position, project.reload.position
    end
  end

  test "updates updated_at timestamp" do
    project1 = @user.projects.create!(name: "First", section: :active, position: 1)
    project2 = @user.projects.create!(name: "Second", section: :active, position: 2)

    original_updated_at = project1.updated_at

    # Wait a tiny bit to ensure timestamp changes
    sleep 0.01

    @service.reorder!(
      ordered_ids: [ project2.id, project1.id ],
      section: :active
    )

    assert project1.reload.updated_at > original_updated_at
  end

  test "is atomic - rolls back on error" do
    project1 = @user.projects.create!(name: "First", section: :active, position: 1)
    project2 = @user.projects.create!(name: "Second", section: :active, position: 2)

    # Try to reorder with invalid ID (should fail validation and not change positions)
    assert_raises(ProjectReorderingService::PartialReorderError) do
      @service.reorder!(
        ordered_ids: [ project1.id, 99999 ],
        section: :active
      )
    end

    # Verify positions unchanged
    assert_equal 1, project1.reload.position
    assert_equal 2, project2.reload.position
  end

  test "works with all project sections" do
    Project::SECTIONS.each do |section|
      project1 = @user.projects.create!(name: "First", section: section, position: 1)
      project2 = @user.projects.create!(name: "Second", section: section, position: 2)

      @service.reorder!(
        ordered_ids: [ project2.id, project1.id ],
        section: section
      )

      assert_equal 1, project2.reload.position
      assert_equal 2, project1.reload.position

      # Clean up for next iteration
      @user.projects.destroy_all
    end
  end
end
