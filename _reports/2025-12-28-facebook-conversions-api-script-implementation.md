---
layout: single
title: "Facebook Conversions API Script: Reusable Event Sender with Test Suite"
date: 2025-12-28
author_profile: true
breadcrumbs: true
categories: [analytics, automation, facebook-marketing]
tags: [facebook, conversions-api, meta-pixel, bash, doppler, sha256, testing, integritystudio]
excerpt: "Created a reusable Facebook Conversions API event sender script with Doppler integration, SHA256 hashing, and comprehensive test suite achieving 100% test pass rate."
header:
  overlay_image: /images/cover-reports.png
  teaser: /images/cover-reports.png
---

# Facebook Conversions API Script: Reusable Event Sender with Test Suite

**Session Date**: 2025-12-28
**Project**: AnalyticsBot - Multi-provider Analytics Integration Platform
**Focus**: Create reusable Facebook Conversions API event sender with test suite
**Session Type**: Implementation

## Executive Summary

Successfully implemented a comprehensive Facebook Conversions API event sender script (`fb-event.sh`) with full Doppler secrets integration, SHA256 user data hashing, and support for multiple pixels. The script supports all standard Facebook event types (PageView, Lead, Purchase, Contact, ViewContent, AddToCart, CompleteRegistration) with test mode capability for sandbox testing.

Created a companion test suite (`test-fb-events.sh`) that validates all script functionality, achieving **10/10 tests passing (100%)**. Both scripts integrate seamlessly with existing AnalyticsBot infrastructure and Doppler secrets management.

**Key Metrics:**
| Metric | Value |
|--------|-------|
| **Scripts Created** | 2 |
| **Total Lines of Code** | ~370 |
| **Event Types Supported** | 7+ standard + custom |
| **Pixels Configured** | 6 |
| **Tests Passing** | 10/10 (100%) |
| **Test Events Sent** | 16 |

## Problem Statement

The project needed a reliable way to:
1. Send server-side events to Facebook Conversions API for multiple pixels
2. Securely manage Meta access tokens and Pixel IDs via Doppler
3. Hash user data (email, phone, names) per Facebook requirements
4. Test events without affecting production data
5. Validate the implementation with automated tests

**Previous State**: Manual curl commands with hardcoded credentials and no standardized approach.

## Implementation Details

### Script 1: fb-event.sh

**File**: `AnalyticsBot/scripts/fb-event.sh` (~230 lines)

#### Key Components

**1. Doppler Integration for Secrets**
```bash
# Get credentials from Doppler
PIXEL_ID=$(doppler secrets get "$PIXEL_NAME" --plain -p "$DOPPLER_PROJECT" -c "$DOPPLER_CONFIG")
ACCESS_TOKEN=$(doppler secrets get "META_ACCESS_TOKEN" --plain -p "$DOPPLER_PROJECT" -c "$DOPPLER_CONFIG")
```

**2. SHA256 User Data Hashing**
```bash
hash_value() {
    echo -n "$1" | tr '[:upper:]' '[:lower:]' | shasum -a 256 | cut -d' ' -f1
}

# Applied to user data
[[ -n "$EMAIL" ]] && USER_DATA="$USER_DATA, \"em\": [\"$(hash_value "$EMAIL")\"]"
```

**3. Multi-Pixel Support**
```bash
declare -A PIXELS=(
    ["INTEGRITY_PIXEL"]="integrity-studio:dev"
    ["FB_PIXEL_ID"]="integrity-studio:dev"
    ["ALEDLIE_PIXEL"]="integrity-studio:dev"
    ["LEORA_PIXEL_ID"]="integrity-studio:dev"
    ["SITEREADER_PIXEL"]="integrity-studio:dev"
    ["SOUND_SIGHT_PIXEL_ID"]="integrity-studio:dev"
)
```

**4. Test Mode Support**
```bash
# Build test_event_code if in test mode
TEST_EVENT=""
if [[ -n "$TEST_MODE" ]]; then
    TEST_EVENT=", \"test_event_code\": \"$TEST_MODE\""
fi
```

#### Supported Event Types
- `PageView` - Page views
- `Lead` - Lead form submissions
- `Purchase` - Transactions with value
- `Contact` - Contact form submissions
- `ViewContent` - Content views
- `AddToCart` - Cart additions with value
- `CompleteRegistration` - User registrations
- Any custom event name

#### Usage Examples
```bash
# Simple PageView
./fb-event.sh --event PageView

# Lead with user data
./fb-event.sh --event Lead --email user@example.com --fn John --ln Doe

# Purchase event with value
./fb-event.sh --event Purchase --value 149.99 --email buyer@example.com

# Use different pixel
./fb-event.sh --pixel ALEDLIE_PIXEL --event PageView

# Test mode (sandbox)
./fb-event.sh --event Lead --email test@test.com --test TEST12345

# List available pixels
./fb-event.sh --list-pixels
```

### Script 2: test-fb-events.sh

**File**: `AnalyticsBot/scripts/test-fb-events.sh` (~140 lines)

#### Test Cases

| Test # | Name | Description |
|--------|------|-------------|
| 1 | Script exists | Validates fb-event.sh exists and is executable |
| 2 | Help command | Tests --help displays correctly |
| 3 | List pixels | Tests --list-pixels functionality |
| 4 | PageView event | Sends PageView in test mode |
| 5 | Lead event | Sends Lead with user data |
| 6 | Purchase event | Sends Purchase with value |
| 7 | Contact event | Sends Contact event |
| 8 | ViewContent event | Sends ViewContent event |
| 9 | AddToCart event | Sends AddToCart with value |
| 10 | CompleteRegistration | Sends registration event |

## Testing and Verification

### Test Results

```bash
$ ./test-fb-events.sh
========================================
Facebook Conversions API Test Suite
========================================
Testing: /Users/alyshialedlie/code/ISPublicSites/AnalyticsBot/scripts/fb-event.sh
Pixel: INTEGRITY_PIXEL (default)
Mode: Test events (won't affect production)

TEST: Script exists and is executable
✓ PASS: fb-event.sh exists and is executable

TEST: Help command
✓ PASS: Help displays correctly

TEST: List pixels command
✓ PASS: List pixels works

TEST: PageView event (test mode)
✓ PASS: PageView event sent successfully

TEST: Lead event with user data (test mode)
✓ PASS: Lead event with user data sent successfully

TEST: Purchase event with value (test mode)
✓ PASS: Purchase event with value sent successfully

TEST: Contact event (test mode)
✓ PASS: Contact event sent successfully

TEST: ViewContent event (test mode)
✓ PASS: ViewContent event sent successfully

TEST: AddToCart event (test mode)
✓ PASS: AddToCart event sent successfully

TEST: CompleteRegistration event (test mode)
✓ PASS: CompleteRegistration event sent successfully

========================================
Test Summary
========================================
Passed: 10
Failed: 0
Total: 10

All tests passed!
```

### Manual Event Verification

Events sent during session to INTEGRITY_PIXEL (25629020546684786):

| Event | URL | Trace ID | Status |
|-------|-----|----------|--------|
| PageView | integritystudio.ai | AIINEEuqMufYEu7yc7vYB6y | ✅ |
| Lead | integritystudio.ai | Ag1azaX7WaDfcLsoVOkoToB | ✅ |
| Lead | integritystudio.ai | AqKEQhS5H5Xfmfu7FcKjest | ✅ |
| Purchase ($199.99) | integritystudio.ai | AGHiVDm9_Yyq-JwbssTmS9L | ✅ |
| Contact | integritystudio.ai/contact | AObn93E1mDyh8vHQuzP7ulf | ✅ |
| Contact (test) | integritystudio.ai/contact | A6UfNgO8wwSOLTmjYMgUCYe | ✅ |
| ViewContent | integritystudio.ai/services | AXIPOD9ep2AwE6QD8D95exg | ✅ |

## Key Decisions and Trade-offs

### Decision 1: Bash 5 (Homebrew) vs Standard Bash
**Choice**: Use `/opt/homebrew/bin/bash` (Bash 5.3.3)
**Rationale**: Associative arrays require Bash 4+; macOS ships with Bash 3.2
**Alternative Considered**: Rewrite without associative arrays
**Trade-off**: Requires Homebrew bash installation

### Decision 2: SHA256 for User Data Hashing
**Choice**: SHA256 with lowercase normalization
**Rationale**: Facebook Conversions API requirement for PII
**Implementation**: `echo -n "$value" | tr '[:upper:]' '[:lower:]' | shasum -a 256`

### Decision 3: Doppler for Secrets Management
**Choice**: Integrate with existing Doppler infrastructure
**Rationale**: Centralized secrets, no hardcoded credentials, audit trail
**Configuration**: Project `integrity-studio`, config `dev`

### Decision 4: Test Mode with test_event_code
**Choice**: Support `--test CODE` flag for sandbox testing
**Rationale**: Test events without affecting production metrics
**Implementation**: Adds `test_event_code` to API payload

## Doppler Secrets Configuration

### Secrets Retrieved
| Secret Name | Doppler Project | Config |
|-------------|-----------------|--------|
| META_ACCESS_TOKEN | integrity-studio | dev |
| INTEGRITY_PIXEL | integrity-studio | dev |
| FB_PIXEL_ID | integrity-studio | dev |
| ALEDLIE_PIXEL | integrity-studio | dev |
| LEORA_PIXEL_ID | integrity-studio | dev |
| SITEREADER_PIXEL | integrity-studio | dev |
| SOUND_SIGHT_PIXEL_ID | integrity-studio | dev |

## Files Created

### New Files (2)
| File | Lines | Purpose |
|------|-------|---------|
| `AnalyticsBot/scripts/fb-event.sh` | ~230 | Reusable event sender |
| `AnalyticsBot/scripts/test-fb-events.sh` | ~140 | Automated test suite |

## API Reference

### Facebook Conversions API Endpoint
```
POST https://graph.facebook.com/v21.0/{pixel_id}/events
```

### Payload Structure
```json
{
  "data": [{
    "event_name": "Lead",
    "event_time": 1735412345,
    "action_source": "website",
    "event_source_url": "https://integritystudio.ai/contact",
    "user_data": {
      "client_ip_address": "192.168.1.1",
      "client_user_agent": "Mozilla/5.0",
      "em": ["sha256_hashed_email"],
      "fn": ["sha256_hashed_firstname"],
      "ln": ["sha256_hashed_lastname"]
    },
    "custom_data": {
      "value": 99.99,
      "currency": "USD"
    }
  }],
  "access_token": "...",
  "test_event_code": "TEST12345"
}
```

## Next Steps

### Immediate
1. ✅ Scripts created and tested
2. ✅ All 10 tests passing

### Short-term
3. Add to CI/CD pipeline for automated testing
4. Create additional pixels in Doppler as needed
5. Integrate with website contact forms for real-time event tracking

### Medium-term
6. Add retry logic for failed API calls
7. Implement batch event sending for high-volume scenarios
8. Add event deduplication with event_id parameter

## References

### Code Files
- `AnalyticsBot/scripts/fb-event.sh:1-230` - Event sender script
- `AnalyticsBot/scripts/test-fb-events.sh:1-140` - Test suite

### External Documentation
- [Facebook Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Server Event Parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)
- [User Data Hashing](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters)

### Doppler
- Project: `integrity-studio`
- Config: `dev`
- Secrets: META_ACCESS_TOKEN, *_PIXEL
