import { Controller } from "@hotwired/stimulus"
import { patch } from "@rails/request.js"

const DEFAULT_DELAY = 400
const ACTIVE_CLASSES = ["border-green-500", "bg-green-50", "text-green-600"]
const INACTIVE_CLASSES = ["border-slate-300", "bg-white", "text-transparent"]

export default class extends Controller {
  static values = {
    url: String,
    delay: { type: Number, default: DEFAULT_DELAY }
  }

  connect() {
    this.submitting = false
    this.resetVisualState()
  }

  disconnect() {
    this.clearPendingSubmit()
  }

  toggle(event) {
    event.preventDefault()
    if (this.submitting) return

    this.activateVisualState()
    this.clearPendingSubmit()
    this.pending = setTimeout(() => this.submit(), this.delayValue)
  }

  clearPendingSubmit() {
    if (this.pending) {
      clearTimeout(this.pending)
      this.pending = null
    }
  }

  activateVisualState() {
    this.element.classList.remove(...INACTIVE_CLASSES)
    this.element.classList.add(...ACTIVE_CLASSES)
    this.element.setAttribute("aria-checked", "true")
    this.element.disabled = true
  }

  resetVisualState() {
    this.element.classList.remove(...ACTIVE_CLASSES)
    this.element.classList.add(...INACTIVE_CLASSES)
    this.element.setAttribute("aria-checked", "false")
    this.element.disabled = false
  }

  async submit() {
    if (this.submitting) return
    this.submitting = true

    try {
      await patch(this.urlValue, {
        body: new FormData(),
        responseKind: "turbo-stream"
      })
    } catch (error) {
      console.error("Failed to mark todo as complete", error)
      this.resetVisualState()
      this.submitting = false
    } finally {
      this.clearPendingSubmit()
    }
  }
}
