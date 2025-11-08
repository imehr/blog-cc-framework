# Blog-CC Framework

**Slash commands and agents for managing blog-cc static sites with AI-powered content generation and GitHub Pages deployment.**

Version: 1.1.1

---

## Quick Start

### Installation

```bash
/plugin marketplace add imehr/imehr-marketplace
/plugin install blog-cc-framework@imehr-marketplace
exit
claude
```

### Initialize Your First Site

```bash
/blog-init
```

Follow the wizard to configure your site name, theme, deployment path, and GitHub repository.

---

## Available Commands

All commands support both short and namespaced forms. Use whichever you prefer:

### Core Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/blog-init` | Initialize new blog-cc site | `cd your-site && /blog-init` |
| `/blog-add-video` | Add YouTube video with AI | `/blog-add-video https://youtube.com/watch?v=VIDEO_ID` |
| `/blog-validate` | Validate all content | `/blog-validate` |
| `/blog-deploy` | Deploy to GitHub Pages | `/blog-deploy` |
| `/blog-theme` | Manage site themes | `/blog-theme lavender` |

**Note:** Commands also work with namespace prefix: `/blog-cc-framework:blog-init`, `/blog-cc-framework:blog-add-video`, etc.

---

## Command Examples

### 1. Initialize New Site

```bash
cd /path/to/blog-cc-clone
/blog-init

# Wizard prompts:
# - Site name: "Applied AI"
# - Theme: 6 (Orchid)
# - Deployment path: /applied-ai
# - GitHub repo: Piazr/applied-ai

# Output:
# ✓ .env created: THEME=orchid
# ✓ content/home.md updated
# ✓ .env.production created: BASE_PATH=/applied-ai
# ✓ Changes committed
# ✓ Setup instructions saved to SETUP.md
```

### 2. Add YouTube Video (AI-Powered)

```bash
/blog-add-video https://youtube.com/watch?v=kCc8FmEb1nY

# Agent workflow:
# 1. Extracts metadata from YouTube
# 2. Uses Claude AI to generate description and tags
# 3. Determines optimal collection type
# 4. Creates markdown file
# 5. Auto-commits changes

# Output:
# ✓ Metadata extracted: "Introduction to Transformers"
# ✓ AI analysis complete: tutorials collection
# ✓ Video added: content/collections/tutorials/introduction-to-transformers.md
# ✓ Changes committed
```

### 3. Validate Content

```bash
/blog-validate

# Agent checks:
# - YAML schema compliance (9 collection types)
# - Duplicate slugs
# - Date formats
# - Course structure
# - Required fields

# Output:
# ✓ All content valid!
# Summary:
#   ✓ 45 videos validated
#   ✓ 12 podcasts validated
#   ✓ 23 blog posts validated
```

### 4. Deploy to GitHub Pages

```bash
/blog-deploy

# Agent workflow:
# 1. Pre-deploy validation
# 2. Build test with current theme
# 3. Git status check
# 4. Creates deployment tag
# 5. Pushes to GitHub
# 6. Monitors GitHub Actions
# 7. Reports live URL

# Output:
# ✓ Content validation passed (168 files)
# ✓ Build successful (2m 34s)
# ✓ Deployed successfully!
# Live at: https://piazr.github.io/applied-ai/
```

### 5. Switch Theme

```bash
/blog-theme lavender

# Agent workflow:
# 1. Updates .env with THEME=lavender
# 2. Offers preview (y/N)
# 3. Builds and starts preview server
# 4. Confirms theme choice
# 5. Commits changes

# Output:
# ✓ .env updated with THEME=lavender
# ✓ Preview server on port 4567
# ✓ Theme change committed
```

---

## Command Modes

### /blog-deploy Modes

```bash
/blog-deploy              # Full validation + deployment
/blog-deploy --force      # Skip validation (fast)
/blog-deploy --dry-run    # Test without deploying
```

### /blog-theme Modes

```bash
/blog-theme lavender                  # Switch theme
/blog-theme --list                    # List all themes
/blog-theme --compare moss sakura     # Compare two themes
```

### /blog-add-video Modes

```bash
/blog-add-video https://youtube.com/watch?v=ID   # URL + AI
/blog-add-video                                  # Interactive mode
```

---

## Common Workflows

### Workflow 1: New Site Setup

```bash
# Clone template
git clone https://github.com/imehr/blog-cc.git my-site
cd my-site

# Initialize
/blog-init

# Set up GitHub repo (manual)
# - Create repo on GitHub
# - Add repository variables: THEME, BASE_PATH
# - Enable GitHub Pages (Source: GitHub Actions)

# Deploy
/blog-deploy
```

### Workflow 2: Add Content and Deploy

```bash
# Add video
/blog-add-video https://youtube.com/watch?v=VIDEO_ID

# Validate
/blog-validate

# Deploy
/blog-deploy
```

### Workflow 3: Change Theme

```bash
# List themes
/blog-theme --list

# Compare options
/blog-theme --compare lavender sakura

# Switch theme
/blog-theme lavender

# Deploy with new theme
/blog-deploy
```

### Workflow 4: Rapid Development

```bash
# Add content
/blog-add-video https://youtube.com/watch?v=VIDEO_ID

# Quick deploy (skip validation)
/blog-deploy --force
```

### Workflow 5: Safe Production Deployment

```bash
# Validate first
/blog-validate

# Dry run
/blog-deploy --dry-run

# Deploy
/blog-deploy

# If issues occur, rollback:
/blog-rollback
```

---

## Agent Architecture

The framework uses specialized agents for different operations:

### 1. Configuration Agent (`/blog-init`)
- Detects blog-cc project structure
- Runs interactive wizard
- Creates configuration files
- Commits initial setup

### 2. Content Agent (`/blog-add-video`)
- Extracts YouTube metadata
- Uses Claude AI for content generation
- Determines collection type
- Creates markdown files
- Auto-commits additions

### 3. Validation Agent (`/blog-validate`)
- Scans content directories
- Validates YAML schemas
- Checks duplicates and structure
- Reports errors and warnings

### 4. Deployment Agent (`/blog-deploy`)
- Runs pre-deploy checks
- Creates deployment tags
- Monitors GitHub Actions
- Handles rollbacks

### 5. Theme Agent (`/blog-theme`)
- Lists available themes
- Builds preview servers
- Compares themes side-by-side
- Updates configuration

---

## Available Themes

| Theme | Style | Font | Best For |
|-------|-------|------|----------|
| **iris** (default) | Tech Blue | Inter | Tech blogs, clean modern |
| **lavender** | Creative Purple | Playfair Display | Editorial, creative |
| **sakura** | Warm Pink | Quicksand | Friendly, approachable |
| **moss** | Developer Green | JetBrains Mono | Developer blogs, code |
| **amber** | Bold Orange | Montserrat | Bold statements, energy |
| **orchid** | Luxury Purple | Cormorant Garamond | Luxury, elegance |
| **slate** | Professional Gray | Work Sans | Professional, corporate |
| **rose** | Editorial Red-Pink | DM Serif Display | Editorial, magazines |
| **sage** | Calm Green-Gray | Merriweather | Calm, reading-focused |

Switch themes anytime with `/blog-theme [name]`

---

## Collection Types

The framework validates 9 collection types:

- **videos** - YouTube videos (requires: title, author, url)
- **podcasts** - Podcast episodes (requires: title, host, url)
- **people** - People profiles (requires: name, role, url)
- **products** - Product reviews (requires: name, description, url)
- **courses** - Online courses (requires: title, provider, url)
- **tutorials** - Tutorial content (requires: title, author, url)
- **books** - Book recommendations (requires: title, author)
- **repos** - Code repositories (requires: title, owner, url)
- **tweets** - Tweet archives (requires: author, content, url)

---

## Features

### AI-Powered Content Generation
- Automatic metadata extraction from YouTube URLs
- AI-generated descriptions and tags using Claude
- Intelligent collection type detection

### 4-Layer Safety System
1. **Content Validation** - Schema compliance, duplicates, structure
2. **Pre-Deploy Checks** - Build test, theme validation, git status
3. **Preview** - Local preview before deployment
4. **Rollback** - One-command rollback to previous deployment

### Multi-Site Management
- Single template, multiple sites
- Per-site configuration (.env, .env.production)
- Independent themes and BASE_PATH
- Deployment tagging per site

### Git Integration
- Auto-commits with framework signature
- Deployment tags: `deploy/[site]/YYYY-MM-DD-HH-MM-SS`
- Rollback branches
- Comprehensive shell escaping (security)

---

## Security Features

### Shell Injection Protection
All git commands use comprehensive escaping for:
- Backslashes, quotes, backticks
- Dollar signs, newlines
- All special shell characters

### SSRF Protection
YouTube URL validation ensures only youtube.com and youtu.be domains are fetched.

### Content Validation
- YAML schema validation prevents malformed frontmatter
- Duplicate slug detection prevents routing conflicts
- Date format validation ensures proper parsing

---

## Documentation

### Quick Reference
- **README.md** - This file (command overview)
- **SLASH-COMMANDS-REFERENCE.md** - Comprehensive command reference
- **commands/** - Individual command documentation
  - `blog-init.md` - Initialization wizard
  - `blog-add-video.md` - Video addition with AI
  - `blog-validate.md` - Content validation
  - `blog-deploy.md` - Deployment and rollback
  - `blog-theme.md` - Theme management

### Skill Documentation
- **skills/content-management/blog-cc/SKILL.md** - Main skill documentation
- **skills/content-management/blog-cc/USAGE-GUIDE.md** - Detailed workflows

---

## Troubleshooting

### Commands Not Recognized

**Problem:** Slash commands don't appear in Claude Code.

**Solution:**
```bash
# Verify installation
claude plugin list

# Reinstall if needed
claude plugin uninstall blog-cc-framework
claude plugin install imehr/blog-cc-framework

# Restart Claude Code
exit
claude
```

### Deployment Fails

**Problem:** `/blog-deploy` fails with errors.

**Solution:**
```bash
# Validate content first
/blog-validate

# Fix any reported errors

# Check GitHub setup
# - Repository variables: THEME, BASE_PATH
# - GitHub Pages enabled (Settings → Pages)
# - Source set to: GitHub Actions

# Test deployment
/blog-deploy --dry-run

# Deploy
/blog-deploy
```

### Theme Not Applied

**Problem:** Theme change doesn't take effect.

**Solution:**
```bash
# Check .env file
cat .env
# Should show: THEME=your-theme

# Clear Next.js cache
rm -rf .next

# Rebuild with theme
THEME=your-theme npm run build

# Or redeploy
/blog-deploy
```

### AI Generation Fails

**Problem:** `/blog-add-video` can't generate content.

**Solution:**
- Verify Claude Code has MCP access
- Check YouTube URL is valid (youtube.com or youtu.be)
- Ensure video is public (not private/unlisted)
- Try interactive mode: `/blog-add-video`

---

## CLI Utilities

The framework provides battle-tested utilities (all with TDD tests passing):

### Core Utilities (`lib/cli/utils/`)
- **yaml-handler.ts** - Markdown + YAML frontmatter parsing
- **project-detector.ts** - Blog-CC structure validation
- **git-helper.ts** - Auto-commits and deployment tagging
- **config-loader.ts** - Theme, BASE_PATH, title loading

### Content Management (`lib/cli/content/`)
- **ai-generator.ts** - YouTube metadata + AI generation
- **add-video.ts** - Video addition with 3 modes

### Validation (`lib/cli/validation/`)
- **content-validator.ts** - Schema validation for 9 collection types

---

## Version History

### v1.2.0 (In Development) - Template Sync System
- 🚧 **NEW**: `/blog-sync-template` command (in progress)
  - Git Remote Strategy with commit-by-commit review
  - Interactive conflict resolution
  - Pre/post sync validation with rollback
  - See: [Design Doc](./docs/plans/2025-11-08-template-sync-design.md)
  - See: [Implementation Plan](./docs/plans/2025-11-08-blog-sync-template-implementation.md)
- ✓ Completed: git-operations module
- ⏳ Remaining: validator, conflict resolver, orchestrator modules

### v1.1.1
- ✓ Added YouTube oEmbed API extraction (primary method)
- ✓ Three-tier fallback (oEmbed → Page scraping → Chrome MCP)
- ✓ Updated documentation

### v1.1.0
- ✓ Added Twitter bookmarks sync (`/blog-sync-bookmarks`)
- ✓ Added bookmarks archival (`/blog-archive-tweets`)
- ✓ Chrome MCP integration

### v1.0.3
- ✓ Clarified command naming (short vs. namespaced forms)
- ✓ Updated documentation

### v1.0.2
- ✓ Added 5 specific slash commands
- ✓ Removed generic `/blog` command
- ✓ Created SLASH-COMMANDS-REFERENCE.md

### v1.0.1
- ✓ Added comprehensive USAGE-GUIDE.md

### v1.0.0
- ✓ Initial release
- ✓ Core utilities with TDD (10/10 tests passing)
- ✓ Security fixes (shell injection, SSRF protection)

---

## Support

**Issues:** https://github.com/imehr/blog-cc-framework/issues

**Marketplace:** imehr/imehr-marketplace

**Template Repo:** https://github.com/imehr/blog-cc

---

## License

MIT

**Author:** Mehran Mozaffari <mehran.mozaffari@gmail.com>

**Repository:** https://github.com/imehr/blog-cc-framework
