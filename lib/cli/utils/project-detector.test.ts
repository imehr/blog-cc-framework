import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { isBlogCCProject, detectProjectRoot } from './project-detector.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('isBlogCCProject', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-cc-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('returns true for valid blog-cc project', async () => {
    // Create blog-cc structure
    await fs.mkdir(path.join(tempDir, 'content'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'content', 'collections'));
    await fs.mkdir(path.join(tempDir, 'content', 'pages'));
    await fs.writeFile(
      path.join(tempDir, 'next.config.js'),
      'module.exports = { basePath: "" }'
    );
    await fs.writeFile(
      path.join(tempDir, 'CONTENT-GUIDE.md'),
      '# Content Guide'
    );

    const result = await isBlogCCProject(tempDir);
    expect(result).toBe(true);
  });

  test('returns false for non-blog-cc project', async () => {
    const result = await isBlogCCProject(tempDir);
    expect(result).toBe(false);
  });

  test('returns false for missing content directory', async () => {
    await fs.writeFile(
      path.join(tempDir, 'next.config.js'),
      'module.exports = {}'
    );

    const result = await isBlogCCProject(tempDir);
    expect(result).toBe(false);
  });
});

describe('detectProjectRoot', () => {
  test('returns null when not in blog-cc project', async () => {
    const result = await detectProjectRoot('/tmp/nonexistent');
    expect(result).toBeNull();
  });
});
