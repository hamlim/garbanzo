id: US-002
title: Initialize New Garbanzo Project via CLI
status: draft
priority: high
created: 2024-02-15

## As a...
Developer starting a new project

## I want to...
Create a new Garbanzo application using a simple CLI command that sets up all the necessary project structure and configuration

## So that...
I can quickly start developing my application without manually setting up boilerplate code and configuration

## Acceptance Criteria
- [ ] CLI provides a command to create a new project (e.g., `garbanzo init`)
- [ ] User can specify the target directory for the new project
- [ ] Project is initialized with all necessary files and dependencies from the template
- [ ] Git repository is automatically initialized
- [ ] Project includes sensible default configuration files (garbanzo.config.mjs, package.json, etc.)
- [ ] Clear success message and "next steps" instructions are displayed after initialization
- [ ] Dependencies are automatically installed
- [ ] Project structure matches the recommended Garbanzo application layout

## Notes
The initialization process should be similar to other modern frameworks like Next.js, providing a smooth developer experience. The template should be minimal but include all necessary configurations for immediate development.

## Related
- packages/cli/src/cli.ts
- apps/template/garbanzo.config.mjs
- apps/template/package.json
