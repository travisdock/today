require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  test "new" do
    get new_user_path
    assert_response :success
  end

  test "create with valid attributes" do
    assert_difference -> { User.count }, 1 do
      post users_path, params: { user: { email_address: "new@example.com", password: "password", password_confirmation: "password" } }
    end

    user = User.find_by(email_address: "new@example.com")
    assert_not_nil user
    assert_redirected_to todos_path
    assert cookies[:session_id]
  end

  test "create with invalid attributes" do
    assert_no_difference -> { User.count } do
      post users_path, params: { user: { email_address: "", password: "", password_confirmation: "" } }
    end

    assert_response :unprocessable_entity
  end

  test "show displays current user" do
    user = users(:one)
    sign_in_as(user)

    get user_path(user)

    assert_response :success
  end
end
