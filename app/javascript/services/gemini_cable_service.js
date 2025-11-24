import consumer from "channels/consumer"
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
const SAMPLE_RATE = 16000
const INACTIVITY_TIMEOUT = 15000 // 15 seconds

/**
 * Service for streaming audio to Rails backend via Action Cable
 * Rails backend handles connection to Gemini Live API
 */
export class GeminiCableService {
  constructor(callbacks) {
    this.callbacks = callbacks
    this.cable = null
    this.inputAudioContext = null
    this.mediaStream = null
    this.processor = null
    this.source = null
    this.isRecording = false
    this.isConnecting = false
    this.inactivityTimer = null
    this.processingTimer = null
    this.lastTurnCompleteTime = null
    this.isNativeRecording = false

    // Setup Turbo Native event listeners
    this.setupNativeListeners()
  }

  /**
   * Detect if running in Turbo Native
   */
  isTurboNative() {
    return window.turboNativeAvailable === true
  }

  /**
   * Detect if running in iOS Turbo Native
   */
  isTurboNativeIOS() {
    return this.isTurboNative() &&
           window.webkit?.messageHandlers?.startStreamingRecording !== undefined
  }

  /**
   * Setup event listeners for native bridge callbacks
   */
  setupNativeListeners() {
    this.handleNativeRecordingStarted = this.handleNativeRecordingStarted.bind(this)
    this.handleNativeRecordingStopped = this.handleNativeRecordingStopped.bind(this)
    this.handleNativeAudioChunk = this.handleNativeAudioChunk.bind(this)

    window.addEventListener('turboNative:streamingRecordingStarted', this.handleNativeRecordingStarted)
    window.addEventListener('turboNative:streamingRecordingStopped', this.handleNativeRecordingStopped)
    window.addEventListener('turboNative:audioChunk', this.handleNativeAudioChunk)
  }

  /**
   * Clean up native listeners
   */
  removeNativeListeners() {
    window.removeEventListener('turboNative:streamingRecordingStarted', this.handleNativeRecordingStarted)
    window.removeEventListener('turboNative:streamingRecordingStopped', this.handleNativeRecordingStopped)
    window.removeEventListener('turboNative:audioChunk', this.handleNativeAudioChunk)
  }

  /**
   * Handle native recording started event
   */
  handleNativeRecordingStarted(event) {
    if (event.detail?.success) {
      console.log('Native recording started successfully')
      this.isNativeRecording = true
    } else {
      console.error('Native recording failed to start')
      this.callbacks.onError('Failed to start native recording')
      this.isRecording = false
      this.callbacks.onStateChange(AppState.IDLE)
    }
  }

  /**
   * Handle native recording stopped event
   */
  handleNativeRecordingStopped(event) {
    console.log('Native recording stopped')
    this.isNativeRecording = false
  }

  /**
   * Handle native audio chunk and forward to Action Cable
   */
  handleNativeAudioChunk(event) {
    if (!this.cable || !this.isNativeRecording) return

    const audioChunk = event.detail?.audioChunk
    if (audioChunk) {
      // Send audio chunk to Rails via Action Cable
      this.cable.perform('receive_audio', { audio: audioChunk })
    }
  }

  /**
   * Connect to Action Cable channel
   */
  async connect() {
    if (this.isConnecting || this.cable) {
      console.log('Already connected or connecting')
      return
    }

    this.isConnecting = true

    // Only change to CONNECTING state if not already recording
    if (!this.isRecording) {
      this.callbacks.onStateChange(AppState.CONNECTING)
    }

    console.log('Connecting to GeminiLiveChannel...')

    this.cable = consumer.subscriptions.create("GeminiLiveChannel", {
      connected: () => {
        console.log('Connected to GeminiLiveChannel')
        this.isConnecting = false
      },

      disconnected: () => {
        console.log('Disconnected from GeminiLiveChannel')
        this.cable = null
        this.isRecording = false
        this.isConnecting = false
        this.callbacks.onStateChange(AppState.IDLE)
      },

      received: (data) => {
        this.handleMessage(data)
      }
    })

    // Wait a moment for connection to establish
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  /**
   * Handle incoming messages from Rails via Action Cable
   */
  handleMessage(data) {
    console.log('Received message:', data)

    switch (data.type) {
      case 'ready':
        console.log('Gemini ready')
        break

      case 'turn_complete':
        console.log('Turn complete received')
        this.lastTurnCompleteTime = Date.now()

        // Clear processing timeout
        if (this.processingTimer) {
          clearTimeout(this.processingTimer)
          this.processingTimer = null
        }

        // Only return to IDLE if not actively recording
        if (!this.isRecording) {
          console.log('Not recording - returning to idle')
          this.callbacks.onStateChange(AppState.IDLE)
          this.resetInactivityTimer()
        }
        break

      case 'turbo_stream':
        // Process Turbo Stream to update UI
        if (data.html && window.Turbo) {
          window.Turbo.renderStreamMessage(data.html)
        }
        break

      case 'closed':
        console.log('Gemini connection closed')
        this.callbacks.onStateChange(AppState.IDLE)
        break

      case 'error':
        console.error('Gemini error:', data.message)
        this.callbacks.onError(data.message || 'Connection error')
        this.callbacks.onStateChange(AppState.ERROR)
        break
    }
  }

  /**
   * Start recording audio and streaming to Rails backend
   */
  async startRecording() {
    console.log('Starting recording...')

    // Set recording flag BEFORE connect to prevent race condition
    this.isRecording = true
    this.callbacks.onStateChange(AppState.RECORDING)

    // Clear inactivity timer
    this.clearInactivityTimer()

    // Connect if no cable exists
    if (!this.cable) {
      await this.connect()
    }

    // Wait for connection if in progress
    if (this.isConnecting) {
      console.log('Waiting for connection...')
      const maxWait = 5000
      const startTime = Date.now()
      while (this.isConnecting && Date.now() - startTime < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    if (!this.cable) {
      this.isRecording = false
      throw new Error('Failed to establish cable connection')
    }

    try {
      // Use native streaming if in Turbo Native iOS
      if (this.isTurboNativeIOS()) {
        console.log('Using native streaming recording')
        this.startNativeStreamingRecording()
        return
      }

      // Fall back to web audio API with AudioWorklet
      console.log('Using web AudioWorklet streaming')

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
        if (!this.cable) return
        const inputData = event.data.audioData
        const pcmBlob = createPcmBlob(inputData)

        // Send audio to Rails via Action Cable
        this.cable.perform('receive_audio', { audio: pcmBlob.data })
      }

      // Connect audio nodes
      this.source.connect(this.processor)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      this.callbacks.onError('Could not access microphone.')
      this.isRecording = false
      this.callbacks.onStateChange(AppState.IDLE)
    }
  }

  /**
   * Start native streaming recording (iOS)
   */
  startNativeStreamingRecording() {
    try {
      window.webkit.messageHandlers.startStreamingRecording.postMessage({})
    } catch (error) {
      console.error('Failed to start native streaming recording:', error)
      this.callbacks.onError('Failed to start native recording')
      this.isRecording = false
      this.callbacks.onStateChange(AppState.IDLE)
    }
  }

  /**
   * Stop recording and signal end of audio stream
   */
  async stopRecording() {
    console.log('Stopping recording...')
    this.isRecording = false

    try {
      if (!this.cable) {
        console.log('No cable connection to stop')
        this.callbacks.onStateChange(AppState.IDLE)
        return
      }

      // Check if we got a very recent turnComplete (within 2 seconds)
      const timeSinceLastTurnComplete = this.lastTurnCompleteTime
        ? Date.now() - this.lastTurnCompleteTime
        : Infinity

      if (timeSinceLastTurnComplete < 2000) {
        console.log('Recent turnComplete detected - returning to idle immediately')

        // Stop native recording if using native
        if (this.isNativeRecording) {
          this.stopNativeStreamingRecording()
        }

        // Stop audio
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach(track => track.stop())
          this.mediaStream = null
        }
        if (this.processor && this.inputAudioContext) {
          this.processor.disconnect()
          this.source?.disconnect()
          this.processor = null
          this.source = null
          await this.inputAudioContext.close()
          this.inputAudioContext = null
        }
        this.callbacks.onStateChange(AppState.IDLE)
        this.resetInactivityTimer()
        return
      }

      // Change to processing state
      this.callbacks.onStateChange(AppState.PROCESSING)
      this.clearInactivityTimer()

      // Send silence padding to help Gemini's VAD detect the end of speech
      // Only if using web audio (native doesn't need this)
      if (!this.isNativeRecording) {
        console.log('Sending silence padding for VAD...')
        const silenceChunks = Math.ceil((SAMPLE_RATE * 0.5) / 128) // ~500ms of silence
        const silenceBuffer = new Float32Array(128).fill(0) // Silent audio

        for (let i = 0; i < silenceChunks; i++) {
          if (this.cable) {
            const pcmBlob = createPcmBlob(silenceBuffer)
            this.cable.perform('receive_audio', { audio: pcmBlob.data })
          }
          await new Promise(resolve => setTimeout(resolve, 8)) // ~8ms per chunk at 16kHz
        }

        console.log('Silence padding sent')
      }

      // Stop native recording if using native
      if (this.isNativeRecording) {
        this.stopNativeStreamingRecording()
      }

      // Stop web audio capture if using web
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop())
        this.mediaStream = null
      }

      // Disconnect audio processing nodes
      if (this.processor && this.inputAudioContext) {
        this.processor.disconnect()
        this.source?.disconnect()
        this.processor = null
        this.source = null
        await this.inputAudioContext.close()
        this.inputAudioContext = null
      }

      // Signal end of audio stream to Rails
      this.cable.perform('stop_recording', {})
      console.log('Sent stop_recording to Rails')

      // Add timeout in case turnComplete never arrives
      this.processingTimer = setTimeout(() => {
        if (!this.isRecording && this.cable) {
          console.log('Processing timeout (5s) - returning to idle')
          this.callbacks.onStateChange(AppState.IDLE)
          // DO NOT start inactivity timer yet - we're still connected and waiting
          // The inactivity timer should only start after a successful turn_complete
        }
      }, 5000)

    } catch (error) {
      console.error('Error stopping recording:', error)
      this.callbacks.onError('Error stopping recording.')
      this.callbacks.onStateChange(AppState.IDLE)
    }
  }

  /**
   * Stop native streaming recording (iOS)
   */
  stopNativeStreamingRecording() {
    try {
      window.webkit.messageHandlers.stopStreamingRecording.postMessage({})
    } catch (error) {
      console.error('Failed to stop native streaming recording:', error)
    }
  }

  /**
   * Disconnect from Action Cable
   */
  async disconnect() {
    console.log('Disconnecting...')
    this.clearInactivityTimer()

    if (this.processingTimer) {
      clearTimeout(this.processingTimer)
      this.processingTimer = null
    }

    this.isRecording = false

    // Stop native recording if active
    if (this.isNativeRecording) {
      this.stopNativeStreamingRecording()
      this.isNativeRecording = false
    }

    // Stop audio if active
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }

    // Close audio processing
    if (this.processor && this.inputAudioContext) {
      try {
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

    // Clean up native listeners
    this.removeNativeListeners()

    // Unsubscribe from Action Cable
    if (this.cable) {
      this.cable.unsubscribe()
      this.cable = null
    }

    this.isConnecting = false
    this.callbacks.onStateChange(AppState.IDLE)
  }

  /**
   * Reset the inactivity timer
   */
  resetInactivityTimer() {
    this.clearInactivityTimer()
    this.inactivityTimer = setTimeout(() => {
      console.log('Inactivity timeout - disconnecting')
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
}
