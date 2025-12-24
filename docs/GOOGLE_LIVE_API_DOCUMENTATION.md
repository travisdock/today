# Google Generative Language Live API Documentation

## Overview

The Google Generative Language Live API provides bidirectional streaming capabilities for real-time audio interaction with Gemini models. This WebSocket-based API enables:

- **Real-time audio streaming** - Send audio chunks as they're captured
- **Native audio understanding** - No speech-to-text preprocessing required
- **Tool calling** - Define functions that the model can invoke based on audio input
- **Streaming responses** - Receive model outputs progressively
- **Low latency** - Optimized for conversational experiences

## Connection Setup

### WebSocket Endpoint

```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key={API_KEY}&alt=ws
```

**Parameters:**
- `key` - Your Google AI API key (required)
- `alt=ws` - Specifies WebSocket protocol (required)

### Recommended Models

- `gemini-2.5-flash-native-audio-preview-09-2025` - Optimized for native audio processing

### Connection Example

```javascript
const apiKey = 'YOUR_API_KEY';
const model = 'gemini-2.5-flash-native-audio-preview-09-2025';
const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}&alt=ws`;

const ws = new WebSocket(url);

ws.onopen = () => {
  console.log('Connected to Gemini Live API');
  sendSetupMessage();
};
```

## Protocol Overview

The Live API uses a bidirectional message-based protocol. All messages are JSON objects sent as text frames.

### Message Flow

1. **Client → Server**: Setup configuration
2. **Server → Client**: Setup complete confirmation
3. **Client → Server**: Audio chunks (continuous streaming)
4. **Server → Client**: Model outputs (text, tool calls, audio)
5. **Client → Server**: Tool responses (if tools were called)
6. **Server → Client**: Turn complete signal

## Configuration Messages

### 1. Setup Message

Send this immediately after connection to configure the session.

```javascript
const setupMessage = {
  setup: {
    model: `models/${modelName}`,
    generation_config: {
      response_modalities: ['TEXT']  // or ['AUDIO'] or both
    },
    system_instruction: {
      parts: [{
        text: "Your system instructions here"
      }]
    },
    tools: [
      {
        function_declarations: [
          {
            name: "createTodos",
            description: "Extract todo items from user speech",
            parameters: {
              type: "object",
              properties: {
                todos: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      content: { type: "string" }
                    },
                    required: ["content"]
                  }
                }
              },
              required: ["todos"]
            }
          }
        ]
      }
    ]
  }
};

ws.send(JSON.stringify(setupMessage));
```

**Key Fields:**
- `model` - Must include "models/" prefix
- `response_modalities` - Array of 'TEXT' and/or 'AUDIO'
- `system_instruction` - Optional context for the model
- `tools` - Array of function declarations using JSON Schema

### 2. Setup Complete Response

The server responds when ready to receive audio:

```json
{
  "setupComplete": {}
}
```

## Audio Streaming

### Audio Format Requirements

- **Encoding**: PCM 16-bit signed integer
- **Sample Rate**: 16,000 Hz (16 kHz)
- **Channels**: 1 (mono)
- **Transport**: Base64-encoded

### Sending Audio Chunks

```javascript
const audioMessage = {
  realtimeInput: {
    mediaChunks: [
      {
        mimeType: "audio/pcm",
        data: base64EncodedPCM16Data
      }
    ]
  }
};

ws.send(JSON.stringify(audioMessage));
```

### Audio Conversion Example

Converting browser Float32 audio to PCM16:

```javascript
// audioData is Float32Array from Web Audio API
function convertFloat32ToPCM16(float32Array) {
  const pcm16 = new Int16Array(float32Array.length);

  for (let i = 0; i < float32Array.length; i++) {
    // Clamp to [-1, 1] range
    const clamped = Math.max(-1, Math.min(1, float32Array[i]));
    // Convert to 16-bit integer range
    pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
  }

  // Convert to base64
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
```

### Recommended Chunk Size

- **128-256 samples** per chunk (8-16ms at 16kHz)
- Smaller chunks = lower latency but more overhead
- Larger chunks = better efficiency but higher latency

### Browser Audio Capture with AudioWorklet

```javascript
// Register processor
await audioContext.audioWorklet.addModule('/worklets/audio_processor.js');

// Create processor node
const processorNode = new AudioWorkletNode(audioContext, 'audio-processor', {
  processorOptions: {
    chunkSize: 128  // samples per chunk
  }
});

// Handle chunks
processorNode.port.onmessage = (event) => {
  const float32Data = event.data;
  const pcm16Base64 = convertFloat32ToPCM16(float32Data);

  ws.send(JSON.stringify({
    realtimeInput: {
      mediaChunks: [{ mimeType: "audio/pcm", data: pcm16Base64 }]
    }
  }));
};

// Connect microphone
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(processorNode);
  });
```

## Receiving Model Outputs

### Response Types

The server sends various message types:

#### 1. Server Content (Text/Audio Responses)

```json
{
  "serverContent": {
    "modelTurn": {
      "parts": [
        {
          "text": "I understood you want to: buy groceries and call mom"
        }
      ]
    },
    "turnComplete": false
  }
}
```

#### 2. Tool Calls

```json
{
  "toolCall": {
    "functionCalls": [
      {
        "id": "call_12345",
        "name": "createTodos",
        "args": {
          "todos": [
            { "content": "buy groceries" },
            { "content": "call mom" }
          ]
        }
      }
    ]
  }
}
```

#### 3. Turn Complete

```json
{
  "serverContent": {
    "turnComplete": true
  }
}
```

### Message Handler Example

```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.setupComplete) {
    console.log('Setup complete, ready for audio');
  }

  if (message.serverContent) {
    const { modelTurn, turnComplete } = message.serverContent;

    if (modelTurn?.parts) {
      modelTurn.parts.forEach(part => {
        if (part.text) {
          console.log('Model response:', part.text);
        }
        if (part.inlineData?.mimeType === 'audio/pcm') {
          // Handle audio response
          playAudioResponse(part.inlineData.data);
        }
      });
    }

    if (turnComplete) {
      console.log('Turn complete');
      // Ready for next interaction
    }
  }

  if (message.toolCall) {
    handleToolCalls(message.toolCall.functionCalls);
  }
};
```

## Tool Calling

### Defining Tools

Tools are defined in the setup message using JSON Schema:

```javascript
tools: [
  {
    function_declarations: [
      {
        name: "createTodos",
        description: "Extract and create todo items from user speech",
        parameters: {
          type: "object",
          properties: {
            todos: {
              type: "array",
              description: "Array of todo items",
              items: {
                type: "object",
                properties: {
                  content: {
                    type: "string",
                    description: "The todo item description"
                  }
                },
                required: ["content"]
              }
            }
          },
          required: ["todos"]
        }
      }
    ]
  }
]
```

### Handling Tool Calls

When the model decides to call a tool:

```javascript
function handleToolCalls(functionCalls) {
  functionCalls.forEach(call => {
    console.log(`Tool called: ${call.name}`);
    console.log('Arguments:', call.args);

    let result;

    if (call.name === 'createTodos') {
      result = createTodos(call.args.todos);
    }

    // Send tool response back to model
    sendToolResponse(call.id, result);
  });
}
```

### Sending Tool Responses

```javascript
function sendToolResponse(callId, result) {
  const response = {
    toolResponse: {
      functionResponses: [
        {
          id: callId,
          name: "createTodos",
          response: {
            success: true,
            created: result.length,
            message: `Created ${result.length} todos`
          }
        }
      ]
    }
  };

  ws.send(JSON.stringify(response));
}
```

## Complete Implementation Example

### Backend WebSocket Client (Ruby)

```ruby
require 'faye/websocket'
require 'eventmachine'

class GeminiWebsocketClient
  attr_reader :ws, :on_setup_complete, :on_tool_call, :on_turn_complete

  def initialize(api_key, model_name, tools = [])
    @api_key = api_key
    @model_name = model_name
    @tools = tools
    @url = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=#{@api_key}&alt=ws"
  end

  def connect
    @ws = Faye::WebSocket::Client.new(@url)

    @ws.on :open do
      send_setup_message
    end

    @ws.on :message do |event|
      handle_message(JSON.parse(event.data))
    end

    @ws.on :error do |event|
      Rails.logger.error "WebSocket error: #{event.message}"
    end

    @ws.on :close do |event|
      Rails.logger.info "WebSocket closed: #{event.code} #{event.reason}"
    end
  end

  def send_setup_message
    setup = {
      setup: {
        model: "models/#{@model_name}",
        generation_config: {
          response_modalities: ['TEXT']
        },
        tools: @tools
      }
    }

    send_message(setup)
  end

  def send_audio_chunk(base64_data)
    message = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: "audio/pcm",
            data: base64_data
          }
        ]
      }
    }

    send_message(message)
  end

  def send_tool_response(call_id, name, response)
    message = {
      toolResponse: {
        functionResponses: [
          {
            id: call_id,
            name: name,
            response: response
          }
        ]
      }
    }

    send_message(message)
  end

  private

  def handle_message(data)
    if data['setupComplete']
      @on_setup_complete&.call
    end

    if data['toolCall']
      @on_tool_call&.call(data['toolCall']['functionCalls'])
    end

    if data['serverContent']&.dig('turnComplete')
      @on_turn_complete&.call
    end
  end

  def send_message(message)
    @ws.send(JSON.stringify(message))
  end
end
```

### Frontend Streaming Service (JavaScript)

```javascript
export default class GeminiCableService {
  constructor() {
    this.cable = null;
    this.channel = null;
    this.audioContext = null;
    this.processorNode = null;
    this.stream = null;
  }

  async connect(callbacks = {}) {
    // Connect to Rails Action Cable (proxies to Gemini)
    this.cable = ActionCable.createConsumer('/cable');

    this.channel = this.cable.subscriptions.create('GeminiLiveChannel', {
      received: (data) => this.handleMessage(data, callbacks)
    });

    // Setup audio capture
    await this.setupAudio();
  }

  async setupAudio() {
    this.audioContext = new AudioContext({ sampleRate: 16000 });

    // Load audio processor worklet
    await this.audioContext.audioWorklet.addModule('/worklets/audio_processor.js');

    // Create processor
    this.processorNode = new AudioWorkletNode(this.audioContext, 'audio-processor', {
      processorOptions: { chunkSize: 128 }
    });

    // Handle audio chunks
    this.processorNode.port.onmessage = (event) => {
      const pcm16Base64 = this.convertFloat32ToPCM16(event.data);
      this.sendAudio(pcm16Base64);
    };
  }

  async startRecording() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    const source = this.audioContext.createMediaStreamSource(this.stream);
    source.connect(this.processorNode);
  }

  stopRecording() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  sendAudio(base64Data) {
    this.channel.perform('receive_audio', { audio_data: base64Data });
  }

  convertFloat32ToPCM16(float32Array) {
    const pcm16 = new Int16Array(float32Array.length);

    for (let i = 0; i < float32Array.length; i++) {
      const clamped = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
    }

    const bytes = new Uint8Array(pcm16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  handleMessage(data, callbacks) {
    if (data.type === 'setup_complete') {
      callbacks.onSetupComplete?.();
    }

    if (data.type === 'tool_call') {
      callbacks.onToolCall?.(data.function_calls);
    }

    if (data.type === 'turn_complete') {
      callbacks.onTurnComplete?.();
    }
  }

  disconnect() {
    this.stopRecording();
    this.channel?.unsubscribe();
    this.cable?.disconnect();
    this.audioContext?.close();
  }
}
```

## Best Practices

### 1. Connection Management

- Always handle connection errors gracefully
- Implement reconnection logic with exponential backoff
- Send setup message immediately after connection opens
- Wait for `setupComplete` before streaming audio

### 2. Audio Streaming

- Use 16kHz sample rate for optimal performance
- Keep chunk sizes small (8-16ms) for low latency
- Always send PCM16 format, not Float32
- Validate base64 encoding before sending

### 3. Tool Calling

- Provide clear, descriptive function names and descriptions
- Use JSON Schema for parameter validation
- Always respond to tool calls with structured data
- Include error information in tool responses

### 4. Error Handling

```javascript
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Implement reconnection logic
};

ws.onclose = (event) => {
  if (event.code !== 1000) {
    console.error('Unexpected close:', event.code, event.reason);
    // Attempt reconnection
  }
};
```

### 5. Turn Management

- Track turn state to avoid sending audio during model responses
- Implement timeout for turn completion (8-10 seconds recommended)
- Force turn completion if timeout exceeded:

```javascript
let turnTimer = null;

function startTurnTimer() {
  clearTimeout(turnTimer);
  turnTimer = setTimeout(() => {
    console.warn('Turn timeout, forcing completion');
    handleTurnComplete();
  }, 8000);
}

function handleTurnComplete() {
  clearTimeout(turnTimer);
  // Ready for next turn
}
```

### 6. Performance Optimization

- Reuse AudioContext across sessions
- Pool base64 encoding operations
- Batch small messages when possible
- Monitor WebSocket send buffer

## Common Issues and Solutions

### Issue: No audio being processed

**Solution:** Verify audio format is exactly PCM16 16kHz mono:

```javascript
// Check your audio context
console.log('Sample rate:', audioContext.sampleRate); // Should be 16000

// Verify conversion is producing PCM16
const testFloat32 = new Float32Array([0.5, -0.5, 0.25, -0.25]);
const testPCM16 = convertFloat32ToPCM16(testFloat32);
console.log('PCM16 output:', testPCM16); // Should be base64 string
```

### Issue: Tool calls not triggering

**Solution:** Ensure your function declarations are valid JSON Schema:

```javascript
// Good - specific and structured
{
  name: "createTodos",
  description: "Extract todo items from user speech and create them",
  parameters: {
    type: "object",
    properties: {
      todos: {
        type: "array",
        items: {
          type: "object",
          properties: {
            content: { type: "string" }
          },
          required: ["content"]
        }
      }
    },
    required: ["todos"]
  }
}

// Bad - vague description, missing schema details
{
  name: "create",
  description: "create something",
  parameters: { type: "object" }
}
```

### Issue: Connection drops frequently

**Solution:** Implement heartbeat and reconnection:

```javascript
let heartbeatInterval;

ws.onopen = () => {
  heartbeatInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      // Send empty message as keepalive
      ws.send(JSON.stringify({}));
    }
  }, 30000); // 30 seconds
};

ws.onclose = () => {
  clearInterval(heartbeatInterval);
  setTimeout(() => reconnect(), 1000);
};
```

### Issue: Base64 encoding errors

**Solution:** Handle byte array conversion carefully:

```javascript
// Use proper byte array to base64 conversion
function pcm16ToBase64(int16Array) {
  // Method 1: Using Uint8Array view
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 32768;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, chunk);
  }

  return btoa(binary);
}
```

## Rate Limits and Quotas

- **Concurrent connections:** Check your API quota
- **Message size:** Keep individual messages under 1MB
- **Audio duration:** No strict limit, but handle long sessions with reconnection
- **Tool calls:** No documented limit per turn

## Security Considerations

1. **API Key Protection:**
   - Never expose API keys in client-side code
   - Use backend proxy for production applications
   - Rotate keys regularly

2. **Audio Privacy:**
   - Inform users audio is being sent to Google
   - Implement user consent flows
   - Consider recording indicators

3. **Tool Security:**
   - Validate all tool responses
   - Sanitize tool call arguments
   - Implement rate limiting on tool execution

## Testing

### Test WebSocket Connection

```bash
# Using websocat
websocat "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=YOUR_KEY&alt=ws"

# Send setup message
{"setup":{"model":"models/gemini-2.5-flash-native-audio-preview-09-2025"}}
```

### Test Audio Format

```javascript
// Generate test tone in PCM16 format
function generateTestTone(frequency = 440, duration = 1.0, sampleRate = 16000) {
  const samples = Math.floor(duration * sampleRate);
  const pcm16 = new Int16Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const value = Math.sin(2 * Math.PI * frequency * t);
    pcm16[i] = value * 0x7FFF;
  }

  return pcm16ToBase64(pcm16);
}
```

## Additional Resources

- **Official Documentation:** https://ai.google.dev/api/multimodal-live
- **API Reference:** https://ai.google.dev/api/websockets
- **Community Forum:** https://discuss.ai.google.dev/

## Example Project Structure

```
project/
├── backend/
│   ├── services/
│   │   └── gemini_websocket_client.rb
│   └── channels/
│       └── gemini_live_channel.rb
├── frontend/
│   ├── services/
│   │   └── gemini_cable_service.js
│   ├── utils/
│   │   └── audio_pcm_converter.js
│   └── controllers/
│       └── streaming_audio_recorder_controller.js
└── public/
    └── worklets/
        └── audio_processor.js
```

This architecture uses Rails Action Cable as a proxy between the browser and Gemini WebSocket, allowing for authentication, session management, and easier debugging.

---

**Version:** 1.0
**Last Updated:** 2025-11-25
**API Version:** v1beta
