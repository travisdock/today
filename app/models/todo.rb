class Todo < ApplicationRecord
  belongs_to :user
  belongs_to :milestone, optional: true, touch: true

  # Priority windows in display order
  PRIORITY_WINDOWS = [ :today, :tomorrow, :this_week, :next_week ].freeze

  PRIORITY_WINDOW_CASE_SQL = [
    "CASE priority_window",
    "WHEN 'today' THEN 1",
    "WHEN 'tomorrow' THEN 2",
    "WHEN 'this_week' THEN 3",
    "WHEN 'next_week' THEN 4",
    "END"
  ].join(" ").freeze

  # Define enum for priority windows
  enum :priority_window, {
    today: "today",
    tomorrow: "tomorrow",
    this_week: "this_week",
    next_week: "next_week"
  }

  before_validation :assign_position, on: :create
  before_validation :normalize_title

  validates :title, presence: true, length: { maximum: 255 }
  validates :priority_window, presence: true
  validate :milestone_belongs_to_same_user, if: :milestone_id?

  # Updated scope to order by window priority, then position
  scope :active, -> {
    where(completed_at: nil)
      .order(Arel.sql(PRIORITY_WINDOW_CASE_SQL))
      .order(position: :asc)
  }

  scope :completed, -> {
    where.not(completed_at: nil)
      .where("completed_at >= ?", 7.days.ago)
      .order(completed_at: :desc)
  }

  def completed?
    completed_at.present?
  end

  private

    def milestone_belongs_to_same_user
      return if milestone&.project&.user_id == user_id

      errors.add(:milestone, "must belong to one of your projects")
    end

    # UPDATED: Position scoped by priority_window
    def assign_position
      return unless user
      return unless completed_at.nil?
      return if position.present? && position.positive?

      user.with_lock do
        self.position = self.class.next_position_for_user_and_window(user, priority_window)
      end
    end

    def normalize_title
      self.title = title.strip if title.present?
    end

    # Updated to scope by priority window
    def self.next_position_for_user_and_window(user, window)
      where(user_id: user.id, priority_window: window, completed_at: nil)
        .lock("FOR UPDATE")
        .maximum(:position).to_i + 1
    end
end
