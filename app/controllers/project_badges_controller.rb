class ProjectBadgesController < ApplicationController
  before_action :set_project

  def create
    # Atomic rate limit check and timestamp update to prevent race conditions
    updated = Project.where(id: @project.id)
      .where("badge_generated_at IS NULL OR badge_generated_at <= ?", 2.minutes.ago)
      .update_all(badge_generated_at: Time.current)

    if updated == 0
      flash.now[:alert] = "Please wait a few minutes before regenerating."
      render turbo_stream: turbo_stream.update("flash", partial: "shared/flash")
      return
    end

    BadgeGeneratorJob.perform_later(@project.id)

    @project.reload
    render turbo_stream: turbo_stream.replace(
      ActionView::RecordIdentifier.dom_id(@project, :badge),
      partial: "projects/badge",
      locals: { project: @project }
    )
  end

  private

  def set_project
    @project = current_user.projects.find(params[:project_id])
  end
end
