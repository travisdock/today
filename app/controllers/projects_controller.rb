class ProjectsController < ApplicationController
  before_action :set_project, only: %i[edit update generate_badge]

  def index
    @projects = current_user.projects.active.ordered
  end

  def new
    @project = current_user.projects.build
  end

  def create
    @project = current_user.projects.build(project_params)

    if @project.save
      BadgeGeneratorService.new(@project).generate!
      redirect_to projects_path, notice: "Project created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def generate_badge
    BadgeGeneratorService.new(@project).generate!
    redirect_to edit_project_path(@project), notice: "Badge regenerated!"
  rescue => e
    Rails.logger.error("Badge generation failed: #{e.message}")
    redirect_to edit_project_path(@project), alert: "Failed to generate badge."
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
end
