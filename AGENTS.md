# Today App – Agent Guide

This document captures the key conventions and workflows so any contributor (human or AI) can ramp up quickly.

## High-Level Overview
- **Framework:** Ruby on Rails 8.1 with SQLite (development/test) and Hotwire defaults (Turbo + Stimulus).
- **Authentication:** Custom email/password auth generated from Rails’ authentication template, then trimmed down (no password reset email). `User`, `Session`, and `Current` models manage login state. Sign-in, sign-up, and account show pages are in place.
- **Styling:** Tailwind CSS v4 via `tailwindcss-rails`. We rely exclusively on utility classes—no legacy CSS files remain. The app intentionally features a sunrise-gradient background across all screens.
- **Testing:** Minitest with fixtures; `test/test_helper.rb` loads custom helpers (`SessionTestHelper`) for controller specs.

## Code Conventions
- **Authentication helpers:** `Authentication` concern in `app/controllers/concerns/authentication.rb` centralizes session handling. Use `allow_unauthenticated_access` for new controllers that need public routes.
- **Views:** Favor Tailwind utility classes; reuse layout patterns (e.g., centered content within `main`).
- **Tests:** When covering controller flows that rely on sessions, use `sign_in_as` from `SessionTestHelper`.

## Before submitting changes:
   - `bundle exec rubocop`
   - `bin/rails test`

