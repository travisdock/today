module Api
  module V1
    class EventsController < BaseController
      require_scope :read, only: :index

      def index
        start_date = parse_date(params[:start_date])
        end_date = parse_date(params[:end_date])

        unless start_date && end_date
          return render json: { error: "Both start_date and end_date are required (ISO 8601 format: YYYY-MM-DD)" }, status: :bad_request
        end

        if end_date < start_date
          return render json: { error: "end_date must be on or after start_date" }, status: :bad_request
        end

        if (end_date - start_date).to_i > 366
          return render json: { error: "Date range cannot exceed 366 days" }, status: :bad_request
        end

        events = current_user.events.for_date_range(start_date, end_date)
        render json: { events: events.map { |e| event_json(e) } }
      end

      private

      def parse_date(value)
        Date.parse(value.to_s)
      rescue Date::Error, TypeError
        nil
      end

      def event_json(event)
        {
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          starts_at: event.starts_at.iso8601,
          ends_at: event.ends_at.iso8601,
          all_day: event.all_day?,
          event_type: event.event_type,
          project_id: event.project_id,
          created_at: event.created_at.iso8601,
          updated_at: event.updated_at.iso8601
        }
      end
    end
  end
end
