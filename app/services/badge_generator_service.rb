class BadgeGeneratorService
  class GenerationError < StandardError; end

  TEMPLATE_PATH = Rails.root.join("app/assets/images/merit_badge_template.jpeg")
  TEMPLATE_BASE64 = Base64.strict_encode64(File.binread(TEMPLATE_PATH)).freeze
  API_BASE_URL = "https://generativelanguage.googleapis.com".freeze
  API_ENDPOINT = "/v1beta/models/gemini-2.5-flash-image:generateContent".freeze

  def initialize(project)
    @project = project
  end

  def generate!
    validate_template!
    image_data = fetch_image_from_api
    attach_badge(image_data)
  end

  private

  def validate_template!
    return if File.exist?(TEMPLATE_PATH)

    raise GenerationError, "Badge template not found"
  end

  def fetch_image_from_api
    response = make_api_request

    unless response.success?
      Rails.logger.error("[BadgeGenerator] API returned #{response.status} for project #{@project.id}")
      raise GenerationError, "API request failed with status #{response.status}"
    end

    if response.body["error"]
      error_code = response.body.dig("error", "code")
      Rails.logger.error("[BadgeGenerator] API error #{error_code} for project #{@project.id}")
      raise GenerationError, "API returned error: #{error_code}"
    end

    image_data = extract_image_data(response.body)
    raise GenerationError, "No image data in API response" unless image_data

    image_data
  end

  def make_api_request
    connection.post(API_ENDPOINT) do |req|
      req.params["key"] = api_key
      req.body = request_body
    end
  rescue Faraday::TimeoutError => e
    Rails.logger.error("[BadgeGenerator] Timeout for project #{@project.id}")
    raise
  rescue Faraday::Error => e
    Rails.logger.error("[BadgeGenerator] Network error for project #{@project.id}: #{e.class}")
    raise GenerationError, "Network error: #{e.class}"
  end

  def connection
    @connection ||= Faraday.new(url: API_BASE_URL) do |f|
      f.request :json
      f.response :json
      f.options.timeout = 60
      f.options.open_timeout = 10
    end
  end

  def api_key
    key = Rails.application.credentials.gemini_api_key || ENV["GEMINI_API_KEY"]
    raise GenerationError, "Missing GEMINI_API_KEY" if key.blank?

    key
  end

  def request_body
    {
      contents: [ {
        parts: [
          { text: build_prompt },
          { inlineData: { mimeType: "image/jpeg", data: TEMPLATE_BASE64 } }
        ]
      } ],
      generationConfig: {
        responseModalities: %w[TEXT IMAGE]
      }
    }
  end

  def build_prompt
    sanitized_name = sanitize_for_prompt(@project.name)

    parts = [ "Add an embroidered icon to this merit badge for \"#{sanitized_name}\"." ]
    if @project.description.present?
      sanitized_desc = sanitize_for_prompt(@project.description)
      parts << "Theme: #{sanitized_desc}."
    end
    parts << "Keep the embroidered patch style. Add a simple centered icon representing the theme. No text."
    parts.join(" ")
  end

  def sanitize_for_prompt(text)
    text.to_s
      .gsub(/["'`\n\r\t\\]/, " ")
      .gsub(/\s+/, " ")
      .strip
      .truncate(200)
  end

  def extract_image_data(body)
    body.dig("candidates", 0, "content", "parts")
      &.find { |p| p["inlineData"] }
      &.dig("inlineData", "data")
  end

  def attach_badge(image_data)
    old_blob_id = @project.badge.blob&.id

    @project.badge.attach(
      io: StringIO.new(Base64.decode64(image_data)),
      filename: "badge-#{@project.id}.jpg",
      content_type: "image/jpeg"
    )

    # Purge old blob after successful attach
    if old_blob_id
      ActiveStorage::Blob.find_by(id: old_blob_id)&.purge_later
    end
  end
end
