class PagesController < ApplicationController
  skip_before_action :authenticate, only: [:privacy]

  def privacy
  end
end
