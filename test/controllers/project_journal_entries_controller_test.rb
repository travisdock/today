require "test_helper"

class ProjectJournalEntriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in_as(users(:one))
    @project = projects(:one)
  end

  test "requires authentication" do
    sign_out

    post project_journal_entries_url(@project), params: { journal_entry: { content: "Test" } }
    assert_redirected_to new_session_url
  end

  test "creates journal entry for project" do
    assert_difference -> { @project.journal_entries.count }, 1 do
      post project_journal_entries_url(@project), params: { journal_entry: { content: "Work completed" } }
    end

    assert_redirected_to project_url(@project)
  end

  test "does not create journal entry without content or image" do
    assert_no_difference -> { @project.journal_entries.count } do
      post project_journal_entries_url(@project), params: { journal_entry: { content: "" } }
    end

    assert_redirected_to project_url(@project)
    assert_equal "Could not add journal entry.", flash[:alert]
  end

  test "creates journal entry with image only" do
    image = fixture_file_upload("test_image.jpg", "image/jpeg")

    assert_difference -> { @project.journal_entries.count }, 1 do
      post project_journal_entries_url(@project), params: { journal_entry: { content: "", image: image } }
    end

    assert_redirected_to project_url(@project)
    assert @project.journal_entries.last.image.attached?
  end

  test "creates journal entry with both content and image" do
    image = fixture_file_upload("test_image.jpg", "image/jpeg")

    assert_difference -> { @project.journal_entries.count }, 1 do
      post project_journal_entries_url(@project), params: { journal_entry: { content: "With image", image: image } }
    end

    journal_entry = @project.journal_entries.last
    assert_equal "With image", journal_entry.content
    assert journal_entry.image.attached?
  end

  test "prevents creating journal entries on other users projects" do
    other_project = projects(:other_user)

    assert_no_difference -> { JournalEntry.count } do
      post project_journal_entries_url(other_project), params: { journal_entry: { content: "Sneaky" } }
    end

    assert_response :not_found
  end

  test "prevents mass assignment of project_id" do
    other_project = projects(:other_user)

    post project_journal_entries_url(@project), params: {
      journal_entry: {
        content: "Test entry",
        project_id: other_project.id
      }
    }

    journal_entry = JournalEntry.order(:created_at).last
    assert_equal @project, journal_entry.project
  end

  test "responds with turbo stream on success" do
    post project_journal_entries_url(@project), params: { journal_entry: { content: "Turbo entry" } }, as: :turbo_stream

    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="flash">)
    assert_includes response.body, %(<turbo-stream action="replace" target="journal_entry_form">)
    assert_includes response.body, %(<turbo-stream action="replace" target="journal_entries_list">)
  end

  test "responds with turbo stream on failure" do
    post project_journal_entries_url(@project), params: { journal_entry: { content: "" } }, as: :turbo_stream

    assert_response :unprocessable_entity
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="journal_entry_form">)
  end

  test "destroys journal entry" do
    journal_entry = journal_entries(:one)

    assert_difference -> { @project.journal_entries.count }, -1 do
      delete project_journal_entry_url(@project, journal_entry)
    end

    assert_redirected_to project_url(@project)
    assert_equal "Journal entry deleted.", flash[:notice]
  end

  test "destroys journal entry with turbo stream" do
    journal_entry = journal_entries(:one)

    assert_difference -> { @project.journal_entries.count }, -1 do
      delete project_journal_entry_url(@project, journal_entry), as: :turbo_stream
    end

    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, %(<turbo-stream action="replace" target="flash">)
    assert_includes response.body, %(<turbo-stream action="replace" target="journal_entries_list">)
  end

  test "prevents deleting journal entries on other users projects" do
    other_entry = journal_entries(:other_user)

    assert_no_difference -> { JournalEntry.count } do
      delete project_journal_entry_url(projects(:other_user), other_entry)
    end

    assert_response :not_found
  end
end
