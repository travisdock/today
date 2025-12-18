class BadgeGeneratorService
  TEMPLATE_PATH = Rails.root.join("app/assets/images/merit_badge_template.jpeg")

  def initialize(project)
    @project = project
  end

  def generate!
    image_data = generate_image
    if image_data
      attach_badge(image_data)
      Rails.logger.info("[BadgeGenerator] Badge attached for project #{@project.id}")
    else
      Rails.logger.warn("[BadgeGenerator] No image data returned for project #{@project.id}")
    end
  end

  private

  def generate_image
    api_key = Rails.application.credentials.gemini_api_key || ENV["GEMINI_API_KEY"]
    Rails.logger.info("[BadgeGenerator] API key present: #{api_key.present?}")
    template_base64 = Base64.strict_encode64(File.binread(TEMPLATE_PATH))

    conn = Faraday.new(url: "https://generativelanguage.googleapis.com") do |f|
      f.request :json
      f.response :json
      f.options.timeout = 30
    end

    response = conn.post("/v1beta/models/gemini-2.5-flash-image:generateContent") do |req|
      req.params["key"] = api_key
      req.body = {
        contents: [{
          parts: [
            { text: build_prompt },
            { inlineData: { mimeType: "image/jpeg", data: template_base64 } }
          ]
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      }
    end

    Rails.logger.info("[BadgeGenerator] API response status: #{response.status}")
    Rails.logger.info("[BadgeGenerator] API response keys: #{response.body.keys rescue 'parse error'}")
    if response.body["error"]
      Rails.logger.error("[BadgeGenerator] API error: #{response.body["error"]}")
    end

    extract_image_data(response.body)
  end

  def build_prompt
    parts = ["Add an embroidered icon to this merit badge for \"#{@project.name}\"."]
    parts << "Theme: #{@project.description}." if @project.description.present?
    parts << "Keep the embroidered patch style. Add a simple centered icon representing the theme. No text."
    parts.join(" ")
  end

  def extract_image_data(body)
    body.dig("candidates", 0, "content", "parts")
      &.find { |p| p["inlineData"] }
      &.dig("inlineData", "data")
  end

  def attach_badge(image_data)
    @project.badge.purge if @project.badge.attached?

    @project.badge.attach(
      io: StringIO.new(Base64.decode64(image_data)),
      filename: "badge-#{@project.id}.jpg",
      content_type: "image/jpeg"
    )
  end
end
