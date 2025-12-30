# MCP (Model Context Protocol) server endpoint for ChatGPT integration
#
# This controller handles MCP requests from ChatGPT, authenticating users
# via Auth0 OAuth tokens and exposing tools to read project data.
#
# Endpoint: POST /mcp
# Authentication: Bearer token (Auth0 JWT)
#
class McpController < ApplicationController
  skip_before_action :require_authentication
  skip_forgery_protection
  before_action :authenticate_mcp_token!

  # Handle MCP JSON-RPC requests
  def handle
    server = build_mcp_server

    # Process the request through the MCP server
    request_body = request.body.read
    response_data = process_mcp_request(server, request_body)

    render json: response_data
  end

  private

  def authenticate_mcp_token!
    # Development bypass: allow testing with X-MCP-Dev-User-Id header
    if Rails.env.development? && request.headers["X-MCP-Dev-User-Id"].present?
      @mcp_user = User.find_by(id: request.headers["X-MCP-Dev-User-Id"])
      return if @mcp_user
      render_unauthorized("Dev user not found")
      return
    end

    token = extract_bearer_token

    # Debug logging
    Rails.logger.info "[MCP Auth] Authorization header present: #{request.headers['Authorization'].present?}"
    Rails.logger.info "[MCP Auth] Token extracted: #{token.present?}"
    Rails.logger.info "[MCP Auth] Token preview: #{token&.first(50)}..." if token.present?

    unless token
      render_unauthorized("Missing authorization token")
      return
    end

    validator = Auth0TokenValidator.new(token)
    unless validator.valid?
      Rails.logger.info "[MCP Auth] Token validation failed: #{validator.error}"
      render_unauthorized(validator.error || "Invalid token")
      return
    end

    Rails.logger.info "[MCP Auth] Token valid, looking up user..."

    @mcp_user = validator.user
    unless @mcp_user
      Rails.logger.info "[MCP Auth] User not found for token"
      render_unauthorized("User not found. Please use the same email as your Today app account.")
      return
    end

    Rails.logger.info "[MCP Auth] User found: #{@mcp_user.email_address}"
  end

  def extract_bearer_token
    auth_header = request.headers["Authorization"]
    return nil unless auth_header&.start_with?("Bearer ")

    auth_header.delete_prefix("Bearer ").strip
  end

  def render_unauthorized(message)
    render json: {
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: message
      }
    }, status: :unauthorized
  end

  def build_mcp_server
    user = @mcp_user
    server = MCP::Server.new(name: "today-app", version: "1.0.0")

    # Define list_projects tool
    server.tool("list_projects") do
      description "List all projects for the authenticated user"
      argument :section, String, required: false, description: "Filter by section: this_month, next_month, this_year, next_year"

      call do |args|
        projects = user.projects.active.ordered
        projects = projects.where(section: args[:section]) if args[:section].present?

        if projects.empty?
          args[:section] ? "No projects found in #{args[:section].humanize}." : "No active projects found."
        else
          projects.map do |p|
            "**#{p.name}** (#{p.section.humanize})\n#{p.description.presence || 'No description'}\n- Thoughts: #{p.thoughts_count}, Resources: #{p.resources_count}, Journal: #{p.journal_entries_count}\nID: #{p.id}"
          end.join("\n\n---\n\n")
        end
      end
    end

    # Define get_project tool
    server.tool("get_project") do
      description "Get detailed information about a specific project"
      argument :project_id, Integer, required: true, description: "The project ID"

      call do |args|
        project = user.projects.find_by(id: args[:project_id])

        unless project
          "Project not found with ID #{args[:project_id]}."
        else
          thoughts = project.thoughts.order(created_at: :desc).limit(5).map { |t| "- #{(t.content.presence || '[Image]').truncate(100)}" }.join("\n")
          resources = project.resources.order(created_at: :desc).limit(5).map { |r| "- #{r.content.to_s.truncate(100)} #{r.url}" }.join("\n")
          entries = project.journal_entries.order(created_at: :desc).limit(5).map { |e| "- #{(e.content.presence || '[Image]').truncate(100)}" }.join("\n")

          <<~TEXT
            # #{project.name}
            **Section:** #{project.section.humanize}
            **Description:** #{project.description.presence || 'No description'}

            ## Recent Thoughts (#{project.thoughts_count} total)
            #{thoughts.presence || 'None'}

            ## Recent Resources (#{project.resources_count} total)
            #{resources.presence || 'None'}

            ## Recent Journal Entries (#{project.journal_entries_count} total)
            #{entries.presence || 'None'}
          TEXT
        end
      end
    end

    # Define list_thoughts tool
    server.tool("list_thoughts") do
      description "List thoughts for a project"
      argument :project_id, Integer, required: true, description: "The project ID"
      argument :limit, Integer, required: false, description: "Max thoughts to return (default 10, max 50)"

      call do |args|
        project = user.projects.find_by(id: args[:project_id])
        unless project
          "Project not found with ID #{args[:project_id]}."
        else
          limit = [ [ (args[:limit] || 10).to_i, 1 ].max, 50 ].min
          thoughts = project.thoughts.order(created_at: :desc).limit(limit)

          if thoughts.empty?
            "No thoughts for '#{project.name}'."
          else
            thoughts.map.with_index(1) { |t, i| "#{i}. #{t.content.presence || '[Image]'}#{t.image.attached? ? ' [has image]' : ''}" }.join("\n")
          end
        end
      end
    end

    # Define list_resources tool
    server.tool("list_resources") do
      description "List resources for a project"
      argument :project_id, Integer, required: true, description: "The project ID"
      argument :limit, Integer, required: false, description: "Max resources to return (default 10, max 50)"

      call do |args|
        project = user.projects.find_by(id: args[:project_id])
        unless project
          "Project not found with ID #{args[:project_id]}."
        else
          limit = [ [ (args[:limit] || 10).to_i, 1 ].max, 50 ].min
          resources = project.resources.order(created_at: :desc).limit(limit)

          if resources.empty?
            "No resources for '#{project.name}'."
          else
            resources.map.with_index(1) { |r, i| "#{i}. #{r.content.to_s.truncate(100)}#{r.url.present? ? " - #{r.url}" : ''}" }.join("\n")
          end
        end
      end
    end

    # Define list_journal_entries tool
    server.tool("list_journal_entries") do
      description "List journal entries for a project"
      argument :project_id, Integer, required: true, description: "The project ID"
      argument :limit, Integer, required: false, description: "Max entries to return (default 10, max 50)"

      call do |args|
        project = user.projects.find_by(id: args[:project_id])
        unless project
          "Project not found with ID #{args[:project_id]}."
        else
          limit = [ [ (args[:limit] || 10).to_i, 1 ].max, 50 ].min
          entries = project.journal_entries.order(created_at: :desc).limit(limit)

          if entries.empty?
            "No journal entries for '#{project.name}'."
          else
            entries.map.with_index(1) { |e, i| "#{i}. #{e.content.presence || '[Image]'}#{e.image.attached? ? ' [has image]' : ''}" }.join("\n")
          end
        end
      end
    end

    # Define list_todos tool
    server.tool("list_todos") do
      description "List todos organized by priority window"
      argument :priority_window, String, required: false, description: "Filter: today, tomorrow, this_week, next_week"
      argument :include_completed, String, required: false, description: "Include completed todos: true/false"

      call do |args|
        todos = user.todos.active
        todos = todos.where(priority_window: args[:priority_window]) if args[:priority_window].present?
        todos = todos.order(:priority_window, :position)

        if todos.empty?
          args[:priority_window] ? "No todos for #{args[:priority_window].humanize}." : "No active todos."
        else
          grouped = todos.group_by(&:priority_window)
          output = []
          %w[today tomorrow this_week next_week].each do |window|
            window_todos = grouped[window] || []
            next if window_todos.empty?
            output << "## #{window.humanize}"
            output << window_todos.map.with_index(1) { |t, i| "#{i}. #{t.title}" }.join("\n")
          end

          if args[:include_completed] == "true"
            completed = user.todos.completed
            if completed.any?
              output << "\n## Completed (last 7 days)"
              output << completed.map { |t| "- ~~#{t.title}~~" }.join("\n")
            end
          end

          output.join("\n\n")
        end
      end
    end

    server
  end

  def process_mcp_request(server, body)
    request_data = JSON.parse(body, symbolize_names: true)

    case request_data[:method]
    when "initialize"
      {
        jsonrpc: "2.0",
        id: request_data[:id],
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: server.name, version: server.version }
        }
      }
    when "tools/list"
      # Add readOnlyHint annotation to all tools (they're all read-only)
      tools_with_annotations = server.list_tools.map do |tool|
        tool.merge(annotations: { readOnlyHint: true })
      end
      {
        jsonrpc: "2.0",
        id: request_data[:id],
        result: { tools: tools_with_annotations }
      }
    when "tools/call"
      tool_name = request_data.dig(:params, :name)
      arguments = request_data.dig(:params, :arguments) || {}

      begin
        result = server.call_tool(tool_name, **arguments.transform_keys(&:to_sym))
        {
          jsonrpc: "2.0",
          id: request_data[:id],
          result: { content: [ { type: "text", text: result } ] }
        }
      rescue => e
        {
          jsonrpc: "2.0",
          id: request_data[:id],
          result: { content: [ { type: "text", text: "Error: #{e.message}" } ], isError: true }
        }
      end
    else
      {
        jsonrpc: "2.0",
        id: request_data[:id],
        error: { code: -32601, message: "Method not found: #{request_data[:method]}" }
      }
    end
  rescue JSON::ParserError => e
    { jsonrpc: "2.0", error: { code: -32700, message: "Parse error: #{e.message}" } }
  end
end
