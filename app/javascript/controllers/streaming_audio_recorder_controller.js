import { Controller } from "@hotwired/stimulus"
import { GeminiLiveService, AppState } from "services/gemini_live_service"

/**
 * Streaming Audio Recorder Controller
 * Handles real-time audio streaming to Gemini Live API for voice commands
 */
export default class extends Controller {
  static targets = ["button", "status", "error"]

  async connect() {
    this.service = null
    this.token = null
    this.isRecording = false

    // Fetch token on page load (but don't connect WebSocket yet)
    try {
      await this.fetchEphemeralToken()
      console.log("Token fetched - ready for voice commands")
    } catch (error) {
      console.error("Failed to fetch token:", error)
      this.showError("Failed to initialize voice command system.")
    }
  }

  disconnect() {
    if (this.service) {
      this.service.disconnect()
    }
  }

  /**
   * Fetch ephemeral token from Rails backend
   */
  async fetchEphemeralToken() {
    try {
      const response = await fetch('/api/gemini/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken
        }
      })

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`)
      }

      const data = await response.json()
      this.token = data.token
      console.log("Ephemeral token fetched successfully")
    } catch (error) {
      console.error("Token fetch error:", error)
      throw error
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
        console.log("Initializing Gemini Live service...")
        this.service = new GeminiLiveService({
          token: this.token,
          onToolCall: this.handleToolCall.bind(this),
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
   * Handle tool calls from Gemini (create todos)
   */
  async handleToolCall(toolCall) {
    console.log("Tool call received:", toolCall)

    if (toolCall.name === 'createTodos') {
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': this.csrfToken,
            'Accept': 'text/vnd.turbo-stream.html'
          },
          body: JSON.stringify({
            items: toolCall.args.items,
            priority_window: toolCall.args.priority_window
          })
        })

        if (!response.ok) {
          throw new Error(`Todo creation failed: ${response.status}`)
        }

        // Get the Turbo Stream response and process it
        const turboStream = await response.text()

        // Use Turbo to process the stream response (Turbo is available globally)
        if (turboStream && window.Turbo) {
          window.Turbo.renderStreamMessage(turboStream)
        } else {
          console.warn("Turbo not available or empty response")
        }

        console.log("Todos created successfully")
      } catch (error) {
        console.error("Failed to create todos:", error)
        this.showError("Failed to create todos. Please try again.")
      }
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

  /**
   * Get CSRF token for POST requests
   */
  get csrfToken() {
    const metaTag = document.querySelector('[name="csrf-token"]')
    return metaTag ? metaTag.content : ''
  }
}
