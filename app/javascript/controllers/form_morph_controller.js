import { Controller } from "@hotwired/stimulus"

// Morphs a button into a form with smooth transitions
export default class extends Controller {
  static targets = ["button", "form", "formContent", "input", "container"]

  connect() {
    // Auto-expand if there are form errors
    const hasErrors = this.element.querySelector(".text-red-600")
    if (hasErrors) {
      this.expand()
    }
  }

  expand() {
    // Hide the button
    this.buttonTarget.style.opacity = "0"

    setTimeout(() => {
      this.buttonTarget.classList.add("hidden")
      this.formContentTarget.classList.remove("hidden")

      // Trigger reflow to ensure transition works
      this.formContentTarget.offsetHeight

      // Fade in the form
      this.formContentTarget.style.opacity = "1"

      // Focus the input field
      if (this.hasInputTarget) {
        setTimeout(() => {
          this.inputTarget.focus()
        }, 150)
      }
    }, 200)
  }

  collapse() {
    // Fade out the form
    this.formContentTarget.style.opacity = "0"

    setTimeout(() => {
      this.formContentTarget.classList.add("hidden")
      this.buttonTarget.classList.remove("hidden")

      // Trigger reflow
      this.buttonTarget.offsetHeight

      // Fade in the button
      this.buttonTarget.style.opacity = "1"

      // Reset form if needed
      if (this.hasFormTarget) {
        const form = this.formTarget
        if (form.tagName === "FORM") {
          form.reset()
        }
      }
    }, 200)
  }
}
