class Todo < ApplicationRecord
  belongs_to :user

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

  # Updated scope to order by window priority, then position
  scope :active, -> {
    where(archived_at: nil)
      .order(Arel.sql(PRIORITY_WINDOW_CASE_SQL))
      .order(position: :asc)
  }

  scope :archived, -> { where.not(archived_at: nil).order(archived_at: :desc) }

  # Window-specific scopes
  scope :in_today, -> { active.where(priority_window: "today") }
  scope :in_tomorrow, -> { active.where(priority_window: "tomorrow") }
  scope :in_this_week, -> { active.where(priority_window: "this_week") }
  scope :in_next_week, -> { active.where(priority_window: "next_week") }

  def completed?
    completed_at.present?
  end

  def archived?
    archived_at.present?
  end

  private
    # UPDATED: Position scoped by priority_window
    def assign_position
      return unless user
      return unless archived_at.nil?
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
      where(user_id: user.id, priority_window: window, archived_at: nil)
        .lock("FOR UPDATE")
        .maximum(:position).to_i + 1
    end
end
