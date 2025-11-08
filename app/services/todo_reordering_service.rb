# frozen_string_literal: true

# Unified service for reordering todos within a priority window.
# Handles both drag-and-drop UI reordering and OpenRouter API reordering.
#
# Usage:
#   # From controller (drag-and-drop):
#   TodoReorderingService.new(user).reorder!(
#     ordered_ids: [3, 1, 2],
#     priority_window: :today
#   )
#
#   # From OpenRouter API:
#   TodoReorderingService.new(user).reorder!(
#     ordered_ids: params[:ordered_ids],
#     priority_window: params[:priority_window]
#   )
#
class TodoReorderingService
  class Error < StandardError; end
  class InvalidWindowError < Error; end
  class InvalidIdsError < Error; end
  class PartialReorderError < Error; end

  MAX_RETRIES = 3

  def initialize(user)
    @user = user
  end

  # Reorders todos within a priority window to match the provided order.
  #
  # @param ordered_ids [Array<Integer>] IDs in desired order
  # @param priority_window [String, Symbol] The priority window to reorder
  # @return [void]
  # @raise [InvalidWindowError] if priority window is invalid
  # @raise [InvalidIdsError] if IDs are invalid
  # @raise [PartialReorderError] if IDs don't match all window todos
  # @raise [ActiveRecord::RecordNotFound] if any todo doesn't exist or doesn't belong to user
  def reorder!(ordered_ids:, priority_window:)
    validate_priority_window!(priority_window)
    validate_ordered_ids!(ordered_ids)

    # Normalize to symbol for consistency
    window = priority_window.to_sym

    with_deadlock_retry do
      Todo.transaction do
        # Get all active todos in this window for this user
        window_todos = @user.todos.active
                            .where(priority_window: window)
                            .lock("FOR UPDATE")

        window_ids = window_todos.pluck(:id)

        # Validate that ordered_ids matches exactly all todos in window
        validate_ids_match_window!(window_ids, ordered_ids)

        # Perform efficient reordering
        reorder_todos_in_window(window_todos, ordered_ids)
      end
    end
  end

  # Returns todos in current order for a window (useful for verification)
  #
  # @param priority_window [String, Symbol] The priority window
  # @return [ActiveRecord::Relation<Todo>]
  def current_order(priority_window:)
    validate_priority_window!(priority_window)

    @user.todos.active
         .where(priority_window: priority_window.to_sym)
         .order(:position)
  end

  private

  # Validates that the priority window is valid
  def validate_priority_window!(window)
    window_sym = window.to_sym
    return if Todo::PRIORITY_WINDOWS.include?(window_sym)

    raise InvalidWindowError,
          "Invalid priority window: #{window}. " \
          "Must be one of: #{Todo::PRIORITY_WINDOWS.join(', ')}"
  end

  # Validates that ordered_ids is a non-empty array of positive integers
  def validate_ordered_ids!(ids)
    if ids.blank?
      raise InvalidIdsError, "ordered_ids cannot be empty"
    end

    unless ids.all? { |id| id.is_a?(Integer) && id.positive? }
      raise InvalidIdsError,
            "ordered_ids must contain only positive integers. Got: #{ids.inspect}"
    end

    if ids.size != ids.uniq.size
      raise InvalidIdsError, "ordered_ids contains duplicates"
    end
  end

  # Validates that ordered_ids matches exactly the todos in the window
  def validate_ids_match_window!(window_ids, ordered_ids)
    window_set = Set.new(window_ids)
    ordered_set = Set.new(ordered_ids)

    return if window_set == ordered_set

    missing = (window_set - ordered_set).to_a
    extra = (ordered_set - window_set).to_a

    parts = []
    parts << "Missing IDs: #{missing.join(', ')}" if missing.any?
    parts << "Extra IDs: #{extra.join(', ')}" if extra.any?

    raise PartialReorderError,
          "ordered_ids must include all todos in window. #{parts.join('. ')}"
  end

  # Performs the actual reordering using an efficient CASE statement
  #
  # Two-step update to avoid unique constraint violations:
  # 1. Bump all positions to temporary high values
  # 2. Set final positions using CASE statement
  def reorder_todos_in_window(window_todos, ordered_ids)
    # Calculate a safe bump value (higher than any current position)
    max_position = window_todos.maximum(:position).to_i
    bump = max_position + ordered_ids.size + 1

    # Step 1: Bump all positions to temporary high values
    window_todos.update_all(["position = position + ?", bump])

    # Step 2: Use efficient CASE statement to set final positions in one query
    when_clauses = ordered_ids.map { "WHEN ? THEN ?" }.join(" ")
    params = ordered_ids.each_with_index.flat_map { |id, idx| [id, idx + 1] }

    update_sql = ActiveRecord::Base.sanitize_sql_array([
      "position = CASE id #{when_clauses} END, updated_at = ?",
      *params,
      Time.current
    ])

    window_todos.where(id: ordered_ids).update_all(update_sql)
  end

  # Retries the block on deadlock with exponential backoff
  def with_deadlock_retry(&block)
    retries = 0

    begin
      yield
    rescue ActiveRecord::Deadlocked => e
      retries += 1

      if retries < MAX_RETRIES
        # Linear backoff: 10ms, 20ms, 30ms
        sleep(0.01 * retries)
        retry
      else
        Rails.logger.error(
          "TodoReorderingService deadlock after #{MAX_RETRIES} retries: #{e.message}"
        )
        raise
      end
    end
  end
end
