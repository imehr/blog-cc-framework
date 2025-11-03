import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { loadBlogCCConfig, BlogCCConfig } from './config-loader.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('loadBlogCCConfig', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-cc-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('loads config with theme from .env', async () => {
    await fs.writeFile(
      path.join(tempDir, '.env'),
      'THEME=moss\n'
    );
    await fs.mkdir(path.join(tempDir, 'content'));
    await fs.writeFile(
      path.join(tempDir, 'content', 'home.md'),
      '---\ntitle: "My Site"\n---\n'
    );

    const config = await loadBlogCCConfig(tempDir);

    expect(config.theme).toBe('moss');
    expect(config.siteTitle).toBe('My Site');
  });

  test('uses default theme when .env missing', async () => {
    await fs.mkdir(path.join(tempDir, 'content'));
    await fs.writeFile(
      path.join(tempDir, 'content', 'home.md'),
      '---\ntitle: "Test"\n---\n'
    );

    const config = await loadBlogCCConfig(tempDir);

    expect(config.theme).toBe('iris'); // default
  });

  test('loads BASE_PATH from .env.production', async () => {
    await fs.writeFile(
      path.join(tempDir, '.env.production'),
      'BASE_PATH=/my-site\n'
    );
    await fs.mkdir(path.join(tempDir, 'content'));

    const config = await loadBlogCCConfig(tempDir);

    expect(config.basePath).toBe('/my-site');
  });
});
