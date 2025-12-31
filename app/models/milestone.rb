class Milestone < ApplicationRecord
  belongs_to :project, touch: true
  has_many :todos, dependent: :nullify

  validates :name, presence: true, length: { maximum: 255 }

  scope :active, -> { where(completed_at: nil).order(:position) }
  scope :completed, -> { where.not(completed_at: nil).order(completed_at: :desc) }

  before_validation :assign_position, on: :create

  def completed?
    completed_at.present?
  end

  def complete!
    update!(completed_at: Time.current)
  end

  def uncomplete!
    update!(completed_at: nil)
  end

  private

  def assign_position
    return if position.present? && position > 0

    max_position = project&.milestones&.maximum(:position) || 0
    self.position = max_position + 1
  end
end
