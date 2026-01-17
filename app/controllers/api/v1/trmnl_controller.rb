module Api
  module V1
    class TrmnlController < BaseController
      require_scope :read

      def dashboard
        service = TrmnlDashboardService.new(current_user)

        render json: {
          todos: service.todos,
          counts: service.counts,
          generated_at: Time.current.iso8601
        }
      end
    end
  end
end
