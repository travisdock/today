import { GoogleGenAI } from '@google/genai'
import { createPcmBlob } from 'utils/audio_pcm_converter'

// Application states
export const AppState = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING',
  RECORDING: 'RECORDING',
  PROCESSING: 'PROCESSING',
  ERROR: 'ERROR'
}

// Constants
const GEMINI_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025'
const SAMPLE_RATE = 16000
const BUFFER_SIZE = 4096
const INACTIVITY_TIMEOUT = 15000 // 15 seconds of inactivity before disconnecting

/**
 * Service for managing WebSocket streaming to Gemini Live API
 */
export class GeminiLiveService {
  constructor(callbacks) {
    this.callbacks = callbacks
    this.client = null
    this.session = null
    this.inputAudioContext = null
    this.mediaStream = null
    this.processor = null
    this.source = null
    this.isRecording = false
    this.connectPromise = null
    this.inactivityTimer = null
    this.processingTimer = null
    this.lastTurnCompleteTime = null
    this.token = callbacks.token
  }

  /**
   * Connect to Gemini Live API with WebSocket
   */
  async connect() {
    // Reuse existing connection promise to prevent race conditions
    if (this.connectPromise) {
      return this.connectPromise
    }

    this.connectPromise = this._doConnect()
    try {
      await this.connectPromise
    } finally {
      this.connectPromise = null
    }
  }

  async _doConnect() {
    // Only change to CONNECTING state if not already recording
    if (!this.isRecording) {
      this.callbacks.onStateChange(AppState.CONNECTING)
    }

    if (!this.token) {
      throw new Error('API token not found')
    }

    this.client = new GoogleGenAI({
      apiKey: this.token,
      httpOptions: { apiVersion: 'v1alpha' }
    })

    const tools = this.buildTools()
    const systemInstruction = this.buildSystemInstruction()

    try {
      this.session = await this.client.live.connect({
        model: GEMINI_MODEL,
        config: {
          responseModalities: ['AUDIO'], // Required by Live API
          systemInstruction: systemInstruction,
          tools: [{ functionDeclarations: tools }],
          inputAudioTranscription: {}, // Enable user transcription
          // Use automatic VAD (default) - allows real-time processing of pauses
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Session Connected')
            // Only start inactivity timer if we're not actively recording
            if (!this.isRecording) {
              this.resetInactivityTimer()
            }
          },
          onmessage: this.handleMessage.bind(this),
          onclose: () => {
            console.log('Gemini Live Session Closed')
            this.session = null
            this.isRecording = false
            this.callbacks.onStateChange(AppState.IDLE)
          },
          onerror: (err) => {
            console.error('Gemini Live API Error', err)
            this.callbacks.onError('Connection error with Gemini.')
            this.session = null
            this.isRecording = false
            this.callbacks.onStateChange(AppState.ERROR)
          },
        },
      })
    } catch (error) {
      console.error('Failed to connect:', error)
      this.callbacks.onError('Failed to connect to Gemini Live service.')
      this.callbacks.onStateChange(AppState.ERROR)
      throw error
    }
  }

  /**
   * Handle incoming messages from Gemini Live API
   */
  handleMessage(message) {
    // Handle User Transcription
    const text = message.serverContent?.inputTranscription?.text
    if (text) {
      console.log('Received transcription:', text)
      this.callbacks.onTranscript?.(text)
    }

    // Handle Tool Calls - forward to frontend and send response
    if (message.toolCall) {
      console.log('Received tool call:', message.toolCall)
      this.processToolCalls(message.toolCall.functionCalls)
    }

    // Handle Turn Completion
    // Automatic VAD sends this after detecting speech pauses
    if (message.serverContent?.turnComplete) {
      console.log('Turn complete received')

      // Track when we received this turnComplete
      this.lastTurnCompleteTime = Date.now()

      // Clear processing timeout since we got the completion signal
      if (this.processingTimer) {
        clearTimeout(this.processingTimer)
        this.processingTimer = null
      }

      // Only return to IDLE if we're not actively recording
      // This allows Gemini to process pauses while user continues speaking
      if (!this.isRecording) {
        console.log('Not recording - returning to idle')
        this.callbacks.onStateChange(AppState.IDLE)
        this.resetInactivityTimer()
      } else {
        console.log('Still recording - staying in recording state')
        // Don't start inactivity timer while recording
      }
    }
  }

  /**
   * Start recording audio and streaming to Gemini
   */
  async startRecording() {
    console.log('Starting recording...')

    // Set recording flag BEFORE connect to prevent race condition with onopen
    this.isRecording = true
    this.callbacks.onStateChange(AppState.RECORDING)

    // Clear inactivity timer since user is actively using the session
    this.clearInactivityTimer()

    // Connect if no session exists (will reuse existing promise if already connecting)
    if (!this.session) {
      await this.connect()
    }

    if (!this.session) {
      this.isRecording = false
      throw new Error('Failed to establish session')
    }

    try {

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create AudioContext with 16kHz sample rate
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      this.inputAudioContext = new AudioContextClass({
        sampleRate: SAMPLE_RATE,
      })

      // Load and create AudioWorklet processor
      await this.inputAudioContext.audioWorklet.addModule('/worklets/audio_processor.js')

      this.source = this.inputAudioContext.createMediaStreamSource(this.mediaStream)
      this.processor = new AudioWorkletNode(this.inputAudioContext, 'audio-capture-processor')

      // Handle audio data from the worklet
      this.processor.port.onmessage = (event) => {
        if (!this.session) return
        const inputData = event.data.audioData
        this.session.sendRealtimeInput({ media: createPcmBlob(inputData) })
      }

      // Connect audio nodes (worklet processes automatically, no need to connect to destination)
      this.source.connect(this.processor)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      this.callbacks.onError('Could not access microphone.')
      this.isRecording = false
      this.callbacks.onStateChange(AppState.IDLE)
    }
  }

  /**
   * Stop recording and signal end of audio stream
   * Allows Gemini to finish processing and send remaining tool calls
   */
  async stopRecording() {
    console.log('Stopping recording - signaling end of audio stream to Gemini...')
    this.isRecording = false

    try {
      // Stop audio capture (stop listening to microphone)
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop())
        this.mediaStream = null
      }

      // Disconnect audio processing nodes but keep the session alive
      if (this.processor && this.inputAudioContext) {
        this.processor.port.onmessage = null // Clean up event handler
        this.processor.disconnect()
        this.source?.disconnect()
        this.processor = null
        this.source = null
        await this.inputAudioContext.close()
        this.inputAudioContext = null
      }

      if (!this.session) {
        console.log('No session to stop, returning to idle')
        this.callbacks.onStateChange(AppState.IDLE)
        return
      }

      // Check if we got a very recent turnComplete (within 2 seconds)
      // If so, Gemini likely won't send another one, so go straight to IDLE
      const timeSinceLastTurnComplete = this.lastTurnCompleteTime
        ? Date.now() - this.lastTurnCompleteTime
        : Infinity

      if (timeSinceLastTurnComplete < 2000) {
        console.log('Recent turnComplete detected - returning to idle immediately')
        this.callbacks.onStateChange(AppState.IDLE)
        this.resetInactivityTimer()
        return
      }

      // Change to processing state - let user know we're waiting for Gemini
      this.callbacks.onStateChange(AppState.PROCESSING)

      // Clear inactivity timer - we have a more specific processing timeout
      this.clearInactivityTimer()

      // Signal end of audio stream to Gemini
      try {
        await this.session.sendRealtimeInput({ audioStreamEnd: true })
        console.log('Audio stream end - waiting for Gemini to finish processing...')
      } catch (error) {
        console.warn('Failed to send audioStreamEnd:', error)
      }

      // Add a reasonable timeout in case turnComplete never arrives
      this.processingTimer = setTimeout(() => {
        if (!this.isRecording && this.session) {
          console.log('Processing timeout (5s) - returning to idle')
          this.callbacks.onStateChange(AppState.IDLE)
          this.resetInactivityTimer()
        }
      }, 5000) // 5 second timeout

    } catch (error) {
      console.error('Error stopping recording:', error)
      this.callbacks.onError('Error stopping recording.')
      this.callbacks.onStateChange(AppState.IDLE)
    }
  }

  /**
   * Disconnect from Gemini Live API (called on inactivity or page unload)
   */
  async disconnect() {
    console.log('Disconnecting session')
    this.clearInactivityTimer()

    // Clear processing timer if active
    if (this.processingTimer) {
      clearTimeout(this.processingTimer)
      this.processingTimer = null
    }

    this.isRecording = false
    this.connectPromise = null

    // Stop audio if active
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }

    // Close audio processing
    if (this.processor && this.inputAudioContext) {
      try {
        this.processor.port.onmessage = null // Clean up event handler
        this.processor.disconnect()
        this.source?.disconnect()
        this.processor = null
        this.source = null
        await this.inputAudioContext.close()
        this.inputAudioContext = null
      } catch (e) {
        console.warn('Error closing audio context:', e)
      }
    }

    // Close the WebSocket session
    if (this.session) {
      try {
        this.session.close()
        this.session = null
      } catch (e) {
        console.warn('Error closing session:', e)
      }
    }

    this.isConnecting = false
    this.callbacks.onStateChange(AppState.IDLE)
  }

  /**
   * Reset the inactivity timer - session will disconnect after INACTIVITY_TIMEOUT
   */
  resetInactivityTimer() {
    this.clearInactivityTimer()
    this.inactivityTimer = setTimeout(() => {
      console.log('Inactivity timeout - disconnecting session')
      this.disconnect()
    }, INACTIVITY_TIMEOUT)
  }

  /**
   * Clear the inactivity timer
   */
  clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
      this.inactivityTimer = null
    }
  }

  /**
   * Process tool calls asynchronously to allow DOM updates before sending response
   */
  async processToolCalls(functionCalls) {
    for (const fc of functionCalls) {
      try {
        let resultMessage = ''

        if (fc.name === 'createTodos') {
          const args = fc.args
          if (args?.items && Array.isArray(args.items)) {
            // Wait for the frontend to process the tool call and update DOM
            await this.callbacks.onToolCall({
              id: fc.id,
              name: fc.name,
              args: args
            })
            resultMessage = `Created ${args.items.length} todos.`
          }
        } else if (fc.name === 'moveTodo') {
          const args = fc.args
          if (args?.todo_id && args?.priority_window) {
            await this.callbacks.onToolCall({
              id: fc.id,
              name: fc.name,
              args: args
            })
            resultMessage = `Moved todo ${args.todo_id} to ${args.priority_window}.`
          }
        } else if (fc.name === 'bulkMoveTodos') {
          const args = fc.args
          if (args?.todo_ids && Array.isArray(args.todo_ids) && args?.priority_window) {
            await this.callbacks.onToolCall({
              id: fc.id,
              name: fc.name,
              args: args
            })
            resultMessage = `Moved ${args.todo_ids.length} todos to ${args.priority_window}.`
          }
        }

        if (resultMessage) {
          // Get fresh todos context after DOM has been updated
          const updatedContext = this.callbacks.getTodosContext?.() || ''

          // Send tool response back to Gemini with updated todos list
          this.session?.sendToolResponse({
            functionResponses: {
              id: fc.id,
              name: fc.name,
              response: {
                result: resultMessage,
                updated_todos: updatedContext || 'No todos currently exist.'
              }
            }
          })
          console.log('Tool response sent with updated context')
        }
      } catch (error) {
        console.error(`Error processing tool call ${fc.name}:`, error)
        // Send error response to Gemini
        this.session?.sendToolResponse({
          functionResponses: {
            id: fc.id,
            name: fc.name,
            response: {
              error: `Failed to execute ${fc.name}: ${error.message}`
            }
          }
        })
      }
    }
  }

  /**
   * Build tool declarations for Gemini
   */
  buildTools() {
    return [
      {
        name: 'createTodos',
        description: 'Creates new todo items from user speech. Extract action items and assign them to appropriate time windows.',
        parameters: {
          type: 'OBJECT',
          properties: {
            items: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'List of NEW todo items mentioned by user.',
            },
            priority_window: {
              type: 'STRING',
              enum: ['today', 'tomorrow', 'this_week', 'next_week'],
              description: 'Time window for these todos. Infer from user speech (default: today).',
            }
          },
          required: ['items', 'priority_window'],
        },
      },
      {
        name: 'moveTodo',
        description: 'Moves a single todo item to a different priority window. Use when user says things like "move X to tomorrow" or "put X in this week".',
        parameters: {
          type: 'OBJECT',
          properties: {
            todo_id: {
              type: 'INTEGER',
              description: 'The ID of the todo to move. Look up the ID from the CURRENT TODOS list by matching the title.',
            },
            priority_window: {
              type: 'STRING',
              enum: ['today', 'tomorrow', 'this_week', 'next_week'],
              description: 'The target priority window to move the todo to.',
            }
          },
          required: ['todo_id', 'priority_window'],
        },
      },
      {
        name: 'bulkMoveTodos',
        description: 'Moves multiple todo items to a different priority window at once. Use when user wants to move several todos together.',
        parameters: {
          type: 'OBJECT',
          properties: {
            todo_ids: {
              type: 'ARRAY',
              items: { type: 'INTEGER' },
              description: 'Array of todo IDs to move. Look up IDs from the CURRENT TODOS list by matching titles.',
            },
            priority_window: {
              type: 'STRING',
              enum: ['today', 'tomorrow', 'this_week', 'next_week'],
              description: 'The target priority window to move the todos to.',
            }
          },
          required: ['todo_ids', 'priority_window'],
        },
      }
    ]
  }

  /**
   * Build system instruction for Gemini
   */
  buildSystemInstruction() {
    // Get current todos from the page if callback is provided
    const todosContext = this.callbacks.getTodosContext?.() || ''

    return {
      parts: [{
        text: `You are a voice-controlled todo list assistant. The user will give you voice commands to manage their todos.

              Todos are organized into 4 priority windows:
              - today: Tasks for today
              - tomorrow: Tasks for tomorrow
              - this_week: Tasks for this week
              - next_week: Tasks for next week

              ${todosContext ? `CURRENT TODOS (use these IDs when moving todos):
${todosContext}` : 'No todos exist yet.'}

              Available tools:
              1. createTodos - Create multiple todos at once with titles and priority windows
              2. moveTodo - Move a single todo to a different priority window (requires todo_id)
              3. bulkMoveTodos - Move multiple todos to a different priority window at once (requires todo_ids array)

              CRITICAL RULES:
              - You MUST use the tools to make changes - NEVER just respond with text
              - ALWAYS call the appropriate tool before or while responding
              - If you need to create todos, call createTodos
              - If you need to move a todo, call moveTodo or bulkMoveTodos
              - When a user says "move X to Y", find the todo with a title matching X in the CURRENT TODOS list, get its ID, and call moveTodo
              - IMPORTANT: After each tool call, you will receive an "updated_todos" field in the response containing the fresh list of all todos with their IDs. ALWAYS use this updated list for subsequent commands.

              When the user refers to a todo by title (e.g., "move walk the dogs to today"), you MUST:
              1. Look up the todo in the MOST RECENT todos list (either CURRENT TODOS above or updated_todos from the last tool response)
              2. Use that exact ID in the moveTodo tool call
              3. If you can't find an exact match, look for partial matches

              Examples:
              - "Tomorrow I need to walk the dogs and buy groceries" → CALL createTodos with items=["walk the dogs", "buy groceries"] and priority_window="tomorrow"
              - "Move walk the dogs to today" → Find "walk the dogs" in CURRENT TODOS, get its ID (e.g., 42), then CALL moveTodo with todo_id=42 and priority_window="today"
              - "Move all my tomorrow todos to this week" → Find all todo IDs in tomorrow section, CALL bulkMoveTodos with those IDs

              Be responsive and process commands in real-time as the user speaks.`
      }]
    }
  }
}
