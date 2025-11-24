/**
 * Converts Float32Array from AudioContext to PCM Int16 ArrayBuffer
 * and returns the format expected by Gemini Live API.
 *
 * @param {Float32Array} data - Audio data from AudioContext (-1.0 to 1.0)
 * @returns {Object} Blob object with base64-encoded PCM data and mime type
 */
export function createPcmBlob(data) {
  const length = data.length
  const int16 = new Int16Array(length)

  // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
  for (let i = 0; i < length; i++) {
    int16[i] = Math.max(-32768, Math.min(32767, data[i] * 32768))
  }

  return {
    data: arrayBufferToBase64(int16.buffer),
    mimeType: 'audio/pcm;rate=16000',
  }
}

/**
 * Converts ArrayBuffer to base64 string
 * @param {ArrayBuffer} buffer - Binary data to encode
 * @returns {string} Base64-encoded string
 */
function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
}
