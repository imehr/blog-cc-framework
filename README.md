# Blog-CC Framework

Claude Code plugin for managing blog-cc static sites with AI-powered content generation and deployment automation.

## Installation

```bash
/plugin marketplace add imehr/imehr-marketplace
/plugin install blog-cc-framework@imehr-marketplace
exit
claude
```

## Usage

Use the `/blog` command for all operations:

- `/blog` - Interactive content management
- "Add video [URL]" - AI-powered video metadata extraction
- "Create course [topic]" - AI-generated course outline
- "Deploy site" - GitHub Pages deployment with validation
- "Switch theme [name]" - Theme management with preview

## Features

- **AI Content Generation**: Automatic metadata extraction from URLs
- **Course Builder**: Interactive, AI-powered, and template-based
- **Validation**: 4-layer safety system (content, pre-deploy, preview, rollback)
- **Multi-Site Management**: Manage multiple blog-cc sites
- **Theme System**: 9 professional themes with live preview
- **Git Integration**: Auto-commits and deployment tagging

## Documentation

See `skills/content-management/blog-cc/` for complete documentation.

## License

MIT
