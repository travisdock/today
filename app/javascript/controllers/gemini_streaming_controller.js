import { Controller } from "@hotwired/stimulus"
import consumer from "channels/consumer"

export default class extends Controller {
  static targets = ["button", "status"]

  connect() {
    this.channel = null
    this.audioContext = null
    this.audioProcessor = null
    this.mediaStream = null
    this.isRecording = false
    this.isStopping = false
  }

  disconnect() {
    this.cleanup()
  }

  async toggle(event) {
    event.preventDefault()

    if (this.isRecording) {
      await this.stopRecording()
    } else {
      await this.startRecording()
    }
  }

  async startRecording() {
    console.log('[GeminiStreaming] Starting recording')

    // Request microphone access
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      console.error('[GeminiStreaming] Failed to get microphone access:', error)
      this.updateStatus('Microphone access denied')
      return
    }

    // Subscribe to Action Cable channel
    this.channel = consumer.subscriptions.create("GeminiStreamingChannel", {
      connected() {
        console.log('[GeminiStreaming] Action Cable connected')
      },

      disconnected() {
        console.log('[GeminiStreaming] Action Cable disconnected')
      },

      received(data) {
        console.log('[GeminiStreaming] Received:', data)

        if (data.type === 'turbo_stream_html') {
          Turbo.renderStreamMessage(data.html)
        }

        if (data.type === 'complete') {
          this.controller.updateStatus(data.message)
          this.controller.cleanup()
        }
      }
    })

    // Store controller reference for callbacks
    this.channel.controller = this

    // Wait a moment for subscription
    await new Promise(resolve => setTimeout(resolve, 100))

    this.startAudioCapture()
  }

  async startAudioCapture() {
    try {
      // Create audio context with 16kHz sample rate (Gemini requirement)
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 })

      // Load AudioWorklet module
      await this.audioContext.audioWorklet.addModule('/audio_processor_worklet.js')

      const source = this.audioContext.createMediaStreamSource(this.mediaStream)

      // Create AudioWorklet node
      this.audioProcessor = new AudioWorkletNode(this.audioContext, 'audio-processor-worklet')

      // Receive processed audio from worklet
      this.audioProcessor.port.onmessage = (event) => {
        if (event.data.type === 'audio' && this.channel) {
          // Convert ArrayBuffer to base64
          const base64 = this.arrayBufferToBase64(event.data.data)

          // Send PCM audio chunk via Action Cable
          this.channel.perform('receive_audio', { audio: base64 })
        }
      }

      // Connect audio nodes
      source.connect(this.audioProcessor)
      this.audioProcessor.connect(this.audioContext.destination)

      this.isRecording = true
      this.updateButtonRecording()
      this.updateStatus('Recording... (speak naturally with pauses)')

    } catch (error) {
      console.error('[GeminiStreaming] Failed to start audio capture:', error)
      this.updateStatus('Recording not supported')
      this.cleanup()
    }
  }

  arrayBufferToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  async stopRecording() {
    if (this.isStopping) return
    this.isStopping = true

    console.log('[GeminiStreaming] Stop button clicked, capturing 500ms silence...')
    this.updateStatus('Processing...')

    // Continue recording for 500ms to capture silence
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('[GeminiStreaming] Stopping audio capture')

    // Stop recording flag to halt audio processing
    this.isRecording = false

    // Wait for final chunks to be sent
    await new Promise(resolve => setTimeout(resolve, 100))

    // Send stop signal
    if (this.channel) {
      console.log('[GeminiStreaming] Sending stop signal')
      this.channel.perform('stop_recording', {})
    }

    this.isStopping = false
  }

  updateButtonRecording() {
    this.buttonTarget.classList.remove('bg-green-600', 'hover:bg-green-700')
    this.buttonTarget.classList.add('bg-red-600', 'hover:bg-red-700')
  }

  updateButtonReady() {
    this.buttonTarget.classList.remove('bg-red-600', 'hover:bg-red-700')
    this.buttonTarget.classList.add('bg-green-600', 'hover:bg-green-700')
  }

  updateStatus(message) {
    if (this.hasStatusTarget) {
      this.statusTarget.textContent = message
    }
  }

  cleanup() {
    console.log('[GeminiStreaming] Cleaning up')

    this.isRecording = false

    if (this.audioProcessor) {
      // Send stop command to worklet
      this.audioProcessor.port.postMessage({ command: 'stop' })
      // Remove message handler to prevent memory leak
      this.audioProcessor.port.onmessage = null
      this.audioProcessor.disconnect()
      this.audioProcessor = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }

    if (this.channel) {
      consumer.subscriptions.remove(this.channel)
      this.channel = null
    }

    this.isStopping = false
    this.updateButtonReady()
  }
}
