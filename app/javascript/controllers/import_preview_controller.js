import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["fileInput", "modal", "content", "eventType", "submitButton"]
  static values = { previewUrl: String, importUrl: String }

  selectFile() {
    this.fileInputTarget.click()
  }

  async fileSelected(event) {
    const file = event.target.files[0]
    if (!file) return

    // Show loading state
    this.showModal()
    this.contentTarget.innerHTML = '<p class="text-center text-slate-500 py-8">Analyzing file...</p>'

    // Send to preview endpoint
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(this.previewUrlValue, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
          'Accept': 'application/json'
        },
        body: formData
      })

      if (!response.ok) throw new Error('Preview failed')

      const data = await response.json()
      this.renderPreview(data)
      this.selectedFile = file
    } catch (error) {
      this.contentTarget.innerHTML = `<p class="text-center text-red-600 py-8">Error analyzing file: ${error.message}</p>`
    }
  }

  renderPreview(data) {
    let html = ''

    // New events
    if (data.new_events.length > 0) {
      html += `<div class="mb-4">
        <h3 class="font-medium text-slate-900 mb-2">${data.new_events.length} new event${data.new_events.length === 1 ? '' : 's'} will be created:</h3>
        <ul class="text-sm text-slate-600 space-y-1 ml-4">`
      data.new_events.slice(0, 10).forEach(event => {
        const dateStr = this.formatEventDate(event)
        html += `<li>• ${this.escapeHtml(event.title)} <span class="text-slate-400">(${dateStr})</span></li>`
      })
      if (data.new_events.length > 10) {
        html += `<li class="text-slate-400">...and ${data.new_events.length - 10} more</li>`
      }
      html += '</ul></div>'
    }

    // Updated events
    if (data.updated_events.length > 0) {
      html += `<div class="mb-4">
        <h3 class="font-medium text-slate-900 mb-2">${data.updated_events.length} existing event${data.updated_events.length === 1 ? '' : 's'} will be updated:</h3>
        <ul class="text-sm text-slate-600 space-y-1 ml-4">`
      data.updated_events.slice(0, 10).forEach(event => {
        const dateStr = this.formatEventDate(event)
        html += `<li>• ${this.escapeHtml(event.title)} <span class="text-slate-400">(${dateStr})</span></li>`
      })
      if (data.updated_events.length > 10) {
        html += `<li class="text-slate-400">...and ${data.updated_events.length - 10} more</li>`
      }
      html += '</ul></div>'
    }

    // Nothing to import
    if (data.new_events.length === 0 && data.updated_events.length === 0) {
      html += '<p class="text-slate-500 mb-4">No events to import.</p>'
      this.submitButtonTarget.disabled = true
      this.submitButtonTarget.classList.add('opacity-50', 'cursor-not-allowed')
    } else {
      this.submitButtonTarget.disabled = false
      this.submitButtonTarget.classList.remove('opacity-50', 'cursor-not-allowed')
    }

    // Ignored info
    const ignored = data.ignored_info
    if (ignored.recurring_events.length > 0 || ignored.attendees_ignored || ignored.organizer_ignored) {
      html += `<div class="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <h3 class="font-medium text-amber-800 mb-2">⚠ Ignored information:</h3>
        <ul class="text-sm text-amber-700 space-y-1 ml-4">`

      if (ignored.recurring_events.length > 0) {
        html += `<li>• ${ignored.recurring_events.length} recurring event${ignored.recurring_events.length === 1 ? '' : 's'} will be skipped (not supported)</li>`
        ignored.recurring_events.slice(0, 3).forEach(event => {
          html += `<li class="ml-4 text-amber-600">- ${this.escapeHtml(event.title)}</li>`
        })
      }
      if (ignored.attendees_ignored) {
        html += '<li>• Attendee data will not be imported</li>'
      }
      if (ignored.organizer_ignored) {
        html += '<li>• Organizer data will not be imported</li>'
      }
      html += '</ul></div>'
    }

    this.contentTarget.innerHTML = html
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  formatEventDate(event) {
    if (!event.starts_at) return ''

    const date = new Date(event.starts_at)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()

    if (event.all_day) {
      return `${month} ${day}, all day`
    } else {
      const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      return `${month} ${day}, ${time}`
    }
  }

  showModal() {
    this.modalTarget.classList.remove('hidden')
    document.body.classList.add('overflow-hidden')
  }

  hideModal() {
    this.modalTarget.classList.add('hidden')
    document.body.classList.remove('overflow-hidden')
    this.fileInputTarget.value = ''
    this.selectedFile = null
  }

  cancel() {
    this.hideModal()
  }

  async submit() {
    if (!this.selectedFile) return

    // Build form data for actual import
    const formData = new FormData()
    formData.append('file', this.selectedFile)
    formData.append('event_type', this.eventTypeTarget.value)

    // Submit the form
    this.submitButtonTarget.disabled = true
    this.submitButtonTarget.textContent = 'Importing...'

    try {
      const response = await fetch(this.importUrlValue, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
          'Accept': 'text/html'
        },
        body: formData
      })

      // Follow redirect
      if (response.redirected) {
        window.location.href = response.url
      } else {
        window.location.reload()
      }
    } catch (error) {
      this.submitButtonTarget.disabled = false
      this.submitButtonTarget.textContent = 'Proceed with Import'
      alert('Import failed: ' + error.message)
    }
  }
}
