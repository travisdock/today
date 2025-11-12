import { Controller } from "@hotwired/stimulus"

// Handles accordion expand/collapse behavior
export default class extends Controller {
  static targets = ["content", "icon"]

  connect() {
    // Auto-expand if there are form errors
    const hasErrors = this.element.querySelector(".text-red-600")
    if (hasErrors) {
      this.expand()
    }
  }

  toggle() {
    this.contentTarget.classList.toggle("hidden")

    // Rotate the icon when expanded/collapsed
    if (this.hasIconTarget) {
      this.iconTarget.classList.toggle("rotate-180")
    }
  }

  expand() {
    this.contentTarget.classList.remove("hidden")
    if (this.hasIconTarget) {
      this.iconTarget.classList.add("rotate-180")
    }
  }
}
