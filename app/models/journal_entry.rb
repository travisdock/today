class JournalEntry < ApplicationRecord
  include ImageAttachable

  belongs_to :project, counter_cache: true
  has_one_attached :image, dependent: :purge_later

  validate :content_or_image_present
  validates :content, length: { maximum: 30_000 }, allow_blank: true
  validates_image_attachment :image,
    content_types: %w[image/jpeg image/png image/gif image/webp],
    max_size: 5.megabytes

  scope :last_two, -> { order(created_at: :desc).limit(2) }

  private

  def content_or_image_present
    if content.blank? && !image.attached?
      errors.add(:base, "Must have content or an image")
    end
  end
end
