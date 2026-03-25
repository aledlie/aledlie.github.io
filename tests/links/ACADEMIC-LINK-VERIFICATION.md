# Academic Link Verification Strategies

This document outlines strategies for verifying academic DOI links and research citations when `npm run test:links` reports broken or inaccessible links.

## HTTP Status Code Interpretation

### 200-299 (Success)
- Link is working and accessible
- No action needed

### 301-302 (Redirects)
- Link redirects to another URL
- Treated as successful by the link checker
- Follow the redirect to confirm destination is valid

### 403 (Forbidden/Paywall)
- **Most common for paywalled academic papers**
- Indicates the resource exists but requires authentication or institutional access
- This is **expected and acceptable** for journal articles, conference proceedings, and academic books
- **Action: LEAVE AS-IS** — citation is valid even if access is restricted
- Users with institutional subscriptions can access via their library

### 404 (Not Found)
- Link points to non-existent resource
- May indicate typo in DOI, outdated documentation URL, or hallucinated citation
- **Requires investigation and remediation**

### Other Errors (timeout, DNS failure, etc.)
- Network issue or service temporarily down
- Retry before declaring as broken

## Verification Workflow for Failed Academic Links

### Step 1: Verify Publication Exists
```bash
# Search for the publication using web search
# Try variations: author name, article title, journal name, year
# Common databases:
# - Google Scholar: scholar.google.com (search by title or author)
# - DBLP: dblp.org (computer science papers)
# - CrossRef: crossref.org (any registered DOI — requires API call)
# - Unpaywall: unpaywall.org (open-access papers)
```

### Step 2: Check DOI Validity
```bash
# Verify DOI format and existence via CrossRef API
curl -s "https://api.crossref.org/works/10.XXXX/YYYY" | jq

# Possible outcomes:
# - Valid DOI: Returns publication metadata
# - Invalid/unregistered DOI: Returns empty or error response
```

### Step 3: Find Alternative Access Points
If the original link is broken but the publication exists:

1. **ACM Digital Library** (`dl.acm.org`)
   - For ACM conference papers and journals
   - Format: `https://dl.acm.org/doi/10.1145/XXXXX`
   - Note: Link checker skips `dl.acm.org` (it blocks automated requests)

2. **IEEE Xplore** (`ieeexplore.ieee.org`)
   - For IEEE journal and conference papers
   - Format: `https://doi.org/10.1109/XXXXX`

3. **Springer** (`link.springer.com`)
   - For Springer journals
   - Format: `https://doi.org/10.1007/s10664-XXXXX` or `https://link.springer.com/article/10.1007/XXXXX`

4. **Internet Archive** (`archive.org`)
   - Cached version may be available
   - Search: `https://archive.org/search.php?query=TITLE+OR+AUTHOR`
   - Wayback Machine: `https://web.archive.org/web/*/[URL]`

5. **Author Repositories**
   - ResearchGate, Academia.edu (author-uploaded versions)
   - University institutional repositories
   - Author personal/lab websites

6. **Government/Public Access**
   - For NIST, NREL, other U.S. government publications
   - Direct PDFs often available at agency sites (public domain)
   - Example: NIST publications at `nvlpubs.nist.gov`

### Step 4: Assess Citation Viability

**Keep As-Is (Paywalled):**
- Publication is verified to exist ✓
- DOI is valid and registered ✓
- HTTP 403 is expected and acceptable ✓
- Citation serves academic grounding even if access restricted ✓

**Remove or Replace (Unverifiable):**
- Cannot confirm publication exists
- DOI doesn't resolve or is invalid
- No alternative access method found
- Consider citing a similar/foundational work instead

**Update Link (Better Alternative Found):**
- Original link broken (404) but publication exists
- Found working direct link (ACM DL, Internet Archive, etc.)
- Update reference with new working URL

## Current Skip List

The link checker automatically skips these domains (they block automated requests):
- `medium.com` — requires browser session
- `linkedin.com` — requires login
- `dl.acm.org` — blocks non-browser requests
- `onlinelibrary.wiley.com` — blocks automated access
- `papers.ssrn.com` — rate limiting
- `crunchbase.com` — blocks crawlers
- `neptune.ai` — blocks crawlers
- `openai.com` — rate limiting

**Manual verification required for these domains** — use web search or visit directly in browser.

## Examples from Recent Session

### Successful Remediation

**Halstead 1977 (Books)**
- Issue: DOI resolver returns 404
- Verification: Found in ACM Digital Library + Internet Archive
- Solution: Changed to `https://dl.acm.org/doi/book/10.5555/540137`
- Note: Marked as skipped in link checker, but link is valid

**SonarSource Documentation**
- Issue: Documentation URLs changed path structure
- Verification: Found current docs at new `sonarqube-server` paths
- Solution: Updated to `https://docs.sonarsource.com/sonarqube-server/latest/...`
- Result: Now passes link checker

### Invalid Citations (Removed)

**Peldszus et al. 2022**
- Issue: DOI returns 404
- Verification: Cannot find publication in any database with this title/journal/year
- Solution: Removed hyperlink, noted as `[DOI: 10.1016/j.jss.2022.111309 - link unavailable]`
- Reason: Likely hallucinated citation — no evidence publication exists

**Palomba et al. 2022**
- Issue: DOI returns 404
- Verification: Author exists (Fabio Palomba), but specific paper cannot be confirmed
- Solution: Removed hyperlink, noted as `[DOI: 10.1007/s10664-022-10198-7 - link unavailable]`
- Reason: Cannot verify publication details match

## Interpreting Test Output

```
[314/410] ✓ https://example.com/page          # OK
[315/410] ✗ https://example.com/broken        # 404 or other error
[316/410] ○ https://papers.ssrn.com/abstract  # Skipped (domain in skip list)
```

- ✓ = Passed (HTTP 200-302)
- ✗ = Failed (HTTP 4xx/5xx or network error)
- ○ = Skipped (domain requires manual verification)

## Running Manual Verification

```bash
# Test a single URL
curl -s -o /dev/null -w "%{http_code}" https://doi.org/10.1109/TSE.1976.233837

# For paywalled academic content
# Use a web browser to:
# 1. Visit the DOI URL directly
# 2. Check if your institution provides access
# 3. Search for the same paper via Google Scholar
```

## When to Update the Script

Add new domains to `SKIP_DOMAINS` if:
- Domain blocks automated requests (returns 403 consistently)
- Domain requires CAPTCHA or browser validation
- Domain has rate limiting that blocks link checker
- Domain is authenticated (login required)

Remove from skip list if:
- Domain is fixed and now allows automated access
- Better alternative link source is found

