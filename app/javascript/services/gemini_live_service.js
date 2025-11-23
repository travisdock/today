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

      for (const fc of message.toolCall.functionCalls) {
        if (fc.name === 'createTodos') {
          const args = fc.args
          if (args?.items && Array.isArray(args.items)) {
            this.callbacks.onToolCall({
              id: fc.id,
              name: fc.name,
              args: args
            })

            // Send tool response back to Gemini
            // Gemini may wait for this before sending turnComplete
            this.session?.sendToolResponse({
              functionResponses: {
                id: fc.id,
                name: fc.name,
                response: {
                  result: `Created ${args.items.length} todos.`
                }
              }
            })
            console.log('Tool response sent')
          }
        }
      }
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
      }
    ]
  }

  /**
   * Build system instruction for Gemini
   */
  buildSystemInstruction() {
    return {
      parts: [{
        text: `You are a helpful todo assistant. Extract action items from user speech and create todos with appropriate priority windows.

Priority windows:
- today: Tasks for today
- tomorrow: Tasks for tomorrow
- this_week: Tasks for this week
- next_week: Tasks for next week

CRITICAL RULES:
1. ONLY extract todos from the CURRENT audio stream (between when recording starts and audioStreamEnd signal)
2. When the user mentions a task, immediately call the createTodos function with the appropriate priority window
3. If no time is specified, default to "today"
4. Do NOT generate any verbal responses or confirmations
5. Complete your turn immediately after calling all necessary tool functions


Extract todos as the user speaks. You can call createTodos multiple times if the user mentions multiple tasks within the CURRENT audio stream. After the audio stream ends, finish processing any remaining todos from THIS stream only and complete your turn.

It is possible that a user will say something like "Tomorrow I need to clean the kitchen.." and you will call createTodos with "clean the kitchen" and "tomorrow" as the priority window. Then the user will continue speaking with ".. and also buy groceries." In this case, you should call createTodos again with "buy groceries" and "tomorrow" as the priority window if it seems the user was mentioning these todos in the same phrase.

Examples:
- "Add buy milk" → createTodos({items: ["Buy milk"], priority_window: "today"})
- "Add call dentist tomorrow" → createTodos({items: ["Call dentist"], priority_window: "tomorrow"})
- "Add buy groceries and clean house to my todos" → createTodos({items: ["Buy groceries", "Clean house"], priority_window: "today"})

Be responsive and extract todos in real-time as the user speaks.`
      }]
    }
  }
}
