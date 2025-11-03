import * as fs from 'fs/promises';
import * as path from 'path';
import { parseMarkdownWithFrontmatter } from './yaml-handler.js';

export interface BlogCCConfig {
  projectRoot: string;
  theme: string;
  basePath: string;
  siteTitle: string;
  contentDir: string;
}

/**
 * Load blog-cc configuration from project directory
 */
export async function loadBlogCCConfig(projectRoot: string): Promise<BlogCCConfig> {
  const theme = await loadThemeFromEnv(projectRoot);
  const basePath = await loadBasePathFromEnv(projectRoot);
  const siteTitle = await loadSiteTitleFromHome(projectRoot);

  return {
    projectRoot,
    theme: theme || 'iris', // default theme
    basePath: basePath || '',
    siteTitle: siteTitle || 'My Site',
    contentDir: path.join(projectRoot, 'content')
  };
}

async function loadThemeFromEnv(projectRoot: string): Promise<string | null> {
  try {
    const envPath = path.join(projectRoot, '.env');
    const envContent = await fs.readFile(envPath, 'utf-8');
    const match = envContent.match(/THEME=([^\n\r]+)/);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

async function loadBasePathFromEnv(projectRoot: string): Promise<string | null> {
  try {
    // Try .env.production first
    const envProdPath = path.join(projectRoot, '.env.production');
    const envProdContent = await fs.readFile(envProdPath, 'utf-8');
    const match = envProdContent.match(/BASE_PATH=([^\n\r]+)/);
    if (match) {
      return match[1].trim();
    }
  } catch {}

  try {
    // Fallback to .env
    const envPath = path.join(projectRoot, '.env');
    const envContent = await fs.readFile(envPath, 'utf-8');
    const match = envContent.match(/BASE_PATH=([^\n\r]+)/);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

async function loadSiteTitleFromHome(projectRoot: string): Promise<string | null> {
  try {
    const homePath = path.join(projectRoot, 'content', 'home.md');
    const homeContent = await fs.readFile(homePath, 'utf-8');
    const parsed = parseMarkdownWithFrontmatter(homeContent);
    return parsed.data.title || null;
  } catch {
    return null;
  }
}
