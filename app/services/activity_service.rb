class ActivityService
  class InvalidPeriodError < StandardError; end
  class InvalidDateRangeError < StandardError; end

  MAX_RANGE_DAYS = 366

  PERIODS = {
    "this_week" => -> { Time.current.beginning_of_week..Time.current.end_of_week },
    "last_week" => -> { 1.week.ago.beginning_of_week..1.week.ago.end_of_week },
    "this_month" => -> { Time.current.beginning_of_month..Time.current.end_of_month },
    "last_month" => -> { 1.month.ago.beginning_of_month..1.month.ago.end_of_month },
    "this_quarter" => -> { Time.current.beginning_of_quarter..Time.current.end_of_quarter },
    "last_quarter" => -> { 3.months.ago.beginning_of_quarter..3.months.ago.end_of_quarter },
    "this_year" => -> { Time.current.beginning_of_year..Time.current.end_of_year },
    "last_year" => -> { 1.year.ago.beginning_of_year..1.year.ago.end_of_year }
  }.freeze

  ALL_TYPES = %w[todos projects milestones events thoughts resources journal_entries].freeze

  def initialize(user, period: nil, start_date: nil, end_date: nil, include: nil)
    @user = user
    @period_name = determine_period_name(period, start_date, end_date)
    @custom_start = start_date
    @custom_end = end_date
    @include_types = parse_include(include)

    validate_inputs!
  end

  def call
    result = {
      period: period_info,
      summary: summary,
      generated_at: Time.current.iso8601
    }

    result.merge!(activity_data)
    result
  end

  private

  attr_reader :user, :period_name, :custom_start, :custom_end, :include_types

  def determine_period_name(period, start_date, end_date)
    return period if period.present?
    return nil if start_date.present? || end_date.present?
    "this_week"
  end

  def parse_include(include_param)
    return ALL_TYPES if include_param.blank?

    requested = include_param.to_s.split(",").map(&:strip).map(&:downcase)
    requested & ALL_TYPES
  end

  def validate_inputs!
    if period_name.present? && !PERIODS.key?(period_name)
      raise InvalidPeriodError, "Invalid period '#{period_name}'. Valid periods: #{PERIODS.keys.join(', ')}"
    end

    if period_name.nil?
      raise InvalidDateRangeError, "start_date is required for custom date range" if custom_start.blank?
      raise InvalidDateRangeError, "end_date is required for custom date range" if custom_end.blank?

      start_time = parse_date(custom_start)
      end_time = parse_date(custom_end)

      if end_time < start_time
        raise InvalidDateRangeError, "end_date cannot be before start_date"
      end

      if (end_time.to_date - start_time.to_date).to_i > MAX_RANGE_DAYS
        raise InvalidDateRangeError, "Date range cannot exceed #{MAX_RANGE_DAYS} days"
      end
    end
  end

  def date_range
    @date_range ||= if period_name.present?
      PERIODS[period_name].call
    else
      parse_date(custom_start).beginning_of_day..parse_date(custom_end).end_of_day
    end
  end

  def parse_date(date_string)
    Time.zone.parse(date_string.to_s)
  rescue ArgumentError
    raise InvalidDateRangeError, "Invalid date format: #{date_string}"
  end

  def period_info
    {
      name: period_name,
      start_date: date_range.begin.iso8601,
      end_date: date_range.end.iso8601
    }
  end

  def summary
    counts = {}

    if include_types.include?("todos")
      counts[:todos_created] = todos_created.count
      counts[:todos_completed] = todos_completed.count
    end

    if include_types.include?("projects")
      counts[:projects_created] = projects_created.count
      counts[:projects_completed] = projects_completed.count
    end

    if include_types.include?("milestones")
      counts[:milestones_created] = milestones_created.count
      counts[:milestones_completed] = milestones_completed.count
    end

    if include_types.include?("events")
      counts[:events_occurred] = events_occurred.count
    end

    if include_types.include?("thoughts")
      counts[:thoughts_created] = thoughts_created.count
    end

    if include_types.include?("resources")
      counts[:resources_created] = resources_created.count
    end

    if include_types.include?("journal_entries")
      counts[:journal_entries_created] = journal_entries_created.count
    end

    counts
  end

  def activity_data
    data = {}

    if include_types.include?("todos")
      data[:todos] = {
        created: todos_created.map { |t| format_todo(t) },
        completed: todos_completed.map { |t| format_todo(t) }
      }
    end

    if include_types.include?("projects")
      data[:projects] = {
        created: projects_created.map { |p| format_project(p) },
        completed: projects_completed.map { |p| format_project(p) }
      }
    end

    if include_types.include?("milestones")
      data[:milestones] = {
        created: milestones_created.map { |m| format_milestone_with_project(m) },
        completed: milestones_completed.map { |m| format_milestone_with_project(m) }
      }
    end

    if include_types.include?("events")
      data[:events] = {
        occurred: events_occurred.map { |e| format_event(e) }
      }
    end

    if include_types.include?("thoughts")
      data[:thoughts] = thoughts_created.map { |t| format_thought(t) }
    end

    if include_types.include?("resources")
      data[:resources] = resources_created.map { |r| format_resource(r) }
    end

    if include_types.include?("journal_entries")
      data[:journal_entries] = journal_entries_created.map { |j| format_journal_entry(j) }
    end

    data
  end

  # Data fetching methods (memoized)
  #
  # Note on archived vs completed projects:
  # - completed_at: Project is finished but still visible in the app
  # - archived_at: Project was "deleted" by user (soft-delete), hidden from all views
  #
  # All queries below exclude archived projects to ensure deleted projects
  # and their related items don't appear in activity summaries.

  def todos_created
    @todos_created ||= user.todos
      .left_joins(milestone: :project)
      .where("projects.archived_at IS NULL OR todos.milestone_id IS NULL")
      .includes(milestone: :project)
      .created_in_range(date_range)
      .order(created_at: :desc)
  end

  def todos_completed
    @todos_completed ||= user.todos
      .left_joins(milestone: :project)
      .where("projects.archived_at IS NULL OR todos.milestone_id IS NULL")
      .includes(milestone: :project)
      .completed_in_range(date_range)
      .order(completed_at: :desc)
  end

  def projects_created
    @projects_created ||= user.projects
      .unarchived
      .created_in_range(date_range)
      .order(created_at: :desc)
  end

  def projects_completed
    @projects_completed ||= user.projects
      .unarchived
      .completed_in_range(date_range)
      .order(completed_at: :desc)
  end

  def milestones_created
    @milestones_created ||= Milestone
      .joins(:project)
      .where(projects: { user_id: user.id, archived_at: nil })
      .includes(:project)
      .created_in_range(date_range)
      .order(created_at: :desc)
  end

  def milestones_completed
    @milestones_completed ||= Milestone
      .joins(:project)
      .where(projects: { user_id: user.id, archived_at: nil })
      .includes(:project)
      .completed_in_range(date_range)
      .order(completed_at: :desc)
  end

  def events_occurred
    @events_occurred ||= user.events
      .left_joins(:project)
      .where("projects.archived_at IS NULL OR events.project_id IS NULL")
      .includes(:project)
      .for_date_range(date_range.begin.to_date, date_range.end.to_date)
  end

  def thoughts_created
    @thoughts_created ||= Thought
      .joins(:project)
      .where(projects: { user_id: user.id, archived_at: nil })
      .includes(:project)
      .created_in_range(date_range)
      .order(created_at: :desc)
  end

  def resources_created
    @resources_created ||= Resource
      .joins(:project)
      .where(projects: { user_id: user.id, archived_at: nil })
      .includes(:project)
      .created_in_range(date_range)
      .order(created_at: :desc)
  end

  def journal_entries_created
    @journal_entries_created ||= JournalEntry
      .joins(:project)
      .where(projects: { user_id: user.id, archived_at: nil })
      .includes(:project)
      .created_in_range(date_range)
      .order(created_at: :desc)
  end

  # Formatting methods

  def format_todo(todo)
    {
      id: todo.id,
      title: todo.title,
      priority_window: todo.priority_window,
      completed: todo.completed?,
      created_at: todo.created_at.iso8601,
      completed_at: todo.completed_at&.iso8601,
      milestone: format_milestone_brief(todo.milestone),
      project: format_project_brief(todo.milestone&.project)
    }
  end

  def format_project(project)
    {
      id: project.id,
      name: project.name,
      description: project.description,
      section: project.section,
      created_at: project.created_at.iso8601,
      completed_at: project.completed_at&.iso8601
    }
  end

  def format_milestone_with_project(milestone)
    {
      id: milestone.id,
      name: milestone.name,
      description: milestone.description,
      position: milestone.position,
      created_at: milestone.created_at.iso8601,
      completed_at: milestone.completed_at&.iso8601,
      project: format_project_brief(milestone.project)
    }
  end

  def format_event(event)
    {
      id: event.id,
      title: event.title,
      description: event.description,
      starts_at: event.starts_at.iso8601,
      ends_at: event.ends_at.iso8601,
      all_day: event.all_day,
      event_type: event.event_type,
      project: format_project_brief(event.project)
    }
  end

  def format_thought(thought)
    {
      id: thought.id,
      content: thought.content,
      created_at: thought.created_at.iso8601,
      project: format_project_brief(thought.project)
    }
  end

  def format_resource(resource)
    {
      id: resource.id,
      url: resource.url,
      content: resource.content,
      created_at: resource.created_at.iso8601,
      project: format_project_brief(resource.project)
    }
  end

  def format_journal_entry(journal_entry)
    {
      id: journal_entry.id,
      content: journal_entry.content,
      created_at: journal_entry.created_at.iso8601,
      project: format_project_brief(journal_entry.project)
    }
  end

  def format_milestone_brief(milestone)
    return nil unless milestone

    {
      id: milestone.id,
      name: milestone.name
    }
  end

  def format_project_brief(project)
    return nil unless project

    {
      id: project.id,
      name: project.name
    }
  end
end
