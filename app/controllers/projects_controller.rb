class ProjectsController < ApplicationController
  def index
    @projects = current_user.projects.active.ordered
  end

  private
    def current_user
      Current.user
    end
end
