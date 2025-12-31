class MilestoneTodosController < ApplicationController
  before_action :set_project_and_milestone

  def create
    @todo = current_user.todos.build(todo_params)
    @todo.milestone = @milestone

    respond_to do |format|
      if @todo.save
        flash.now[:notice] = "Todo added to milestone."
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("milestone_todo_form", partial: "milestones/todo_form",
                                 locals: { project: @project, milestone: @milestone,
                                          todo: current_user.todos.build(milestone: @milestone, priority_window: :today) }),
            turbo_stream.replace("milestone_todos_list", partial: "milestones/todos_list",
                                 locals: { milestone: @milestone,
                                          active_todos: @milestone.todos.where(completed_at: nil).order(:priority_window, :position),
                                          completed_todos: @milestone.todos.where.not(completed_at: nil).order(completed_at: :desc).limit(10) })
          ]
        end
        format.html { redirect_to project_milestone_path(@project, @milestone), notice: "Todo added." }
      else
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("milestone_todo_form", partial: "milestones/todo_form",
                                 locals: { project: @project, milestone: @milestone, todo: @todo })
          ], status: :unprocessable_entity
        end
        format.html { redirect_to project_milestone_path(@project, @milestone), alert: "Could not add todo." }
      end
    end
  end

  private

  def set_project_and_milestone
    @project = current_user.projects.find(params[:project_id])
    @milestone = @project.milestones.find(params[:milestone_id])
  end

  def todo_params
    params.require(:todo).permit(:title, :priority_window)
  end
end
