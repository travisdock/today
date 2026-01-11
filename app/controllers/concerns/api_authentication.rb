module ApiAuthentication
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_api_token!
  end

  class_methods do
    def allow_unauthenticated_api_access(**options)
      skip_before_action :authenticate_api_token!, **options
    end

    def require_scope(scope, **options)
      before_action(**options) { enforce_scope!(scope) }
    end
  end

  private

  def authenticate_api_token!
    token = extract_bearer_token

    unless token
      render json: { error: "Missing authorization token" }, status: :unauthorized
      return
    end

    @current_api_token = ApiToken.find_by_token(token)

    unless @current_api_token
      render json: { error: "Invalid or revoked token" }, status: :unauthorized
      return
    end

    Current.user = @current_api_token.user
    Current.api_token = @current_api_token

    @current_api_token.record_usage!
  end

  def extract_bearer_token
    auth_header = request.headers["Authorization"]
    return nil unless auth_header&.start_with?("Bearer ")
    auth_header.delete_prefix("Bearer ").strip
  end

  def current_api_token
    @current_api_token
  end

  def enforce_scope!(required_scope)
    case required_scope
    when :read
      return if current_api_token&.can_read?
    when :write
      return if current_api_token&.can_write?
    end

    render json: { error: "Insufficient scope. Required: #{required_scope}" }, status: :forbidden
  end
end
