class TodosController < ApplicationController
  before_action :set_todo, only: %i[destroy complete archive move]

  def index
    @todo = current_user.todos.build(priority_window: :today)  # Default to today
    @active_todos_grouped = current_user.todos.active.group_by(&:priority_window)
    @archived_todos = current_user.todos.archived
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
          @archived_todos = current_user.todos.archived
          render :index, status: :unprocessable_entity
        end
      end
    end
  end

  def destroy
    priority_window = @todo.priority_window
    is_archived = @todo.archived?
    @todo.destroy

    respond_to do |format|
      flash.now[:notice] = "Todo deleted."
      format.turbo_stream do
        streams = [
          turbo_stream.replace("flash", partial: "shared/flash")
        ]

        if is_archived
          # Replace archived section
          archived_todos = current_user.todos.archived
          streams << turbo_stream.replace("archived_count", archived_count_html)
          streams << turbo_stream.replace("archived_list_container",
            html: render_to_string(partial: "todos/list_container", locals: { section: :archived, todos: archived_todos }))
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
    @todo.update!(completed_at: toggle_timestamp(was_completed))
    message = was_completed ? "Marked as undone." : "Marked as done."

    respond_to do |format|
      flash.now[:notice] = message
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.replace("flash", partial: "shared/flash"),
          turbo_stream.replace(@todo, partial: "todos/todo", locals: { todo: @todo, section: @todo.priority_window })
        ]
      end
      format.html { redirect_to todos_path, notice: message, status: :see_other }
    end
  end

  def archive
    old_priority_window = @todo.priority_window
    is_archived = @todo.archived?

    if is_archived
      # Restoring from archived to today
      Todo.transaction do
        next_position = Todo.next_position_for_user_and_window(current_user, "today")
        @todo.update!(archived_at: nil, priority_window: "today", position: next_position)
      end
      message = "Restored to active list."
    else
      # Archiving from priority window to archived
      @todo.update!(archived_at: Time.current)
      message = "Archived."
    end

    respond_to do |format|
      flash.now[:notice] = message
      format.turbo_stream do
        streams = [
          turbo_stream.replace("flash", partial: "shared/flash"),
          turbo_stream.replace("archived_count", archived_count_html)
        ]

        if is_archived
          # Restore: Update archived section and today window
          archived_todos = current_user.todos.archived
          streams << turbo_stream.replace("archived_list_container",
            html: render_to_string(partial: "todos/list_container", locals: { section: :archived, todos: archived_todos }))

          today_todos = current_user.todos.active.where(priority_window: "today").order(:position)
          streams << turbo_stream.replace("today_list_container",
            partial: "todos/priority_window_container",
            locals: { window: :today, todos: today_todos })
        else
          # Archive: Update priority window and archived section
          window_todos = current_user.todos.active.where(priority_window: old_priority_window).order(:position)
          streams << turbo_stream.replace("#{old_priority_window}_list_container",
            partial: "todos/priority_window_container",
            locals: { window: old_priority_window.to_sym, todos: window_todos })

          archived_todos = current_user.todos.archived
          streams << turbo_stream.replace("archived_list_container",
            html: render_to_string(partial: "todos/list_container", locals: { section: :archived, todos: archived_todos }))
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

    def toggle_timestamp(current_state)
      current_state ? nil : Time.current
    end

    def archived_count_html
      render_to_string(partial: "todos/archived_count", locals: { count: current_user.todos.archived.count })
    end
end
