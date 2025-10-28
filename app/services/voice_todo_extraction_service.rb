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

    # Configure chat with Gemini 2.5 Flash and TodoExtractor tool
    chat = RubyLLM.chat(
      model: "google/gemini-2.5-flash",
      provider: "openrouter"
    ).with_tool(TodoExtractor)

    # Send audio with extraction prompt
    response = chat.ask(
      extraction_prompt,
      with: {
        type: "input_audio",
        input_audio: {
          data: audio_data,
          format: audio_format
        }
      }
    )

    # Parse the structured response
    parse_response(response)
  rescue StandardError => e
    Rails.logger.error("Voice todo extraction failed: #{e.message}")
    raise ExtractionError, "Failed to extract todos from audio: #{e.message}"
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
    # The tool response should contain structured todo data
    content = response.content

    if content.is_a?(String)
      parsed = JSON.parse(content)
    elsif content.respond_to?(:to_h)
      parsed = content.to_h
    else
      parsed = content
    end

    # Extract todos array from response
    todos = parsed["todos"] || parsed[:todos] || []

    # Ensure todos is an array
    todos = [ todos ] unless todos.is_a?(Array)

    # Transform and validate each todo
    todos.map { |todo| transform_todo(todo) }.compact
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

  param :todos,
        type: :array,
        description: "List of extracted todo items from the voice recording",
        items: {
          type: :object,
          properties: {
            title: {
              type: :string,
              description: "The main task or action to be done (concise but clear)"
            },
            priority: {
              type: :string,
              enum: %w[low medium high],
              description: "Priority level inferred from language (urgent/ASAP = high, when you can = low)"
            },
            deadline: {
              type: :string,
              format: :date,
              description: "Due date if mentioned (parse natural language like 'tomorrow', 'next Friday')"
            },
            description: {
              type: :string,
              description: "Additional context or details about the task"
            }
          },
          required: [ :title ]
        }

  def call(todos:)
    # The tool just validates and returns the structured data
    # The actual extraction is done by the AI model
    { todos: todos }
  end
end
