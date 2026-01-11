class ApiToken < ApplicationRecord
  SCOPES = %w[read write read_write].freeze
  TOKEN_PREFIX = "pat_"
  TOKEN_LENGTH = 32

  belongs_to :user

  validates :name, presence: true, length: { maximum: 255 }
  validates :token_digest, presence: true, uniqueness: true
  validates :token_prefix, presence: true, length: { maximum: 8 }
  validates :scopes, presence: true, inclusion: { in: SCOPES }

  scope :active, -> { where(revoked_at: nil) }
  scope :revoked, -> { where.not(revoked_at: nil) }

  class << self
    def generate_for(user:, name:, scopes: "read")
      plaintext = generate_token
      prefix = plaintext[0, 8]
      digest = Digest::SHA256.hexdigest(plaintext)

      token = user.api_tokens.create!(
        name: name,
        token_digest: digest,
        token_prefix: prefix,
        scopes: scopes
      )

      [ token, plaintext ]
    end

    def find_by_token(plaintext_token)
      return nil unless plaintext_token.present?
      return nil unless plaintext_token.start_with?(TOKEN_PREFIX)

      digest = Digest::SHA256.hexdigest(plaintext_token)
      active.find_by(token_digest: digest)
    end

    private

    def generate_token
      "#{TOKEN_PREFIX}#{SecureRandom.base58(TOKEN_LENGTH)}"
    end
  end

  def revoke!
    update!(revoked_at: Time.current)
  end

  def revoked?
    revoked_at.present?
  end

  def record_usage!
    update_columns(last_used_at: Time.current)
  end

  def can_read?
    scopes == "read" || scopes == "read_write"
  end

  def can_write?
    scopes == "write" || scopes == "read_write"
  end
end
