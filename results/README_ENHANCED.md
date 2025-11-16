# fisterra

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "fisterra",
  "description": "Directory containing 5 code files with 48 classes and 18 functions",
  "programmingLanguage": [
    {
      "@type": "ComputerLanguage",
      "name": "Python"
    }
  ],
  "featureList": [
    "48 class definitions",
    "18 function definitions"
  ]
}
</script>

## Overview

This directory contains 5 code file(s) with extracted schemas.

## Subdirectories

- `Documentation/`
- `EmotionMap/`
- `src/`
- `test-samples/`
- `tests/`

## Files and Schemas

### `html_scraper.py` (python)

**Classes:**
- `SchemaOrgScraper` - Line 21
  - Methods: __init__, fetch_page, extract_json_ld, extract_microdata, extract_rdfa (+6 more)

**Functions:**
- `main()` - Line 502

**Key Imports:** `bs4`, `datetime`, `json`, `pydantic`, `re` (+5 more)

### `main_schema_processor.py` (python)

**Classes:**
- `FisterraSchemaProcessor` - Line 18
  - Main coordinator for schema.org data processing
  - Methods: __init__, get_default_config, scrape_site_pages, analyze_schema_objects, initialize_sql_database (+3 more)

**Functions:**
- `main()` - Line 313

**Key Imports:** `argparse`, `datetime`, `graph_db_init`, `html_scraper`, `json` (+4 more)

### `run_impact_demo.py` (python)

**Functions:**
- `create_simulated_baseline_results()` - Line 15
- `create_simulated_improved_results()` - Line 80
- `run_demo_analysis()` - Line 145

**Key Imports:** `datetime`, `impact_analysis`, `json`, `pathlib`, `seo_llm_performance_test_suite` (+1 more)

### `schema_models.py` (python)

**Classes:**
- `SchemaOrgBase` (extends: BaseModel) - Line 17
  - Base class for all schema.org entities
  - Methods: to_json_ld, get_schema_properties
- `Thing` (extends: SchemaOrgBase) - Line 74
  - Schema.org Thing - base type for all entities
- `Action` (extends: SchemaOrgBase) - Line 83
  - Schema.org Action - base class for actions
- `SearchAction` (extends: Action) - Line 98
  - Schema.org SearchAction for search operations
- `CreateAction` (extends: Action) - Line 105
  - Schema.org CreateAction for content creation
- `ViewAction` (extends: Action) - Line 111
  - Schema.org ViewAction for content viewing
- `EntryPoint` (extends: BaseModel) - Line 117
  - Schema.org EntryPoint for API/action endpoints
- `SoftwareApplication` (extends: SchemaOrgBase) - Line 128
  - Schema.org SoftwareApplication
- `WebAPI` (extends: SchemaOrgBase) - Line 143
  - Schema.org WebAPI for API documentation
- `Dataset` (extends: SchemaOrgBase) - Line 152
  - Schema.org Dataset for data collections
- `DataCatalog` (extends: SchemaOrgBase) - Line 167
  - Schema.org DataCatalog for dataset collections
- `DataDownload` (extends: BaseModel) - Line 176
  - Schema.org DataDownload
- `APIReference` (extends: SchemaOrgBase) - Line 186
  - Schema.org APIReference
- `Project` (extends: SchemaOrgBase) - Line 196
  - Schema.org Project
- `SearchResultsPage` (extends: SchemaOrgBase) - Line 208
  - Schema.org SearchResultsPage
- `WebPage` (extends: CreativeWork) - Line 216
  - Schema.org WebPage
- `WebSite` (extends: CreativeWork) - Line 227
  - Schema.org WebSite
- `ImageObject` (extends: CreativeWork) - Line 235
  - Schema.org ImageObject
- `BreadcrumbList` (extends: SchemaOrgBase) - Line 246
  - Schema.org BreadcrumbList
- `ContactPoint` (extends: SchemaOrgBase) - Line 253
  - Schema.org ContactPoint
- `Review` (extends: CreativeWork) - Line 265
  - Schema.org Review
- `Rating` (extends: SchemaOrgBase) - Line 275
  - Schema.org Rating
- `GeoCoordinates` (extends: BaseModel) - Line 284
  - Schema.org GeoCoordinates
- `EventStatus` (extends: str, Enum) - Line 293
  - Event status enumeration
- `EventAttendanceMode` (extends: str, Enum) - Line 302
  - Event attendance mode enumeration
- `PostalAddress` (extends: BaseModel) - Line 309
  - Schema.org PostalAddress
- `Place` (extends: SchemaOrgBase) - Line 319
  - Schema.org Place
- `Person` (extends: SchemaOrgBase) - Line 331
  - Schema.org Person
- `Organization` (extends: SchemaOrgBase) - Line 347
  - Schema.org Organization
- `DanceGroup` (extends: Organization) - Line 363
  - Schema.org DanceGroup (subclass of Organization)
- `Offer` (extends: BaseModel) - Line 374
  - Schema.org Offer
- `Event` (extends: SchemaOrgBase) - Line 384
  - Schema.org Event base class
- `DanceEvent` (extends: Event) - Line 407
  - Schema.org DanceEvent (subclass of Event)
- `MusicEvent` (extends: Event) - Line 418
  - Schema.org MusicEvent (subclass of Event)
- `EducationalEvent` (extends: Event) - Line 427
  - Schema.org EducationalEvent (subclass of Event)
- `Course` (extends: SchemaOrgBase) - Line 438
  - Schema.org Course
- `CreativeWork` (extends: SchemaOrgBase) - Line 454
  - Schema.org CreativeWork
- `TechArticle` (extends: CreativeWork) - Line 469
  - Schema.org TechArticle for technical documentation
- `SoftwareSourceCode` (extends: CreativeWork) - Line 478
  - Schema.org SoftwareSourceCode
- `VideoObject` (extends: CreativeWork) - Line 489
  - Schema.org VideoObject (subclass of CreativeWork)
- `Photograph` (extends: CreativeWork) - Line 498
  - Schema.org Photograph (subclass of CreativeWork)
- `EventPersonRelation` (extends: BaseModel) - Line 510
  - Relationship between Events and Persons
- `OrganizationPersonRelation` (extends: BaseModel) - Line 518
  - Relationship between Organizations and Persons
- `EventOrganizationRelation` (extends: BaseModel) - Line 528
  - Relationship between Events and Organizations
- `_LazyDict` - Line 683
  - Lazy-loaded dictionary that loads data only when accessed
  - Methods: __init__, __getitem__, __iter__, get, items
- `Config` - Line 20

**Functions:**
- `get_graph_node_labels()` - Line 537
- `get_graph_relationships()` - Line 598
- `_get_cached_labels()` - Line 670
- `_get_cached_relationships()` - Line 676

**Key Imports:** `__future__`, `datetime`, `enum`, `pydantic`, `typing`

### `validate-schema.py` (python)

**Functions:**
- `load_schema_file(filepath)` - Line 13
- `validate_required_fields(schema, required_fields, schema_type)` - Line 22
- `validate_datetime_format(value, field_name)` - Line 33
- `validate_url_format(value, field_name)` - Line 40
- `validate_organization_schema(schema)` - Line 47
- `validate_event_schema(schema)` - Line 83
- `validate_course_schema(schema)` - Line 128
- `print_validation_results(filename, schema_type, errors, warnings)` - Line 156
- `main()` - Line 182

**Key Imports:** `datetime`, `json`, `pathlib`, `re`, `sys`

---
*Generated by Enhanced Schema Generator with schema.org markup*