import Sortable from "stimulus-sortable"
import { patch } from "@rails/request.js"

export default class extends Sortable {
  static values = {
    url: String
  }

  async onUpdate(event) {
    await super.onUpdate(event)

    if (!this.hasUrlValue) return

    const ids = this.sortable.toArray()
    if (ids.length === 0) return

    const body = new FormData()
    ids.forEach((id) => body.append("order[]", id))

    try {
      await patch(this.urlValue, {
        body,
        responseKind: "json"
      })
    } catch (error) {
      console.error("Failed to reorder todos", error)
    }
  }
}
