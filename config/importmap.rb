# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "@hotwired--stimulus.js" # @3.2.2
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "stimulus-sortable" # @4.1.1
pin "@rails/request.js", to: "@rails--request.js.js" # @0.0.8
pin "sortablejs" # @1.15.6
pin "luxon", to: "https://cdn.jsdelivr.net/npm/luxon@3.4.4/build/es6/luxon.min.js"

# Streaming voice command modules
pin_all_from "app/javascript/utils", under: "utils"
pin_all_from "app/javascript/services", under: "services"
pin "@google/genai", to: "@google--genai.js" # @1.29.1
