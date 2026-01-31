class EventsController < ApplicationController
  before_action :set_event, only: %i[show edit update destroy export]

  def index
    @events = load_events
    @date_groups = group_events_by_date(@events)
  end

  def show
  end

  def new
    @event = current_user.events.build(default_event_attributes)
  end

  def create
    @event = current_user.events.build(event_params)

    if @event.save
      redirect_to events_path, notice: "Event created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @event.update(event_params)
      redirect_to events_path, notice: "Event updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @event.destroy
    redirect_to events_path, notice: "Event deleted.", status: :see_other
  end

  def export
    ics = IcsExportService.new(@event).to_ical
    filename = "#{@event.title.parameterize}-#{@event.display_starts_at.to_date}.ics"

    send_data ics,
      filename: filename,
      type: "text/calendar",
      disposition: "attachment"
  end

  def import_preview
    unless params[:file].present?
      return render json: { error: "No file provided" }, status: :unprocessable_entity
    end

    ics_content = params[:file].read
    service = IcsImportService.new(current_user, ics_content)
    preview = service.preview

    if preview.error
      return render json: { error: preview.error }, status: :unprocessable_entity
    end

    render json: {
      new_events: preview.new_events,
      updated_events: preview.updated_events,
      ignored_info: preview.ignored_info
    }
  end

  def import
    unless params[:file].present?
      return redirect_to events_path, alert: "No file provided", status: :unprocessable_entity
    end

    ics_content = params[:file].read
    event_type = params[:event_type] || "personal"
    service = IcsImportService.new(current_user, ics_content, event_type: event_type)
    result = service.import

    if result.error
      return redirect_to events_path, alert: result.error
    end

    message = "Imported #{result.imported.count} events"
    message += ", #{result.failed.count} skipped due to errors" if result.failed.any?

    redirect_to events_path, notice: message
  end

  def load_more
    start_date = params[:start_date] ? Date.parse(params[:start_date]) : Date.current
    end_date = start_date + 30.days

    @events = current_user.events.for_date_range(start_date, end_date).includes(:project)
    @date_groups = group_events_by_date(@events)
    @next_start_date = end_date + 1.day

    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to events_path }
    end
  end

  private

  def set_event
    @event = current_user.events.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  def event_params
    params.require(:event).permit(
      :title, :description, :location,
      :starts_at, :ends_at, :all_day,
      :event_type, :project_id
    )
  end

  def default_event_attributes
    starts_at = 1.hour.from_now.beginning_of_hour
    {
      starts_at: starts_at,
      ends_at: starts_at + 1.hour
    }
  end

  def load_events
    events = if params[:month].present?
      year, month = params[:month].split("-").map(&:to_i)
      current_user.events.for_month(year, month)
    else
      end_date = Date.current + 30.days
      current_user.events.for_date_range(Date.current, end_date)
    end
    events.includes(:project)
  end

  def group_events_by_date(events)
    groups = Hash.new { |h, k| h[k] = [] }

    events.each do |event|
      event.spanned_dates.each do |date|
        groups[date] << event
      end
    end

    groups
  end
end
