# frozen_string_literal: true

# Suppress verbose Action Cable logging for high-frequency actions
# by filtering out specific log messages
class FilteredLogFormatter
  def initialize(original_formatter)
    @original_formatter = original_formatter
  end

  def call(severity, timestamp, progname, msg)
    # Skip receive_audio logs
    return if msg.to_s.include?("GeminiLiveChannel#receive_audio")

    if @original_formatter.respond_to?(:call)
      @original_formatter.call(severity, timestamp, progname, msg)
    else
      "#{timestamp} #{severity} #{msg}\n"
    end
  end

  # Delegate all other methods to the original formatter
  def method_missing(method, *args, &block)
    @original_formatter.send(method, *args, &block)
  end

  def respond_to_missing?(method, include_private = false)
    @original_formatter.respond_to?(method, include_private) || super
  end
end

Rails.application.config.after_initialize do
  if Rails.logger.respond_to?(:formatter)
    original_formatter = Rails.logger.formatter || ActiveSupport::Logger::SimpleFormatter.new
    Rails.logger.formatter = FilteredLogFormatter.new(original_formatter)
  end
end
