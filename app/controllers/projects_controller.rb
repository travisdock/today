class ProjectsController < ApplicationController
  before_action :set_project, only: %i[show edit update]

  def index
    @projects_grouped = current_user.projects.active.ordered.group_by(&:section)
  end

  def show
    @thoughts = @project.thoughts.last_two.with_attached_image
    @thought = @project.thoughts.build
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

  private

  def set_project
    @project = current_user.projects.find(params[:id])
  end

  def project_params
    params.require(:project).permit(:name, :description, :section)
  end
end
