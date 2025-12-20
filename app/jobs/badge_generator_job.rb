class BadgeGeneratorJob < ApplicationJob
  queue_as :default

  retry_on Faraday::TimeoutError, wait: :polynomially_longer, attempts: 3
  retry_on Faraday::ConnectionFailed, wait: 5.seconds, attempts: 3
  retry_on BadgeGeneratorService::GenerationError, wait: 10.seconds, attempts: 2

  discard_on ActiveRecord::RecordNotFound

  # Only runs after ALL retries exhausted - handles final failure state
  after_discard do |job, exception|
    project = Project.find_by(id: job.arguments.first)
    if project
      # Reset timestamp so old badge shows on page refresh and user can retry
      project.update_column(:badge_generated_at, nil)
      broadcast_badge_update(project, failed: true)
    end
  end

  def perform(project_id)
    project = Project.find(project_id)
    BadgeGeneratorService.new(project).generate!
    broadcast_badge_update(project)
  end

  private

  def broadcast_badge_update(project, failed: false)
    project.reload

    Turbo::StreamsChannel.broadcast_replace_to(
      project,
      target: ActionView::RecordIdentifier.dom_id(project, :badge),
      partial: "projects/badge",
      locals: { project: project, generation_failed: failed }
    )
  end
end
