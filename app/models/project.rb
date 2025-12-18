class Project < ApplicationRecord
  belongs_to :user

  validates :name, presence: true, length: { maximum: 255 }

  scope :active, -> { where(archived_at: nil) }
  scope :archived, -> { where.not(archived_at: nil) }
  scope :ordered, -> { order(:position) }
end
