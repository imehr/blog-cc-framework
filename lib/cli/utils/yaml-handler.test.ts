import { describe, test, expect } from '@jest/globals';
import { parseMarkdownWithFrontmatter, generateMarkdownWithFrontmatter } from './yaml-handler.js';

describe('parseMarkdownWithFrontmatter', () => {
  test('parses YAML frontmatter and content', () => {
    const input = `---
title: "Test Post"
tags: ["ai", "ml"]
---

# Content here`;

    const result = parseMarkdownWithFrontmatter(input);

    expect(result.data.title).toBe('Test Post');
    expect(result.data.tags).toEqual(['ai', 'ml']);
    expect(result.content.trim()).toBe('# Content here');
  });

  test('handles empty frontmatter', () => {
    const input = `---
---

Content only`;

    const result = parseMarkdownWithFrontmatter(input);

    expect(result.data).toEqual({});
    expect(result.content.trim()).toBe('Content only');
  });
});

describe('generateMarkdownWithFrontmatter', () => {
  test('generates markdown with frontmatter', () => {
    const data = {
      title: 'My Post',
      date: '2025-11-03',
      tags: ['test']
    };
    const content = 'Post content here';

    const result = generateMarkdownWithFrontmatter(data, content);

    expect(result).toContain('---');
    expect(result).toContain('title: My Post');
    expect(result).toContain('date: "2025-11-03"');
    expect(result).toContain('tags:');
    expect(result).toContain('  - test');
    expect(result).toContain('Post content here');
  });
});
