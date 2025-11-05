class TodosController < ApplicationController
  before_action :set_todo, only: %i[destroy complete move]

  def index
    @todo = current_user.todos.build(priority_window: :today)  # Default to today
    @active_todos_grouped = current_user.todos.active.group_by(&:priority_window)
    @completed_todos = current_user.todos.completed
  end

  def create
    @todo = current_user.todos.build(todo_params)

    respond_to do |format|
      if @todo.save
        flash.now[:notice] = "Todo added."
        format.turbo_stream do
          fresh_form = current_user.todos.build(priority_window: :today)

          # Get updated todos for the priority window
          priority_window = @todo.priority_window
          window_todos = current_user.todos.active.where(priority_window: priority_window).order(:position)

          streams = [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("todo_form", partial: "todos/form", locals: { todo: fresh_form }),
            turbo_stream.replace("#{priority_window}_list_container",
              partial: "todos/priority_window_container",
              locals: { window: priority_window.to_sym, todos: window_todos })
          ]

          render turbo_stream: streams
        end
        format.html { redirect_to todos_path, notice: "Todo added.", status: :see_other }
      else
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("todo_form", partial: "todos/form", locals: { todo: @todo })
          ], status: :unprocessable_entity
        end
        format.html do
          @active_todos_grouped = current_user.todos.active.group_by(&:priority_window)
          @completed_todos = current_user.todos.completed
          render :index, status: :unprocessable_entity
        end
      end
    end
  end

  def destroy
    priority_window = @todo.priority_window
    is_completed = @todo.completed?
    @todo.destroy

    respond_to do |format|
      flash.now[:notice] = "Todo deleted."
      format.turbo_stream do
        streams = [
          turbo_stream.replace("flash", partial: "shared/flash")
        ]

        if is_completed
          # Replace completed section
          completed_todos = current_user.todos.completed
          streams << turbo_stream.replace("completed_count", completed_count_html)
          streams << turbo_stream.replace("completed_list_container",
            html: render_to_string(partial: "todos/list_container", locals: { section: :completed, todos: completed_todos }))
        else
          # Replace the priority window container
          window_todos = current_user.todos.active.where(priority_window: priority_window).order(:position)
          streams << turbo_stream.replace("#{priority_window}_list_container",
            partial: "todos/priority_window_container",
            locals: { window: priority_window.to_sym, todos: window_todos })
        end

        render turbo_stream: streams
      end
      format.html { redirect_to todos_path, notice: "Todo deleted.", status: :see_other }
    end
  end

  def complete
    was_completed = @todo.completed?
    old_priority_window = @todo.priority_window

    if was_completed
      # Unmark as done - restore to today
      Todo.transaction do
        next_position = Todo.next_position_for_user_and_window(current_user, "today")
        @todo.update!(completed_at: nil, priority_window: "today", position: next_position)
      end
      message = "Marked as undone."
    else
      # Mark as done
      @todo.update!(completed_at: Time.current)
      message = "Marked as done."
    end

    respond_to do |format|
      flash.now[:notice] = message
      format.turbo_stream do
        streams = [
          turbo_stream.replace("flash", partial: "shared/flash"),
          turbo_stream.replace("completed_count", completed_count_html)
        ]

        if was_completed
          # Restore: Update completed section and today window
          completed_todos = current_user.todos.completed
          streams << turbo_stream.replace("completed_list_container",
            html: render_to_string(partial: "todos/list_container", locals: { section: :completed, todos: completed_todos }))

          today_todos = current_user.todos.active.where(priority_window: "today").order(:position)
          streams << turbo_stream.replace("today_list_container",
            partial: "todos/priority_window_container",
            locals: { window: :today, todos: today_todos })
        else
          # Complete: Update priority window and completed section
          window_todos = current_user.todos.active.where(priority_window: old_priority_window).order(:position)
          streams << turbo_stream.replace("#{old_priority_window}_list_container",
            partial: "todos/priority_window_container",
            locals: { window: old_priority_window.to_sym, todos: window_todos })

          completed_todos = current_user.todos.completed
          streams << turbo_stream.replace("completed_list_container",
            html: render_to_string(partial: "todos/list_container", locals: { section: :completed, todos: completed_todos }))
        end

        render turbo_stream: streams
      end
      format.html { redirect_to todos_path, notice: message, status: :see_other }
    end
  end

  def reorder
    ids = Array(params[:order]).map(&:to_i)

    return head :unprocessable_entity if ids.blank? || ids.any? { |id| id <= 0 }

    # Get the first todo to determine which window we're reordering
    first_todo = current_user.todos.find_by(id: ids.first)
    return head :unprocessable_entity unless first_todo

    priority_window = first_todo.priority_window
    reorder_failed = false

    Todo.transaction do
      # Lock todos in this specific priority window
      lock_scope = current_user.todos.active.where(priority_window: priority_window).lock("FOR UPDATE")
      window_ids = lock_scope.pluck(:id)

      unless ids.sort == window_ids.sort
        reorder_failed = true
        raise ActiveRecord::Rollback
      end

      # Update positions within this window only
      # First, set all positions to temporary negative values to avoid unique constraint conflicts
      ids.each_with_index do |id, index|
        current_user.todos.where(id: id).update_all(position: -(index + 1), updated_at: Time.current)
      end

      # Then update to final positions
      ids.each_with_index do |id, index|
        current_user.todos.where(id: id).update_all(position: index + 1, updated_at: Time.current)
      end
    end

    return head :unprocessable_entity if reorder_failed

    head :ok
  end

  def move
    old_window = @todo.priority_window
    new_window = params[:priority_window]

    return head :unprocessable_entity unless Todo.priority_windows.key?(new_window)

    Todo.transaction do
      # Get next position in new window
      next_position = Todo.next_position_for_user_and_window(current_user, new_window)
      @todo.update!(priority_window: new_window, position: next_position)
    end

    # Get updated todos for both windows
    old_window_todos = current_user.todos.active.where(priority_window: old_window).order(:position)
    new_window_todos = current_user.todos.active.where(priority_window: new_window).order(:position)

    respond_to do |format|
      flash.now[:notice] = "Todo moved to #{new_window.titleize}."
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.replace("flash", partial: "shared/flash"),
          turbo_stream.replace("#{old_window}_list_container",
            partial: "todos/priority_window_container",
            locals: { window: old_window.to_sym, todos: old_window_todos }),
          turbo_stream.replace("#{new_window}_list_container",
            partial: "todos/priority_window_container",
            locals: { window: new_window.to_sym, todos: new_window_todos })
        ]
      end
      format.html { redirect_to todos_path, notice: "Todo moved.", status: :see_other }
    end
  end

  private
    def current_user
      Current.user
    end

    def set_todo
      @todo = current_user.todos.find(params[:id])
    end

    def todo_params
      params.require(:todo).permit(:title, :priority_window)
    end

    def completed_count_html
      count = current_user.todos.completed.count
      render_to_string(partial: "todos/completed_count", locals: { count: count })
    end
end
