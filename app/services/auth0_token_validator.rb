# Validates tokens from Auth0 for MCP server authentication
#
# Supports both JWT and opaque access tokens by validating via
# the userinfo endpoint.
#
# Usage:
#   validator = Auth0TokenValidator.new(token)
#   if validator.valid?
#     user = validator.user
#   else
#     error = validator.error
#   end
#
class Auth0TokenValidator
  attr_reader :error

  def initialize(token)
    @token = token
    @error = nil
    @userinfo = nil
  end

  def valid?
    return false unless Auth0Config.configured?

    # Validate by calling userinfo endpoint - works for both JWT and opaque tokens
    validate_via_userinfo
    @error.nil?
  end

  def user
    return nil unless @userinfo

    email = @userinfo["email"]
    return nil unless email

    User.find_by(email_address: email.downcase.strip)
  end

  def payload
    @userinfo
  end

  private

  def validate_via_userinfo
    uri = URI("https://#{Auth0Config.domain}/userinfo")
    request = Net::HTTP::Get.new(uri)
    request["Authorization"] = "Bearer #{@token}"

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.open_timeout = 5
      http.read_timeout = 5
      http.request(request)
    end

    case response
    when Net::HTTPSuccess
      @userinfo = JSON.parse(response.body)
    when Net::HTTPUnauthorized
      @error = "Invalid or expired token"
    else
      @error = "Token validation failed: #{response.code}"
    end
  rescue StandardError => e
    Rails.logger.error("[Auth0] Userinfo request failed: #{e.message}")
    @error = "Token validation error: #{e.message}"
  end
end
