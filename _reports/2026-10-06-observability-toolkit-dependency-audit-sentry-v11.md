---
layout: single
title: "Dependency Audit, Toolchain Upgrades and a Sentry v11 Privacy Default Caught Before Deploy"
date: 2026-10-06
author_profile: true
categories: [dependency-management, security, observability]
tags: [npm-audit, sentry, cloudflare-workers, vitest, opentelemetry, pii, npm-overrides, mutation-testing]
excerpt: "An npm audit fix that fixed nothing led to 13 commits across five packages: overrides for unpatchable transitive advisories, vitest 5, OpenTelemetry 0.223, and a Sentry v11 upgrade whose new defaults would have sent request bodies, emails included, to Sentry."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/observability-toolkit-dependency-audit-sentry-v11/
---

**Session Date**: 2026-10-06<br>
**Project**: observability-toolkit (MCP server + Cloudflare Workers)<br>
**Focus**: Dependency audit, minor/major upgrades, Sentry v11 data-collection hardening<br>
**Session Type**: Maintenance and Security Hardening

## Executive Summary

The session started with `npm audit fix`, which reported "up to date" and fixed none of the 7 high-severity findings in the root package. Neither advisory could be fixed by a normal bump. `braces` has no patched release at all, and the patched `sharp` 0.35.5 was blocked by `miniflare` pinning exactly 0.35.4. An `overrides` entry fixed `sharp`. `braces` reaches only the `repomix` devDependency, so the CI publish audit now covers production dependencies only (`--omit=dev`). That audit had been blocking every npm publish.

From there the session upgraded the root toolchain: nine OpenTelemetry experimental packages went from 0.222 to 0.223, and vitest went from 4 to 5. It also bumped in-range dependencies in four service packages and added `sharp`/`undici` overrides to the three Worker services. Every service now reports **0 audit vulnerabilities**. `@cloudflare/vitest-pool-workers` still accepts only `vitest ^4.1.0` (its latest is 0.22.0), so the Worker services stay on vitest 4.

The most important finding came from the `@sentry/cloudflare` 10 → 11 upgrade. It type-checked and every test passed with no code changes. A probe against the real SDK showed why that wasn't enough: under v11 defaults, a failing `POST` sent its JSON body to Sentry verbatim, email address included. Both Workers now pass an explicit restrictive `dataCollection`, and new real-SDK tests verify it. A mutation check confirmed the tests fail if the setting is removed. A reviewer pass found the first version of the secret scan could not fail, and the fix is recorded below.

## Key Metrics

| Metric | Value |
|--------|-------|
| Commits | 13 (plus 1 submodule pointer commit from another session) |
| Packages touched | 5 (root, obtool-api, obtool-ingest, api-provisioning-receiver, e2e) |
| Root high-severity audit findings | 7 → 4 (production-only: 0) |
| Service audit findings (3 Workers) | 5 high each → 0 |
| Root vitest suite | 137 files, 4,833 passed, 4 skipped |
| Service suites (`test:services`) | 6 runs, all green (receiver 352 tests, ingest 264) |
| Root coverage (vitest 5) | 90.44% lines, 89.82% statements, 92.14% functions, 81.84% branches |
| New source/test lines (Sentry work) | 245 across 5 files |
| Diff over session | 20 files, +2,576 / −3,981 (mostly lockfiles) |

## Problem Statement

`npm audit fix` exits successfully even when it changes nothing, and `npm audit` labelled the `braces` chain "fix available via `npm audit fix`" even though no fixed version exists. The publish workflow ran `npm audit --audit-level=high`, so this dev-only advisory blocked publishing.

Separately, several dependency families had drifted: OpenTelemetry experimental packages, vitest (a major behind), Hono, Wrangler, drizzle, Zod, Sentry and Cloudflare types across the services. Two traps were known from project notes: these are **not npm workspaces**, so each package needs its own bump, and **lockfiles are tracked**, so the installed version can differ from what `package.json` declares.

The Sentry upgrade carried a hidden risk. v11 replaced `sendDefaultPii` with `dataCollection`, and the new default is permissive. Neither Worker set either option, and the provisioning receiver handles Auth0 tokens and HMAC-signed provisioning payloads.

## Implementation Details

### 1. Audit triage: what `npm audit fix` could not reach

| Advisory | Path | Why no plain fix | Resolution |
|---|---|---|---|
| `braces` GHSA-vfj7-8cjw-p6xm | `repomix → globby → micromatch → braces@3.0.3` | 3.0.3 is the newest release (2024-05-21); latest `globby` 16.2.4 still requires `micromatch` | Accepted; dev-only. Publish audit uses `--omit=dev` |
| `sharp` GHSA-wq5f-xc86-pv6w | `wrangler → miniflare → sharp@0.35.4` | miniflare pins exactly 0.35.4; `--force` would downgrade wrangler to 4.15.2 | `"overrides": { "sharp": "^0.35.5" }` |
| `undici` (10 advisories) | `vitest-pool-workers@0.22.0 → miniflare@5.20260815 → undici@7.29.0` | pool-workers bundles an older miniflare; `--force` would downgrade it to 0.8.30 | `"overrides": { "undici": "^7.29.1" }` |

The publish workflow change, `.github/workflows/publish.yml`:

```yaml
      # Production deps only: the tarball ships no devDependencies, and braces
      # (GHSA-vfj7-8cjw-p6xm, via repomix) has no patched release
      - name: Audit dependencies
        run: npm audit --audit-level=high --omit=dev
```

**Decision: accept `braces` rather than remove `repomix` or override with a fork**
- **Choice**: Keep `repomix` as a devDependency; restrict the gating audit to production deps.
- **Rationale**: `npm audit --omit=dev` reports 0 vulnerabilities, the npm package ships only `dist/` and README, and the DoS needs attacker-controlled glob patterns, while repomix only sees the repo's own config.
- **Alternatives considered**: (a) call a pinned `npx repomix@1.18.1` and drop the devDependency, which clears the report but adds a download per run; (b) override `braces` with a third-party fork, which adds an unreviewed package to the supply chain to fix a dev-only DoS.
- **Trade-off**: A plain `npm audit` in the root still shows 4–5 high findings.

### 2. Toolchain upgrades

- **OpenTelemetry**: nine `@opentelemetry/*` experimental packages moved from `^0.222.0` to `^0.223.0` together, pulling `@opentelemetry/core@2.12.0`. They are pre-1.0, so each minor version is treated as potentially breaking and they move as a set.
- **vitest 5** (root only): `vitest` and `@vitest/coverage-v8` went to `^5.0.3`. Peer requirements were checked first: vite 6–8 and Node `^22.12 || ^24 || >=26`.
- **Services**: `npm update --save` in four packages, so declared ranges now match what's installed. `@cloudflare/vitest-pool-workers` moved from `^0.20.3` to `^0.22.0`; for a 0.x package that is outside the caret range and needs an explicit range change.

**Decision: services stay on vitest 4.** `@cloudflare/vitest-pool-workers@0.22.0` (published 2026-09-18, the only dist-tag) declares `vitest ^4.1.0`, `@vitest/runner ^4.1.0` and `@vitest/snapshot ^4.1.0`. vitest 5.0.0 shipped on 2026-09-03, so that release came after it and still kept the 4.x range. The root and the services can differ because they are not workspaces.

### 3. Sentry v11: measuring the default before trusting it

The trial upgrade was clean: `tsc --noEmit` passed and all tests passed in both Workers. The services only use `withSentry`, `captureEvent`, `captureException` and three types. But every existing suite mocks `@sentry/cloudflare`, so the tests could not reveal what the real SDK sends.

A probe wrapped a throwing handler in the real `withSentry` with a recording transport and sent a `POST` with a cookie, `authorization`, `x-session-data`, a `?token=` query and a JSON body. The `request` field of the captured event:

```text
DEFAULT    {"headers": {"authorization": "[Filtered]", "content-type": "application/json",
            "cookie": "[Filtered]", "x-session-data": "[Filtered]"}, "method": "POST",
            "url": "https://x.test/inbox?token=[Filtered]", "cookies": {"sid": "[Filtered]"},
            "query_string": "token=[Filtered]", "data": "{\"email\":\"a@b.c\"}"}
RESTRICTED {"method": "POST", "url": "https://x.test/inbox"}
```

Header and cookie values were filtered by name, but the **body went through verbatim**. The fix is one shared constant, `services/shared/sentry-data-collection.ts:16-30`:

```typescript
export const SENTRY_DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
  graphQL: { document: false, variables: false },
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  stackFrameVariables: false,
  // Source lines around each frame: not personal data, but of little use against a
  // bundled Worker, so none are sent.
  frameContextLines: 0,
};
```

It is a plain object, not typed as `DataCollection`, because `services/shared/` deliberately has no npm dependencies. Each call site type-checks it through `Sentry.CloudflareOptions`. The `withSentry` options moved out of each `index.ts` into `services/obtool-ingest/src/sentry-options.ts` and `services/api-provisioning-receiver/src/sentry-options.ts`, so tests can exercise the exact production options. The receiver keeps its existing `beforeSend: scrubRequestBody` as a second layer.

**Decision: one commit for upgrade + config.** The commit helper splits changes into source/config/docs groups, which would have landed the version bump without the setting that makes it safe. Commit `92bbd439` was made by hand to keep them together.

### 4. Testing a privacy setting so the test can actually fail

Each service has a test that runs the real SDK. In the receiver, `setup.ts` mocks Sentry globally, so the test loads it with `vi.importActual`. The handler makes an outgoing `fetch` (stubbed) with a secret query, then throws. The assertions, from `services/obtool-ingest/src/__tests__/sentry-options.test.ts:77-87`:

```typescript
expect(events).toHaveLength(1);
const [event] = events;
expect(event?.request).toEqual({ method: HTTP_METHOD_POST, url: REQUEST_URL });
expect(event?.user).toBeUndefined();
// The outgoing fetch must have produced a breadcrumb, or the secret scan below
// would pass without ever seeing one.
expect(event?.breadcrumbs?.map((b) => b.category)).toContain(FETCH_BREADCRUMB_CATEGORY);
const serialized = JSON.stringify(event);
for (const secret of SECRETS) expect(serialized).not.toContain(secret);
```

Two rounds of mutation checks:

| Mutant | Assertion that caught it | Result |
|---|---|---|
| `dataCollection` removed | `request` `toEqual` (headers + body present) | Fails, as intended |
| `urlQueryParams: true`, `request` assertion removed, query key `token=` | none | **Passes: the scan could not fail** |
| same, query key `lookup=` | whole-event secret scan | Fails, as intended |

The second row is the notable one. The SDK filters key-like parameter names (`token`, `key`, …) on its own, so a `token=` secret stays hidden even with query collection on. The scan looked meaningful but could never fail. The tests now use `lookup=`, with a comment explaining why. This followed a code-reviewer pass that flagged the original tests checked only `request` and `user`, so a leak through breadcrumbs or contexts would have gone unnoticed.

## Testing and Verification

Root, after the vitest 5 upgrade (`npm test`, exit 0):

```text
 Test Files  137 passed (137)
      Tests  4833 passed | 4 skipped (4837)
```

Root coverage (`npm run test:coverage`):

```text
Statements   : 89.82% ( 8111/9030 )
Branches     : 81.84% ( 4392/5366 )
Functions    : 92.14% ( 1407/1527 )
Lines        : 90.44% ( 7420/8204 )
```

The first coverage run exited 1 with no error found; two reruns exited 0, and all four metrics exceed the configured thresholds (79/78/81/68). Treat it as a possible flake.

Services after the Sentry work (`npm run test:services`, exit 0):

```text
 Test Files  18 passed (18)   # api-provisioning-receiver, 352 tests
 Test Files  3 passed (3)
 Test Files  2 passed (2)
 Test Files  10 passed (10)   # obtool-ingest, 264 tests
 Test Files  2 passed (2)
 Test Files  1 passed (1)
```

Also verified: `tsc --noEmit` in both Workers and in `services/shared`, root `npm run lint` (exit 0), the receiver build, and `npm audit` with 0 vulnerabilities in obtool-api, obtool-ingest and api-provisioning-receiver. The `services/e2e` suite was not run because it targets deployed dev infrastructure; only its type check ran.

## Commits

| Hash | Message |
|---|---|
| `01846b4f` | chore: override sharp to 0.35.5 for GHSA-wq5f-xc86-pv6w |
| `3f96e27f` | chore: bump OpenTelemetry experimental packages to 0.223.0 |
| `4a252fa5` | chore: upgrade vitest and @vitest/coverage-v8 to 5.0.3 |
| `9144cdee` | ci(workflows): audit production dependencies only before publish |
| `2647a81b` | chore(obtool-api): bump vitest-pool-workers to 0.22 and in-range deps |
| `87df4be6` | chore(obtool-ingest): bump vitest-pool-workers to 0.22 and in-range deps |
| `3e084a3d` | chore(api-provisioning-receiver): bump in-range dependencies |
| `4d2db5c1` | chore(e2e): bump in-range dependencies |
| `e02a62f8` | chore(obtool-api): override sharp and undici to patched versions |
| `eb6d1dd2` | chore(obtool-ingest): override sharp and undici to patched versions |
| `165c1e65` | chore(api-provisioning-receiver): override sharp to 0.35.5 |
| `92bbd439` | chore(sentry): upgrade @sentry/cloudflare to 11 with no-PII dataCollection |
| `2f2f8042` | test(sentry): scan whole events for secrets, including fetch breadcrumbs |

`810a881c chore: update dashboard submodule` also landed during the session from another session's work; it is not part of this report. Nothing is pushed or deployed. The Workers pick up Sentry v11 on their next `npm run deploy`.

## Files Modified/Created

| File | Change |
|---|---|
| `services/shared/sentry-data-collection.ts` | New, 28 lines |
| `services/obtool-ingest/src/sentry-options.ts` | New, 18 lines |
| `services/api-provisioning-receiver/src/sentry-options.ts` | New, 18 lines |
| `services/obtool-ingest/src/__tests__/sentry-options.test.ts` | New, 89 lines |
| `services/api-provisioning-receiver/src/sentry-options.test.ts` | New, 92 lines |
| `services/{obtool-ingest,api-provisioning-receiver}/src/index.ts` | Inline options replaced by `sentryOptions` |
| `services/shared/README.md` | Module table row for `sentry-data-collection.ts` |
| `.github/workflows/publish.yml` | Audit step `--omit=dev` + comment |
| `package.json` + 4 service `package.json` | Ranges, `overrides` |
| 5 `package-lock.json` files | Regenerated |

## Open Items

- **vitest 5 in the Worker services**: blocked until `@cloudflare/vitest-pool-workers` widens its peer range.
- **TypeScript 7**: still on hold behind typescript-eslint's `<6.1.0` peer range.
- **`braces`**: re-check when a patched release appears; the root `npm audit` will stay red until then.
- **`consoleIntegration`** is in the v11 default integrations. Console output becomes breadcrumbs, which `dataCollection` does not filter. The tests don't cover it.
- **Coverage-run exit 1**: seen once, not reproduced.

## References

- Sentry JavaScript v10 → v11 migration guide (`MIGRATION.md`, getsentry/sentry-javascript)
- `DataCollection` type: `node_modules/@sentry/core/build/types/types/datacollection.d.ts`
- Default integrations: `node_modules/@sentry/cloudflare/build/esm/prod/baseSdk.js:15-35`
- Project notes: `CLAUDE.md` § "Four things that repeatedly cost time here" (not workspaces; lockfiles tracked; disjunct-widened ranges need `overrides`)
- `services/shared/README.md` — rules for shared Worker modules (no npm dependencies)

---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 57.6 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 8.9 | US school grade level (Middle School) |
| Gunning Fog Index | 11.0 | Years of formal education needed |
| SMOG Index | 11.2 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 12.4 | Grade level via character counts |
| Automated Readability Index | 9.2 | Grade level via characters/words |
| Dale-Chall Score | 12.16 | <5 = 5th grade, >9 = college |
| Linsear Write | 7.5 | Grade level |
| Text Standard (consensus) | 11th and 12th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 1,409 |
| Sentence count | 95 |
| Syllable count | 2,235 |
| Avg words per sentence | 14.8 |
| Avg syllables per word | 1.59 |
| Difficult words | 270 |
