# Blog Post Entity Analysis - Schema Enhancement

**Date:** November 11, 2025
**Purpose:** Identify entities in blog post content to enrich Schema.org structured data
**Target:** TechArticle and AnalysisNewsArticle schemas

---

## Overview

This analysis identifies technologies, tools, people, and concepts mentioned in blog posts that can be added to schema markup using the `mentions` property. Rich entity markup helps search engines understand content context and improves SEO/knowledge graph potential.

---

## Jekyll Update Post Analysis

**Post:** `_posts/2025-07-02-updating-jekyll-in-2025.markdown`
**Current Schema Type:** TechArticle
**URL:** https://www.aledlie.com/jekyll/web%20development/updating-jekyll-in-2025/

### Entities Identified

#### Software/Tools (SoftwareApplication)

1. **Jekyll** - Primary topic
   - Type: SoftwareApplication
   - URL: https://jekyllrb.com/
   - Version mentioned: 4.x
   - Role: Static site generator

2. **Ruby** - Programming language
   - Type: ComputerLanguage
   - Versions: 2.1.1 (2017), 3.x (2025)
   - URL: https://www.ruby-lang.org/

3. **Bundler** - Dependency manager
   - Type: SoftwareApplication
   - Version: 2.x
   - URL: https://bundler.io/

4. **Minimal Mistakes** - Jekyll theme
   - Type: SoftwareApplication
   - URL: https://github.com/mmistakes/minimal-mistakes
   - Role: Jekyll theme framework

5. **ImageMagick** - Image processing
   - Type: SoftwareApplication
   - URL: https://imagemagick.org/
   - Command used: `mogrify`

6. **Octopress** - Jekyll blogging framework
   - Type: SoftwareApplication
   - URL: http://octopress.org/
   - Role: Blog post generator

7. **Homebrew** - Package manager (implied)
   - Type: SoftwareApplication
   - URL: https://brew.sh/
   - Platform: macOS

8. **Xcode** - Development tools
   - Type: SoftwareApplication
   - URL: https://developer.apple.com/xcode/
   - Platform: macOS
   - Context: Required for Ruby installation

#### Operating Systems/Platforms

1. **Ubuntu** - Linux distribution
   - Type: OperatingSystem
   - Context: 2017 setup (easy)
   - URL: https://ubuntu.com/

2. **macOS** - Apple operating system
   - Type: OperatingSystem
   - Specific hardware: M1/M2 chips
   - Context: 2025 setup (difficult)
   - URL: https://www.apple.com/macos/

#### People/Authors Referenced

1. **Moncef Belyamani** - Developer/Technical writer
   - Type: Person
   - URL: https://www.moncefbelyamani.com/
   - Context: "whose instructions for debugging this manually were way more helpful..."
   - Contribution: Ruby installation guides for macOS

#### AI Tools Mentioned

1. **ChatGPT** - AI assistant
   - Type: SoftwareApplication
   - URL: https://openai.com/chatgpt
   - Context: Compared unfavorably to manual documentation

2. **Grok** - AI assistant
   - Type: SoftwareApplication
   - URL: https://grok.x.ai/
   - Context: Compared unfavorably to manual documentation

3. **Cursor** - AI code editor
   - Type: SoftwareApplication
   - URL: https://cursor.sh/
   - Context: Compared unfavorably to manual documentation

#### Build Tools/Compilers

1. **clang** - C compiler
   - Type: SoftwareApplication
   - URL: https://clang.llvm.org/
   - Context: Ruby compatibility requirement

2. **RVM** - Ruby Version Manager (implied via Moncef's article)
   - Type: SoftwareApplication
   - URL: https://rvm.io/

#### Development Concepts

1. **Git** - Version control (implied)
   - Type: SoftwareApplication
   - URL: https://git-scm.com/

---

## Wix Performance Post Analysis

**Post:** `_posts/2025-09-02-WixPerformanceImprovement.md`
**Current Schema Type:** AnalysisNewsArticle
**URL:** https://www.aledlie.com/technology/site%20performance/wix/memory%20leaks/benchmarking/analytics/testing/WixPerformanceImprovement/

### Entities Identified

#### Software Packages/Libraries

1. **inflight** - Problematic package
   - Type: SoftwareApplication
   - Version: 1.0.6
   - URL: https://www.npmjs.com/package/inflight
   - Role: Memory leak source
   - Context: Deprecated npm package causing performance issues

2. **glob** - File matching library
   - Type: SoftwareApplication
   - Versions: v7 (with inflight), v10 (without inflight)
   - URL: https://www.npmjs.com/package/glob
   - Context: Upgrade removed memory leak

3. **LRU-Cache** - Caching solution
   - Type: SoftwareApplication
   - URL: https://www.npmjs.com/package/lru-cache
   - Role: Replacement caching strategy
   - Context: Controlled memory growth

4. **node-gyp** - Native build tool
   - Type: SoftwareApplication
   - URL: https://github.com/nodejs/node-gyp
   - Context: Dependency chain introducing inflight

5. **@wix/cli** - Wix command line tool
   - Type: SoftwareApplication
   - URL: https://dev.wix.com/docs/cli
   - Context: Root dependency in chain

6. **npm** - Package manager
   - Type: SoftwareApplication
   - URL: https://www.npmjs.com/
   - Context: Installation and dependency management

#### Platforms/Services

1. **Wix** - Website platform
   - Type: SoftwareApplication / WebSite
   - URL: https://www.wix.com/
   - Context: Platform being optimized

2. **Node.js** - JavaScript runtime
   - Type: SoftwareApplication / ComputerLanguage
   - URL: https://nodejs.org/
   - Context: Execution environment

#### Performance Concepts

1. **Memory Leaks** - Technical concept
   - Type: DefinedTerm
   - Context: Core problem being solved

2. **Web Performance Optimization** - Already in "about"
   - Type: DefinedTerm
   - Context: Main topic

3. **Core Web Vitals** - Google metrics (implied)
   - Type: DefinedTerm
   - URL: https://web.dev/vitals/
   - Context: Performance measurement standards

4. **Benchmarking** - Testing methodology
   - Type: DefinedTerm
   - Context: Performance measurement approach

---

## Schema Enhancement Recommendations

### For TechArticle (Jekyll Post)

#### High Priority Additions

**Add `mentions` property with key technologies:**

```yaml
schema_mentions:
  - name: "Jekyll"
    type: "SoftwareApplication"
    url: "https://jekyllrb.com/"
  - name: "Ruby"
    type: "ComputerLanguage"
    url: "https://www.ruby-lang.org/"
  - name: "Bundler"
    type: "SoftwareApplication"
    url: "https://bundler.io/"
  - name: "Minimal Mistakes"
    type: "SoftwareApplication"
    url: "https://github.com/mmistakes/minimal-mistakes"
  - name: "macOS"
    type: "OperatingSystem"
    url: "https://www.apple.com/macos/"
```

**Add `citation` property for referenced author:**

```yaml
schema_citation:
  name: "Moncef Belyamani"
  url: "https://www.moncefbelyamani.com/how-to-install-xcode-homebrew-git-rvm-ruby-on-mac/"
```

#### Medium Priority

**Additional tools mentioned:**

```yaml
schema_mentions:
  - name: "ImageMagick"
    type: "SoftwareApplication"
    url: "https://imagemagick.org/"
  - name: "Octopress"
    type: "SoftwareApplication"
    url: "http://octopress.org/"
  - name: "Xcode"
    type: "SoftwareApplication"
    url: "https://developer.apple.com/xcode/"
  - name: "Homebrew"
    type: "SoftwareApplication"
    url: "https://brew.sh/"
```

---

### For AnalysisNewsArticle (Wix Post)

#### High Priority Additions

**Add `mentions` property with analyzed packages:**

```yaml
schema_mentions:
  - name: "inflight"
    type: "SoftwareApplication"
    url: "https://www.npmjs.com/package/inflight"
    description: "Deprecated npm package with memory leak"
  - name: "glob"
    type: "SoftwareApplication"
    url: "https://www.npmjs.com/package/glob"
  - name: "LRU-Cache"
    type: "SoftwareApplication"
    url: "https://www.npmjs.com/package/lru-cache"
  - name: "Wix"
    type: "SoftwareApplication"
    url: "https://www.wix.com/"
  - name: "Node.js"
    type: "SoftwareApplication"
    url: "https://nodejs.org/"
```

**Add more specific `about` entities:**

```yaml
schema_about:
  - name: "Web Performance Optimization"
    type: "DefinedTerm"
  - name: "Memory Leak Detection"
    type: "DefinedTerm"
  - name: "npm Package Management"
    type: "DefinedTerm"
```

#### Medium Priority

**Additional packages:**

```yaml
schema_mentions:
  - name: "@wix/cli"
    type: "SoftwareApplication"
    url: "https://dev.wix.com/docs/cli"
  - name: "node-gyp"
    type: "SoftwareApplication"
    url: "https://github.com/nodejs/node-gyp"
  - name: "npm"
    type: "SoftwareApplication"
    url: "https://www.npmjs.com/"
```

---

## Implementation Guide

### Step 1: Update Schema Templates

Modify the schema templates to support `mentions` and `citation`:

**File:** `_includes/tech-article-schema.html`

Add after line 95 (after "about" section):

```liquid
{% comment %}Mentions - technologies and tools discussed{% endcomment %}
{% if page.schema_mentions -%}
"mentions": [
  {% for mention in page.schema_mentions -%}
  {
    "@type": "{{ mention.type | default: 'SoftwareApplication' }}",
    "name": {{ mention.name | jsonify }},
    {% if mention.url -%}
    "url": {{ mention.url | jsonify }}
    {% endif -%}
    {% if mention.description -%}
    ,"description": {{ mention.description | jsonify }}
    {% endif -%}
  }{% unless forloop.last %},{% endunless %}
  {% endfor -%}
],
{% endif -%}

{% comment %}Citation - referenced sources{% endcomment %}
{% if page.schema_citation -%}
"citation": {
  "@type": "CreativeWork",
  {% if page.schema_citation.name -%}
  "author": {
    "@type": "Person",
    "name": {{ page.schema_citation.name | jsonify }}
  },
  {% endif -%}
  {% if page.schema_citation.url -%}
  "url": {{ page.schema_citation.url | jsonify }}
  {% endif -%}
},
{% endif -%}
```

**File:** `_includes/analysis-article-schema.html`

Add similar `mentions` block after line 96 (after "backstory" section).

### Step 2: Update Blog Post Front Matter

**Jekyll Post:** Add to `_posts/2025-07-02-updating-jekyll-in-2025.markdown`:

```yaml
schema_mentions:
  - name: "Jekyll"
    type: "SoftwareApplication"
    url: "https://jekyllrb.com/"
  - name: "Ruby"
    type: "ComputerLanguage"
    url: "https://www.ruby-lang.org/"
  - name: "Bundler"
    type: "SoftwareApplication"
    url: "https://bundler.io/"
  - name: "Minimal Mistakes"
    type: "SoftwareApplication"
    url: "https://github.com/mmistakes/minimal-mistakes"

schema_citation:
  name: "Moncef Belyamani"
  url: "https://www.moncefbelyamani.com/how-to-install-xcode-homebrew-git-rvm-ruby-on-mac/"
```

**Wix Post:** Add to `_posts/2025-09-02-WixPerformanceImprovement.md`:

```yaml
schema_mentions:
  - name: "inflight"
    type: "SoftwareApplication"
    url: "https://www.npmjs.com/package/inflight"
  - name: "glob"
    type: "SoftwareApplication"
    url: "https://www.npmjs.com/package/glob"
  - name: "LRU-Cache"
    type: "SoftwareApplication"
    url: "https://www.npmjs.com/package/lru-cache"
  - name: "Wix"
    type: "SoftwareApplication"
    url: "https://www.wix.com/"
  - name: "Node.js"
    type: "SoftwareApplication"
    url: "https://nodejs.org/"
```

### Step 3: Test and Validate

```bash
# Build site
RUBYOPT="-W0" bundle exec jekyll build

# Check generated schemas
grep -A 200 '"mentions"' "_site/jekyll/web development/updating-jekyll-in-2025/index.html"

# Validate JSON-LD syntax
# Copy schema from page source to https://json-ld.org/playground/
```

### Step 4: Deploy and Monitor

After deployment, verify in:
- Google Rich Results Test
- Schema.org Validator
- Search Console Structured Data Report

---

## SEO Benefits of Entity-Rich Schemas

### Knowledge Graph Integration

**Entity mentions help:**
1. **Disambiguate topics** - "Jekyll" the software vs. other meanings
2. **Connect to known entities** - Links to official software URLs
3. **Build topic authority** - Shows comprehensive coverage
4. **Enable entity relationships** - Technologies used together

### Search Result Enhancements

**Potential improvements:**
1. **Rich snippets** - "Technologies mentioned" sections
2. **Knowledge panels** - Entity cards in search results
3. **Related searches** - Better topic understanding
4. **Featured snippets** - Technical how-to boxes

### Voice Search Optimization

**Entity markup improves:**
- Natural language query matching
- "What is [technology]?" answers
- "How to use [tool]?" responses
- Multi-entity query understanding

---

## Schema.org Property Reference

### mentions Property

**From Schema.org:**
- **Expected Type:** Thing
- **Description:** "Indicates that the CreativeWork contains a reference to, but is not necessarily about a concept."
- **Use Case:** List all technologies, tools, people, or concepts referenced in content

### citation Property

**From Schema.org:**
- **Expected Type:** CreativeWork or Text
- **Description:** "A citation or reference to another creative work, such as another publication, web page, scholarly article, etc."
- **Use Case:** Credit sources, reference documentation, cite expert articles

### about Property (already using)

**Comparison:**
- `about` = Main subject of the article
- `mentions` = Things referenced but not the primary focus
- `citation` = Sources credited/referenced

---

## Priority Implementation Order

### Phase 1: High Priority (Do First)
1. ✅ Update `tech-article-schema.html` with mentions/citation support
2. ✅ Update `analysis-article-schema.html` with mentions support
3. ✅ Add 3-5 key mentions to Jekyll post
4. ✅ Add 3-5 key mentions to Wix post
5. ✅ Test locally and validate

### Phase 2: Medium Priority (Optional)
1. Add citation to Jekyll post (Moncef reference)
2. Add additional tool mentions (ImageMagick, Homebrew, etc.)
3. Expand about entities in Wix post
4. Add operating system mentions

### Phase 3: Future Posts
1. Create standard entity list for common technologies
2. Build reusable schema mention templates
3. Document entity selection guidelines
4. Track entity recognition in Search Console

---

## Success Metrics

**Week 1:**
- [ ] Schemas validate with no errors
- [ ] Mentions appear in JSON-LD output
- [ ] Entity URLs resolve correctly

**Month 1:**
- [ ] Google detects entity mentions
- [ ] No structured data errors in Search Console
- [ ] Entity markup appears in Rich Results Test

**Month 3:**
- [ ] Entity-related searches show improved rankings
- [ ] Knowledge graph connections established
- [ ] Rich results include entity information

---

**Generated:** November 11, 2025
**Next Action:** Implement Phase 1 - Add mentions to schema templates and blog posts
**Estimated Time:** 30-45 minutes for complete implementation
