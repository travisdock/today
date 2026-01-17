class TrmnlDashboardService
  def initialize(user)
    @user = user
  end

  def todos
    {
      today: format_todos_for_window("today"),
      tomorrow: format_todos_for_window("tomorrow"),
      completed_today: format_completed_today
    }
  end

  def counts
    {
      today: count_todos("today"),
      tomorrow: count_todos("tomorrow"),
      completed_today: count_completed_today
    }
  end

  private

  def format_todos_for_window(window)
    @user.todos
      .includes(milestone: :project)
      .where(completed_at: nil, priority_window: window)
      .order(:position)
      .map { |todo| format_todo(todo) }
  end

  def count_todos(window)
    @user.todos.where(completed_at: nil, priority_window: window).count
  end

  def format_completed_today
    @user.todos
      .includes(milestone: :project)
      .where(completed_at: Time.current.beginning_of_day..)
      .order(completed_at: :desc)
      .map { |todo| format_todo(todo) }
  end

  def count_completed_today
    @user.todos.where(completed_at: Time.current.beginning_of_day..).count
  end

  def format_todo(todo)
    {
      title: todo.title,
      milestone: todo.milestone&.name,
      project: todo.milestone&.project&.name
    }
  end
end
