require "test_helper"

class ActivityServiceTest < ActiveSupport::TestCase
  def setup
    @user = users(:one)
  end

  test "defaults to this_week period" do
    service = ActivityService.new(@user)
    result = service.call

    assert_equal "this_week", result[:period][:name]
    assert_includes result[:period][:start_date], Time.current.beginning_of_week.strftime("%Y-%m-%d")
  end

  test "accepts named period parameter" do
    service = ActivityService.new(@user, period: "last_month")
    result = service.call

    assert_equal "last_month", result[:period][:name]
  end

  test "accepts custom date range" do
    service = ActivityService.new(@user, start_date: "2025-06-01", end_date: "2025-06-30")
    result = service.call

    assert_nil result[:period][:name]
    assert_includes result[:period][:start_date], "2025-06-01"
    assert_includes result[:period][:end_date], "2025-06-30"
  end

  test "raises error for invalid period" do
    error = assert_raises(ActivityService::InvalidPeriodError) do
      ActivityService.new(@user, period: "invalid_period")
    end

    assert_match(/Invalid period/, error.message)
    assert_includes error.message, "invalid_period"
  end

  test "raises error for date range exceeding max days" do
    error = assert_raises(ActivityService::InvalidDateRangeError) do
      ActivityService.new(@user, start_date: "2024-01-01", end_date: "2026-01-01")
    end

    assert_match(/cannot exceed/, error.message)
  end

  test "raises error when start_date provided without end_date" do
    error = assert_raises(ActivityService::InvalidDateRangeError) do
      ActivityService.new(@user, start_date: "2025-01-01")
    end

    assert_match(/end_date is required/, error.message)
  end

  test "raises error when end_date provided without start_date" do
    error = assert_raises(ActivityService::InvalidDateRangeError) do
      ActivityService.new(@user, end_date: "2025-01-31")
    end

    assert_match(/start_date is required/, error.message)
  end

  test "returns todos created in range" do
    # Create a todo within this week
    todo = @user.todos.create!(
      title: "New test todo",
      priority_window: :today,
      position: 100
    )

    service = ActivityService.new(@user)
    result = service.call

    created_titles = result[:todos][:created].map { |t| t[:title] }
    assert_includes created_titles, "New test todo"
  end

  test "returns todos completed in range" do
    todo = todos(:today_one)
    todo.update!(completed_at: Time.current)

    service = ActivityService.new(@user)
    result = service.call

    completed_titles = result[:todos][:completed].map { |t| t[:title] }
    assert_includes completed_titles, "Review pull requests"
  end

  test "excludes todos outside date range" do
    service = ActivityService.new(@user, period: "this_week")
    result = service.call

    # The fixture "completed" todo has completed_at in October 2025
    completed_titles = result[:todos][:completed].map { |t| t[:title] }
    refute_includes completed_titles, "Review notes"
  end

  test "includes milestone and project for todos" do
    milestone = milestones(:one)
    todo = todos(:today_one)
    todo.update!(milestone: milestone, completed_at: Time.current)

    service = ActivityService.new(@user)
    result = service.call

    completed_todo = result[:todos][:completed].find { |t| t[:title] == "Review pull requests" }

    assert_not_nil completed_todo[:milestone]
    assert_equal "Research Phase", completed_todo[:milestone][:name]
    assert_not_nil completed_todo[:project]
    assert_equal "My Project", completed_todo[:project][:name]
  end

  test "returns projects created in range" do
    project = @user.projects.create!(
      name: "New test project",
      section: :this_month
    )

    service = ActivityService.new(@user)
    result = service.call

    created_names = result[:projects][:created].map { |p| p[:name] }
    assert_includes created_names, "New test project"
  end

  test "returns projects completed in range" do
    project = projects(:one)
    project.update!(completed_at: Time.current)

    service = ActivityService.new(@user)
    result = service.call

    completed_names = result[:projects][:completed].map { |p| p[:name] }
    assert_includes completed_names, "My Project"
  end

  test "returns milestones created in range" do
    project = projects(:one)
    milestone = project.milestones.create!(
      name: "New test milestone"
    )

    service = ActivityService.new(@user)
    result = service.call

    created_names = result[:milestones][:created].map { |m| m[:name] }
    assert_includes created_names, "New test milestone"
  end

  test "returns milestones completed in range" do
    milestone = milestones(:one)
    milestone.update!(completed_at: Time.current)

    service = ActivityService.new(@user)
    result = service.call

    completed_names = result[:milestones][:completed].map { |m| m[:name] }
    assert_includes completed_names, "Research Phase"
  end

  test "milestone includes project cross-reference" do
    milestone = milestones(:one)
    milestone.update!(completed_at: Time.current)

    service = ActivityService.new(@user)
    result = service.call

    completed_milestone = result[:milestones][:completed].find { |m| m[:name] == "Research Phase" }

    assert_not_nil completed_milestone[:project]
    assert_equal "My Project", completed_milestone[:project][:name]
  end

  test "returns thoughts created in range" do
    project = projects(:one)
    thought = project.thoughts.create!(content: "Test thought")

    service = ActivityService.new(@user)
    result = service.call

    thought_contents = result[:thoughts].map { |t| t[:content] }
    assert_includes thought_contents, "Test thought"
  end

  test "thought includes project cross-reference" do
    project = projects(:one)
    thought = project.thoughts.create!(content: "Test thought")

    service = ActivityService.new(@user)
    result = service.call

    returned_thought = result[:thoughts].find { |t| t[:content] == "Test thought" }

    assert_not_nil returned_thought[:project]
    assert_equal "My Project", returned_thought[:project][:name]
  end

  test "returns resources created in range" do
    project = projects(:one)
    resource = project.resources.create!(url: "https://example.com")

    service = ActivityService.new(@user)
    result = service.call

    resource_urls = result[:resources].map { |r| r[:url] }
    assert_includes resource_urls, "https://example.com"
  end

  test "returns journal entries created in range" do
    project = projects(:one)
    entry = project.journal_entries.create!(content: "Test journal entry")

    service = ActivityService.new(@user)
    result = service.call

    entry_contents = result[:journal_entries].map { |j| j[:content] }
    assert_includes entry_contents, "Test journal entry"
  end

  test "filters by include parameter" do
    service = ActivityService.new(@user, include: "todos,projects")
    result = service.call

    assert result.key?(:todos)
    assert result.key?(:projects)
    refute result.key?(:milestones)
    refute result.key?(:events)
    refute result.key?(:thoughts)
    refute result.key?(:resources)
    refute result.key?(:journal_entries)
  end

  test "summary counts match actual data" do
    todo = todos(:today_one)
    todo.update!(completed_at: Time.current)

    service = ActivityService.new(@user)
    result = service.call

    assert_equal result[:todos][:completed].count, result[:summary][:todos_completed]
    assert_equal result[:todos][:created].count, result[:summary][:todos_created]
  end

  test "summary only includes requested types" do
    service = ActivityService.new(@user, include: "todos")
    result = service.call

    assert result[:summary].key?(:todos_created)
    assert result[:summary].key?(:todos_completed)
    refute result[:summary].key?(:projects_created)
    refute result[:summary].key?(:milestones_created)
  end

  test "excludes other users data" do
    other_user = users(:two)
    other_todo = other_user.todos.create!(
      title: "Other user todo",
      priority_window: :today,
      completed_at: Time.current
    )

    service = ActivityService.new(@user)
    result = service.call

    completed_titles = result[:todos][:completed].map { |t| t[:title] }
    refute_includes completed_titles, "Other user todo"
  end

  test "all named periods produce valid date ranges" do
    periods = %w[this_week last_week this_month last_month this_quarter last_quarter this_year last_year]

    periods.each do |period|
      service = ActivityService.new(@user, period: period)
      result = service.call

      assert_equal period, result[:period][:name], "Period #{period} should have correct name"
      assert result[:period][:start_date].present?, "Period #{period} should have start_date"
      assert result[:period][:end_date].present?, "Period #{period} should have end_date"

      start_time = Time.parse(result[:period][:start_date])
      end_time = Time.parse(result[:period][:end_date])
      assert start_time < end_time, "Period #{period} start should be before end"
    end
  end

  test "returns generated_at timestamp" do
    service = ActivityService.new(@user)
    result = service.call

    assert result.key?(:generated_at)
    assert_nothing_raised { Time.parse(result[:generated_at]) }
  end
end
