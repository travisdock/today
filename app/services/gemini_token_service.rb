# frozen_string_literal: true

# Service for generating ephemeral Gemini API tokens for client-side streaming
class GeminiTokenService
  GEMINI_AUTH_URL = "https://generativelanguage.googleapis.com/v1alpha/auth_tokens"

  class << self
    # Generate an ephemeral token for frontend WebSocket connections to Gemini Live API
    # @param user [User] The user requesting the token
    # @param expires_in [ActiveSupport::Duration] Token lifetime (default: 30 minutes)
    # @return [Hash] Token data with :token and :expires_at keys
    # @raise [StandardError] If token creation fails
    def create_ephemeral_token(user:, expires_in: 30.minutes)
      config = build_token_config(expires_in)
      response = send_token_request(config)

      if response.success?
        parse_token_response(response, expires_in)
      else
        handle_token_error(response)
      end
    end

    private

    def build_token_config(expires_in)
      {
        uses: 1, # Single-use token for security
        expire_time: expires_in.from_now.iso8601
      }
    end

    def send_token_request(config)
      conn = Faraday.new(url: GEMINI_AUTH_URL) do |f|
        f.request :json
        f.response :json
        f.options.timeout = 5
        f.options.open_timeout = 2
        f.adapter Faraday.default_adapter
      end

      api_key = Rails.application.credentials.gemini_api_key || ENV["GEMINI_API_KEY"]

      response = conn.post do |req|
        req.headers["Content-Type"] = "application/json"
        req.headers["x-goog-api-key"] = api_key
        req.body = config
      end

      response
    end

    def parse_token_response(response, expires_in)
      data = response.body
      {
        token: data["name"],  # API returns token in 'name' field
        expires_at: expires_in.from_now.iso8601
      }
    end

    def handle_token_error(response)
      error_message = "Failed to create ephemeral Gemini token: #{response.status} - #{response.body}"
      Rails.logger.error(error_message)
      raise StandardError, error_message
    end
  end
end
