import { Controller } from "@hotwired/stimulus"
import { post } from "@rails/request.js"

const MAX_DURATION_MS = 120_000

export default class extends Controller {
  static targets = ["input", "toggle", "buttonLabel", "status"]
  static values = {
    createUrl: String
  }

  connect() {
    this.state = "idle"
    this.chunks = []
    this.stream = null
    this.mediaRecorder = null
    this.mimeType = this.detectMimeType()
    this.handleDataAvailable = this.handleDataAvailable.bind(this)
    this.handleStop = this.handleStop.bind(this)
    this.handleRecorderError = this.handleRecorderError.bind(this)

    if (!this.isSupported) {
      this.disableButton()
      this.updateStatus("Voice capture is not supported in this browser.")
      return
    }

    this.updateStatus("Tap voice to record a quick note.")
    this.setState("idle")
  }

  disconnect() {
    this.stopTracks()
    this.clearTimers()
    if (this.mediaRecorder) {
      this.mediaRecorder.removeEventListener("dataavailable", this.handleDataAvailable)
      this.mediaRecorder.removeEventListener("stop", this.handleStop)
      this.mediaRecorder.removeEventListener("error", this.handleRecorderError)
      this.mediaRecorder = null
    }
  }

  async toggle(event) {
    event.preventDefault()
    if (!this.isSupported || this.state === "processing") return

    if (this.state === "recording") {
      this.stopRecording()
    } else {
      await this.startRecording()
    }
  }

  async startRecording() {
    this.chunks = []
    this.clearTimers()

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
    } catch (error) {
      console.error("[voice-input] getUserMedia failed", error)
      this.updateStatus("Microphone access is required to capture todos.")
      return
    }

    const recorder = this.buildRecorder()
    if (!recorder) {
      this.updateStatus("Recording isn't available on this device.")
      this.stopTracks()
      return
    }

    recorder.addEventListener("dataavailable", this.handleDataAvailable)
    recorder.addEventListener("stop", this.handleStop)
    recorder.addEventListener("error", this.handleRecorderError)
    recorder.start()

    this.mediaRecorder = recorder
    this.stopTimeout = setTimeout(() => {
      if (this.state === "recording") this.stopRecording()
    }, MAX_DURATION_MS)

    this.setState("recording")
    this.updateStatus("Recording… tap stop when you're done.")
  }

  stopRecording() {
    if (this.mediaRecorder && this.state === "recording") {
      this.mediaRecorder.stop()
      this.setState("processing")
      this.updateStatus("Processing your recording…")
    }
    this.clearTimers()
  }

  async handleStop() {
    const recorder = this.mediaRecorder
    this.mediaRecorder = null

    if (recorder) {
      recorder.removeEventListener("dataavailable", this.handleDataAvailable)
      recorder.removeEventListener("stop", this.handleStop)
      recorder.removeEventListener("error", this.handleRecorderError)
    }

    this.stopTracks()

    const blob = this.buildBlob(recorder)
    this.chunks = []

    if (!blob || blob.size === 0) {
      this.updateStatus("That recording was empty. Try again?")
      this.setState("idle")
      return
    }

    try {
      await this.sendAudio(blob)
      this.updateStatus("Voice todos added.")
    } catch (error) {
      console.error("[voice-input] upload failed", error)
      this.updateStatus(error.message || "We couldn't save that recording. Please try again.")
    } finally {
      this.setState("idle")
    }
  }

  handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      this.chunks.push(event.data)
    }
  }

  handleRecorderError(event) {
    console.error("[voice-input] recorder error", event.error || event)
    this.updateStatus("Recording stopped unexpectedly. Please try again.")
    this.setState("idle")
    this.stopTracks()
  }

  async sendAudio(blob) {
    if (!this.hasCreateUrlValue || !this.createUrlValue) {
      throw new Error("Voice capture endpoint is not configured.")
    }

    const body = new FormData()
    body.append("audio", blob, `voice-note.${this.extensionFor(blob.type)}`)

    const response = await post(this.createUrlValue, {
      body,
      responseKind: "turbo-stream"
    })

    if (!response.ok) {
      if (typeof response.renderTurboStream === "function" && response.isTurboStream) {
        try {
          await response.renderTurboStream()
        } catch (streamError) {
          console.warn("[voice-input] failed to render turbo stream", streamError)
        }
      }

      const status = response.statusCode ?? "error"
      throw new Error(`Voice processing failed (${status}).`)
    }
  }

  setState(newState) {
    this.state = newState

    if (!this.hasToggleTarget) return

    switch (newState) {
      case "recording":
        this.toggleTarget.disabled = false
        this.toggleTarget.setAttribute("aria-pressed", "true")
        this.updateButtonLabel("Stop")
        break
      case "processing":
        this.toggleTarget.disabled = true
        this.toggleTarget.setAttribute("aria-pressed", "false")
        this.updateButtonLabel("Processing…")
        break
      default:
        this.toggleTarget.disabled = false
        this.toggleTarget.setAttribute("aria-pressed", "false")
        this.updateButtonLabel("Voice")
        break
    }
  }

  updateButtonLabel(text) {
    if (this.hasButtonLabelTarget) {
      this.buttonLabelTarget.textContent = text
    }
  }

  updateStatus(message) {
    if (this.hasStatusTarget) {
      this.statusTarget.textContent = message || ""
    }
  }

  disableButton() {
    if (this.hasToggleTarget) {
      this.toggleTarget.disabled = true
      this.toggleTarget.classList.add("opacity-60", "cursor-not-allowed")
    }
  }

  stopTracks() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
  }

  clearTimers() {
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout)
      this.stopTimeout = null
    }
  }

  buildRecorder() {
    if (!this.stream) return null

    const options = this.mimeType ? { mimeType: this.mimeType } : undefined

    try {
      return options ? new MediaRecorder(this.stream, options) : new MediaRecorder(this.stream)
    } catch (error) {
      console.warn("[voice-input] falling back to default mime type", error)
      try {
        return new MediaRecorder(this.stream)
      } catch (fallbackError) {
        console.error("[voice-input] unable to create MediaRecorder", fallbackError)
        return null
      }
    }
  }

  buildBlob(recorder) {
    const type = (recorder && recorder.mimeType) || this.mimeType || "audio/webm"
    return new Blob(this.chunks, { type })
  }

  detectMimeType() {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return null

    const preferredTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4"
    ]

    return preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) || null
  }

  extensionFor(type) {
    if (!type) return "webm"
    if (type.includes("ogg")) return "ogg"
    if (type.includes("mp4")) return "m4a"
    if (type.includes("wav")) return "wav"
    if (type.includes("mpeg") || type.includes("mp3")) return "mp3"
    return "webm"
  }

  get isSupported() {
    return typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      typeof MediaRecorder !== "undefined" &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
  }
}
