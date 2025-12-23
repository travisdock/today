class Project < ApplicationRecord
  belongs_to :user
  has_one_attached :badge, dependent: :purge_later
  has_many :thoughts, dependent: :destroy

  validates :name, presence: true, length: { maximum: 255 }
  validates :description, length: { maximum: 5000 }, allow_blank: true
  validate :badge_file_validation, if: -> { badge.attached? }

  scope :active, -> { where(archived_at: nil) }
  scope :ordered, -> { order(created_at: :desc) }

  private

  def badge_file_validation
    unless badge.content_type.in?(%w[image/jpeg image/jpg image/png])
      errors.add(:badge, "must be a JPEG or PNG image")
    end

    if badge.byte_size > 5.megabytes
      errors.add(:badge, "must be less than 5MB")
    end
  end
end
