/**
 * AudioWorklet processor for capturing and processing audio chunks
 * Runs on the audio rendering thread for better performance
 * Buffers samples to reduce message passing overhead
 */
class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.buffer = []
    this.bufferSize = 4096 // ~256ms at 16kHz - balances latency vs overhead
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]

    // Only process if we have input audio
    if (input && input.length > 0) {
      const channelData = input[0] // Get first channel (mono)

      // Accumulate samples in buffer
      for (let i = 0; i < channelData.length; i++) {
        this.buffer.push(channelData[i])
      }

      // Send when buffer reaches threshold
      if (this.buffer.length >= this.bufferSize) {
        this.port.postMessage({
          audioData: new Float32Array(this.buffer)
        })
        this.buffer = []
      }
    }

    // Return true to keep the processor alive
    return true
  }
}

// Register the processor
registerProcessor('audio-capture-processor', AudioCaptureProcessor)
