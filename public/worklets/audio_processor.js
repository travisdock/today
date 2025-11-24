/**
 * AudioWorklet processor for capturing and processing audio chunks
 * Runs on the audio rendering thread for better performance
 */
class AudioCaptureProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0]

    // Only process if we have input audio
    if (input && input.length > 0) {
      const channelData = input[0] // Get first channel (mono)

      // Send the audio data to the main thread
      this.port.postMessage({
        audioData: channelData
      })
    }

    // Return true to keep the processor alive
    return true
  }
}

// Register the processor
registerProcessor('audio-capture-processor', AudioCaptureProcessor)
