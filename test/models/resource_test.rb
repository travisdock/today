require "test_helper"

class ResourceTest < ActiveSupport::TestCase
  test "requires content or url" do
    resource = Resource.new(project: projects(:one), content: "", url: "")
    assert_not resource.valid?
    assert_includes resource.errors[:base], "Must have content or a URL"
  end

  test "valid with content only" do
    resource = Resource.new(project: projects(:one), content: "Some notes", url: "")
    assert resource.valid?
  end

  test "valid with url only" do
    resource = Resource.new(project: projects(:one), content: "", url: "https://example.com")
    assert resource.valid?
  end

  test "valid with both content and url" do
    resource = Resource.new(project: projects(:one), content: "Great resource", url: "https://example.com")
    assert resource.valid?
  end

  test "requires project" do
    resource = Resource.new(content: "Some notes")
    assert_not resource.valid?
    assert_includes resource.errors[:project], "must exist"
  end

  test "rejects content over 5000 characters" do
    resource = Resource.new(project: projects(:one), content: "a" * 5001)
    assert_not resource.valid?
    assert_includes resource.errors[:content], "is too long (maximum is 5000 characters)"
  end

  test "accepts content at 5000 characters" do
    resource = Resource.new(project: projects(:one), content: "a" * 5000)
    assert resource.valid?
  end

  test "rejects url over 2000 characters" do
    long_url = "https://example.com/" + "a" * 2000
    resource = Resource.new(project: projects(:one), url: long_url)
    assert_not resource.valid?
    assert_includes resource.errors[:url], "is too long (maximum is 2000 characters)"
  end

  test "accepts url at 2000 characters" do
    long_url = "https://example.com/" + "a" * (2000 - "https://example.com/".length)
    resource = Resource.new(project: projects(:one), url: long_url)
    assert resource.valid?
  end

  test "rejects javascript url" do
    resource = Resource.new(project: projects(:one), url: "javascript:alert(1)")
    assert_not resource.valid?
    assert_includes resource.errors[:url], "must be a valid HTTP or HTTPS URL"
  end

  test "rejects data url" do
    resource = Resource.new(project: projects(:one), url: "data:text/html,<script>alert(1)</script>")
    assert_not resource.valid?
    assert_includes resource.errors[:url], "must be a valid HTTP or HTTPS URL"
  end

  test "rejects ftp url" do
    resource = Resource.new(project: projects(:one), url: "ftp://files.example.com")
    assert_not resource.valid?
    assert_includes resource.errors[:url], "must be a valid HTTP or HTTPS URL"
  end

  test "accepts http url" do
    resource = Resource.new(project: projects(:one), url: "http://example.com")
    assert resource.valid?
  end

  test "accepts https url" do
    resource = Resource.new(project: projects(:one), url: "https://example.com")
    assert resource.valid?
  end

  test "accepts https url with path and query" do
    resource = Resource.new(project: projects(:one), url: "https://youtube.com/watch?v=abc123")
    assert resource.valid?
  end

  test "last_two returns most recent two resources" do
    project = projects(:one)
    project.resources.delete_all

    oldest = project.resources.create!(content: "Oldest")
    middle = project.resources.create!(content: "Middle")
    newest = project.resources.create!(content: "Newest")

    result = project.resources.last_two
    assert_equal 2, result.count
    assert_equal [ newest, middle ], result.to_a
  end

  test "increments counter cache on create" do
    project = projects(:one)
    initial_count = project.resources_count

    project.resources.create!(content: "New resource")

    assert_equal initial_count + 1, project.reload.resources_count
  end

  test "decrements counter cache on destroy" do
    project = projects(:one)
    resource = project.resources.create!(content: "To be deleted")
    count_after_create = project.reload.resources_count

    resource.destroy!

    assert_equal count_after_create - 1, project.reload.resources_count
  end
end
