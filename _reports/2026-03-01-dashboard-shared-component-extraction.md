---
layout: single
title: "Dashboard Shared Component Extraction: 7 New Components, 20+ Consumer Migrations"
date: 2026-03-01
author_profile: true
categories: [refactoring, frontend]
tags: [react, typescript, component-extraction, dashboard, deduplication, quality-metrics, vite]
excerpt: "Extracted 7 shared React components from duplicated JSX patterns across the quality metrics dashboard, migrating 20+ consumer sites with zero test regressions."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2026-03-01<br>
**Project**: Quality Metrics Dashboard<br>
**Focus**: Shared component extraction from duplicated JSX patterns<br>
**Session Type**: Refactoring

## Executive Summary

Completed a systematic extraction of 7 shared React components from duplicated JSX structural patterns across the quality metrics dashboard. This work was the second phase of a multi-session inline-CSS migration effort -- the previous session identified 8 extraction opportunities during utility class migration, and this session implemented all 8.

The 7 new components total 163 lines, replacing ~200 lines of duplicated inline JSX across 44 files. All 184 tests pass, TypeScript compiles cleanly, and the production build succeeds. Items 4-7 were implemented in parallel using isolated worktree agents to maximize throughput.

| Metric | Value |
|--------|-------|
| New components created | 7 |
| Files modified | 44 |
| Consumer sites migrated | 20+ |
| Tests passing | 184/184 |
| Type errors | 0 |
| Build status | Clean |
| New component LOC | 163 |

## Problem Statement

During the inline-CSS utility class migration (previous sessions), a code review identified 8 categories of duplicated JSX tree structures across components and pages. These weren't CSS-only issues -- they were repeated element hierarchies with identical class combinations, prop patterns, and inline styles that had accumulated organically as the dashboard grew from ~15 to ~40 components.

## Implementation Details

### Phase 1: High-Priority Extractions (Items 1-3)

Implemented sequentially as they shared consumer files.

**ColoredChip** (`src/components/ColoredChip.tsx:1-26`) -- Replaces the `chipBaseStyle` export + inline `backgroundColor: ${color}20` pattern used across 4 files and 7+ instances. Bakes in `display: 'inline-block'` and accepts an escape-hatch `style` prop for the one site needing `fontWeight: 500`.

**DetailPageHeader** (`src/components/DetailPageHeader.tsx:1-19`) -- Extracts the `eval-detail-header` + `eval-detail-meta` JSX tree repeated across 4 page files. Accepts `title`, optional `id` (rendered as mono-xs span), and `children` for flexible meta content (count spans, links).

**MonoTableHead** (`src/components/MonoTableHead.tsx:1-24`) -- Extracted verbatim from `SessionDetailPage.tsx:91-103` inline definition. Replaced the align ternary chain (`align === 'left' ? 'text-left' : align === 'center' ? ...`) with an `ALIGN_CLASS` const map.

### Phase 1.5: ViewSection Migration (Item 8)

`ViewSection` already existed in `Section.tsx` but 16 sites across 5 files manually wrote `<div className="view-section"><h3 className="section-heading">`. Widened the `title` prop from `string` to `ReactNode` to support one site in `App.tsx` that embeds a `<span>` inside the heading. After migration, the only remaining `section-heading` reference is inside `ViewSection` itself.

### Phase 2: Parallel Extractions (Items 4-7)

Launched 4 isolated worktree agents simultaneously:

**SectionBlock** (`src/components/SectionBlock.tsx:1-16`) -- Wraps the `mb-3` + `section-label mb-1-5` pattern. Migrated 4 sites across `EvaluationExpandedRow.tsx` (3) and `ConfidencePanel.tsx` (1). EvaluationDetailPage's similar pattern was intentionally excluded -- its `marginTop: 12` inline style makes it structurally different.

**BarIndicator** (`src/components/BarIndicator.tsx:1-50`) -- Unified the track/fill bar pattern across 4 variants: `FreqBar` (SessionDetailPage), `VarianceBar` (ConfidencePanel), mini-bars (AgentActivityPanel), and timeline bars (TurnTimeline). Reuses existing `mini-bar`/`mini-bar-fill` CSS classes. Wrappers like `FreqBar` remain intact, delegating only the bar rendering.

**EmptyCard** (`src/components/EmptyCard.tsx:1-13`) -- Wraps the `card card--empty` pattern. Migrated all 3 instances in `CompliancePage.tsx`. Other empty state patterns using different class combinations (e.g., `text-muted text-center`) were correctly excluded.

**ArrowLink** (`src/components/ArrowLink.tsx:1-15`) -- Wraps `<Link className="text-xs link-accent">Text &rarr;</Link>`. Migrated 1 exact match in `EvaluationDetailPage.tsx`. Other arrow patterns use `back-link`, `mono-xs`, or lack `text-xs link-accent` -- all correctly excluded by the agent.

## Design Decisions

**Decision**: Use `ReactNode` for `ViewSection.title` instead of keeping `string`<br>
**Rationale**: One site in App.tsx MetricDetailPage embeds a `<span>` with narrowing info inside the h3<br>
**Trade-off**: Slightly looser type, but avoids a separate prop or wrapper pattern

**Decision**: Keep `FreqBar` as a wrapper around `BarIndicator` rather than absorbing label/count into BarIndicator<br>
**Rationale**: Only 1 of 4 bar variants has flanking labels. Absorbing layout would over-generalize the component<br>
**Trade-off**: Extra wrapper layer vs. cleaner separation of concerns

**Decision**: ArrowLink only migrated 1 of 8+ `&rarr;` sites<br>
**Rationale**: Strict matching criteria -- only `text-xs link-accent` class combo qualifies. `back-link` and `mono-xs` variants serve different visual roles<br>
**Alternative**: Could broaden to accept any class combo, but that loses the purpose of the abstraction

## Testing and Verification

```
 Test Files  5 passed (5)
      Tests  184 passed (184)
   Start at  00:00:52
   Duration  1.79s

npx tsc --noEmit  # 0 errors
npm run build     # clean, 852 modules transformed
```

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/ColoredChip.tsx` | 26 | Hex-colored chip with alpha background |
| `src/components/DetailPageHeader.tsx` | 19 | Page header with id + meta slot |
| `src/components/MonoTableHead.tsx` | 24 | Typed table header with alignment map |
| `src/components/SectionBlock.tsx` | 16 | Labeled section wrapper |
| `src/components/BarIndicator.tsx` | 50 | Unified track/fill bar |
| `src/components/EmptyCard.tsx` | 13 | Empty state card wrapper |
| `src/components/ArrowLink.tsx` | 15 | Right-arrow navigation link |

## Files Modified (Key)

- `src/App.tsx` -- 8 ViewSection migrations + import
- `src/components/EvaluationExpandedRow.tsx` -- ColoredChip + SectionBlock migration, removed `chipBaseStyle` export
- `src/components/EvaluationTable.tsx` -- ColoredChip migration (2 cell renderers)
- `src/components/Section.tsx` -- ViewSection title type widened to ReactNode
- `src/pages/SessionDetailPage.tsx` -- MonoTableHead import, BarIndicator in FreqBar
- `src/pages/CompliancePage.tsx` -- ViewSection + EmptyCard migrations
- `src/pages/AgentSessionPage.tsx` -- DetailPageHeader + ViewSection
- `src/pages/TraceDetailPage.tsx` -- DetailPageHeader + ViewSection
- `src/pages/EvaluationDetailPage.tsx` -- DetailPageHeader + ArrowLink
- `src/components/AgentActivityPanel.tsx` -- BarIndicator (2 sites)
- `src/components/ConfidencePanel.tsx` -- BarIndicator + SectionBlock
- `src/components/TurnTimeline.tsx` -- BarIndicator (2 bars)

## Git Commits

- `006d241` -- `refactor(components): extract 7 shared components, migrate 20+ consumer sites`

## References

- Previous session: identified 8 extraction opportunities during inline-CSS utility class migration
- Prior commits: `0a13cbf` (gap utilities), `cfb9a5d` (uppercase/chip classes), `6e61729` (theme consolidation)
