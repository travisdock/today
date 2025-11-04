class Todo < ApplicationRecord
  belongs_to :user

  # Priority windows in display order
  PRIORITY_WINDOWS = [:today, :tomorrow, :this_week, :next_week].freeze

  # Priority window ordering for SQL queries
  PRIORITY_WINDOW_ORDER = {
    "today" => 1,
    "tomorrow" => 2,
    "this_week" => 3,
    "next_week" => 4
  }.freeze

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
    # Build CASE statement from PRIORITY_WINDOW_ORDER constant
    case_conditions = PRIORITY_WINDOW_ORDER.map { |window, order| "WHEN '#{window}' THEN #{order}" }.join(" ")

    where(archived_at: nil)
      .order(Arel.sql("CASE priority_window #{case_conditions} END, position ASC"))
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
