# App Icons & Splash Screens Guide

This guide explains how to add app icons and splash screens to your Turbo Native iOS and Android apps.

## iOS App Icons

### Required Sizes

iOS requires multiple icon sizes for different devices and contexts:

- **1024x1024** - App Store
- **180x180** - iPhone (3x)
- **120x120** - iPhone (2x)
- **167x167** - iPad Pro
- **152x152** - iPad (2x)
- **76x76** - iPad (1x)
- **40x40, 58x58, 60x60, 80x80, 87x87, 120x120** - Spotlight, Settings, Notifications

### Adding Icons in Xcode

1. Open your project in Xcode: `mobile/ios/Today.xcworkspace`

2. In the Project Navigator, navigate to: `Today > Today > Assets.xcassets`

3. Click on "AppIcon" in the left sidebar

4. Drag and drop your icon images into the appropriate slots
   - Xcode shows the required size for each slot
   - Icons must be PNG format
   - No transparency allowed for app icons
   - No rounded corners (iOS adds them automatically)

### Using Existing Icons

Your Rails app already has PWA icons in `/public`:
- `icon.png` (192x192)
- `icon-512.png` (512x512)
- `icon-maskable.png` (512x512)

You can use these as a starting point and resize them for iOS requirements.

### Icon Generation Tools

**Online Tools:**
- [App Icon Generator](https://appicon.co/) - Upload one image, get all sizes
- [MakeAppIcon](https://makeappicon.com/) - Generates icons for all platforms
- [Favicon.io](https://favicon.io/) - Simple icon generator

**Command Line (ImageMagick):**
```bash
# Install ImageMagick
brew install imagemagick

# Generate all sizes from a source image
convert source-icon.png -resize 1024x1024 icon-1024.png
convert source-icon.png -resize 180x180 icon-180.png
convert source-icon.png -resize 120x120 icon-120.png
# ... and so on
```

## Android App Icons

### Required Sizes

Android requires icons in multiple densities:

- **mdpi (48x48)** - Medium density (~160dpi)
- **hdpi (72x72)** - High density (~240dpi)
- **xhdpi (96x96)** - Extra-high density (~320dpi)
- **xxhdpi (144x144)** - Extra-extra-high density (~480dpi)
- **xxxhdpi (192x192)** - Extra-extra-extra-high density (~640dpi)

### Adding Icons in Android Studio

1. Open your project in Android Studio: `mobile/android`

2. Right-click on `app` in the Project view

3. Select: **New > Image Asset**

4. In the Asset Studio wizard:
   - **Icon Type**: Launcher Icons (Adaptive and Legacy)
   - **Name**: `ic_launcher`
   - **Foreground Layer**: Select your icon image
   - **Background Layer**: Choose a solid color (#4d8bff to match your theme)
   - **Legacy Tab**: Check "Generate Legacy Icon"
   - Click "Next" then "Finish"

5. Android Studio will automatically generate all required sizes in:
   - `app/src/main/res/mipmap-mdpi/`
   - `app/src/main/res/mipmap-hdpi/`
   - `app/src/main/res/mipmap-xhdpi/`
   - `app/src/main/res/mipmap-xxhdpi/`
   - `app/src/main/res/mipmap-xxxhdpi/`

### Adaptive Icons (Android 8.0+)

Modern Android apps use adaptive icons with separate foreground and background layers:

- **Foreground**: Your logo/icon (transparent PNG)
- **Background**: Solid color or simple pattern

The system shapes the icon (circle, square, squircle) based on the device manufacturer's theme.

### Manual Icon Placement

If you prefer manual placement:

```bash
# Create mipmap directories
mkdir -p mobile/android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}

# Copy your icons (named ic_launcher.png) to each directory
cp icon-48.png mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher.png
cp icon-72.png mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher.png
cp icon-96.png mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
cp icon-144.png mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
cp icon-192.png mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
```

## Splash Screens

### iOS Launch Screen

iOS uses `LaunchScreen.storyboard` which is already created at:
`mobile/ios/Today/Today/LaunchScreen.storyboard`

The current launch screen shows the "Today" text in blue. To customize:

1. Open the project in Xcode
2. Select `LaunchScreen.storyboard` in the Project Navigator
3. Edit the text, colors, or add images using Interface Builder
4. Keep it simple - the launch screen should appear instantly

**Best practices:**
- Don't show splash screens or branding for too long
- Match the initial state of your app
- Keep it simple (iOS guidelines prefer app-like content)

### Android Splash Screen

Android 12+ has a built-in splash screen API. For older versions, create a custom splash:

1. Create a drawable for your splash background:

```xml
<!-- app/src/main/res/drawable/splash_background.xml -->
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@android:color/white"/>
    <item>
        <bitmap
            android:gravity="center"
            android:src="@mipmap/ic_launcher"/>
    </item>
</layer-list>
```

2. Create a splash theme:

```xml
<!-- app/src/main/res/values/themes.xml -->
<style name="Theme.Today.Splash" parent="Theme.MaterialComponents.DayNight.NoActionBar">
    <item name="android:windowBackground">@drawable/splash_background</item>
</style>
```

3. Update `AndroidManifest.xml`:

```xml
<activity
    android:name=".MainActivity"
    android:theme="@style/Theme.Today.Splash">
```

4. In `MainActivity.kt`, switch to normal theme:

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    setTheme(R.style.Theme_Today)
    super.onCreate(savedInstanceState)
    // ...
}
```

## Design Guidelines

### Icon Design Best Practices

**General:**
- Use simple, recognizable shapes
- Avoid text (especially on small sizes)
- Use high contrast
- Test on various backgrounds
- Consider colorblind users

**iOS:**
- Fill the entire icon space
- Use a consistent visual style with other iOS apps
- Avoid transparency and drop shadows
- Don't include the app name in the icon

**Android:**
- Use the full safe zone for adaptive icons
- Provide distinct foreground and background layers
- Consider the icon shape variations
- Test on different device themes (light/dark)

### Color Scheme

Your app currently uses:
- **Primary Blue**: #4d8bff
- **Primary Variant**: #3d7aef
- **White text**: #ffffff

Consider using these colors in your app icons and splash screens for brand consistency.

## Using Your PWA Icons

Since your Rails app already has PWA icons, you can:

1. **Extract existing icons** from `/public`:
   - `icon.png` (192x192) → Good starting point
   - `icon-512.png` (512x512) → Use this for generation
   - `icon-maskable.png` (512x512) → Android adaptive foreground

2. **Generate all sizes** using online tools:
   - Upload `icon-512.png` to [appicon.co](https://appicon.co/)
   - Download the generated package
   - Extract icons to iOS and Android projects

3. **Maintain consistency** between web and mobile apps by using the same icon design

## Quick Start: Generate All Icons

1. Start with your best quality logo (ideally 1024x1024 PNG)
2. Go to [appicon.co](https://appicon.co/)
3. Upload your logo
4. Select platforms: iOS and Android
5. Download the generated package
6. Extract and copy files:
   - iOS: Copy AppIcon.appiconset to `mobile/ios/Today/Today/Assets.xcassets/`
   - Android: Copy mipmap folders to `mobile/android/app/src/main/res/`

## Testing Your Icons

**iOS:**
- Run the app on simulator or device
- Check Home screen icon
- Test different device types (iPhone, iPad)
- Verify in Settings app

**Android:**
- Run the app on emulator or device
- Check launcher icon
- Test different Android versions
- Verify in Settings > Apps

## Resources

- [iOS Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Material Design - Product Icons](https://material.io/design/iconography/product-icons.html)
- [App Icon Generator](https://appicon.co/)
- [Make App Icon](https://makeappicon.com/)
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
