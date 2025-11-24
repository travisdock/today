# frozen_string_literal: true

# Action Cable channel for streaming audio to Gemini Live API
# Handles bidirectional communication between browser and Gemini
class GeminiLiveChannel < ApplicationCable::Channel
  def subscribed
    # Verify user has streaming voice enabled
    unless current_user&.streaming_voice_enabled?
      Rails.logger.warn("[GeminiLiveChannel] User #{current_user&.id} rejected - streaming voice not enabled")
      reject
      return
    end

    Rails.logger.info("[GeminiLiveChannel] User #{current_user.id} subscribed - creating Gemini client")

    # Create and connect to Gemini WebSocket
    begin
      @gemini_client = GeminiWebsocketClient.new(user: current_user, channel: self)
      Rails.logger.info("[GeminiLiveChannel] Gemini client created, connecting...")
      @gemini_client.connect
      Rails.logger.info("[GeminiLiveChannel] Gemini client connect method called")
    rescue => e
      Rails.logger.error("[GeminiLiveChannel] Failed to create/connect Gemini client: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      reject
      return
    end
  end

  def unsubscribed
    Rails.logger.info("[GeminiLiveChannel] User #{current_user&.id} unsubscribed")
    @gemini_client&.disconnect
    @gemini_client = nil
  end

  # Receive audio data from browser and forward to Gemini
  def receive_audio(data)
    base64_pcm = data["audio"]
    if @gemini_client
      @audio_chunks_count ||= 0
      @audio_chunks_count += 1
      @gemini_client.send_audio(base64_pcm)
    else
      # Only log once per session to avoid clutter
      unless @warned_no_client
        Rails.logger.warn("[GeminiLiveChannel] Received audio but no Gemini client exists")
        @warned_no_client = true
      end
    end
  end

  # Signal end of audio stream
  def stop_recording(data)
    chunks = @audio_chunks_count || 0
    Rails.logger.info("[GeminiLiveChannel] Stop recording received (sent #{chunks} audio chunks)")
    @audio_chunks_count = 0

    if @gemini_client
      @gemini_client.send_audio_stream_end
    else
      Rails.logger.warn("[GeminiLiveChannel] Stop recording but no Gemini client exists")
    end
  end

  # Handle events from GeminiWebsocketClient
  def handle_gemini_event(event, data = {})
    Rails.logger.info("[GeminiLiveChannel] Received event: #{event} with data: #{data.inspect}")
    case event
    when :ready
      Rails.logger.info("[GeminiLiveChannel] Sending ready to client")
      transmit({ type: "ready" })
    when :turn_complete
      Rails.logger.info("[GeminiLiveChannel] Sending turn_complete to client")
      transmit({ type: "turn_complete" })
    when :todos_created
      Rails.logger.info("[GeminiLiveChannel] Sending Turbo Stream for todos_created")
      # Send Turbo Stream to update UI
      send_todos_turbo_stream(data[:priority_window])
    when :closed
      Rails.logger.info("[GeminiLiveChannel] Sending closed to client")
      transmit({ type: "closed" })
    when :error
      Rails.logger.error("[GeminiLiveChannel] Sending error to client: #{data[:message]}")
      transmit({ type: "error", message: data[:message] })
    else
      Rails.logger.warn("[GeminiLiveChannel] Unknown event: #{event}")
    end
  end

  private

  def send_todos_turbo_stream(priority_window)
    # Render and broadcast Turbo Stream to update the UI
    todos = current_user.todos.active.where(priority_window: priority_window)

    # Build Turbo Stream HTML manually
    partial_html = ApplicationController.render(
      partial: "todos/priority_window_container",
      locals: {
        window: priority_window.to_sym,
        todos: todos
      }
    )

    # Create Turbo Stream replace action
    turbo_stream_html = <<~HTML
      <turbo-stream action="replace" target="#{priority_window}_list_container">
        <template>
          #{partial_html}
        </template>
      </turbo-stream>
    HTML

    # Send Turbo Stream via Action Cable
    transmit({
      type: "turbo_stream",
      html: turbo_stream_html
    })
  end
end
