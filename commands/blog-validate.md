# Validate Blog-CC Content

Validate all content in your blog-cc site for schema compliance, duplicates, and structure issues.

## Usage

```bash
/blog-validate
```

## What This Does

1. **Scans** all content directories (collections/, pages/, courses/)
2. **Validates** YAML frontmatter schemas for each collection type
3. **Checks** for duplicate slugs
4. **Validates** date formats in blog posts
5. **Verifies** course structure (course.md + modules/)
6. **Reports** errors (blocking) and warnings (non-blocking)

## Example Output

### All Valid

```bash
/blog-validate

# 🔍 Validating content...
#
# 📊 Validation complete: 168 files checked
#
# ✓ All content valid!
#
# Summary:
#   ✓ 45 videos validated
#   ✓ 12 podcasts validated
#   ✓ 8 people validated
#   ✓ 15 products validated
#   ✓ 23 blog posts validated
#   ✓ 2 courses validated (19 lessons)
#   ✓ No duplicate slugs found
#   ✓ All schemas valid
```

### With Errors

```bash
/blog-validate

# 🔍 Validating content...
#
# 📊 Validation complete: 168 files checked
#
# ❌ 3 errors found:
#
#   [schema] videos/my-video.md: Missing required field: author
#   [duplicate] tutorials/intro.md: Duplicate slug 'intro'
#   [schema] pages/my-post.md: Invalid date format (should be YYYY-MM-DD)
#
# ⚠ 2 warnings:
#
#   [link] pages/about.md: External link returns 404
#   [content] videos/old-video.md: No description provided
#
# Please fix errors before deploying.
```

## Collection Schemas

Each collection type has required fields:

- **videos**: title, author, url
- **podcasts**: title, host, url
- **people**: name, role, url
- **products**: name, description, url
- **courses**: title, provider, url
- **tutorials**: title, author, url
- **books**: title, author
- **repos**: title, owner, url
- **tweets**: author, content, url

## Related Commands

- `/blog-add-video` - Add content (auto-validates)
- `/blog-deploy` - Deploy (runs validation first)
