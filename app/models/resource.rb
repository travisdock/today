class Resource < ApplicationRecord
  belongs_to :project, counter_cache: true

  validate :content_or_url_present
  validates :content, length: { maximum: 5000 }, allow_blank: true
  validates :url,
            length: { maximum: 2000 },
            allow_blank: true,
            format: {
              with: URI::DEFAULT_PARSER.make_regexp(%w[http https]),
              message: "must be a valid HTTP or HTTPS URL"
            }

  scope :last_two, -> { order(created_at: :desc).limit(2) }

  private

  def content_or_url_present
    if content.blank? && url.blank?
      errors.add(:base, "Must have content or a URL")
    end
  end
end
