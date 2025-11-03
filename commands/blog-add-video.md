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

The command uses two methods to extract video metadata:

### Method 1: Direct Fetch (Primary)
Attempts to fetch metadata directly from YouTube URL using standard HTTP requests.

**Advantages:**
- Fast and lightweight
- No browser required
- Works in all environments

**Limitations:**
- May be blocked by YouTube in some regions
- Rate limits may apply

### Method 2: Chrome MCP (Automatic Fallback)
If fetch fails, automatically falls back to Chrome DevTools Protocol:

**How it works:**
1. Connects to your running Chrome browser
2. Navigates to the YouTube video page
3. Extracts metadata from the rendered page:
   - Title from `<h1>` tag
   - Channel name from page metadata
   - Duration from video player
   - Description from page content

**Requirements:**
- Chrome browser running
- `superpowers-chrome` MCP plugin installed
- No login required (public videos)

**Advantages:**
- Always works (uses actual browser)
- No API rate limits
- Handles region restrictions

## Examples

### Example 1: Successful Direct Fetch

```bash
/blog-add-video https://youtube.com/watch?v=kCc8FmEb1nY

# Output:
# 📹 Adding video to blog-cc site...
#
# 🤖 Extracting metadata from URL...
# ✓ Metadata extracted:
#   Title: Introduction to Transformers
#   Author: Andrej Karpathy
#   Duration: 45:30
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
