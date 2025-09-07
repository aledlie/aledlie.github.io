---
layout: single
title: Rich Snippets Testing Guide for Fisterra Dance Organization
date: 2025-09-06
author_profile: true
excerpt: "A comprehensive guide for testing and implementing structured data to enhance search visibility for dance organizations."
---

# Rich Snippets Testing Guide for Fisterra Dance Organization

## Testing Tools & URLs

### Google's Rich Results Test
**URL**: https://search.google.com/test/rich-results

### Schema.org Validator  
**URL**: https://validator.schema.org/

### Alternative Testing Tools
- **Bing Markup Validator**: https://www.bing.com/toolbox/markup-validator
- **Yandex Validator**: https://webmaster.yandex.com/tools/microformat/

## Step-by-Step Testing Process

### 1. Test Organization Schema (Knowledge Graph)

#### How to Test:
1. Go to https://search.google.com/test/rich-results
2. Select "Test Code" tab
3. Copy and paste the content from `test-samples/organization-schema.json`
4. Click "Test Code"

#### Expected Results:
✅ **Valid Items Found:**
- Organization
- PerformingGroup  
- ContactPoint
- PostalAddress
- DonateAction
- SearchAction

#### What This Enables:
- **Google Knowledge Panel** - Your organization appears in search results
- **Local SEO** - Enhanced visibility in "dance classes near me" searches
- **Contact Information** - Phone, email, address displayed in search
- **Social Media Links** - Connected profiles shown

### 2. Test Dance Event Schema

#### How to Test:
1. Go to https://search.google.com/test/rich-results
2. Select "Test Code" tab  
3. Copy and paste the content from `test-samples/dance-event-schema.json`
4. Click "Test Code"

#### Expected Results:
✅ **Valid Items Found:**
- DanceEvent (inherits from Event)
- Place (location)
- GeoCoordinates
- Offer (pricing)
- Person (instructor)
- RegisterAction

#### What This Enables:
- **Google Events** - Your events appear in Google's event listings
- **Rich Snippets** - Events show with date, time, location, price
- **Map Integration** - Location displayed on Google Maps
- **Direct Registration** - Register button in search results

### 3. Test Course Schema

#### How to Test:
1. Go to https://search.google.com/test/rich-results
2. Select "Test Code" tab
3. Copy and paste the content from `test-samples/course-schema.json`
4. Click "Test Code"

#### Expected Results:
✅ **Valid Items Found:**
- Course
- CourseInstance
- Schedule
- Offer (pricing)
- RegisterAction

#### What This Enables:
- **Course Rich Results** - Classes appear with schedule and pricing
- **Educational Content** - Enhanced visibility for dance education
- **Enrollment Actions** - Direct registration from search results

## Troubleshooting Common Issues

### ⚠️ Warnings You Might See (Safe to Ignore):
- "Missing recommended property" for optional fields
- "The property X is not recognized by Google" for dance-specific extensions
- URL validation errors for placeholder URLs

### 🔴 Errors You Must Fix:
- "Required property missing" 
- "Invalid date format"
- "Invalid URL format"
- "Invalid enum value"

## Implementation on Your Wix Site

### Method 1: Automatic Injection (Recommended)
Your enhanced page code automatically injects schema when events/courses load:

```javascript
// This happens automatically in your enhanced pages
const script = document.createElement('script');
script.type = 'application/ld+json';
script.text = JSON.stringify(schemaData);
document.head.appendChild(script);
```

### Method 2: Manual Testing with Live URLs
Once your site is live, you can test actual pages:

1. Go to https://search.google.com/test/rich-results
2. Select "Test URL" tab
3. Enter your live page URL (e.g., `https://your-wix-site.com/events`)
4. Google will crawl and test the structured data

## Rich Snippet Types You'll Get

### 1. Event Rich Snippets
**What Users See:**
```
🎭 Brazilian Zouk Basics Workshop
📅 Oct 15, 2024, 7:00 PM - 9:00 PM
📍 Fisterra Dance Studio, Austin, TX
💲 $25.00
👥 Beginner friendly
🎟️ [Register] button
```

### 2. Organization Knowledge Panel
**What Users See:**
```
Fisterra Dance Organization
Non-profit organization in Austin, TX
📞 (512) 555-0123
🌐 fisterra-dance.com
📍 123 Dance Street, Austin, TX
⭐ Reviews, photos, hours
💳 [Donate] button
```

### 3. Course Listings
**What Users See:**
```
📚 Salsa Fundamentals - 8-Week Series
🏫 Fisterra Dance Organization  
⏱️ 8 weeks, Tuesdays 7-8 PM
💲 $120 (Early bird: $140 regular)
📅 Starts Oct 1, 2024
🎯 Beginner level
✅ [Register] button
```

## Monitoring Rich Snippet Performance

### Google Search Console
1. Add your site to Search Console
2. Go to "Enhancements" section
3. Check "Events", "Courses", and other structured data types
4. Monitor impressions, clicks, and errors

### Key Metrics to Track:
- **Rich Snippet Impressions** - How often your enhanced results appear
- **Click-through Rate (CTR)** - % of people who click your rich results
- **Event Registrations** - Conversions from rich snippet clicks
- **Knowledge Panel Views** - Organization visibility

## Next Steps After Testing

### 1. Fix Any Validation Errors
- Update placeholder data with real information
- Ensure all required properties are included
- Fix URL formats and date formats

### 2. Deploy to Live Site
- Your enhanced Wix pages automatically generate this data
- No additional setup needed once pages are published

### 3. Submit to Search Engines
- Google Search Console: Request indexing of key pages
- Bing Webmaster Tools: Submit sitemap
- Monitor structured data reports

### 4. Ongoing Optimization
- A/B test different event descriptions for better CTR
- Monitor which course formats get more registrations
- Optimize organization information based on search queries

## Testing Checklist

### Organization Schema ✅
- [ ] Test with Google Rich Results Test
- [ ] Verify all contact information is correct
- [ ] Check social media links work
- [ ] Confirm nonprofit status is accurate

### Event Schema ✅  
- [ ] Test sample dance event
- [ ] Verify date/time formats
- [ ] Check location and address details
- [ ] Confirm pricing and registration URLs

### Course Schema ✅
- [ ] Test course structure
- [ ] Verify instructor information
- [ ] Check schedule formats
- [ ] Confirm prerequisites and skill levels

### Live Site Testing 🔄
- [ ] Test actual event pages after publishing
- [ ] Monitor Google Search Console for errors
- [ ] Check rich snippet appearance in search results
- [ ] Track conversion rates from enhanced listings

---

**Pro Tip**: Rich snippets can take 1-2 weeks to appear in Google search results after implementation. Monitor your Google Search Console for structured data recognition and any errors that need fixing.