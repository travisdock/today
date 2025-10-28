# frozen_string_literal: true

# Background job to process voice recordings and create todos
# Uses VoiceTodoExtractionService to transcribe and extract todos from audio
class ProcessVoiceRecordingJob < ApplicationJob
  queue_as :default

  # Maximum retries for transient failures
  retry_on VoiceTodoExtractionService::ExtractionError, wait: :polynomially_longer, attempts: 3
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(blob_id, user_id)
    # Find the audio blob and user
    blob = ActiveStorage::Blob.find(blob_id)
    user = User.find(user_id)

    # Extract todos from the audio
    extracted_todos = VoiceTodoExtractionService.call(blob)

    # Create Todo records for each extracted todo
    created_todos = []
    extracted_todos.each do |todo_data|
      todo = user.todos.create!(
        title: todo_data[:title],
        # Note: Current Todo model only has title field
        # Priority, deadline, and description would need to be added later
        # For now, we'll just use the title
      )
      created_todos << todo
    end

    # Broadcast success via Turbo Streams
    broadcast_success(user, created_todos)

    # Clean up the temporary audio blob
    blob.purge_later

    Rails.logger.info("Voice recording processed: #{created_todos.size} todos created for user #{user.id}")
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.error("Voice recording job failed - record not found: #{e.message}")
    # Don't retry if blob or user is missing
    raise
  rescue VoiceTodoExtractionService::ExtractionError => e
    Rails.logger.error("Voice extraction failed: #{e.message}")
    # Broadcast error to user
    broadcast_error(user_id, "Could not understand audio recording. Please try again.")
    # Clean up blob on final failure
    ActiveStorage::Blob.find_by(id: blob_id)&.purge_later if executions >= self.class.retry_limit
    raise
  rescue StandardError => e
    Rails.logger.error("Voice recording job failed: #{e.class} - #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
    # Broadcast generic error to user
    broadcast_error(user_id, "Failed to process voice recording. Please try again.")
    # Clean up blob on final failure
    ActiveStorage::Blob.find_by(id: blob_id)&.purge_later if executions >= self.class.retry_limit
    raise
  end

  private

  def broadcast_success(user, todos)
    # Broadcast via Turbo Streams to update the UI in real-time
    # This will append new todos to the active list
    Turbo::StreamsChannel.broadcast_update_to(
      "user_#{user.id}_todos",
      target: "voice_recording_status",
      partial: "todos/voice_status",
      locals: {
        status: "success",
        message: "Added #{todos.size} #{'todo'.pluralize(todos.size)} from voice recording",
        todos: todos
      }
    )

    # Broadcast each new todo to append to the list
    todos.each do |todo|
      Turbo::StreamsChannel.broadcast_append_to(
        "user_#{user.id}_todos",
        target: "active_todo_items",
        partial: "todos/todo",
        locals: { todo: todo, section: :active }
      )
    end
  end

  def broadcast_error(user_id, message)
    user = User.find_by(id: user_id)
    return unless user

    Turbo::StreamsChannel.broadcast_update_to(
      "user_#{user_id}_todos",
      target: "voice_recording_status",
      partial: "todos/voice_status",
      locals: {
        status: "error",
        message: message,
        todos: []
      }
    )
  rescue StandardError => e
    Rails.logger.error("Failed to broadcast error: #{e.message}")
  end

  def self.retry_limit
    3
  end
end
