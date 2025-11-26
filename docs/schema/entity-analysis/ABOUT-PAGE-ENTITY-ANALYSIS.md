# About Page Entity Analysis - Schema Enhancement

**Date:** November 11, 2025
**Purpose:** Identify people, authors, philosophers, and colleagues mentioned in about_me page
**Target:** AboutPage schema enhancement with entity mentions

---

## Overview

The about_me page is deeply personal, referencing influential authors, philosophers, mentors, and friends who have shaped the author's worldview. Adding these as entity mentions creates:
- Rich semantic context for search engines
- Knowledge graph connections to influential thinkers
- Attribution and recognition of intellectual influences
- Enhanced E-A-T (Expertise, Authoritativeness, Trustworthiness) signals

---

## Entity Analysis: about_me/index.md

### Literary & Creative Influences

#### 1. **Tim Kreider** - Writer/Cartoonist
- **Type:** Person
- **URL:** https://timkreider.com/ (if available) or Wikipedia
- **Notable Work:** "We Learn Nothing" (essays)
- **Context:** Teaches empathy through cynicism, "messy work of understanding"
- **Profession:** Writer, Essayist, Cartoonist
- **Schema Type:** Person
- **Known For:** Essay collections, New York Times columns

#### 2. **Neil Gaiman** - Author
- **Type:** Person
- **URL:** https://www.neilgaiman.com/
- **Notable Works:** The Sandman, American Gods, Coraline
- **Context:** Worlds of shadow and wonder, Delirium/Delight, fairy tales
- **Profession:** Author, Screenwriter
- **Schema Type:** Person
- **Awards:** Hugo, Nebula, Bram Stoker Awards

#### 3. **Michael Lewis** - Author/Journalist
- **Type:** Person
- **URL:** https://www.michaellewis.com/ or Wikipedia
- **Notable Works:** The Big Short, Moneyball, Flash Boys
- **Context:** Smuggling intellectual masterpieces into compelling narratives
- **Profession:** Financial Journalist, Author
- **Schema Type:** Person
- **Known For:** Narrative non-fiction about finance and sports

#### 4. **George R.R. Martin** - Author
- **Type:** Person
- **URL:** https://georgerrmartin.com/
- **Notable Works:** A Song of Ice and Fire (Game of Thrones series)
- **Context:** Fantasy worldbuilding, "Power is a trick"
- **Profession:** Author, Screenwriter
- **Schema Type:** Person
- **Known For:** Epic fantasy literature

---

### Philosophical Influences

#### 5. **Martha Nussbaum** - Philosopher
- **Type:** Person
- **URL:** https://philosophy.uchicago.edu/faculty/nussbaum
- **Affiliation:** University of Chicago
- **Context:** Ethics, human capabilities, emotional intelligence in philosophy
- **Profession:** Philosopher, Professor
- **Schema Type:** Person
- **Field:** Philosophy, Political Theory, Ethics
- **Known For:** Capabilities approach, emotional cognition

#### 6. **Amartya Sen** - Economist/Philosopher
- **Type:** Person
- **URL:** https://en.wikipedia.org/wiki/Amartya_Sen
- **Affiliation:** Harvard University
- **Context:** Capability approach, welfare economics, justice
- **Profession:** Economist, Philosopher
- **Schema Type:** Person
- **Awards:** Nobel Memorial Prize in Economic Sciences (1998)
- **Known For:** Development economics, social choice theory

#### 7. **Hannah Arendt** - Political Theorist/Philosopher
- **Type:** Person
- **URL:** https://en.wikipedia.org/wiki/Hannah_Arendt
- **Context:** "Storytelling reveals meaning", political theory, totalitarianism
- **Profession:** Political Theorist, Philosopher
- **Schema Type:** Person
- **Notable Works:** "The Origins of Totalitarianism", "The Human Condition"
- **Known For:** Political philosophy, concept of "banality of evil"

#### 8. **John Rawls** - Philosopher
- **Type:** Person
- **URL:** https://en.wikipedia.org/wiki/John_Rawls
- **Context:** Theory of justice, "veil of ignorance", fairness
- **Profession:** Philosopher
- **Schema Type:** Person
- **Notable Work:** "A Theory of Justice"
- **Known For:** Justice as fairness, political liberalism

---

### Professional Mentors & Colleagues

**Note:** These are personal references without public URLs. They should be included as Person entities but without URLs, or URLs can be omitted.

#### Mentors

9. **Brian Day** - Mentor
   - **Type:** Person
   - **Context:** Generosity, mentorship, effectiveness
   - **Role:** Professional mentor

10. **Phillip Jones** - Mentor
    - **Type:** Person
    - **Context:** Genuine care, mentorship
    - **Role:** Professional mentor

11. **Suba Vasudevan** - Mentor
    - **Type:** Person
    - **Context:** Career guidance, mentorship
    - **Role:** Professional mentor

12. **Julie Hardwick** - Mentor
    - **Type:** Person
    - **Context:** Mentorship, professional guidance
    - **Role:** Professional mentor

#### Brilliant Friends & Colleagues

13. **Eric Wright** - Friend/Colleague
    - **Type:** Person
    - **Context:** Brilliance, clear thinking
    - **Role:** Friend, intellectual influence

14. **Eric Rowe** - Friend/Colleague
    - **Type:** Person
    - **Context:** Intelligence, late-night discussions
    - **Role:** Friend, intellectual influence

15. **Upasana Kaul** - Friend/Colleague
    - **Type:** Person
    - **Context:** Brilliance, critical thinking
    - **Role:** Friend, intellectual influence

16. **Chandra Shrivastava** - Friend/Colleague
    - **Type:** Person
    - **Context:** Intelligence, technical discussions
    - **Role:** Friend, intellectual influence

17. **Teresa Asma** - Friend/Colleague
    - **Type:** Person
    - **Context:** Brilliance, documentary marathons
    - **Role:** Friend, intellectual influence

18. **Sukrit Silas** - Friend/Colleague
    - **Type:** Person
    - **Context:** Intelligence, nerdy conversations
    - **Role:** Friend, intellectual influence

19. **Diana Chang** - Friend/Colleague
    - **Type:** Person
    - **Context:** Brilliance, intellectual discussions
    - **Role:** Friend, intellectual influence

#### Special Tribute

20. **Sumedh Joshi** - Friend/Colleague (Deceased)
    - **Type:** Person
    - **URL:** https://www.sumedhmjoshi.com/ (memorial site)
    - **Context:** Humor, dissertation in 3 days, profound influence
    - **Role:** Friend, inspiration for blog
    - **Notable:** The entire PersonalSite blog is an homage to Sumedh's blog (2013-2014)

---

## Schema Enhancement Strategy

### Approach: Tiered Entity Mentions

Given the deeply personal nature and the mix of public figures and private individuals, we'll use a tiered approach:

**Tier 1: Public Intellectual Figures** (Full entities with URLs)
- Authors: Tim Kreider, Neil Gaiman, Michael Lewis, George R.R. Martin
- Philosophers: Martha Nussbaum, Amartya Sen, Hannah Arendt, John Rawls
- Special: Sumedh Joshi (memorial site)

**Tier 2: Professional Mentors** (Names only, no URLs for privacy)
- Brian Day, Phillip Jones, Suba Vasudevan, Julie Hardwick

**Tier 3: Friends & Colleagues** (Optional, could omit for privacy)
- Consider listing generically or not at all to respect privacy

---

## Schema Properties to Use

### 1. `mentions` Property

**From Schema.org:**
- Expected Type: Thing (Person, CreativeWork, etc.)
- Description: "Indicates that the CreativeWork contains a reference to, but is not necessarily about"
- Use Case: List influential authors and thinkers referenced

### 2. `knowsAbout` Property (for Person entity in AboutPage)

**From Schema.org:**
- Expected Type: Text, Thing, or URL
- Description: "Of a Person, and less typically of an Organization, to indicate a topic that is known about"
- Use Case: Areas of knowledge/expertise (Philosophy, Economics, Literature, etc.)

### 3. `citation` Property

**From Schema.org:**
- Expected Type: CreativeWork or Text
- Description: "A citation or reference to another creative work"
- Use Case: Reference specific books/works quoted

---

## Implementation Plan

### High Priority: Public Figures

Add to AboutPage schema:

```yaml
schema_mentions:
  # Literary Influences
  - name: "Tim Kreider"
    type: "Person"
    url: "https://timkreider.com/"
    sameAs: "https://en.wikipedia.org/wiki/Tim_Kreider"

  - name: "Neil Gaiman"
    type: "Person"
    url: "https://www.neilgaiman.com/"
    sameAs: "https://en.wikipedia.org/wiki/Neil_Gaiman"

  - name: "Michael Lewis"
    type: "Person"
    url: "https://michaellewiswrites.com/"
    sameAs: "https://en.wikipedia.org/wiki/Michael_Lewis"

  - name: "George R.R. Martin"
    type: "Person"
    url: "https://georgerrmartin.com/"
    sameAs: "https://en.wikipedia.org/wiki/George_R._R._Martin"

  # Philosophical Influences
  - name: "Martha Nussbaum"
    type: "Person"
    sameAs: "https://en.wikipedia.org/wiki/Martha_Nussbaum"
    affiliation: "University of Chicago"

  - name: "Amartya Sen"
    type: "Person"
    sameAs: "https://en.wikipedia.org/wiki/Amartya_Sen"
    affiliation: "Harvard University"

  - name: "Hannah Arendt"
    type: "Person"
    sameAs: "https://en.wikipedia.org/wiki/Hannah_Arendt"

  - name: "John Rawls"
    type: "Person"
    sameAs: "https://en.wikipedia.org/wiki/John_Rawls"

  # Special Tribute
  - name: "Sumedh Joshi"
    type: "Person"
    url: "https://www.sumedhmjoshi.com/"
    description: "Friend and inspiration for this blog"
```

### Medium Priority: Professional Mentors

```yaml
# Optional - for privacy, these can be names only without URLs
schema_mentions_professional:
  - name: "Brian Day"
    type: "Person"
    jobTitle: "Mentor"

  - name: "Phillip Jones"
    type: "Person"
    jobTitle: "Mentor"

  - name: "Suba Vasudevan"
    type: "Person"
    jobTitle: "Mentor"

  - name: "Julie Hardwick"
    type: "Person"
    jobTitle: "Mentor"
```

### Add `knowsAbout` to Person Entity

For the main Person entity in AboutPage, add areas of knowledge:

```yaml
schema_knows_about:
  - "Philosophy"
  - "Ethics"
  - "Political Theory"
  - "Literature"
  - "Creative Writing"
  - "Software Development"
  - "Web Performance Optimization"
```

---

## Template Update Required

### File: `_includes/about-page-schema.html`

Add after the `worksFor` property (around line 52):

```liquid
{% if page.schema_mentions -%}
,"mentions": [
  {% for mention in page.schema_mentions -%}
  {
    "@type": "{{ mention.type | default: 'Person' }}",
    "name": {{ mention.name | jsonify }}
    {% if mention.url -%}
    ,"url": {{ mention.url | jsonify }}
    {% endif -%}
    {% if mention.sameAs -%}
    ,"sameAs": {{ mention.sameAs | jsonify }}
    {% endif -%}
    {% if mention.affiliation -%}
    ,"affiliation": {
      "@type": "Organization",
      "name": {{ mention.affiliation | jsonify }}
    }
    {% endif -%}
    {% if mention.jobTitle -%}
    ,"jobTitle": {{ mention.jobTitle | jsonify }}
    {% endif -%}
    {% if mention.description -%}
    ,"description": {{ mention.description | jsonify }}
    {% endif -%}
  }{% unless forloop.last %},{% endunless %}
  {% endfor -%}
]
{% endif -%}

{% if page.schema_knows_about -%}
,"knowsAbout": [
  {% for topic in page.schema_knows_about -%}
  {{ topic | jsonify }}{% unless forloop.last %},{% endunless %}
  {% endfor -%}
]
{% endif -%}
```

---

## SEO Benefits

### Knowledge Graph Connections

**Entity mentions create connections to:**
- Famous authors (Neil Gaiman, George R.R. Martin)
- Nobel laureates (Amartya Sen)
- Renowned philosophers (Martha Nussbaum, John Rawls, Hannah Arendt)
- Best-selling authors (Michael Lewis)

### E-A-T Signals (Expertise, Authoritativeness, Trustworthiness)

**Demonstrates:**
- Wide-ranging intellectual influences
- Engagement with serious academic philosophy
- Literary and creative depth
- Professional network of mentors
- Attribution of influences (shows integrity)

### Rich Snippet Potential

**Could enable:**
- "Influenced by" sections in knowledge panels
- "Related people" in search results
- Enhanced author information
- Topic expertise signals

### Semantic Context

**Helps search engines understand:**
- Areas of expertise and knowledge
- Intellectual background
- Professional relationships
- Content themes (philosophy, literature, ethics)

---

## Privacy Considerations

### Public vs. Private Entities

**Include with full details:**
- ✅ Public figures (authors, philosophers with Wikipedia pages)
- ✅ Deceased individuals with memorial sites (Sumedh Joshi)
- ✅ Organizations already mentioned publicly

**Handle carefully:**
- ⚠️ Professional mentors - Name only, no URLs (respect privacy)
- ⚠️ Friends/colleagues - Consider omitting or generic references
- ⚠️ Family - Already mentioned generically ("three brothers", "mother") - keep generic

### Recommendation

**Tier 1 (Implement):** Public intellectual figures (8 people)
**Tier 2 (Optional):** Professional mentors with names only (4 people)
**Tier 3 (Omit):** Personal friends/family for privacy

---

## Expected Schema Output

### Example for Neil Gaiman

```json
{
  "@type": "Person",
  "name": "Neil Gaiman",
  "url": "https://www.neilgaiman.com/",
  "sameAs": "https://en.wikipedia.org/wiki/Neil_Gaiman"
}
```

### Example for Martha Nussbaum

```json
{
  "@type": "Person",
  "name": "Martha Nussbaum",
  "sameAs": "https://en.wikipedia.org/wiki/Martha_Nussbaum",
  "affiliation": {
    "@type": "Organization",
    "name": "University of Chicago"
  }
}
```

### Example for Sumedh Joshi

```json
{
  "@type": "Person",
  "name": "Sumedh Joshi",
  "url": "https://www.sumedhmjoshi.com/",
  "description": "Friend and inspiration for this blog"
}
```

---

## Timeline & Validation

### Implementation Timeline

**Phase 1: High Priority (Today)**
- Update `about-page-schema.html` template
- Add 8-9 public figure mentions to about_me page
- Add `knowsAbout` topics
- Test locally

**Phase 2: Validation (After deployment)**
- Google Rich Results Test
- Schema.org Validator
- Search Console monitoring

**Phase 3: Monitor (Weeks 1-4)**
- Check entity detection in Search Console
- Monitor knowledge graph connections
- Track "People also search for" improvements

### Success Metrics

**Week 1:**
- Schemas validate with no errors
- All entity mentions appear in JSON-LD
- Entity URLs resolve correctly

**Month 1:**
- Google detects entity connections
- AboutPage appears in knowledge graph
- Related people suggestions improve

**Month 3:**
- Rich results may include "Influenced by" data
- Search visibility for author/philosopher names
- Enhanced E-A-T signals recognized

---

## Schema.org Properties Reference

### AboutPage

**From Schema.org:**
- Type: WebPage
- Description: "Web page type: About page."
- Properties: All WebPage properties plus specific to subject matter

### mentions (already using)

**From Schema.org:**
- Expected Type: Thing
- Description: "Indicates that the CreativeWork contains a reference to, but is not necessarily about"
- Perfect for: List of influential people referenced

### knowsAbout

**From Schema.org:**
- Expected Type: Text, Thing, or URL
- Description: "Of a Person, to indicate a topic that is known about"
- Perfect for: Areas of expertise and knowledge domains

---

## Notes

### Why This Matters

The about_me page is deeply personal and represents intellectual influences. Adding structured data:
1. **Honors the people mentioned** - Creates semantic connections to their work
2. **Shows intellectual depth** - Demonstrates engagement with serious ideas
3. **Builds authority** - Being "influenced by" renowned thinkers adds credibility
4. **Creates discovery paths** - People searching for these authors may discover your work

### Special Note: Sumedh Joshi

The memorial to Sumedh is particularly meaningful. Including him as an entity:
- Honors his memory in a structured, permanent way
- Links to his memorial blog
- Explains the inspiration for your blog
- Creates a lasting semantic connection

This is beautiful use of Schema.org for remembrance and tribute.

---

**Generated:** November 11, 2025
**Next Action:** Implement Tier 1 public figure mentions
**Estimated Time:** 30 minutes for full implementation
