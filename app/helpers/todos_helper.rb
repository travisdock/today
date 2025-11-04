module TodosHelper
  PRIORITY_WINDOWS = [:today, :tomorrow, :this_week, :next_week].freeze
  PRIORITY_WINDOW_Z_INDEX_BASE = 4

  def window_z_index(window)
    index = PRIORITY_WINDOWS.index(window.to_sym)
    return PRIORITY_WINDOW_Z_INDEX_BASE unless index

    PRIORITY_WINDOW_Z_INDEX_BASE - index
  end
end
