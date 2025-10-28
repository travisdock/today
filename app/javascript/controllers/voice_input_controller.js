import { Controller } from "@hotwired/stimulus"
import { post } from "@rails/request.js"

// Connects to data-controller="voice-input"
export default class extends Controller {
  static targets = ["button", "status", "timer", "waveform"]
  static values = {
    url: String,
    maxDuration: { type: Number, default: 120 } // 2 minutes in seconds
  }

  static states = {
    IDLE: 'idle',
    RECORDING: 'recording',
    PROCESSING: 'processing',
    SUCCESS: 'success',
    ERROR: 'error'
  }

  connect() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.startTime = null
    this.timerInterval = null
    this.currentState = this.constructor.states.IDLE

    // Check browser support
    if (!this.isSupported()) {
      this.showError("Your browser doesn't support voice recording. Please use Chrome, Firefox, or Safari.")
      this.disable()
    }

    // Bind keyboard shortcuts
    this.boundHandleKeydown = this.handleKeydown.bind(this)
    document.addEventListener('keydown', this.boundHandleKeydown)
  }

  disconnect() {
    this.cleanup()
    document.removeEventListener('keydown', this.boundHandleKeydown)
  }

  isSupported() {
    return typeof MediaRecorder !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  }

  async toggleRecording() {
    if (this.currentState === this.constructor.states.RECORDING) {
      this.stopRecording()
    } else if (this.currentState === this.constructor.states.IDLE) {
      await this.startRecording()
    }
  }

  async startRecording() {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // Check for supported MIME type
      const mimeType = this.getSupportedMimeType()
      if (!mimeType) {
        throw new Error("No supported audio format found")
      }

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, { mimeType })
      this.audioChunks = []

      // Handle data available
      this.mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      })

      // Handle recording stop
      this.mediaRecorder.addEventListener('stop', () => {
        this.handleRecordingComplete()
      })

      // Start recording
      this.mediaRecorder.start()
      this.startTime = Date.now()
      this.updateState(this.constructor.states.RECORDING)
      this.startTimer()

      // Auto-stop after max duration
      setTimeout(() => {
        if (this.currentState === this.constructor.states.RECORDING) {
          this.stopRecording()
        }
      }, this.maxDurationValue * 1000)

    } catch (error) {
      console.error('Recording failed:', error)
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        this.showError("Microphone permission denied. Please allow access and try again.")
      } else {
        this.showError("Failed to start recording. " + error.message)
      }
      this.updateState(this.constructor.states.ERROR)
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
      this.stopTimer()
    }
  }

  async handleRecordingComplete() {
    try {
      // Create audio blob
      const mimeType = this.mediaRecorder.mimeType
      const audioBlob = new Blob(this.audioChunks, { type: mimeType })

      // Check size (max 25MB)
      if (audioBlob.size > 25 * 1024 * 1024) {
        throw new Error("Recording is too large (max 25MB)")
      }

      // Upload to server
      this.updateState(this.constructor.states.PROCESSING)
      await this.uploadAudio(audioBlob)

    } catch (error) {
      console.error('Upload failed:', error)
      this.showError("Failed to process recording. " + error.message)
      this.updateState(this.constructor.states.ERROR)
    } finally {
      this.cleanup()
    }
  }

  async uploadAudio(audioBlob) {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    // Get CSRF token
    const token = document.querySelector('meta[name="csrf-token"]')?.content

    try {
      const response = await post(this.urlValue, {
        body: formData,
        headers: {
          'X-CSRF-Token': token
        }
      })

      if (response.ok) {
        const data = await response.json
        this.showSuccess("Processing audio... Your todos will appear shortly.")
        this.updateState(this.constructor.states.SUCCESS)

        // Reset to idle after a delay
        setTimeout(() => {
          if (this.currentState === this.constructor.states.SUCCESS) {
            this.updateState(this.constructor.states.IDLE)
          }
        }, 3000)
      } else {
        const data = await response.json
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      throw new Error("Network error: " + error.message)
    }
  }

  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/mpeg'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return null
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
      const remaining = this.maxDurationValue - elapsed
      this.updateTimer(elapsed, remaining)
    }, 100)
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  updateTimer(elapsed, remaining) {
    if (!this.hasTimerTarget) return

    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    const remainingMinutes = Math.floor(remaining / 60)
    const remainingSeconds = remaining % 60

    this.timerTarget.textContent =
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} / ` +
      `${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  updateState(newState) {
    this.currentState = newState

    // Update button appearance
    if (this.hasButtonTarget) {
      const button = this.buttonTarget
      button.dataset.state = newState

      // Update aria-label for accessibility
      const labels = {
        [this.constructor.states.IDLE]: 'Start voice recording',
        [this.constructor.states.RECORDING]: 'Stop voice recording',
        [this.constructor.states.PROCESSING]: 'Processing recording...',
        [this.constructor.states.SUCCESS]: 'Recording processed successfully',
        [this.constructor.states.ERROR]: 'Recording failed'
      }
      button.setAttribute('aria-label', labels[newState])

      // Disable button during processing
      button.disabled = (newState === this.constructor.states.PROCESSING)
    }

    // Update status message
    if (this.hasStatusTarget) {
      this.statusTarget.dataset.state = newState

      // Announce to screen readers
      this.statusTarget.setAttribute('role', 'status')
      this.statusTarget.setAttribute('aria-live', 'polite')
    }
  }

  showSuccess(message) {
    if (this.hasStatusTarget) {
      this.statusTarget.textContent = message
      this.statusTarget.className = 'text-green-600 text-sm mt-2'
    }
  }

  showError(message) {
    if (this.hasStatusTarget) {
      this.statusTarget.textContent = message
      this.statusTarget.className = 'text-red-600 text-sm mt-2'
    }
  }

  handleKeydown(event) {
    // Space or Enter to toggle recording (when button is focused)
    if ((event.code === 'Space' || event.code === 'Enter') &&
        this.hasButtonTarget &&
        document.activeElement === this.buttonTarget) {
      event.preventDefault()
      this.toggleRecording()
    }

    // Escape to cancel recording
    if (event.code === 'Escape' && this.currentState === this.constructor.states.RECORDING) {
      event.preventDefault()
      this.cancelRecording()
    }
  }

  cancelRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
      this.stopTimer()
      this.cleanup()
      this.updateState(this.constructor.states.IDLE)
      this.showSuccess("Recording cancelled")
      setTimeout(() => {
        if (this.hasStatusTarget) {
          this.statusTarget.textContent = ''
        }
      }, 2000)
    }
  }

  cleanup() {
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop()
      }
      if (this.mediaRecorder.stream) {
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
      this.mediaRecorder = null
    }
    this.audioChunks = []
    this.stopTimer()
  }

  disable() {
    if (this.hasButtonTarget) {
      this.buttonTarget.disabled = true
      this.buttonTarget.classList.add('opacity-50', 'cursor-not-allowed')
    }
  }
}
