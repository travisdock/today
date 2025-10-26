class Todo < ApplicationRecord
  belongs_to :user

  before_validation :normalize_title

  validates :title, presence: true, length: { maximum: 255 }

  scope :active, -> { where(archived_at: nil).order(created_at: :asc) }
  scope :archived, -> { where.not(archived_at: nil).order(archived_at: :desc) }

  def completed?
    completed_at.present?
  end

  def archived?
    archived_at.present?
  end

  private
    def normalize_title
      self.title = title.strip if title.present?
    end
end
