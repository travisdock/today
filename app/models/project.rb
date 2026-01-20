class Project < ApplicationRecord
  include ImageAttachable

  SECTIONS = [ :active, :this_month, :next_month, :this_year, :next_year ].freeze

  SECTION_ORDER_SQL = [
    "CASE section",
    "WHEN 'active' THEN 1",
    "WHEN 'this_month' THEN 2",
    "WHEN 'next_month' THEN 3",
    "WHEN 'this_year' THEN 4",
    "WHEN 'next_year' THEN 5",
    "END"
  ].join(" ").freeze

  enum :section, {
    active: "active",
    this_month: "this_month",
    next_month: "next_month",
    this_year: "this_year",
    next_year: "next_year"
  }

  belongs_to :user
  has_one_attached :badge, dependent: :purge_later
  has_many :milestones, dependent: :destroy
  has_many :thoughts, dependent: :destroy
  has_many :resources, dependent: :destroy
  has_many :journal_entries, dependent: :destroy

  validates :name, presence: true, length: { maximum: 255 }
  validates :description, length: { maximum: 5000 }, allow_blank: true
  validates_image_attachment :badge,
    content_types: %w[image/jpeg image/jpg image/png],
    max_size: 5.megabytes

  scope :unarchived, -> { where(archived_at: nil) }
  scope :active, -> { unarchived.where(completed_at: nil) }
  scope :recently_completed, -> { unarchived.where.not(completed_at: nil).where("completed_at > ?", 30.days.ago) }
  scope :ordered, -> { order(Arel.sql(SECTION_ORDER_SQL)).order(created_at: :desc) }

  def completed?
    completed_at.present?
  end

  def complete!
    update!(completed_at: Time.current)
  end

  def uncomplete!
    update!(completed_at: nil)
  end
end
