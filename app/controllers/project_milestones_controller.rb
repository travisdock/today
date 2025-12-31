class ProjectMilestonesController < ApplicationController
  before_action :set_project
  before_action :set_milestone, only: %i[show update destroy toggle_complete]

  def show
    @todo = current_user.todos.build(milestone: @milestone, priority_window: :today)
    @active_todos = @milestone.active_todos
    @completed_todos = @milestone.recent_completed_todos
  end

  def create
    @milestone = @project.milestones.build(milestone_params)

    respond_to do |format|
      if @milestone.save
        flash.now[:notice] = "Milestone added."
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("milestone_form", partial: "projects/milestones/form",
                                 locals: { project: @project, milestone: @project.milestones.build }),
            turbo_stream.replace("milestones_list", partial: "projects/milestones/list",
                                 locals: { project: @project, milestones: @project.milestones.active })
          ]
        end
        format.html { redirect_to project_path(@project), notice: "Milestone added." }
      else
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("milestone_form", partial: "projects/milestones/form",
                                 locals: { project: @project, milestone: @milestone })
          ], status: :unprocessable_entity
        end
        format.html { redirect_to project_path(@project), alert: "Could not add milestone." }
      end
    end
  end

  def update
    respond_to do |format|
      if @milestone.update(milestone_params)
        flash.now[:notice] = "Milestone updated."
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace(dom_id(@milestone), partial: "projects/milestones/milestone",
                                 locals: { project: @project, milestone: @milestone })
          ]
        end
        format.html { redirect_to project_path(@project), notice: "Milestone updated." }
      else
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace(dom_id(@milestone), partial: "projects/milestones/milestone",
                                 locals: { project: @project, milestone: @milestone })
          ], status: :unprocessable_entity
        end
        format.html { redirect_to project_path(@project), alert: "Could not update milestone." }
      end
    end
  end

  def destroy
    @milestone.destroy

    respond_to do |format|
      flash.now[:notice] = "Milestone deleted."
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.replace("flash", partial: "shared/flash"),
          turbo_stream.replace("milestones_list", partial: "projects/milestones/list",
                               locals: { project: @project, milestones: @project.milestones.active })
        ]
      end
      format.html { redirect_to project_path(@project), notice: "Milestone deleted.", status: :see_other }
    end
  end

  def toggle_complete
    if @milestone.completed?
      @milestone.uncomplete!
      message = "Milestone marked as active."
    else
      @milestone.complete!
      message = "Milestone completed."
    end

    respond_to do |format|
      flash.now[:notice] = message
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.replace("flash", partial: "shared/flash"),
          turbo_stream.replace("milestones_list", partial: "projects/milestones/list",
                               locals: { project: @project, milestones: @project.milestones.active }),
          turbo_stream.replace("completed_milestones_list", partial: "projects/milestones/completed_list",
                               locals: { project: @project, milestones: @project.milestones.completed })
        ]
      end
      format.html { redirect_to project_path(@project), notice: message, status: :see_other }
    end
  end

  def reorder
    ids = Array(params[:order]).map(&:to_i)
    return head :unprocessable_entity if ids.empty?

    Milestone.transaction do
      milestones = @project.milestones.where(id: ids).lock("FOR UPDATE")
      return head :unprocessable_entity if milestones.count != ids.count

      ids.each_with_index do |id, index|
        milestones.find { |m| m.id == id }&.update_column(:position, index + 1)
      end
    end

    head :ok
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  private

  def set_project
    @project = current_user.projects.find(params[:project_id])
  end

  def set_milestone
    @milestone = @project.milestones.find(params[:id])
  end

  def milestone_params
    params.require(:milestone).permit(:name, :description)
  end
end
