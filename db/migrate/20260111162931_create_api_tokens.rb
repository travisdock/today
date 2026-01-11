class CreateApiTokens < ActiveRecord::Migration[8.1]
  def change
    create_table :api_tokens do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.string :name, null: false, limit: 255
      t.string :token_digest, null: false
      t.string :token_prefix, null: false, limit: 8
      t.string :scopes, null: false, default: "read"
      t.datetime :last_used_at
      t.string :last_used_ip
      t.datetime :revoked_at

      t.timestamps
    end

    add_index :api_tokens, :token_digest, unique: true
    add_index :api_tokens, :token_prefix
    add_index :api_tokens, [ :user_id, :revoked_at ]
  end
end
