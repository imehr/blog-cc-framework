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
          filesChanged: [...filesChanged],
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
      filesChanged: [...filesChanged],
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
