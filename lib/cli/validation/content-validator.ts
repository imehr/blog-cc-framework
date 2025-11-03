import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import { parseMarkdownWithFrontmatter } from '../utils/yaml-handler.js';
import { loadBlogCCConfig } from '../utils/config-loader.js';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  filesChecked: number;
}

export interface ValidationError {
  file: string;
  message: string;
  type: 'schema' | 'duplicate' | 'structure';
}

export interface ValidationWarning {
  file: string;
  message: string;
  type: 'link' | 'asset' | 'content';
}

const COLLECTION_SCHEMAS = {
  videos: ['title', 'author', 'url'],
  podcasts: ['title', 'host', 'url'],
  people: ['name', 'role', 'url'],
  products: ['name', 'description', 'url'],
  courses: ['title', 'provider', 'url'],
  tutorials: ['title', 'author', 'url'],
  books: ['title', 'author'],
  repos: ['title', 'owner', 'url'],
  tweets: ['author', 'content', 'url']
};

/**
 * Validate all content files in blog-cc project
 */
export async function validateContent(projectRoot: string): Promise<ValidationResult> {
  console.log(chalk.blue('🔍 Validating content...\n'));

  const config = await loadBlogCCConfig(projectRoot);
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  let filesChecked = 0;

  // Validate collections
  const collectionsDir = path.join(config.contentDir, 'collections');
  try {
    const collections = await fs.readdir(collectionsDir);

    for (const collection of collections) {
      const collectionPath = path.join(collectionsDir, collection);
      const stat = await fs.stat(collectionPath);

      if (stat.isDirectory()) {
        const collectionErrors = await validateCollection(
          collectionPath,
          collection as keyof typeof COLLECTION_SCHEMAS,
          errors,
          warnings
        );
        filesChecked += collectionErrors;
      }
    }
  } catch (error) {
    errors.push({
      file: 'collections/',
      message: 'Collections directory not found',
      type: 'structure'
    });
  }

  // Validate pages/blog posts
  const pagesDir = path.join(config.contentDir, 'pages');
  try {
    const pagesErrors = await validatePages(pagesDir, errors, warnings);
    filesChecked += pagesErrors;
  } catch (error) {
    // Pages directory optional
  }

  // Validate courses
  const coursesDir = path.join(config.contentDir, 'courses');
  try {
    const coursesErrors = await validateCourses(coursesDir, errors, warnings);
    filesChecked += coursesErrors;
  } catch (error) {
    // Courses directory optional
  }

  // Report results
  console.log(chalk.cyan(`\n📊 Validation complete: ${filesChecked} files checked\n`));

  if (errors.length === 0 && warnings.length === 0) {
    console.log(chalk.green('✓ All content valid!\n'));
  } else {
    if (errors.length > 0) {
      console.log(chalk.red(`❌ ${errors.length} errors found:\n`));
      errors.forEach(err => {
        console.log(chalk.red(`  [${err.type}] ${err.file}: ${err.message}`));
      });
      console.log();
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow(`⚠ ${warnings.length} warnings:\n`));
      warnings.forEach(warn => {
        console.log(chalk.yellow(`  [${warn.type}] ${warn.file}: ${warn.message}`));
      });
      console.log();
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    filesChecked
  };
}

async function validateCollection(
  collectionPath: string,
  collectionType: keyof typeof COLLECTION_SCHEMAS,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<number> {
  const files = await fs.readdir(collectionPath);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  const slugs = new Set<string>();
  const requiredFields = COLLECTION_SCHEMAS[collectionType] || [];

  for (const file of mdFiles) {
    const filePath = path.join(collectionPath, file);
    const content = await fs.readFile(filePath, 'utf-8');

    try {
      const parsed = parseMarkdownWithFrontmatter(content);

      // Check required fields
      for (const field of requiredFields) {
        if (!parsed.data[field]) {
          errors.push({
            file: path.relative(collectionPath, filePath),
            message: `Missing required field: ${field}`,
            type: 'schema'
          });
        }
      }

      // Check for duplicate slugs
      const slug = path.parse(file).name;
      if (slugs.has(slug)) {
        errors.push({
          file: path.relative(collectionPath, filePath),
          message: `Duplicate slug: ${slug}`,
          type: 'duplicate'
        });
      }
      slugs.add(slug);

    } catch (error) {
      errors.push({
        file: path.relative(collectionPath, filePath),
        message: `Failed to parse frontmatter: ${error}`,
        type: 'schema'
      });
    }
  }

  return mdFiles.length;
}

async function validatePages(
  pagesDir: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<number> {
  const files = await fs.readdir(pagesDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  for (const file of mdFiles) {
    const filePath = path.join(pagesDir, file);
    const content = await fs.readFile(filePath, 'utf-8');

    try {
      const parsed = parseMarkdownWithFrontmatter(content);

      // Blog posts should have date
      if (parsed.data.date) {
        const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(parsed.data.date);
        if (!dateValid) {
          errors.push({
            file: `pages/${file}`,
            message: 'Invalid date format (should be YYYY-MM-DD)',
            type: 'schema'
          });
        }
      }

      // Pages should have title
      if (!parsed.data.title) {
        errors.push({
          file: `pages/${file}`,
          message: 'Missing required field: title',
          type: 'schema'
        });
      }
    } catch (error) {
      errors.push({
        file: `pages/${file}`,
        message: `Failed to parse frontmatter: ${error}`,
        type: 'schema'
      });
    }
  }

  return mdFiles.length;
}

async function validateCourses(
  coursesDir: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<number> {
  let filesChecked = 0;
  const courses = await fs.readdir(coursesDir);

  for (const course of courses) {
    const coursePath = path.join(coursesDir, course);
    const stat = await fs.stat(coursePath);

    if (stat.isDirectory()) {
      // Validate course.md
      const courseFile = path.join(coursePath, 'course.md');
      try {
        const content = await fs.readFile(courseFile, 'utf-8');
        parseMarkdownWithFrontmatter(content); // Throws if invalid
        filesChecked++;
      } catch (error) {
        errors.push({
          file: `courses/${course}/course.md`,
          message: 'Missing or invalid course.md',
          type: 'structure'
        });
      }

      // Check for modules directory
      const modulesDir = path.join(coursePath, 'modules');
      try {
        await fs.access(modulesDir);
      } catch {
        errors.push({
          file: `courses/${course}/`,
          message: 'Missing modules/ directory',
          type: 'structure'
        });
      }
    }
  }

  return filesChecked;
}
