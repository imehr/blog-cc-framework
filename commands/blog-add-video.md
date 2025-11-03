# Add Video to Blog-CC Site

Add a YouTube video to your blog-cc site with AI-powered metadata extraction.

## Usage

```bash
/blog-add-video https://youtube.com/watch?v=VIDEO_ID
```

## What This Does

1. **Verifies** you're in a blog-cc project
2. **Extracts** video metadata from YouTube (title, author, duration)
3. **Generates** AI-enhanced description and tags using Claude
4. **Determines** best collection type (videos/tutorials/courses)
5. **Shows** preview for confirmation
6. **Creates** markdown file with YAML frontmatter at `content/collections/[type]/[slug].md`
7. **Commits** changes with descriptive message

## Example

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

## Related Commands

- `/blog-validate` - Validate all content before adding
- `/blog-deploy` - Deploy site after adding content
