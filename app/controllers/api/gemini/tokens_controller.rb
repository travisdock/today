# frozen_string_literal: true

module Api
  module Gemini
    class TokensController < ApplicationController
      RATE_LIMIT_MAX_REQUESTS = 10
      RATE_LIMIT_WINDOW = 1.minute

      before_action :check_rate_limit

      # POST /api/gemini/token
      # Returns an ephemeral token for client-side WebSocket streaming to Gemini Live API
      # Uses short-lived, single-use tokens instead of exposing the API key
      def create
        user = Current.user

        unless user&.streaming_voice_enabled?
          render json: { error: "Streaming voice is not enabled for your account." }, status: :forbidden
          return
        end

        begin
          token_data = GeminiTokenService.create_ephemeral_token(user: user, expires_in: 30.minutes)
          render json: token_data, status: :ok
        rescue StandardError => e
          Rails.logger.error("Failed to create ephemeral token: #{e.message}")
          render json: { error: "Failed to generate authentication token." }, status: :internal_server_error
        end
      end

      private

      def check_rate_limit
        key = "gemini_token:rate:#{Current.user.id}"
        current = Rails.cache.increment(key, 1, expires_in: RATE_LIMIT_WINDOW)
        unless current
          Rails.cache.write(key, 1, expires_in: RATE_LIMIT_WINDOW)
          current = 1
        end

        if current > RATE_LIMIT_MAX_REQUESTS
          render json: { error: "Rate limit exceeded. Please try again later." }, status: :too_many_requests
        end
      end
    end
  end
end
