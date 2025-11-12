import { Controller } from "@hotwired/stimulus"

// Automatically fades out an element after a specified delay
export default class extends Controller {
  static values = {
    delay: { type: Number, default: 5000 }
  }

  connect() {
    this.timeout = setTimeout(() => {
      this.element.style.opacity = "0"
    }, this.delayValue)
  }

  disconnect() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }
}
