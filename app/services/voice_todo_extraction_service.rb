# frozen_string_literal: true

require "tempfile"

class VoiceTodoExtractionService
  Result = Struct.new(:todos, :transcript, :error, keyword_init: true) do
    def success?
      error.blank?
    end
  end

  MAX_AUDIO_BYTES = 25.megabytes
  MODEL = "google/gemini-2.5-flash"

  SUPPORTED_FORMATS = {
    "audio/webm" => "webm",
    "audio/webm;codecs=opus" => "webm",
    "audio/ogg" => "ogg",
    "audio/ogg;codecs=opus" => "ogg",
    "audio/mpeg" => "mp3",
    "audio/mp3" => "mp3",
    "audio/wav" => "wav",
    "audio/x-wav" => "wav",
    "audio/m4a" => "m4a",
    "audio/aac" => "aac"
  }.freeze

  EXTENSION_FORMATS = {
    "webm" => "webm",
    "ogg" => "ogg",
    "mp3" => "mp3",
    "m4a" => "m4a",
    "aac" => "aac",
    "wav" => "wav"
  }.freeze

  class << self
    def extract(audio_file)
      new(audio_file).extract
    end
  end

  def initialize(audio_file)
    @audio_file = audio_file
  end

  def extract
    return failure("Add a recording to continue.") unless audio_present?
    return failure("Recordings must be 25 MB or smaller.") if byte_size > MAX_AUDIO_BYTES

    format = detect_format
    return failure("This audio format is not supported yet.") if format.nil?

    return failure("Voice capture is not configured.") if RubyLLM.config.openrouter_api_key.blank?

    response = request_transcription(format)
    log_model_response(response)
    parsed_response = parse_response(response)
    transcript = fetch_value(parsed_response, "transcript")
    Rails.logger.info("[VoiceTodoExtractionService] Transcript: #{transcript.inspect}") if transcript.present?
    todos = normalize_todos(parsed_response)
    Rails.logger.info("[VoiceTodoExtractionService] Parsed todos: #{todos.inspect}")

    return failure("We couldn't hear any todos in that recording.") if todos.empty?

    Result.new(todos:, transcript:)
  rescue RubyLLM::ConfigurationError => error
    Rails.logger.error("[VoiceTodoExtractionService] Configuration error: #{error.message}")
    failure("Voice capture is not configured.")
  rescue RubyLLM::RateLimitError, RubyLLM::ServiceUnavailableError, RubyLLM::OverloadedError => error
    Rails.logger.warn("[VoiceTodoExtractionService] Temporary provider issue: #{error.message}")
    failure("Voice service is busy. Please try again.")
  rescue RubyLLM::Error => error
    Rails.logger.error("[VoiceTodoExtractionService] Provider error: #{error.message}")
    failure("Voice processing failed. Please try again.")
  rescue StandardError => error
    Rails.logger.error("[VoiceTodoExtractionService] Unexpected error: #{error.class} #{error.message}")
    failure("We hit a snag processing that recording.")
  ensure
    audio_io&.rewind if audio_io.respond_to?(:rewind)
    normalized_tempfile&.close!
  end

  private

  attr_reader :audio_file, :normalized_tempfile

  def audio_present?
    audio_file.respond_to?(:read) || audio_file.respond_to?(:tempfile)
  end

  def byte_size
    return audio_file.byte_size if audio_file.respond_to?(:byte_size)
    return audio_file.size if audio_file.respond_to?(:size)

    io = audio_io
    return io.size if io.respond_to?(:size)
    return io.string.bytesize if io.respond_to?(:string)

    0
  end

  def detect_format
    content_type = audio_file.content_type if audio_file.respond_to?(:content_type)
    return SUPPORTED_FORMATS[content_type] if content_type && SUPPORTED_FORMATS.key?(content_type)

    filename = if audio_file.respond_to?(:original_filename)
                 audio_file.original_filename
               elsif audio_file.respond_to?(:path)
                 audio_file.path
               end
    return unless filename

    extension = File.extname(filename).delete_prefix(".").downcase
    EXTENSION_FORMATS[extension]
  end

  def chat
    RubyLLM.chat(model: MODEL, provider: "openrouter").with_instructions(system_prompt).with_schema(response_schema)
  end

  def request_transcription(format)
    io = normalized_audio_io(format)
    source = io.respond_to?(:path) ? io.path : io
    chat.ask("Transcribe this audio and extract todo items.", with: source).content
  end

  def audio_io
    return audio_file.tempfile if audio_file.respond_to?(:tempfile)
    return audio_file if audio_file.respond_to?(:read)

    nil
  end

  def normalized_audio_io(format)
    io = audio_io
    return io unless io.respond_to?(:path)

    path = io.path.to_s
    return io if File.extname(path).delete_prefix(".").casecmp?(format)

    tempfile = Tempfile.new(["voice-note", ".#{format}"])
    tempfile.binmode

    if io.respond_to?(:rewind)
      io.rewind
    end

    IO.copy_stream(io, tempfile)
    tempfile.rewind
    io.rewind if io.respond_to?(:rewind)

    @normalized_tempfile = tempfile
    tempfile
  end

  def log_model_response(response)
    preview = if response.is_a?(String)
                response.strip.gsub(/\s+/, " ")[0, 500]
              else
                response.inspect
              end

    Rails.logger.info("[VoiceTodoExtractionService] Model response preview: #{preview}")
  end

  def normalize_todos(parsed_response)
    todos = parsed_response.is_a?(Hash) ? parsed_response["todos"] || parsed_response[:todos] : []
    Array(todos).filter_map do |todo|
      title = fetch_value(todo, "title")
      next if title.blank?

      {
        title: title.to_s.strip,
        notes: fetch_value(todo, "notes"),
        priority: fetch_value(todo, "priority"),
        due_date: fetch_value(todo, "due_date")
      }
    end
  rescue JSON::ParserError => error
    Rails.logger.error("[VoiceTodoExtractionService] Failed to parse response: #{error.message}")
    []
  end

  def parse_response(response_content)
    raw = response_content

    if raw.is_a?(String)
      raw = raw.strip
      raw = raw.gsub(/\A```json|```\z/, "")
      raw = JSON.parse(raw)
    end

    raw.is_a?(Hash) ? raw : {}
  rescue JSON::ParserError => error
    Rails.logger.error("[VoiceTodoExtractionService] Failed to parse response: #{error.message}")
    {}
  end

  def fetch_value(hash, key)
    return unless hash.respond_to?(:[])

    hash[key] || hash[key.to_sym]
  end

  def system_prompt
    <<~PROMPT
      You are helping users capture todos from a short voice note. Listen carefully to the recording, transcribe it, and extract each actionable task you hear.

      Return a JSON object that matches the given schema. Each todo title must be concise (under 255 characters) and describe a single action.
      Always include the full transcript string, even if no actionable todos are identified. If the speaker does not mention any actionable tasks, return an empty array in the JSON response.
    PROMPT
  end

  def response_schema
    {
      type: "object",
      additionalProperties: false,
      properties: {
        transcript: {
          type: "string",
          description: "Full transcription of the audio in English."
        },
        todos: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: %w[title],
            properties: {
              title: {
                type: "string",
                minLength: 1,
                maxLength: 255
              },
              notes: {
                type: %w[string null]
              },
              priority: {
                type: %w[string null],
                enum: [nil, "low", "medium", "high"]
              },
              due_date: {
                type: %w[string null],
                description: "ISO8601 date (YYYY-MM-DD) if a due date is mentioned"
              }
            }
          }
        }
      },
      required: %w[transcript todos]
    }
  end

  def failure(message)
    Result.new(error: message)
  end
end
