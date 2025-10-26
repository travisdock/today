class UsersController < ApplicationController
  allow_unauthenticated_access only: %i[new create]

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)

    if @user.save
      start_new_session_for(@user)
      redirect_to after_authentication_url
    else
      render :new, status: :unprocessable_entity
    end
  end

  def show
    @user = Current.session&.user
    if @user.nil?
      redirect_to new_session_path, alert: "Please sign in."
    elsif @user.id.to_s != params[:id]
      redirect_to user_path(@user)
    end
  end

  private
    def user_params
      params.require(:user).permit(:email_address, :password, :password_confirmation)
    end
end
