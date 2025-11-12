class VoiceCommandProcessor
  def initialize(user:, audio_file:)
    @user = user
    @audio_file = audio_file
  end

  def process
    start_time = Time.current
    audio_size = @audio_file.size

    log_info("voice_command_started", {
      user_id: @user.id,
      audio_size_bytes: audio_size
    })

    # Get current todos context
    service = TodoService.new(@user.todos.active, user: @user)
    todos_context = service.list_for_context
    todo_count = todos_context.values.flatten.size

    # Initialize chat with Gemini Flash
    chat = RubyLLM.chat(model: "gemini-2.0-flash")

    # Add tools
    chat
      .with_tool(CreateTodoTool.new)
      .with_tool(BulkCreateTodosTool.new)
      .with_tool(ReorderTodosTool.new)
      .with_tool(MoveTodoTool.new)
      .with_tool(BulkMoveTodosTool.new)

    # Build the full prompt with current todos
    full_prompt = build_prompt_with_context(todos_context)

    log_info("gemini_request_sent", {
      user_id: @user.id,
      model: "gemini-2.0-flash",
      todo_count: todo_count,
      prompt_length: full_prompt.length
    })

    api_start = Time.current
    response = chat.ask(
      full_prompt,
      with: @audio_file.path
    )
    api_duration = ((Time.current - api_start) * 1000).round

    log_info("gemini_response_received", {
      user_id: @user.id,
      duration_ms: api_duration
    })

    # Extract text content from RubyLLM::Message object
    message_text = if response.respond_to?(:content)
      response.content
    elsif response.respond_to?(:text)
      response.text
    else
      response.to_s
    end

    total_duration = ((Time.current - start_time) * 1000).round

    log_info("voice_command_completed", {
      user_id: @user.id,
      success: true,
      total_duration_ms: total_duration,
      api_duration_ms: api_duration
    })

    {
      success: true,
      message: message_text,
      timestamp: Time.current
    }
  rescue => e
    total_duration = ((Time.current - start_time) * 1000).round

    log_error("voice_command_failed", {
      user_id: @user.id,
      error_class: e.class.name,
      error_message: e.message,
      total_duration_ms: total_duration
    })

    Rails.logger.error(e.backtrace.join("\n"))

    {
      success: false,
      message: "Sorry, I couldn't process that command. Please try again.",
      error: e.message
    }
  end

  private

  def log_info(event, data = {})
    Rails.logger.info("[VoiceCommand] #{event} #{data.to_json}")
  end

  def log_error(event, data = {})
    Rails.logger.error("[VoiceCommand] #{event} #{data.to_json}")
  end

  def build_prompt_with_context(todos_context)
    todos_json = JSON.pretty_generate(todos_context)

    <<~PROMPT
      You are a voice-controlled todo list assistant. The user will give you voice commands to manage their todos.

      Todos are organized into 4 priority windows:
      - today: Tasks for today
      - tomorrow: Tasks for tomorrow
      - this_week: Tasks for this week
      - next_week: Tasks for next week

      CURRENT TODOS (grouped by priority window with IDs and positions):
      #{todos_json}

      Available tools:
      1. create_todo - Create a single todo with title, priority window, and optional position
      2. bulk_create_todos - Create multiple todos at once
      3. reorder_todos - Reorder all todos within a priority window by providing the complete ordered list of IDs
      4. move_todo - Move a single todo to a different priority window (requires todo_id)
      5. bulk_move_todos - Move multiple todos to a different priority window at once (requires todo_ids array)

      CRITICAL RULES:
      - You MUST use the tools to make changes - NEVER just respond with text
      - Do NOT say you did something unless you actually called the tool
      - ALWAYS call the appropriate tool before responding
      - If you need to create a todo, call create_todo or bulk_create_todos
      - If you need to move a todo, call move_todo or bulk_move_todos
      - If you need to reorder todos, call reorder_todos

      When the user refers to a todo by title (e.g., "move walk the dogs to today"), you MUST:
      1. Look up the todo in the CURRENT TODOS list above to find its ID
      2. Use that ID in the tool call

      Examples:
      - "Tomorrow I need to walk the dogs and buy groceries" → CALL bulk_create_todos with 2 todos for tomorrow
      - "Move walk the dogs to today" → Find "walk the dogs" ID in the list above, then CALL move_todo with that ID
      - "Put buy groceries first tomorrow" → Find all todo IDs for tomorrow, CALL reorder_todos with buy groceries ID first

      RESPONSE GUIDELINES (after calling the tool):
      - Keep responses brief and conversational
      - Do NOT mention IDs, positions, or other technical details
      - Simply confirm what action was taken in natural language
      - Good: "Added 'read for 30 minutes' to today."
      - Bad: "Added 'read for 30 minutes' to today at position 10. Its ID is 25."
      - Good: "Moved 'walk the dogs' to tomorrow."
      - Bad: "Moved todo ID 15 to tomorrow at position 3."

      Process the audio command and CALL the appropriate tool(s) to fulfill the user's request.
    PROMPT
  end
end
