require "test_helper"

class McpControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @project = projects(:one)
    @dev_header = { "X-MCP-Dev-User-Id" => @user.id.to_s }
  end

  # === Authentication Tests ===

  test "returns unauthorized without token" do
    post mcp_path, as: :json
    assert_response :unauthorized

    json = JSON.parse(response.body)
    assert_equal "Missing authorization token", json["error"]["message"]
  end

  test "returns unauthorized with invalid token" do
    # Token is validated against Auth0 userinfo endpoint and rejected
    post mcp_path,
      headers: { "Authorization" => "Bearer invalid_token" },
      as: :json

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_includes json["error"]["message"], "token"
  end

  # === MCP Protocol Tests ===

  test "initialize returns server info" do
    post mcp_path,
      headers: @dev_header,
      params: { jsonrpc: "2.0", id: 1, method: "initialize" },
      as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "2.0", json["jsonrpc"]
    assert_equal 1, json["id"]
    assert_equal "2024-11-05", json.dig("result", "protocolVersion")
    assert_equal "today-app", json.dig("result", "serverInfo", "name")
    assert_equal "1.0.0", json.dig("result", "serverInfo", "version")
  end

  test "tools/list returns all tools with annotations" do
    post mcp_path,
      headers: @dev_header,
      params: { jsonrpc: "2.0", id: 1, method: "tools/list" },
      as: :json

    assert_response :success
    json = JSON.parse(response.body)
    tools = json.dig("result", "tools")

    assert_equal 6, tools.length

    tool_names = tools.map { |t| t["name"] }
    assert_includes tool_names, "list_projects"
    assert_includes tool_names, "get_project"
    assert_includes tool_names, "list_thoughts"
    assert_includes tool_names, "list_resources"
    assert_includes tool_names, "list_journal_entries"
    assert_includes tool_names, "list_todos"

    # Check readOnlyHint annotations
    tools.each do |tool|
      assert_equal true, tool.dig("annotations", "readOnlyHint"), "Tool #{tool['name']} should have readOnlyHint: true"
    end
  end

  test "unknown method returns error" do
    post mcp_path,
      headers: @dev_header,
      params: { jsonrpc: "2.0", id: 1, method: "unknown/method" },
      as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal(-32601, json.dig("error", "code"))
    assert_match(/Method not found/, json.dig("error", "message"))
  end

  # === Tool Tests ===

  test "list_projects returns user projects" do
    post mcp_path,
      headers: @dev_header,
      params: { jsonrpc: "2.0", id: 1, method: "tools/call",
                params: { name: "list_projects", arguments: {} } },
      as: :json

    assert_response :success
    json = JSON.parse(response.body)
    text = json.dig("result", "content", 0, "text")

    assert_includes text, "My Project"
    assert_includes text, "Another Project"
    assert_not_includes text, "Their Project"  # belongs to other user
  end

  test "list_projects filters by section" do
    post mcp_path,
      headers: @dev_header,
      params: { jsonrpc: "2.0", id: 1, method: "tools/call",
                params: { name: "list_projects", arguments: { section: "this_month" } } },
      as: :json

    assert_response :success
    json = JSON.parse(response.body)
    text = json.dig("result", "content", 0, "text")

    assert_includes text, "My Project"
    assert_not_includes text, "Another Project"  # in next_year section
  end

  test "get_project returns project details" do
    post mcp_path,
      headers: @dev_header,
      params: { jsonrpc: "2.0", id: 1, method: "tools/call",
                params: { name: "get_project", arguments: { project_id: @project.id } } },
      as: :json

    assert_response :success
    json = JSON.parse(response.body)
    text = json.dig("result", "content", 0, "text")

    assert_includes text, "My Project"
    assert_includes text, "This month"
    assert_includes text, "Recent Thoughts"
  end

  test "get_project returns error for invalid id" do
    post mcp_path,
      headers: @dev_header,
      params: { jsonrpc: "2.0", id: 1, method: "tools/call",
                params: { name: "get_project", arguments: { project_id: 999999 } } },
      as: :json

    assert_response :success
    json = JSON.parse(response.body)
    text = json.dig("result", "content", 0, "text")

    assert_includes text, "Project not found"
  end

  test "get_project returns error for other users project" do
    other_project = projects(:other_user)

    post mcp_path,
      headers: @dev_header,
      params: { jsonrpc: "2.0", id: 1, method: "tools/call",
                params: { name: "get_project", arguments: { project_id: other_project.id } } },
      as: :json

    assert_response :success
    json = JSON.parse(response.body)
    text = json.dig("result", "content", 0, "text")

    assert_includes text, "Project not found"
  end

  test "list_thoughts returns project thoughts" do
    post mcp_path,
      headers: @dev_header,
      params: { jsonrpc: "2.0", id: 1, method: "tools/call",
                params: { name: "list_thoughts", arguments: { project_id: @project.id } } },
      as: :json

    assert_response :success
    json = JSON.parse(response.body)
    text = json.dig("result", "content", 0, "text")

    assert_includes text, "First thought"
    assert_includes text, "Second thought"
  end

  test "list_todos returns user todos" do
    post mcp_path,
      headers: @dev_header,
      params: { jsonrpc: "2.0", id: 1, method: "tools/call",
                params: { name: "list_todos", arguments: {} } },
      as: :json

    assert_response :success
    json = JSON.parse(response.body)
    text = json.dig("result", "content", 0, "text")

    assert_includes text, "Today"
    assert_includes text, "Review pull requests"
    assert_not_includes text, "Their task"  # belongs to other user
  end

  test "list_todos filters by priority window" do
    post mcp_path,
      headers: @dev_header,
      params: { jsonrpc: "2.0", id: 1, method: "tools/call",
                params: { name: "list_todos", arguments: { priority_window: "tomorrow" } } },
      as: :json

    assert_response :success
    json = JSON.parse(response.body)
    text = json.dig("result", "content", 0, "text")

    assert_includes text, "Team meeting prep"
    assert_not_includes text, "Review pull requests"  # in today window
  end
end

class WellKnownControllerTest < ActionDispatch::IntegrationTest
  test "returns OAuth protected resource metadata when configured" do
    skip "Auth0 not configured" unless Auth0Config.configured?

    get "/.well-known/oauth-protected-resource", as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert json["resource"].present?
    assert json["authorization_servers"].is_a?(Array)
    assert_includes json["scopes_supported"], "read:projects"
  end

  test "returns service unavailable when Auth0 is not configured" do
    skip "Auth0 is configured" if Auth0Config.configured?

    get "/.well-known/oauth-protected-resource", as: :json

    assert_response :service_unavailable
    json = JSON.parse(response.body)
    assert_equal "Auth0 not configured", json["error"]
  end
end
