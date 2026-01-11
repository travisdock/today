class ApiTokensController < ApplicationController
  before_action :set_api_token, only: [ :destroy ]

  def index
    @api_tokens = current_user.api_tokens.active.order(created_at: :desc)
    @new_token = current_user.api_tokens.build
    @plaintext_token = flash[:new_token]
  end

  def create
    token_record, plaintext_token = ApiToken.generate_for(
      user: current_user,
      name: api_token_params[:name],
      scopes: api_token_params[:scopes]
    )

    flash[:new_token] = plaintext_token
    redirect_to api_tokens_path, notice: "Token created successfully. Copy it now - it won't be shown again!"
  rescue ActiveRecord::RecordInvalid => e
    @api_tokens = current_user.api_tokens.active.order(created_at: :desc)
    @new_token = current_user.api_tokens.build(api_token_params)
    @new_token.errors.merge!(e.record.errors)
    render :index, status: :unprocessable_entity
  end

  def destroy
    @api_token.revoke!

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.remove("api_token_#{@api_token.id}")
      end
      format.html { redirect_to api_tokens_path, notice: "Token revoked." }
    end
  end

  private

  def set_api_token
    @api_token = current_user.api_tokens.active.find(params[:id])
  end

  def api_token_params
    params.require(:api_token).permit(:name, :scopes)
  end
end
