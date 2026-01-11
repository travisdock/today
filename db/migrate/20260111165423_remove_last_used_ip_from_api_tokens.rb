class RemoveLastUsedIpFromApiTokens < ActiveRecord::Migration[8.1]
  def change
    remove_column :api_tokens, :last_used_ip, :string
  end
end
