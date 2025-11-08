module OpenRouter
  class TodoService
    def initialize(relation)
      @relation = relation
      # Extract user from relation for TodoReorderingService
      @user = extract_user_from_relation(relation)
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
    rescue TodoReorderingService::PartialReorderError => e
      # OpenRouter API expects ArgumentError for validation failures
      raise ArgumentError, e.message
    rescue TodoReorderingService::Error => e
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

      def extract_user_from_relation(relation)
        # The relation is scoped to a user (e.g., user.todos.active)
        # Extract user from the first record, or from scope values
        if relation.respond_to?(:scope_for_create) && relation.scope_for_create["user_id"]
          User.find(relation.scope_for_create["user_id"])
        elsif relation.first
          relation.first.user
        else
          raise ArgumentError, "Cannot extract user from empty relation without user_id scope"
        end
      end
  end
end
