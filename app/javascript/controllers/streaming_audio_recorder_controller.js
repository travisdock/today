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
          onError: this.handleError.bind(this),
          getTodosContext: this.getTodosContext.bind(this)
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
   * Get current todos from the DOM for Gemini context
   * Returns a formatted string listing all todos with their IDs and priority windows
   */
  getTodosContext() {
    const priorityWindows = ['today', 'tomorrow', 'this_week', 'next_week']
    const lines = []

    for (const window of priorityWindows) {
      const container = document.getElementById(`${window}_todo_items`)
      if (!container) continue

      const todos = container.querySelectorAll('[data-todo-id]')
      if (todos.length === 0) continue

      lines.push(`${window.replace('_', ' ').toUpperCase()}:`)
      todos.forEach(todo => {
        const id = todo.dataset.todoId
        const titleEl = todo.querySelector('p.font-medium')
        const title = titleEl?.textContent?.trim() || 'Unknown'
        lines.push(`  - ID: ${id}, Title: "${title}"`)
      })
    }

    return lines.join('\n')
  }

  /**
   * Handle tool calls from Gemini (create/move todos)
   * Returns a Promise that resolves when the operation completes and DOM is updated
   */
  async handleToolCall(toolCall) {
    console.log("Tool call received:", toolCall)

    if (toolCall.name === 'createTodos') {
      await this.handleCreateTodos(toolCall.args)
    } else if (toolCall.name === 'moveTodo') {
      await this.handleMoveTodo(toolCall.args)
    } else if (toolCall.name === 'bulkMoveTodos') {
      await this.handleBulkMoveTodos(toolCall.args)
    }

    // Wait for Turbo Stream DOM updates to complete
    await this.waitForDomUpdate()
  }

  /**
   * Wait for DOM updates to settle after Turbo Stream processing
   */
  waitForDomUpdate() {
    return new Promise(resolve => {
      // Use requestAnimationFrame to wait for next paint cycle
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve()
        })
      })
    })
  }

  /**
   * Handle createTodos tool call
   */
  async handleCreateTodos(args) {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken,
          'Accept': 'text/vnd.turbo-stream.html'
        },
        body: JSON.stringify({
          items: args.items,
          priority_window: args.priority_window
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

  /**
   * Handle moveTodo tool call - moves a single todo to a different priority window
   */
  async handleMoveTodo(args) {
    try {
      const { todo_id, priority_window } = args

      const response = await fetch(`/todos/${todo_id}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken,
          'Accept': 'text/vnd.turbo-stream.html'
        },
        body: JSON.stringify({
          priority_window: priority_window
        })
      })

      if (!response.ok) {
        throw new Error(`Todo move failed: ${response.status}`)
      }

      // Get the Turbo Stream response and process it
      const turboStream = await response.text()

      if (turboStream && window.Turbo) {
        window.Turbo.renderStreamMessage(turboStream)
      } else {
        console.warn("Turbo not available or empty response")
      }

      console.log(`Todo ${todo_id} moved to ${priority_window} successfully`)
    } catch (error) {
      console.error("Failed to move todo:", error)
      this.showError("Failed to move todo. Please try again.")
    }
  }

  /**
   * Handle bulkMoveTodos tool call - moves multiple todos to a different priority window
   */
  async handleBulkMoveTodos(args) {
    try {
      const { todo_ids, priority_window } = args

      // Move each todo sequentially to ensure proper Turbo Stream handling
      for (const todoId of todo_ids) {
        const response = await fetch(`/todos/${todoId}/move`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': this.csrfToken,
            'Accept': 'text/vnd.turbo-stream.html'
          },
          body: JSON.stringify({
            priority_window: priority_window
          })
        })

        if (!response.ok) {
          console.error(`Failed to move todo ${todoId}: ${response.status}`)
          continue
        }

        // Get the Turbo Stream response and process it
        const turboStream = await response.text()

        if (turboStream && window.Turbo) {
          window.Turbo.renderStreamMessage(turboStream)
        }
      }

      console.log(`${todo_ids.length} todos moved to ${priority_window} successfully`)
    } catch (error) {
      console.error("Failed to bulk move todos:", error)
      this.showError("Failed to move todos. Please try again.")
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
