# Serves OAuth 2.1 protected resource metadata for MCP server discovery
#
# ChatGPT uses this endpoint to discover the authorization server
# and supported scopes for the MCP server.
#
# Endpoint: GET /.well-known/oauth-protected-resource
#
class WellKnownController < ApplicationController
  skip_before_action :require_authentication

  # OAuth Protected Resource Metadata (RFC 9449)
  # https://datatracker.ietf.org/doc/html/rfc9449
  def oauth_protected_resource
    unless Auth0Config.configured?
      render json: { error: "Auth0 not configured" }, status: :service_unavailable
      return
    end

    render json: {
      resource: mcp_resource_url,
      authorization_servers: [ Auth0Config.issuer ],
      scopes_supported: [ "read:projects", "read:todos", "openid", "email" ],
      bearer_methods_supported: [ "header" ],
      resource_documentation: "https://github.com/travisdock/today"
    }
  end

  private

  def mcp_resource_url
    # Use the request host to build the resource URL
    "#{request.protocol}#{request.host_with_port}/mcp"
  end
end
