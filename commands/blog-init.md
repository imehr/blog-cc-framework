# Initialize Blog-CC Site

Initialize a new blog-cc site after cloning from template.

## Usage

```bash
/blog-init
```

## What This Does

1. **Detects** if already initialized
2. **Runs** configuration wizard
3. **Sets** theme, BASE_PATH, site title
4. **Creates** GitHub setup checklist
5. **Commits** initial configuration

## Example

```bash
/blog-init

# 🚀 Initializing new blog-cc site...
#
# Site name? (e.g., "Applied AI"): Applied AI
#
# Choose theme:
#   1. Iris (Tech Blue - default)
#   2. Lavender (Creative Purple)
#   3. Sakura (Warm Pink)
#   4. Moss (Developer Green)
#   5. Amber (Bold Orange)
#   6. Orchid (Luxury Purple)
#   7. Slate (Professional Gray)
#   8. Rose (Editorial Red-Pink)
#   9. Sage (Calm Green-Gray)
#
# ? Your choice: 6 (Orchid)
#
# Deployment path? (e.g., /applied-ai): /applied-ai
#
# GitHub repository? (e.g., Piazr/applied-ai): Piazr/applied-ai
#
# Applying configuration...
# ✓ .env created: THEME=orchid
# ✓ content/home.md updated: title="Applied AI"
# ✓ .env.production created: BASE_PATH=/applied-ai
# ✓ Changes committed
#
# Next steps for GitHub Pages deployment:
#
# 1. Create repository on GitHub:
#    https://github.com/Piazr/applied-ai
#
# 2. Set repository variables (Settings → Secrets → Variables):
#    THEME = orchid
#    BASE_PATH = /applied-ai
#
# 3. Enable GitHub Pages (Settings → Pages):
#    Source: GitHub Actions
#
# 4. Push to GitHub:
#    git remote add origin https://github.com/Piazr/applied-ai.git
#    git push -u origin main
#
# 5. Deploy:
#    /blog-deploy
#
# Save instructions to SETUP.md? (y/N): y
#
# ✓ Instructions saved to SETUP.md
```

## Related Commands

- `/blog-theme` - Change theme after init
- `/blog-add-video` - Start adding content
- `/blog-deploy` - Deploy site
