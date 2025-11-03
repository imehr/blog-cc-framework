# Blog-CC Skill

Conversational content management for blog-cc static sites with AI generation and deployment automation.

## What This Skill Does

- **AI Content Creation**: Add videos/content with automatic metadata extraction from URLs
- **Content Validation**: Schema validation, duplicate detection, structure checks
- **Course Building**: Multi-module course scaffolding (coming soon)
- **Theme Management**: 9 professional themes with live preview
- **Deployment**: GitHub Pages with 4-layer safety system (coming soon)

## Usage

Use the `/blog` slash command to activate this skill for blog-cc content management tasks.

## Requirements

- Blog-cc project with `content/` directory structure
- Next.js-based static site
- TypeScript CLI utilities in `lib/cli/`

## Features

### Current
- Add video content with AI metadata extraction
- Content validation (schema, duplicates, structure)
- Project detection and configuration loading
- Auto-commit with git integration

### Coming Soon
- Course creation and management
- GitHub Pages deployment automation
- Theme switching with preview
- Multi-site management

## Documentation

See [SKILL.md](SKILL.md) for complete documentation including:
- Verification requirements
- Essential workflows
- Collection schemas
- Common patterns
- Troubleshooting

## CLI Utilities

Located in `lib/cli/`:
- **utils/**: YAML handler, project detector, git helper, config loader
- **content/**: Video addition, AI generator
- **validation/**: Content validator

## License

MIT
