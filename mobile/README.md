# Today - Mobile Apps (Turbo Native)

This directory contains the iOS and Android mobile applications for the "Today" Rails app, built using **Turbo Native**. These apps provide a native shell around your existing Rails views with enhanced native features like better audio recording.

## What is Turbo Native?

Turbo Native is Hotwire's solution for building hybrid mobile apps. It allows you to:
- Wrap your existing Rails/Turbo views in native iOS and Android apps
- Reuse 95%+ of your web codebase
- Add native features where needed (like microphone access)
- Ship updates instantly through your Rails app (no app store approval needed for content changes)

## Project Structure

```
mobile/
├── README.md                    # This file
├── APP_ICONS_GUIDE.md          # Guide for adding app icons and splash screens
├── ios/                         # iOS app (Swift + Turbo Native)
│   ├── README.md               # iOS-specific setup and build instructions
│   ├── Podfile                 # CocoaPods dependencies
│   └── Today/                  # Xcode project
│       ├── Today.xcodeproj/    # Xcode project file
│       └── Today/              # Source code
│           ├── AppDelegate.swift
│           ├── SceneDelegate.swift
│           ├── ViewController.swift         # Includes audio recording bridge
│           ├── Info.plist
│           ├── LaunchScreen.storyboard
│           └── path-configuration.json
└── android/                     # Android app (Kotlin + Turbo Native)
    ├── README.md               # Android-specific setup and build instructions
    ├── build.gradle            # Root build configuration
    ├── settings.gradle         # Project settings
    └── app/
        ├── build.gradle        # App module configuration
        └── src/main/
            ├── AndroidManifest.xml
            ├── java/com/today/
            │   ├── MainActivity.kt
            │   ├── TurboActivity.kt         # Includes audio recording bridge
            │   ├── MainNavHostFragment.kt
            │   └── TurboWebFragment.kt
            ├── res/              # Resources (layouts, icons, themes)
            └── assets/json/
                └── path-configuration.json
```

## Quick Start

### Prerequisites

**For iOS:**
- macOS with Xcode 14.0+
- CocoaPods
- Ruby 2.7+

**For Android:**
- Android Studio Hedgehog (2023.1.1)+
- JDK 17+
- Android SDK API 26+

### Setup iOS App

```bash
cd mobile/ios
pod install
open Today.xcworkspace  # Open in Xcode
```

See [ios/README.md](ios/README.md) for detailed instructions.

### Setup Android App

```bash
cd mobile/android
# Open in Android Studio: File > Open > select mobile/android
```

See [android/README.md](android/README.md) for detailed instructions.

## Key Features

### 1. Native Audio Recording

Both iOS and Android apps include native audio recording bridges that provide:
- Better audio quality than Web Audio API
- Native permission handling
- M4A format (AAC codec) at 44.1kHz
- Seamless integration with your existing voice command feature

**How it works:**
1. Your Rails app's `audio_recorder_controller.js` detects Turbo Native
2. When recording starts, it calls the native bridge instead of Web Audio API
3. Native code handles microphone permission and recording
4. Audio is returned as base64 and submitted to your Rails endpoint
5. Your existing `AgentsController` processes the voice command

**No changes needed to your Rails backend!**

### 2. Turbo Streams & Hotwire

Your app already uses Turbo Streams extensively. In Turbo Native:
- All Turbo Streams continue to work exactly the same
- Navigation uses native transitions
- Forms submit via Turbo
- No full page reloads

### 3. Offline Support (Optional)

Your PWA already has a service worker foundation. You can enhance offline support by:
- Caching Rails pages in the native apps
- Storing todos locally with Core Data (iOS) or Room (Android)
- Syncing when back online

This is optional and not yet implemented.

## Configuration

### Server URLs

**iOS:** Edit `mobile/ios/Today/Today/SceneDelegate.swift`
```swift
private let baseURL = URL(string: "http://localhost:3000")!
```

**Android:** Edit `mobile/android/app/src/main/java/com/today/MainActivity.kt`
```kotlin
const val BASE_URL = "http://10.0.2.2:3000"
```

### For Development

- **iOS Simulator**: Use `http://localhost:3000`
- **Android Emulator**: Use `http://10.0.2.2:3000` (special address for host)
- **Physical Devices**: Use your computer's IP address (e.g., `http://192.168.1.100:3000`)

### For Production

Update the URLs to your production Rails server:
```
https://your-production-domain.com
```

## Testing the Apps

### 1. Start Your Rails Server

```bash
cd /workspace
rails server
```

### 2. Run iOS App

```bash
cd mobile/ios
open Today.xcworkspace
# In Xcode: Select simulator and click Run (⌘+R)
```

### 3. Run Android App

```bash
cd mobile/android
# In Android Studio: Select emulator/device and click Run (▶️)
```

### 4. Test Voice Commands

1. Click the microphone button (floating action button in bottom-right)
2. Grant microphone permission when prompted
3. Speak a voice command (e.g., "Add buy groceries to today")
4. Button should turn red while recording
5. Recording automatically stops and submits
6. Todo should appear in the list

## Path Configuration

Both apps use `path-configuration.json` to determine how URLs are handled:

- **Default context**: Regular navigation (push to stack)
- **Modal context**: Modal presentation (e.g., `/new`, `/edit`)

You can customize URL routing patterns in:
- `mobile/ios/Today/Today/path-configuration.json`
- `mobile/android/app/src/main/assets/json/path-configuration.json`

Example:
```json
{
  "rules": [
    {
      "patterns": ["/new$", "/edit$"],
      "properties": {
        "context": "modal"
      }
    }
  ]
}
```

## Adding App Icons

See [APP_ICONS_GUIDE.md](APP_ICONS_GUIDE.md) for comprehensive instructions on adding icons and splash screens.

**Quick steps:**
1. Use your existing PWA icon as a starting point (`/public/icon-512.png`)
2. Generate all sizes at [appicon.co](https://appicon.co/)
3. Add to iOS via Xcode's Assets.xcassets
4. Add to Android via Android Studio's Image Asset tool

## Deployment

### iOS App Store

1. **Prepare for submission:**
   - Update bundle identifier in Xcode
   - Configure signing certificates
   - Update version number
   - Test on physical devices
   - Create screenshots

2. **Build and upload:**
   ```bash
   # In Xcode:
   # Product > Archive
   # Window > Organizer > Distribute App
   ```

3. **App Store Connect:**
   - Create app listing
   - Upload screenshots
   - Set pricing and availability
   - Submit for review

**Timeline:** Usually 1-3 days for review

### Google Play Store

1. **Prepare for submission:**
   - Update package name and version
   - Generate signed APK/Bundle
   - Create screenshots
   - Write store listing

2. **Build release:**
   ```bash
   cd mobile/android
   ./gradlew bundleRelease
   ```

3. **Google Play Console:**
   - Create app listing
   - Upload app bundle
   - Configure pricing and distribution
   - Submit for review

**Timeline:** Usually 1-7 days for review

## Updating Your Apps

### Content Updates (Instant)

Changes to your Rails app (views, CSS, JavaScript, controllers) are delivered instantly:
1. Deploy your Rails changes to production
2. Users get the update next time they open the app
3. No app store submission needed!

### Native Code Updates (App Store Review Required)

Changes to Swift/Kotlin code require app store submission:
- Audio bridge modifications
- New native features
- iOS/Android SDK updates
- Permission changes

## Architecture Decisions

### Why Turbo Native?

Given your requirements:
- ✅ Fast time-to-market (reuse existing code)
- ✅ Rails expertise (minimal mobile learning curve)
- ✅ Limited native features (only microphone needed)
- ✅ Lower budget (no separate mobile team needed)
- ✅ Existing Hotwire setup (already using Turbo Streams)

Turbo Native was the perfect fit!

### Alternative Approaches (Not Used)

1. **React Native**: Would require rewriting UI in React, managing state separately
2. **Flutter**: Would require learning Dart, rebuilding all views
3. **Native iOS/Android**: 2x the code to maintain, requires specialized developers
4. **Progressive Web App**: Limited to Safari on iOS (no native feel, limited features)

## Troubleshooting

### Common Issues

**App doesn't connect to Rails:**
- Check the BASE_URL in the app
- Ensure Rails server is running
- For devices, use IP address not localhost
- Check firewall settings

**Audio recording fails:**
- Verify microphone permission in device settings
- Check Xcode/Android Studio console for errors
- Test on physical device (simulators may have issues)

**Turbo Streams not working:**
- Verify `turbo-rails` gem is installed and up-to-date
- Check that controllers return `format.turbo_stream` responses
- Look for JavaScript errors in web inspector

**Build errors:**
- iOS: Run `pod deintegrate && pod install`
- Android: File > Invalidate Caches / Restart
- Check dependency versions in Podfile/build.gradle

### Getting Help

1. Check platform-specific READMEs:
   - [ios/README.md](ios/README.md)
   - [android/README.md](android/README.md)

2. Review Turbo Native documentation:
   - [Turbo Native iOS](https://github.com/hotwired/turbo-ios)
   - [Turbo Native Android](https://github.com/hotwired/turbo-android)

3. Search discussions:
   - [Hotwire Discuss](https://discuss.hotwired.dev/)
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/hotwire)

## Development Tips

### Live Reload (iOS)

Your Rails app already has Turbo refresh. For native code changes:
1. Make Swift changes
2. ⌘+R in Xcode (quick rebuild)

### Live Reload (Android)

For Kotlin changes:
1. Make changes
2. Click "Apply Changes" (⚡) in Android Studio

### Debugging

**iOS:**
- Xcode Console: Shows native logs
- Safari Web Inspector: Debug JavaScript in the webview
  - Safari > Develop > Simulator > your-page

**Android:**
- Android Studio Logcat: Shows native logs
- Chrome DevTools: Debug JavaScript in the webview
  - chrome://inspect > your-device

### Testing Voice Commands Locally

```bash
# Start Rails server
rails server

# In another terminal, test the endpoint directly
curl -X POST http://localhost:3000/agents \
  -F "audio=@test-recording.m4a" \
  -H "Cookie: your-session-cookie"
```

## Roadmap

### Phase 1: MVP (Current)
- ✅ Basic Turbo Native shells (iOS + Android)
- ✅ Native audio recording bridge
- ✅ Microphone permissions
- ✅ All existing features working

### Phase 2: Polish (Optional)
- ⬜ Custom app icons and splash screens
- ⬜ Push notifications
- ⬜ Biometric authentication (Face ID, fingerprint)
- ⬜ Offline todo caching
- ⬜ App store optimization

### Phase 3: Advanced (Future)
- ⬜ Native share extension
- ⬜ Siri shortcuts integration
- ⬜ Home screen widgets
- ⬜ Watch app

## Cost & Maintenance

### Development Cost
- **Initial setup**: ~2-3 weeks (already done!)
- **Testing & polish**: ~1-2 weeks
- **App store submission**: ~1 week
- **Total**: 4-6 weeks

### Ongoing Maintenance
- **Native code**: Minimal (only audio bridge to maintain)
- **Rails changes**: Deploy as normal (instant updates!)
- **OS updates**: Annual Xcode/Android Studio updates
- **App store**: Re-submit when changing native code

### Team Requirements
- **Rails developers**: Can maintain 95% of the app
- **iOS developer**: Needed occasionally for native features
- **Android developer**: Needed occasionally for native features
- **OR**: One full-stack dev with Turbo Native experience

## Resources

### Documentation
- [Turbo Handbook](https://turbo.hotwired.dev/handbook/introduction)
- [Turbo Native iOS Guide](https://github.com/hotwired/turbo-ios/blob/main/Docs/Overview.md)
- [Turbo Native Android Guide](https://github.com/hotwired/turbo-android/blob/main/docs/OVERVIEW.md)
- [Hotwire Discussion Forum](https://discuss.hotwired.dev/)

### Sample Apps
- [Turbo iOS Demo](https://github.com/hotwired/turbo-ios/tree/main/Demo)
- [Turbo Android Demo](https://github.com/hotwired/turbo-android/tree/main/demo)
- [Basecamp Mobile](https://github.com/basecamp/bc3-ios) - Production Turbo Native app

### Tools
- [App Icon Generator](https://appicon.co/)
- [ngrok](https://ngrok.com/) - Tunnel for testing on devices
- [TestFlight](https://developer.apple.com/testflight/) - iOS beta testing
- [Google Play Internal Testing](https://support.google.com/googleplay/android-developer/answer/9845334) - Android beta testing

---

**Questions?** Open an issue or reach out to the team!

**Happy shipping! 📱🚀**
