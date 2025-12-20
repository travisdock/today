class ProjectsController < ApplicationController
  before_action :set_project, only: %i[edit update generate_badge]

  def index
    @projects = current_user.projects.active.ordered.with_attached_badge
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

  def generate_badge
    if rate_limited?
      flash.now[:alert] = "Please wait a few minutes before regenerating."
      render turbo_stream: turbo_stream.update("flash", partial: "shared/flash")
      return
    end

    @project.touch(:badge_generated_at)
    BadgeGeneratorJob.perform_later(@project.id)

    @project.reload
    render turbo_stream: turbo_stream.replace(
      ActionView::RecordIdentifier.dom_id(@project, :badge),
      partial: "projects/badge",
      locals: { project: @project }
    )
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

  private

  def set_project
    @project = current_user.projects.find(params[:id])
  end

  def project_params
    params.require(:project).permit(:name, :description)
  end

  def rate_limited?
    @project.badge_generated_at.present? && @project.badge_generated_at > 2.minutes.ago
  end
end
