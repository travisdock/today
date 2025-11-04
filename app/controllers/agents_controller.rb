class AgentsController < ApplicationController
  def create
    user = Current.user

    unless user&.voice_agent_enabled?
      respond_to_failure(:forbidden, "Voice control is not enabled for your account.")
      return
    end

    audio = params[:audio]

    unless audio.respond_to?(:tempfile)
      respond_to_failure(:unprocessable_entity, "No audio file detected.")
      return
    end

    unless audio_upload_allowed?(audio)
      respond_to_failure(:unprocessable_entity, "Unsupported audio file.")
      return
    end

    if audio_upload_too_large?(audio)
      respond_to_failure(:unprocessable_entity, "Audio file must be 5 MB or smaller.")
      return
    end

    if rate_limit_exceeded?(user)
      respond_to_failure(:too_many_requests, "Voice commands are limited to five per minute.")
      return
    end

    if openrouter_api_key.blank?
      Rails.logger.error("OpenRouter API key missing")
      respond_to_failure(:service_unavailable, "Transcription service unavailable right now.")
      return
    end

    transcriber = OpenRouter::Transcribe.new(audio.tempfile.path)
    transcription = transcriber.transcription

    if transcription.blank?
      respond_to_failure(:bad_gateway, "Unable to transcribe audio.")
      return
    end

    OpenRouter::Agent.new.run(instructions: transcription, user: user)

    respond_to do |format|
      format.turbo_stream do
        streams = [
          turbo_stream.update("audio_recorder_status", ERB::Util.html_escape("Tap to record again."))
        ]

        # Replace all priority window containers
        Todo::PRIORITY_WINDOWS.each do |window|
          window_todos = user.todos.active.where(priority_window: window).order(:position)
          streams << turbo_stream.replace("#{window}_list_container",
            partial: "todos/priority_window_container",
            locals: { window: window, todos: window_todos })
        end

        render turbo_stream: streams
      end
    end
  rescue StandardError => error
    Rails.logger.error("OpenRouter transcription failed: #{error.message}")
    respond_to_failure(:bad_gateway, "Service failed.")
    end

  private
    MAX_AUDIO_BYTES = 5.megabytes
    RATE_LIMIT_MAX_REQUESTS = 5
    RATE_LIMIT_WINDOW = 1.minute

    def respond_to_failure(status, message)
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.update("audio_recorder_status", ERB::Util.html_escape(message)), status: status
        end
        format.html do
          redirect_to todos_path, alert: message
        end
        format.json { head status }
      end
    end

    def openrouter_api_key
      Rails.application.credentials.dig(:openrouter, :api_key)
    end

    def audio_upload_allowed?(upload)
      content_type = upload.content_type.to_s
      content_type.start_with?("audio/")
    end

    def audio_upload_too_large?(upload)
      upload.size.to_i > MAX_AUDIO_BYTES
    end

    def rate_limit_exceeded?(user)
      return false unless user

      key = "voice_agent:rate:#{user.id}"
      current = Rails.cache.increment(key, 1, expires_in: RATE_LIMIT_WINDOW)
      unless current
        Rails.cache.write(key, 1, expires_in: RATE_LIMIT_WINDOW)
        current = 1
      end
      current > RATE_LIMIT_MAX_REQUESTS
    end
end
