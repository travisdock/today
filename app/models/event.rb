class Event < ApplicationRecord
  belongs_to :user
  belongs_to :project, optional: true

  enum :event_type, { personal: "personal", reminder: "reminder" }, default: :personal

  validates :title, presence: true
  validates :starts_at, presence: true
  validates :ends_at, presence: true
  validates :uid, presence: true, uniqueness: { scope: :user_id }
  validate :ends_at_after_starts_at

  before_validation :generate_uid, on: :create

  scope :upcoming, -> { where("starts_at >= ?", Time.current).order(:starts_at) }
  scope :past, -> { where("starts_at < ?", Time.current).order(starts_at: :desc) }
  scope :for_date_range, ->(start_date, end_date) {
    where("DATE(starts_at) >= ? AND DATE(starts_at) <= ?", start_date, end_date).order(:starts_at)
  }
  scope :for_month, ->(year, month) {
    start_of_month = Date.new(year, month, 1)
    end_of_month = start_of_month.end_of_month
    for_date_range(start_of_month, end_of_month)
  }
  scope :reminders, -> { reminder }

  def display_starts_at
    all_day? ? starts_at.utc.to_date : starts_at.in_time_zone
  end

  def display_ends_at
    all_day? ? ends_at.utc.to_date : ends_at.in_time_zone
  end

  private

  def generate_uid
    self.uid ||= "#{SecureRandom.uuid}@today.travserve.net"
  end

  def ends_at_after_starts_at
    return if starts_at.blank? || ends_at.blank?

    if ends_at < starts_at
      errors.add(:ends_at, "must be after or equal to start time")
    end
  end
end
