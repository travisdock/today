require "base64"

module OpenRouter
  class Transcribe
    attr_reader :transcription

    def initialize(audio_path, prompt: "Please transcribe this audio file.", client: OpenRouter::Client.new)
      base64_audio = encode_audio_to_base64(audio_path)

      messages = [
        {
          "role" => "user",
          "content" => [
            { "type" => "text", "text" => prompt },
            {
              "type" => "input_audio",
              "input_audio" => {
                "data" => base64_audio,
                "format" => "wav" # This only works if I put wav here ¯\_(ツ)_/¯
              }
            }
          ]
        }
      ]

      @transcription = send_request(messages, client)
    end

    private

    def encode_audio_to_base64(audio_path)
      Base64.strict_encode64(File.read(audio_path))
    end

    def send_request(messages, client)
      response = client.chat(messages: messages)
      Rails.logger.debug("Transcription response: #{response}")
      transcription = extract_transcription(response)
      Rails.logger.error("Transcription missing in response") if transcription.blank?
      transcription
    rescue StandardError => e
      Rails.logger.error("Transcription error: #{e.message}")
      nil
    end

    def extract_transcription(response)
      message = response.dig("choices", 0, "message")
      return if message.blank?

      content = message["content"]
      text =
        case content
        when Array
          texts = content.filter_map do |item|
            next unless item.is_a?(Hash) || item.is_a?(String)
            item.is_a?(Hash) ? (item["text"] || item["content"]) : item
          end
          texts.map(&:to_s).map(&:strip).reject(&:blank?).join("\n")
        when String
          content.strip
        end

      text = message["text"].to_s.strip if text.blank? && message["text"].is_a?(String)
      text.presence
    end
  end
end
