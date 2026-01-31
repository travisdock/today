require "test_helper"

class IcsExportServiceTest < ActiveSupport::TestCase
  def setup
    @user = users(:one)
  end

  test "exports single event to ical format" do
    event = @user.events.create!(
      title: "Team Meeting",
      description: "Weekly sync",
      location: "Room A",
      starts_at: Time.utc(2026, 2, 15, 14, 0, 0),
      ends_at: Time.utc(2026, 2, 15, 15, 0, 0),
      uid: "test-event-123@today.travserve.net"
    )

    service = IcsExportService.new(event)
    ical = service.to_ical

    assert_includes ical, "BEGIN:VCALENDAR"
    assert_includes ical, "END:VCALENDAR"
    assert_includes ical, "BEGIN:VEVENT"
    assert_includes ical, "UID:test-event-123@today.travserve.net"
    assert_includes ical, "SUMMARY:Team Meeting"
    assert_includes ical, "DESCRIPTION:Weekly sync"
    assert_includes ical, "LOCATION:Room A"
  end

  test "exports multiple events" do
    event1 = @user.events.create!(
      title: "Meeting 1",
      starts_at: Time.utc(2026, 2, 15, 14, 0, 0),
      ends_at: Time.utc(2026, 2, 15, 15, 0, 0)
    )
    event2 = @user.events.create!(
      title: "Meeting 2",
      starts_at: Time.utc(2026, 2, 16, 10, 0, 0),
      ends_at: Time.utc(2026, 2, 16, 11, 0, 0)
    )

    service = IcsExportService.new([ event1, event2 ])
    ical = service.to_ical

    assert_includes ical, "SUMMARY:Meeting 1"
    assert_includes ical, "SUMMARY:Meeting 2"
    assert_equal 2, ical.scan("BEGIN:VEVENT").count
  end

  test "exports timed events with UTC datetime" do
    event = @user.events.create!(
      title: "Timed Event",
      starts_at: Time.utc(2026, 2, 15, 14, 30, 0),
      ends_at: Time.utc(2026, 2, 15, 15, 30, 0),
      all_day: false
    )

    service = IcsExportService.new(event)
    ical = service.to_ical

    # Should have DTSTART with time component
    assert_match(/DTSTART.*20260215T143000Z/, ical)
    assert_match(/DTEND.*20260215T153000Z/, ical)
  end

  test "exports all-day events with DATE format" do
    event = @user.events.create!(
      title: "Holiday",
      starts_at: Time.utc(2026, 2, 20, 0, 0, 0),
      ends_at: Time.utc(2026, 2, 20, 0, 0, 0),
      all_day: true
    )

    service = IcsExportService.new(event)
    ical = service.to_ical

    # All-day should use DATE format (no time component)
    assert_match(/DTSTART.*VALUE=DATE.*20260220/, ical)
    # iCal all-day events use exclusive end date (next day)
    assert_match(/DTEND.*VALUE=DATE.*20260221/, ical)
  end

  test "exports multi-day all-day events correctly" do
    event = @user.events.create!(
      title: "Conference",
      starts_at: Time.utc(2026, 3, 10, 0, 0, 0),
      ends_at: Time.utc(2026, 3, 12, 0, 0, 0),
      all_day: true
    )

    service = IcsExportService.new(event)
    ical = service.to_ical

    assert_match(/DTSTART.*VALUE=DATE.*20260310/, ical)
    # Ends on 12th, so exclusive end is 13th
    assert_match(/DTEND.*VALUE=DATE.*20260313/, ical)
  end

  test "sets prodid header" do
    event = @user.events.create!(
      title: "Test",
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 1.hour
    )

    service = IcsExportService.new(event)
    ical = service.to_ical

    assert_includes ical, "PRODID:-//Today App//EN"
  end

  test "handles nil description and location" do
    event = @user.events.create!(
      title: "Minimal Event",
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 1.hour,
      description: nil,
      location: nil
    )

    service = IcsExportService.new(event)
    ical = service.to_ical

    # Should not raise, should produce valid ical
    assert_includes ical, "BEGIN:VEVENT"
    assert_includes ical, "SUMMARY:Minimal Event"
  end
end
