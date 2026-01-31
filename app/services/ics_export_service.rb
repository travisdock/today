class IcsExportService
  def initialize(events)
    @events = Array(events)
  end

  def to_ical
    cal = Icalendar::Calendar.new
    cal.prodid = "-//Today App//EN"

    @events.each do |event|
      cal.event do |e|
        e.uid = event.uid
        if event.all_day?
          # All-day: use DATE format (no time component)
          # Use UTC date directly to avoid timezone conversion
          e.dtstart = Icalendar::Values::Date.new(event.starts_at.utc.to_date)
          # iCal all-day events use exclusive end dates, so add 1 day
          e.dtend = Icalendar::Values::Date.new(event.ends_at.utc.to_date + 1.day)
        else
          # Timed: export in UTC with Z suffix
          e.dtstart = Icalendar::Values::DateTime.new(event.starts_at.utc, "tzid" => "UTC")
          e.dtend = Icalendar::Values::DateTime.new(event.ends_at.utc, "tzid" => "UTC")
        end
        e.summary = event.title
        e.description = event.description if event.description.present?
        e.location = event.location if event.location.present?
      end
    end

    cal.to_ical
  end
end
