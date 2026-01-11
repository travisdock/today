class Current < ActiveSupport::CurrentAttributes
  attribute :session
  attribute :api_token
  attribute :user

  def user
    super || session&.user
  end
end
