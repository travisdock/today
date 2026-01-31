class BackfillProjectPositions < ActiveRecord::Migration[8.0]
  def up
    # Assign positions to existing projects based on their created_at order
    # within each user/section combination.
    #
    # The previous ordering was created_at DESC (newest first), so we assign
    # position 1 to the newest project, position 2 to the second newest, etc.
    # This preserves the existing display order when switching to position ASC.
    execute <<-SQL
      UPDATE projects
      SET position = (
        SELECT COUNT(*) + 1
        FROM projects AS p2
        WHERE p2.user_id = projects.user_id
          AND p2.section = projects.section
          AND p2.archived_at IS NULL
          AND p2.completed_at IS NULL
          AND p2.created_at > projects.created_at
      )
      WHERE archived_at IS NULL AND completed_at IS NULL
    SQL
  end

  def down
    # Reset all positions to 0
    execute "UPDATE projects SET position = 0"
  end
end
