module OpenRouter
  class TodoService
    def initialize(relation)
      @relation = relation
    end

    # Read-only snapshot for LLM context
    def list_for_context
      @relation.pluck(:id, :title, :position).map do |id, title, position|
        { id: id, title: title, position: position }
      end.sort_by { |todo| todo[:position] }
    end

    # Create at position, shifts others down.
    def create_todo!(title:, position: nil)
      create_todos!([ { title: title, position: position } ]).first
    end

    # Reorder using exact ordered_ids (must include every id once).
    def reorder_todos!(ordered_ids:)
      ids = @relation.pluck(:id)
      raise ArgumentError, "ordered_ids must include all todos" unless Set.new(ids) == Set.new(ordered_ids) && ids.size == ordered_ids.size

      @relation.transaction do
        # Row lock to prevent races under concurrency
        @relation.lock(true).to_a

        bump = @relation.maximum(:position).to_i + ordered_ids.size + 1
        @relation.update_all([ "position = position + ?", bump ])

        # Efficient CASE update
        case_fragments = ordered_ids.each_with_index.map { "WHEN ? THEN ?" }.join(" ")
        case_args = ordered_ids.each_with_index.flat_map { |id, idx| [ id, idx + 1 ] }
        update_sql = ActiveRecord::Base.sanitize_sql_array([
          "position = CASE id #{case_fragments} END",
          *case_args
        ])

        @relation.where(id: ordered_ids).update_all(update_sql)
      end
    end

    # Create several todos in one request.
    def bulk_create_todos!(todos:)
      create_todos!(todos)
    end

    private
      def create_todos!(todos)
        items = Array(todos).map do |item|
          case item
          when Hash
            {
              title: item[:title] || item["title"],
              position: item[:position] || item["position"]
            }
          else
            { title: item.to_s, position: nil }
          end
        end

        sanitized = items.filter_map do |item|
          title = item[:title].to_s.strip
          next if title.blank?
          position = item[:position]
          {
            title: title,
            position: position.nil? ? nil : position.to_i
          }
        end

        raise ArgumentError, "No todos provided" if sanitized.empty?

        created = []

        @relation.transaction do
          sanitized.each do |item|
            created << create_single_todo!(title: item[:title], position: item[:position])
          end
        end

        created
      end

      def create_single_todo!(title:, position:)
        target_position = normalize_position(position)

        if target_position.nil?
          target_position = next_position
        else
          shift_positions_at_or_after!(target_position)
        end

        @relation.create!(title: title, position: target_position)
      end

      def normalize_position(position)
        return nil if position.nil?
        value = position.to_i
        value > 0 ? value : nil
      end

      def next_position
        @relation.maximum(:position).to_i + 1
      end

      def shift_positions_at_or_after!(position)
        rows = @relation.where("position >= ?", position).order(position: :asc).pluck(:id, :position)
        return if rows.empty?

        ids = rows.map(&:first)
        bump = @relation.maximum(:position).to_i + rows.size + 1

        @relation.where(id: ids).update_all([ "position = position + ?", bump ])

        case_fragments = rows.map { "WHEN ? THEN ?" }.join(" ")
        case_args = rows.flat_map { |id, current_position| [ id, current_position + 1 ] }
        update_sql = ActiveRecord::Base.sanitize_sql_array([
          "position = CASE id #{case_fragments} END",
          *case_args
        ])

        @relation.where(id: ids).update_all(update_sql)
      end
  end
end
