# Auth0 configuration for MCP server OAuth 2.1 authentication
#
# To configure Auth0:
# 1. Create a "Regular Web Application" in Auth0
# 2. Create an API with identifier matching AUTH0_AUDIENCE
# 3. Add callback URLs:
#    - Production: https://chatgpt.com/connector_platform_oauth_redirect
#    - Development: https://platform.openai.com/apps-manage/oauth
# 4. Enable PKCE (required by ChatGPT)
#
# Required credentials (add to config/credentials.yml.enc):
#   auth0:
#     domain: your-tenant.auth0.com
#     audience: https://yourapp.com/mcp
#
# Or via environment variables:
#   AUTH0_DOMAIN=your-tenant.auth0.com
#   AUTH0_AUDIENCE=https://yourapp.com/mcp

module Auth0Config
  class << self
    def domain
      # Check environment-specific credentials first, then root level, then ENV
      Rails.application.credentials.dig(Rails.env.to_sym, :auth0, :domain) ||
        Rails.application.credentials.dig(:auth0, :domain) ||
        ENV["AUTH0_DOMAIN"]
    end

    def audience
      Rails.application.credentials.dig(Rails.env.to_sym, :auth0, :audience) ||
        Rails.application.credentials.dig(:auth0, :audience) ||
        ENV["AUTH0_AUDIENCE"]
    end

    def issuer
      "https://#{domain}/"
    end

    def jwks_uri
      "https://#{domain}/.well-known/jwks.json"
    end

    def configured?
      domain.present? && audience.present?
    end
  end
end
