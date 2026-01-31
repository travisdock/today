class ProjectThoughtsController < ApplicationController
  before_action :set_project
  before_action :set_thought, only: :destroy

  def create
    @thought = @project.thoughts.build(thought_params)

    respond_to do |format|
      if @thought.save
        flash.now[:notice] = "Thought added."
        format.turbo_stream do
          fresh_form = @project.thoughts.build
          thoughts = @project.thoughts.last_two.with_attached_image

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

  def destroy
    @thought.destroy
    flash.now[:notice] = "Thought deleted."

    respond_to do |format|
      format.turbo_stream do
        thoughts = @project.thoughts.last_two.with_attached_image
        render turbo_stream: [
          turbo_stream.replace("flash", partial: "shared/flash"),
          turbo_stream.replace("thoughts_list", partial: "projects/thoughts/list",
                               locals: { thoughts: thoughts })
        ]
      end
      format.html { redirect_to project_path(@project), notice: "Thought deleted." }
    end
  end

  private

  def set_project
    @project = current_user.projects.find(params[:project_id])
  end

  def set_thought
    @thought = @project.thoughts.find(params[:id])
  end

  def thought_params
    params.require(:thought).permit(:content, :image)
  end
end
