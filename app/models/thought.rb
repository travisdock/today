class Thought < ApplicationRecord
  belongs_to :project, counter_cache: true

  validates :content, presence: true, length: { maximum: 30_000 }

  scope :last_two, -> { order(created_at: :desc).limit(2) }
end
