module Api
  module V1
    class BaseController < ActionController::API
      include ApiAuthentication

      before_action :check_rate_limit

      RATE_LIMIT_MAX_REQUESTS = 100
      RATE_LIMIT_WINDOW = 1.minute

      private

      def check_rate_limit
        return unless current_api_token

        key = "api_v1:rate:#{current_api_token.id}"
        current_count = Rails.cache.increment(key, 1, expires_in: RATE_LIMIT_WINDOW)

        unless current_count
          Rails.cache.write(key, 1, expires_in: RATE_LIMIT_WINDOW)
          current_count = 1
        end

        if current_count > RATE_LIMIT_MAX_REQUESTS
          render json: {
            error: "Rate limit exceeded. Max #{RATE_LIMIT_MAX_REQUESTS} requests per minute."
          }, status: :too_many_requests
        end
      end

      def current_user
        Current.user
      end
    end
  end
end
