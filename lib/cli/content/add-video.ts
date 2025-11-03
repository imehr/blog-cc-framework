import * as fs from 'fs/promises';
import * as path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import { generateMarkdownWithFrontmatter } from '../utils/yaml-handler.js';
import { extractYouTubeMetadata, generateContentWithAI, extractYouTubeId } from './ai-generator.js';
import { autoCommit } from '../utils/git-helper.js';
import { loadBlogCCConfig } from '../utils/config-loader.js';

export interface AddVideoOptions {
  url?: string;
  title?: string;
  author?: string;
  tags?: string[];
  description?: string;
  duration?: string;
  interactive?: boolean;
  collectionType?: 'videos' | 'tutorials' | 'courses';
}

/**
 * Add a video to the blog-cc site
 * Supports three modes:
 * 1. URL only (AI extracts metadata)
 * 2. Full args (manual specification)
 * 3. Interactive prompts
 */
export async function addVideo(
  projectRoot: string,
  options: AddVideoOptions = {}
): Promise<void> {
  console.log(chalk.blue('📹 Adding video to blog-cc site...\n'));

  const config = await loadBlogCCConfig(projectRoot);

  let videoData: {
    url: string;
    title: string;
    author: string;
    duration?: string;
    description: string;
    tags: string[];
    collectionType: 'videos' | 'tutorials' | 'courses';
  };

  // Mode 1: URL only - AI extracts metadata
  if (options.url && !options.title) {
    console.log(chalk.cyan('🤖 Extracting metadata from URL...\n'));

    const metadata = await extractYouTubeMetadata(options.url);
    if (!metadata) {
      console.error(chalk.red('❌ Failed to extract metadata from URL'));
      process.exit(1);
    }

    console.log(chalk.green('✓ Metadata extracted:'));
    console.log(`  Title: ${metadata.title}`);
    console.log(`  Author: ${metadata.author}`);
    console.log(`  Duration: ${metadata.duration || 'unknown'}\n`);

    console.log(chalk.cyan('🤖 Generating enhanced content with AI...\n'));

    const aiContent = await generateContentWithAI(metadata.title, metadata.description);

    console.log(chalk.green('✓ AI analysis complete:'));
    console.log(`  Suggested tags: ${aiContent.tags.join(', ')}`);
    console.log(`  Collection type: ${aiContent.collectionType}\n`);

    // Show preview and confirm
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: 'Does this look correct?',
      initial: true
    });

    if (!confirm) {
      console.log(chalk.yellow('Operation cancelled'));
      process.exit(0);
    }

    videoData = {
      url: options.url,
      title: metadata.title,
      author: metadata.author,
      duration: metadata.duration,
      description: aiContent.description,
      tags: aiContent.tags,
      collectionType: aiContent.collectionType
    };
  }
  // Mode 2: Full args provided
  else if (options.url && options.title && options.author) {
    videoData = {
      url: options.url,
      title: options.title,
      author: options.author,
      duration: options.duration,
      description: options.description || `Learn about ${options.title}`,
      tags: options.tags || [],
      collectionType: options.collectionType || 'videos'
    };
  }
  // Mode 3: Interactive prompts
  else {
    const responses = await prompts([
      {
        type: 'text',
        name: 'url',
        message: 'YouTube URL?',
        initial: options.url,
        validate: (value) => value ? true : 'URL is required'
      },
      {
        type: 'text',
        name: 'title',
        message: 'Video title?',
        initial: options.title
      },
      {
        type: 'text',
        name: 'author',
        message: 'Author/Channel?',
        initial: options.author
      },
      {
        type: 'text',
        name: 'duration',
        message: 'Duration (e.g., 45:30)?',
        initial: options.duration
      },
      {
        type: 'text',
        name: 'description',
        message: 'Description?',
        initial: options.description
      },
      {
        type: 'list',
        name: 'tags',
        message: 'Tags (comma-separated)?',
        initial: options.tags?.join(', ') || ''
      },
      {
        type: 'select',
        name: 'collectionType',
        message: 'Collection type?',
        choices: [
          { title: 'Videos', value: 'videos' },
          { title: 'Tutorials', value: 'tutorials' },
          { title: 'Courses', value: 'courses' }
        ],
        initial: 0
      }
    ]);

    if (!responses.url) {
      console.log(chalk.yellow('Operation cancelled'));
      process.exit(0);
    }

    videoData = {
      url: responses.url,
      title: responses.title,
      author: responses.author,
      duration: responses.duration,
      description: responses.description,
      tags: responses.tags ? responses.tags.split(',').map((t: string) => t.trim()) : [],
      collectionType: responses.collectionType
    };
  }

  // Create slug from title
  const slug = createSlug(videoData.title);

  // Create frontmatter
  const frontmatter = {
    title: videoData.title,
    author: videoData.author,
    url: videoData.url,
    ...(videoData.duration && { duration: videoData.duration }),
    tags: videoData.tags,
    description: videoData.description,
    order: 1 // TODO: Auto-increment from existing files
  };

  // Generate markdown content
  const markdown = generateMarkdownWithFrontmatter(frontmatter, '');

  // Write to file
  const collectionDir = path.join(config.contentDir, 'collections', videoData.collectionType);
  await fs.mkdir(collectionDir, { recursive: true });

  const filePath = path.join(collectionDir, `${slug}.md`);
  await fs.writeFile(filePath, markdown, 'utf-8');

  console.log(chalk.green(`\n✓ Video added: ${filePath}`));

  // Auto-commit
  await autoCommit(
    `feat: add ${videoData.collectionType.slice(0, -1)} '${videoData.title}'`,
    [filePath]
  );

  console.log(chalk.green('✓ Changes committed\n'));
  console.log(chalk.cyan('Next steps:'));
  console.log('  - Run ./start.sh to preview');
  console.log('  - Run /blog deploy to publish\n');
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
