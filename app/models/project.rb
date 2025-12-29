class Project < ApplicationRecord
  include ImageAttachable

  belongs_to :user
  has_one_attached :badge, dependent: :purge_later
  has_many :thoughts, dependent: :destroy

  validates :name, presence: true, length: { maximum: 255 }
  validates :description, length: { maximum: 5000 }, allow_blank: true
  validates_image_attachment :badge,
    content_types: %w[image/jpeg image/jpg image/png],
    max_size: 5.megabytes

  scope :active, -> { where(archived_at: nil) }
  scope :ordered, -> { order(created_at: :desc) }
end
