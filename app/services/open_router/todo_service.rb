module OpenRouter
  class TodoService
    def initialize(relation, user:)
      @relation = relation
      @user = user
    end

    # Read-only snapshot for LLM context
    def list_for_context
      @relation.pluck(:id, :title, :position, :priority_window).map do |id, title, position, priority_window|
        { id: id, title: title, position: position, priority_window: priority_window }
      end.group_by { |todo| todo[:priority_window] }
    end

    # Create at position, shifts others down.
    def create_todo!(title:, position: nil, priority_window: "today")
      create_todos!([ { title: title, position: position, priority_window: priority_window } ]).first
    end

    # Reorder using exact ordered_ids (must include every id once) within a priority_window.
    def reorder_todos!(ordered_ids:, priority_window:)
      TodoReorderingService.new(@user).reorder!(
        ordered_ids: ordered_ids,
        priority_window: priority_window
      )
    rescue TodoReorderingService::Error => e
      # OpenRouter API expects ArgumentError for validation failures
      raise ArgumentError, e.message
    end

    # Create several todos in one request.
    def bulk_create_todos!(todos:)
      create_todos!(todos)
    end

    # Move a todo to a different priority window.
    def move_todo!(todo_id:, priority_window:)
      todo = @relation.find(todo_id)
      raise ArgumentError, "Todo is already in #{priority_window}" if todo.priority_window == priority_window

      @relation.transaction do
        # Get next position in new window
        next_position = @relation.where(priority_window: priority_window).maximum(:position).to_i + 1
        todo.update!(priority_window: priority_window, position: next_position)
      end

      todo
    end

    # Move multiple todos to a different priority window at once.
    def bulk_move_todos!(todo_ids:, priority_window:)
      raise ArgumentError, "todo_ids cannot be empty" if todo_ids.blank?

      todos = @relation.where(id: todo_ids).to_a

      # Validate all todos were found
      if todos.size != todo_ids.size
        found_ids = todos.map(&:id)
        missing_ids = todo_ids - found_ids
        raise ActiveRecord::RecordNotFound, "One or more todos not found or not accessible"
      end

      # Filter out todos already in target window
      todos_to_move = todos.reject { |todo| todo.priority_window == priority_window }

      return todos if todos_to_move.empty?

      @relation.transaction do
        # Lock target window to prevent concurrent reorders
        target_window_todos = @relation.where(priority_window: priority_window)
                                      .lock("FOR UPDATE")

        # Get starting position in new window
        next_position = target_window_todos.maximum(:position).to_i + 1

        # Build CASE statement for efficient bulk update
        when_clauses = todos_to_move.each_with_index.map { "WHEN ? THEN ?" }.join(" ")
        positions = todos_to_move.each_with_index.map { |_, idx| next_position + idx }
        params = todos_to_move.zip(positions).flat_map { |todo, pos| [ todo.id, pos ] }

        update_sql = ActiveRecord::Base.sanitize_sql_array([
          "priority_window = ?, position = CASE id #{when_clauses} END, updated_at = ?",
          priority_window,
          *params,
          Time.current
        ])

        @relation.where(id: todos_to_move.map(&:id)).update_all(update_sql)
      end

      todos
    end

    private
      def create_todos!(todos)
        items = Array(todos).map do |item|
          case item
          when Hash
            {
              title: item[:title] || item["title"],
              position: item[:position] || item["position"],
              priority_window: item[:priority_window] || item["priority_window"] || "today"
            }
          else
            { title: item.to_s, position: nil, priority_window: "today" }
          end
        end

        sanitized = items.filter_map do |item|
          title = item[:title].to_s.strip
          next if title.blank?
          position = item[:position]
          priority_window = item[:priority_window]
          {
            title: title,
            position: position.nil? ? nil : position.to_i,
            priority_window: priority_window || "today"
          }
        end

        raise ArgumentError, "No todos provided" if sanitized.empty?

        created = []

        @relation.transaction do
          sanitized.each do |item|
            created << create_single_todo!(title: item[:title], position: item[:position], priority_window: item[:priority_window])
          end
        end

        created
      end

      def create_single_todo!(title:, position:, priority_window:)
        priority_window ||= "today"
        target_position = normalize_position(position)

        if target_position.nil?
          target_position = next_position(priority_window)
        else
          shift_positions_at_or_after!(target_position, priority_window)
        end

        @relation.create!(title: title, position: target_position, priority_window: priority_window)
      end

      def normalize_position(position)
        return nil if position.nil?
        value = position.to_i
        value > 0 ? value : nil
      end

      def next_position(priority_window)
        @relation.where(priority_window: priority_window).maximum(:position).to_i + 1
      end

      def shift_positions_at_or_after!(position, priority_window)
        window_relation = @relation.where(priority_window: priority_window)
        rows = window_relation.where("position >= ?", position).order(position: :asc).pluck(:id, :position)
        return if rows.empty?

        ids = rows.map(&:first)
        bump = window_relation.maximum(:position).to_i + rows.size + 1

        window_relation.where(id: ids).update_all([ "position = position + ?", bump ])

        case_fragments = rows.map { "WHEN ? THEN ?" }.join(" ")
        case_args = rows.flat_map { |id, current_position| [ id, current_position + 1 ] }
        update_sql = ActiveRecord::Base.sanitize_sql_array([
          "position = CASE id #{case_fragments} END",
          *case_args
        ])

        window_relation.where(id: ids).update_all(update_sql)
      end
  end
end
