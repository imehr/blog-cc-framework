# Archive Old Tweets

Archive tweets older than 3 months from your bookmarks collection to keep your site fresh.

## Usage

```bash
/blog-archive-tweets
```

## What This Does

1. **Scans** all tweets in `content/collections/tweets/`
2. **Identifies** tweets older than 90 days (3 months)
3. **Moves** old tweets to `content/collections/tweets-archive/YYYY-MM/`
4. **Organizes** by year-month subdirectories
5. **Reports** archiving summary
6. **Commits** changes

## Example

```bash
/blog-archive-tweets

# 📦 Archiving tweets older than 3 months...
#
# Scanning content/collections/tweets/...
#   Found 47 tweet files
#   Cutoff date: 2024-08-03
#
# Archiving old tweets:
#   ✓ 1790000000000000000.md → tweets-archive/2024-06/
#   ✓ 1791111111111111111.md → tweets-archive/2024-06/
#   ✓ 1792222222222222222.md → tweets-archive/2024-07/
#   ✓ 1793333333333333333.md → tweets-archive/2024-07/
#   ✓ 1794444444444444444.md → tweets-archive/2024-07/
#   ... (15 more files)
#
# Summary:
#   ✓ Archived 20 tweets
#   ✓ Remaining active: 27 tweets
#   ✓ Archive structure:
#       tweets-archive/2024-06/ (8 tweets)
#       tweets-archive/2024-07/ (12 tweets)
#
# ✓ Changes committed
#
# Active tweets: 27
# Archived tweets: 20
```

## Archive Structure

Archived tweets are organized by year-month:

```
content/collections/tweets-archive/
├── 2024-06/
│   ├── 1790000000000000000.md
│   ├── 1791111111111111111.md
│   └── ... (8 tweets total)
├── 2024-07/
│   ├── 1792222222222222222.md
│   ├── 1793333333333333333.md
│   └── ... (12 tweets total)
├── 2024-08/
│   ├── 1794444444444444444.md
│   └── ... (15 tweets total)
└── 2024-09/
    └── ... (archived as they age)
```

## Why Archive?

### Performance
- Keeps tweet collection small (~30-40 tweets)
- Faster page loads
- Better site performance

### Freshness
- Homepage shows only recent bookmarks
- Bookmarks page stays current
- Old content doesn't clutter the feed

### History
- Preserves all tweets for reference
- Maintains complete archive
- Easy to access old bookmarks if needed

## Archiving Logic

**Cutoff calculation:**
```
Current date - 90 days = Cutoff date
```

**Example:**
- Today: November 3, 2024
- Cutoff: August 3, 2024
- Archives: All tweets before August 3, 2024

**Date source:**
- Uses `date` field from tweet frontmatter
- Falls back to file modification time if no date field
- Skips files without valid dates

## When to Run

### Automatic (Recommended)
The `/blog-sync-bookmarks` command runs archiving automatically after each sync.

### Manual
Run manually when:
- You want to clean up without syncing new bookmarks
- Archive didn't run automatically
- You manually added old tweets that need archiving
- Monthly maintenance routine

## Modes

### Default (Interactive)

```bash
/blog-archive-tweets

# Prompts:
# ? Found 20 tweets older than 90 days. Archive them? (y/N): y
# ? Commit changes after archiving? (y/N): y
```

### Force Mode (Non-interactive)

```bash
/blog-archive-tweets --force

# Skips prompts, archives immediately
```

### Dry Run (Preview)

```bash
/blog-archive-tweets --dry-run

# Shows what would be archived without moving files
#
# Dry run: No files will be moved
#
# Would archive 20 tweets:
#   1790000000000000000.md → tweets-archive/2024-06/
#   1791111111111111111.md → tweets-archive/2024-06/
#   ... (18 more)
#
# Abort: Run without --dry-run to archive
```

### Custom Retention Period

```bash
/blog-archive-tweets --days 180

# Archives tweets older than 180 days (6 months)
# Default: 90 days (3 months)
```

## Output Details

### Summary Statistics

```bash
/blog-archive-tweets

# Output includes:
# - Total tweets scanned
# - Cutoff date used
# - Number archived per month
# - Remaining active tweets
# - Archive directory structure
```

### File Operations

```bash
# Before archiving:
content/collections/tweets/
├── 1790000000000000000.md (2024-06-15) ← Will archive
├── 1791111111111111111.md (2024-06-20) ← Will archive
├── 1852000000000000000.md (2024-11-01) ← Stays active
└── 1852100000000000000.md (2024-11-02) ← Stays active

# After archiving:
content/collections/tweets/
├── 1852000000000000000.md (2024-11-01)
└── 1852100000000000000.md (2024-11-02)

content/collections/tweets-archive/2024-06/
├── 1790000000000000000.md
└── 1791111111111111111.md
```

## Validation

After archiving, run validation to ensure integrity:

```bash
/blog-archive-tweets
/blog-validate

# Validation checks:
# ✓ Active tweets have valid schemas
# ✓ No duplicate tweets
# ✓ Archive structure is correct
```

## Troubleshooting

### No Tweets to Archive

**Problem:** Command reports "No tweets older than 90 days found."

**Solution:**
- This is normal if all tweets are recent
- Archiving is only needed when tweets age past 3 months
- Check again in a few weeks

### Archive Fails (Permission Error)

**Problem:** Can't create archive directory or move files.

**Solution:**
```bash
# Check directory exists
ls content/collections/

# Create archive directory if missing
mkdir -p content/collections/tweets-archive

# Check file permissions
ls -la content/collections/tweets/
```

### Invalid Date Format

**Problem:** Some tweets have invalid date fields.

**Solution:**
```bash
# Validate content first
/blog-validate

# Fix invalid dates in frontmatter
# Date format: YYYY-MM-DD

# Re-run archive
/blog-archive-tweets
```

### Archived by Mistake

**Problem:** Accidentally archived tweets that shouldn't be.

**Solution:**
```bash
# Move tweets back manually
mv content/collections/tweets-archive/2024-10/*.md content/collections/tweets/

# Or use git to revert
git status
git restore content/collections/tweets/
git restore content/collections/tweets-archive/
```

## Best Practices

### Monthly Routine

```bash
# First day of month:
/blog-archive-tweets --dry-run  # Preview
/blog-archive-tweets             # Archive
/blog-validate                   # Verify
/blog-deploy                     # Deploy
```

### Before Large Sync

```bash
# Archive old tweets before syncing new ones
/blog-archive-tweets
/blog-sync-bookmarks 20
/blog-deploy
```

### After Manual Edits

```bash
# If you manually edited tweet dates:
/blog-archive-tweets
/blog-validate
```

## Accessing Archived Tweets

Archived tweets are preserved but not displayed on the site.

### View Archive Locally

```bash
# List all archived tweets
find content/collections/tweets-archive/ -name "*.md"

# View specific month
ls content/collections/tweets-archive/2024-07/

# Read archived tweet
cat content/collections/tweets-archive/2024-07/1792222222222222222.md
```

### Restore Archived Tweet

To bring an archived tweet back to active:

```bash
# Move file back to tweets collection
mv content/collections/tweets-archive/2024-07/TWEET_ID.md content/collections/tweets/

# Update date if needed (to keep it active)
# Edit the frontmatter date field to a recent date

# Commit
git add content/collections/tweets/TWEET_ID.md
git commit -m "restore: bring back tweet TWEET_ID"
```

## Related Commands

- `/blog-sync-bookmarks` - Sync new bookmarks (runs archive automatically)
- `/blog-validate` - Validate tweet schemas
- `/blog-deploy` - Deploy after archiving

## Configuration

The archiving system uses these defaults:

| Setting | Default | Description |
|---------|---------|-------------|
| **Retention Period** | 90 days | How long tweets stay active |
| **Archive Location** | `tweets-archive/` | Where archived tweets go |
| **Organization** | Year-Month | Archive subdirectory format |
| **Auto-archive** | Enabled | Runs during bookmark sync |

To customize retention period:

```bash
# Archive tweets older than 6 months
/blog-archive-tweets --days 180

# Archive tweets older than 1 month (not recommended)
/blog-archive-tweets --days 30
```

## Full Example

```bash
cd ~/my-blog-cc-site
/blog-archive-tweets

# Output:
# 📦 Archiving old tweets...
#
# Scanning content/collections/tweets/
#   Found: 42 tweet files
#   Cutoff date: 2024-08-03 (90 days ago)
#
# Analyzing tweets:
#   Active (keep): 27 tweets
#   Archive (move): 15 tweets
#
# Archiving by month:
#
# → tweets-archive/2024-06/ (5 tweets)
#   ✓ 1790111111111111111.md (2024-06-15)
#   ✓ 1790222222222222222.md (2024-06-18)
#   ✓ 1790333333333333333.md (2024-06-22)
#   ✓ 1790444444444444444.md (2024-06-25)
#   ✓ 1790555555555555555.md (2024-06-28)
#
# → tweets-archive/2024-07/ (10 tweets)
#   ✓ 1791111111111111111.md (2024-07-02)
#   ✓ 1791222222222222222.md (2024-07-05)
#   ... (8 more)
#
# Summary:
#   ✓ 15 tweets archived
#   ✓ 27 tweets remaining active
#   ✓ Archive organized by month
#
# Before archiving:
#   Total tweets: 42
#   Oldest: 2024-06-15
#   Newest: 2024-11-02
#
# After archiving:
#   Active tweets: 27
#   Archived tweets: 15
#   Oldest active: 2024-08-05
#
# ✓ Changes committed:
#   "chore: archive 15 tweets older than 90 days"
#
# Active bookmarks: http://localhost:3000/bookmarks
```
