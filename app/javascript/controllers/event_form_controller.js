import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["startsAt", "endsAt", "allDay", "timeFields"]

  connect() {
    this.toggleTimeFields()
  }

  updateEndTime() {
    const startsAt = this.startsAtTarget.value
    if (!startsAt) return

    // Parse the datetime-local value and add 1 hour
    const startDate = new Date(startsAt)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

    // Format as datetime-local value (YYYY-MM-DDTHH:MM)
    this.endsAtTarget.value = this.formatDateTimeLocal(endDate)
  }

  toggleTimeFields() {
    const isAllDay = this.allDayTarget.checked
    this.timeFieldsTarget.classList.toggle("opacity-40", isAllDay)
    this.timeFieldsTarget.classList.toggle("pointer-events-none", isAllDay)
  }

  formatDateTimeLocal(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
}
