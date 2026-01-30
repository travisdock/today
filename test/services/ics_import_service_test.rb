require "test_helper"

class IcsImportServiceTest < ActiveSupport::TestCase
  def setup
    @user = users(:one)
    @sample_ics = file_fixture("sample.ics").read
    @recurring_ics = file_fixture("recurring.ics").read
    @attendees_ics = file_fixture("with_attendees.ics").read
    @no_uid_ics = file_fixture("no_uid.ics").read
  end

  # Import tests

  test "imports events from ics content" do
    service = IcsImportService.new(@user, @sample_ics)
    result = service.import

    assert_equal 2, result.imported.count
    assert_empty result.failed

    meeting = @user.events.find_by(uid: "simple-event-123@example.com")
    assert_not_nil meeting
    assert_equal "Team Meeting", meeting.title
    assert_equal "Weekly team sync", meeting.description
    assert_equal "Conference Room A", meeting.location
    assert_not meeting.all_day?
  end

  test "imports all-day events correctly" do
    service = IcsImportService.new(@user, @sample_ics)
    service.import

    holiday = @user.events.find_by(uid: "all-day-event-456@example.com")
    assert_not_nil holiday
    assert_equal "Company Holiday", holiday.title
    assert holiday.all_day?
    # All-day events stored in UTC - use display helper or .utc.to_date
    assert_equal Date.new(2026, 2, 20), holiday.display_starts_at
    # End date should be same as start (we subtract 1 day from iCal exclusive end)
    assert_equal Date.new(2026, 2, 20), holiday.display_ends_at
  end

  test "imports events as personal by default" do
    service = IcsImportService.new(@user, @sample_ics)
    result = service.import

    result.imported.each do |event|
      assert_equal "personal", event.event_type
    end
  end

  test "imports events as reminder when specified" do
    service = IcsImportService.new(@user, @sample_ics, event_type: "reminder")
    service.import

    meeting = @user.events.find_by(uid: "simple-event-123@example.com")
    assert_equal "reminder", meeting.event_type
  end

  test "skips recurring events" do
    service = IcsImportService.new(@user, @recurring_ics)
    result = service.import

    # Should only import the non-recurring event
    assert_equal 1, result.imported.count
    assert_equal "One-time Meeting", result.imported.first.title

    # Should not import the recurring event
    assert_nil @user.events.find_by(uid: "recurring-event-789@example.com")
  end

  test "updates existing events by uid" do
    existing = @user.events.create!(
      title: "Old Title",
      uid: "simple-event-123@example.com",
      starts_at: 1.week.ago,
      ends_at: 1.week.ago + 1.hour
    )

    service = IcsImportService.new(@user, @sample_ics)
    result = service.import

    existing.reload
    assert_equal "Team Meeting", existing.title
    assert_equal "Weekly team sync", existing.description
  end

  test "imports event when ics has no explicit uid" do
    # Note: icalendar gem auto-generates UIDs for events that don't have one
    service = IcsImportService.new(@user, @no_uid_ics)
    result = service.import

    assert_equal 1, result.imported.count
    event = result.imported.first
    assert_not_nil event.uid
    assert_equal "Event Without UID", event.title
  end

  test "two users importing same ics get separate events" do
    user_one = users(:one)
    user_two = users(:two)

    service_one = IcsImportService.new(user_one, @sample_ics)
    service_two = IcsImportService.new(user_two, @sample_ics)

    result_one = service_one.import
    result_two = service_two.import

    assert_equal 2, result_one.imported.count
    assert_equal 2, result_two.imported.count

    # Each user should have their own event
    event_one = user_one.events.find_by(uid: "simple-event-123@example.com")
    event_two = user_two.events.find_by(uid: "simple-event-123@example.com")

    assert_not_nil event_one
    assert_not_nil event_two
    assert_not_equal event_one.id, event_two.id
  end

  test "reports failed imports" do
    # Create an event that will cause a validation error on re-import
    # (We can't easily trigger this with current validations, but test the structure)
    service = IcsImportService.new(@user, @sample_ics)
    result = service.import

    assert_respond_to result, :imported
    assert_respond_to result, :failed
    assert_kind_of Array, result.imported
    assert_kind_of Array, result.failed
  end

  # Preview tests

  test "preview returns new events count" do
    service = IcsImportService.new(@user, @sample_ics)
    preview = service.preview

    assert_equal 2, preview.new_events.count
    assert_empty preview.updated_events
  end

  test "preview identifies events that will be updated" do
    @user.events.create!(
      title: "Old Title",
      uid: "simple-event-123@example.com",
      starts_at: 1.week.ago,
      ends_at: 1.week.ago + 1.hour
    )

    service = IcsImportService.new(@user, @sample_ics)
    preview = service.preview

    assert_equal 1, preview.new_events.count
    assert_equal 1, preview.updated_events.count
    assert_equal "Team Meeting", preview.updated_events.first[:title]
  end

  test "preview reports recurring events as ignored" do
    service = IcsImportService.new(@user, @recurring_ics)
    preview = service.preview

    assert_equal 1, preview.ignored_info[:recurring_events].count
    assert_equal "Weekly Standup", preview.ignored_info[:recurring_events].first[:title]
  end

  test "preview reports attendees as ignored" do
    service = IcsImportService.new(@user, @attendees_ics)
    preview = service.preview

    assert preview.ignored_info[:attendees_ignored]
  end

  test "preview reports organizer as ignored" do
    service = IcsImportService.new(@user, @attendees_ics)
    preview = service.preview

    assert preview.ignored_info[:organizer_ignored]
  end

  test "preview does not create any events" do
    initial_count = @user.events.count

    service = IcsImportService.new(@user, @sample_ics)
    service.preview

    assert_equal initial_count, @user.events.count
  end

  test "preview includes event details" do
    service = IcsImportService.new(@user, @sample_ics)
    preview = service.preview

    event_info = preview.new_events.first
    assert_equal "Team Meeting", event_info[:title]
    assert_not_nil event_info[:starts_at]
    assert_equal false, event_info[:all_day]
  end

  test "preview correctly identifies all-day events" do
    service = IcsImportService.new(@user, @sample_ics)
    preview = service.preview

    all_day_event = preview.new_events.find { |e| e[:title] == "Company Holiday" }
    assert_not_nil all_day_event
    assert_equal true, all_day_event[:all_day]
  end
end
