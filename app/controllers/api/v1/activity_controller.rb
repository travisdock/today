module Api
  module V1
    class ActivityController < BaseController
      require_scope :read

      def show
        service = ActivityService.new(
          current_user,
          period: params[:period],
          start_date: params[:start_date],
          end_date: params[:end_date],
          include: params[:include]
        )

        render json: service.call
      rescue ActivityService::InvalidPeriodError, ActivityService::InvalidDateRangeError => e
        render json: { error: e.message }, status: :bad_request
      end
    end
  end
end
