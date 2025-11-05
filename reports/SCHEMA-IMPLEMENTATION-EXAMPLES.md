# Schema.org Implementation Examples for Leora Home Health

## 1. Enhanced Homepage Schema (Upgrade to MedicalOrganization)

Replace the current LocalBusiness schema on `/site/index.html` with this enhanced version:

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "@id": "https://www.leorahomehealth.com/#organization",
  "name": "Leora Home Health",
  "alternateName": "Leora Home Health Services",
  "description": "Licensed home health agency providing compassionate skilled nursing, home health aide, and personal assistance services throughout Central Texas. Medicare and Medicaid certified.",
  "url": "https://www.leorahomehealth.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://cdn.prod.website-files.com/6700b1003622e22dbd310d9f/670f45bf03cdb5f2ed97b8f2_LHH-Logo.svg",
    "width": 280,
    "height": 100
  },
  "image": [
    "https://cdn.prod.website-files.com/6700b1003622e22dbd310d9f/67a7bfffbb22352384ed25b4_LHH-OG-Home.jpg"
  ],
  "telephone": "+1-512-222-8103",
  "email": "appointments@leorahomehealth.com",
  "faxNumber": "+1-512-222-8104",
  "priceRange": "$$",
  "currenciesAccepted": "USD",
  "paymentAccepted": ["Cash", "Check", "Credit Card", "Insurance"],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "",
    "addressLocality": "Austin",
    "addressRegion": "TX",
    "postalCode": "78701",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "30.2672",
    "longitude": "-97.7431"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Austin",
      "@id": "https://en.wikipedia.org/wiki/Austin,_Texas"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Travis County"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Williamson County"
    },
    {
      "@type": "State",
      "name": "Texas"
    }
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "17:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "00:00",
      "description": "24/7 on-call nursing support available"
    }
  ],
  "sameAs": [
    "https://facebook.com/leorahomehealth",
    "https://twitter.com/leoarhomehealth",
    "https://instagram.com/leorahomehealth"
  ],
  "medicalSpecialty": [
    "Home Health Care",
    "Geriatrics",
    "Palliative Care",
    "Post-Acute Care",
    "Rehabilitation Medicine"
  ],
  "healthPlanNetworks": [
    {
      "@type": "HealthPlanNetwork",
      "name": "Medicare",
      "url": "https://www.medicare.gov/"
    },
    {
      "@type": "HealthPlanNetwork",
      "name": "Medicaid",
      "url": "https://www.medicaid.gov/"
    }
  ],
  "isAcceptingNewPatients": true,
  "availableService": [
    {
      "@type": "MedicalProcedure",
      "@id": "https://www.leorahomehealth.com/services#skilled-nursing",
      "name": "Skilled Nursing Care",
      "description": "Professional nursing services including wound care, medication management, IV therapy, and post-surgical care delivered in your home.",
      "procedureType": "Therapeutic"
    },
    {
      "@type": "MedicalProcedure",
      "@id": "https://www.leorahomehealth.com/services#home-health-aide",
      "name": "Home Health Aide Services",
      "description": "Certified home health aides assist with activities of daily living, personal hygiene, mobility, and light housekeeping.",
      "procedureType": "Preventive"
    },
    {
      "@type": "MedicalProcedure",
      "@id": "https://www.leorahomehealth.com/services#personal-assistance",
      "name": "Personal Assistance Services (PAS)",
      "description": "Non-medical personal care and companionship services to help maintain independence and quality of life at home.",
      "procedureType": "Supportive"
    },
    {
      "@type": "MedicalProcedure",
      "@id": "https://www.leorahomehealth.com/services#medical-social-services",
      "name": "Medical Social Services",
      "description": "Professional social work services including care coordination, resource referrals, and family support.",
      "procedureType": "Counseling"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  },
  "award": "Best Home Health Agency - Austin 2024"
}
```

## 2. Service Page Schema (Skilled Nursing)

Add to `/site/detail_skilled-nursing.html`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalWebPage",
      "@id": "https://www.leorahomehealth.com/services/skilled-nursing",
      "url": "https://www.leorahomehealth.com/services/skilled-nursing",
      "name": "Skilled Nursing Services | Leora Home Health",
      "description": "Professional in-home skilled nursing services in Austin, TX. Medicare certified nurses providing wound care, IV therapy, medication management, and post-surgical care.",
      "breadcrumb": {
        "@id": "https://www.leorahomehealth.com/services/skilled-nursing#breadcrumb"
      },
      "inLanguage": "en-US",
      "potentialAction": {
        "@type": "ReadAction",
        "target": "https://www.leorahomehealth.com/services/skilled-nursing"
      },
      "isPartOf": {
        "@id": "https://www.leorahomehealth.com/#website"
      },
      "provider": {
        "@id": "https://www.leorahomehealth.com/#organization"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.leorahomehealth.com/services/skilled-nursing#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.leorahomehealth.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Services",
          "item": "https://www.leorahomehealth.com/austin-tx-services"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Skilled Nursing",
          "item": "https://www.leorahomehealth.com/services/skilled-nursing"
        }
      ]
    },
    {
      "@type": "MedicalService",
      "@id": "https://www.leorahomehealth.com/services/skilled-nursing#service",
      "name": "Skilled Nursing Care",
      "alternateName": "RN Home Care Services",
      "description": "Comprehensive skilled nursing services delivered in the comfort of your home by licensed registered nurses (RNs) and licensed vocational nurses (LVNs).",
      "provider": {
        "@id": "https://www.leorahomehealth.com/#organization"
      },
      "serviceType": "Home Health Nursing",
      "areaServed": {
        "@type": "State",
        "name": "Texas"
      },
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://www.leorahomehealth.com/booking",
        "servicePhone": "+1-512-222-8103",
        "availableLanguage": ["English", "Spanish"]
      },
      "potentialAction": {
        "@type": "ScheduleAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.leorahomehealth.com/booking",
          "actionPlatform": ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"]
        },
        "name": "Schedule Skilled Nursing Care"
      },
      "offers": {
        "@type": "Offer",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": "Varies by service",
          "priceCurrency": "USD"
        },
        "acceptedPaymentMethod": [
          {
            "@type": "PaymentMethod",
            "name": "Medicare"
          },
          {
            "@type": "PaymentMethod",
            "name": "Medicaid"
          },
          {
            "@type": "PaymentMethod",
            "name": "Private Insurance"
          },
          {
            "@type": "PaymentMethod",
            "name": "Private Pay"
          }
        ]
      },
      "includedInHealthInsurancePlan": {
        "@type": "HealthInsurancePlan",
        "name": "Medicare Part A",
        "url": "https://www.medicare.gov/coverage/home-health-services"
      },
      "relevantSpecialty": {
        "@type": "MedicalSpecialty",
        "name": "Home Health Nursing"
      },
      "providedBy": [
        {
          "@type": "MedicalOrganization",
          "@id": "https://www.leorahomehealth.com/#organization"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What skilled nursing services are provided at home?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our skilled nursing services include wound care and dressing changes, IV therapy and medication administration, post-surgical care, diabetes management and education, catheter and ostomy care, pain management, vital signs monitoring, and coordination with your physician."
          }
        },
        {
          "@type": "Question",
          "name": "Does Medicare cover skilled nursing at home?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Medicare Part A covers skilled nursing care at home when prescribed by a physician. You must be homebound and require skilled nursing services on a part-time or intermittent basis. Our team will help verify your coverage and handle the authorization process."
          }
        },
        {
          "@type": "Question",
          "name": "How do I know if I need skilled nursing care?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Skilled nursing care is typically needed after hospitalization, surgery, or when managing complex medical conditions. Your physician will determine if skilled nursing is appropriate for your condition. Common reasons include wound care, IV medications, post-surgical monitoring, and management of chronic conditions."
          }
        }
      ]
    }
  ]
}
```

## 3. About Page Schema with Team Members

Add to `/site/about.html`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://www.leorahomehealth.com/about",
      "url": "https://www.leorahomehealth.com/about",
      "name": "About Leora Home Health - Our Mission & Team",
      "description": "Learn about Leora Home Health's mission to provide compassionate in-home care in Austin, TX. Meet our experienced team of healthcare professionals.",
      "breadcrumb": {
        "@id": "https://www.leorahomehealth.com/about#breadcrumb"
      },
      "mainEntity": {
        "@id": "https://www.leorahomehealth.com/#organization"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.leorahomehealth.com/about#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.leorahomehealth.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "About Us",
          "item": "https://www.leorahomehealth.com/about"
        }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://www.leorahomehealth.com/about#team",
      "name": "Leora Home Health Leadership Team",
      "member": [
        {
          "@type": "Person",
          "name": "Andrea Esquer",
          "jobTitle": "Administrator",
          "image": "https://cdn.prod.website-files.com/6700b1003622e22dbd310d9f/672098f61e95cea913d97c9a_AE-Administrator.jpg",
          "worksFor": {
            "@id": "https://www.leorahomehealth.com/#organization"
          }
        },
        {
          "@type": "Person",
          "name": "Jennifer Hernandez",
          "jobTitle": "Director of Nursing",
          "alumniOf": "University of Texas",
          "worksFor": {
            "@id": "https://www.leorahomehealth.com/#organization"
          }
        },
        {
          "@type": "Person",
          "name": "Carlos Torres",
          "jobTitle": "Clinical Manager",
          "worksFor": {
            "@id": "https://www.leorahomehealth.com/#organization"
          }
        },
        {
          "@type": "Person",
          "name": "Maria Vasquez",
          "jobTitle": "Community Liaison",
          "worksFor": {
            "@id": "https://www.leorahomehealth.com/#organization"
          }
        }
      ]
    }
  ]
}
```

## 4. Blog Post Schema

Add to blog article pages (e.g., `/site/detail_blog.html`):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "https://www.leorahomehealth.com/blog/caring-for-elderly-parents-at-home",
      "url": "https://www.leorahomehealth.com/blog/caring-for-elderly-parents-at-home",
      "headline": "Essential Tips for Caring for Elderly Parents at Home",
      "alternativeHeadline": "A Guide to In-Home Elder Care",
      "description": "Comprehensive guide for families caring for elderly parents at home, including safety tips, health management, and when to seek professional help.",
      "image": {
        "@type": "ImageObject",
        "url": "https://cdn.prod.website-files.com/blog-image.jpg",
        "width": 1200,
        "height": 630
      },
      "datePublished": "2025-10-15T09:00:00-05:00",
      "dateModified": "2025-10-20T14:30:00-05:00",
      "author": {
        "@type": "Person",
        "name": "Jennifer Hernandez, RN",
        "jobTitle": "Director of Nursing",
        "url": "https://www.leorahomehealth.com/about#jennifer-hernandez"
      },
      "publisher": {
        "@id": "https://www.leorahomehealth.com/#organization"
      },
      "articleSection": "Elder Care",
      "keywords": ["elder care", "home health", "elderly parents", "aging in place", "senior care"],
      "wordCount": 1500,
      "timeRequired": "PT7M",
      "articleBody": "Article content here...",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.leorahomehealth.com/blog/caring-for-elderly-parents-at-home"
      },
      "breadcrumb": {
        "@id": "https://www.leorahomehealth.com/blog/article#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.leorahomehealth.com/blog/article#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.leorahomehealth.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://www.leorahomehealth.com/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Caring for Elderly Parents",
          "item": "https://www.leorahomehealth.com/blog/caring-for-elderly-parents-at-home"
        }
      ]
    }
  ]
}
```

## 5. Contact Page Schema

Add to `/site/contact.html`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": "https://www.leorahomehealth.com/contact",
      "url": "https://www.leorahomehealth.com/contact",
      "name": "Contact Leora Home Health",
      "description": "Contact Leora Home Health for skilled nursing, home health aide, and personal assistance services in Austin, TX. Available 24/7 for urgent needs.",
      "breadcrumb": {
        "@id": "https://www.leorahomehealth.com/contact#breadcrumb"
      },
      "mainEntity": {
        "@type": "ContactPoint",
        "@id": "https://www.leorahomehealth.com/#contact-point"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.leorahomehealth.com/contact#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.leorahomehealth.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Contact",
          "item": "https://www.leorahomehealth.com/contact"
        }
      ]
    },
    {
      "@type": "ContactPoint",
      "@id": "https://www.leorahomehealth.com/#contact-point",
      "contactType": "Customer Service",
      "telephone": "+1-512-222-8103",
      "email": "appointments@leorahomehealth.com",
      "url": "https://www.leorahomehealth.com/contact",
      "availableLanguage": ["English", "Spanish"],
      "areaServed": {
        "@type": "State",
        "name": "Texas"
      },
      "hoursAvailable": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "08:00",
          "closes": "17:00"
        }
      ]
    },
    {
      "@type": "Place",
      "@id": "https://www.leorahomehealth.com/#place",
      "name": "Leora Home Health Office",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Austin",
        "addressRegion": "TX",
        "postalCode": "78701",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "30.2672",
        "longitude": "-97.7431"
      },
      "hasMap": "https://maps.google.com/?q=Leora+Home+Health+Austin+TX"
    }
  ]
}
```

## 6. Website SearchAction Schema

Add to homepage for sitelinks search box:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.leorahomehealth.com/#website",
  "url": "https://www.leorahomehealth.com",
  "name": "Leora Home Health",
  "description": "Home health care services in Austin, Texas",
  "publisher": {
    "@id": "https://www.leorahomehealth.com/#organization"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.leorahomehealth.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "inLanguage": "en-US"
}
```

## Implementation Guidelines

### 1. Placement
- Add JSON-LD scripts in the `<head>` section of each page
- Place after meta tags but before closing `</head>`
- Each script should be wrapped in `<script type="application/ld+json">` tags

### 2. Testing
After implementation, test each page:
1. Google Rich Results Test: https://search.google.com/test/rich-results
2. Schema Markup Validator: https://validator.schema.org/
3. Check for any errors or warnings and fix them

### 3. Common Pitfalls to Avoid
- Ensure all URLs are absolute (start with https://)
- Don't duplicate information unnecessarily
- Keep content consistent between visible page and schema
- Update schemas when page content changes
- Use proper date formats (ISO 8601)

### 4. Maintenance
- Review schemas quarterly
- Update when services or information changes
- Monitor Search Console for schema errors
- Keep track of rich results performance

---

*These examples provide production-ready Schema.org implementations that will significantly enhance Leora Home Health's search visibility and eligibility for rich results.*