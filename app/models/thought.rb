class Thought < ApplicationRecord
  belongs_to :project, counter_cache: true
  has_one_attached :image, dependent: :purge_later

  validate :content_or_image_present
  validates :content, length: { maximum: 30_000 }, allow_blank: true
  validate :image_file_validation, if: -> { image.attached? }

  scope :last_two, -> { order(created_at: :desc).limit(2) }

  private

  def content_or_image_present
    if content.blank? && !image.attached?
      errors.add(:base, "Must have content or an image")
    end
  end

  ALLOWED_IMAGE_TYPES = %w[image/jpeg image/png image/gif image/webp].freeze

  def image_file_validation
    unless image.content_type.in?(ALLOWED_IMAGE_TYPES)
      errors.add(:image, "must be JPEG, PNG, GIF, or WebP")
    end

    if image.byte_size > 5.megabytes
      errors.add(:image, "must be less than 5MB")
    end
  end
end
