class TrmnlPreviewController < ApplicationController
  def show
    service = TrmnlDashboardService.new(current_user)

    @todos = service.todos
    @counts = service.counts
    @generated_at = Time.current
  end
end
