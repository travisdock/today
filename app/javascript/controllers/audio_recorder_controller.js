import { Controller } from "@hotwired/stimulus"

// Handles microphone recording and submits the enclosing form with the audio file.
export default class extends Controller {
  static targets = ["button", "status", "input"]

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
      this.updateStatus("Recording not supported here")
      return
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      this.updateStatus("Microphone access denied")
      return
    }

    try {
      this.chunks = []
      this.mediaRecorder = new MediaRecorder(this.mediaStream)
    } catch (error) {
      this.updateStatus("Unable to start recording")
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
    this.buttonTarget.classList.remove("bg-slate-900/80")
    this.buttonTarget.classList.add("bg-red-600")
    this.buttonTarget.disabled = false
    this.updateStatus("Recording… tap again to finish")
  }

  stopRecording() {
    if (!this.isRecording()) return

    this.updateStatus("Processing recording…")
    this.buttonTarget.disabled = true
    this.mediaRecorder.stop()
  }

  handleStop() {
    const blob = this.createBlob()
    this.cleanupStream()

    if (!blob) {
      this.resetUi()
      this.updateStatus("No audio captured")
      return
    }

    const file = new File([blob], this.buildFilename(blob.type), { type: blob.type })
    let transfer

    try {
      transfer = new DataTransfer()
    } catch (error) {
      this.updateStatus("Browser cannot attach recording")
      this.resetUi()
      return
    }

    transfer.items.add(file)
    this.inputTarget.files = transfer.files

    this.updateStatus("Submitting…")
    this.element.requestSubmit()
    this.resetUi("Submitting…")
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

  updateStatus(message) {
    this.statusTarget.textContent = message
  }

  resetUi(message = "Tap to record") {
    this.buttonTarget.setAttribute("aria-pressed", "false")
    this.buttonTarget.className = this.defaultButtonClasses
    this.buttonTarget.disabled = false
    this.updateStatus(message)
  }

  cleanupStream() {
    this.mediaStream?.getTracks().forEach((track) => track.stop())
    this.mediaStream = null
    this.mediaRecorder = null
    this.chunks = []
  }
}
