class WeekReviewService
  def initialize(user)
    @user = user
  end

  def completed_todos
    @completed_todos ||= fetch_completed_todos
  end

  def milestones
    @milestones ||= completed_todos
      .filter_map { |todo| todo[:milestone] }
      .uniq { |m| m[:id] }
  end

  def projects
    @projects ||= completed_todos
      .filter_map { |todo| todo[:project] }
      .uniq { |p| p[:id] }
  end

  def summary
    {
      week_start: week_start.iso8601,
      week_end: week_end.iso8601,
      total_completed: completed_todos.count
    }
  end

  private

  def fetch_completed_todos
    @user.todos
      .includes(milestone: :project)
      .where(completed_at: week_range)
      .order(completed_at: :desc)
      .map { |todo| format_todo(todo) }
  end

  def week_range
    week_start..week_end
  end

  def week_start
    Time.current.beginning_of_week
  end

  def week_end
    Time.current.end_of_week
  end

  def format_todo(todo)
    {
      id: todo.id,
      title: todo.title,
      completed_at: todo.completed_at.iso8601,
      milestone: format_milestone(todo.milestone),
      project: format_project(todo.milestone&.project)
    }
  end

  def format_milestone(milestone)
    return nil unless milestone

    {
      id: milestone.id,
      name: milestone.name
    }
  end

  def format_project(project)
    return nil unless project

    {
      id: project.id,
      name: project.name
    }
  end
end
