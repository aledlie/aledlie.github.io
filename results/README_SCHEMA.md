# Fisterra Schema.org Database System

A comprehensive system for extracting, analyzing, and storing schema.org structured data from web pages, with support for both graph (Neo4j) and relational (SQL) databases.

## 🎯 Purpose

This system analyzes your Wix site and other web content to:
1. **Extract schema.org objects** from HTML pages
2. **Identify content types** (Events, People, Organizations, etc.)
3. **Generate database schemas** optimized for your content
4. **Initialize databases** with proper relationships
5. **Provide analysis reports** for data modeling decisions

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   HTML Scraper  │───▶│  Schema Analyzer │───▶│   Database Init │
│                 │    │                  │    │                 │
│ • JSON-LD       │    │ • Object Types   │    │ • SQL Tables    │
│ • Microdata     │    │ • Relationships  │    │ • Graph Nodes   │
│ • RDFa          │    │ • Field Analysis │    │ • Constraints   │
│ • Meta Tags     │    │ • Recommendations│    │ • Sample Data   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 File Structure

```
fisterra/
├── schema_models.py          # Pydantic models for schema.org objects
├── html_scraper.py           # HTML scraping and content extraction  
├── sql_db_init.py           # SQL database schema and initialization
├── graph_db_init.py         # Neo4j graph database initialization
├── main_schema_processor.py  # Main processing pipeline
├── README_SCHEMA.md         # This documentation
└── schema_results/          # Generated analysis and data
    ├── analysis_report.md
    ├── schema_analysis.json
    ├── raw_scraping_results.json
    └── pipeline_results.json
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install requests beautifulsoup4 pydantic neo4j
```

### 2. Run Demo Analysis

```bash
python main_schema_processor.py --demo --init-sql
```

This will:
- Analyze schema.org example pages
- Generate analysis report
- Initialize SQLite database with sample data

### 3. Analyze Your Site

```bash
python main_schema_processor.py --urls https://yoursite.com/events https://yoursite.com/about --init-sql
```

## 📊 Schema.org Models Supported

### Core Types
- **Person** - Artists, instructors, staff
- **Organization** - Companies, non-profits 
- **DanceGroup** - Dance companies/groups (extends Organization)
- **Place** - Venues, studios, locations

### Event Types  
- **Event** - Base event type
- **DanceEvent** - Dance classes, performances, social dances
- **MusicEvent** - Concerts, music performances
- **EducationalEvent** - Workshops, classes, training

### Content Types
- **Course** - Structured learning programs
- **CreativeWork** - Photos, videos, artwork
- **VideoObject** - Video content
- **Photograph** - Image content

### Supporting Types
- **PostalAddress** - Location addresses
- **Offer** - Pricing and availability
- **Various Enums** - Status, attendance mode, etc.

## 🗄️ Database Support

### SQL Database (SQLite/PostgreSQL)
- **Normalized schema** with proper foreign keys
- **JSON fields** for arrays and complex data
- **Relationship tables** for many-to-many connections
- **Indexes** for performance
- **Sample data** matching your content types

### Graph Database (Neo4j)  
- **Labeled nodes** for each schema.org type
- **Typed relationships** between entities
- **Property graphs** with rich metadata
- **Constraints and indexes** for data integrity
- **Cypher queries** for complex relationships

## 🔧 Configuration

### Basic Configuration

```json
{
  "scraping": {
    "delay": 1.0,
    "timeout": 30,
    "max_retries": 3
  },
  "databases": {
    "sql": {
      "enabled": true,
      "path": "fisterra_schema.db"
    },
    "neo4j": {
      "enabled": true,
      "uri": "bolt://localhost:7687",
      "user": "neo4j",
      "password": "your-password"
    }
  },
  "output_dir": "schema_results",
  "save_raw_html": false
}
```

## 🎮 Usage Examples

### Scrape Multiple Pages
```bash
python main_schema_processor.py \\
  --urls https://site.com/events https://site.com/classes https://site.com/about \\
  --init-sql --init-neo4j
```

### From URL File
```bash
# Create urls.txt with one URL per line
echo "https://site.com/events" > urls.txt
echo "https://site.com/classes" >> urls.txt

python main_schema_processor.py --urls-file urls.txt --init-sql
```

### Custom Configuration
```bash
python main_schema_processor.py \\
  --demo \\
  --config my_config.json \\
  --output-dir ./my_analysis \\
  --delay 2.0 \\
  --init-sql
```

## 📈 Analysis Output

### 1. Analysis Report (`analysis_report.md`)
- Summary of pages scraped
- Schema.org objects found
- Database recommendations
- Next steps and guidance

### 2. Detailed Analysis (`schema_analysis.json`)
```json
{
  "summary": {
    "total_pages_scraped": 5,
    "successful_scrapes": 5,
    "failed_scrapes": 0
  },
  "object_counts": {
    "Event": 3,
    "Person": 5,
    "Organization": 2
  },
  "database_recommendations": {
    "identified_types": ["Event", "Person", "Organization"],
    "required_tables": [...],
    "suggested_relationships": [...]
  }
}
```

### 3. Raw Scraping Data (`raw_scraping_results.json`)
- Complete extraction results per URL
- JSON-LD, Microdata, RDFa content
- Meta tags and semantic elements
- Identified schema objects

## 🔍 Querying Your Data

### SQL Queries
```sql
-- Find all dance events in January 2025
SELECT e.name, e.start_date, p.name as location
FROM events e 
JOIN places p ON e.location_id = p.id 
WHERE e.type = 'DanceEvent' 
  AND e.start_date >= '2025-01-01'
  AND e.start_date < '2025-02-01';

-- Get instructors and their specialties
SELECT p.name, p.dance_styles, p.instructor_level
FROM people p
WHERE JSON_EXTRACT(p.dance_styles, '$') IS NOT NULL;
```

### Neo4j Cypher Queries
```cypher
// Find all events at a specific location
MATCH (e:Event)-[:LOCATED_AT]->(p:Place {name: "Austin Dance Studio"})
RETURN e.name, e.startDate

// Get instructor networks
MATCH (instructor:Person)-[:INSTRUCTS]->(event:Event)<-[:ORGANIZES]-(org:Organization)
RETURN instructor.name, collect(event.name), org.name

// Find dance style connections
MATCH (person:Person)-[:SPECIALIZES_IN]->(style)
RETURN style, collect(person.name) as instructors
```

## 🛠️ Customization

### Adding New Schema Types

1. **Define Pydantic Model** in `schema_models.py`:
```python
class Workshop(EducationalEvent):
    type: str = Field(default="Workshop")
    workshop_materials: Optional[List[str]] = None
    hands_on_activities: Optional[bool] = None
```

2. **Update Database Schema** in `sql_db_init.py` and `graph_db_init.py`

3. **Modify Scraper Detection** in `html_scraper.py`:
```python
# Add workshop detection logic
if 'workshop' in page_text:
    identified_objects['Workshop'].append(...)
```

### Custom Field Extraction

```python
# In html_scraper.py, modify extract_semantic_elements()
def extract_custom_fields(self, html: str) -> Dict[str, Any]:
    soup = BeautifulSoup(html, 'html.parser')
    # Add your custom extraction logic
    return custom_data
```

## 🔐 Security Considerations

- **Rate Limiting**: Built-in delays between requests
- **User Agent**: Identifies as browser to avoid blocking
- **Error Handling**: Graceful failures for protected content
- **Data Sanitization**: JSON encoding prevents injection
- **Database Security**: Uses parameterized queries

## 🐛 Troubleshooting

### Common Issues

1. **Neo4j Connection Failed**
   - Ensure Neo4j is running: `systemctl start neo4j`
   - Check credentials in config
   - Verify bolt://localhost:7687 is accessible

2. **Scraping Blocked/Failed**
   - Increase delay between requests
   - Check if site has robots.txt restrictions
   - Some sites block automated requests

3. **No Schema.org Objects Found**
   - Many sites don't use structured data
   - The system can still infer objects from content
   - Check `semantic_elements` in results

4. **Database Already Exists**
   - Use `--force-recreate` flag to overwrite
   - Or manually delete the database file

### Debug Mode
```python
# Enable debug logging in your script
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🎯 Best Practices

1. **Respectful Scraping**
   - Use appropriate delays (1+ seconds)
   - Check robots.txt
   - Don't overwhelm servers

2. **Data Validation** 
   - Review extracted objects for accuracy
   - Validate relationships make sense
   - Clean data before importing

3. **Schema Evolution**
   - Start with basic schema
   - Add fields as you discover needs  
   - Use migration scripts for changes

4. **Performance**
   - Index frequently queried fields
   - Use appropriate data types
   - Consider partitioning large tables

## 📚 Resources

- [Schema.org Documentation](https://schema.org/)
- [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)
- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)

## 🤝 Contributing

This system is designed for the Fisterra dance/arts organization but can be adapted for other domains. Key extension points:

1. **Schema Models** - Add domain-specific types
2. **Scraping Logic** - Customize content detection  
3. **Database Schema** - Modify tables/relationships
4. **Analysis** - Add domain-specific insights

## 📄 License

Part of the Fisterra project. Modify and use as needed for your organization.

---

*Generated by Fisterra Schema.org Database System*