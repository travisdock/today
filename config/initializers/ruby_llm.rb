# frozen_string_literal: true

RubyLLM.configure do |config|
  config.openrouter_api_key = ENV["OPENROUTER_API_KEY"]
  config.request_timeout = 90
end
