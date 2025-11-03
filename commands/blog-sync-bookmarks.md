# Sync Twitter Bookmarks

Extract latest Twitter bookmarks from x.com using Chrome MCP and add them to your blog-cc site.

## Usage

```bash
/blog-sync-bookmarks [limit]
```

**Arguments:**
- `limit` (optional): Number of bookmarks to extract (default: 10, max: 20)

## Prerequisites

Before running this command:
1. ✓ Chrome browser is running
2. ✓ You're logged into x.com/twitter.com in Chrome
3. ✓ Navigate to your bookmarks page manually: `https://x.com/YOUR_HANDLE/bookmarks`

## What This Does

1. **Connects to Chrome** via DevTools Protocol (MCP)
2. **Extracts bookmarks** from your Twitter bookmarks page
3. **Uses AI** to generate topic tags from tweet content
4. **Saves tweets** as markdown files in `content/collections/tweets/`
5. **Auto-archives** tweets older than 3 months
6. **Commits changes** with framework signature

## Example

```bash
/blog-sync-bookmarks 10

# 🔖 Syncing Twitter bookmarks...
#
# Prerequisites check:
#   ✓ Chrome browser detected
#   ✓ Connected to Chrome DevTools Protocol
#   ✓ Navigating to https://x.com/imehr/bookmarks
#
# Extracting bookmarks:
#   ⏳ Waiting for tweets to load...
#   ✓ Found 47 bookmarks on page
#   ⏳ Extracting metadata (limit: 10)...
#
# Tweet 1/10:
#   Author: Sam Altman (@sama)
#   Date: 2024-11-02
#   Text: "Building AGI is the most important..."
#   Topic: AI & ML (inferred)
#   Media: 0 images
#   ✓ Saved: 1852000000000000000.md
#
# Tweet 2/10:
#   Author: Paul Graham (@paulg)
#   Date: 2024-11-01
#   Text: "Startups are hard because..."
#   Topic: Startups (inferred)
#   Media: 0 images
#   ✓ Saved: 1851900000000000000.md
#
# ... (8 more tweets)
#
# Archiving old tweets:
#   ⏳ Scanning for tweets older than 2024-08-03...
#   ✓ Archived 12 tweets to tweets-archive/2024-07/
#   ✓ Archived 8 tweets to tweets-archive/2024-06/
#
# Summary:
#   ✓ Extracted 10 new bookmarks
#   ✓ Archived 20 old tweets
#   ✓ Total active tweets: 37
#   ✓ Changes committed
#
# Next steps:
#   - Run ./start.sh to preview: http://localhost:3000
#   - Check bookmarks page: http://localhost:3000/bookmarks
#   - Deploy: /blog-deploy
```

## Tweet Extraction Details

### Extracted Fields

For each bookmark, the command extracts:

| Field | Description | Source |
|-------|-------------|--------|
| **author** | Display name | Tweet header |
| **handle** | Twitter handle (@username) | Tweet header |
| **url** | Full tweet URL | Timestamp link |
| **date** | Tweet date (YYYY-MM-DD) | Timestamp metadata |
| **text** | Full tweet text | Tweet body |
| **topic** | Auto-generated category | AI inference from text |
| **media** | Image/video URLs | Media embeds |
| **hasThread** | Is part of thread? | Thread indicator |
| **extractedAt** | Extraction date | Current date |

### Topic Inference

The command automatically categorizes tweets using keyword matching:

| Topic | Keywords |
|-------|----------|
| AI & ML | ai, machine learning, llm, gpt, claude, neural |
| Software Engineering | code, programming, javascript, python, typescript |
| Design & Product | design, ui, ux, product, figma |
| Startups | startup, founder, entrepreneur, vc, funding |
| Productivity | productivity, workflow, tools, notion |
| Web3 & Crypto | web3, blockchain, crypto, ethereum |
| Philosophy & Psychology | philosophy, psychology, mental model |
| Writing & Content | writing, content, storytelling, essay |
| Business & Strategy | business, strategy, growth, marketing |
| Science & Research | science, research, physics, biology |
| General | (default for unmatched tweets) |

## Archiving System

The command automatically archives tweets older than **3 months** (90 days):

**Archive structure:**
```
content/collections/tweets-archive/
├── 2024-08/
│   ├── 1790000000000000000.md
│   └── 1791111111111111111.md
├── 2024-09/
│   └── 1792222222222222222.md
└── 2024-10/
    └── 1793333333333333333.md
```

This keeps your bookmarks page fresh with only recent tweets while preserving historical data.

## Display System

Tweets appear in two places:

### 1. Homepage (`/`)
- Shows last 10 tweets
- Custom card design (smaller layout)
- 3-4 column grid (responsive)
- "View all bookmarks →" link

### 2. Bookmarks Page (`/bookmarks`)
- Shows all active tweets (not archived)
- 3-4 column grid with cards
- Media previews
- Topic tags
- Direct links to original tweets

## Modes

### Default (Interactive)

```bash
/blog-sync-bookmarks

# Prompts:
# ? How many bookmarks to extract? (1-20): 10
# ? Navigate to bookmarks page now? (y/N): y
```

### Quick Mode (Non-interactive)

```bash
/blog-sync-bookmarks 10

# Skips prompts, extracts 10 bookmarks immediately
```

### Preview Mode (No commit)

```bash
/blog-sync-bookmarks 5 --preview

# Extracts and saves tweets but doesn't commit
# Useful for reviewing before committing
```

## Troubleshooting

### Chrome Connection Fails

**Problem:** Can't connect to Chrome DevTools Protocol.

**Solution:**
```bash
# Ensure Chrome is running
# Ensure superpowers-chrome MCP is installed:
/plugin list

# Reinstall if needed:
/plugin install superpowers-chrome@superpowers-marketplace
```

### No Bookmarks Found

**Problem:** Command reports 0 bookmarks found.

**Solution:**
1. Verify you're logged into x.com in Chrome
2. Manually navigate to `https://x.com/YOUR_HANDLE/bookmarks`
3. Wait for page to fully load (scroll if needed)
4. Run command again

### Extraction Fails on Specific Tweets

**Problem:** Some tweets fail to extract (missing fields).

**Solution:**
- Command skips problematic tweets automatically
- Check console output for specific errors
- Manually add problematic tweets if needed

### Duplicate Bookmarks

**Problem:** Same tweet extracted multiple times.

**Solution:**
- Command checks existing tweet IDs before saving
- Automatically skips duplicates
- Run `/blog-validate` to check for duplicates

## Best Practices

### Daily Workflow

```bash
# Morning: Sync yesterday's bookmarks
/blog-sync-bookmarks 10

# Review
npm run dev
# Check http://localhost:3000/bookmarks

# Deploy
/blog-deploy
```

### Weekly Maintenance

```bash
# Sync bookmarks
/blog-sync-bookmarks 20

# Archive old tweets (automatic)
# Already runs as part of sync command

# Validate content
/blog-validate

# Deploy
/blog-deploy
```

### Monthly Cleanup

```bash
# Manual archive check
/blog-archive-tweets

# Review archived tweets
ls content/collections/tweets-archive/

# Validate
/blog-validate
```

## Related Commands

- `/blog-archive-tweets` - Manually archive old tweets
- `/blog-validate` - Validate tweet schemas
- `/blog-deploy` - Deploy with new bookmarks

## Requirements

**Browser:**
- Chrome browser running
- Logged into x.com
- Bookmarks page accessible

**MCP Tools:**
- `superpowers-chrome` plugin installed
- Chrome DevTools Protocol enabled

**Site Structure:**
- `content/collections/tweets/` directory exists
- `content/collections/tweets-archive/` directory exists
- `app/bookmarks/page.tsx` exists

**Dependencies:**
- `gray-matter` for YAML parsing
- `marked` for markdown processing

## Full Example with Output

```bash
cd ~/my-blog-cc-site
/blog-sync-bookmarks 5

# Output:
# 🔖 Syncing Twitter bookmarks from x.com/@imehr...
#
# ✓ Chrome DevTools connected
# ✓ Navigated to https://x.com/imehr/bookmarks
# ✓ Page loaded successfully
#
# Extracting 5 bookmarks...
#
# [1/5] @sama • Sam Altman
#   "The thing about AGI is that..."
#   Topic: AI & ML
#   ✓ Saved: 1852431234567890123.md
#
# [2/5] @paulg • Paul Graham
#   "The best startups come from..."
#   Topic: Startups
#   ✓ Saved: 1852420000000000000.md
#
# [3/5] @levelsio • Pieter Levels
#   "Just shipped a new feature..."
#   Topic: Software Engineering
#   Media: 1 image
#   ✓ Saved: 1852410000000000000.md
#
# [4/5] @naval • Naval Ravikant
#   "Specific knowledge is found..."
#   Topic: Philosophy & Psychology
#   ✓ Saved: 1852400000000000000.md
#
# [5/5] @elonmusk • Elon Musk
#   "Starship update: ..."
#   Topic: Science & Research
#   ✓ Saved: 1852390000000000000.md
#
# Archiving old tweets (>90 days)...
# ✓ Archived 3 tweets to tweets-archive/2024-07/
#
# ✓ 5 new bookmarks extracted
# ✓ 3 old tweets archived
# ✓ 32 active tweets total
#
# ✓ Committed changes with message:
#   "feat: sync 5 Twitter bookmarks"
#
# Preview: http://localhost:3000/bookmarks
# Deploy: /blog-deploy
```
