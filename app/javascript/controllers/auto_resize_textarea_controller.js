import { Controller } from "@hotwired/stimulus"

// Automatically resizes a textarea to fit its content
export default class extends Controller {
  static values = {
    minRows: { type: Number, default: 2 },
    maxRows: { type: Number, default: 10 }
  }

  connect() {
    this.resize()
  }

  resize() {
    const textarea = this.element
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24
    const paddingTop = parseInt(getComputedStyle(textarea).paddingTop) || 0
    const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom) || 0
    const padding = paddingTop + paddingBottom

    const minHeight = (this.minRowsValue * lineHeight) + padding
    const maxHeight = (this.maxRowsValue * lineHeight) + padding

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'

    // Calculate new height based on content
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
    textarea.style.height = `${newHeight}px`

    // Show scrollbar if content exceeds max height
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }
}
