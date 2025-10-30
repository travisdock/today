class AddVoiceAgentEnabledToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :voice_agent_enabled, :boolean, null: false, default: false
  end
end
