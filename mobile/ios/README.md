# Today iOS App - Turbo Native

This is the iOS Turbo Native wrapper for the Today Rails app.

## Prerequisites

- Xcode 14.0 or later
- macOS 12.0 or later

## Setup Instructions

### 1. Open in Xcode

```bash
cd mobile/ios
open Today/Today.xcodeproj
```

### 2. Add Turbo Package (Swift Package Manager)

In Xcode:

1. **Select your project** in the Project Navigator (the "Today" icon at the top)

2. **Select the "Today" target** (under TARGETS in the main area)

3. **Go to the "General" tab**

4. **Scroll down to "Frameworks, Libraries, and Embedded Content"**

5. **Click the "+" button**

6. **Click "Add Package Dependency..."**

7. **In the search field, enter:**
   ```
   https://github.com/hotwired/turbo-ios
   ```

8. **Click "Add Package"**

9. **On the next screen, select "Turbo" library**

10. **Click "Add Package"**

Xcode will download and integrate the Turbo package. This may take a minute.

### 3. Configure Your Rails Server URL

Edit `Today/SceneDelegate.swift` and update the `baseURL`:

```swift
// For local development
private let baseURL = URL(string: "http://localhost:3000")!

// For production
// private let baseURL = URL(string: "https://your-app.com")!
```

### 4. Configure Bundle Identifier

1. In Xcode, select the `Today` project in the navigator
2. Select the `Today` target
3. Go to "Signing & Capabilities"
4. Update the Bundle Identifier to your own (e.g., `com.yourcompany.today`)
5. Select your development team

### 5. Run the App

1. Make sure your Rails server is running on `http://localhost:3000`
2. Select a simulator or connected device in Xcode
3. Click the "Run" button (⌘+R)

## Features

### Audio Recording Bridge

The iOS app includes a native audio recording bridge that allows the web app to record audio with better quality and control than the Web Audio API.

**How it works:**
1. JavaScript calls `webkit.messageHandlers.startRecording.postMessage({})`
2. iOS requests microphone permission and starts recording
3. JavaScript listens for `turboNative:recordingStarted` event
4. JavaScript calls `webkit.messageHandlers.stopRecording.postMessage({})`
5. iOS stops recording and returns base64-encoded audio data via `turboNative:recordingStopped` event

The audio is recorded in M4A format (AAC codec) at 44.1kHz, which provides excellent quality for voice commands.

### Microphone Permission

The app requests microphone permission automatically when recording starts. The permission message is configured in `Info.plist`:

> "We need access to your microphone to record voice commands for creating and managing your todos."

## Testing on Physical Device

### Option 1: USB Connection (Recommended for Development)

1. Connect your iPhone via USB
2. Trust the computer on your device
3. Make sure your Rails server is accessible from your device
   - Use your computer's IP address instead of `localhost`
   - Update the `baseURL` in `SceneDelegate.swift` to use your IP (e.g., `http://192.168.1.100:3000`)

### Option 2: Using ngrok (For Remote Testing)

```bash
# Start ngrok tunnel
ngrok http 3000

# Update SceneDelegate.swift with the ngrok URL
# private let baseURL = URL(string: "https://your-ngrok-url.ngrok.io")!
```

## Troubleshooting

### Swift Package Not Found
- File > Packages > Reset Package Caches
- File > Packages > Update to Latest Package Versions

### Build Fails with "Turbo Module Not Found"
- File > Packages > Resolve Package Versions
- Clean build folder (Product > Clean Build Folder or ⇧⌘K)

### Audio Recording Not Working
- Check that microphone permission is granted in Settings > Privacy > Microphone
- Verify that the audio recording bridge is properly initialized in `ViewController.swift`
- Check Xcode console for error messages

### App Doesn't Connect to Rails Server
- Verify Rails server is running
- Check the `baseURL` in `SceneDelegate.swift`
- For device testing, use your computer's IP address, not `localhost`
- Ensure your firewall allows connections on port 3000

## Building for TestFlight/App Store

1. Archive the app (Product > Archive in Xcode)
2. Upload to App Store Connect
3. Submit for TestFlight or App Store review

Make sure to:
- Update the Bundle Identifier and app version
- Configure proper signing certificates
- Update the base URL to your production server
- Test thoroughly on physical devices

## File Structure

```
mobile/ios/
└── Today/
    ├── Today.xcodeproj/             # Xcode project
    └── Today/                       # Source code
        ├── AppDelegate.swift        # App lifecycle
        ├── SceneDelegate.swift      # Window and navigation setup
        ├── ViewController.swift     # Turbo Native view controller with audio bridge
        ├── Info.plist              # App configuration
        ├── LaunchScreen.storyboard # Launch screen
        └── path-configuration.json # Turbo path rules
```

## Advantages of Swift Package Manager

Swift Package Manager (SPM) is now being used instead of CocoaPods because:

- **Native to Xcode** - Built-in support, no external tools needed
- **Faster** - No need to run `pod install` after pulling changes
- **Simpler** - No workspace files or podfile to manage
- **Modern** - Apple's recommended approach for dependency management
- **Reliable** - Direct GitHub integration, no naming conflicts

No need to run any terminal commands - everything is managed within Xcode!
