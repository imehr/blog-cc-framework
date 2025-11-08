# Blog Sync Template Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement `/blog-sync-template` command to sync blog-cc template updates to sites with commit-by-commit review, conflict resolution, and safety mechanisms.

**Architecture:** Git Remote Strategy using git cherry-pick for selective commit application. Pre/post validation with rollback tags. Interactive CLI for reviewing commits one-by-one.

**Tech Stack:** TypeScript, Node.js child_process, existing git-helper utils, chalk for CLI styling

---

## Task 1: Git Operations Module (Core Git Functions)

**Files:**
- Create: `lib/cli/sync/git-operations.ts`
- Test: `lib/cli/sync/__tests__/git-operations.test.ts`

**Step 1: Write failing tests for git-operations**

```typescript
// lib/cli/sync/__tests__/git-operations.test.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  ensureTemplateRemote,
  fetchTemplate,
  getCommitsBehind,
  cherryPickCommit,
  abortCherryPick,
  createRollbackTag,
  hasRemote
} from '../git-operations';

jest.mock('child_process');

const execAsync = promisify(exec);

describe('git-operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasRemote', () => {
    it('should return true when remote exists', async () => {
      (execAsync as jest.Mock).mockResolvedValue({
        stdout: 'origin\ntemplate\n',
        stderr: ''
      });

      const result = await hasRemote('template');
      expect(result).toBe(true);
    });

    it('should return false when remote does not exist', async () => {
      (execAsync as jest.Mock).mockResolvedValue({
        stdout: 'origin\n',
        stderr: ''
      });

      const result = await hasRemote('template');
      expect(result).toBe(false);
    });
  });

  describe('ensureTemplateRemote', () => {
    it('should add template remote if not exists', async () => {
      (execAsync as jest.Mock)
        .mockResolvedValueOnce({ stdout: 'origin\n', stderr: '' }) // hasRemote check
        .mockResolvedValueOnce({ stdout: '', stderr: '' }); // git remote add

      await ensureTemplateRemote('https://github.com/imehr/blog-cc.git');

      expect(execAsync).toHaveBeenCalledWith('git remote add template "https://github.com/imehr/blog-cc.git"');
    });

    it('should not add remote if already exists', async () => {
      (execAsync as jest.Mock).mockResolvedValue({
        stdout: 'origin\ntemplate\n',
        stderr: ''
      });

      await ensureTemplateRemote('https://github.com/imehr/blog-cc.git');

      expect(execAsync).toHaveBeenCalledTimes(1); // Only hasRemote call
    });
  });

  describe('createRollbackTag', () => {
    it('should create tag with timestamp', async () => {
      const mockDate = new Date('2025-11-08T15:30:22Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      (execAsync as jest.Mock).mockResolvedValue({ stdout: '', stderr: '' });

      const tag = await createRollbackTag();

      expect(tag).toMatch(/^pre-sync-2025-11-08-\d{6}$/);
      expect(execAsync).toHaveBeenCalledWith(expect.stringContaining('git tag'));
    });
  });

  describe('cherryPickCommit', () => {
    it('should successfully cherry-pick commit', async () => {
      (execAsync as jest.Mock).mockResolvedValue({ stdout: '', stderr: '' });

      const result = await cherryPickCommit('abc123');

      expect(result.status).toBe('success');
      expect(result.commit).toBe('abc123');
      expect(execAsync).toHaveBeenCalledWith('git cherry-pick abc123');
    });

    it('should detect conflicts on cherry-pick failure', async () => {
      (execAsync as jest.Mock)
        .mockRejectedValueOnce(new Error('CONFLICT'))
        .mockResolvedValueOnce({ stdout: 'UU file.txt\n', stderr: '' });

      const result = await cherryPickCommit('abc123');

      expect(result.status).toBe('conflict');
      expect(result.conflicts).toContain('file.txt');
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- git-operations.test.ts`
Expected: FAIL with "Cannot find module '../git-operations'"

**Step 3: Implement git-operations.ts**

```typescript
// lib/cli/sync/git-operations.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SyncResult {
  status: 'success' | 'conflict' | 'error';
  commit?: string;
  conflicts?: string[];
  error?: string;
}

export interface TemplateCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  filesChanged: string[];
  additions: number;
  deletions: number;
}

/**
 * Check if a git remote exists
 */
export async function hasRemote(remoteName: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync('git remote');
    const remotes = stdout.trim().split('\n');
    return remotes.includes(remoteName);
  } catch {
    return false;
  }
}

/**
 * Ensure template remote is configured
 */
export async function ensureTemplateRemote(templateUrl: string): Promise<void> {
  const exists = await hasRemote('template');

  if (!exists) {
    await execAsync(`git remote add template "${escapeShellArg(templateUrl)}"`);
    console.log('✓ Added template remote');
  } else {
    console.log('✓ Template remote already configured');
  }
}

/**
 * Fetch latest changes from template remote
 */
export async function fetchTemplate(): Promise<void> {
  await execAsync('git fetch template main');
  console.log('✓ Fetched latest template changes');
}

/**
 * Get list of commits that site is behind template
 */
export async function getCommitsBehind(): Promise<TemplateCommit[]> {
  try {
    // Get commit log with file stats
    const { stdout } = await execAsync(
      'git log HEAD..template/main --pretty=format:"%H|%s|%an|%ad" --date=short --numstat'
    );

    if (!stdout.trim()) {
      return [];
    }

    return parseCommitLog(stdout);
  } catch (error) {
    throw new Error(`Failed to get commits: ${error}`);
  }
}

/**
 * Parse git log output into structured commits
 */
function parseCommitLog(logOutput: string): TemplateCommit[] {
  const commits: TemplateCommit[] = [];
  const lines = logOutput.split('\n');

  let currentCommit: Partial<TemplateCommit> | null = null;
  let totalAdditions = 0;
  let totalDeletions = 0;
  const filesChanged: string[] = [];

  for (const line of lines) {
    if (line.includes('|')) {
      // Commit header line
      if (currentCommit) {
        // Save previous commit
        commits.push({
          ...currentCommit,
          filesChanged,
          additions: totalAdditions,
          deletions: totalDeletions
        } as TemplateCommit);

        // Reset for next commit
        filesChanged.length = 0;
        totalAdditions = 0;
        totalDeletions = 0;
      }

      const [hash, message, author, date] = line.split('|');
      currentCommit = { hash, message, author, date };
    } else if (line.trim() && currentCommit) {
      // File stat line: "5  3  path/to/file.txt"
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3) {
        const additions = parseInt(parts[0], 10) || 0;
        const deletions = parseInt(parts[1], 10) || 0;
        const file = parts[2];

        totalAdditions += additions;
        totalDeletions += deletions;
        filesChanged.push(file);
      }
    }
  }

  // Save last commit
  if (currentCommit) {
    commits.push({
      ...currentCommit,
      filesChanged,
      additions: totalAdditions,
      deletions: totalDeletions
    } as TemplateCommit);
  }

  return commits;
}

/**
 * Cherry-pick a commit
 */
export async function cherryPickCommit(commitHash: string): Promise<SyncResult> {
  try {
    await execAsync(`git cherry-pick ${commitHash}`);
    return {
      status: 'success',
      commit: commitHash
    };
  } catch (error) {
    // Check if it's a conflict
    const conflicts = await getConflictFiles();

    if (conflicts.length > 0) {
      return {
        status: 'conflict',
        commit: commitHash,
        conflicts
      };
    }

    return {
      status: 'error',
      commit: commitHash,
      error: String(error)
    };
  }
}

/**
 * Get list of conflicted files
 */
async function getConflictFiles(): Promise<string[]> {
  try {
    const { stdout } = await execAsync('git status --porcelain');
    const lines = stdout.split('\n');

    return lines
      .filter(line => line.startsWith('UU ') || line.startsWith('AA '))
      .map(line => line.substring(3).trim());
  } catch {
    return [];
  }
}

/**
 * Abort cherry-pick in progress
 */
export async function abortCherryPick(): Promise<void> {
  try {
    await execAsync('git cherry-pick --abort');
  } catch {
    // Already aborted or not in progress
  }
}

/**
 * Create a rollback tag before syncing
 */
export async function createRollbackTag(): Promise<string> {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
  const tag = `pre-sync-${date}-${time}`;

  await execAsync(`git tag "${tag}"`);
  console.log(`✓ Rollback point created: ${tag}`);

  return tag;
}

/**
 * Resolve conflict by accepting one side
 */
export async function resolveConflict(
  file: string,
  strategy: 'ours' | 'theirs'
): Promise<void> {
  const flag = strategy === 'ours' ? '--ours' : '--theirs';
  await execAsync(`git checkout ${flag} "${escapeShellArg(file)}"`);
  await execAsync(`git add "${escapeShellArg(file)}"`);
}

/**
 * Continue cherry-pick after manual resolution
 */
export async function continueCherryPick(): Promise<void> {
  await execAsync('git cherry-pick --continue');
}

function escapeShellArg(arg: string): string {
  return arg
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/\n/g, '\\n');
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- git-operations.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add lib/cli/sync/git-operations.ts lib/cli/sync/__tests__/git-operations.test.ts
git commit -m "feat(sync): add git operations module with cherry-pick support"
```

---

## Task 2: Sync Validator Module (Pre/Post Checks)

**Files:**
- Create: `lib/cli/sync/sync-validator.ts`
- Test: `lib/cli/sync/__tests__/sync-validator.test.ts`

**Step 1: Write failing tests for sync-validator**

```typescript
// lib/cli/sync/__tests__/sync-validator.test.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  validatePreSync,
  validatePostSync,
  ValidationResult
} from '../sync-validator';

jest.mock('child_process');
jest.mock('../../utils/git-helper');
jest.mock('../../utils/project-detector');

const execAsync = promisify(exec);

describe('sync-validator', () => {
  describe('validatePreSync', () => {
    it('should pass when all checks succeed', async () => {
      const { isBlogCCProject } = require('../../utils/project-detector');
      const { isWorkingDirectoryClean, getCurrentBranch } = require('../../utils/git-helper');

      isBlogCCProject.mockResolvedValue(true);
      isWorkingDirectoryClean.mockResolvedValue(true);
      getCurrentBranch.mockResolvedValue('feature-sync');
      (execAsync as jest.Mock).mockResolvedValue({ stdout: '', stderr: '' }); // build passes

      const result = await validatePreSync();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when not a blog-cc project', async () => {
      const { isBlogCCProject } = require('../../utils/project-detector');
      isBlogCCProject.mockResolvedValue(false);

      const result = await validatePreSync();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Not a blog-cc project');
    });

    it('should warn when on main branch', async () => {
      const { isBlogCCProject } = require('../../utils/project-detector');
      const { isWorkingDirectoryClean, getCurrentBranch } = require('../../utils/git-helper');

      isBlogCCProject.mockResolvedValue(true);
      isWorkingDirectoryClean.mockResolvedValue(true);
      getCurrentBranch.mockResolvedValue('main');
      (execAsync as jest.Mock).mockResolvedValue({ stdout: '', stderr: '' });

      const result = await validatePreSync();

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain(expect.stringContaining('main branch'));
    });
  });

  describe('validatePostSync', () => {
    it('should detect package.json changes', async () => {
      (execAsync as jest.Mock)
        .mockResolvedValueOnce({ stdout: 'M package.json\n', stderr: '' }) // git diff
        .mockResolvedValueOnce({ stdout: '', stderr: '' }); // build passes

      const result = await validatePostSync();

      expect(result.needsNpmInstall).toBe(true);
    });

    it('should fail when build breaks', async () => {
      (execAsync as jest.Mock)
        .mockResolvedValueOnce({ stdout: '', stderr: '' }) // git diff
        .mockRejectedValueOnce(new Error('Build failed')); // build fails

      const result = await validatePostSync();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Build failed'));
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- sync-validator.test.ts`
Expected: FAIL with "Cannot find module '../sync-validator'"

**Step 3: Implement sync-validator.ts**

```typescript
// lib/cli/sync/sync-validator.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { isBlogCCProject } from '../utils/project-detector';
import { isWorkingDirectoryClean, getCurrentBranch } from '../utils/git-helper';

const execAsync = promisify(exec);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  needsNpmInstall?: boolean;
}

/**
 * Validate pre-sync conditions
 */
export async function validatePreSync(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if blog-cc project
  const isProject = await isBlogCCProject(process.cwd());
  if (!isProject) {
    errors.push('Not a blog-cc project. Run this command in a blog-cc site directory.');
  }

  // Check working directory is clean
  const isClean = await isWorkingDirectoryClean();
  if (!isClean) {
    errors.push('Working directory has uncommitted changes. Commit or stash changes first.');
  }

  // Check current branch
  const branch = await getCurrentBranch();
  if (branch === 'main' || branch === 'master') {
    warnings.push('You are on main branch. Consider creating a feature branch for syncing.');
  }

  // Check if build passes
  try {
    await execAsync('npm run build', { timeout: 60000 });
  } catch (error) {
    errors.push(`Build failed: ${error}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate post-sync conditions
 */
export async function validatePostSync(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let needsNpmInstall = false;

  // Check if package.json changed
  try {
    const { stdout } = await execAsync('git diff HEAD~1 --name-only');
    if (stdout.includes('package.json')) {
      needsNpmInstall = true;
      warnings.push('package.json changed. Run: npm install');
    }
  } catch {
    // Ignore diff errors
  }

  // Check if build still passes
  try {
    await execAsync('npm run build', { timeout: 60000 });
  } catch (error) {
    errors.push(`Build failed after sync: ${error}`);
    errors.push('Consider rolling back with: git reset --hard <rollback-tag>');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    needsNpmInstall
  };
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- sync-validator.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add lib/cli/sync/sync-validator.ts lib/cli/sync/__tests__/sync-validator.test.ts
git commit -m "feat(sync): add pre/post sync validation module"
```

---

## Task 3: Conflict Resolver Module (Interactive Conflict Handling)

**Files:**
- Create: `lib/cli/sync/conflict-resolver.ts`
- Test: `lib/cli/sync/__tests__/conflict-resolver.test.ts`

**Step 1: Write failing tests for conflict-resolver**

```typescript
// lib/cli/sync/__tests__/conflict-resolver.test.ts
import { handleConflict, ConflictResolution } from '../conflict-resolver';
import * as readline from 'readline';

jest.mock('readline');

describe('conflict-resolver', () => {
  it('should present conflict resolution options', async () => {
    const mockReadline = {
      question: jest.fn((question, callback) => callback('M')),
      close: jest.fn()
    };

    (readline.createInterface as jest.Mock).mockReturnValue(mockReadline);

    const resolution = await handleConflict(['app/page.tsx', 'lib/utils.ts']);

    expect(resolution.action).toBe('keep-mine');
  });

  it('should return skip action when user chooses skip', async () => {
    const mockReadline = {
      question: jest.fn((question, callback) => callback('S')),
      close: jest.fn()
    };

    (readline.createInterface as jest.Mock).mockReturnValue(mockReadline);

    const resolution = await handleConflict(['app/page.tsx']);

    expect(resolution.action).toBe('skip');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- conflict-resolver.test.ts`
Expected: FAIL with "Cannot find module '../conflict-resolver'"

**Step 3: Implement conflict-resolver.ts**

```typescript
// lib/cli/sync/conflict-resolver.ts
import * as readline from 'readline';
import chalk from 'chalk';

export interface ConflictResolution {
  action: 'resolve-manual' | 'keep-mine' | 'use-template' | 'skip' | 'quit';
  files?: string[];
}

/**
 * Handle conflict interactively
 */
export async function handleConflict(conflictFiles: string[]): Promise<ConflictResolution> {
  console.log(chalk.yellow('\n⚠️  Conflicts detected in:'));
  conflictFiles.forEach(file => console.log(chalk.yellow(`  - ${file}`)));

  console.log('\n' + chalk.bold('Resolution options:'));
  console.log('  [R] Resolve manually - Guide me through fixing conflicts');
  console.log('  [M] Keep mine - Keep current site version (discard template changes)');
  console.log('  [T] Use template - Accept template version (discard my changes)');
  console.log('  [S] Skip this commit - Don\'t apply this commit');
  console.log('  [Q] Quit sync - Stop entire sync process');

  const choice = await promptUser('\nChoice: ');

  switch (choice.toUpperCase()) {
    case 'R':
      return { action: 'resolve-manual', files: conflictFiles };
    case 'M':
      return { action: 'keep-mine', files: conflictFiles };
    case 'T':
      return { action: 'use-template', files: conflictFiles };
    case 'S':
      return { action: 'skip' };
    case 'Q':
      return { action: 'quit' };
    default:
      console.log(chalk.red('Invalid choice. Please try again.'));
      return handleConflict(conflictFiles);
  }
}

/**
 * Guide user through manual conflict resolution
 */
export function guideManualResolution(files: string[]): void {
  console.log(chalk.cyan('\n📝 Manual Conflict Resolution Guide:\n'));

  console.log('1. Open conflicted files in your editor:');
  files.forEach(file => console.log(`   ${file}`));

  console.log('\n2. Look for conflict markers:');
  console.log(chalk.yellow('   <<<<<<< HEAD (your version)'));
  console.log('   [your code]');
  console.log(chalk.yellow('   ======='));
  console.log('   [template code]');
  console.log(chalk.yellow('   >>>>>>> template'));

  console.log('\n3. Edit to combine both versions (keep what you need)');

  console.log('\n4. Remove conflict markers');

  console.log('\n5. Save files');

  console.log('\n6. Stage resolved files:');
  files.forEach(file => console.log(`   git add ${file}`));

  console.log(chalk.green('\n7. Press ENTER when done to continue...'));
}

/**
 * Prompt user for input
 */
function promptUser(question: string): Promise<string> {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Wait for user to press ENTER
 */
export async function waitForUser(): Promise<void> {
  await promptUser('');
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- conflict-resolver.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add lib/cli/sync/conflict-resolver.ts lib/cli/sync/__tests__/conflict-resolver.test.ts
git commit -m "feat(sync): add interactive conflict resolution module"
```

---

## Task 4: Template Sync Orchestrator (Main Sync Logic)

**Files:**
- Create: `lib/cli/sync/template-sync.ts`
- Test: `lib/cli/sync/__tests__/template-sync.test.ts`

**Step 1: Write failing tests for template-sync**

```typescript
// lib/cli/sync/__tests__/template-sync.test.ts
import { runTemplateSync, SyncOptions } from '../template-sync';

jest.mock('../git-operations');
jest.mock('../sync-validator');
jest.mock('../conflict-resolver');

describe('template-sync', () => {
  it('should complete successful sync without conflicts', async () => {
    const { getCommitsBehind, cherryPickCommit } = require('../git-operations');
    const { validatePreSync, validatePostSync } = require('../sync-validator');

    validatePreSync.mockResolvedValue({ valid: true, errors: [], warnings: [] });
    validatePostSync.mockResolvedValue({ valid: true, errors: [], warnings: [] });
    getCommitsBehind.mockResolvedValue([
      {
        hash: 'abc123',
        message: 'feat: add bookmarks',
        author: 'Test',
        date: '2025-11-08',
        filesChanged: ['app/bookmarks/page.tsx'],
        additions: 100,
        deletions: 0
      }
    ]);
    cherryPickCommit.mockResolvedValue({ status: 'success', commit: 'abc123' });

    const result = await runTemplateSync({ dryRun: false, autoApply: true });

    expect(result.success).toBe(true);
    expect(result.applied).toBe(1);
  });

  it('should handle dry-run mode', async () => {
    const { getCommitsBehind } = require('../git-operations');
    const { validatePreSync } = require('../sync-validator');

    validatePreSync.mockResolvedValue({ valid: true, errors: [], warnings: [] });
    getCommitsBehind.mockResolvedValue([
      { hash: 'abc123', message: 'test', author: 'Test', date: '2025-11-08', filesChanged: [], additions: 0, deletions: 0 }
    ]);

    const result = await runTemplateSync({ dryRun: true });

    expect(result.success).toBe(true);
    expect(result.applied).toBe(0);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- template-sync.test.ts`
Expected: FAIL with "Cannot find module '../template-sync'"

**Step 3: Implement template-sync.ts (Part 1 - Core)**

```typescript
// lib/cli/sync/template-sync.ts
import chalk from 'chalk';
import * as readline from 'readline';
import {
  ensureTemplateRemote,
  fetchTemplate,
  getCommitsBehind,
  cherryPickCommit,
  abortCherryPick,
  createRollbackTag,
  resolveConflict,
  continueCherryPick,
  TemplateCommit,
  SyncResult
} from './git-operations';
import { validatePreSync, validatePostSync } from './sync-validator';
import {
  handleConflict,
  guideManualResolution,
  waitForUser
} from './conflict-resolver';

export interface SyncOptions {
  dryRun?: boolean;
  autoApply?: boolean;
  commits?: string[];
  filter?: string[];
  skipValidation?: boolean;
  templateUrl?: string;
}

export interface SyncReport {
  success: boolean;
  applied: number;
  skipped: number;
  conflicts: number;
  rollbackTag?: string;
  errors: string[];
}

const DEFAULT_TEMPLATE_URL = 'https://github.com/imehr/blog-cc.git';

/**
 * Run template sync process
 */
export async function runTemplateSync(options: SyncOptions = {}): Promise<SyncReport> {
  const report: SyncReport = {
    success: false,
    applied: 0,
    skipped: 0,
    conflicts: 0,
    errors: []
  };

  try {
    printHeader();

    // Step 1: Pre-flight checks
    if (!options.skipValidation) {
      console.log(chalk.bold('\nStep 1: Pre-flight checks'));
      const validation = await validatePreSync();

      if (!validation.valid) {
        validation.errors.forEach(err => console.log(chalk.red(`  ✗ ${err}`)));
        report.errors = validation.errors;
        return report;
      }

      validation.warnings.forEach(warn => console.log(chalk.yellow(`  ⚠ ${warn}`)));
      console.log(chalk.green('  ✓ All pre-flight checks passed'));
    }

    // Step 2: Template remote setup
    console.log(chalk.bold('\nStep 2: Template remote setup'));
    await ensureTemplateRemote(options.templateUrl || DEFAULT_TEMPLATE_URL);
    await fetchTemplate();

    // Step 3: Get commits to sync
    console.log(chalk.bold('\nStep 3: Analyzing changes'));
    let commits = await getCommitsBehind();

    if (options.commits) {
      commits = commits.filter(c => options.commits!.includes(c.hash));
    }

    if (options.filter) {
      commits = commits.filter(c =>
        c.filesChanged.some(file =>
          options.filter!.some(pattern => file.startsWith(pattern))
        )
      );
    }

    if (commits.length === 0) {
      console.log(chalk.green('  ✓ Already up to date with template'));
      report.success = true;
      return report;
    }

    console.log(chalk.cyan(`  ℹ Found ${commits.length} new commit(s) in template`));

    // Dry run mode
    if (options.dryRun) {
      printDryRunSummary(commits);
      report.success = true;
      return report;
    }

    // Step 4: Create rollback point
    console.log(chalk.bold('\nStep 4: Creating rollback point'));
    report.rollbackTag = await createRollbackTag();

    // Step 5: Review and apply commits
    console.log(chalk.bold('\nStep 5: Review commits'));

    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      const shouldApply = options.autoApply || await reviewCommit(commit, i + 1, commits.length);

      if (!shouldApply) {
        report.skipped++;
        console.log(chalk.gray(`  ⊘ Skipped commit ${commit.hash.substring(0, 7)}`));
        continue;
      }

      // Apply commit
      const result = await cherryPickCommit(commit.hash);

      if (result.status === 'success') {
        report.applied++;
        console.log(chalk.green(`  ✓ Applied commit ${commit.hash.substring(0, 7)}`));
      } else if (result.status === 'conflict') {
        report.conflicts++;
        const resolved = await handleConflictInteractive(result);

        if (!resolved) {
          console.log(chalk.yellow('  Sync aborted by user'));
          return report;
        }

        report.applied++;
      } else {
        report.errors.push(`Failed to apply ${commit.hash}: ${result.error}`);
        console.log(chalk.red(`  ✗ Failed to apply commit ${commit.hash.substring(0, 7)}`));
        break;
      }
    }

    // Step 6: Post-sync validation
    if (!options.skipValidation && report.applied > 0) {
      console.log(chalk.bold('\nStep 6: Post-sync validation'));
      const postValidation = await validatePostSync();

      if (!postValidation.valid) {
        postValidation.errors.forEach(err => console.log(chalk.red(`  ✗ ${err}`)));
        report.errors.push(...postValidation.errors);
        return report;
      }

      postValidation.warnings.forEach(warn => console.log(chalk.yellow(`  ⚠ ${warn}`)));
    }

    report.success = true;
    printSyncReport(report);

    return report;
  } catch (error) {
    report.errors.push(String(error));
    console.log(chalk.red(`\n✗ Sync failed: ${error}`));
    return report;
  }
}

/**
 * Print sync header
 */
function printHeader(): void {
  console.log(chalk.bold.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.cyan('  Blog-CC Template Sync'));
  console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
}

/**
 * Review a commit interactively
 */
async function reviewCommit(
  commit: TemplateCommit,
  index: number,
  total: number
): Promise<boolean> {
  console.log(chalk.bold(`\n━━━ Commit ${index} of ${total} ━━━`));
  console.log(`  Hash:    ${commit.hash.substring(0, 7)}`);
  console.log(`  Message: ${commit.message}`);
  console.log(`  Author:  ${commit.author}`);
  console.log(`  Date:    ${commit.date}`);

  console.log(`\n  Files changed (${commit.filesChanged.length} files, +${commit.additions}, -${commit.deletions}):`);

  // Group files by directory
  const grouped = groupFilesByDirectory(commit.filesChanged);
  for (const [dir, files] of Object.entries(grouped)) {
    console.log(chalk.gray(`\n  ${dir}/`));
    files.forEach(file => console.log(`    ✓ ${file}`));
  }

  console.log('\n  Actions:');
  console.log('  [A] Apply this commit');
  console.log('  [S] Skip this commit');
  console.log('  [V] View full diff');
  console.log('  [Q] Quit sync');

  const choice = await promptUser('\n  Choice: ');

  switch (choice.toUpperCase()) {
    case 'A':
      return true;
    case 'S':
      return false;
    case 'V':
      // TODO: Show diff
      console.log(chalk.yellow('  (Diff view not implemented yet)'));
      return reviewCommit(commit, index, total);
    case 'Q':
      process.exit(0);
    default:
      console.log(chalk.red('  Invalid choice'));
      return reviewCommit(commit, index, total);
  }
}

/**
 * Handle conflict interactively
 */
async function handleConflictInteractive(result: SyncResult): Promise<boolean> {
  const resolution = await handleConflict(result.conflicts || []);

  switch (resolution.action) {
    case 'resolve-manual':
      guideManualResolution(resolution.files!);
      await waitForUser();
      await continueCherryPick();
      return true;

    case 'keep-mine':
      for (const file of resolution.files!) {
        await resolveConflict(file, 'ours');
      }
      await continueCherryPick();
      return true;

    case 'use-template':
      for (const file of resolution.files!) {
        await resolveConflict(file, 'theirs');
      }
      await continueCherryPick();
      return true;

    case 'skip':
      await abortCherryPick();
      return true;

    case 'quit':
      await abortCherryPick();
      return false;
  }
}

/**
 * Print dry-run summary
 */
function printDryRunSummary(commits: TemplateCommit[]): void {
  console.log(chalk.cyan('\n━━━ Dry Run Summary ━━━\n'));
  console.log(chalk.bold(`Would sync ${commits.length} commit(s):\n`));

  commits.forEach((commit, i) => {
    console.log(`${i + 1}. ${commit.hash.substring(0, 7)} - ${commit.message}`);
    console.log(`   ${commit.filesChanged.length} files (+${commit.additions}, -${commit.deletions})`);
  });

  console.log(chalk.gray('\nRun without --dry-run to apply changes'));
}

/**
 * Print final sync report
 */
function printSyncReport(report: SyncReport): void {
  console.log(chalk.bold.green('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.green('  Sync Complete!'));
  console.log(chalk.bold.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

  console.log(chalk.green(`\nApplied: ${report.applied} commit(s)`));
  console.log(chalk.gray(`Skipped: ${report.skipped} commit(s)`));
  console.log(chalk.yellow(`Conflicts resolved: ${report.conflicts}`));

  if (report.rollbackTag) {
    console.log(chalk.cyan(`\nRollback available:`));
    console.log(chalk.cyan(`  git reset --hard ${report.rollbackTag}`));
  }

  console.log(chalk.bold('\nNext steps:'));
  console.log('  1. Run: npm install (if package.json changed)');
  console.log('  2. Run: npm run build (verify everything works)');
  console.log('  3. Run: ./start.sh (preview changes)');
  console.log('  4. Commit: git commit -m "sync: apply template updates"');
}

/**
 * Group files by directory
 */
function groupFilesByDirectory(files: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  for (const file of files) {
    const parts = file.split('/');
    const dir = parts[0];
    const filename = parts.slice(1).join('/');

    if (!grouped[dir]) {
      grouped[dir] = [];
    }
    grouped[dir].push(filename);
  }

  return grouped;
}

/**
 * Prompt user for input
 */
function promptUser(question: string): Promise<string> {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- template-sync.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add lib/cli/sync/template-sync.ts lib/cli/sync/__tests__/template-sync.test.ts
git commit -m "feat(sync): add main template sync orchestrator"
```

---

## Task 5: Slash Command Implementation

**Files:**
- Create: `commands/blog-sync-template.md`

**Step 1: Create command documentation**

```markdown
# Sync Template Updates

Sync blog-cc template updates to your site with commit-by-commit review and conflict resolution.

## Usage

```bash
# Interactive sync (review each commit)
/blog-sync-template

# Dry run (show what would be synced)
/blog-sync-template --dry-run

# Sync specific commits
/blog-sync-template --commits abc123,def456

# Filter by file paths
/blog-sync-template --filter lib/,components/

# Skip validation (not recommended)
/blog-sync-template --skip-validation
```

## What This Does

1. **Validates** your environment (clean working tree, build passes)
2. **Configures** template remote (if not already set up)
3. **Fetches** latest changes from blog-cc template
4. **Shows** new commits one-by-one for review
5. **Applies** selected commits via git cherry-pick
6. **Handles** merge conflicts with guided resolution
7. **Validates** build still passes after sync
8. **Creates** rollback point for safety

## Example Session

```
$ /blog-sync-template

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Blog-CC Template Sync
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Pre-flight checks
  ✓ Project detected: blog-cc site
  ✓ Working tree is clean
  ⚠ Currently on main branch (consider feature branch)
  ✓ Build passes

Step 2: Template remote setup
  ✓ Template remote configured
  ✓ Fetched latest template changes

Step 3: Analyzing changes
  ℹ Found 3 new commit(s) in template

Step 4: Creating rollback point
  ✓ Rollback point created: pre-sync-2025-11-08-153022

Step 5: Review commits

━━━ Commit 1 of 3 ━━━
  Hash:    d20c447
  Message: feat: add Twitter bookmarks extraction
  Author:  Mehran Mozaffari
  Date:    2025-11-03

  Files changed (5 files, +356, -12):

  app/
    ✓ bookmarks/page.tsx

  lib/
    ✓ cli/bookmarks/bookmark-agent.ts

  scripts/
    ✓ extract-twitter-bookmarks.ts

  Actions:
  [A] Apply  [S] Skip  [V] View diff  [Q] Quit

  Choice: A

  ✓ Applied commit d20c447

[... continues for remaining commits ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Sync Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Applied: 3 commit(s)
Skipped: 0 commit(s)
Conflicts resolved: 0

Rollback available:
  git reset --hard pre-sync-2025-11-08-153022

Next steps:
  1. Run: npm install
  2. Run: npm run build
  3. Run: ./start.sh
  4. Commit: git commit -m "sync: apply template updates"
```

## Conflict Resolution

When a commit conflicts with your changes:

```
⚠️  Conflicts detected in:
  - app/page.tsx

Resolution options:
  [R] Resolve manually - Guide me through fixing conflicts
  [M] Keep mine - Keep current site version
  [T] Use template - Accept template version
  [S] Skip this commit
  [Q] Quit sync

Choice:
```

**Manual resolution guide:**
1. Open conflicted files in editor
2. Look for conflict markers (<<<<<<, =======, >>>>>>>)
3. Edit to combine both versions
4. Remove markers and save
5. Press ENTER to continue

## What Gets Synced

- ✅ Framework code (lib/, components/)
- ✅ App pages (app/page.tsx, app/bookmarks/)
- ✅ Scripts (scripts/, package.json)
- ✅ Styles (app/globals.css)
- ❌ Content (content/ stays site-specific)
- ❌ Config (content/home.md, .env stay site-specific)

## Safety Features

1. **Pre-sync validation**
   - Checks for uncommitted changes
   - Verifies build passes
   - Warns if on main branch

2. **Rollback point**
   - Creates git tag before syncing
   - Easy rollback if something breaks

3. **Post-sync validation**
   - Verifies build still passes
   - Detects package.json changes

4. **Conflict guidance**
   - Step-by-step resolution instructions
   - Options to skip or abort

## Troubleshooting

### Build fails after sync

```bash
# Rollback to pre-sync state
git reset --hard pre-sync-2025-11-08-153022

# Try again with specific commits
/blog-sync-template --commits abc123
```

### Conflicts too complex

```bash
# Skip the problematic commit
# Choose [S] when conflict appears

# Or filter out certain paths
/blog-sync-template --filter lib/,components/
```

### Package.json conflicts

When package.json conflicts:
1. Choose "Resolve manually"
2. Open package.json
3. Keep your dependencies + add new template dependencies
4. Remove conflict markers
5. Continue sync

## Related Commands

- `/blog-validate` - Validate content before syncing
- `/blog-deploy` - Deploy after syncing

## Requirements

- Git repository initialized
- blog-cc project structure (content/, app/, lib/)
- npm installed for build validation
```

**Step 2: Commit command documentation**

```bash
git add commands/blog-sync-template.md
git commit -m "docs(sync): add /blog-sync-template command documentation"
```

---

## Task 6: Export Module and CLI Entry Point

**Files:**
- Modify: `lib/cli/sync/index.ts`
- Modify: `lib/cli/index.ts`

**Step 1: Create sync module index**

```typescript
// lib/cli/sync/index.ts
export * from './template-sync';
export * from './git-operations';
export * from './sync-validator';
export * from './conflict-resolver';
```

**Step 2: Export from main CLI index**

```typescript
// lib/cli/index.ts (add to existing exports)
export * from './sync';
```

**Step 3: Commit exports**

```bash
git add lib/cli/sync/index.ts lib/cli/index.ts
git commit -m "feat(sync): export sync modules from CLI"
```

---

## Task 7: Integration Testing

**Files:**
- Create: `lib/cli/sync/__tests__/integration.test.ts`

**Step 1: Write integration test**

```typescript
// lib/cli/sync/__tests__/integration.test.ts
import { runTemplateSync } from '../template-sync';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

const execAsync = promisify(exec);

describe('template-sync integration', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-test-'));
    process.chdir(testDir);

    // Initialize git repo
    await execAsync('git init');
    await execAsync('git config user.email "test@test.com"');
    await execAsync('git config user.name "Test"');

    // Create blog-cc structure
    await fs.mkdir('content/collections', { recursive: true });
    await fs.mkdir('app');
    await fs.writeFile('next.config.js', 'module.exports = {}');
    await fs.writeFile('package.json', '{"name":"test","scripts":{"build":"echo build"}}');

    // Initial commit
    await execAsync('git add .');
    await execAsync('git commit -m "initial"');
  });

  afterEach(async () => {
    // Cleanup
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should handle no commits to sync', async () => {
    // Add template remote pointing to HEAD (no new commits)
    await execAsync(`git remote add template ${testDir}`);
    await execAsync('git fetch template');

    const result = await runTemplateSync({ skipValidation: true });

    expect(result.success).toBe(true);
    expect(result.applied).toBe(0);
  });

  it('should sync in dry-run mode without applying', async () => {
    // Create a second commit to sync
    await fs.writeFile('test.txt', 'test');
    await execAsync('git add test.txt');
    await execAsync('git commit -m "feat: add test"');

    // Reset to previous commit
    await execAsync('git reset --hard HEAD~1');

    // Add template remote
    await execAsync(`git remote add template ${testDir}`);

    const result = await runTemplateSync({ dryRun: true, skipValidation: true });

    expect(result.success).toBe(true);
    expect(result.applied).toBe(0);

    // Verify file not applied
    const exists = await fs.access('test.txt').then(() => true).catch(() => false);
    expect(exists).toBe(false);
  });
});
```

**Step 2: Run integration tests**

Run: `npm test -- integration.test.ts`
Expected: Tests PASS

**Step 3: Commit integration tests**

```bash
git add lib/cli/sync/__tests__/integration.test.ts
git commit -m "test(sync): add integration tests for template sync"
```

---

## Task 8: Update Plugin Manifest and Marketplace

**Files:**
- Modify: `.claude-plugin/manifest.json`
- Modify: `/Users/mehran/Documents/github/imehr-marketplace/.claude-plugin/marketplace.json`

**Step 1: Update plugin version in manifest.json**

```json
{
  "name": "blog-cc-framework",
  "version": "1.2.0",
  "displayName": "Blog-CC Framework",
  "description": "Slash commands and agents for blog-cc: content, Twitter bookmarks, template syncing, deployment",
  ...
}
```

**Step 2: Update marketplace.json**

```json
{
  "name": "blog-cc-framework",
  "version": "1.2.0",
  "description": "Slash commands for blog-cc: AI content generation, Twitter bookmarks, template syncing, GitHub Pages deployment",
  "keywords": [
    "blog",
    "static-site",
    "nextjs",
    "template-sync",
    "git-cherry-pick",
    ...
  ]
}
```

**Step 3: Commit version updates**

```bash
git add .claude-plugin/manifest.json
git commit -m "chore: bump version to 1.2.0"

cd /Users/mehran/Documents/github/imehr-marketplace
git add .claude-plugin/marketplace.json
git commit -m "chore: update blog-cc-framework to v1.2.0"
```

---

## Task 9: Build and Test Full System

**Step 1: Build TypeScript**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Run all tests**

Run: `npm test`
Expected: All tests PASS

**Step 3: Manual smoke test**

```bash
# In blog-cc-framework directory
cd /Users/mehran/Documents/github/narragreen

# Try dry-run
node /path/to/blog-cc-framework/dist/cli/sync/template-sync.js --dry-run

# Verify it shows commits
# Expected: Shows commits from blog-cc template
```

**Step 4: Commit if any fixes needed**

```bash
git add .
git commit -m "fix(sync): address issues from smoke testing"
```

---

## Task 10: Release and Tag

**Step 1: Tag release in blog-cc-framework**

```bash
cd /Users/mehran/Documents/github/blog-cc-framework
git tag v1.2.0
git push origin main --tags
```

**Step 2: Push marketplace updates**

```bash
cd /Users/mehran/Documents/github/imehr-marketplace
git push origin main
```

**Step 3: Test plugin installation**

```bash
# In Claude Code
/plugin update blog-cc-framework

# Verify command available
/blog-sync-template --dry-run
```

---

## Testing Checklist

Manual testing on actual sites:

- [ ] Run `/blog-sync-template --dry-run` on narragreen
- [ ] Run `/blog-sync-template --dry-run` on applied-ai
- [ ] Apply one commit to narragreen
- [ ] Verify build still passes
- [ ] Test conflict resolution with custom page.tsx
- [ ] Test rollback mechanism
- [ ] Test skip commit functionality
- [ ] Verify package.json detection works
- [ ] Test on clean site (all commits applied)
- [ ] Test filter by path option

---

## Success Criteria

- ✅ All unit tests pass
- ✅ Integration tests pass
- ✅ Build completes without errors
- ✅ Command appears in Claude Code plugin
- ✅ Dry-run mode works on real sites
- ✅ Can successfully sync one commit
- ✅ Conflict resolution flows work
- ✅ Rollback mechanism functions
- ✅ Documentation is complete

---

## Notes for Implementation

1. **Shell escaping:** All git commands use existing `escapeShellArg` function from git-helper
2. **Error handling:** Wrap all execAsync calls in try-catch
3. **User input:** Use readline for interactive prompts
4. **Styling:** Use chalk for colored output (already in dependencies)
5. **Testing:** Mock child_process.exec in all tests
6. **DRY principle:** Reuse existing git-helper utils where possible
7. **YAGNI:** Don't add features like "sync to multiple sites" yet
8. **TDD:** Write test first, see it fail, implement, see it pass, commit

## Commit Message Convention

```
feat(sync): add <feature>
fix(sync): fix <bug>
test(sync): add test for <case>
docs(sync): document <feature>
chore: bump version to X.Y.Z
```
