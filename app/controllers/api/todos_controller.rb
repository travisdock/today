# frozen_string_literal: true

module Api
  class TodosController < ApplicationController
    RATE_LIMIT_MAX_REQUESTS = 20
    RATE_LIMIT_WINDOW = 1.minute
    MAX_BULK_CREATE_SIZE = 50
    MAX_ITEM_LENGTH = 500

    before_action :check_rate_limit

    # POST /api/todos
    # Creates todos from streaming voice command tool calls
    def create
      user = Current.user

      unless user&.streaming_voice_enabled?
        render json: { error: "Streaming voice is not enabled for your account." }, status: :forbidden
        return
      end

      items = params[:items]
      priority_window = params[:priority_window]

      unless items.is_a?(Array) && items.present?
        render json: { error: "Items must be a non-empty array" }, status: :unprocessable_entity
        return
      end

      if items.size > MAX_BULK_CREATE_SIZE
        render json: { error: "Maximum #{MAX_BULK_CREATE_SIZE} items allowed" }, status: :unprocessable_entity
        return
      end

      if items.any? { |item| item.to_s.length > MAX_ITEM_LENGTH }
        render json: { error: "Item too long (max #{MAX_ITEM_LENGTH} characters)" }, status: :unprocessable_entity
        return
      end

      unless Todo.priority_windows.keys.include?(priority_window)
        render json: { error: "Invalid priority window" }, status: :unprocessable_entity
        return
      end

      begin
        service = TodoService.new(user.todos, user: user)
        todos_data = items.map { |title| { title: title, priority_window: priority_window } }
        todos = service.bulk_create_todos!(todos: todos_data)

        respond_to do |format|
          format.turbo_stream do
            # Replace the entire priority window container (includes all todos, count, etc.)
            # This ensures DOM structure matches what the main TodosController renders
            render turbo_stream: turbo_stream.replace(
              "#{priority_window}_list_container",
              partial: "todos/priority_window_container",
              locals: {
                window: priority_window.to_sym,
                todos: user.todos.active.where(priority_window: priority_window)
              }
            )
          end
          format.json { render json: { todos: todos.map { |t| { id: t.id, title: t.title } } }, status: :created }
        end
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message }, status: :unprocessable_entity
      rescue ActiveRecord::RecordNotUnique => e
        Rails.logger.error("Position conflict: #{e.message}\n#{e.backtrace.first(5).join("\n")}")
        render json: { error: "Conflict detected. Please retry." }, status: :conflict
      rescue StandardError => e
        Rails.logger.error("Unexpected error: #{e.class} - #{e.message}\n#{e.backtrace.first(10).join("\n")}")
        render json: { error: "Failed to create todos. Please try again." }, status: :internal_server_error
      end
    end

    private

    def check_rate_limit
      key = "todos:rate:#{Current.user.id}"
      current = Rails.cache.increment(key, 1, expires_in: RATE_LIMIT_WINDOW)
      unless current
        Rails.cache.write(key, 1, expires_in: RATE_LIMIT_WINDOW)
        current = 1
      end

      if current > RATE_LIMIT_MAX_REQUESTS
        render json: { error: "Rate limit exceeded. Please try again later." }, status: :too_many_requests
      end
    end
  end
end
