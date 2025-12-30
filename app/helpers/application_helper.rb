module ApplicationHelper
  def page_theme_color
    controller_name == "projects" ? "#1a1a2e" : "#4d8bff"
  end

  def page_gradient_class
    if controller_name == "projects"
      "bg-[linear-gradient(180deg,#1a1a2e_0%,#4a1942_35%,#c24d2c_70%,#f9a03f_100%)]"
    else
      "bg-[linear-gradient(180deg,#4d8bff_0%,#7bb3ff_35%,#ffe5c2_70%,#ffad82_100%)]"
    end
  end

  def page_title
    content_for(:title) || (controller_name == "projects" ? "Tomorrow" : "Today")
  end

  def nav_item_classes(active:)
    base = "text-base font-medium transition"
    if active
      "#{base} text-white underline underline-offset-4"
    else
      "#{base} text-white/70 hover:text-white"
    end
  end
end
