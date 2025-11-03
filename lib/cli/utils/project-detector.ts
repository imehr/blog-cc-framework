import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Check if directory is a blog-cc project
 * Requirements:
 * - content/ directory exists
 * - content/collections/ or content/pages/ exists
 * - next.config.js exists OR CONTENT-GUIDE.md exists
 */
export async function isBlogCCProject(dir: string): Promise<boolean> {
  try {
    // Check for content directory
    const contentDir = path.join(dir, 'content');
    const contentStat = await fs.stat(contentDir);
    if (!contentStat.isDirectory()) {
      return false;
    }

    // Check for collections or pages subdirectory
    const collectionsExists = await fileExists(path.join(contentDir, 'collections'));
    const pagesExists = await fileExists(path.join(contentDir, 'pages'));

    if (!collectionsExists && !pagesExists) {
      return false;
    }

    // Check for next.config.js or CONTENT-GUIDE.md
    const nextConfigExists = await fileExists(path.join(dir, 'next.config.js'));
    const contentGuideExists = await fileExists(path.join(dir, 'CONTENT-GUIDE.md'));

    return nextConfigExists || contentGuideExists;
  } catch (error) {
    return false;
  }
}

/**
 * Detect blog-cc project root by traversing up from current directory
 */
export async function detectProjectRoot(startDir: string): Promise<string | null> {
  let currentDir = path.resolve(startDir);
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    if (await isBlogCCProject(currentDir)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
