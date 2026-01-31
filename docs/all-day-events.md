# All-Day Event Handling

This document explains how the Today app handles all-day events, particularly the timezone considerations for storage, display, and ICS import/export.

## The Problem

All-day events represent calendar dates, not specific moments in time. "Christmas" is December 25th everywhere, regardless of timezone. However, Rails stores all datetime values in UTC, which can cause date shifting when the app's timezone differs from UTC.

**Example of the problem:**
1. User creates an all-day event for January 31st
2. If stored naively as `2026-01-31 00:00:00` in the app's timezone (Mountain Time, UTC-7)
3. Rails converts to UTC: `2026-01-31 07:00:00 UTC`
4. When displayed, it shows correctly in Mountain Time
5. But if exported to ICS or the timezone changes, the date could shift

## Our Solution

### Storage

All-day events are stored as **midnight UTC** on the intended date:
- January 31st all-day event → `2026-01-31 00:00:00 UTC`

This means the UTC date always matches the intended calendar date.

### Display

When displaying all-day events, we use `.utc.to_date` to extract the date without timezone conversion:

```ruby
# app/models/event.rb
def display_starts_at
  all_day? ? starts_at.utc.to_date : starts_at.in_time_zone
end
```

For timed events, we use `.in_time_zone` to convert to the app's configured timezone.

### Form Handling

When populating form fields, we need to prevent the browser from applying timezone conversion:

```ruby
# app/models/event.rb
def starts_at_for_form
  all_day? ? starts_at.utc : starts_at.in_time_zone
end
```

## ICS Import/Export

### The iCalendar Standard

According to RFC 5545:

1. **All-day events use `VALUE=DATE`** - a date without time component:
   ```ics
   DTSTART;VALUE=DATE:20260131
   DTEND;VALUE=DATE:20260201
   ```

2. **No timezone on DATE values** - they represent calendar dates, not moments in time

3. **End date is exclusive** - a single-day event on Jan 31 has DTEND of Feb 1

### Export (IcsExportService)

```ruby
if event.all_day?
  # Use DATE format (no time component)
  # Use UTC date to get the correct calendar date
  e.dtstart = Icalendar::Values::Date.new(event.starts_at.utc.to_date)
  # Add 1 day for exclusive end date per iCal spec
  e.dtend = Icalendar::Values::Date.new(event.ends_at.utc.to_date + 1.day)
else
  # Timed events use DateTime in UTC
  e.dtstart = Icalendar::Values::DateTime.new(event.starts_at.utc, "tzid" => "UTC")
  e.dtend = Icalendar::Values::DateTime.new(event.ends_at.utc, "tzid" => "UTC")
end
```

### Import (IcsImportService)

```ruby
# Detect all-day events by checking if dtstart is a Date (not DateTime)
all_day = ical_event.dtstart.is_a?(Icalendar::Values::Date)

if all_day
  # Store as midnight UTC on that date
  starts_at = Time.utc(dtstart.year, dtstart.month, dtstart.day)

  # Subtract 1 day from end (iCal uses exclusive end dates)
  ends_at = Time.utc(dtend.year, dtend.month, dtend.day) - 1.day
else
  # Timed events: convert to UTC (Rails handles this)
  starts_at = ical_event.dtstart.to_time.utc
end
```

## Key Rules

1. **Storage**: All-day events stored as midnight UTC
2. **Display**: Use `.utc.to_date` for all-day, `.in_time_zone` for timed
3. **Export**: Use `Icalendar::Values::Date` for all-day, add 1 day to end date
4. **Import**: Check for `Icalendar::Values::Date` type, subtract 1 day from end date

## Why Not Store as Date?

Rails/ActiveRecord `date` columns could work, but:
- We'd need separate columns for all-day vs timed events
- The `datetime` approach is more flexible
- Many calendar apps use the same midnight-UTC pattern

## Testing

When writing tests for all-day events:

```ruby
# Create an all-day event for Jan 31
event = Event.create!(
  title: "Test",
  starts_at: Time.utc(2026, 1, 31),
  ends_at: Time.utc(2026, 1, 31),
  all_day: true,
  user: user
)

# Verify display date is correct regardless of app timezone
assert_equal Date.new(2026, 1, 31), event.display_starts_at
```

## References

- [RFC 5545 - iCalendar](https://icalendar.org/iCalendar-RFC-5545/3-6-1-event-component.html)
- [CalConnect Developer Guide - Handling Dates and Times](https://devguide.calconnect.org/iCalendar-Topics/Handling-Dates-and-Times/)
