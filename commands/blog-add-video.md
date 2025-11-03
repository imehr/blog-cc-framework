# Add Video to Blog-CC Site

Add a YouTube video to your blog-cc site with AI-powered metadata extraction.

## Usage

```bash
/blog-add-video https://youtube.com/watch?v=VIDEO_ID
```

## What This Does

1. **Verifies** you're in a blog-cc project
2. **Extracts** video metadata from YouTube:
   - **Primary method**: Uses `fetch()` to get video metadata
   - **Fallback method**: If fetch fails, uses Chrome MCP to extract metadata from browser
3. **Generates** AI-enhanced description and tags using Claude
4. **Determines** best collection type (videos/tutorials/courses)
5. **Shows** preview for confirmation
6. **Creates** markdown file with YAML frontmatter at `content/collections/[type]/[slug].md`
7. **Commits** changes with descriptive message

## Metadata Extraction Methods

The command uses a **three-tier fallback strategy** for maximum reliability:

### Method 1: YouTube oEmbed API (Primary) ⭐
Uses YouTube's official oEmbed endpoint for metadata extraction.

**How it works:**
```
GET https://www.youtube.com/oembed?url=VIDEO_URL&format=json
```

**Provides:**
- ✅ Title
- ✅ Author/Channel name
- ✅ Thumbnail URL
- ❌ Duration (not available)

**Advantages:**
- Official YouTube API (no scraping)
- Fast and reliable
- No rate limits
- No browser required
- Works in all regions

**Why it's best:**
This is the most reliable method because it uses YouTube's official public API that never gets blocked.

### Method 2: Page Scraping (First Fallback)
If oEmbed fails, scrapes the YouTube page directly.

**Provides:**
- ✅ Title
- ✅ Author
- ✅ Duration (from schema.org markup)
- ✅ Description
- ✅ Thumbnail

**Limitations:**
- May be blocked by YouTube
- Slower than oEmbed
- Regional restrictions may apply

### Method 3: Chrome MCP (Final Fallback)
If both methods above fail, uses Chrome DevTools Protocol.

**How it works:**
1. Connects to your running Chrome browser
2. Navigates to the YouTube video page
3. Extracts metadata from rendered page

**Requirements:**
- Chrome browser running
- `superpowers-chrome` MCP plugin installed

**Advantages:**
- Always works (uses real browser)
- Bypasses all blocking
- Can access region-restricted content

## Examples

### Example 1: Successful oEmbed API Extraction

```bash
/blog-add-video https://youtube.com/watch?v=kCc8FmEb1nY

# Output:
# 📹 Adding video to blog-cc site...
#
# 🤖 Extracting metadata from URL...
# ℹ Trying oEmbed API...
# ✓ Metadata extracted via oEmbed API
# ✓ Duration extracted via page scraping
#
# Extracted metadata:
#   Title: Introduction to Transformers
#   Author: Andrej Karpathy
#   Duration: 45:30
#   Thumbnail: https://i.ytimg.com/vi/kCc8FmEb1nY/hqdefault.jpg
#
# 🤖 Generating enhanced content with AI...
# ✓ AI analysis complete:
#   Suggested tags: AI, Deep Learning, NLP, Transformers
#   Collection type: tutorials
#
# Does this look correct? (y/N): y
#
# ✓ Video added: content/collections/tutorials/introduction-to-transformers.md
# ✓ Changes committed
#
# Next steps:
#   - Run ./start.sh to preview
#   - Run /blog-deploy to publish
```

### Example 2: Automatic Chrome MCP Fallback

```bash
/blog-add-video https://youtube.com/watch?v=ueM54Q9AGZ4

# Output:
# 📹 Adding video to blog-cc site...
#
# 🤖 Extracting metadata from URL...
# ⚠ Direct fetch blocked by YouTube
# ℹ Falling back to Chrome MCP extraction...
#
# 🌐 Connecting to Chrome browser...
# ✓ Connected to Chrome DevTools Protocol
# ✓ Navigating to video page...
# ✓ Page loaded successfully
#
# 🤖 Extracting metadata from browser...
# ✓ Title: Building AI Agents with LangChain
# ✓ Channel: Harrison Chase
# ✓ Duration: 1:23:45
# ✓ Description extracted
#
# 🤖 Generating enhanced content with AI...
# ✓ AI analysis complete:
#   Suggested tags: AI, LangChain, Agents, Tutorial
#   Collection type: tutorials
#
# Does this look correct? (y/N): y
#
# ✓ Video added: content/collections/tutorials/building-ai-agents-with-langchain.md
# ✓ Changes committed
```

## Interactive Mode

If you don't provide a URL, you'll be prompted for all fields:

```bash
/blog-add-video

# Prompts:
# ? YouTube URL: https://youtube.com/watch?v=...
# ? Video title: (fetched from URL or enter manually)
# ? Author/Channel:
# ? Duration (e.g., 45:30):
# ? Description:
# ? Tags (comma-separated):
# ? Collection type: videos / tutorials / courses
```

## Troubleshooting

### Fetch Fails and Chrome MCP Unavailable

**Problem:** Direct fetch fails and Chrome MCP is not installed.

**Solution:**
```bash
# Install Chrome MCP plugin
/plugin install superpowers-chrome@superpowers-marketplace

# Restart Claude Code
exit
claude

# Try command again
/blog-add-video https://youtube.com/watch?v=VIDEO_ID
```

### Chrome MCP Extraction Fails

**Problem:** Both fetch and Chrome MCP fail.

**Solution:**
1. Ensure Chrome browser is running
2. Try navigating to the video manually first
3. Use interactive mode to enter metadata manually:
   ```bash
   /blog-add-video
   # Then enter details when prompted
   ```

### Video Already Exists

**Problem:** Command reports video already exists.

**Solution:**
- Check `content/collections/videos/` for existing file
- Delete old file if you want to re-add
- Or manually edit the existing markdown file

## Requirements

**For Primary Method (Fetch):**
- Internet connection
- Access to YouTube (not blocked)

**For Fallback Method (Chrome MCP):**
- Chrome browser running
- `superpowers-chrome` plugin installed:
  ```bash
  /plugin install superpowers-chrome@superpowers-marketplace
  ```
- No additional login required for public videos

## Related Commands

- `/blog-validate` - Validate all content before adding
- `/blog-deploy` - Deploy site after adding content
- `/blog-sync-bookmarks` - Sync Twitter bookmarks (also uses Chrome MCP)
