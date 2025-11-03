# Deploy Blog-CC Site

Deploy your blog-cc site to GitHub Pages with full validation and monitoring.

## Usage

```bash
/blog-deploy
```

## What This Does

1. **Pre-deploy checks**:
   - Content validation (schema, duplicates, structure)
   - Build test
   - Theme compatibility
   - Git status check
   - Configuration validation

2. **Deployment**:
   - Creates deployment tag: `deploy/[site]/YYYY-MM-DD-HH-MM-SS`
   - Pushes to GitHub main branch
   - Triggers GitHub Actions workflow
   - Monitors deployment progress

3. **Post-deployment**:
   - Reports deployment status
   - Provides live URL
   - Suggests rollback if needed

## Example

```bash
/blog-deploy

# 🚀 Deploying to GitHub Pages...
#
# Pre-deploy checks:
#   ✓ Content validation passed (168 files)
#   ✓ Build successful (2m 34s)
#   ✓ Theme 'orchid' applied correctly
#   ✓ 127 pages generated
#   ✓ All internal links valid
#   ⚠ Warning: 3 uncommitted changes
#   ⚠ Warning: On branch 'feature-test', not 'main'
#
# Configuration:
#   - Site: applied-ai
#   - Theme: orchid
#   - BASE_PATH: /applied-ai
#   - Target: https://piazr.github.io/applied-ai/
#
# Deploy anyway? (y/N): y
#
# Creating deploy tag: deploy/applied-ai/2025-11-03-14-45
# ✓ Tag created
# ✓ Pushed to GitHub
#
# Monitoring deployment:
#   ✓ Pushed to GitHub
#   ✓ Workflow triggered (run #123)
#   ⏳ Building... (1m 15s)
#   ⏳ Deploying... (2m 40s)
#   ✓ Deployed successfully!
#
# Live at: https://piazr.github.io/applied-ai/
#
# 🎉 Deployment complete!
```

## Quick Deploy (Skip Validation)

```bash
/blog-deploy --force

# ⚠️ Quick deploy - skipping validation checks
#
# This could deploy broken content!
#
# Continue? (y/N): y
#
# Deploying without validation...
# ✓ Deployed
```

## Dry Run (Test Without Deploying)

```bash
/blog-deploy --dry-run

# Running deployment dry run...
#
# ✓ Content validation: PASS
# ✓ Build test: PASS (2m 31s)
# ✓ Theme compatibility: PASS
# ✓ Git status: CLEAN
# ✓ Configuration: VALID
#
# Deployment would:
#   1. Create tag: deploy/applied-ai/2025-11-03-14-50
#   2. Push to: origin/main
#   3. Trigger workflow: .github/workflows/deploy.yml
#   4. Deploy to: https://piazr.github.io/applied-ai/
#
# Estimated time: ~3 minutes
#
# Ready to deploy for real? (y/N)
```

## Rollback

```bash
/blog-rollback

# Finding latest deployment...
#
# Last deployment: deploy/applied-ai/2025-11-03-12-15
# Current deployment: deploy/applied-ai/2025-11-03-14-45
#
# Changes that will be reverted:
#   M  content/collections/videos/new-video.md (added)
#   M  content/pages/blog-post.md (modified)
#
# Rollback to previous version? (y/N): y
#
# ✓ Created rollback branch: rollback/2025-11-03-14-50
# ✓ Checked out: deploy/applied-ai/2025-11-03-12-15
# ✓ Pushed to GitHub
#
# Re-deployment triggered...
# ⏳ Building...
# ✓ Rolled back successfully!
```

## Related Commands

- `/blog-validate` - Validate before deploying
- `/blog-add-video` - Add content
- `/blog-theme [name]` - Switch theme before deploy
