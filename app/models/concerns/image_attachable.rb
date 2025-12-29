module ImageAttachable
  extend ActiveSupport::Concern

  class_methods do
    def validates_image_attachment(attribute, content_types:, max_size: 5.megabytes)
      validate :"#{attribute}_content_type", if: -> { send(attribute).attached? }
      validate :"#{attribute}_file_size", if: -> { send(attribute).attached? }

      define_method(:"#{attribute}_content_type") do
        attachment = send(attribute)
        unless attachment.content_type.in?(content_types)
          formats = content_types.map { |ct| ct.split("/").last.upcase }.uniq
          errors.add(attribute, "must be #{formats.to_sentence(last_word_connector: ', or ')}")
        end
      end

      define_method(:"#{attribute}_file_size") do
        attachment = send(attribute)
        if attachment.byte_size > max_size
          errors.add(attribute, "must be less than #{max_size / 1.megabyte}MB")
        end
      end

      private :"#{attribute}_content_type", :"#{attribute}_file_size"
    end
  end
end
