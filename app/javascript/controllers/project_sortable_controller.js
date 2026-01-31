import Sortable from "stimulus-sortable"
import { patch } from "@rails/request.js"

export default class extends Sortable {
  static values = {
    url: String,
    section: String
  }

  get options() {
    const options = super.options

    return {
      ...options,
      fallbackOnBody: true,
      delay: 200,
      delayOnTouchOnly: true,
      touchStartThreshold: 8,
      group: {
        name: 'projects',
        pull: false,
        put: false
      }
    }
  }

  async onUpdate(event) {
    await super.onUpdate(event)

    if (!this.hasUrlValue) return

    const ids = this.sortable.toArray()
    if (ids.length === 0) return

    const body = new FormData()
    ids.forEach((id) => body.append("order[]", id))
    body.append("section", this.sectionValue)

    try {
      await patch(this.urlValue, {
        body,
        responseKind: "json"
      })
    } catch (error) {
      console.error("Failed to reorder projects", error)
    }
  }
}
