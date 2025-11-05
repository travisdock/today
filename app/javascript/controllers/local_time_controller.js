import { Controller } from "@hotwired/stimulus"
import { DateTime } from "luxon"

// Connects to data-controller="local-time"
export default class extends Controller {
  static values = {
    utc: String,      // ISO 8601 UTC timestamp (e.g., "2025-11-05T23:30:00Z")
    format: String    // Format type: "short", "long", "relative", "iso"
  }

  connect() {
    this.convertToLocalTime()
  }

  convertToLocalTime() {
    try {
      // Parse UTC timestamp
      const utcTime = DateTime.fromISO(this.utcValue, { zone: 'utc' })

      if (!utcTime.isValid) {
        console.error("Invalid timestamp:", this.utcValue)
        return  // Keep server-rendered fallback
      }

      // Detect browser timezone
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      // Convert to browser's local timezone
      const localTime = utcTime.setZone(browserTimezone)

      // Format based on format value
      const formatted = this.formatTime(localTime)

      // Update element content
      this.element.textContent = formatted

      // Add tooltip with precise ISO timestamp
      this.element.title = localTime.toISO()

      // Store original UTC in data attribute (for debugging)
      this.element.dataset.originalUtc = this.utcValue

    } catch (error) {
      console.error("Error converting timestamp:", error)
      // Keep server-rendered fallback on error
    }
  }

  formatTime(dateTime) {
    const format = this.formatValue || "short"

    switch (format) {
      case "short":
        // "Nov 05, 3:30 PM"
        return dateTime.toFormat("MMM dd, h:mm a")

      case "long":
        // "Nov 05, 2025 at 3:30 PM PST"
        return dateTime.toFormat("MMM dd, yyyy 'at' h:mm a ZZZZ")

      case "longWithoutYear":
        // "Nov 05 at 3:30 PM PST"
        return dateTime.toFormat("MMM dd 'at' h:mm a ZZZZ")

      case "weekdayWithTime":
        return this.formatWeekdayWithTime(dateTime)

      default:
        return dateTime.toFormat("MMM dd, yyyy 'at' h:mm a ZZZZ")
    }
  }

  formatWeekdayWithTime(dateTime) {
    const now = DateTime.now().setZone(dateTime.zone).startOf("day")
    const targetDay = dateTime.startOf("day")
    const diffDays = Math.round(now.diff(targetDay, "days").days)
    const timePart = dateTime.toFormat("h:mm a ZZZZ")

    if (diffDays === 0) {
      return `Today at ${timePart}`
    }

    if (diffDays === 1) {
      return `Yesterday at ${timePart}`
    }

    if (diffDays > 1 && diffDays <= 7) {
      return `Last ${dateTime.toFormat("cccc")} at ${timePart}`
    }

    return dateTime.toFormat("cccc, MMM dd 'at' h:mm a ZZZZ")
  }
}
