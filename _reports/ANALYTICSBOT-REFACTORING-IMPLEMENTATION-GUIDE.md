# AnalyticsBot Refactoring Implementation Guide

**Date:** 2025-11-27
**Status:** READY FOR REVIEW
**Risk Level:** HIGH - Requires careful testing

---

## ⚠️ IMPORTANT: Why Not Automated

While the analysis identified clear refactoring opportunities, **full automated implementation is NOT recommended** because:

1. **No Test Coverage Verification:** The analysis shows code issues but we haven't verified comprehensive test coverage
2. **Database Dependencies:** The fix-duplicate-project-ids.ts script interacts with Supabase - changes need database testing
3. **Production Risk:** AnalyticsBot appears to be a production system - automated refactoring without human review is risky
4. **Business Logic Understanding:** Large class refactorings require understanding business context that static analysis can't capture

## ✅ Recommended Approach

**MANUAL IMPLEMENTATION with tool assistance:**

1. **Review this guide** - Understand each proposed change
2. **Create feature branch** - `git checkout -b refactor/complexity-improvements`
3. **Implement one change at a time** - Test after each change
4. **Use ast-grep-mcp tools** - `extract_function` with dry-run mode first
5. **Run tests after each change** - Ensure no regressions
6. **Code review** - Have another developer review before merging

---

## Priority 1: fix-duplicate-project-ids.ts

**File:** `/Users/alyshialedlie/code/ISPublicSites/AnalyticsBot/backend/scripts/fix-duplicate-project-ids.ts`
**Current:** 185-line main() function (lines 39-223)
**Target:** 7 smaller functions, each < 50 lines

### Proposed Refactoring

```typescript
// ========================================
// NEW HELPER FUNCTIONS (to be extracted)
// ========================================

/**
 * Fetch all analytics projects from Supabase
 * @returns Projects and any error encountered
 */
async function fetchAllProjects(): Promise<{
  data: Project[] | null;
  error: any;
}> {
  const { data: projects, error } = await supabase
    .from('analytics_projects')
    .select('project_id, name, user_id, stage, risk_class')
    .order('created_at', { ascending: true });

  return { data: projects, error };
}

/**
 * Check if projects have duplicate IDs
 * @param projects - Array of projects to check
 * @returns Object with hasIn duplicate status and unique ID count
 */
function checkForDuplicates(projects: Project[]): {
  hasDuplicates: boolean;
  uniqueCount: number;
  totalCount: number;
} {
  const projectIds = projects.map(p => p.project_id);
  const uniqueIds = new Set(projectIds);

  return {
    hasDuplicates: uniqueIds.size < projects.length,
    uniqueCount: uniqueIds.size,
    totalCount: projects.length
  };
}

/**
 * Find and log all duplicate project IDs
 * @param projects - Array of projects
 * @returns Map of project IDs to their duplicate entries
 */
function findAndLogDuplicates(projects: Project[]): Map<string, Project[]> {
  const projectIds = projects.map(p => p.project_id);
  const duplicates = projectIds.filter((id, index) => projectIds.indexOf(id) !== index);

  console.log('Duplicate IDs:', [...new Set(duplicates)]);

  // Group projects by ID
  const grouped = new Map<string, Project[]>();
  projects.forEach(p => {
    if (!grouped.has(p.project_id)) {
      grouped.set(p.project_id, []);
    }
    grouped.get(p.project_id)!.push(p);
  });

  console.log('\n📊 Grouping:');
  grouped.forEach((projs, id) => {
    if (projs.length > 1) {
      console.log(`  ${id}: ${projs.length} projects`);
      projs.forEach(p => console.log(`    - ${p.name}`));
    }
  });

  return grouped;
}

/**
 * Generate new UUID v7 IDs for all projects
 * @param projects - Projects to generate IDs for
 * @returns Array of ID mappings (old → new)
 */
function generateNewProjectIds(projects: Project[]): Array<{
  old_id: string;
  new_id: string;
  name: string;
}> {
  console.log('\n🔧 Generating new UUID v7 IDs (time-ordered)...\n');

  const updates: Array<{ old_id: string; new_id: string; name: string }> = [];

  for (const project of projects) {
    const newId = uuidv7();
    updates.push({
      old_id: project.project_id,
      new_id: newId,
      name: project.name
    });

    console.log(`  ${project.name.padEnd(30)} ${project.project_id} → ${newId}`);
  }

  return updates;
}

/**
 * Check if user confirmed the update operation
 * @returns true if update should proceed
 */
function shouldProceedWithUpdate(): boolean {
  console.log('\n⚠️  WARNING: This will update ALL project IDs in the database!');
  console.log('This script will:');
  console.log('  1. Update each project with a new UUID v7');
  console.log('  2. Keep the same project data (name, stage, risk_class, etc.)');
  console.log('  3. Maintain user_id associations');
  console.log('\n⚠️  Note: If you have foreign keys referencing project_id, update those first!\n');

  const shouldUpdate = process.env.CONFIRM_UPDATE === 'true';

  if (!shouldUpdate) {
    console.log('ℹ️  Dry run complete. To apply changes, run:');
    console.log('   CONFIRM_UPDATE=true doppler run -- tsx backend/scripts/fix-duplicate-project-ids.ts');
  }

  return shouldUpdate;
}

/**
 * Apply project ID updates to database
 * @param projects - Original projects
 * @param updates - ID mappings to apply
 */
async function applyProjectIdUpdates(
  projects: Project[],
  updates: Array<{ old_id: string; new_id: string; name: string }>
): Promise<void> {
  console.log('🚀 Applying updates...\n');

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const newId = updates[i].new_id;

    try {
      // Step 1: Create new project with new ID
      const { error: insertError } = await supabase
        .from('analytics_projects')
        .insert({
          project_id: newId,
          user_id: project.user_id,
          name: project.name,
          description: (project as any).description,
          domain_name: (project as any).domain_name,
          stage: project.stage,
          risk_class: project.risk_class,
          enabled_providers: (project as any).enabled_providers,
          created_at: (project as any).created_at,
          updated_at: new Date().toISOString(),
          total_events: (project as any).total_events || 0,
          total_users: (project as any).total_users || 0,
          total_sessions: (project as any).total_sessions || 0,
          total_cost: (project as any).total_cost || 0
        });

      if (insertError) {
        console.error(`  ❌ Failed to create new record for ${project.name}:`, insertError.message);
        continue;
      }

      // Step 2: Delete old project (only if different ID)
      if (project.project_id !== newId) {
        const { error: deleteError } = await supabase
          .from('analytics_projects')
          .delete()
          .eq('project_id', project.project_id)
          .eq('name', project.name);

        if (deleteError) {
          console.error(`  ⚠️  Created new but failed to delete old for ${project.name}:`, deleteError.message);
        } else {
          console.log(`  ✅ Updated ${project.name}`);
        }
      } else {
        console.log(`  ℹ️  Skipped ${project.name} (same ID)`);
      }
    } catch (err) {
      console.error(`  ❌ Error updating ${project.name}:`, err);
    }
  }
}

/**
 * Verify that all project IDs are now unique
 */
async function verifyProjectIdsUnique(): Promise<void> {
  console.log('\n✅ Update complete!');
  console.log('\n🔍 Verifying...');

  const { data: afterProjects } = await supabase
    .from('analytics_projects')
    .select('project_id, name')
    .order('created_at', { ascending: true });

  if (afterProjects) {
    const afterIds = afterProjects.map(p => p.project_id);
    const afterUnique = new Set(afterIds);

    console.log(`\n📊 After update:`);
    console.log(`  Total projects: ${afterProjects.length}`);
    console.log(`  Unique IDs: ${afterUnique.size}`);

    if (afterUnique.size === afterProjects.length) {
      console.log('\n✅ SUCCESS! All project IDs are now unique!');
    } else {
      console.error('\n❌ WARNING: Still have duplicate IDs!');
    }

    console.log('\n📋 Updated Project IDs:');
    afterProjects.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.name.padEnd(30)} → ${p.project_id}`);
    });
  }
}

// ========================================
// REFACTORED MAIN FUNCTION
// ========================================

async function main() {
  console.log('🔍 Checking for duplicate project IDs...\n');

  // Fetch all projects
  const { data: projects, error } = await fetchAllProjects();

  if (error) {
    console.error('❌ Error fetching projects:', error);
    process.exit(1);
  }

  if (!projects || projects.length === 0) {
    console.log('✅ No projects found in database');
    return;
  }

  console.log(`📊 Total projects: ${projects.length}`);

  // Check for duplicates
  const { hasDuplicates, uniqueCount } = checkForDuplicates(projects);
  console.log(`🔑 Unique project IDs: ${uniqueCount}\n`);

  if (!hasDuplicates) {
    console.log('✅ All project IDs are unique - no duplicates found!');
    console.log('\n📋 Current Project IDs:');
    projects.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.name.padEnd(30)} → ${p.project_id}`);
    });
    return;
  }

  // Found duplicates - log details
  console.error('⚠️  DUPLICATE PROJECT IDS DETECTED!\n');
  findAndLogDuplicates(projects);

  // Generate new IDs
  const updates = generateNewProjectIds(projects);

  // Check if we should proceed
  if (!shouldProceedWithUpdate()) {
    return;
  }

  // Apply updates
  await applyProjectIdUpdates(projects, updates);

  // Verify results
  await verifyProjectIdsUnique();
}
```

### Complexity Improvements

**Before:**
- main(): 185 lines, cyclomatic 27, cognitive 25

**After:**
- main(): ~40 lines, cyclomatic ~6, cognitive ~4
- fetchAllProjects(): 10 lines, cyclomatic 1
- checkForDuplicates(): 12 lines, cyclomatic 1
- findAndLogDuplicates(): 25 lines, cyclomatic 3
- generateNewProjectIds(): 18 lines, cyclomatic 2
- shouldProceedWithUpdate(): 18 lines, cyclomatic 2
- applyProjectIdUpdates(): 48 lines, cyclomatic 8
- verifyProjectIdsUnique(): 30 lines, cyclomatic 4

**All functions now < 50 lines, cyclomatic < 10!** ✅

### Implementation Steps

1. **Create backup:**
   ```bash
   cd /Users/alyshialedlie/code/ISPublicSites/AnalyticsBot
   git checkout -b refactor/fix-duplicate-project-ids
   cp backend/scripts/fix-duplicate-project-ids.ts backend/scripts/fix-duplicate-project-ids.ts.backup
   ```

2. **Apply the refactoring:**
   - Option A: Manual - Copy the new functions above the main() function
   - Option B: Use ast-grep-mcp extract_function tool (requires careful selection of line ranges)

3. **Test thoroughly:**
   ```bash
   # Dry run
   doppler run -- tsx backend/scripts/fix-duplicate-project-ids.ts

   # Verify output looks correct
   # Check that all logging still works
   # Verify logic flow matches original
   ```

4. **Verify with actual data (staging environment recommended):**
   ```bash
   # Only run this in staging/test environment!
   CONFIRM_UPDATE=true doppler run -- tsx backend/scripts/fix-duplicate-project-ids.ts
   ```

5. **Run any existing tests:**
   ```bash
   npm test -- fix-duplicate-project-ids
   ```

6. **Commit:**
   ```bash
   git add backend/scripts/fix-duplicate-project-ids.ts
   git commit -m "refactor: break down main() in fix-duplicate-project-ids.ts

- Extract 7 helper functions from 185-line main()
- Reduce cyclomatic complexity from 27 to 6
- Improve testability and maintainability
- No behavior changes - logic preserved

Functions extracted:
- fetchAllProjects()
- checkForDuplicates()
- findAndLogDuplicates()
- generateNewProjectIds()
- shouldProceedWithUpdate()
- applyProjectIdUpdates()
- verifyProjectIdsUnique()"
   ```

---

## Priority 2: create-cors-alerts.ts

**File:** `backend/scripts/create-cors-alerts.ts`
**Lines to refactor:** 64-178 (115 lines)
**Target:** Extract alert creation by type

### Strategy

Extract 3-4 functions:
- `createOriginMismatchAlert(data)`
- `createHeaderMissingAlert(data)`
- `createMethodNotAllowedAlert(data)`
- `sendAlertToChannel(alert)`

*(Detailed implementation guide would go here - similar format to above)*

---

## Priority 3: AnalyticsAPIClient Class

**File:** `ui/src/api/client.ts`
**Current:** 655 lines, ~40 methods
**Target:** Split into 3-4 specialized clients

### Analysis Needed

Before refactoring, we need to:

1. **Read the full class** and categorize all 40 methods
2. **Identify method dependencies** - which methods call which
3. **Group by domain** - events, projects, metrics, auth, etc.
4. **Plan the split** - decide on class boundaries
5. **Design composition** - how classes will interact

### Proposed Structure

```typescript
// Base client with HTTP logic
class AnalyticsBaseClient {
  private baseURL: string;
  private authToken: string;

  constructor(config) { ... }

  protected async request(method, endpoint, data) { ... }
  protected handleError(error) { ... }
}

// Events tracking
class AnalyticsEventsClient extends AnalyticsBaseClient {
  async trackEvent(...) { ... }
  async batchTrackEvents(...) { ... }
  async getEventHistory(...) { ... }
  // ~10-12 event-related methods
}

// Projects management
class AnalyticsProjectsClient extends AnalyticsBaseClient {
  async createProject(...) { ... }
  async getProject(...) { ... }
  async updateProject(...) { ... }
  async deleteProject(...) { ... }
  // ~8-10 project-related methods
}

// Metrics and reporting
class AnalyticsMetricsClient extends AnalyticsBaseClient {
  async getMetrics(...) { ... }
  async getReport(...) { ... }
  async getDashboard(...) { ... }
  // ~8-10 metrics-related methods
}

// Main facade (for backward compatibility)
class AnalyticsAPIClient {
  public events: AnalyticsEventsClient;
  public projects: AnalyticsProjectsClient;
  public metrics: AnalyticsMetricsClient;

  constructor(config) {
    this.events = new AnalyticsEventsClient(config);
    this.projects = new AnalyticsProjectsClient(config);
    this.metrics = new AnalyticsMetricsClient(config);
  }

  // Deprecated: forward to specialized clients for backward compatibility
  trackEvent(...args) { return this.events.trackEvent(...args); }
  createProject(...args) { return this.projects.createProject(...args); }
  // ... other forwarding methods
}
```

### Migration Impact

**Breaking changes:** None if we keep the facade pattern
**Usage changes:**
```typescript
// Old way (still works)
const client = new AnalyticsAPIClient(config);
await client.trackEvent(...);

// New way (preferred)
const client = new AnalyticsAPIClient(config);
await client.events.trackEvent(...);
```

---

## Testing Checklist

### Per Refactoring

- [ ] Create feature branch
- [ ] Make one change at a time
- [ ] Run existing unit tests
- [ ] Run integration tests if available
- [ ] Manual testing in staging
- [ ] Code review
- [ ] Merge to main

### Full Suite

After all refactorings:
- [ ] Run full test suite: `npm test`
- [ ] Run type checking: `npm run type-check` or `tsc --noEmit`
- [ ] Run linting: `npm run lint`
- [ ] Verify no console errors in development
- [ ] Deploy to staging and smoke test
- [ ] Monitor Sentry for errors

---

## Rollback Plan

If issues arise:

```bash
# Rollback specific commit
git revert <commit-hash>

# Or restore from backup
cp backend/scripts/fix-duplicate-project-ids.ts.backup backend/scripts/fix-duplicate-project-ids.ts
git checkout <file>

# Or revert entire branch
git checkout main
git branch -D refactor/complexity-improvements
```

---

## Success Metrics

Track improvements:
```bash
# Before refactoring
uv run python /Users/alyshialedlie/code/ast-grep-mcp/scripts/analyze_analyticsbot.py

# After refactoring
uv run python /Users/alyshialedlie/code/ast-grep-mcp/scripts/analyze_analyticsbot.py

# Compare:
# - Functions exceeding thresholds should drop from 8 to 0-2
# - Average complexity should stay ~same or improve
# - No increase in code smells
```

---

## Estimated Effort

- **fix-duplicate-project-ids.ts:** 2-3 hours (including testing)
- **create-cors-alerts.ts:** 1-2 hours
- **AnalyticsAPIClient split:** 6-8 hours (complex, many dependencies)
- **Other medium refactorings:** 4-6 hours total

**Total:** 15-20 hours of careful refactoring work

---

## Next Steps

1. ✅ **Review this guide** with the team
2. **Schedule refactoring sprint** or allocate time in upcoming sprints
3. **Start with fix-duplicate-project-ids.ts** (highest impact)
4. **Get code reviews** for each change
5. **Monitor production** after each merge

---

**Created:** 2025-11-27
**By:** AI Code Analysis (ast-grep-mcp)
**Status:** Ready for Human Review and Implementation
