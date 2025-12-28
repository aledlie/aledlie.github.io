---
layout: single
title: "IntegrityStudio.ai: Manifest Icon Cache Fix and Mobile Test Stability"
date: 2025-12-28
author_profile: true
breadcrumbs: true
categories: [bug-fixes, testing, cloudflare]
tags: [flutter, cloudflare-pages, caching, responsive-design, manifest, pwa, testing]
excerpt: "Resolved manifest icon loading errors caused by stale CDN cache and fixed flaky mobile responsive test with text overflow prevention."
header:
  overlay_image: /images/cover-reports.png
  teaser: /images/cover-reports.png
---

# IntegrityStudio.ai: Manifest Icon Cache Fix and Mobile Test Stability

**Session Date**: 2025-12-28
**Project**: IntegrityStudio.ai2 - Flutter Web Application
**Focus**: Fix manifest icon loading errors and stabilize mobile responsive test
**Session Type**: Bug Fix

## Executive Summary

Resolved two issues affecting the IntegrityStudio.ai Flutter web application: manifest icon loading errors in the browser console and a flaky mobile responsive test. The manifest icon issue was caused by stale Cloudflare CDN cache serving HTML responses instead of PNG images after a `_redirects` configuration change. The mobile test failure was due to text overflow in the `GradientButton` widget on constrained layouts.

**Key Metrics:**

| Metric | Value |
|--------|-------|
| **Issues Fixed** | 2 |
| **Files Modified** | 3 |
| **Tests Passing** | 490+ / 490+ (100%) |
| **Deployment Status** | Verified Live |
| **Breaking Changes** | 0 |

## Problem Statement

### Issue 1: Manifest Icon Loading Errors

Browser console displayed errors indicating manifest icons could not be loaded:
```
Error while trying to use the following icon from the Manifest:
https://integritystudio.ai/icons/icon-192.png (Download error or resource isn't a valid image)
```

**Root Cause Analysis:**
- Icons were being served with `content-type: text/html` instead of `image/png`
- CDN had cached old responses from before `_redirects` SPA fallback fix
- Cache headers showed `age: 269102` (~3 days) with `cache-control: public, max-age=31536000, immutable`
- Preview deployment URL worked correctly, confirming the `_redirects` fix was correct but production cache was stale

### Issue 2: Flaky Mobile Responsive Test

Test `LandingPage responsive design renders correctly on mobile` was failing intermittently:
```
A RenderFlex overflowed by 5.2 pixels on the right
```

**Root Cause**: `GradientButton` Row widget text was overflowing on constrained 375px mobile width.

## Implementation Details

### Fix 1: Cache-Busting Query Parameters

**File**: `web/manifest.json`

Added version query parameters to force CDN to fetch fresh copies:

```json
"icons": [
  {
    "src": "icons/icon-192.png?v=2",
    "sizes": "192x192",
    "type": "image/png"
  },
  {
    "src": "icons/icon-512.png?v=2",
    "sizes": "512x512",
    "type": "image/png"
  },
  {
    "src": "icons/icon-maskable-192.png?v=2",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "maskable"
  },
  {
    "src": "icons/icon-maskable-512.png?v=2",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "maskable"
  }
]
```

**Design Decision:**
- **Choice**: Cache-busting query parameters over Cloudflare API cache purge
- **Rationale**: Available API tokens lacked `cache:purge` permissions
- **Trade-off**: Requires manual version bump for future icon changes, but simpler than managing API permissions

### Fix 2: Static Asset Redirects

**File**: `web/_redirects`

Added explicit static asset rules before SPA fallback:

```
# Static assets - let Cloudflare serve them directly (no redirect)
/icons/*  /icons/:splat  200
/images/*  /images/:splat  200
/assets/*  /assets/:splat  200
/screenshots/*  /screenshots/:splat  200

# Blog pages - serve actual HTML files
/blog/*  /blog/:splat  200

# Static files at root
/manifest.json  /manifest.json  200
/robots.txt  /robots.txt  200
/sitemap.xml  /sitemap.xml  200
/favicon.ico  /favicon.ico  200

# SPA fallback - serve index.html for app routes only
/*  /index.html  200
```

### Fix 3: GradientButton Text Overflow

**File**: `lib/widgets/common/buttons.dart:324-358`

Wrapped Text widget in `Flexible` with ellipsis overflow:

```dart
child: Row(
  mainAxisSize:
      widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
  mainAxisAlignment: MainAxisAlignment.center,
  children: [
    if (widget.isLoading)
      const SizedBox(
        width: 20,
        height: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor:
              AlwaysStoppedAnimation<Color>(Colors.white),
        ),
      )
    else
      Flexible(
        child: Text(
          widget.text,
          style: AppTypography.buttonText.copyWith(
            color: Colors.white,
          ),
          overflow: TextOverflow.ellipsis,
        ),
      ),
    if (widget.icon != null && !widget.isLoading) ...[
      const SizedBox(width: AppSpacing.sm),
      Icon(
        widget.icon,
        size: 20,
        color: Colors.white,
      ),
    ],
  ],
),
```

**Design Decision:**
- **Choice**: `Flexible` wrapper with `TextOverflow.ellipsis`
- **Rationale**: Prevents overflow on any screen size while maintaining visual hierarchy
- **Alternative Considered**: Reducing font size, rejected as it would affect readability

## Testing and Verification

### Test Results

```bash
$ /opt/homebrew/bin/flutter test
00:02 +490 ~3: All tests passed!
```

| Test Suite | Tests | Status |
|------------|-------|--------|
| Unit Tests | 490+ | PASS |
| Skipped | 3 | Expected |
| Failed | 0 | PASS |

### Live Site Verification

```bash
$ curl -sI "https://integritystudio.ai/icons/icon-192.png?v=2" | grep content-type
content-type: image/png

$ curl -sI "https://integritystudio.ai/icons/icon-512.png?v=2" | grep content-type
content-type: image/png
```

| Check | Before | After |
|-------|--------|-------|
| Icon content-type | `text/html` | `image/png` |
| Console errors | Manifest icon errors | None |
| Mobile test | Flaky (overflow) | Stable |
| cf-cache-status | HIT (stale) | MISS/HIT (fresh) |

## Files Modified

| File | Changes |
|------|---------|
| `web/manifest.json` | Added `?v=2` cache-busting to icon URLs |
| `web/_redirects` | Added static asset rules before SPA fallback |
| `lib/widgets/common/buttons.dart` | Wrapped Text in Flexible with ellipsis overflow |

## Git Commits

| Commit | Description |
|--------|-------------|
| `1b3f658` | fix(manifest): resolve icon loading errors with cache busting |
| `238c425` | fix(buttons): prevent text overflow in GradientButton on mobile |

## Key Decisions and Trade-offs

### Decision 1: Cache-Busting vs API Purge

**Choice**: Query parameter cache-busting (`?v=2`)
**Rationale**:
- Immediate fix without requiring additional API permissions
- Self-documenting version history in manifest
- Works with Cloudflare's immutable cache headers

**Alternative Considered**: Cloudflare API cache purge
**Rejected Because**: Available tokens (`CLOUDFLARE_DNS_TOKEN`) lacked `cache:purge` zone permissions

### Decision 2: Flexible vs Font Size Reduction

**Choice**: `Flexible` wrapper with `TextOverflow.ellipsis`
**Rationale**:
- Handles any button text length gracefully
- Maintains consistent typography across breakpoints
- Standard Flutter pattern for responsive text

**Trade-off**: Very long button text will be truncated, but this is preferable to layout overflow

## Lessons Learned

1. **CDN Cache Persistence**: Cloudflare's `max-age=31536000, immutable` headers cause redirects changes to not take effect immediately. Cache-busting URLs or explicit purge required.

2. **Preview vs Production**: Always verify on production URL, not just preview deployments. CDN behavior differs.

3. **Responsive Widget Patterns**: Always wrap variable-length text in `Flexible` or `Expanded` when inside Row widgets, especially for mobile layouts.

## References

### Code Files
- `web/manifest.json` - PWA manifest with icon definitions
- `web/_redirects` - Cloudflare Pages routing configuration
- `lib/widgets/common/buttons.dart:324-358` - GradientButton implementation

### Documentation
- [Cloudflare Pages Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Flutter Flexible Widget](https://api.flutter.dev/flutter/widgets/Flexible-class.html)
