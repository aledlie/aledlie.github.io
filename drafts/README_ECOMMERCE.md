# Enhanced E-commerce Tracking for Inspired Movement Dance Studio

## Overview

This document provides comprehensive information about the enhanced e-commerce tracking implementation for the Inspired Movement Dance Studio website. The tracking system is built on Google Tag Manager (GTM) and provides detailed insights into user behavior, conversions, and revenue.

## 📊 What's Being Tracked

### E-commerce Events
- **Product Views** - When users view gift cards or class information
- **Add to Cart** - When users show interest in purchasing/booking
- **Begin Checkout** - When users start the booking/purchase process
- **Purchase** - Completed transactions and bookings
- **Booking Complete** - Service reservations and consultations

### Custom Events
- **Lead Generation** - Form submissions and inquiry tracking
- **Video Engagement** - Dance tutorial video interactions
- **Form Submissions** - Contact forms, booking forms, newsletters
- **Phone/Email Clicks** - Contact information interactions
- **Booking Abandonment** - Drop-off analysis

## 🏗️ System Architecture

### Core Components

1. **Master Tracking System** (`masterPage.js`)
   - Central tracking infrastructure
   - Global product catalog
   - Utility functions for all tracking events

2. **Page-Specific Implementations**
   - Gift Cards page: E-commerce product tracking
   - Booking page: Service and class booking tracking
   - Individual class pages: Course-specific tracking

3. **Google Tag Manager Integration**
   - Container ID: `GTM-TK5J8L38`
   - DataLayer events for all tracking
   - Ready for GA4 and other marketing platforms

## 💰 Product Catalog

### Gift Cards
| Product ID | Name | Category | Price | Description |
|------------|------|----------|-------|-------------|
| `gift-card-single` | Single Class Gift Card | Gift Cards/Classes | $25.00 | One dance class |
| `gift-card-4class` | 4-Class Package Gift Card | Gift Cards/Packages | $90.00 | Four-class package |
| `gift-card-monthly` | Monthly Unlimited Gift Card | Gift Cards/Unlimited | $120.00 | Unlimited monthly access |
| `gift-card-private` | Private Lesson Gift Card | Gift Cards/Private | $75.00 | One-on-one lesson |
| `gift-card-wedding` | Wedding Package Gift Card | Gift Cards/Wedding | $200.00 | Wedding dance preparation |

### Dance Classes
| Product ID | Name | Category | Price | Level |
|------------|------|----------|-------|-------|
| `white-belt-salsa` | White Belt Salsa Course | Classes/Beginner/Salsa | $25.00 | Beginner |
| `yellow-belt-salsa` | Yellow Belt Salsa Course | Classes/Elementary/Salsa | $25.00 | Elementary |
| `orange-belt-salsa` | Orange Belt Salsa Course | Classes/Intermediate/Salsa | $30.00 | Intermediate |
| `green-belt-salsa` | Green Belt Salsa Course | Classes/Advanced/Salsa | $35.00 | Advanced |

### Services
| Product ID | Name | Category | Price | Description |
|------------|------|----------|-------|-------------|
| `wedding-preparation` | Wedding Dance Preparation | Services/Wedding | $200.00 | Couple's dance instruction |
| `private-lesson` | Private Dance Lesson | Services/Private | $75.00 | One-on-one instruction |
| `birthday-party` | Birthday Party Entertainment | Services/Events | $150.00 | Party entertainment |

## 🔧 Implementation Guide

### Automatic Tracking

The system automatically tracks interactions when you use specific data attributes:

```html
<!-- Gift Card Buttons -->
<button data-gift-card="gift-card-wedding">Buy Wedding Gift Card</button>
<button data-purchase-gift-card="gift-card-monthly">Purchase Monthly Package</button>

<!-- Class Selection Buttons -->
<button data-class-type="white-belt-salsa">Book White Belt Class</button>

<!-- Service Buttons -->
<button data-service-type="wedding-preparation">Wedding Consultation</button>

<!-- Forms -->
<form data-form-type="gift-card">
<form data-form-type="booking">

<!-- Calendar Events -->
<div data-calendar-event="white-belt-salsa" data-event-date="2024-01-15">
```

### Manual Tracking Functions

#### Gift Card Tracking
```javascript
// Track when someone purchases a gift card
window.trackGiftCardPurchase('gift-card-wedding', 'txn_12345', {
    customer_type: 'returning',
    payment_method: 'credit_card'
});

// Track interest in gift cards
window.trackGiftCardInterest('gift-card-private');
```

#### Class Booking Tracking
```javascript
// Track completed class booking
window.trackClassBooking('white-belt-salsa', {
    student_name: 'John Doe',
    student_level: 'beginner',
    referral_source: 'google'
});

// Track service inquiries
window.trackServiceInquiry('wedding-preparation', {
    wedding_date: '2024-06-15',
    couple_names: 'Jane & John',
    guest_count: 150
});

// Track booking abandonment for conversion optimization
window.trackBookingAbandonment('payment_step', 'white-belt-salsa');
```

#### General Tracking
```javascript
// Track form submissions
window.danceStudioTracking.trackFormSubmission('Contact Form', 'contact');

// Track video engagement
window.danceStudioTracking.trackVideoEngagement('Salsa Basics Tutorial', 'play');

// Track phone/email clicks
window.danceStudioTracking.trackPhoneClick('(555) 123-4567', 'header');
window.danceStudioTracking.trackEmailClick('info@inspireddance.com', 'footer');
```

## 📈 Available Analytics

### Revenue Metrics
- **Total Revenue** by product type (gift cards, classes, services)
- **Average Order Value** for different customer segments
- **Product Performance** - which offerings generate most revenue
- **Conversion Rates** by traffic source and page

### Customer Behavior
- **Booking Funnel Analysis** - where users drop off
- **Product Interest Patterns** - what users view before purchasing
- **Form Completion Rates** - optimization opportunities
- **Video Engagement Metrics** - content effectiveness

### Marketing Insights
- **Campaign Attribution** - which marketing drives revenue
- **Customer Journey Mapping** - multi-session conversion paths
- **Seasonal Trends** - peak booking times and preferences
- **Lead Quality Scoring** - inquiry to conversion rates

## 🔍 Debugging & Testing

### Console Logging
All tracking events log to the browser console for debugging:
```
Product view tracked: gift-card-wedding {event: "view_item", ...}
Purchase tracked: txn_12345 {event: "purchase", ...}
Lead generated: service_inquiry {event: "generate_lead", ...}
```

### GTM Preview Mode
1. Enable GTM Preview mode
2. Navigate to tracked pages
3. Verify events appear in dataLayer
4. Check event parameters and values

### Validation Commands
```bash
# Run site functionality validation
./validate_site_functionality.sh

# Check for tracking implementation
grep -r "danceStudioTracking" src/
```

## 🚀 Setup Instructions

### 1. Google Tag Manager Configuration
The site uses GTM container `GTM-TK5J8L38`. Configure these tags in GTM:

#### GA4 Configuration Tag
- **Tag Type**: Google Analytics: GA4 Configuration
- **Measurement ID**: Your GA4 property ID
- **Trigger**: All Pages

#### GA4 Event Tags
Create tags for each tracked event:
- `view_item` - Product/service views
- `add_to_cart` - Interest tracking
- `begin_checkout` - Booking start
- `purchase` - Completed transactions
- `generate_lead` - Lead generation
- `form_submit` - Form submissions

### 2. Google Analytics 4 Setup
1. Create GA4 property for the dance studio
2. Enable Enhanced Ecommerce
3. Set up Custom Dimensions:
   - `lead_type` - Type of lead generated
   - `service_type` - Type of service requested  
   - `class_level` - Difficulty level of class
   - `booking_source` - Where booking originated

### 3. Custom Conversions
Set up these conversion events in GA4:
- `purchase` - Revenue conversions
- `generate_lead` - Lead conversions
- `booking_complete` - Service bookings
- `form_submit` - Contact form submissions

## 📋 Data Layer Events Reference

### Product View Event
```javascript
{
  event: 'view_item',
  ecommerce: {
    currency: 'USD',
    value: 25.00,
    items: [{
      item_id: 'gift-card-single',
      item_name: 'Single Class Gift Card',
      affiliation: 'Inspired Movement Dance Studio',
      category: 'Gift Cards',
      category2: 'Classes',
      item_brand: 'Inspired Movement',
      price: 25.00,
      currency: 'USD',
      quantity: 1
    }]
  }
}
```

### Purchase Event
```javascript
{
  event: 'purchase',
  ecommerce: {
    transaction_id: 'txn_12345',
    value: 200.00,
    currency: 'USD',
    affiliation: 'Inspired Movement Dance Studio',
    items: [{
      item_id: 'gift-card-wedding',
      item_name: 'Wedding Package Gift Card',
      category: 'Gift Cards',
      category2: 'Wedding',
      price: 200.00,
      quantity: 1
    }]
  }
}
```

### Lead Generation Event
```javascript
{
  event: 'generate_lead',
  lead_type: 'wedding_consultation',
  timestamp: '2024-01-15T10:30:00Z',
  service_type: 'wedding-preparation'
}
```

## 🛠️ Maintenance & Updates

### Adding New Products
1. Add product definition to `danceStudioProducts` object in `masterPage.js`
2. Include pricing, categories, and descriptions
3. Test tracking with new product ID

### Updating Prices
Update the `price` field in the product definitions and redeploy.

### Adding New Events
1. Create new tracking function in `masterPage.js`
2. Add to `window.danceStudioTracking` object
3. Implement on relevant pages
4. Configure corresponding GTM tags

## 📞 Support & Contact

For questions about the e-commerce tracking implementation:
- Check browser console for error messages
- Verify GTM container is loading correctly
- Ensure dataLayer events are firing
- Test with GTM Preview mode

## 🔄 Version History

- **v1.0** (2024) - Initial implementation with core e-commerce tracking
  - Product view, add to cart, purchase tracking
  - Lead generation and form submission tracking
  - Gift card and class booking integration
  - GTM and GA4 setup documentation

---

*This tracking system provides comprehensive insights into the dance studio's online performance and customer behavior. Regular monitoring and optimization will help improve conversion rates and revenue growth.*