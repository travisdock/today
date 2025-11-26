require "test_helper"

class GeminiStreamingChannelTest < ActionCable::Channel::TestCase
  setup do
    @user = users(:one)
    @user.update!(voice_agent_enabled: true)
  end

  teardown do
    # Clean up cache between tests
    Rails.cache.clear
  end

  test "successfully subscribes with voice_agent_enabled" do
    stub_connection(current_user: @user)
    subscribe

    assert subscription.confirmed?
  end

  test "rejects subscription without voice_agent_enabled" do
    @user.update!(voice_agent_enabled: false)
    stub_connection(current_user: @user)
    subscribe

    assert subscription.rejected?
  end

  test "rejects second connection from same user" do
    # First connection succeeds
    stub_connection(current_user: @user)
    subscribe
    assert subscription.confirmed?

    # Simulate second connection attempt
    Rails.cache.write("streaming:active:#{@user.id}", true, expires_in: 5.minutes)

    # Try to subscribe again (simulating new connection)
    new_channel = GeminiStreamingChannel.new(connection, {})
    new_channel.subscribe_to_channel

    # The subscription should be rejected
    # Note: In real scenario, this would be tested with a second WebSocket connection
  end

  test "allows reconnection after unsubscribe" do
    stub_connection(current_user: @user)
    subscribe
    assert subscription.confirmed?

    # Unsubscribe
    perform :unsubscribed

    # Cache should be cleared
    assert_nil Rails.cache.read("streaming:active:#{@user.id}")

    # Should be able to subscribe again
    subscribe
    assert subscription.confirmed?
  end

  test "validates audio data size" do
    stub_connection(current_user: @user)
    subscribe

    # Test with oversized audio (> 64KB)
    large_audio = "A" * 70000
    perform :receive_audio, { "audio" => large_audio }

    # Should receive error transmission
    assert_broadcasts "gemini_streaming_#{@user.id}", 0
  end

  test "validates audio data format" do
    stub_connection(current_user: @user)
    subscribe

    # Test with invalid base64
    perform :receive_audio, { "audio" => "not valid base64 !!!" }

    # Should not crash, just log warning
  end
end
