# Blog-CC Framework: Complete Usage Guide

A practical guide for using the blog-cc-framework Claude Code plugin for all content management scenarios.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Adding Content](#adding-content)
3. [Managing Collections](#managing-collections)
4. [Creating Courses](#creating-courses)
5. [Content Validation](#content-validation)
6. [Theme Management](#theme-management)
7. [Deployment Workflows](#deployment-workflows)
8. [Multi-Site Management](#multi-site-management)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Patterns](#advanced-patterns)

---

## Getting Started

### Prerequisites

- Blog-cc project (with `content/` directory and `next.config.js`)
- Claude Code installed
- blog-cc-framework plugin installed

### Installation

```bash
# 1. Add marketplace
/plugin marketplace add imehr/imehr-marketplace

# 2. Install plugin
/plugin install blog-cc-framework@imehr-marketplace

# 3. Restart Claude Code (REQUIRED)
exit
claude

# 4. Verify installation
/help  # Should show /blog command
```

### Quick Start

```bash
# Navigate to your blog-cc project
cd /path/to/my-blog-cc-site

# Start Claude Code
claude

# Use the plugin
/blog
```

---

## Adding Content

### Use Case 1: Add YouTube Video (AI-Powered - Recommended)

**Scenario**: You found a great YouTube video and want to add it to your site with minimal effort.

**Natural Language:**
```
"Add this YouTube video: https://youtube.com/watch?v=dQw4w9WgXcQ"
```

**What Happens:**
1. ✅ Plugin extracts video metadata (title, author, duration)
2. ✅ AI generates description and suggests tags
3. ✅ AI determines best collection type (videos/tutorials/courses)
4. ✅ Shows preview for your confirmation
5. ✅ Creates markdown file with YAML frontmatter
6. ✅ Auto-commits with descriptive message
7. ✅ Suggests next steps (preview, deploy)

**Example Output:**
```
📹 Adding video to blog-cc site...

🤖 Extracting metadata from URL...

✓ Metadata extracted:
  Title: Never Gonna Give You Up
  Author: Rick Astley
  Duration: 3:33

🤖 Generating enhanced content with AI...

✓ AI analysis complete:
  Suggested tags: Music, 80s, Pop
  Collection type: videos

Does this look correct? (y/N)
```

**After Confirmation:**
```
✓ Video added: content/collections/videos/never-gonna-give-you-up.md
✓ Changes committed

Next steps:
  - Run ./start.sh to preview
  - Run /blog deploy to publish
```

---

### Use Case 2: Add Video Interactively

**Scenario**: You want full control over all fields.

**Command:**
```
"Add a video interactively"
```

**What Happens:**
You'll be prompted for:
- YouTube URL
- Video title (or fetch from URL)
- Author/Channel
- Duration
- Description
- Tags (comma-separated)
- Collection type (videos/tutorials/courses)

**Example Session:**
```
📹 Adding video to blog-cc site...

? YouTube URL: https://youtube.com/watch?v=abc123
? Video title: Introduction to Transformers
? Author/Channel: Andrej Karpathy
? Duration (e.g., 45:30): 45:30
? Description: Deep dive into transformer architecture
? Tags (comma-separated): AI, Deep Learning, NLP
? Collection type:
  ❯ Videos
    Tutorials
    Courses

✓ Video added: content/collections/videos/introduction-to-transformers.md
```

---

### Use Case 3: Add Multiple Videos from Playlist

**Scenario**: You have a YouTube playlist and want to add all videos.

**Natural Language:**
```
"Add all videos from this YouTube playlist: https://youtube.com/playlist?list=..."
```

**What Happens:**
1. Plugin extracts playlist URL
2. Fetches all video URLs from playlist
3. For each video:
   - Extracts metadata
   - Generates AI-enhanced content
   - Shows preview
   - Asks for confirmation (or bulk confirm)
4. Creates all files
5. Single commit with all videos

**Example:**
```
Found 12 videos in playlist "Machine Learning Fundamentals"

Process all videos? (y/N): y

Processing video 1/12: Introduction to ML
✓ Metadata extracted
✓ AI content generated
✓ File created

Processing video 2/12: Linear Regression
...

✓ All 12 videos added
✓ Changes committed
```

---

### Use Case 4: Add Other Collection Types

**Collections Available:**
- `videos` - Video resources
- `podcasts` - Podcast episodes
- `people` - People to follow
- `products` - AI products/tools
- `courses` - External courses
- `tutorials` - Tutorial links
- `books` - Book recommendations
- `repos` - GitHub repositories
- `tweets` - Notable tweets

**Examples:**

**Add Podcast:**
```
"Add podcast episode: https://example.com/podcast/ep-123"
```

**Add Person:**
```
"Add Andrej Karpathy to people collection"

# You'll be prompted for:
- Name
- Role (e.g., "AI Researcher at OpenAI")
- URL (Twitter, website, etc.)
- Bio
```

**Add Product:**
```
"Add ChatGPT to products collection"

# Fields:
- Name
- Description
- URL
- Category
- Pricing info
```

**Add Repository:**
```
"Add this GitHub repo: https://github.com/openai/gpt-3"

# AI extracts:
- Repository name
- Owner
- Description
- Stars/forks
- Main language
```

---

### Use Case 5: Add Blog Post

**Scenario**: You want to write a blog post.

**Natural Language:**
```
"Create a blog post about prompt engineering best practices"
```

**What Happens:**
1. AI generates outline
2. Shows outline for approval
3. AI writes full blog post
4. Creates frontmatter with date, tags, excerpt
5. Saves to `content/pages/`

**Example:**
```
Creating blog post about prompt engineering...

Proposed outline:
1. Introduction to Prompt Engineering
2. Core Principles
3. Common Patterns
4. Anti-Patterns to Avoid
5. Practical Examples
6. Conclusion

Approve outline? (y/N): y

✓ Blog post generated
✓ File created: content/pages/prompt-engineering-best-practices.md

Preview:
---
title: "Prompt Engineering Best Practices"
date: "2025-11-03"
excerpt: "Learn essential patterns and anti-patterns for effective prompt engineering"
tags: ["AI", "LLM", "Prompt Engineering"]
---

# Prompt Engineering Best Practices
...
```

---

## Managing Collections

### Use Case 6: View All Collections

**Command:**
```
"Show me all my collections"
```

**Output:**
```
📚 Collections in your blog-cc site:

videos: 45 items
podcasts: 12 items
people: 8 items
products: 15 items
courses: 6 items
tutorials: 23 items
books: 10 items
repos: 18 items
tweets: 31 items

Total: 168 items
```

---

### Use Case 7: Edit Existing Content

**Natural Language:**
```
"Edit the video 'Introduction to Transformers'"
```

**What Happens:**
1. Searches for matching file
2. Opens in editor or shows content
3. Allows modifications
4. Saves and commits

**Example:**
```
Found: content/collections/videos/introduction-to-transformers.md

Current content:
---
title: "Introduction to Transformers"
author: "Andrej Karpathy"
url: "https://youtube.com/watch?v=abc123"
duration: "45:30"
tags: ["AI", "Deep Learning"]
---

What would you like to change?
- Update tags? (y/N)
- Update description? (y/N)
- Update other fields? (y/N)
```

---

### Use Case 8: Delete Content

**Natural Language:**
```
"Delete the video 'Old Tutorial'"
```

**What Happens:**
1. Searches for matching file
2. Shows preview
3. Asks for confirmation
4. Deletes file and commits

**Safety:**
```
Found: content/collections/videos/old-tutorial.md

⚠️ This will permanently delete:
  Title: Old Tutorial
  Author: Example Channel
  Duration: 10:00

Are you sure? (y/N): y

✓ File deleted
✓ Changes committed
```

---

## Creating Courses

### Use Case 9: Create Course (AI-Powered)

**Scenario**: You want to create a structured course on a topic.

**Natural Language:**
```
"Create a course about RAG (Retrieval-Augmented Generation)"
```

**What Happens:**
1. AI analyzes topic
2. Generates course outline (4-8 modules)
3. Suggests lessons per module (3-5 each)
4. Shows preview for approval
5. Creates full directory structure
6. Populates with templates

**Example:**
```
🎓 Creating course about RAG...

AI-Generated Course Outline:

Course: Building RAG Systems
Duration: ~4 hours

Module 1: RAG Fundamentals (4 lessons, ~60 min)
├── 01-what-is-rag.md - What is RAG and why it matters
├── 02-vector-databases.md - Vector databases overview
├── 03-embedding-models.md - Understanding embeddings
└── 04-rag-vs-fine-tuning.md - When to use RAG

Module 2: Building Your First RAG System (5 lessons, ~90 min)
├── 01-tech-stack.md - Setting up the tech stack
├── 02-document-preprocessing.md - Chunking strategies
├── 03-embeddings.md - Generating embeddings
├── 04-semantic-search.md - Implementing search
└── 05-llm-integration.md - Connecting to LLM

Module 3: Advanced Techniques (6 lessons, ~120 min)
├── 01-hybrid-search.md - Combining approaches
├── 02-query-rewriting.md - Query optimization
├── 03-reranking.md - Improving results
├── 04-multi-document.md - Multi-doc synthesis
├── 05-evaluation.md - Measuring performance
└── 06-production.md - Deployment considerations

Module 4: Real-World Applications (4 lessons, ~75 min)
├── 01-customer-support.md - Support chatbots
├── 02-knowledge-bases.md - Internal knowledge
├── 03-research-assistants.md - Research tools
└── 04-domain-qa.md - Domain-specific Q&A

Approve this outline? (y/N): y

✓ Course structure created
✓ 19 lesson files generated with templates
✓ Changes committed

Next steps:
  - Add content to lesson files
  - Add videos to lessons: /blog add lesson video
  - Preview course: ./start.sh
```

---

### Use Case 10: Create Course (Interactive)

**Command:**
```
"Create a course interactively"
```

**Prompts:**
```
? Course title: Introduction to Prompt Engineering
? Course slug: intro-prompt-engineering
? Short description: Learn the fundamentals of prompt engineering
? Number of modules: 3

Module 1:
? Module title: Fundamentals
? Number of lessons: 4

Lesson 1:
? Title: What is Prompt Engineering?
? Type: (video/reading/exercise/quiz) reading
? Duration: 15 minutes

... (continues for all lessons)

✓ Course structure created
```

---

### Use Case 11: Create Course from Template

**Command:**
```
"Create a video series course"
```

**Templates Available:**
- `video-series-course` - Multiple video lessons
- `reading-course` - Text-heavy lessons
- `mixed-media-course` - Videos + readings + exercises
- `workshop-course` - Hands-on with projects
- `micro-course` - 3-5 short lessons

**Example:**
```
? Course title: Machine Learning from Scratch
? Number of videos: 10
? YouTube playlist URL (optional): https://youtube.com/playlist?list=...

Importing from playlist...
✓ Found 10 videos
✓ Course structure created with video lessons
✓ All lesson files generated

Course created at: content/courses/machine-learning-from-scratch/
```

---

### Use Case 12: Add Content to Course Lesson

**Natural Language:**
```
"Add video to lesson 'Understanding Embeddings' in RAG course"
```

**What Happens:**
1. Locates the lesson file
2. Prompts for YouTube URL or video details
3. Updates lesson frontmatter with video info
4. Optionally generates lesson content from video
5. Commits changes

**Example:**
```
Found lesson: content/courses/rag-systems/modules/01-fundamentals/lessons/03-embedding-models.md

? YouTube video URL: https://youtube.com/watch?v=xyz789
? Extract video chapters? (y/N): y

✓ Video metadata extracted
✓ Chapters extracted (5 chapters found)
✓ Lesson updated with video and chapters
✓ Changes committed

Updated lesson:
---
title: "Understanding Embeddings"
type: video
duration: "25 minutes"
video:
  youtubeId: "xyz789"
  chapters:
    - title: "Introduction"
      time: "0:00"
    - title: "What are Embeddings?"
      time: "3:45"
    - title: "Vector Spaces"
      time: "8:20"
    ...
---
```

---

## Content Validation

### Use Case 13: Validate All Content

**Command:**
```
"Validate my content"
```

**What Happens:**
1. Scans all content directories
2. Validates YAML schemas
3. Checks for duplicate slugs
4. Validates date formats
5. Checks course structure
6. Reports errors and warnings

**Example Output:**
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

**With Errors:**
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

---

### Use Case 14: Validate Before Commit

**Hook Integration:**
```bash
# In .git/hooks/pre-commit
#!/bin/bash
echo "Running content validation..."
claude --run "validate content"
```

**What Happens:**
- Automatically validates before every commit
- Blocks commit if errors found
- Allows commit with warnings

---

## Theme Management

### Use Case 15: Switch Theme

**Command:**
```
"Switch to lavender theme"
```

**What Happens:**
1. Updates `.env` with `THEME=lavender`
2. Offers preview before committing
3. Commits theme change

**Example:**
```
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

---

### Use Case 16: Preview Multiple Themes

**Command:**
```
"Compare moss and sakura themes"
```

**What Happens:**
1. Builds site with both themes
2. Opens both in browser tabs
3. Asks which to keep

**Example:**
```
Building comparison previews...

✓ Building with moss theme... Done (port 4567)
✓ Building with sakura theme... Done (port 4568)

Opening both in browser...

Which theme do you prefer?
  ❯ Moss
    Sakura
    Neither (keep current: iris)

? Your choice: Moss

✓ Switching to moss theme
✓ Changes committed
```

---

### Use Case 17: View All Themes

**Command:**
```
"Show me all available themes"
```

**Output:**
```
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

4. Moss - Developer Green
   Font: JetBrains Mono + Roboto
   Style: Technical, code-focused

5. Amber - Bold Orange
   Font: Montserrat + Lato
   Style: Energetic, startup

6. Orchid - Luxury Purple
   Font: Cormorant Garamond + Lora
   Style: Premium, sophisticated

7. Slate - Professional Gray
   Font: Work Sans + IBM Plex Sans
   Style: Corporate, minimal

8. Rose - Editorial Red-Pink
   Font: DM Serif Display + Raleway
   Style: Magazine, bold

9. Sage - Calm Green-Gray
   Font: Merriweather + PT Sans
   Style: Relaxed, nature

Current theme: iris

Switch theme? (y/N)
```

---

## Deployment Workflows

### Use Case 18: Deploy to GitHub Pages (Full Validation)

**Command:**
```
"Deploy my site"
```

**What Happens:**
1. Runs pre-deploy checks
2. Validates content
3. Tests build
4. Checks git status
5. Creates deployment tag
6. Pushes to GitHub
7. Monitors deployment

**Example:**
```
🚀 Deploying to GitHub Pages...

Pre-deploy checks:
  ✓ Content validation passed (168 files)
  ✓ Build successful (2m 34s)
  ✓ Theme 'moss' applied correctly
  ✓ 127 pages generated
  ✓ All internal links valid
  ⚠ Warning: 3 uncommitted changes
  ⚠ Warning: On branch 'feature-test', not 'main'

Configuration:
  - Site: applied-ai
  - Theme: moss
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

---

### Use Case 19: Quick Deploy (Skip Checks)

**Command:**
```
"Deploy now" or "Force deploy"
```

**What Happens:**
- Skips validation
- Immediate push
- Still creates deploy tag
- Monitors deployment

**Warning:**
```
⚠️ Quick deploy - skipping validation checks

This could deploy broken content!

Continue? (y/N): y

Deploying without validation...
✓ Deployed
```

---

### Use Case 20: Test Deployment (Dry Run)

**Command:**
```
"Test deployment"
```

**What Happens:**
- Runs all checks
- Shows what would happen
- Doesn't actually deploy

**Example:**
```
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

---

### Use Case 21: Rollback Deployment

**Command:**
```
"Rollback to previous deployment"
```

**What Happens:**
1. Finds last deployment tag
2. Shows diff
3. Creates rollback branch
4. Checks out previous version
5. Pushes to trigger re-deploy

**Example:**
```
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

Live at: https://piazr.github.io/applied-ai/
```

---

## Multi-Site Management

### Use Case 22: Initialize New Site

**Scenario**: You cloned blog-cc template and want to set it up.

**Command:**
```
"Initialize this as a new blog-cc site"
```

**What Happens:**
1. Detects if already initialized
2. Runs configuration wizard
3. Sets up theme, BASE_PATH, title
4. Creates GitHub setup checklist
5. Commits initial config

**Example:**
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
   /blog deploy

Save instructions to SETUP.md? (y/N): y

✓ Instructions saved to SETUP.md
```

---

### Use Case 23: List All Sites

**Command:**
```
"List my blog-cc sites"
```

**Output:**
```
📚 Blog-CC Sites:

1. /Users/mehran/sites/applied-ai
   Theme: orchid
   Last deploy: 2 hours ago
   Status: ✓ Live at https://piazr.github.io/applied-ai/

2. /Users/mehran/sites/narra-green
   Theme: moss
   Last deploy: 3 days ago
   Status: ✓ Live at https://piazr.github.io/narra-green/

3. /Users/mehran/sites/blog-cc
   Theme: iris
   Last deploy: Never
   Status: ⚠ Not deployed

Total: 3 sites
```

---

### Use Case 24: Switch Site Context

**Command:**
```
"Work on applied-ai site"
```

**What Happens:**
1. Changes to site directory
2. Loads configuration
3. Shows site status

**Example:**
```
Switching to applied-ai...

✓ Changed to: /Users/mehran/sites/applied-ai
✓ Configuration loaded

Current site: Applied AI
  Theme: orchid
  BASE_PATH: /applied-ai
  Content: 168 items
  Last deploy: 2h ago
  Status: Live

What would you like to do?
```

---

### Use Case 25: Deploy All Sites

**Command:**
```
"Deploy all my sites"
```

**What Happens:**
1. Iterates through all sites
2. Runs pre-checks for each
3. Batch deployment
4. Progress report

**Example:**
```
Found 3 blog-cc sites

Running pre-deploy checks...

applied-ai:
  ✓ Content valid
  ✓ Build successful
  Ready to deploy

narra-green:
  ✗ Build failed (missing dependency)
  Skip deployment

blog-cc:
  ⚠ No changes since last deploy
  Skip deployment

Deploy applied-ai? (y/N): y

Deploying applied-ai...
  ✓ Pushed and deployed

Summary:
  ✓ 1 site deployed (applied-ai)
  ⚠ 1 site skipped (no changes)
  ✗ 1 site failed (narra-green - fix build)
```

---

## Troubleshooting

### Use Case 26: Plugin Not Working

**Symptom:** `/blog` command not found

**Solutions:**
```
1. Verify installation:
   /plugin list

2. Reinstall if needed:
   /plugin uninstall blog-cc-framework
   /plugin install blog-cc-framework@imehr-marketplace

3. Restart Claude Code (REQUIRED):
   exit
   claude

4. Check marketplace is updated:
   /plugin marketplace update imehr-marketplace
```

---

### Use Case 27: Project Not Detected

**Symptom:** "Not a blog-cc project" error

**Check:**
```
"Check if this is a blog-cc project"
```

**Requirements:**
- Must have `content/` directory
- Must have `content/collections/` OR `content/pages/`
- Must have `next.config.js` OR `CONTENT-GUIDE.md`

**Fix:**
```
# If missing content/ directory:
mkdir -p content/collections content/pages

# If missing config:
touch CONTENT-GUIDE.md
```

---

### Use Case 28: Build Fails

**Command:**
```
"Why did my build fail?"
```

**Common Issues:**

1. **Missing Dependencies:**
```
Error: Cannot find module 'gray-matter'

Fix:
  cd your-site
  npm install
```

2. **Invalid YAML:**
```
Error: Invalid frontmatter in video.md

Fix:
  /blog validate content
  # Shows which files have invalid YAML
```

3. **Missing Theme:**
```
Error: Theme 'invalid' not found

Fix:
  # Check .env file
  cat .env

  # Should be one of: iris, lavender, sakura, moss, amber, orchid, slate, rose, sage
  echo "THEME=iris" > .env
```

---

### Use Case 29: Deployment Fails

**Command:**
```
"Check deployment status"
```

**What to Check:**
1. GitHub Actions logs
2. Repository variables
3. GitHub Pages settings
4. Build output

**Common Fixes:**
```
1. Check GitHub variables:
   THEME = [your-theme]
   BASE_PATH = /[repo-name]

2. Verify GitHub Pages enabled:
   Settings → Pages → Source: GitHub Actions

3. Check workflow permissions:
   Settings → Actions → Workflow permissions: Read and write

4. Retry deployment:
   /blog deploy
```

---

## Advanced Patterns

### Use Case 30: Bulk Operations

**Add Multiple Items:**
```
"Add these 5 videos:
1. https://youtube.com/watch?v=abc
2. https://youtube.com/watch?v=def
3. https://youtube.com/watch?v=ghi
4. https://youtube.com/watch?v=jkl
5. https://youtube.com/watch?v=mno"
```

**What Happens:**
- Processes each URL
- Shows progress
- Single commit with all videos

---

### Use Case 31: Search Content

**Command:**
```
"Find all videos about transformers"
```

**What Happens:**
1. Searches through all content
2. Matches title, description, tags
3. Shows results with paths

**Example:**
```
Found 3 videos matching "transformers":

1. Introduction to Transformers
   Path: content/collections/videos/intro-transformers.md
   Author: Andrej Karpathy
   Duration: 45:30

2. Transformer Architecture Deep Dive
   Path: content/collections/videos/transformer-architecture.md
   Author: Yannic Kilcher
   Duration: 60:15

3. Building Transformers from Scratch
   Path: content/collections/tutorials/building-transformers.md
   Author: Code Emporium
   Duration: 90:00

Open which file? (1-3, or 'N' to cancel)
```

---

### Use Case 32: Batch Edit

**Command:**
```
"Add tag 'Featured' to all videos by Andrej Karpathy"
```

**What Happens:**
1. Finds matching videos
2. Shows preview of changes
3. Confirms with user
4. Updates all files
5. Single commit

---

### Use Case 33: Generate Reports

**Command:**
```
"Generate content report"
```

**Output:**
```
📊 Content Report for Applied AI

Collection Statistics:
  Videos: 45 items
  Podcasts: 12 items
  People: 8 items
  Products: 15 items
  Courses: 2 courses (19 lessons)
  Blog posts: 23 posts

Top Tags:
  1. AI (67 items)
  2. Machine Learning (45 items)
  3. Deep Learning (34 items)
  4. LLM (28 items)
  5. Tutorial (25 items)

Top Authors:
  1. Andrej Karpathy (12 videos)
  2. Lex Fridman (8 podcasts)
  3. OpenAI (6 products)

Recent Activity:
  - 5 items added this week
  - 2 items added today
  - Last deploy: 2 hours ago

Content Health:
  ✓ All schemas valid
  ✓ No duplicates
  ✓ All links working

Save report to reports/2025-11-03.md? (y/N)
```

---

### Use Case 34: Custom Workflows

**Create Custom Command:**
```
# In your project .claude/commands/
cat > .claude/commands/weekly-update.md << 'EOF'
---
description: Weekly content update workflow
---

Weekly update workflow:
1. Validate all content
2. Check for broken links
3. Generate report
4. Preview changes
5. Deploy if validation passes

Run: /blog weekly-update
EOF
```

**Use:**
```
/weekly-update
```

---

## Best Practices

### Content Organization
1. Use descriptive slugs (auto-generated from titles)
2. Tag consistently (use standard tag names)
3. Keep descriptions concise but informative
4. Use `order` field for manual sorting

### Git Workflow
1. Let plugin handle commits (includes framework signature)
2. Review changes before deploy
3. Use deployment tags for easy rollback
4. Keep working directory clean

### Validation
1. Validate before every deploy
2. Fix errors immediately
3. Address warnings periodically
4. Check links regularly

### Theme Management
1. Preview before committing theme changes
2. Test builds with new themes
3. Keep themes consistent across related sites

### Deployment
1. Always run pre-deploy checks
2. Test in staging (local preview) first
3. Monitor deployment status
4. Keep rollback option available

---

## Quick Reference Card

```
CONTENT OPERATIONS
  "Add video [URL]"              - AI-powered video addition
  "Add [type] interactively"     - Interactive prompts
  "Edit [title]"                 - Edit existing content
  "Delete [title]"               - Remove content

VALIDATION
  "Validate content"             - Check all content
  "Fix validation errors"        - Auto-fix common issues

COURSES
  "Create course [topic]"        - AI-generated course
  "Add lesson content"           - Add to existing lesson

THEMES
  "Switch to [theme]"            - Change theme
  "Compare [theme1] and [theme2]"- Side-by-side comparison
  "Show themes"                  - List all themes

DEPLOYMENT
  "Deploy site"                  - Full validation + deploy
  "Deploy now"                   - Quick deploy (skip checks)
  "Rollback deployment"          - Undo last deploy

MULTI-SITE
  "Initialize site"              - Set up new site
  "List sites"                   - Show all sites
  "Work on [site]"               - Switch context
  "Deploy all sites"             - Batch deployment

TROUBLESHOOTING
  "Check project"                - Verify blog-cc structure
  "Check deployment"             - View deployment status
  "Why did build fail?"          - Debug build issues
```

---

## Additional Resources

- **Plugin Documentation:** `/Users/mehran/Documents/github/blog-cc-framework/skills/content-management/blog-cc/SKILL.md`
- **Blog-CC Guide:** `CONTENT-GUIDE.md` in your blog-cc project
- **Deployment Guide:** `DEPLOYMENT.md` in your blog-cc project
- **GitHub Repository:** https://github.com/imehr/blog-cc-framework

---

**Last Updated:** 2025-11-03
**Plugin Version:** 1.0.0
**Framework:** blog-cc-framework by Mehran Mozaffari
