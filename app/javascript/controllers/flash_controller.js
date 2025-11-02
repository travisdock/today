import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["message"]

  connect() {
    if (this.hasMessageTarget) {
      this.fadeOut()
    }
  }

  messageTargetConnected() {
    this.fadeOut()
  }

  fadeOut() {
    setTimeout(() => {
      this.element.style.opacity = "0"
      setTimeout(() => {
        this.element.style.opacity = "1"
        if (this.hasMessageTarget) {
          this.messageTargets.forEach(message => message.remove())
        }
      }, 500)
    }, 3000)
  }
}
