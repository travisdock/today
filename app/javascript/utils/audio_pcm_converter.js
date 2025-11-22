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
 * Converts ArrayBuffer to base64 string using chunked processing
 * to avoid O(n²) string concatenation performance issues
 * @param {ArrayBuffer} buffer - Binary data to encode
 * @returns {string} Base64-encoded string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  const CHUNK_SIZE = 0x8000  // 32KB chunks - balance between call stack and performance
  const chunks = []

  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    chunks.push(String.fromCharCode.apply(null,
      bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length))
    ))
  }

  return btoa(chunks.join(''))
}
