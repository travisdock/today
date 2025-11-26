module ApplicationCable
  class Channel < ActionCable::Channel::Base
    # Override to suppress logging for high-frequency actions like receive_audio
    def dispatch_action(action, data)
      # Only log if not in the skip list
      logger.info action_signature(action, data) unless skip_logging_for(action: action)

      if method(action).arity == 1
        public_send action, data
      else
        public_send action
      end
    rescue Exception => exception
      rescue_with_handler(exception) || raise
    end

    private

    def skip_logging_for(action:)
      # Suppress logging for receive_audio - it fires constantly with large base64 data
      action.to_s == "receive_audio"
    end
  end
end
