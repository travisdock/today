class ProjectResourcesController < ApplicationController
  before_action :set_project
  before_action :set_resource, only: :destroy

  def create
    @resource = @project.resources.build(resource_params)

    respond_to do |format|
      if @resource.save
        flash.now[:notice] = "Resource added."
        format.turbo_stream do
          fresh_form = @project.resources.build
          resources = @project.resources.last_two

          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("resource_form", partial: "projects/resources/form",
                                 locals: { project: @project, resource: fresh_form }),
            turbo_stream.replace("resources_list", partial: "projects/resources/list",
                                 locals: { resources: resources })
          ]
        end
        format.html { redirect_to project_path(@project), notice: "Resource added." }
      else
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("resource_form", partial: "projects/resources/form",
                                 locals: { project: @project, resource: @resource })
          ], status: :unprocessable_entity
        end
        format.html { redirect_to project_path(@project), alert: "Could not add resource." }
      end
    end
  end

  def destroy
    @resource.destroy!
    flash.now[:notice] = "Resource deleted."

    respond_to do |format|
      format.turbo_stream do
        resources = @project.resources.last_two
        render turbo_stream: [
          turbo_stream.replace("flash", partial: "shared/flash"),
          turbo_stream.replace("resources_list", partial: "projects/resources/list",
                               locals: { resources: resources })
        ]
      end
      format.html { redirect_to project_path(@project), notice: "Resource deleted." }
    end
  end

  private

  def set_project
    @project = current_user.projects.find(params[:project_id])
  end

  def set_resource
    @resource = @project.resources.find(params[:id])
  end

  def resource_params
    params.require(:resource).permit(:content, :url)
  end
end
