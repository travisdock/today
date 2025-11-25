# Action Cable channel for streaming audio to Gemini Live API
require "base64"

class GeminiStreamingChannel < ApplicationCable::Channel
  def subscribed
    Rails.logger.info("[GeminiStreamingChannel] Client subscribed")

    # Create and connect to Gemini WebSocket
    @gemini_service = GeminiStreamingService.new(user: current_user)
    @gemini_service.on_todo do |todo|
      Rails.logger.info("[GeminiStreamingChannel] Todo extracted: #{todo.title}")
      send_turbo_stream_update(todo)
    end
    @gemini_service.connect

    stream_from "gemini_streaming_#{connection.connection_identifier}"
  end

  def unsubscribed
    Rails.logger.info("[GeminiStreamingChannel] Client unsubscribed")
    @gemini_service&.close
    @gemini_service = nil
  end

  # Receive audio data from browser
  def receive_audio(data)
    base64_audio = data["audio"]
    if @gemini_service
      # Decode base64 PCM audio from frontend
      pcm_data = Base64.decode64(base64_audio)
      @gemini_service.send_audio_chunk(pcm_data)
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

  def send_turbo_stream_update(todo)
    html = ApplicationController.render(
      partial: "todos/streaming_update",
      formats: [ :turbo_stream ],
      locals: { todo: todo, user: current_user }
    )

    transmit({
      type: "turbo_stream_html",
      html: html
    })
  end
end
