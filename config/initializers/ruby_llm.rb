# frozen_string_literal: true

# Configure ruby_llm for AI-powered voice transcription and todo extraction
# Using OpenRouter to access Gemini 2.5 Flash for cost-effective audio processing
RubyLLM.configure do |config|
  # OpenRouter API key from Rails encrypted credentials
  # Add with: EDITOR="code --wait" rails credentials:edit
  # Then add: openrouter: { api_key: "sk-or-v1-xxxxx" }
  config.openrouter_api_key = Rails.application.credentials.dig(:openrouter, :api_key)

  # Default to Gemini 2.5 Flash for audio processing
  # - Supports native audio input (no separate transcription step)
  # - Built-in tool calling for structured output
  # - Cost-effective: $0.30/M input tokens, $2.50/M output tokens
  # - Audio: ~25 tokens per second (~$0.001 per 1-minute voice note)
  config.default_model = "google/gemini-2.5-flash"

  # Increase timeout for audio processing (can take longer than text)
  config.request_timeout = 120

  # Retry failed requests up to 5 times (network issues, rate limits, etc.)
  config.max_retries = 5

  # Log all API requests/responses in development for debugging
  config.logger = Rails.logger
end
