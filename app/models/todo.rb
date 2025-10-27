class Todo < ApplicationRecord
  belongs_to :user

  before_validation :assign_position, on: :create
  before_validation :normalize_title

  validates :title, presence: true, length: { maximum: 255 }

  scope :active, -> { where(archived_at: nil).order(position: :asc, created_at: :asc) }
  scope :archived, -> { where.not(archived_at: nil).order(archived_at: :desc) }

  def completed?
    completed_at.present?
  end

  def archived?
    archived_at.present?
  end

  private
    def assign_position
      return unless user
      return unless archived_at.nil?
      return if position.present? && position.positive?

      user.with_lock do
        self.position = self.class.next_position_for_user(user)
      end
    end

    def normalize_title
      self.title = title.strip if title.present?
    end

    def self.next_position_for_user(user)
      where(user_id: user.id, archived_at: nil).lock("FOR UPDATE").maximum(:position).to_i + 1
    end
end
