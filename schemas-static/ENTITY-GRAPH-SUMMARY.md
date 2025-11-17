# Www Entity Graph Summary

**Site**: https://www.aledlie.com
**Created**: 2025-11-16
**Method**: `schema-graph-builder.py`
**Status**: ✅ Complete & Validated

---

## Executive Summary

Successfully created a **unified knowledge graph** for Www from 16 Schema.org JSON files, resulting in:

- **58 unique entities** across 21 Schema.org types
- **95 relationships** connecting entities
- **100% valid** JSON-LD format

---

## Graph Statistics

| Metric | Value |
|--------|-------|
| **Source Files** | 16 JSON files |
| **Total Entities** | 58 unique |
| **Entity Types** | 21 unique types |
| **Relationships** | 95 connections |
| **Validation** | ✅ Valid JSON-LD |

---

## Entity Breakdown

### By Type (21 Types)

| Type | Count |
|------|-------|
| **AnalysisNewsArticle** | 1 |
| **Blog** | 1 |
| **BlogPosting** | 1 |
| **CollegeOrUniversity** | 2 |
| **ComputerLanguage** | 2 |
| **ContactPoint** | 1 |
| **EntryPoint** | 1 |
| **NewsMediaOrganization** | 1 |
| **Occupation** | 3 |
| **OperatingSystem** | 2 |
| **Organization** | 8 |
| **Person** | 8 |
| **Place** | 1 |
| **ProfilePage** | 1 |
| **ReadAction** | 1 |
| **SearchAction** | 1 |
| **SoftwareApplication** | 16 |
| **TechArticle** | 2 |
| **ViewAction** | 1 |
| **WebPage** | 2 |
| **WebSite** | 2 |

---

## Source Files

### 1. blog-post-jekyll-update.json

### 2. blog-post-schema-rabbit-hole.json

### 3. blog-post-wix-performance.json

### 4. blog-schema.json

### 5. citations-schema.json

### 6. education-schema.json

### 7. integrity-studios-schema.json

### 8. inventoryai-schema.json

### 9. organizations-schema.json

### 10. page-homage.json

### 11. page-test-cases.json

### 12. page-vita.json

### 13. people-schema.json

### 14. person-schema.json

### 15. software-tools-schema.json

### 16. website-schema.json

---

## Relationship Analysis

### By Property (22 Types)

| Property | Count |
|----------|-------|
| **mentions** | 37 |
| **author** | 8 |
| **publisher** | 7 |
| **isPartOf** | 7 |
| **programmingLanguage** | 6 |
| **hasOccupation** | 3 |
| **hasPart** | 3 |
| **potentialAction** | 3 |
| **blogPost** | 2 |
| **worksFor** | 2 |
| **alumniOf** | 2 |
| **mainEntity** | 2 |
| **about** | 2 |
| **founder** | 2 |
| **employee** | 2 |
| **homeLocation** | 1 |
| **owns** | 1 |
| **mainEntityOfPage** | 1 |
| **contactPoint** | 1 |
| **target** | 1 |
| **copyrightHolder** | 1 |
| **citation** | 1 |

---

## Entity Relationship Map

**Blog**
- @id: `https://www.aledlie.com#blog`
- Relationships:
  - author → `#person`
  - publisher → `#person`
  - isPartOf → `#website`
  - blogPost → `/posts/2025-11-11-schema-org-rabbit-hole#blogposting`
  - blogPost → `/posts/2025-07-02-updating-jekyll-in-2025#techarticle`

**Person**
- @id: `https://www.aledlie.com#person`
- Relationships:
  - homeLocation → `/location/austin#place`
  - hasOccupation → `/occupation/software-developer#occupation`
  - hasOccupation → `/occupation/tech-consultant#occupation`
  - hasOccupation → `/occupation/technical-writer#occupation`
  - worksFor → `/organizations/integrity-studios#organization`
  - worksFor → `/organizations/inventoryai#organization`
  - alumniOf → `/education/university-of-texas#collegeuniversity`
  - alumniOf → `/education/cornell-university#collegeuniversity`
  - owns → `#website`
  - mainEntityOfPage → `/about#profilepage`
  - contactPoint → `#contactpoint`

**SearchAction**
- @id: `https://www.aledlie.com#searchaction`
- Relationships:
  - target → `/search#entrypoint`

**WebSite**
- @id: `https://www.aledlie.com#website`
- Relationships:
  - publisher → `#person`
  - author → `#person`
  - copyrightHolder → `#person`
  - mainEntity → `#person`
  - hasPart → `#blog`
  - hasPart → `/about#profilepage`
  - hasPart → `/projects#collectionpage`
  - potentialAction → `#searchaction`
  - potentialAction → `#readaction`
  - potentialAction → `#viewaction`

**WebPage**
- @id: `https://www.aledlie.com/homage#webpage`
- Relationships:
  - about → `/people/sumedh-joshi#person`
  - author → `#person`
  - publisher → `#person`
  - isPartOf → `#website`
  - mentions → `/people/sumedh-joshi#person`
  - mentions → `/people/peter-singer#person`
  - mentions → `/people/martha-nussbaum#person`
  - mentions → `/people/georg-cantor#person`
  - mentions → `/people/sarang-joshi#person`
  - mentions → `/people/neil-gaiman#person`
  - mentions → `/websites/burnt-orange-nation#website`
  - mentions → `/organizations/new-york-times#newsmediaorganization`

**Organization**
- @id: `https://www.aledlie.com/organizations/integrity-studios#organization`
- Relationships:
  - founder → `#person`
  - employee → `#person`

**Organization**
- @id: `https://www.aledlie.com/organizations/inventoryai#organization`
- Relationships:
  - founder → `#person`
  - employee → `#person`

**TechArticle**
- @id: `https://www.aledlie.com/posts/2025-07-02-updating-jekyll-in-2025#techarticle`
- Relationships:
  - author → `#person`
  - publisher → `#person`
  - isPartOf → `#blog`
  - mentions → `/software/jekyll#softwareapplication`
  - mentions → `/languages/ruby#computerlanguage`
  - mentions → `/software/bundler#softwareapplication`
  - mentions → `/software/minimal-mistakes#softwareapplication`
  - mentions → `/platforms/macos#operatingsystem`
  - mentions → `/platforms/ubuntu#operatingsystem`
  - citation → `/people/moncef-belyamani#person`

**AnalysisNewsArticle**
- @id: `https://www.aledlie.com/posts/2025-09-02-WixPerformanceImprovement#analysisnewsarticle`
- Relationships:
  - author → `#person`
  - publisher → `#person`
  - isPartOf → `#blog`
  - mentions → `/software/inflight#softwareapplication`
  - mentions → `/software/glob#softwareapplication`
  - mentions → `/software/lru-cache#softwareapplication`
  - mentions → `/software/wix#softwareapplication`
  - mentions → `/software/nodejs#softwareapplication`
  - mentions → `/software/npm#softwareapplication`

**BlogPosting**
- @id: `https://www.aledlie.com/posts/2025-11-11-schema-org-rabbit-hole#blogposting`
- Relationships:
  - author → `#person`
  - publisher → `#person`

**TechArticle**
- @id: `https://www.aledlie.com/posts/2025-11-11-schema-org-rabbit-hole#techarticle`
- Relationships:
  - author → `#person`
  - publisher → `#person`
  - isPartOf → `#blog`

**SoftwareApplication**
- @id: `https://www.aledlie.com/software/bundler#softwareapplication`
- Relationships:
  - programmingLanguage → `/languages/ruby#computerlanguage`

**SoftwareApplication**
- @id: `https://www.aledlie.com/software/jekyll#softwareapplication`
- Relationships:
  - programmingLanguage → `/languages/ruby#computerlanguage`

**SoftwareApplication**
- @id: `https://www.aledlie.com/software/jest#softwareapplication`
- Relationships:
  - programmingLanguage → `/languages/javascript#computerlanguage`

**SoftwareApplication**
- @id: `https://www.aledlie.com/software/lighthouse#softwareapplication`
- Relationships:
  - programmingLanguage → `/languages/javascript#computerlanguage`

**SoftwareApplication**
- @id: `https://www.aledlie.com/software/nodejs#softwareapplication`
- Relationships:
  - programmingLanguage → `/languages/javascript#computerlanguage`

**SoftwareApplication**
- @id: `https://www.aledlie.com/software/playwright#softwareapplication`
- Relationships:
  - programmingLanguage → `/languages/javascript#computerlanguage`

**WebPage**
- @id: `https://www.aledlie.com/test-cases#webpage`
- Relationships:
  - author → `#person`
  - isPartOf → `#website`
  - mentions → `/software/jest#softwareapplication`
  - mentions → `/software/playwright#softwareapplication`
  - mentions → `/software/lighthouse#softwareapplication`

**ProfilePage**
- @id: `https://www.aledlie.com/vita#profilepage`
- Relationships:
  - about → `#person`
  - mainEntity → `#person`
  - isPartOf → `#website`
  - mentions → `/organizations/inventoryai#organization`
  - mentions → `/organizations/integrity-studios#organization`
  - mentions → `/organizations/concierge#organization`
  - mentions → `/organizations/meta#organization`
  - mentions → `/organizations/advisory-board#organization`
  - mentions → `/organizations/access-sciences#organization`
  - mentions → `/organizations/heb#organization`
  - mentions → `/organizations/against-malaria-foundation#organization`
  - mentions → `/software/splunk#softwareapplication`
  - mentions → `/software/nagios#softwareapplication`
  - mentions → `/software/rabbitmq#softwareapplication`
  - mentions → `/software/new-relic#softwareapplication`
  - mentions → `/education/university-of-texas#collegeuniversity`
  - mentions → `/education/cornell-university#collegeuniversity`

---

## Validation Results

### JSON-LD Validation
✅ Valid JSON-LD format

### @id Validation
- ✅ 58 @id values validated
- ✅ No validation warnings

---

## Build Statistics

- Files processed: 16
- Entities extracted: 59
- Entities unique: 58
- Relationships found: 95
- IDs validated: 58

---

**Created**: 2025-11-16 20:57:54
**Base URL**: https://www.aledlie.com
**Entities**: 58
**Relationships**: 95
**Validation**: ✅ Pass
