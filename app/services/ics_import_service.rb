class IcsImportService
  Result = Struct.new(:imported, :failed, :error, keyword_init: true)
  PreviewResult = Struct.new(:new_events, :updated_events, :ignored_info, :error, keyword_init: true)

  def initialize(user, ics_content, event_type: "personal")
    @user = user
    @ics_content = ics_content
    @event_type = event_type
  end

  def preview
    begin
      calendars = Icalendar::Calendar.parse(@ics_content)
    rescue StandardError => e
      return PreviewResult.new(new_events: [], updated_events: [], ignored_info: {}, error: "Invalid ICS file: #{e.message}")
    end

    new_events = []
    updated_events = []
    ignored_info = {
      recurring_events: [],
      attendees_ignored: false,
      organizer_ignored: false
    }

    calendars.each do |cal|
      cal.events.each do |ical_event|
        # Check for recurring events (RRULE) - skip these for now
        if ical_event.rrule.present?
          ignored_info[:recurring_events] << {
            title: ical_event.summary.to_s,
            recurrence: ical_event.rrule.first.to_s
          }
          next
        end

        # Track ignored fields
        ignored_info[:attendees_ignored] = true if ical_event.attendee.present?
        ignored_info[:organizer_ignored] = true if ical_event.organizer.present?

        # Check if this event already exists (by UID) - will be an update
        uid = ical_event.uid.to_s.presence
        existing = uid && @user.events.exists?(uid: uid)

        event_info = {
          title: ical_event.summary.to_s,
          starts_at: ical_event.dtstart,
          all_day: ical_event.dtstart.is_a?(Icalendar::Values::Date)
        }

        if existing
          updated_events << event_info
        else
          new_events << event_info
        end
      end
    end

    PreviewResult.new(new_events: new_events, updated_events: updated_events, ignored_info: ignored_info)
  end

  def import
    begin
      calendars = Icalendar::Calendar.parse(@ics_content)
    rescue StandardError => e
      return Result.new(imported: [], failed: [], error: "Invalid ICS file: #{e.message}")
    end

    imported = []
    failed = []

    calendars.each do |cal|
      cal.events.each do |ical_event|
        # Skip recurring events (not supported yet)
        next if ical_event.rrule.present?

        # Handle missing UID - some calendar apps omit it
        uid = ical_event.uid.to_s.presence || "#{SecureRandom.uuid}@today.travserve.net"
        event = @user.events.find_or_initialize_by(uid: uid)
        all_day = ical_event.dtstart.is_a?(Icalendar::Values::Date)

        # Handle start time
        # - All-day: store as midnight UTC on that date (no TZ conversion on display)
        # - Timed: convert to UTC (Rails does this automatically, display uses app TZ)
        starts_at = if all_day
          Time.utc(ical_event.dtstart.year, ical_event.dtstart.month, ical_event.dtstart.day)
        else
          ical_event.dtstart.to_time.utc
        end

        # Handle end time
        # - iCal all-day events use exclusive end dates (Jan 30 all-day has dtend of Jan 31)
        # - Subtract 1 day for all-day to store the actual last day
        ends_at = if all_day && ical_event.dtend
          date = ical_event.dtend - 1.day
          Time.utc(date.year, date.month, date.day)
        elsif all_day
          starts_at
        else
          (ical_event.dtend || ical_event.dtstart).to_time.utc
        end

        event.assign_attributes(
          title: ical_event.summary.to_s,
          description: ical_event.description&.to_s,
          location: ical_event.location&.to_s,
          starts_at: starts_at,
          ends_at: ends_at,
          all_day: all_day,
          event_type: @event_type
        )

        if event.save
          imported << event
        else
          failed << { uid: ical_event.uid.to_s, title: ical_event.summary.to_s, errors: event.errors.full_messages }
        end
      end
    end

    Result.new(imported: imported, failed: failed)
  end
end
