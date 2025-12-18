class Project < ApplicationRecord
  belongs_to :user
  has_one_attached :badge

  validates :name, presence: true, length: { maximum: 255 }
  validates :description, length: { maximum: 5000 }, allow_blank: true

  scope :active, -> { where(archived_at: nil) }
  scope :ordered, -> { order(created_at: :desc) }
end
