class ProjectsController < ApplicationController
  before_action :set_project, only: %i[show edit update toggle_complete]

  def index
    @projects_grouped = current_user.projects.active.ordered.group_by(&:section)
    @completed_projects = current_user.projects.recently_completed.ordered
  end

  def show
    @milestones = @project.milestones.active.with_active_todos_count
    @completed_milestones = @project.milestones.completed.with_active_todos_count
    @milestone = @project.milestones.build
    @thoughts = @project.thoughts.last_two.with_attached_image
    @thought = @project.thoughts.build
    @resources = @project.resources.last_two
    @resource = @project.resources.build
    @journal_entries = @project.journal_entries.last_two.with_attached_image
    @journal_entry = @project.journal_entries.build
  end

  def new
    @project = current_user.projects.build
  end

  def create
    @project = current_user.projects.build(project_params)

    if @project.save
      @project.touch(:badge_generated_at)
      BadgeGeneratorJob.perform_later(@project.id)
      redirect_to projects_path, notice: "Project created. Badge is being generated..."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @project.update(project_params)
      redirect_to projects_path, notice: "Project updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def toggle_complete
    if @project.completed?
      @project.uncomplete!
      message = "Project marked as active."
    else
      @project.complete!
      message = "Project completed."
    end

    respond_to do |format|
      flash.now[:notice] = message
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.replace("flash", partial: "shared/flash"),
          turbo_stream.replace("project_lists", partial: "projects/lists",
                               locals: { projects_grouped: current_user.projects.active.ordered.group_by(&:section) }),
          turbo_stream.replace("completed_projects_list", partial: "projects/completed_list",
                               locals: { projects: current_user.projects.recently_completed.ordered })
        ]
      end
      format.html { redirect_to projects_path, notice: message, status: :see_other }
    end
  end

  def reorder
    ids = Array(params[:order]).map(&:to_i)
    section = params[:section]

    return head :unprocessable_entity if ids.empty? || section.blank?

    ProjectReorderingService.new(current_user).reorder!(
      ordered_ids: ids,
      section: section
    )

    head :ok
  rescue ProjectReorderingService::Error => e
    head :unprocessable_entity
  end

  private

  def set_project
    @project = current_user.projects.find(params[:id])
  end

  def project_params
    params.require(:project).permit(:name, :description, :section)
  end
end
