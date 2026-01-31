# frozen_string_literal: true

class ProjectReorderingService
  class Error < StandardError; end
  class InvalidSectionError < Error; end
  class InvalidIdsError < Error; end
  class PartialReorderError < Error; end

  def initialize(user)
    @user = user
  end

  def reorder!(ordered_ids:, section:)
    validate_section!(section)
    validate_ordered_ids!(ordered_ids)

    section_sym = section.to_sym

    Project.transaction do
      section_projects = @user.projects.active
                              .where(section: section_sym)
                              .lock("FOR UPDATE")

      section_ids = section_projects.pluck(:id)

      validate_ids_match_section!(section_ids, ordered_ids)

      reorder_projects_in_section(section_projects, ordered_ids)
    end
  end

  private

  def validate_section!(section)
    section_sym = section.to_sym
    return if Project::SECTIONS.include?(section_sym)

    raise InvalidSectionError,
          "Invalid section: #{section}. Must be one of: #{Project::SECTIONS.join(', ')}"
  end

  def validate_ordered_ids!(ids)
    if ids.blank?
      raise InvalidIdsError, "ordered_ids cannot be empty"
    end

    unless ids.all? { |id| id.is_a?(Integer) && id.positive? }
      raise InvalidIdsError,
            "ordered_ids must contain only positive integers. Got: #{ids.inspect}"
    end

    if ids.size != ids.uniq.size
      raise InvalidIdsError, "ordered_ids contains duplicates"
    end
  end

  def validate_ids_match_section!(section_ids, ordered_ids)
    section_set = Set.new(section_ids)
    ordered_set = Set.new(ordered_ids)

    return if section_set == ordered_set

    missing = (section_set - ordered_set).to_a
    extra = (ordered_set - section_set).to_a

    parts = []
    parts << "Missing IDs: #{missing.join(', ')}" if missing.any?
    parts << "Extra IDs: #{extra.join(', ')}" if extra.any?

    raise PartialReorderError,
          "ordered_ids must include all projects in section. #{parts.join('. ')}"
  end

  def reorder_projects_in_section(section_projects, ordered_ids)
    max_position = section_projects.maximum(:position).to_i
    bump = max_position + ordered_ids.size + 1

    section_projects.update_all([ "position = position + ?", bump ])

    when_clauses = ordered_ids.map { "WHEN ? THEN ?" }.join(" ")
    params = ordered_ids.each_with_index.flat_map { |id, idx| [ id, idx + 1 ] }

    update_sql = ActiveRecord::Base.sanitize_sql_array([
      "position = CASE id #{when_clauses} END, updated_at = ?",
      *params,
      Time.current
    ])

    section_projects.where(id: ordered_ids).update_all(update_sql)
  end
end
