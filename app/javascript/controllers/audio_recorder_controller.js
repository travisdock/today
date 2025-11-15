import { Controller } from "@hotwired/stimulus"

// Handles microphone recording and submits the enclosing form with the audio file.
export default class extends Controller {
  static targets = ["button", "input"]

  connect() {
    this.mediaRecorder = null
    this.mediaStream = null
    this.chunks = []
    this.defaultButtonClasses = this.buttonTarget.className
    this.resetUi()
  }

  disconnect() {
    this.cleanupStream()
  }

  async toggle(event) {
    event.preventDefault()

    if (this.isRecording()) {
      this.stopRecording()
    } else {
      await this.startRecording()
    }
  }

  async startRecording() {
    if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
      return
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      return
    }

    try {
      this.chunks = []
      this.mediaRecorder = new MediaRecorder(this.mediaStream)
    } catch (error) {
      this.cleanupStream()
      return
    }

    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size > 0) this.chunks.push(event.data)
    })

    this.mediaRecorder.addEventListener("stop", () => {
      this.handleStop()
    })

    this.mediaRecorder.start()
    this.buttonTarget.setAttribute("aria-pressed", "true")
    this.buttonTarget.className = this.defaultButtonClasses
    this.buttonTarget.classList.remove("bg-slate-900", "hover:bg-slate-800")
    this.buttonTarget.classList.add("bg-red-600", "hover:bg-red-700")
    this.buttonTarget.disabled = false
  }

  stopRecording() {
    if (!this.isRecording()) return

    this.buttonTarget.disabled = true
    this.mediaRecorder.stop()
  }

  handleStop() {
    const blob = this.createBlob()
    this.cleanupStream()

    if (!blob) {
      this.resetUi()
      return
    }

    const file = new File([blob], this.buildFilename(blob.type), { type: blob.type })
    let transfer

    try {
      transfer = new DataTransfer()
    } catch (error) {
      this.resetUi()
      return
    }

    transfer.items.add(file)
    this.inputTarget.files = transfer.files

    this.element.requestSubmit()
    this.resetUi()
  }

  isRecording() {
    return this.mediaRecorder?.state === "recording"
  }

  createBlob() {
    if (this.chunks.length === 0) return null
    const type = this.mediaRecorder?.mimeType || "audio/webm"
    return new Blob(this.chunks, { type })
  }

  buildFilename(mimeType) {
    const extension = this.extensionFor(mimeType)
    return `recording-${Date.now()}.${extension}`
  }

  extensionFor(mimeType) {
    if (!mimeType) return "webm"
    if (mimeType.includes("mpeg")) return "mp3"
    if (mimeType.includes("mp4") || mimeType.includes("mp4a")) return "m4a"
    if (mimeType.includes("ogg")) return "ogg"
    return "webm"
  }

  resetUi() {
    this.buttonTarget.setAttribute("aria-pressed", "false")
    this.buttonTarget.className = this.defaultButtonClasses
    this.buttonTarget.disabled = false
  }

  cleanupStream() {
    this.mediaStream?.getTracks().forEach((track) => track.stop())
    this.mediaStream = null
    this.mediaRecorder = null
    this.chunks = []
  }
}
