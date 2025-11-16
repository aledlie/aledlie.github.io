# Schema.org Implementation Analysis - Fisterra Dance Organization

**Project**: Fisterra Dance Organization (Wix-based website)
**Date**: 2025-11-12
**Analysis Tool**: ast-grep-mcp with manual file review

---

## Executive Summary

The Fisterra Dance Organization website has **extensive Schema.org structured data implementation** across multiple domains:
- **8 Schema.org types** implemented across frontend and backend
- **JSON-LD format** used consistently (industry best practice)
- **Domain coverage**: Events, Courses, Donations, Organization, Impact Reporting
- **Integration**: Wix backend web methods + frontend page scripts
- **Security**: Recent security fixes implemented for XSS prevention

---

## Schema.org Types Implemented

### 1. **Organization** (Foundation Type)
**Files**:
- `test-samples/organization-schema.json` (reference implementation)
- `src/pages/Donate.v1akg.js:130-151`

**Properties Used**:
- Core: `@type: ["Organization", "PerformingGroup"]`, `name`, `alternateName`, `url`, `logo`, `description`
- Non-profit specific: `nonprofitStatus`, `taxID`, `foundingDate`, `founder`
- Location: `address` (PostalAddress), `areaServed` (City/State)
- Contact: `contactPoint` (telephone, email)
- Knowledge: `knowsAbout` (dance styles, specialties)
- Social: `sameAs` (Facebook, Instagram, Twitter)
- Actions: `potentialAction` (DonateAction, SearchAction)
- Mission: Custom `mission` property

**Implementation Quality**: ⭐⭐⭐⭐⭐ Excellent
- Multiple types used (`Organization` + `PerformingGroup`)
- Complete contact and address information
- Social media cross-references
- Actionable potentialActions for donations and search

---

### 2. **DonateAction**
**Files**:
- `src/backend/donations.web.js:20-43` (currently disabled for security)
- `src/pages/Donate.v1akg.js:143-150` (potentialAction)
- `src/backend/secure-donations.web.js:110-169`

**Properties Used**:
- `@type: "DonateAction"`
- `agent` (Person - donor details)
- `recipient` (Organization with taxID)
- `object` (MonetaryAmount with currency and value)
- `purpose` (program designation)
- `startTime` (donation timestamp)
- `target` (EntryPoint with URL template and platforms)

**Implementation Notes**:
- **SECURITY**: Main donation processing is currently DISABLED due to lack of payment gateway validation
- Code exists but throws error: "Donation processing temporarily disabled for security compliance"
- Schema generation is implemented and ready once payment system is integrated
- Follows IRS requirements for non-profit transparency

**Status**: 🚧 Implementation Ready, Payment Gateway Required

---

### 3. **DanceEvent**
**Files**:
- `test-samples/dance-event-schema.json` (reference implementation)
- `src/backend/events-manager.web.js:12-54`
- `src/pages/Events.ai1zq.js:20`

**Properties Used**:
- Core: `name`, `description`, `startDate`, `endDate`
- Status: `eventStatus`, `eventAttendanceMode`
- Location: `location` (Place with PostalAddress, GeoCoordinates, accessibility)
- Organization: `organizer` (Organization)
- People: `performer` (Person array with instructors)
- Audience: `audience` (audienceType, suggestedMinAge)
- Pricing: `offers` (Offer with price, availability, validFrom/Through)
- Media: `image` (array)
- Dance-specific: `danceStyle`, `skillLevel`, `instructor`, `musicGenre`, `difficultyLevel`
- Accessibility: `accessibilityFeature`, `maximumAttendeeCapacity`
- Actions: `potentialAction` (RegisterAction)
- SEO: `keywords`, `isAccessibleForFree`

**Implementation Quality**: ⭐⭐⭐⭐⭐ Excellent
- Rich event details with accessibility features
- Geographic coordinates for location
- Clear skill level and audience targeting
- Complete instructor information
- Registration action integration

---

### 4. **Course**
**Files**:
- `test-samples/course-schema.json` (reference implementation)
- `src/backend/programs.web.js:11-61`

**Properties Used**:
- Core: `name`, `description`, `provider` (Organization)
- Instructor: `instructor` (Person array with knowsAbout, memberOf)
- Educational: `courseCode`, `educationalLevel`, `timeRequired`, `numberOfCredits`
- Prerequisites: `coursePrerequisites`, `competencyRequired`
- Content: `teaches` (skills array)
- Instance: `hasCourseInstance` (CourseInstance with schedule, location, capacity)
- Pricing: `offers` (Offer with pricing and validity)
- Dance-specific: `genre`, `skillLevel`, `accessibilityFeature`
- Financial: `financialAidEligible`
- SEO: `keywords`, `isAccessibleForFree`
- Actions: `potentialAction` (RegisterAction)

**Implementation Quality**: ⭐⭐⭐⭐⭐ Excellent
- Complete educational metadata
- Detailed schedule information
- Financial aid transparency
- Accessibility features documented

---

### 5. **Report** (Impact Reporting)
**Files**:
- `src/backend/donations.web.js:64-80` (Donation Report)
- `src/backend/programs.web.js:98-135` (Impact Report)

**Properties Used**:
- Core: `name`, `dateCreated`/`datePublished`, `publisher` (Organization)
- Content: `about` (Organization or SocialImpact)
- Data: `mainEntity` (Dataset or Statistic array)
- Impact metrics: Students Served, Community Events, Scholarships Provided

**Implementation Quality**: ⭐⭐⭐⭐ Very Good
- Good for grant applications and board reporting
- Structured impact metrics
- Could be enhanced with more detailed statistics

**Recommendation**: Consider adding `measurementTechnique` and `temporalCoverage` properties

---

### 6. **EducationalOccupationalCredential**
**Files**:
- `src/backend/programs.web.js:68-91`

**Properties Used**:
- `name`, `credentialCategory` ("Certificate of Participation")
- `recognizedBy` (Organization)
- `about` (Course with courseCode)
- `holder` (Person)
- `dateCreated`, `competencyRequired` (skills acquired)

**Implementation Quality**: ⭐⭐⭐⭐ Very Good
- Good for student progress tracking
- Credential transparency

**Recommendation**: Consider adding `validFrom`/`validThrough` for credential expiration

---

### 7. **InteractionCounter**
**Files**:
- `src/backend/donations.web.js:86-95`

**Properties Used**:
- `interactionType` ("DonateAction")
- `userInteractionCount` (donation count)
- `startDate`, `endDate`

**Implementation Quality**: ⭐⭐⭐ Good
- Tracks donor engagement
- Useful for analytics

---

### 8. **MonetaryAmount** (nested in DonateAction)
**Files**:
- `src/backend/donations.web.js:35-39`
- `src/backend/secure-donations.web.js` (multiple instances)

**Properties Used**:
- `currency` ("USD")
- `value` (donation amount)

---

## Implementation Pattern Analysis

### ✅ **Strengths**

1. **Consistent JSON-LD Format**
   - All schemas use `application/ld+json` script tags
   - Proper `@context: "https://schema.org"` declarations

2. **Security-First Approach**
   - Uses `textContent` instead of `innerHTML` to prevent XSS
   - Input sanitization and validation throughout
   - Donation processing disabled until payment gateway integrated

3. **Accessibility Integration**
   - `accessibilityFeature` properties on events and courses
   - `maximumAttendeeCapacity` for venue planning
   - Audio description and wheelchair accessibility documented

4. **Rich Metadata**
   - Multiple entity types (`Organization` + `PerformingGroup`)
   - Nested structures (Person, Place, PostalAddress)
   - Cross-references via `memberOf` and `recognizedBy`

5. **SEO Optimization**
   - Keywords arrays
   - `potentialAction` for rich snippets
   - Geographic coordinates for local SEO

### ⚠️ **Areas for Enhancement**

1. **Missing @id References**
   - No entity IDs for knowledge graph building
   - Cannot create cross-page entity references
   - No stable identifiers for entities

   **Recommendation**: Implement @id pattern following [Momentic Marketing best practices](https://momenticmarketing.com/blog/id-schema-for-seo-llms-knowledge-graphs)
   ```json
   {
     "@context": "https://schema.org",
     "@id": "https://fisterra-dance.com#organization",
     "@type": "Organization",
     "name": "Fisterra Dance Organization"
   }
   ```

2. **Fragmented Entity Definitions**
   - Organization defined multiple times (Donate page, backend methods)
   - No single source of truth for core entities
   - Risk of inconsistent data across pages

   **Recommendation**: Create unified knowledge graph include file (similar to PersonalSite implementation)

3. **No Breadcrumb or SiteNavigationElement**
   - Missing breadcrumb trail schema
   - No site navigation structured data

4. **Limited Article/Blog Content Schema**
   - No BlogPosting or Article schemas found
   - If blog exists, should have appropriate schemas

5. **Instructor Profiles Could Be Enhanced**
   - Person entities could have @id for cross-referencing
   - Could add `sameAs` for instructor social profiles
   - Could add `alumniOf` for credentials

6. **Course Certificates**
   - `EducationalOccupationalCredential` is good but could include:
     - `validFrom`/`validThrough` dates
     - `credentialUrl` for verification
     - `educationalLevel` alignment

---

## Schema.org Tool Opportunities

Based on this analysis, here are the MCP tools that would be most useful:

### 1. **generate_entity_id**
Create proper @id values for:
- Organization (main entity)
- Each instructor (Person entities)
- Location/venue (Place entity)
- Each course and event

**Example**:
```bash
generate_entity_id("https://fisterra-dance.com", "organization")
# Returns: "https://fisterra-dance.com#organization"

generate_entity_id("https://fisterra-dance.com", "person", "instructors/maria-santos")
# Returns: "https://fisterra-dance.com/instructors/maria-santos#person"
```

### 2. **validate_entity_id**
Validate all @id values after implementation to ensure:
- Proper URL format
- Hash fragment present
- No dynamic values or timestamps
- Follows SEO best practices

### 3. **build_entity_graph**
Create unified knowledge graph connecting:
- Organization → owns → WebSite
- Organization → member → Instructors (Person)
- Organization → location → Place
- Courses → provider → Organization
- Events → organizer → Organization

### 4. **get_type_properties**
Research additional properties for:
- `DanceEvent` - might have dance-specific extensions
- `PerformingGroup` - performance-related properties
- `NonprofitOrganization` - non-profit specific properties

### 5. **search_schemas**
Research schema types for missing content:
- Blog posts (if applicable)
- Testimonials/Reviews
- FAQ pages
- Instructor profiles/bios

---

## Priority Recommendations

### 🔴 **High Priority**

1. **Implement Unified Knowledge Graph**
   - Create single source of truth for Organization entity
   - Add @id to all core entities
   - Build cross-references between entities
   - **Similar to PersonalSite implementation** (91% file reduction achieved)

2. **Complete Payment Gateway Integration**
   - Enable donation processing safely
   - Integrate with payment provider (Stripe, PayPal, etc.)
   - Ensure IRS compliance for tax receipts

3. **Add @id References Throughout**
   - Organization: `https://fisterra-dance.com#organization`
   - Instructors: `https://fisterra-dance.com/instructors/{slug}#person`
   - Venue: `https://fisterra-dance.com/location#place`

### 🟡 **Medium Priority**

4. **Enhance Instructor Schemas**
   - Add individual instructor pages with Person schema
   - Include @id for cross-referencing
   - Add credentials, social profiles, specialties

5. **Add Breadcrumb Navigation**
   - Implement BreadcrumbList schema
   - Improves site structure understanding
   - Eligible for rich snippets

6. **Implement Review/Rating Schema**
   - Add AggregateRating for organization
   - Include student testimonials as Review entities
   - Improves trust signals

### 🟢 **Low Priority**

7. **Add Blog/Article Schemas** (if applicable)
   - BlogPosting for blog content
   - Article for informational pages
   - FAQPage for common questions

8. **Enhance Certificate Schemas**
   - Add validity dates
   - Add verification URLs
   - Consider DigitalDocument type for certificates

---

## File Summary

### Implementation Files
- **Frontend Pages**: 2 files (`Donate.v1akg.js`, `Events.ai1zq.js`)
- **Backend Methods**: 4 files (`donations.web.js`, `programs.web.js`, `events-manager.web.js`, `secure-donations.web.js`)
- **Test Samples**: 3 JSON files (complete reference implementations)
- **HTML Scraper**: 1 Python file with Schema.org extraction logic

### Schema Distribution
- **Organization**: 3 implementations (needs consolidation)
- **DonateAction**: 3 implementations (1 disabled for security)
- **DanceEvent**: 2 implementations
- **Course**: 2 implementations
- **Report**: 2 implementations (Donation + Impact)
- **EducationalOccupationalCredential**: 1 implementation
- **InteractionCounter**: 1 implementation

---

## Validation Status

### ✅ **What's Working Well**
- JSON-LD format throughout
- Security fixes implemented
- Rich metadata
- Accessibility features documented
- Multiple entity types

### 🚧 **What Needs Work**
- No @id references (cannot build knowledge graph)
- Fragmented entity definitions
- Missing unified knowledge graph
- Payment gateway integration incomplete
- No breadcrumb or navigation schemas

### 🔍 **What to Validate**
Run all schemas through:
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **JSON-LD Playground**: https://json-ld.org/playground/

---

## Next Steps

1. **Create unified knowledge graph** using PersonalSite pattern as reference
2. **Implement @id references** for all core entities using `generate_entity_id` tool
3. **Validate all @id values** using `validate_entity_id` tool
4. **Build entity graph** using `build_entity_graph` tool
5. **Complete payment integration** to enable donation processing
6. **Test in Google Rich Results** to verify rich snippet eligibility
7. **Monitor Search Console** for structured data recognition

---

## References

- **PersonalSite Implementation**: `~/code/PersonalSite` - Successful unified knowledge graph implementation (91% file reduction, 100% @id validation)
- **@id Best Practices**: [Momentic Marketing Guide](https://momenticmarketing.com/blog/id-schema-for-seo-llms-knowledge-graphs)
- **Schema.org Documentation**: https://schema.org
- **Google Structured Data**: https://developers.google.com/search/docs/appearance/structured-data

---

**Analysis Complete**: 2025-11-12
**Next Review**: After unified knowledge graph implementation
