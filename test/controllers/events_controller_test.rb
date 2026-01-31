require "test_helper"

class EventsControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in_as(users(:one))
    @event = events(:personal_event)
  end

  # Authentication

  test "requires authentication for index" do
    sign_out
    get events_url
    assert_redirected_to new_session_url
  end

  # Index

  test "index shows upcoming events" do
    get events_url
    assert_response :success
    assert_select "h1", /Calendar/i
  end

  test "index filters by month when param present" do
    get events_url, params: { month: "2026-02" }
    assert_response :success
  end

  # Show

  test "show displays event details" do
    get event_url(@event)
    assert_response :success
    assert_select "h1", @event.title
  end

  test "cannot view other users event" do
    other_event = events(:other_user_event)
    get event_url(other_event)
    assert_response :not_found
  end

  # New

  test "new displays form" do
    get new_event_url
    assert_response :success
    assert_select "form"
  end

  test "new defaults ends_at to starts_at plus one hour" do
    get new_event_url
    assert_response :success
  end

  # Create

  test "create saves valid event" do
    assert_difference("Event.count") do
      post events_url, params: {
        event: {
          title: "New Event",
          starts_at: 1.day.from_now,
          ends_at: 1.day.from_now + 1.hour,
          event_type: "personal"
        }
      }
    end
    assert_redirected_to events_url
    assert_equal "Event created.", flash[:notice]
  end

  test "create renders form on validation error" do
    post events_url, params: {
      event: {
        title: "",
        starts_at: 1.day.from_now,
        ends_at: 1.day.from_now + 1.hour
      }
    }
    assert_response :unprocessable_entity
    assert_select "form"
  end

  # Edit

  test "edit displays form with event data" do
    get edit_event_url(@event)
    assert_response :success
    assert_select "form"
  end

  test "cannot edit other users event" do
    other_event = events(:other_user_event)
    get edit_event_url(other_event)
    assert_response :not_found
  end

  # Update

  test "update saves changes" do
    patch event_url(@event), params: {
      event: { title: "Updated Title" }
    }
    assert_redirected_to events_url
    assert_equal "Event updated.", flash[:notice]
    assert_equal "Updated Title", @event.reload.title
  end

  test "update renders form on validation error" do
    patch event_url(@event), params: {
      event: { title: "" }
    }
    assert_response :unprocessable_entity
    assert_select "form"
  end

  test "cannot update other users event" do
    other_event = events(:other_user_event)
    patch event_url(other_event), params: {
      event: { title: "Hacked" }
    }
    assert_response :not_found
  end

  # Destroy

  test "destroy removes event" do
    assert_difference("Event.count", -1) do
      delete event_url(@event)
    end
    assert_redirected_to events_url
    assert_equal "Event deleted.", flash[:notice]
  end

  test "cannot destroy other users event" do
    other_event = events(:other_user_event)
    assert_no_difference("Event.count") do
      delete event_url(other_event)
    end
    assert_response :not_found
  end

  # Export

  test "export returns ics file" do
    get export_event_url(@event)
    assert_response :success
    assert_equal "text/calendar", response.media_type
    assert_includes response.body, "BEGIN:VCALENDAR"
    assert_includes response.body, @event.title
  end

  test "cannot export other users event" do
    other_event = events(:other_user_event)
    get export_event_url(other_event)
    assert_response :not_found
  end

  # Import Preview

  test "import_preview returns json with preview data" do
    post import_preview_events_url, params: { file: fixture_file_upload("sample.ics", "text/calendar") }

    assert_response :success
    json = JSON.parse(response.body)
    assert json.key?("new_events")
    assert json.key?("updated_events")
    assert json.key?("ignored_info")
  end

  test "import_preview requires file" do
    post import_preview_events_url
    assert_response :unprocessable_entity
  end

  # Import

  test "import creates events from ics file" do
    assert_difference("Event.count", 2) do
      post import_events_url, params: {
        file: fixture_file_upload("sample.ics", "text/calendar"),
        event_type: "personal"
      }
    end
    assert_redirected_to events_url
    assert_match /Imported 2 events/, flash[:notice]
  end

  test "import as reminder sets event type" do
    post import_events_url, params: {
      file: fixture_file_upload("sample.ics", "text/calendar"),
      event_type: "reminder"
    }

    imported = users(:one).events.find_by(uid: "simple-event-123@example.com")
    assert_equal "reminder", imported.event_type
  end

  test "import requires file" do
    post import_events_url
    assert_response :unprocessable_entity
  end

  # Load More

  test "load_more returns turbo stream" do
    get load_more_events_url, params: { start_date: 30.days.from_now.to_date.to_s }, as: :turbo_stream
    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
  end
end
