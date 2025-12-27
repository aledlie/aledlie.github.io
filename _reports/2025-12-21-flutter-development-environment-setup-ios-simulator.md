---
layout: single
title: "Flutter Development Environment Setup: Full Platform Support and iOS Simulator Launch"
date: 2025-12-21
author_profile: true
breadcrumbs: true
categories: [flutter, development-environment, ios-development]
tags: [flutter, xcode, ios-simulator, android-studio, cocoapods, ruby, sentry, widget-fixes]
excerpt: "Complete Flutter development environment setup for iOS, Android, and web platforms, including Xcode 26.2 configuration, CocoaPods installation, Sentry compatibility fixes, and AnimatedOrb widget corrections."
header:
  overlay_image: /images/cover-reports.png
  teaser: /images/cover-reports.png
---

# Flutter Development Environment Setup: Full Platform Support and iOS Simulator Launch

**Session Date**: 2025-12-21
**Project**: IntegrityStudio.ai2 - Enterprise AI Observability Platform Landing Page
**Focus**: Configure complete Flutter development environment and launch app on iOS simulator
**Session Type**: Environment Setup | Bug Fixes

## Executive Summary

Successfully configured a complete Flutter development environment supporting **iOS, Android, and web platforms** on macOS Tahoe 26.1. Resolved multiple environment issues including Xcode Command Line Tools installation, CocoaPods Ruby version conflicts, and Sentry SDK compatibility with Xcode 26. Fixed Flutter widget errors in the `AnimatedOrb` component and successfully launched the IntegrityStudio.ai2 landing page on the iPhone 17 Pro simulator.

The session involved troubleshooting several interconnected issues: the new Xcode 26.2 introduced breaking changes for the Sentry iOS SDK's C++ allocator code, CocoaPods required installation to a custom Ruby gem directory due to environment configuration, and the `AnimatedOrb` widget had incorrect `Positioned` widget nesting that caused runtime exceptions.

**Key Metrics:**
| Metric | Value |
|--------|-------|
| **Platforms Configured** | 3 (iOS, Android, Web) |
| **Flutter Version** | 3.38.5 (stable) |
| **Xcode Version** | 26.2 |
| **Android SDK Version** | 36.1.0 |
| **Widget Errors Fixed** | 2 |
| **Code Fixes Applied** | 5 |
| **Final Status** | ✅ App running on iOS simulator |

## Problem Statement

The Flutter development environment was incomplete with multiple issues preventing iOS development:

1. **Xcode Command Line Tools** - Not installed, `xcode-select -p` returning error
2. **Full Xcode** - Not installed, required for iOS/macOS development
3. **Android Studio** - Not installed, required for Android development
4. **CocoaPods** - Not working due to Ruby version mismatch
5. **iOS Simulator Runtimes** - Not downloaded
6. **Sentry SDK** - Incompatible with Xcode 26.2 C++ toolchain
7. **AnimatedOrb Widget** - `Positioned` widget incorrectly nested inside `RepaintBoundary`

## Implementation Details

### Phase 1: Xcode Command Line Tools Installation

The standard `xcode-select --install` command only triggers a GUI dialog. Used `softwareupdate` for direct installation:

```bash
softwareupdate --install "Command Line Tools for Xcode 26.2-26.2"
```

**Result**: Command Line Tools installed to `/Library/Developer/CommandLineTools`

### Phase 2: Full Development Environment Setup

#### Xcode Installation
- Installed Xcode 26.2 from App Store
- Configured developer directory:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
sudo xcodebuild -license accept
```

#### Android Studio Installation
```bash
brew install --cask android-studio
```
- Completed setup wizard
- Installed Android SDK 36.1.0
- Accepted licenses via `flutter doctor --android-licenses`

#### CocoaPods Installation

**Challenge**: Ruby version conflict between system Ruby (2.6.10) and Homebrew Ruby (3.4.7)

**Initial Attempt** (Failed):
```bash
brew install cocoapods  # Linked to Homebrew Ruby
sudo gem install cocoapods  # System Ruby too old (requires 3.1+)
```

**Solution**: Install to custom gem directory using Homebrew Ruby:
```bash
/opt/homebrew/opt/ruby/bin/gem install cocoapods --install-dir /Users/alyshialedlie/code-env/ruby/gems
```

**Result**: CocoaPods 1.16.2 installed and working

### Phase 3: Flutter Project Platform Files

The project was missing iOS/Android platform directories:

```bash
flutter create . --platforms=ios,android,web
```

**Files Created**: 76 files including iOS Runner project, Android Gradle configuration, and web assets

### Phase 4: Sentry SDK Compatibility Fix

**Problem**: Sentry iOS SDK C++ code incompatible with Xcode 26.2 allocator requirements

**Error**:
```
Static assertion failed: std::allocator does not support const types
```

**File**: `lib/main.dart`

**Solution**: Temporarily disabled Sentry integration:

```dart
// Before
import 'package:sentry_flutter/sentry_flutter.dart';

await SentryFlutter.init(
  (options) { ... },
  appRunner: () => runApp(const IntegrityStudioApp()),
);

// After
// import 'package:sentry_flutter/sentry_flutter.dart';  // Temporarily disabled
runApp(const IntegrityStudioApp());
```

**pubspec.yaml**:
```yaml
# sentry_flutter: ^9.9.1  # Temporarily disabled - Xcode 26 compatibility issue
```

### Phase 5: Dart Code Fixes

#### Fix 1: Export Directive Placement
**File**: `lib/theme/theme.dart`

Export statements must appear before declarations:

```dart
// Before (at end of file - INVALID)
class AppTheme { ... }
export 'colors.dart';

// After (at start of file - VALID)
export 'colors.dart';
export 'typography.dart';
export 'spacing.dart';

import 'package:flutter/material.dart';
class AppTheme { ... }
```

#### Fix 2: CardTheme to CardThemeData
**File**: `lib/theme/theme.dart:124`

```dart
// Before
cardTheme: CardTheme(

// After
cardTheme: CardThemeData(
```

#### Fix 3: Missing Color Constant
**File**: `lib/pages/landing_page.dart:84`

```dart
// Before
backgroundColor: AppColors.gray950,  // Does not exist

// After
backgroundColor: AppColors.gray900,
```

### Phase 6: AnimatedOrb Widget Fix

**Problem**: `Positioned` widget inside `RepaintBoundary` causes `ParentDataWidget` error

**Error**:
```
The ParentDataWidget Positioned wants to apply ParentData of type StackParentData
to a RenderObject which accepts ParentData of incompatible type ParentData.
```

**File**: `lib/widgets/decorative/animated_orb.dart`

**Root Cause**: `Positioned` must be a direct child of `Stack`, but was wrapped in `RepaintBoundary`

**Solution 1**: Remove `Positioned` from `AnimatedOrb.build()`:

```dart
// Before
return RepaintBoundary(
  child: AnimatedBuilder(
    builder: (context, child) {
      return Positioned(  // ERROR: Inside RepaintBoundary
        left: ...,
        child: Transform.scale(...),
      );
    },
  ),
);

// After
return RepaintBoundary(
  child: AnimatedBuilder(
    builder: (context, child) {
      return Transform.scale(  // No Positioned here
        scale: _scaleAnimation.value,
        child: Container(...),
      );
    },
  ),
);
```

**Solution 2**: Wrap `DecorativeOrbs` Stack with `Positioned.fill`:

```dart
// Before
return Stack(
  children: [
    Positioned(
      child: AnimatedOrb(...),
    ),
  ],
);

// After
return Positioned.fill(
  child: Stack(
    clipBehavior: Clip.none,
    children: [
      Positioned(
        left: -80,
        top: -80,
        child: AnimatedOrb(...),
      ),
    ],
  ),
);
```

**Key Changes**:
- `Positioned.fill` provides bounded constraints to inner Stack
- `clipBehavior: Clip.none` allows orbs to overflow edges decoratively
- Positioning moved from inside `AnimatedOrb` to parent `DecorativeOrbs`

## Testing and Verification

### Flutter Doctor Results

```bash
$ flutter doctor
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel stable, 3.38.5, on macOS 26.1 25B78 darwin-arm64, locale en-US)
[✓] Android toolchain - develop for Android devices (Android SDK version 36.1.0)
[✓] Xcode - develop for iOS and macOS (Xcode 26.2)
[✓] Chrome - develop for the web
[✓] Connected device (2 available)
[✓] Network resources

• No issues found!
```

### iOS Simulator Launch

```bash
$ xcrun simctl boot "iPhone 17 Pro"
$ flutter run -d "iPhone 17 Pro"

Launching lib/main.dart on iPhone 17 Pro in debug mode...
Running Xcode build...
Xcode build done.                                           16.4s
Syncing files to device iPhone 17 Pro...                       503ms

Flutter run key commands.
r Hot reload.
R Hot restart.
```

**Result**: ✅ App running without widget errors

## Files Modified

### Modified Files

| File | Changes |
|------|---------|
| `pubspec.yaml` | Disabled sentry_flutter dependency |
| `lib/main.dart` | Commented out Sentry initialization |
| `lib/theme/theme.dart` | Moved exports to top, CardTheme→CardThemeData |
| `lib/pages/landing_page.dart` | gray950→gray900 |
| `lib/widgets/decorative/animated_orb.dart` | Fixed Positioned nesting, added Positioned.fill |

### Created Files (via flutter create)

- `ios/` - Complete iOS Runner project (38 files)
- `android/` - Complete Android Gradle project (15 files)
- `web/` - Web assets and icons (5 files)

## Key Decisions and Trade-offs

### Decision 1: Temporarily Disable Sentry
**Choice**: Comment out Sentry integration
**Rationale**: Xcode 26.2 C++ toolchain incompatible with current Sentry iOS SDK
**Alternative Considered**: Downgrade Xcode (rejected - needed latest iOS simulator)
**Trade-off**: No error tracking in development; must re-enable when Sentry releases fix

### Decision 2: CocoaPods Custom Gem Directory
**Choice**: Install to `/Users/alyshialedlie/code-env/ruby/gems`
**Rationale**: Matches existing GEM_HOME environment variable
**Alternative Considered**: System gem install (rejected - requires sudo, Ruby too old)
**Trade-off**: Non-standard location, but consistent with project environment

### Decision 3: AnimatedOrb Restructure
**Choice**: Move positioning to parent widget, use Positioned.fill
**Rationale**: Positioned must be direct Stack child; RepaintBoundary breaks this
**Alternative Considered**: Remove RepaintBoundary (rejected - needed for animation isolation)
**Trade-off**: Slightly more verbose code in DecorativeOrbs

## Environment Summary

| Component | Version | Status |
|-----------|---------|--------|
| macOS | Tahoe 26.1 | ✅ |
| Flutter | 3.38.5 (stable) | ✅ |
| Dart | 3.10.4 | ✅ |
| Xcode | 26.2 | ✅ |
| Command Line Tools | 2416 | ✅ |
| Android Studio | 2025.2.2.7 | ✅ |
| Android SDK | 36.1.0 | ✅ |
| CocoaPods | 1.16.2 | ✅ |
| Ruby (Homebrew) | 3.4.7 | ✅ |
| iOS Simulator | iPhone 17 Pro (iOS 26.2) | ✅ |

## Next Steps

### Immediate
1. ✅ App running on iOS simulator - COMPLETE

### Short-term
2. **Re-enable Sentry** when SDK releases Xcode 26 fix (monitor GitHub issues)
3. **Test on Android emulator** to verify Android build
4. **Test web build** with `flutter run -d chrome`

### Medium-term
5. Configure CI/CD for multi-platform builds
6. Add iOS app icons and launch screen assets
7. Configure Android signing for release builds

## References

### Code Files
- `lib/main.dart:1-23` - Entry point with Sentry disabled
- `lib/theme/theme.dart:1-190` - Theme configuration fixes
- `lib/widgets/decorative/animated_orb.dart:79-231` - AnimatedOrb and DecorativeOrbs fixes

### Documentation
- [Flutter Doctor Documentation](https://docs.flutter.dev/get-started/install)
- [Xcode Command Line Tools](https://developer.apple.com/xcode/resources/)
- [CocoaPods Installation Guide](https://guides.cocoapods.org/using/getting-started.html)

### Related Issues
- Sentry iOS SDK Xcode 26 Compatibility - Pending upstream fix
