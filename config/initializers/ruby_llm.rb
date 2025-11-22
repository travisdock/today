RubyLLM.configure do |config|
  config.gemini_api_key = Rails.application.credentials.gemini_api_key || ENV['GEMINI_API_KEY']
end
