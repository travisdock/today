require "net/http"

module OpenRouter
  class Client
    API_URL = "https://openrouter.ai/api/v1/chat/completions".freeze
    API_KEY = Rails.application.credentials.dig(:openrouter, :api_key)

    def initialize(api_key: API_KEY, model: "google/gemini-2.5-flash", extra_headers: {}, timeout: {})
      @api_key = api_key
      @model = model
      @extra_headers = extra_headers
      timeout_options = timeout || {}
      timeout_options = if timeout_options.respond_to?(:symbolize_keys)
        timeout_options.symbolize_keys
      elsif timeout_options.respond_to?(:transform_keys)
        timeout_options.transform_keys { |key| key.to_sym rescue key }
      else
        timeout_options
      end
      @timeouts = {
        open: 5,
        read: 30,
        write: 15
      }.merge(timeout_options)
    end

    def chat(messages:, tools: nil, tool_choice: nil, temperature: 0.2)
      url = URI(API_URL)
      http = Net::HTTP.new(url.host, url.port)
      http.use_ssl = true
      http.open_timeout = @timeouts[:open]
      http.read_timeout = @timeouts[:read]
      http.write_timeout = @timeouts[:write]

      headers = {
        "Authorization" => "Bearer #{@api_key}",
        "Content-Type"  => "application/json"
      }.merge(@extra_headers)

      payload = {
        model: @model,
        messages: messages,
        temperature: temperature
      }
      payload[:tools] = tools if tools
      payload[:tool_choice] = tool_choice if tool_choice

      request = Net::HTTP::Post.new(url, headers)
      request.body = JSON.generate(payload)

      resp = http.request(request)
      raise("OpenRouter error: #{resp.code} #{resp.body}") unless resp.is_a?(Net::HTTPSuccess)
      JSON.parse(resp.body)
    end
  end
end
