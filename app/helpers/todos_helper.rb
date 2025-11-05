module TodosHelper
  PRIORITY_WINDOW_Z_INDEX_BASE = 4

  def window_z_index(window)
    index = Todo::PRIORITY_WINDOWS.index(window.to_sym)
    return PRIORITY_WINDOW_Z_INDEX_BASE unless index

    PRIORITY_WINDOW_Z_INDEX_BASE - index
  end

  # Renders a timezone-aware timestamp with progressive enhancement
  #
  # @param time [Time, DateTime, ActiveSupport::TimeWithZone] The timestamp to display
  # @param format [Symbol] Format type: :short, :long, :relative, etc.
  # @param fallback_format [String] strftime format for fallback (no JS)
  # @return [String] HTML string with data attributes for Stimulus
  #
  # Example:
  #   <%= local_time(todo.completed_at, format: :long) %>
  #
  def local_time(time, format: :short, fallback_format: "%b %d, %Y at %l:%M %p UTC", **html_options)
    return "" if time.nil?

    # Ensure we have a UTC timestamp
    utc_time = time.utc

    # Default CSS classes
    html_options[:class] = [ "text-xs", "text-slate-400", html_options[:class] ].compact.join(" ")

    # Data attributes for Stimulus
    html_options[:data] ||= {}
    html_options[:data][:controller] = "local-time"
    html_options[:data][:local_time_utc_value] = utc_time.iso8601
    html_options[:data][:local_time_format_value] = format.to_s

    # Fallback content (shown if JavaScript disabled)
    fallback_content = utc_time.strftime(fallback_format)

    content_tag(:time, fallback_content, html_options)
  end
end
