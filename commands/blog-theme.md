# Switch Blog-CC Theme

Switch the theme for your blog-cc site with live preview.

## Usage

```bash
/blog-theme [theme-name]
```

## Available Themes

1. **iris** (default) - Tech Blue, Inter font, Vercel-inspired
2. **lavender** - Creative Purple, Playfair Display
3. **sakura** - Warm Pink, Quicksand
4. **moss** - Developer Green, JetBrains Mono
5. **amber** - Bold Orange, Montserrat
6. **orchid** - Luxury Purple, Cormorant Garamond
7. **slate** - Professional Gray, Work Sans
8. **rose** - Editorial Red-Pink, DM Serif Display
9. **sage** - Calm Green-Gray, Merriweather

## Examples

### Switch with Preview

```bash
/blog-theme lavender

# 🎨 Switching to lavender theme...
#
# ✓ .env updated with THEME=lavender
#
# Preview before committing? (y/N): y
#
# Building with lavender theme...
# ✓ Build successful
# ✓ Starting preview server on port 4567...
#
# Open http://localhost:4567 in your browser
#
# Keep this theme? (y/N): y
#
# ✓ Theme change committed
```

### List All Themes

```bash
/blog-theme --list

# 🎨 Available Themes:
#
# 1. Iris (default) - Tech Blue
#    Font: Inter
#    Style: Clean, modern, Vercel-inspired
#
# 2. Lavender - Creative Purple
#    Font: Playfair Display + Source Sans
#    Style: Elegant, editorial
#
# 3. Sakura - Warm Pink
#    Font: Quicksand + Open Sans
#    Style: Friendly, approachable
#
# ... (all 9 themes)
#
# Current theme: orchid
#
# Switch theme? (y/N)
```

### Compare Themes

```bash
/blog-theme --compare moss sakura

# Building comparison previews...
#
# ✓ Building with moss theme... Done (port 4567)
# ✓ Building with sakura theme... Done (port 4568)
#
# Opening both in browser...
#
# Which theme do you prefer?
#   ❯ Moss
#     Sakura
#     Neither (keep current: orchid)
#
# ? Your choice: Moss
#
# ✓ Switching to moss theme
# ✓ Changes committed
```

## Related Commands

- `/blog-deploy` - Deploy with new theme
- `/blog-validate` - Validate after theme change
