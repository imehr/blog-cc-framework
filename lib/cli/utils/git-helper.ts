import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CommitOptions {
  tag?: string;
  push?: boolean;
}

/**
 * Auto-commit files with standardized message
 */
export async function autoCommit(
  message: string,
  files: string[],
  options: CommitOptions = {}
): Promise<void> {
  try {
    // Stage files
    if (files.length > 0) {
      const filesArg = files.map(f => `"${f}"`).join(' ');
      await execAsync(`git add ${filesArg}`);
    }

    // Commit with framework signature
    const fullMessage = `${message}\n\n🤖 Generated with blog-cc-framework`;
    await execAsync(`git commit -m "${escapeShellArg(fullMessage)}"`);

    // Optional tagging (for deployments)
    if (options.tag) {
      await execAsync(`git tag "${options.tag}"`);
    }

    // Optional push
    if (options.push) {
      await execAsync('git push');
      if (options.tag) {
        await execAsync('git push --tags');
      }
    }
  } catch (error) {
    throw new Error(`Git operation failed: ${error}`);
  }
}

/**
 * Create deployment tag
 */
export function createDeploymentTag(siteName: string): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  return `deploy/${siteName}/${date}-${time}`;
}

/**
 * Get latest deployment tag for a site
 */
export async function getLatestDeploymentTag(siteName: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(
      `git tag -l "deploy/${siteName}/*" --sort=-version:refname`
    );
    const tags = stdout.trim().split('\n').filter(Boolean);
    return tags[0] || null;
  } catch {
    return null;
  }
}

/**
 * Check if working directory is clean
 */
export async function isWorkingDirectoryClean(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('git status --porcelain');
    return stdout.trim() === '';
  } catch {
    return false;
  }
}

/**
 * Get current branch name
 */
export async function getCurrentBranch(): Promise<string> {
  try {
    const { stdout } = await execAsync('git branch --show-current');
    return stdout.trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Check if branch is up to date with remote
 */
export async function isUpToDateWithRemote(): Promise<boolean> {
  try {
    await execAsync('git fetch');
    const { stdout } = await execAsync('git status -sb');
    return !stdout.includes('behind');
  } catch {
    return false;
  }
}

function escapeShellArg(arg: string): string {
  return arg.replace(/"/g, '\\"');
}
