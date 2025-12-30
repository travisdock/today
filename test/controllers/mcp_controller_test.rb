require "test_helper"

class McpControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
  end

  test "returns unauthorized without token" do
    post mcp_path, as: :json
    assert_response :unauthorized

    json = JSON.parse(response.body)
    assert_equal "Missing authorization token", json["error"]["message"]
  end

  test "returns unauthorized with invalid token" do
    post mcp_path,
      headers: { "Authorization" => "Bearer invalid_token" },
      as: :json

    assert_response :unauthorized
  end

  test "returns unauthorized when Auth0 is not configured" do
    # Auth0 is not configured in test environment
    post mcp_path,
      headers: { "Authorization" => "Bearer some_token" },
      as: :json

    assert_response :unauthorized
  end
end

class WellKnownControllerTest < ActionDispatch::IntegrationTest
  test "returns service unavailable when Auth0 is not configured" do
    get "/.well-known/oauth-protected-resource", as: :json

    assert_response :service_unavailable
    json = JSON.parse(response.body)
    assert_equal "Auth0 not configured", json["error"]
  end
end
