# Blog-CC Framework Slash Commands Reference

**Version:** 1.0.2

This reference documents all slash commands and agents available in the blog-cc-framework plugin for Claude Code. Use these commands to manage blog-cc static sites with AI-powered content generation, validation, and GitHub Pages deployment.

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Core Commands](#core-commands)
   - [/blog-init](#blog-init)
   - [/blog-add-video](#blog-add-video)
   - [/blog-validate](#blog-validate)
   - [/blog-deploy](#blog-deploy)
   - [/blog-theme](#blog-theme)
3. [Command Reference](#command-reference)
4. [Agent Architecture](#agent-architecture)
5. [Orchestration Patterns](#orchestration-patterns)

---

## Installation & Setup

### Install Plugin

```bash
# From Claude Code
claude plugin install imehr/blog-cc-framework
```

### Command Naming

All commands are available in two forms:

**Short form** (recommended):
```bash
/blog-init
/blog-add-video
/blog-validate
/blog-deploy
/blog-theme
```

**Namespaced form** (for disambiguation):
```bash
/blog-cc-framework:blog-init
/blog-cc-framework:blog-add-video
/blog-cc-framework:blog-validate
/blog-cc-framework:blog-deploy
/blog-cc-framework:blog-theme
```

Both forms work identically. Claude Code's autocomplete may show the namespaced form, but you can use the shorter version.

### Initialize New Site

```bash
/blog-init
```

**What it does:**
1. Detects if already initialized
2. Runs configuration wizard
3. Sets theme, BASE_PATH, site title
4. Creates GitHub setup checklist
5. Commits initial configuration

**Output example:**
```
🚀 Initializing new blog-cc site...

Site name? (e.g., "Applied AI"): Applied AI

Choose theme:
  1. Iris (Tech Blue - default)
  2. Lavender (Creative Purple)
  3. Sakura (Warm Pink)
  4. Moss (Developer Green)
  5. Amber (Bold Orange)
  6. Orchid (Luxury Purple)
  7. Slate (Professional Gray)
  8. Rose (Editorial Red-Pink)
  9. Sage (Calm Green-Gray)

? Your choice: 6 (Orchid)

Deployment path? (e.g., /applied-ai): /applied-ai

GitHub repository? (e.g., Piazr/applied-ai): Piazr/applied-ai

Applying configuration...
✓ .env created: THEME=orchid
✓ content/home.md updated: title="Applied AI"
✓ .env.production created: BASE_PATH=/applied-ai
✓ Changes committed

Next steps for GitHub Pages deployment:

1. Create repository on GitHub:
   https://github.com/Piazr/applied-ai

2. Set repository variables (Settings → Secrets → Variables):
   THEME = orchid
   BASE_PATH = /applied-ai

3. Enable GitHub Pages (Settings → Pages):
   Source: GitHub Actions

4. Push to GitHub:
   git remote add origin https://github.com/Piazr/applied-ai.git
   git push -u origin main

5. Deploy:
   /blog-deploy

Save instructions to SETUP.md? (y/N): y

✓ Instructions saved to SETUP.md
```

---

## Core Commands

### /blog-init

**Purpose:** Initialize a new blog-cc site from template clone.

**Usage:**
```bash
/blog-init
```

**Modes:**
- Interactive wizard (default)

**Agent behavior:**
1. Checks if site is already initialized
2. Prompts for site name, theme, BASE_PATH, GitHub repo
3. Creates `.env` with THEME
4. Updates `content/home.md` with title
5. Creates `.env.production` with BASE_PATH
6. Generates GitHub setup checklist
7. Commits configuration with framework signature

**Related commands:**
- `/blog-theme` - Change theme after init
- `/blog-deploy` - Deploy site

**Full documentation:** [commands/blog-init.md](commands/blog-init.md)

---

### /blog-add-video

**Purpose:** Add YouTube videos to your blog-cc site with AI-powered metadata extraction.

**Usage:**
```bash
/blog-add-video <youtube-url>
/blog-add-video  # Interactive mode
```

**Examples:**
```bash
# URL-only (AI generates description and tags)
/blog-add-video https://youtube.com/watch?v=kCc8FmEb1nY

# Interactive mode (manual fields)
/blog-add-video
```

**Agent behavior:**
1. Extracts metadata from YouTube (title, author, duration)
2. Uses Claude AI to:
   - Generate enhanced description
   - Suggest relevant tags
   - Determine best collection type (videos/tutorials/courses)
3. Creates markdown file at `content/collections/[type]/[slug].md`
4. Commits changes with descriptive message

**Output example:**
```
📹 Adding video to blog-cc site...

🤖 Extracting metadata from URL...
✓ Metadata extracted:
  Title: Introduction to Transformers
  Author: Andrej Karpathy
  Duration: 45:30

🤖 Generating enhanced content with AI...
✓ AI analysis complete:
  Suggested tags: AI, Deep Learning, NLP, Transformers
  Collection type: tutorials

Does this look correct? (y/N): y

✓ Video added: content/collections/tutorials/introduction-to-transformers.md
✓ Changes committed

Next steps:
  - Run ./start.sh to preview
  - Run /blog-deploy to publish
```

**Related commands:**
- `/blog-validate` - Validate content after adding
- `/blog-deploy` - Deploy site

**Full documentation:** [commands/blog-add-video.md](commands/blog-add-video.md)

---

### /blog-validate

**Purpose:** Validate all content for schema compliance, duplicates, and structure issues.

**Usage:**
```bash
/blog-validate
```

**Agent behavior:**
1. Scans all content directories (collections/, pages/, courses/)
2. Validates YAML frontmatter schemas for each collection type
3. Checks for duplicate slugs across collections
4. Validates date formats in blog posts
5. Verifies course structure (course.md + modules/)
6. Reports errors (blocking) and warnings (non-blocking)

**Collection schemas validated:**
- **videos**: title, author, url
- **podcasts**: title, host, url
- **people**: name, role, url
- **products**: name, description, url
- **courses**: title, provider, url
- **tutorials**: title, author, url
- **books**: title, author
- **repos**: title, owner, url
- **tweets**: author, content, url

**Output example (success):**
```
🔍 Validating content...

📊 Validation complete: 168 files checked

✓ All content valid!

Summary:
  ✓ 45 videos validated
  ✓ 12 podcasts validated
  ✓ 8 people validated
  ✓ 15 products validated
  ✓ 23 blog posts validated
  ✓ 2 courses validated (19 lessons)
  ✓ No duplicate slugs found
  ✓ All schemas valid
```

**Output example (with errors):**
```
🔍 Validating content...

📊 Validation complete: 168 files checked

❌ 3 errors found:

  [schema] videos/my-video.md: Missing required field: author
  [duplicate] tutorials/intro.md: Duplicate slug 'intro'
  [schema] pages/my-post.md: Invalid date format (should be YYYY-MM-DD)

⚠ 2 warnings:

  [link] pages/about.md: External link returns 404
  [content] videos/old-video.md: No description provided

Please fix errors before deploying.
```

**Related commands:**
- `/blog-add-video` - Add content (auto-validates)
- `/blog-deploy` - Deploy (runs validation first)

**Full documentation:** [commands/blog-validate.md](commands/blog-validate.md)

---

### /blog-deploy

**Purpose:** Deploy your blog-cc site to GitHub Pages with full validation and monitoring.

**Usage:**
```bash
/blog-deploy             # Full validation and deployment
/blog-deploy --force     # Skip validation checks
/blog-deploy --dry-run   # Test without deploying
```

**Agent behavior:**

**1. Pre-deploy checks:**
- Content validation (schema, duplicates, structure)
- Build test with current theme
- Theme compatibility verification
- Git status check (uncommitted changes, branch)
- Configuration validation (BASE_PATH, THEME, etc.)

**2. Deployment:**
- Creates deployment tag: `deploy/[site]/YYYY-MM-DD-HH-MM-SS`
- Pushes to GitHub main branch
- Triggers GitHub Actions workflow
- Monitors deployment progress

**3. Post-deployment:**
- Reports deployment status
- Provides live URL
- Suggests rollback if needed

**Output example:**
```
🚀 Deploying to GitHub Pages...

Pre-deploy checks:
  ✓ Content validation passed (168 files)
  ✓ Build successful (2m 34s)
  ✓ Theme 'orchid' applied correctly
  ✓ 127 pages generated
  ✓ All internal links valid
  ⚠ Warning: 3 uncommitted changes
  ⚠ Warning: On branch 'feature-test', not 'main'

Configuration:
  - Site: applied-ai
  - Theme: orchid
  - BASE_PATH: /applied-ai
  - Target: https://piazr.github.io/applied-ai/

Deploy anyway? (y/N): y

Creating deploy tag: deploy/applied-ai/2025-11-03-14-45
✓ Tag created
✓ Pushed to GitHub

Monitoring deployment:
  ✓ Pushed to GitHub
  ✓ Workflow triggered (run #123)
  ⏳ Building... (1m 15s)
  ⏳ Deploying... (2m 40s)
  ✓ Deployed successfully!

Live at: https://piazr.github.io/applied-ai/

🎉 Deployment complete!
```

**Modes:**

**--force (Quick deploy, skip validation):**
```bash
/blog-deploy --force

⚠️ Quick deploy - skipping validation checks

This could deploy broken content!

Continue? (y/N): y

Deploying without validation...
✓ Deployed
```

**--dry-run (Test without deploying):**
```bash
/blog-deploy --dry-run

Running deployment dry run...

✓ Content validation: PASS
✓ Build test: PASS (2m 31s)
✓ Theme compatibility: PASS
✓ Git status: CLEAN
✓ Configuration: VALID

Deployment would:
  1. Create tag: deploy/applied-ai/2025-11-03-14-50
  2. Push to: origin/main
  3. Trigger workflow: .github/workflows/deploy.yml
  4. Deploy to: https://piazr.github.io/applied-ai/

Estimated time: ~3 minutes

Ready to deploy for real? (y/N)
```

**Rollback:**
```bash
/blog-rollback

Finding latest deployment...

Last deployment: deploy/applied-ai/2025-11-03-12-15
Current deployment: deploy/applied-ai/2025-11-03-14-45

Changes that will be reverted:
  M  content/collections/videos/new-video.md (added)
  M  content/pages/blog-post.md (modified)

Rollback to previous version? (y/N): y

✓ Created rollback branch: rollback/2025-11-03-14-50
✓ Checked out: deploy/applied-ai/2025-11-03-12-15
✓ Pushed to GitHub

Re-deployment triggered...
⏳ Building...
✓ Rolled back successfully!
```

**Related commands:**
- `/blog-validate` - Validate before deploying
- `/blog-theme` - Switch theme before deploy

**Full documentation:** [commands/blog-deploy.md](commands/blog-deploy.md)

---

### /blog-theme

**Purpose:** Switch theme for your blog-cc site with live preview and comparison.

**Usage:**
```bash
/blog-theme <theme-name>   # Switch theme
/blog-theme --list         # List all themes
/blog-theme --compare <theme1> <theme2>  # Compare themes
```

**Available themes:**
1. **iris** (default) - Tech Blue, Inter font, Vercel-inspired
2. **lavender** - Creative Purple, Playfair Display
3. **sakura** - Warm Pink, Quicksand
4. **moss** - Developer Green, JetBrains Mono
5. **amber** - Bold Orange, Montserrat
6. **orchid** - Luxury Purple, Cormorant Garamond
7. **slate** - Professional Gray, Work Sans
8. **rose** - Editorial Red-Pink, DM Serif Display
9. **sage** - Calm Green-Gray, Merriweather

**Examples:**

**Switch with preview:**
```bash
/blog-theme lavender

🎨 Switching to lavender theme...

✓ .env updated with THEME=lavender

Preview before committing? (y/N): y

Building with lavender theme...
✓ Build successful
✓ Starting preview server on port 4567...

Open http://localhost:4567 in your browser

Keep this theme? (y/N): y

✓ Theme change committed
```

**List all themes:**
```bash
/blog-theme --list

🎨 Available Themes:

1. Iris (default) - Tech Blue
   Font: Inter
   Style: Clean, modern, Vercel-inspired

2. Lavender - Creative Purple
   Font: Playfair Display + Source Sans
   Style: Elegant, editorial

3. Sakura - Warm Pink
   Font: Quicksand + Open Sans
   Style: Friendly, approachable

... (all 9 themes)

Current theme: orchid

Switch theme? (y/N)
```

**Compare themes:**
```bash
/blog-theme --compare moss sakura

Building comparison previews...

✓ Building with moss theme... Done (port 4567)
✓ Building with sakura theme... Done (port 4568)

Opening both in browser...

Which theme do you prefer?
  ❯ Moss
    Sakura
    Neither (keep current: orchid)

? Your choice: Moss

✓ Switching to moss theme
✓ Changes committed
```

**Related commands:**
- `/blog-deploy` - Deploy with new theme
- `/blog-validate` - Validate after theme change

**Full documentation:** [commands/blog-theme.md](commands/blog-theme.md)

---

## Command Reference

### Command Matrix

| Command | Purpose | Primary Mode | Validation | Auto-commit | AI-powered |
|---------|---------|--------------|------------|-------------|------------|
| `/blog-init` | Initialize site | Interactive wizard | ✓ | ✓ | - |
| `/blog-add-video` | Add YouTube video | URL + AI generation | ✓ | ✓ | ✓ |
| `/blog-validate` | Validate content | Scan all content | - | - | - |
| `/blog-deploy` | Deploy to GitHub Pages | Full validation | ✓ | ✓ | - |
| `/blog-theme` | Manage themes | Switch + preview | ✓ | ✓ | - |

### Command Dependencies

```
/blog-init
  ↓
/blog-add-video → /blog-validate → /blog-deploy
  ↓
/blog-theme → /blog-validate → /blog-deploy
```

### Common Workflows

**1. Initialize new site:**
```bash
/blog-init
# Follow wizard prompts
# Set up GitHub repo (manual)
/blog-deploy
```

**2. Add content and deploy:**
```bash
/blog-add-video https://youtube.com/watch?v=VIDEO_ID
# Review generated content
/blog-validate
/blog-deploy
```

**3. Change theme and preview:**
```bash
/blog-theme --list
/blog-theme lavender
# Preview in browser
/blog-deploy
```

**4. Validate before deployment:**
```bash
/blog-validate
# Fix any errors
/blog-deploy --dry-run
# Verify plan
/blog-deploy
```

**5. Quick deploy (skip validation):**
```bash
/blog-deploy --force
```

---

## Agent Architecture

### Agent Types

The blog-cc-framework uses specialized agents for different operations:

**1. Configuration Agent** (`/blog-init`)
- Detects blog-cc project structure
- Runs interactive wizard
- Validates configuration
- Creates setup documentation
- Commits configuration

**2. Content Agent** (`/blog-add-video`)
- Extracts YouTube metadata
- Uses Claude AI for content generation
- Determines optimal collection type
- Creates markdown files
- Commits content additions

**3. Validation Agent** (`/blog-validate`)
- Scans content directories
- Validates YAML schemas
- Checks for duplicates
- Verifies structure
- Reports errors and warnings

**4. Deployment Agent** (`/blog-deploy`)
- Runs pre-deploy checks
- Creates deployment tags
- Monitors GitHub Actions
- Reports deployment status
- Handles rollbacks

**5. Theme Agent** (`/blog-theme`)
- Lists available themes
- Builds preview servers
- Compares themes side-by-side
- Updates configuration
- Commits theme changes

### Agent Communication

Agents communicate through:
- **File system**: Shared content/ directory structure
- **Git**: Commits, tags, branches
- **Configuration files**: .env, .env.production, content/home.md
- **CLI utilities**: Shared TypeScript modules in lib/cli/

---

## Orchestration Patterns

### Pattern 1: Sequential Execution

Execute commands in sequence when they depend on each other:

```bash
/blog-init
# Wait for completion
/blog-add-video https://youtube.com/watch?v=VIDEO_ID
# Wait for completion
/blog-deploy
```

**Use when:**
- Commands depend on previous results
- Need to review output before proceeding
- Want to verify each step

### Pattern 2: Validation-First

Always validate before deployment:

```bash
/blog-validate
# If validation passes:
/blog-deploy
# If validation fails:
# Fix errors, then retry
```

**Use when:**
- Adding multiple pieces of content
- Making bulk changes
- Unsure of content quality

### Pattern 3: Preview-Deploy

Preview changes before committing:

```bash
/blog-theme --compare lavender sakura
# Choose theme
/blog-deploy --dry-run
# Review deployment plan
/blog-deploy
```

**Use when:**
- Testing theme changes
- Want to see before deploying
- Need stakeholder approval

### Pattern 4: Rapid Iteration

Quick deploy for rapid development:

```bash
/blog-add-video https://youtube.com/watch?v=VIDEO_ID
/blog-deploy --force
```

**Use when:**
- Development environment
- Confident in content quality
- Need fast feedback loop

### Pattern 5: Safe Deployment

Full validation with rollback plan:

```bash
/blog-validate
/blog-deploy --dry-run
/blog-deploy
# If issues occur:
/blog-rollback
```

**Use when:**
- Production environment
- Mission-critical changes
- Need safety guarantees

---

## Implementation Details

### CLI Utilities (lib/cli/)

The framework provides these tested utilities:

**1. YAML Handler** (`utils/yaml-handler.ts`)
- `parseMarkdownWithFrontmatter(content: string)`
- `generateMarkdownWithFrontmatter(frontmatter: object, body: string)`
- Custom date quoting for YAML Scalar API

**2. Project Detector** (`utils/project-detector.ts`)
- `isBlogCCProject(dir: string): boolean`
- `detectProjectRoot(): string | null`
- Validates blog-cc structure

**3. Git Helper** (`utils/git-helper.ts`)
- `autoCommit(files: string[], message: string)`
- `createDeploymentTag(siteName: string): string`
- Comprehensive shell escaping for security

**4. Config Loader** (`utils/config-loader.ts`)
- `loadBlogCCConfig(projectRoot: string)`
- Loads theme, BASE_PATH, siteTitle
- Defaults to 'iris' theme

**5. AI Generator** (`content/ai-generator.ts`)
- `extractYouTubeMetadata(url: string)`
- `generateContentWithAI(metadata: object)`
- YouTube URL validation (SSRF protection)

**6. Content Validator** (`validation/content-validator.ts`)
- `validateContent(projectRoot: string)`
- Schema validation for 9 collection types
- Duplicate detection, structure checks

### Security Features

**1. Shell Injection Protection:**
- All git commands use comprehensive escaping
- Escapes: backslashes, quotes, backticks, dollar signs, newlines

**2. SSRF Protection:**
- YouTube URL validation before fetching
- Only allows youtube.com and youtu.be domains

**3. Content Validation:**
- YAML schema validation prevents malformed frontmatter
- Duplicate slug detection prevents routing conflicts
- Date format validation ensures proper parsing

---

## Troubleshooting

### Slash Commands Not Recognized

**Problem:** `/blog-*` commands don't appear in Claude Code.

**Solution:**
1. Verify plugin installation: `claude plugin list`
2. Check plugin version: Should be 1.0.2 or higher
3. Reinstall: `claude plugin uninstall blog-cc-framework && claude plugin install imehr/blog-cc-framework`
4. Restart Claude Code

### Deployment Fails

**Problem:** `/blog-deploy` fails with errors.

**Solution:**
1. Run `/blog-validate` to check content
2. Fix reported errors
3. Check GitHub repository variables (THEME, BASE_PATH)
4. Verify GitHub Pages is enabled (Settings → Pages → Source: GitHub Actions)
5. Run `/blog-deploy --dry-run` to test

### Theme Not Applied

**Problem:** `/blog-theme` changes theme but build uses wrong theme.

**Solution:**
1. Check `.env` file has `THEME=<theme-name>`
2. Verify theme name is lowercase (iris, lavender, sakura, etc.)
3. Clear Next.js cache: `rm -rf .next`
4. Rebuild: `THEME=<theme-name> npm run build`

### AI Generation Fails

**Problem:** `/blog-add-video` can't generate content.

**Solution:**
1. Verify MCP connection: Claude Code should have MCP access
2. Check YouTube URL is valid (youtube.com or youtu.be)
3. Try interactive mode: `/blog-add-video` (manual fields)
4. Check video is public (not private/unlisted)

### Validation Errors

**Problem:** `/blog-validate` reports schema errors.

**Solution:**
1. Check required fields for collection type (see [/blog-validate](#blog-validate) schemas)
2. Verify YAML frontmatter syntax (use YAML linter)
3. Check date format is YYYY-MM-DD
4. Ensure no duplicate slugs across collections

---

## Version History

### v1.0.2 (Current)
- ✓ Added 5 specific slash commands (replacing generic `/blog`)
- ✓ Updated manifest to emphasize slash commands and agents
- ✓ Created SLASH-COMMANDS-REFERENCE.md

### v1.0.1
- ✓ Added USAGE-GUIDE.md with 34 use cases
- ✓ Comprehensive workflow documentation

### v1.0.0
- ✓ Initial release with core utilities
- ✓ TDD implementation (10/10 tests passing)
- ✓ Security fixes (shell injection, SSRF protection)

---

## Support & Contributing

**Issues:** https://github.com/imehr/blog-cc-framework/issues

**Marketplace:** imehr/imehr-marketplace

**License:** MIT

**Author:** Mehran Mozaffari <mehran.mozaffari@gmail.com>
