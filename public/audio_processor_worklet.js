// AudioWorklet processor for real-time audio capture
// Runs in separate audio rendering thread for better performance

class AudioProcessorWorklet extends AudioWorkletProcessor {
  constructor() {
    super()
    this.isRecording = true

    // Listen for stop command from main thread
    this.port.onmessage = (event) => {
      if (event.data.command === 'stop') {
        this.isRecording = false
      }
    }
  }

  process(inputs, outputs, parameters) {
    if (!this.isRecording || !inputs[0] || !inputs[0][0]) {
      return true
    }

    const inputData = inputs[0][0] // Float32Array [-1, 1]

    // Convert Float32 to Int16 PCM
    const pcmData = new Int16Array(inputData.length)
    for (let i = 0; i < inputData.length; i++) {
      const s = Math.max(-1, Math.min(1, inputData[i]))
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }

    // Send to main thread (transfer buffer ownership to avoid copy)
    this.port.postMessage({
      type: 'audio',
      data: pcmData.buffer
    }, [pcmData.buffer])

    return true
  }
}

registerProcessor('audio-processor-worklet', AudioProcessorWorklet)
