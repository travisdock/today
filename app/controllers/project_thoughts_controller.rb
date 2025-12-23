class ProjectThoughtsController < ApplicationController
  before_action :set_project

  def create
    @thought = @project.thoughts.build(thought_params)

    respond_to do |format|
      if @thought.save
        flash.now[:notice] = "Thought added."
        format.turbo_stream do
          fresh_form = @project.thoughts.build
          thoughts = @project.thoughts.last_two

          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("thought_form", partial: "projects/thoughts/form",
                                 locals: { project: @project, thought: fresh_form }),
            turbo_stream.replace("thoughts_list", partial: "projects/thoughts/list",
                                 locals: { thoughts: thoughts })
          ]
        end
        format.html { redirect_to project_path(@project), notice: "Thought added." }
      else
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("thought_form", partial: "projects/thoughts/form",
                                 locals: { project: @project, thought: @thought })
          ], status: :unprocessable_entity
        end
        format.html { redirect_to project_path(@project), alert: "Could not add thought." }
      end
    end
  end

  private

  def set_project
    @project = current_user.projects.find(params[:project_id])
  end

  def thought_params
    params.require(:thought).permit(:content)
  end
end
