---
layout: single
title: "LLM Cost Optimization Page: From 580-Line Plan to Perfect Lighthouse Scores"
date: 2025-12-27
author_profile: true
categories: [feature-implementation, seo-optimization, accessibility]
tags: [llm-pricing, calculator, lighthouse, wcag, sitemap, cloudflare, javascript, html, css]
excerpt: "Built and launched an LLM cost calculator page achieving 100/100/100/100 Lighthouse scores after simplifying a 580-line plan to a 180-line MVP."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2025-12-27
**Project**: IntegrityStudio.ai
**Focus**: Build and launch LLM cost optimization page with calculator, achieve perfect Lighthouse scores
**Session Type**: Implementation and Optimization

## Executive Summary

Successfully launched a new LLM cost optimization page with an interactive cost calculator, pricing comparison table, optimization tips, and FAQs. Started with a heavily over-engineered 580-line implementation plan, used three reviewer personas to identify complexity issues, then created a focused 180-line MVP plan. Built the page in a single session, deployed to Cloudflare Pages, and iteratively fixed accessibility issues to achieve **100/100/100/100 Lighthouse scores**.

Also added SEO infrastructure (sitemap.xml, robots.txt) and a timely ByteDance footnote to the LLM monitoring tools article.

**Key Metrics:**
| Metric | Value |
|--------|-------|
| **Plan Reduction** | 580 → 180 lines (-69%) |
| **Page Size** | 836 lines (HTML/CSS/JS) |
| **Models Compared** | 11 LLMs |
| **Lighthouse Performance** | 100 |
| **Lighthouse Accessibility** | 100 |
| **Lighthouse Best Practices** | 100 |
| **Lighthouse SEO** | 100 |
| **Git Commits** | 6 |

## Problem Statement

Needed to create a high-value SEO content page targeting "LLM cost calculator" and related keywords. Initial plan was over-engineered with features like:
- Email capture / lead gating
- Shareable URLs with state
- OG image generation
- PDF exports
- Exit intent popups
- Automated price monitoring

**Reviewer Analysis:**
- **DHH Persona**: Called it "Architecture Astronautics" - too complex for a blog page
- **Code Simplicity Reviewer**: Found YAGNI violations, premature optimization
- **Kieran Reviewer**: 85% ready but needed technical gaps filled

**Consensus**: Cut sections 11-14, simplify to 4-6 hour MVP.

## Implementation Details

### Phase 1: MVP Plan Creation

**File**: `LLM-COST-OPTIMIZATION-MVP.md`

Reduced plan to essentials:
1. Pricing comparison table (11 models)
2. Simple cost calculator (pure JS)
3. 5 optimization tips
4. 5 FAQs with Schema.org markup
5. CTA to Integrity Studio services

### Phase 2: Page Implementation

**File**: `web/blog/llm-cost-optimization-guide.html`

#### Pricing Data Structure
```javascript
const LLM_PRICING = {
    'gpt-4o-mini': { name: 'GPT-4o mini', input: 0.15, output: 0.60 },
    'deepseek-v3': { name: 'DeepSeek V3', input: 0.27, output: 1.10 },
    'gemini-flash': { name: 'Gemini 2.5 Flash', input: 0.30, output: 2.50 },
    'claude-haiku': { name: 'Claude Haiku 4.5', input: 1.00, output: 5.00 },
    'gpt-4o': { name: 'GPT-4o', input: 2.50, output: 10.00 },
    'claude-sonnet': { name: 'Claude Sonnet 4.5', input: 3.00, output: 15.00 },
    'claude-opus': { name: 'Claude Opus 4.5', input: 5.00, output: 25.00 },
    'o1': { name: 'o1', input: 15.00, output: 60.00 }
    // ... 11 models total
};
```

#### Calculator Logic
```javascript
function calculateCost() {
    const model = LLM_PRICING[modelId];
    const inputCost = (inputTokens / 1000000) * model.input;
    const outputCost = (outputTokens / 1000000) * model.output;
    const costPerRequest = inputCost + outputCost;
    const monthlyCost = costPerRequest * requestsPerDay * 30;

    // Find cheapest alternative for comparison
    // Display savings percentage
}
```

#### Schema.org FAQPage
Implemented structured data for 5 FAQ questions targeting:
- "How much does GPT-4 cost per token?"
- "What is the cheapest LLM API in 2025?"
- "How can I reduce my OpenAI API costs?"
- "Is Claude cheaper than GPT-4?"
- "What is prompt caching?"

### Phase 3: Bug Fixes

#### CTA Button Visibility Fix
**Problem**: Button text was invisible (same color as background)
**Root Cause**: `.content a { color: var(--accent); }` had higher specificity than `.cta-button`
**Solution**: Changed selector to `.cta-box .cta-button` with explicit `color: #ffffff`

### Phase 4: Accessibility Optimization

**Before**: Lighthouse Accessibility 90
**After**: Lighthouse Accessibility 100

#### Issues Fixed:

| Issue | Fix |
|-------|-----|
| Heading order (h1→h4) | Changed h4 → h3 in tips and FAQ sections |
| Low contrast green (#10b981) | Darkened to #047857 |
| Low contrast red (#ef4444) | Darkened to #dc2626 |
| CTA button contrast | Changed background from #3b82f6 to #2563eb |
| Link distinguishability | Added underlines to source links |
| Savings badge contrast | White text on dark green background |

#### CSS Color Changes
```css
/* Before */
--success: #10b981;
--error: #ef4444;

/* After */
--success: #047857;
--error: #dc2626;
```

### Phase 5: SEO Infrastructure

#### sitemap.xml
Created sitemap with 6 URLs:
```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://integritystudio.ai/</loc></url>
  <url><loc>https://integritystudio.ai/blog/llm-cost-optimization-guide</loc></url>
  <url><loc>https://integritystudio.ai/blog/best-llm-monitoring-tools-2025</loc></url>
  <url><loc>https://integritystudio.ai/blog/end-to-end-agentic-observability-lifecycle</loc></url>
  <url><loc>https://integritystudio.ai/blog/eu-ai-act-compliance-logging-setup</loc></url>
  <url><loc>https://integritystudio.ai/blog/ai-observability-platform-strategy</loc></url>
</urlset>
```

#### robots.txt
```
User-agent: *
Allow: /

Sitemap: https://integritystudio.ai/sitemap.xml
```

### Phase 6: Content Enhancement

Added ByteDance footnote to LLM monitoring tools article:
```html
(*Or <a href="https://www.reuters.com/technology/artificial-intelligence/
bytedance-seeks-11-mln-damages-intern-ai-breach-case-report-says-2024-11-28/">
$1.1 million, if you're ByteDance</a>)
```

## Testing and Verification

### Lighthouse Results

```
═══════════════════════════════════════════
  FINAL LIGHTHOUSE SCORES
═══════════════════════════════════════════

  Performance:     100
  Accessibility:   100
  Best Practices:  100
  SEO:             100
```

### Core Web Vitals

| Metric | Value |
|--------|-------|
| LCP | 1.8 s |
| FCP | 1.0 s |
| TBT | 80 ms |
| CLS | 0 |
| SI | 1.4 s |

### Calculator Verification
Tested via Chrome DevTools MCP:
- Model selection works correctly
- Token inputs update calculations live
- Cheapest alternative comparison displays correctly
- Percentage savings calculated accurately

## Key Decisions and Trade-offs

### Decision 1: Pure JavaScript vs Framework
**Choice**: Vanilla JavaScript
**Rationale**: Simple calculator doesn't need React/Vue overhead
**Trade-off**: Less structured code, but faster load time and simpler deployment

### Decision 2: Static HTML vs Flutter Widget
**Choice**: Static HTML page in web/ directory
**Rationale**: Better SEO, faster load, easier to maintain pricing data
**Trade-off**: Not integrated with Flutter app navigation

### Decision 3: Accessibility Color Changes
**Choice**: Darken brand colors for WCAG compliance
**Rationale**: Accessibility is non-negotiable
**Trade-off**: Slightly less vibrant greens/reds, but passes all contrast checks

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `LLM-COST-OPTIMIZATION-MVP.md` | 180 | Simplified implementation plan |
| `web/blog/llm-cost-optimization-guide.html` | 850 | Main page with calculator |
| `web/sitemap.xml` | 39 | SEO sitemap |
| `web/robots.txt` | 4 | Crawler directives |

## Files Modified

| File | Changes |
|------|---------|
| `lib/config/content/resources_content.dart` | Updated blog post entry slug |
| `web/blog/best-llm-monitoring-tools-2025.html` | Added ByteDance footnote |

## Git Commits

| Commit | Description |
|--------|-------------|
| `672b237` | feat(content): add llm cost optimization page implementation plan |
| `bdca894` | feat(blog): add LLM cost optimization guide with calculator |
| `c289202` | feat(seo): add sitemap.xml with all blog pages |
| `73c21b9` | feat(seo): add robots.txt with sitemap reference |
| `2d7d6e9` | fix(a11y): achieve 100 Lighthouse accessibility score |

## Deployment

All changes deployed to Cloudflare Pages via:
```bash
npx wrangler pages deploy web --project-name=integritystudio-ai
```

Live URLs:
- Page: https://integritystudio.ai/blog/llm-cost-optimization-guide
- Sitemap: https://integritystudio.ai/sitemap.xml
- Robots: https://integritystudio.ai/robots.txt

## Next Steps

### Immediate
1. ✅ Submit to Google Search Console (pending login)

### Short-term
2. Monitor Search Console for indexing status
3. Track organic impressions for target keywords

### Medium-term (If page gets 500+ monthly visits)
4. Add caching/batching toggles to calculator
5. Add model comparison table
6. Consider email capture for PDF export

## Lessons Learned

1. **Start Simple**: The 580-line plan would have taken weeks. The 180-line MVP shipped in one session.

2. **CSS Specificity Matters**: The `.content a` rule overriding button styles was a subtle but critical bug.

3. **Accessibility from the Start**: Would have been easier to use WCAG-compliant colors initially rather than fixing afterward.

4. **Reviewer Personas Work**: Having DHH, simplicity, and Kieran perspectives quickly identified over-engineering.

## References

### Code Files
- `web/blog/llm-cost-optimization-guide.html:1-850`
- `web/sitemap.xml:1-39`
- `web/robots.txt:1-4`

### External Resources
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [Anthropic Pricing](https://www.anthropic.com/pricing)
- [Google AI Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [DeepSeek Pricing](https://api-docs.deepseek.com/quick_start/pricing)

### Tools Used
- Chrome DevTools MCP for testing
- Lighthouse CLI for auditing
- Wrangler CLI for deployment
