class Project < ApplicationRecord
  include ImageAttachable

  SECTIONS = [ :this_month, :next_month, :this_year, :next_year ].freeze

  SECTION_ORDER_SQL = [
    "CASE section",
    "WHEN 'this_month' THEN 1",
    "WHEN 'next_month' THEN 2",
    "WHEN 'this_year' THEN 3",
    "WHEN 'next_year' THEN 4",
    "END"
  ].join(" ").freeze

  enum :section, {
    this_month: "this_month",
    next_month: "next_month",
    this_year: "this_year",
    next_year: "next_year"
  }

  belongs_to :user
  has_one_attached :badge, dependent: :purge_later
  has_many :thoughts, dependent: :destroy
  has_many :resources, dependent: :destroy

  validates :name, presence: true, length: { maximum: 255 }
  validates :description, length: { maximum: 5000 }, allow_blank: true
  validates_image_attachment :badge,
    content_types: %w[image/jpeg image/jpg image/png],
    max_size: 5.megabytes

  scope :active, -> { where(archived_at: nil) }
  scope :ordered, -> { order(Arel.sql(SECTION_ORDER_SQL)).order(created_at: :desc) }
end
