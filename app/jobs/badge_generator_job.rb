class BadgeGeneratorJob < ApplicationJob
  queue_as :default

  retry_on Faraday::TimeoutError, wait: :polynomially_longer, attempts: 3
  retry_on Faraday::ConnectionFailed, wait: 5.seconds, attempts: 3
  retry_on BadgeGeneratorService::GenerationError, wait: 10.seconds, attempts: 2

  discard_on ActiveRecord::RecordNotFound

  def perform(project_id)
    project = Project.find(project_id)
    BadgeGeneratorService.new(project).generate!
    broadcast_badge_update(project)
  end

  private

  def broadcast_badge_update(project)
    fresh_project = Project.includes(badge_attachment: :blob).find(project.id)

    Turbo::StreamsChannel.broadcast_replace_to(
      fresh_project,
      target: ActionView::RecordIdentifier.dom_id(fresh_project, :badge),
      partial: "projects/badge",
      locals: { project: fresh_project }
    )
  end
end
