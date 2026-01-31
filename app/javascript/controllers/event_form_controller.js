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

    if (isAllDay) {
      // Convert datetime-local to date
      this.startsAtTarget.type = "date"
      this.endsAtTarget.type = "date"
      this.startsAtTarget.value = this.extractDate(this.startsAtTarget.value)
      this.endsAtTarget.value = this.extractDate(this.endsAtTarget.value)
    } else {
      // Convert date to datetime-local
      const startDate = this.startsAtTarget.value
      const endDate = this.endsAtTarget.value
      this.startsAtTarget.type = "datetime-local"
      this.endsAtTarget.type = "datetime-local"
      if (startDate) this.startsAtTarget.value = `${startDate}T09:00`
      if (endDate) this.endsAtTarget.value = `${endDate}T10:00`
    }
  }

  extractDate(value) {
    if (!value) return ""
    return value.substring(0, 10)
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
