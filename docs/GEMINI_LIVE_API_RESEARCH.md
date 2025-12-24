# Gemini Live API (Multimodal Live API) - WebSocket Protocol Research

## Executive Summary

The Gemini Live API is a low-latency, bidirectional streaming API that uses WebSockets for real-time voice and video interactions. It supports multimodal input (text, audio, video) and output (text, audio), with features like voice activity detection, function calling, and session management. Server-side implementations are feasible in Python, Node.js, and potentially Ruby using standard WebSocket libraries.

---

## 1. WebSocket Protocol & Endpoint

### Connection Endpoint

**Google AI (Gemini API):**
```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent
```

**Vertex AI:**
```
wss://google.cloud.aiplatform.{version}.LlmBidiService/BidiGenerateContent
```

### Authentication

**Google AI API - Query Parameter Method:**
```
wss://generativelanguage.googleapis.com/ws/v1beta/models/{MODEL}:BidiGenerateContent?key={API_KEY}&alt=ws
```

Example:
```
wss://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:BidiGenerateContent?key=YOUR_API_KEY&alt=ws
```

**Vertex AI - OAuth/Service Account:**
- Uses Bearer tokens in headers: `Authorization: Bearer {token}`
- Tokens obtained via Google Cloud authentication

**Ephemeral Tokens (Recommended for Production):**
- For client-to-server implementations
- Obtained via `AuthTokenService.CreateToken`
- Can be passed as query parameters or HTTP headers with "Token" prefix
- Mitigates security risks of exposing API keys client-side

---

## 2. Official Documentation

### Primary Resources

1. **WebSocket API Reference:**
   - https://ai.google.dev/api/live
   - Complete protocol specification with message types and field definitions

2. **Getting Started Guide:**
   - https://ai.google.dev/gemini-api/docs/live
   - Implementation approaches and audio specifications

3. **Vertex AI Reference:**
   - https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/multimodal-live
   - Enterprise-focused documentation

4. **Tool Use Guide:**
   - https://ai.google.dev/gemini-api/docs/live-tools
   - Function calling implementation details

5. **Session Management:**
   - https://ai.google.dev/gemini-api/docs/live-session
   - Session resumption and management

### GitHub Examples

1. **Official Web Console:**
   - https://github.com/google-gemini/live-api-web-console
   - React-based starter app with WebSocket client

2. **Google Cloud Platform Examples:**
   - https://github.com/GoogleCloudPlatform/generative-ai/tree/main/gemini/multimodal-live-api
   - Python WebSocket server demo
   - Colab notebooks with audio/video examples

3. **Python SDK Source:**
   - https://github.com/googleapis/python-genai/blob/main/google/genai/live.py
   - Official Python SDK implementation details

4. **Pipecat AI Examples:**
   - https://github.com/pipecat-ai/gemini-multimodal-live-demo
   - Python server implementations

---

## 3. Message Formats

### Protocol Overview

All WebSocket messages are JSON-encoded. The client sends messages with exactly ONE of these fields:
- `setup` - Initial configuration
- `clientContent` - Turn-based conversation updates
- `realtimeInput` - Streaming audio/video/text
- `toolResponse` - Function execution results

Server responses contain exactly ONE of these message types:
- `setupComplete` - Configuration acknowledgment
- `serverContent` - Model-generated content
- `toolCall` - Function execution requests
- `toolCallCancellation` - Canceled function calls
- `goAway` - Connection termination notice
- `sessionResumptionUpdate` - Session checkpoint data

### A. Connection & Setup

**Initial Setup Message (Client → Server):**
```json
{
  "setup": {
    "model": "models/gemini-2.0-flash-exp",
    "generationConfig": {
      "responseModalities": ["AUDIO"],
      "temperature": 0.7,
      "maxOutputTokens": 2048,
      "speechConfig": {
        "voiceConfig": {
          "prebuiltVoiceConfig": {
            "voiceName": "Aoede"
          }
        }
      }
    },
    "systemInstruction": {
      "parts": [{"text": "You are my helpful assistant."}]
    },
    "tools": [{
      "functionDeclarations": [
        {
          "name": "get_weather",
          "description": "Get current weather",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {
                "type": "string",
                "description": "City name"
              }
            },
            "required": ["location"]
          }
        }
      ]
    }],
    "realtimeInputConfig": {
      "automaticActivityDetection": {
        "startOfSpeechSensitivity": "HIGH",
        "endOfSpeechSensitivity": "LOW",
        "prefixPaddingMs": 300,
        "silenceDurationMs": 500
      }
    }
  }
}
```

**Server Response:**
```json
{
  "setupComplete": {}
}
```

### B. Audio Streaming

**Client Audio Input (Client → Server):**

Format Requirements:
- 16-bit PCM encoding
- 16kHz sample rate
- Mono channel
- Base64-encoded

```json
{
  "realtimeInput": {
    "mediaChunks": [{
      "mimeType": "audio/pcm;rate=16000",
      "data": "<base64_encoded_audio>"
    }]
  }
}
```

**Server Audio Response (Server → Client):**

Format:
- PCM at 24kHz sample rate
- Base64-encoded

```json
{
  "serverContent": {
    "modelTurn": {
      "parts": [{
        "inlineData": {
          "mimeType": "audio/pcm;rate=24000",
          "data": "<base64_encoded_audio>"
        }
      }]
    },
    "turnComplete": false,
    "interrupted": false
  }
}
```

### C. Text Messages

**Client Text (Client → Server):**
```json
{
  "clientContent": {
    "turns": [{
      "role": "user",
      "parts": [{"text": "Hello, how are you?"}]
    }],
    "turnComplete": true
  }
}
```

**Server Text Response:**
```json
{
  "serverContent": {
    "modelTurn": {
      "parts": [{"text": "I'm doing well, thank you!"}]
    },
    "turnComplete": true,
    "generationComplete": true
  }
}
```

### D. Transcription

**Server Message with Transcriptions:**
```json
{
  "serverContent": {
    "modelTurn": {
      "parts": [{"text": "..."}]
    },
    "inputTranscription": {
      "text": "User's spoken words transcribed"
    },
    "outputTranscription": {
      "text": "Model's spoken response transcribed"
    },
    "turnComplete": true
  }
}
```

### E. Tool Calling (Function Declarations)

**Setup with Function Declarations:**
```json
{
  "setup": {
    "model": "models/gemini-2.0-flash-exp",
    "tools": [{
      "functionDeclarations": [
        {
          "name": "turn_on_lights",
          "description": "Turn on the lights"
        },
        {
          "name": "get_temperature",
          "description": "Gets current temperature",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {
                "type": "string",
                "description": "City name"
              }
            },
            "required": ["location"]
          }
        }
      ]
    }]
  }
}
```

**Server Tool Call Request:**
```json
{
  "toolCall": {
    "functionCalls": [{
      "id": "call_123",
      "name": "get_temperature",
      "args": {
        "location": "San Francisco"
      }
    }]
  }
}
```

**Client Tool Response:**
```json
{
  "toolResponse": {
    "functionResponses": [{
      "id": "call_123",
      "name": "get_temperature",
      "response": {
        "temperature": 72,
        "unit": "fahrenheit"
      }
    }]
  }
}
```

**Non-Blocking Functions (Async Execution):**
```json
{
  "name": "turn_on_lights",
  "behavior": "NON_BLOCKING"
}
```

Response scheduling options:
- `"INTERRUPT"` - Immediately notify about results
- `"WHEN_IDLE"` - Wait until current operations complete
- `"SILENT"` - Store knowledge for later use

### F. Turn Completion Signals

**Key Fields:**
- `turnComplete`: Boolean indicating end of a turn
- `generationComplete`: Boolean indicating model finished generating
- `interrupted`: Boolean indicating if the turn was interrupted (barge-in)

Example:
```json
{
  "serverContent": {
    "modelTurn": {...},
    "turnComplete": true,
    "generationComplete": true,
    "interrupted": false
  }
}
```

### G. Activity Detection

**Manual Activity Signals:**
```json
{
  "realtimeInput": {
    "activityStart": {}
  }
}
```

```json
{
  "realtimeInput": {
    "activityEnd": {}
  }
}
```

---

## 4. Server-Side Implementation

### Feasibility: YES

Server-side implementations are fully supported and recommended by Google. The official documentation states:

> "The Live API requires server-to-server authentication; client input should route through an intermediate application server."

### Implementation Approaches

**1. Server-to-Server (Recommended):**
- Backend connects to Live API using WebSockets
- Backend forwards client stream data to the API
- More secure (API keys not exposed)
- Better control over authentication and rate limiting

**2. Client-to-Server:**
- Frontend connects directly via WebSocket
- Better streaming performance
- **Must use ephemeral tokens in production** (not API keys)

### Language Support

**Python - OFFICIAL SDK:**
```python
from google import genai
from google.genai.types import (Content, HttpOptions, LiveConnectConfig,
                                Modality, Part)

client = genai.Client(http_options=HttpOptions(api_version="v1beta1"))
model_id = "gemini-2.0-flash-live-preview-04-09"

async with client.aio.live.connect(
    model=model_id,
    config=LiveConnectConfig(response_modalities=[Modality.TEXT]),
) as session:
    await session.send_client_content(
        turns=Content(role="user", parts=[Part(text="Hello?")])
    )
    async for message in session.receive():
        if message.text:
            print(message.text)
```

**Node.js - OFFICIAL SDK:**
```javascript
import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({apiKey: process.env.API_KEY});

const session = await client.live.connect({
  model: 'gemini-2.0-flash-exp',
  config: {
    responseModalities: ['AUDIO']
  }
});

session.on('message', (msg) => {
  if (msg.serverContent) {
    console.log(msg.serverContent);
  }
});

await session.send({
  clientContent: {
    turns: [{role: 'user', parts: [{text: 'Hello'}]}],
    turnComplete: true
  }
});
```

**Ruby - NO OFFICIAL SDK:**
- No official Ruby SDK exists for Live API
- Feasible using Ruby WebSocket libraries (e.g., `faye-websocket`, `websocket-client-simple`)
- Would need to implement the protocol manually following the JSON message formats above

**Generic WebSocket Implementation (Any Language):**

1. Establish WebSocket connection to endpoint with API key
2. Send setup message with model configuration
3. Wait for setupComplete
4. Stream audio/text via realtimeInput or clientContent
5. Receive serverContent messages
6. Handle tool calls if using functions
7. Manage turn completion signals

---

## 5. Server-Side Examples

### Python Server (Pipecat AI)

**Repository:** https://github.com/pipecat-ai/gemini-multimodal-live-demo

Features:
- Full Python backend using Pipecat framework
- WebSocket connection to Gemini API
- Real-time audio processing
- Function calling support

**Repository:** https://github.com/GoogleCloudPlatform/generative-ai/tree/main/gemini/multimodal-live-api/websocket-demo-app

Features:
- Python WebSocket server backend
- Handles authentication as intermediary
- Demonstrates audio/video streaming

### Python Colab Notebooks

**URL:** https://colab.research.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Get_started_LiveAPI.ipynb

Demonstrates:
- Text-to-text generation
- Text-to-audio generation
- Direct API access patterns

### Node.js Examples

**Repository:** https://github.com/google-gemini/live-api-web-console

Features:
- React frontend with Node.js concepts
- Event-emitting WebSocket client
- Audio/video handling

### Raw WebSocket Implementation Notes

From GitHub Gist (https://gist.github.com/quartzjer/9636066e96b4f904162df706210770e4):

```javascript
// WebSocket connection
const ws = new WebSocket(
  'wss://generativelanguage.googleapis.com/ws/v1beta/models/gemini-2.0-flash-exp:BidiGenerateContent?key=' + API_KEY + '&alt=ws'
);

ws.onopen = () => {
  // Send setup
  ws.send(JSON.stringify({
    setup: {
      model: 'models/gemini-2.0-flash-exp',
      generationConfig: {
        responseModalities: 'audio'
      }
    }
  }));
};

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);

  if (response.setupComplete) {
    console.log('Setup complete');
  }

  if (response.serverContent) {
    const modelTurn = response.serverContent.modelTurn;
    // Process audio or text
  }
};

// Send audio
const audioData = base64EncodedPCM; // 16kHz, 16-bit PCM
ws.send(JSON.stringify({
  realtimeInput: {
    mediaChunks: [{
      mimeType: 'audio/pcm;rate=16000',
      data: audioData
    }]
  }
}));
```

---

## 6. Technical Challenges & Limitations

### Rate Limits

**Concurrent Sessions:**
- Free tier: 3 concurrent sessions per API key
- Paid tier: 5,000 concurrent sessions per project

**Request Limits:**
- Free tier: 5 requests per minute (RPM), 25 per day (RPD)
- Tier 1 (Paid): 300 RPM, 1M tokens per minute, 1,000 RPD

**Rate limits are per project, not per API key**

### Session Duration

- **Default maximum:** 10 minutes per session
- **Audio-only sessions:** Up to 15 minutes
- **Audio-video sessions:** Up to 2 minutes (without compression)
- Sessions terminate when limit exceeded
- **Resumption tokens:** Valid for 2 hours after session termination

### Context Limitations

- Limited by model's context window
- Large chunks of input may cause earlier session termination
- Context compression options available:
  - Sliding window compression
  - Token-based compression

### Video Processing

- **Frame rate:** 1 frame per second (FPS) maximum
- Lower resolution recommended for longer sessions

### Audio Format Constraints

**Input:**
- Must be 16-bit PCM
- Must be 16kHz sample rate
- Must be mono channel
- Must be base64-encoded

**Output:**
- 24kHz sample rate
- Single channel

### Unsupported Features

- Token counting during session
- Manual endpointing
- Some models have limited Live API support

### Technical Challenges

1. **Audio Processing:**
   - Client must handle PCM conversion
   - Need to manage audio buffering
   - Real-time encoding/decoding overhead

2. **WebSocket Management:**
   - Connection stability over long sessions
   - Reconnection logic needed
   - Heartbeat/keepalive may be required

3. **State Management:**
   - Track turn completion
   - Handle interruptions (barge-in)
   - Manage concurrent tool calls

4. **Error Handling:**
   - Network disconnections
   - API errors
   - Rate limit handling

5. **Latency Optimization:**
   - Minimize audio chunk size vs. overhead
   - Efficient base64 encoding
   - Stream processing without buffering

---

## 7. Authentication Requirements

### API Key (Development/Testing)

**Query Parameter (Simplest):**
```
wss://generativelanguage.googleapis.com/ws/v1beta/models/{MODEL}:BidiGenerateContent?key={API_KEY}&alt=ws
```

**Officially confirmed supported by Google developer**

### Ephemeral Tokens (Production - Client-to-Server)

For production client-side implementations:

1. Backend calls `AuthTokenService.CreateToken` to generate ephemeral token
2. Token sent to client
3. Client uses token in WebSocket connection (query param or header with "Token" prefix)
4. Mitigates risk of exposing API keys

### OAuth/Service Account (Vertex AI)

For Vertex AI deployments:

1. Obtain OAuth token: `gcloud auth print-access-token`
2. Use in header: `Authorization: Bearer {token}`
3. Token refresh handled by `google.auth.transport.requests.Request()`

### Security Best Practices

- **Never expose API keys client-side**
- Use ephemeral tokens for client connections
- Implement server-to-server architecture when possible
- Rotate API keys regularly
- Use service accounts with minimal permissions for Vertex AI

---

## 8. Supported Models

**Gemini API (Google AI):**
- `gemini-2.0-flash-exp` (Experimental)
- `gemini-2.0-flash-live-preview-04-09`
- `gemini-2.5-flash-native-audio-preview-09-2025`

**Vertex AI:**
- `gemini-2.0-flash-live-preview`
- `gemini-2.5-flash` (with Live API support)

---

## 9. Advanced Features

### Voice Activity Detection (VAD)

**Automatic (Default):**
```json
{
  "realtimeInputConfig": {
    "automaticActivityDetection": {
      "startOfSpeechSensitivity": "HIGH",  // or "LOW"
      "endOfSpeechSensitivity": "LOW",     // or "HIGH"
      "prefixPaddingMs": 300,
      "silenceDurationMs": 500
    }
  }
}
```

**Manual:**
- Disable automatic detection
- Send `activityStart` and `activityEnd` signals manually

### Interruption Handling (Barge-in)

**Configuration:**
```json
{
  "realtimeInputConfig": {
    "activityHandling": "START_OF_ACTIVITY_INTERRUPTS"  // Default
    // or "NO_INTERRUPTION"
  }
}
```

When interrupted, server sends:
```json
{
  "serverContent": {
    "interrupted": true,
    "turnComplete": true
  }
}
```

### Session Resumption

**Configuration:**
```json
{
  "setup": {
    "sessionResumption": {
      "enabled": true
    }
  }
}
```

**Server provides handle:**
```json
{
  "sessionResumptionUpdate": {
    "handle": "session_handle_xyz"
  }
}
```

**Resume session:**
```json
{
  "setup": {
    "sessionResumption": {
      "resumeFrom": {
        "handle": "session_handle_xyz"
      }
    }
  }
}
```

Resumption tokens valid for 2 hours.

### Context Window Compression

**Sliding Window:**
```json
{
  "setup": {
    "contextWindowCompression": {
      "slidingWindow": {
        "windowSize": 1000
      }
    }
  }
}
```

**Token-based:**
```json
{
  "setup": {
    "contextWindowCompression": {
      "tokenBased": {
        "maxTokens": 5000
      }
    }
  }
}
```

### Proactivity

Model can reject irrelevant input:
```json
{
  "setup": {
    "proactivity": true
  }
}
```

---

## 10. Implementation Checklist

### Basic Text-Only Implementation

- [ ] Establish WebSocket connection with API key
- [ ] Send setup message with model configuration
- [ ] Wait for setupComplete
- [ ] Send text via clientContent
- [ ] Receive and parse serverContent
- [ ] Handle turnComplete signals
- [ ] Implement error handling
- [ ] Close connection gracefully

### Audio Implementation

- [ ] All basic text steps above
- [ ] Implement PCM audio capture (16kHz, 16-bit, mono)
- [ ] Base64 encode audio chunks
- [ ] Send via realtimeInput with mediaChunks
- [ ] Receive and decode base64 audio (24kHz)
- [ ] Implement audio playback
- [ ] Handle audio buffering
- [ ] Manage voice activity detection

### Function Calling Implementation

- [ ] All basic text steps above
- [ ] Define function declarations in setup
- [ ] Listen for toolCall messages
- [ ] Execute functions locally
- [ ] Send toolResponse with results
- [ ] Handle multiple concurrent calls
- [ ] Implement NON_BLOCKING behavior if needed

### Production Checklist

- [ ] Implement ephemeral token generation (client-to-server)
- [ ] Or use server-to-server architecture
- [ ] Add reconnection logic
- [ ] Implement rate limit handling
- [ ] Add session resumption support
- [ ] Monitor session duration (10-15 min limit)
- [ ] Implement proper error logging
- [ ] Add metrics and monitoring
- [ ] Test interruption handling
- [ ] Optimize latency (chunk sizes)
- [ ] Load test concurrent sessions

---

## 11. Key Takeaways

### Strengths

1. **Low Latency:** Optimized for real-time interactions
2. **Multimodal:** Text, audio, and video input/output
3. **Natural Conversations:** Voice activity detection, interruptions
4. **Function Calling:** Integrate with external tools/APIs
5. **Official SDKs:** Python and Node.js fully supported
6. **Server-Side Ready:** Designed for backend implementations
7. **Session Management:** Resume long conversations
8. **Transcription:** Built-in speech-to-text

### Limitations

1. **Session Duration:** 10-15 minute maximum
2. **No Ruby SDK:** Manual WebSocket implementation needed
3. **Rate Limits:** 3 concurrent sessions on free tier
4. **Audio Format:** Strict PCM requirements
5. **Video Constraints:** 1 FPS maximum
6. **Token Counting:** Not available during session
7. **Context Limits:** May terminate early with large input

### Best Use Cases

- Voice assistants and chatbots
- Real-time translation services
- Interactive tutoring systems
- Customer support with function calling
- Multimodal search and Q&A
- Live video analysis with audio response

### When NOT to Use

- Simple one-off text generation (use generateContent instead)
- Long-running sessions > 15 minutes
- High-throughput batch processing
- When token counting is critical
- Mobile apps with unstable connections (consider retry logic)

---

## 12. Next Steps for Implementation

### For Python Development

1. Install SDK: `pip install google-genai`
2. Follow quickstart: https://ai.google.dev/gemini-api/docs/live
3. Study examples: https://github.com/GoogleCloudPlatform/generative-ai/tree/main/gemini/multimodal-live-api
4. Review SDK source: https://github.com/googleapis/python-genai/blob/main/google/genai/live.py

### For Node.js Development

1. Install SDK: `npm install @google/genai`
2. Review web console: https://github.com/google-gemini/live-api-web-console
3. Study implementation patterns

### For Ruby Development

1. Choose WebSocket library (e.g., `faye-websocket`)
2. Implement connection with query param auth
3. Follow JSON message formats documented above
4. Handle base64 audio encoding/decoding
5. Test with simple text messages first
6. Add audio streaming capability
7. Implement function calling if needed

### Testing Approach

1. Start with text-only messages
2. Add audio input (16kHz PCM)
3. Test audio output (24kHz PCM)
4. Implement function calling
5. Test interruptions/barge-in
6. Add session resumption
7. Load test concurrent sessions
8. Measure latency and optimize

---

## 13. Additional Resources

### Official Documentation
- Main API docs: https://ai.google.dev/gemini-api/docs
- Python SDK docs: https://googleapis.github.io/python-genai/
- Rate limits: https://ai.google.dev/gemini-api/docs/rate-limits

### Community Resources
- Google AI Forum: https://discuss.ai.google.dev/
- GitHub Issues: https://github.com/google-gemini/cookbook/issues
- Codelabs: https://codelabs.developers.google.com/

### Tools & Integrations
- Daily: WebRTC integration
- LiveKit: Real-time video platform
- Pipecat: Voice pipeline framework
- Firebase AI Logic: Mobile integration

---

## Conclusion

The Gemini Live API is a production-ready WebSocket protocol that enables real-time multimodal AI interactions. Server-side implementations are **fully supported and recommended**, with official SDKs for Python and Node.js. Ruby implementations are **feasible** using standard WebSocket libraries and the JSON message formats documented above.

The protocol is well-documented, with clear message structures for authentication, audio streaming, transcription, function calling, and turn completion. Key challenges include audio format requirements, session duration limits, and rate limiting, but these are well-understood and manageable.

For most server-side use cases, the server-to-server architecture is recommended, keeping API keys secure while providing full control over the WebSocket connection and message flow.
