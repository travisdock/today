# frozen_string_literal: true

# Service to extract todo items from voice recordings using AI
# Uses Gemini 2.5 Flash via OpenRouter for simultaneous transcription and extraction
class VoiceTodoExtractionService
  class ExtractionError < StandardError; end

  # Extract todos from an audio blob
  # @param audio_blob [ActiveStorage::Blob] The audio recording to process
  # @return [Array<Hash>] Array of todo data hashes
  # @raise [ExtractionError] If audio processing fails
  def self.call(audio_blob)
    new(audio_blob).call
  end

  def initialize(audio_blob)
    @audio_blob = audio_blob
  end

  def call
    validate_audio!

    # Convert audio to base64 for API
    audio_data = Base64.strict_encode64(@audio_blob.download)

    # Call OpenRouter API directly since ruby_llm doesn't support audio input yet
    response = call_openrouter_api(audio_data)

    # Parse the structured response
    parse_response(response)
  rescue StandardError => e
    Rails.logger.error("Voice todo extraction failed: #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
    raise ExtractionError, "Failed to extract todos from audio: #{e.message}"
  end

  def call_openrouter_api(audio_data)
    require "net/http"
    require "json"

    uri = URI("https://openrouter.ai/api/v1/chat/completions")
    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{Rails.application.credentials.dig(:openrouter, :api_key)}"
    request["Content-Type"] = "application/json"
    request["HTTP-Referer"] = "https://github.com/travisdock/today" # Optional, for rankings
    request["X-Title"] = "Today - Voice Todos" # Optional, shows in rankings

    request.body = {
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: extraction_prompt
            },
            {
              type: "input_audio",
              input_audio: {
                data: audio_data,
                format: audio_format
              }
            }
          ]
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "extract_todos",
            description: "Extract todo items from transcribed speech",
            parameters: TodoExtractor.parameters
          }
        }
      ],
      tool_choice: {
        type: "function",
        function: { name: "extract_todos" }
      }
    }.to_json

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise ExtractionError, "API request failed: #{response.code} #{response.body}"
    end

    JSON.parse(response.body)
  end

  private

  def validate_audio!
    unless @audio_blob.present?
      raise ExtractionError, "No audio blob provided"
    end

    unless @audio_blob.byte_size > 0
      raise ExtractionError, "Audio blob is empty"
    end

    unless @audio_blob.byte_size <= 25.megabytes
      raise ExtractionError, "Audio file too large (max 25MB)"
    end

    unless valid_audio_content_type?
      raise ExtractionError, "Invalid audio format. Supported: webm, mp3, m4a, wav"
    end
  end

  def valid_audio_content_type?
    valid_types = %w[
      audio/webm
      audio/mpeg
      audio/mp3
      audio/mp4
      audio/m4a
      audio/wav
      audio/x-wav
      audio/ogg
    ]
    valid_types.include?(@audio_blob.content_type)
  end

  def audio_format
    # Map Rails content types to API format strings
    case @audio_blob.content_type
    when "audio/webm" then "webm"
    when "audio/mpeg", "audio/mp3" then "mp3"
    when "audio/mp4", "audio/m4a" then "m4a"
    when "audio/wav", "audio/x-wav" then "wav"
    when "audio/ogg" then "ogg"
    else "webm" # default
    end
  end

  def extraction_prompt
    <<~PROMPT
      Transcribe this audio recording and extract all todo items mentioned.

      The user is recording tasks they want to add to their todo list.
      Listen carefully and identify each distinct task, action item, or reminder.

      For each todo item, determine:
      - The main task (title) - be concise but clear
      - Priority level (high/medium/low) - infer from urgency words like "urgent", "ASAP", "when you can"
      - Deadline if mentioned - parse natural language dates like "tomorrow", "next Friday", "by end of month"
      - Additional description or context if provided

      If the user mentions multiple todos, extract them all as separate items.
      If no clear todos are mentioned, return an empty list.

      Use the TodoExtractor tool to return structured data.
    PROMPT
  end

  def parse_response(response)
    # Extract tool call from OpenRouter API response
    choices = response["choices"]
    return [] if choices.blank?

    message = choices.first["message"]
    tool_calls = message["tool_calls"]
    return [] if tool_calls.blank?

    # Get the function arguments (which contain our todos)
    function_args = JSON.parse(tool_calls.first["function"]["arguments"])
    todos = function_args["todos"] || []

    # Ensure todos is an array
    todos = [ todos ] unless todos.is_a?(Array)

    # Transform and validate each todo
    todos.map { |todo| transform_todo(todo) }.compact
  rescue StandardError => e
    Rails.logger.error("Failed to parse response: #{e.message}")
    Rails.logger.error("Response: #{response.inspect}")
    []
  end

  def transform_todo(todo_data)
    # Ensure we have at least a title
    title = todo_data["title"] || todo_data[:title]
    return nil if title.blank?

    {
      title: title.strip,
      priority: normalize_priority(todo_data["priority"] || todo_data[:priority]),
      deadline: parse_deadline(todo_data["deadline"] || todo_data[:deadline]),
      description: (todo_data["description"] || todo_data[:description])&.strip
    }.compact
  end

  def normalize_priority(priority)
    return "medium" if priority.blank?

    priority_str = priority.to_s.downcase
    case priority_str
    when "high", "urgent", "critical" then "high"
    when "low", "optional", "someday" then "low"
    else "medium"
    end
  end

  def parse_deadline(deadline_str)
    return nil if deadline_str.blank?

    # If it's already a date, return it
    return deadline_str if deadline_str.is_a?(Date)

    # Try parsing natural language dates
    parsed = Chronic.parse(deadline_str) if defined?(Chronic)
    parsed ||= Date.parse(deadline_str) rescue nil

    parsed&.to_date
  rescue StandardError
    nil
  end
end

# Tool definition for structured todo extraction
# This defines the schema that Gemini will use to return structured data
class TodoExtractor < RubyLLM::Tool
  description "Extract todo items from transcribed speech with priorities and deadlines"

  # Define the schema using JSON Schema format directly
  def self.parameters
    {
      type: "object",
      properties: {
        todos: {
          type: "array",
          description: "List of extracted todo items from the voice recording",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "The main task or action to be done (concise but clear)"
              },
              priority: {
                type: "string",
                enum: [ "low", "medium", "high" ],
                description: "Priority level inferred from language (urgent/ASAP = high, when you can = low)"
              },
              deadline: {
                type: "string",
                description: "Due date if mentioned (parse natural language like 'tomorrow', 'next Friday')"
              },
              description: {
                type: "string",
                description: "Additional context or details about the task"
              }
            },
            required: [ "title" ]
          }
        }
      },
      required: [ "todos" ]
    }
  end

  def call(todos:)
    # The tool just validates and returns the structured data
    # The actual extraction is done by the AI model
    { todos: todos }
  end
end
