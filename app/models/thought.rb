class Thought < ApplicationRecord
  belongs_to :project, counter_cache: true

  validates :content, presence: true, length: { maximum: 5000 }

  scope :recent, -> { order(created_at: :desc) }
  scope :last_two, -> { recent.limit(2) }
end
