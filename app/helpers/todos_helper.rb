module TodosHelper
  PRIORITY_WINDOW_Z_INDEX_BASE = 4

  def window_z_index(window)
    index = Todo::PRIORITY_WINDOWS.index(window.to_sym)
    return PRIORITY_WINDOW_Z_INDEX_BASE unless index

    PRIORITY_WINDOW_Z_INDEX_BASE - index
  end
end
