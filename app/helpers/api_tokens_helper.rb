module ApiTokensHelper
  def scope_badge_class(scope)
    case scope
    when "read"
      "bg-blue-100 text-blue-700"
    when "write"
      "bg-amber-100 text-amber-700"
    when "read_write"
      "bg-emerald-100 text-emerald-700"
    end
  end

  def scope_label(scope)
    case scope
    when "read"
      "Read Only"
    when "write"
      "Write Only"
    when "read_write"
      "Read & Write"
    end
  end
end
