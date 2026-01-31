require "test_helper"

class EventTest < ActiveSupport::TestCase
  # Validations

  test "requires a title" do
    event = Event.new(user: users(:one), title: "", starts_at: 1.day.from_now, ends_at: 1.day.from_now + 1.hour)
    assert_not event.valid?
    assert_includes event.errors[:title], "can't be blank"
  end

  test "requires starts_at" do
    event = Event.new(user: users(:one), title: "Test", starts_at: nil, ends_at: 1.day.from_now)
    assert_not event.valid?
    assert_includes event.errors[:starts_at], "can't be blank"
  end

  test "requires ends_at" do
    event = Event.new(user: users(:one), title: "Test", starts_at: 1.day.from_now, ends_at: nil)
    assert_not event.valid?
    assert_includes event.errors[:ends_at], "can't be blank"
  end

  test "requires ends_at to be after or equal to starts_at" do
    event = Event.new(
      user: users(:one),
      title: "Test",
      starts_at: 1.day.from_now,
      ends_at: 1.day.ago
    )
    assert_not event.valid?
    assert_includes event.errors[:ends_at], "must be after or equal to start time"
  end

  test "allows ends_at equal to starts_at" do
    event = Event.new(
      user: users(:one),
      title: "Test",
      starts_at: 1.day.from_now.beginning_of_day,
      ends_at: 1.day.from_now.beginning_of_day
    )
    assert event.valid?
  end

  # UID uniqueness scoped to user

  test "requires unique uid per user" do
    existing = events(:personal_event)
    duplicate = Event.new(
      user: existing.user,
      title: "Duplicate",
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 1.hour,
      uid: existing.uid
    )
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:uid], "has already been taken"
  end

  test "allows same uid for different users" do
    user_one = users(:one)
    user_two = users(:two)
    shared_uid = "shared-uid@today.travserve.net"

    user_one.events.create!(
      title: "User one event",
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 1.hour,
      uid: shared_uid
    )

    event_two = user_two.events.build(
      title: "User two event",
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 1.hour,
      uid: shared_uid
    )

    assert event_two.valid?
  end

  # UID generation

  test "generates uid on create if not provided" do
    event = Event.create!(
      user: users(:one),
      title: "Auto UID",
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 1.hour
    )
    assert_not_nil event.uid
    assert_match /@today\.travserve\.net\z/, event.uid
  end

  test "preserves uid if provided" do
    custom_uid = "custom-uid-123@example.com"
    event = Event.create!(
      user: users(:one),
      title: "Custom UID",
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 1.hour,
      uid: custom_uid
    )
    assert_equal custom_uid, event.uid
  end

  # Associations

  test "belongs to user" do
    event = events(:personal_event)
    assert_equal users(:one), event.user
  end

  test "belongs to project optionally" do
    event_with_project = events(:personal_event)
    assert_equal projects(:one), event_with_project.project

    event_without_project = events(:reminder_event)
    assert_nil event_without_project.project
  end

  test "allows event without project" do
    event = Event.new(
      user: users(:one),
      title: "No project",
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 1.hour,
      project: nil
    )
    assert event.valid?
  end

  test "rejects event with another users project" do
    other_user_project = projects(:other_user)
    event = Event.new(
      user: users(:one),
      title: "Sneaky event",
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 1.hour,
      project: other_user_project
    )
    assert_not event.valid?
    assert_includes event.errors[:project], "must belong to you"
  end

  # Enum

  test "event_type defaults to personal" do
    event = Event.new(user: users(:one), title: "Test", starts_at: 1.day.from_now, ends_at: 1.day.from_now + 1.hour)
    assert_equal "personal", event.event_type
  end

  test "event_type can be set to reminder" do
    event = Event.new(
      user: users(:one),
      title: "Test",
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 1.hour,
      event_type: "reminder"
    )
    assert event.valid?
    assert event.reminder?
  end

  # Helper methods

  test "reminder? returns true for reminder events" do
    assert events(:reminder_event).reminder?
  end

  test "reminder? returns false for personal events" do
    assert_not events(:personal_event).reminder?
  end

  # Scopes

  test "upcoming scope returns future events ordered by starts_at" do
    user = users(:one)
    upcoming = user.events.upcoming

    assert upcoming.all? { |e| e.starts_at >= Time.current }
    assert_equal upcoming.sort_by(&:starts_at), upcoming.to_a
  end

  test "past scope returns past events ordered by starts_at desc" do
    user = users(:one)
    past = user.events.past

    assert past.all? { |e| e.starts_at < Time.current }
  end

  test "personal scope returns only personal events" do
    user = users(:one)
    personal = user.events.personal

    assert personal.all? { |e| e.event_type == "personal" }
    assert_not personal.any? { |e| e.event_type == "reminder" }
  end

  test "reminders scope returns only reminder events" do
    user = users(:one)
    reminders = user.events.reminders

    assert reminders.all? { |e| e.event_type == "reminder" }
  end

  test "for_date_range returns events within range" do
    user = users(:one)
    start_date = Date.current
    end_date = 7.days.from_now.to_date

    events = user.events.for_date_range(start_date, end_date)

    events.each do |event|
      # Event must overlap with the range (start before range ends, end after range starts)
      assert event.starts_at.to_date <= end_date
      assert event.ends_at.to_date >= start_date
    end
  end

  test "for_date_range includes multi-day events that extend into range" do
    user = users(:one)
    multi_day = events(:multi_day_event)

    # Query a range that starts in the middle of the multi-day event
    start_date = multi_day.starts_at.to_date + 1.day
    end_date = start_date + 1.day

    events = user.events.for_date_range(start_date, end_date)

    assert_includes events, multi_day
  end

  test "for_month returns events for specific month" do
    user = users(:one)
    year = Date.current.year
    month = Date.current.month

    events = user.events.for_month(year, month)
    start_of_month = Date.new(year, month, 1)
    end_of_month = start_of_month.end_of_month

    events.each do |event|
      assert event.starts_at.to_date >= start_of_month
      assert event.starts_at.to_date <= end_of_month
    end
  end

  # Display helpers

  test "display_starts_at returns date only for all-day events" do
    event = events(:all_day_event)
    assert_equal event.starts_at.to_date, event.display_starts_at
  end

  test "display_starts_at returns datetime for timed events" do
    event = events(:personal_event)
    assert_instance_of ActiveSupport::TimeWithZone, event.display_starts_at
    assert_not_equal event.starts_at.to_date, event.display_starts_at
  end

  test "display_ends_at returns date only for all-day events" do
    event = events(:all_day_event)
    assert_equal event.ends_at.to_date, event.display_ends_at
  end

  test "display_ends_at returns datetime for timed events" do
    event = events(:personal_event)
    assert_instance_of ActiveSupport::TimeWithZone, event.display_ends_at
  end

  # Spanned dates

  test "spanned_dates returns single date for single-day event" do
    event = events(:all_day_event)
    dates = event.spanned_dates

    assert_equal 1, dates.count
    assert_equal event.display_starts_at.to_date, dates.first
  end

  test "spanned_dates returns all dates for multi-day event" do
    event = events(:multi_day_event)
    dates = event.spanned_dates

    assert_equal 3, dates.count
    assert_equal event.display_starts_at.to_date, dates.first
    assert_equal event.display_ends_at.to_date, dates.last
  end

  test "spanned_dates returns single date for timed event on same day" do
    event = events(:personal_event)
    dates = event.spanned_dates

    assert_equal 1, dates.count
  end
end
