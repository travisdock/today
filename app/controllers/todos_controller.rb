class TodosController < ApplicationController
  before_action :set_todo, only: %i[destroy complete archive]

  def index
    @todo = current_user.todos.build
    @active_todos = current_user.todos.active
    @archived_todos = current_user.todos.archived
  end

  def create
    was_empty = !todos_scope(:active).exists?
    @todo = current_user.todos.build(todo_params)

    respond_to do |format|
      if @todo.save
        flash.now[:notice] = "Todo added."
        format.turbo_stream do
          fresh_form = current_user.todos.build
          streams = [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("todo_form", partial: "todos/form", locals: { todo: fresh_form })
          ]

          if was_empty
            streams << turbo_stream.replace("active_list_container", partial: "todos/list_container", locals: { section: :active, todos: [ @todo ] })
          else
            streams << turbo_stream.append("active_todo_items", partial: "todos/todo", locals: { todo: @todo, section: :active })
          end

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
          @active_todos = current_user.todos.active
          @archived_todos = current_user.todos.archived
          render :index, status: :unprocessable_entity
        end
      end
    end
  end

  def destroy
    section = @todo.archived? ? :archived : :active
    remaining_elsewhere = todos_scope(section).where.not(id: @todo.id).exists?
    @todo.destroy

    respond_to do |format|
      flash.now[:notice] = "Todo deleted."
      format.turbo_stream do
        streams = [
          turbo_stream.replace("flash", partial: "shared/flash"),
          turbo_stream.remove(@todo)
        ]

        streams << turbo_stream.replace("#{section}_list_container", partial: "todos/list_container", locals: { section:, todos: [] }) unless remaining_elsewhere
        streams << turbo_stream.replace("archived_count", archived_count_html) if section == :archived

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
          turbo_stream.replace(@todo, partial: "todos/todo", locals: { todo: @todo, section: :active })
        ]
      end
      format.html { redirect_to todos_path, notice: message, status: :see_other }
    end
  end

  def archive
    source_section = @todo.archived? ? :archived : :active
    target_section = source_section == :active ? :archived : :active
    has_other_in_source = todos_scope(source_section).where.not(id: @todo.id).exists?
    target_was_empty = !todos_scope(target_section).exists?

    if source_section == :active
      @todo.update!(archived_at: Time.current)
      message = "Archived."
    else
      Todo.transaction do
        next_position = Todo.next_position_for_user(current_user)
        @todo.update!(archived_at: nil, position: next_position)
      end
      message = "Restored to active list."
    end

    respond_to do |format|
      flash.now[:notice] = message
      format.turbo_stream do
        streams = [
          turbo_stream.replace("flash", partial: "shared/flash"),
          turbo_stream.remove(@todo)
        ]

        streams << turbo_stream.replace("#{source_section}_list_container", partial: "todos/list_container", locals: { section: source_section, todos: [] }) unless has_other_in_source

        if target_was_empty
          streams << turbo_stream.replace("#{target_section}_list_container", partial: "todos/list_container", locals: { section: target_section, todos: [ @todo ] })
        else
          streams << target_stream_for(target_section, @todo)
        end

        streams << turbo_stream.replace("archived_count", archived_count_html)

        render turbo_stream: streams
      end
      format.html { redirect_to todos_path, notice: message, status: :see_other }
    end
  end

  def reorder
    ids = Array(params[:order]).map(&:to_i)

    return head :unprocessable_entity if ids.blank? || ids.any? { |id| id <= 0 }

    reorder_failed = false

    Todo.transaction do
      lock_scope = current_user.todos.active.lock("FOR UPDATE")
      active_ids = lock_scope.pluck(:id)

      unless ids.sort == active_ids.sort
        reorder_failed = true
        raise ActiveRecord::Rollback
      end

      offset = ids.length
      timestamp = Time.current

      current_user.todos.where(id: ids).update_all([ "position = position + ?", offset ])

      case_fragments = ids.each_with_index.map { "WHEN ? THEN ?" }.join(" ")
      case_args = ids.each_with_index.flat_map { |id, index| [ id, index + 1 ] }
      update_sql = ActiveRecord::Base.sanitize_sql_array([
        "position = CASE id #{case_fragments} END, updated_at = ?",
        *case_args,
        timestamp
      ])

      current_user.todos.where(id: ids).update_all(update_sql)
    end

    return head :unprocessable_entity if reorder_failed

    head :ok
  end

  private
    def current_user
      Current.user
    end

    def set_todo
      @todo = current_user.todos.find(params[:id])
    end

    def todos_scope(section)
      section == :archived ? current_user.todos.archived : current_user.todos.active
    end

    def todo_params
      params.require(:todo).permit(:title)
    end

    def toggle_timestamp(current_state)
      current_state ? nil : Time.current
    end

    def target_stream_for(section, todo)
      case section
      when :archived
        turbo_stream.prepend("archived_todo_items", partial: "todos/todo", locals: { todo:, section: })
      else
        insert_before = next_active_after(todo)
        if insert_before
          turbo_stream.before(insert_before, partial: "todos/todo", locals: { todo:, section: })
        else
          turbo_stream.append("active_todo_items", partial: "todos/todo", locals: { todo:, section: })
        end
      end
    end

    def next_active_after(todo)
      next_todo = current_user.todos.active
        .where("position > ?", todo.position)
        .where.not(id: todo.id)
        .order(position: :asc, created_at: :asc)
        .first
      next_todo ? helpers.dom_id(next_todo) : nil
    end

    def archived_count_html
      render_to_string(partial: "todos/archived_count", locals: { count: current_user.todos.archived.count })
    end
end
