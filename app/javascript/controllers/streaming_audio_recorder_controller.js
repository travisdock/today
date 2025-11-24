import { Controller } from "@hotwired/stimulus"
import { GeminiCableService, AppState } from "services/gemini_cable_service"

/**
 * Streaming Audio Recorder Controller
 * Handles real-time audio streaming via Action Cable to Gemini Live API
 */
export default class extends Controller {
  static targets = ["button", "status", "error"]

  async connect() {
    this.service = null
    this.isRecording = false
    console.log("Streaming audio recorder ready")

    // Preload AudioWorklet module so it's cached for first recording
    await this.preloadAudioWorklet()
  }

  /**
   * Preload the AudioWorklet module to avoid delay on first recording
   */
  async preloadAudioWorklet() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      const tempContext = new AudioContextClass({ sampleRate: 16000 })
      await tempContext.audioWorklet.addModule('/worklets/audio_processor.js')
      await tempContext.close()
      console.log("AudioWorklet module preloaded")
    } catch (error) {
      console.warn("Failed to preload AudioWorklet:", error)
      // Don't fail - just won't have the optimization
    }
  }

  disconnect() {
    if (this.service) {
      this.service.disconnect()
    }
  }

  /**
   * Toggle recording on/off
   */
  async toggleRecording() {
    if (this.isRecording) {
      await this.stopRecording()
    } else {
      await this.startRecording()
    }
  }

  /**
   * Start recording and streaming audio
   */
  async startRecording() {
    try {
      // Initialize service on first recording
      if (!this.service) {
        console.log("Initializing Gemini Cable service...")
        this.service = new GeminiCableService({
          onStateChange: this.updateStatus.bind(this),
          onError: this.handleError.bind(this)
        })
      }

      this.isRecording = true
      this.clearError()

      await this.service.startRecording()
    } catch (error) {
      console.error("Failed to start recording:", error)
      this.isRecording = false
      this.showError("Failed to start recording. Please check microphone permissions.")
    }
  }

  /**
   * Stop recording
   */
  async stopRecording() {
    try {
      this.isRecording = false
      await this.service?.stopRecording()
    } catch (error) {
      console.error("Failed to stop recording:", error)
      this.showError("Failed to stop recording.")
    }
  }

  /**
   * Update UI based on application state
   */
  updateStatus(state) {
    if (!this.hasButtonTarget) return

    const button = this.buttonTarget

    switch (state) {
      case AppState.IDLE:
        button.classList.remove('recording', 'connecting', 'processing')
        button.classList.add('idle')
        button.disabled = false
        break

      case AppState.CONNECTING:
        button.classList.remove('idle', 'recording', 'processing')
        button.classList.add('connecting')
        button.disabled = true
        break

      case AppState.RECORDING:
        button.classList.remove('idle', 'connecting', 'processing')
        button.classList.add('recording')
        button.disabled = false
        break

      case AppState.PROCESSING:
        button.classList.remove('idle', 'connecting', 'recording')
        button.classList.add('processing')
        button.disabled = true
        break

      case AppState.ERROR:
        button.classList.remove('connecting', 'recording', 'processing')
        button.classList.add('idle', 'error')
        button.disabled = false
        break
    }

    // Update status text if target exists
    if (this.hasStatusTarget) {
      const statusText = {
        [AppState.IDLE]: "Ready",
        [AppState.CONNECTING]: "Connecting...",
        [AppState.RECORDING]: "Listening...",
        [AppState.PROCESSING]: "Processing...",
        [AppState.ERROR]: "Error"
      }
      this.statusTarget.textContent = statusText[state] || ""
    }
  }

  /**
   * Handle errors from Gemini service
   */
  handleError(message) {
    console.error("Gemini service error:", message)
    this.showError(message)
  }

  /**
   * Show error message to user
   */
  showError(message) {
    if (this.hasErrorTarget) {
      this.errorTarget.textContent = message
      this.errorTarget.classList.remove('hidden')

      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.clearError()
      }, 5000)
    }
  }

  /**
   * Clear error message
   */
  clearError() {
    if (this.hasErrorTarget) {
      this.errorTarget.textContent = ""
      this.errorTarget.classList.add('hidden')
    }
  }
}
