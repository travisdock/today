require "test_helper"

class JournalEntryTest < ActiveSupport::TestCase
  test "requires content or image" do
    journal_entry = JournalEntry.new(project: projects(:one), content: "")
    assert_not journal_entry.valid?
    assert_includes journal_entry.errors[:base], "Must have content or an image"
  end

  test "valid with content only" do
    journal_entry = JournalEntry.new(project: projects(:one), content: "Some work done")
    assert journal_entry.valid?
  end

  test "valid with image only" do
    journal_entry = JournalEntry.new(project: projects(:one), content: "")
    journal_entry.image.attach(
      io: File.open(file_fixture("test_image.jpg")),
      filename: "test.jpg",
      content_type: "image/jpeg"
    )
    assert journal_entry.valid?
  end

  test "valid with both content and image" do
    journal_entry = JournalEntry.new(project: projects(:one), content: "Work with photo")
    journal_entry.image.attach(
      io: File.open(file_fixture("test_image.jpg")),
      filename: "test.jpg",
      content_type: "image/jpeg"
    )
    assert journal_entry.valid?
  end

  test "requires project" do
    journal_entry = JournalEntry.new(content: "Some work done")
    assert_not journal_entry.valid?
    assert_includes journal_entry.errors[:project], "must exist"
  end

  test "rejects content over 30000 characters" do
    journal_entry = JournalEntry.new(project: projects(:one), content: "a" * 30_001)
    assert_not journal_entry.valid?
    assert_includes journal_entry.errors[:content], "is too long (maximum is 30000 characters)"
  end

  test "accepts content at 30000 characters" do
    journal_entry = JournalEntry.new(project: projects(:one), content: "a" * 30_000)
    assert journal_entry.valid?
  end

  test "rejects image over 5MB" do
    journal_entry = JournalEntry.new(project: projects(:one), content: "")
    journal_entry.image.attach(
      io: StringIO.new("x" * 6.megabytes),
      filename: "large.jpg",
      content_type: "image/jpeg"
    )

    assert_not journal_entry.valid?
    assert_includes journal_entry.errors[:image], "must be less than 5MB"
  end

  test "accepts image at 5MB" do
    journal_entry = JournalEntry.new(project: projects(:one), content: "")
    journal_entry.image.attach(
      io: StringIO.new("x" * 5.megabytes),
      filename: "ok.jpg",
      content_type: "image/jpeg"
    )

    assert journal_entry.valid?
  end

  test "rejects HEIC images" do
    journal_entry = JournalEntry.new(project: projects(:one), content: "")
    journal_entry.image.attach(
      io: StringIO.new("fake heic data"),
      filename: "photo.heic",
      content_type: "image/heic"
    )

    assert_not journal_entry.valid?
    assert_includes journal_entry.errors[:image], "must be JPEG, PNG, GIF, or WEBP"
  end

  test "accepts JPEG, PNG, GIF, and WebP images" do
    journal_entry = JournalEntry.new(project: projects(:one), content: "")
    journal_entry.image.attach(
      io: File.open(file_fixture("test_image.jpg")),
      filename: "test.jpg",
      content_type: "image/jpeg"
    )
    assert journal_entry.valid?
  end

  test "last_two returns most recent two journal entries" do
    project = projects(:one)
    project.journal_entries.delete_all

    oldest = project.journal_entries.create!(content: "Oldest")
    middle = project.journal_entries.create!(content: "Middle")
    newest = project.journal_entries.create!(content: "Newest")

    result = project.journal_entries.last_two
    assert_equal 2, result.count
    assert_equal [ newest, middle ], result.to_a
  end

  test "increments counter cache on create" do
    project = projects(:one)
    initial_count = project.journal_entries_count

    project.journal_entries.create!(content: "New entry")

    assert_equal initial_count + 1, project.reload.journal_entries_count
  end

  test "decrements counter cache on destroy" do
    project = projects(:one)
    journal_entry = project.journal_entries.create!(content: "To be deleted")
    count_after_create = project.reload.journal_entries_count

    journal_entry.destroy!

    assert_equal count_after_create - 1, project.reload.journal_entries_count
  end
end
