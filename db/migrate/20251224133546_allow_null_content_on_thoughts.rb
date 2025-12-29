class AllowNullContentOnThoughts < ActiveRecord::Migration[8.0]
  def change
    change_column_null :thoughts, :content, true
  end
end
