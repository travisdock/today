# Action Cable channel for streaming audio to Gemini Live API
require "base64"

class GeminiStreamingChannel < ApplicationCable::Channel
  def subscribed
    # Check authorization
    unless current_user&.voice_agent_enabled?
      Rails.logger.warn("[GeminiStreamingChannel] User #{current_user&.id} not authorized")
      reject
      return
    end

    # Only allow one connection per user
    connection_key = "streaming:active:#{current_user.id}"
    if Rails.cache.read(connection_key).present?
      Rails.logger.warn("[GeminiStreamingChannel] User #{current_user.id} already has active connection")
      transmit({
        type: "error",
        message: "You already have an active streaming session. Please close it first."
      })
      reject
      return
    end

    # Claim the connection slot
    Rails.cache.write(connection_key, true, expires_in: 5.minutes)

    Rails.logger.info("[GeminiStreamingChannel] Client subscribed")

    # Create and connect to Gemini WebSocket
    @gemini_service = GeminiStreamingService.new(user: current_user)
    @gemini_service.on_todo do |todo, old_priority_window = nil|
      Rails.logger.info("[GeminiStreamingChannel] Todo extracted: #{todo.title}")
      send_turbo_stream_update(todo, old_priority_window)
    end
    @gemini_service.connect
  end

  def unsubscribed
    Rails.logger.info("[GeminiStreamingChannel] Client unsubscribed")

    # Release the connection slot
    connection_key = "streaming:active:#{current_user.id}"
    Rails.cache.delete(connection_key)

    @gemini_service&.close
    @gemini_service = nil
  end

  # Receive audio data from browser
  def receive_audio(data)
    return unless data.is_a?(Hash)
    base64_audio = data["audio"]
    return unless base64_audio.is_a?(String)

    # Validate size (max 64KB base64 = ~48KB audio)
    if base64_audio.bytesize > 65536
      Rails.logger.warn("[GeminiStreamingChannel] Audio chunk too large: #{base64_audio.bytesize}")
      transmit({ type: "error", message: "Audio chunk too large" })
      return
    end

    if @gemini_service
      begin
        # Decode base64 PCM audio from frontend
        pcm_data = Base64.strict_decode64(base64_audio)
        @gemini_service.send_audio_chunk(pcm_data)
      rescue ArgumentError => e
        Rails.logger.warn("[GeminiStreamingChannel] Invalid base64 audio: #{e.message}")
      end
    end
  end

  # Signal end of recording
  def stop_recording(data)
    Rails.logger.info("[GeminiStreamingChannel] Stop recording received")

    # Send completion
    todo_count = @gemini_service&.extracted_todos&.length || 0
    transmit({
      type: "complete",
      message: "Extracted #{todo_count} todos"
    })

    Rails.logger.info("[GeminiStreamingChannel] ✅ Stream completed. Total todos: #{todo_count}")
  end

  private

  def send_turbo_stream_update(todo, old_priority_window = nil)
    html = ApplicationController.render(
      partial: "todos/streaming_update",
      formats: [ :turbo_stream ],
      locals: { todo: todo, user: current_user, old_priority_window: old_priority_window }
    )

    transmit({
      type: "turbo_stream_html",
      html: html
    })
  end
end
