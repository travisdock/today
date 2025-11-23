class AddStreamingVoiceEnabledToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :streaming_voice_enabled, :boolean, null: false, default: false
  end
end
