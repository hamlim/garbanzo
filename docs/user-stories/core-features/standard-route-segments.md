---
id: US-003
title: Standard Route Segments Support
status: draft
priority: high
created: 2025-02-16
---

## As a...
App developer using Garbanzo

## I want to...
define routes using standardized page and route files within directories that clearly represent the URL structure

## So that...
I can create clear, unambiguous routing structures in my application with a consistent and predictable pattern

## Acceptance Criteria
- [ ] Support standard route files with fixed naming:
  - [ ] `page.<extension>` for HTML-producing routes
  - [ ] `route.<extension>` for API routes
- [ ] Enforce directory-based routing where:
  - [ ] Directory names determine the URL segment
  - [ ] Files must be named exactly `page.<extension>` or `route.<extension>`
  - [ ] Reject any other file naming patterns (e.g., `dashboard.page.tsx`)
- [ ] Explicitly reject and provide clear error messages for:
  - [ ] Named route files (e.g., `dashboard.page.tsx`)
  - [ ] Index files (e.g., `index.page.tsx`, `index.route.ts`)
  - [ ] Files outside of appropriate directories
- [ ] Generate appropriate route types based on directory structure
- [ ] Provide clear validation for:
  - [ ] Valid file extensions (ts, tsx, js, jsx)
  - [ ] Proper file placement within directories
  - [ ] URL-safe directory naming

## Notes
This introduces a simplified, directory-based routing pattern that enforces clear structure through directories rather than file names.

Example valid structure:
```
app/
  page.tsx           # Renders at /
  about/
    page.tsx         # Renders at /about
  dashboard/
    page.tsx         # Renders at /dashboard
    settings/
      page.tsx       # Renders at /dashboard/settings
  api/
    users/
      route.ts       # Handles /api/users
```

Example invalid structures:
```
# Invalid: Named route files
dashboard.page.tsx
users.route.ts

# Invalid: Index files
index.page.tsx
index.route.ts

# Invalid: Incorrect naming
dashboard/
  view.tsx
api/
  endpoint.ts
```

The decision to use directory-based routing with fixed file names:
- Eliminates ambiguity about the source of truth for routes
- Makes the URL structure immediately obvious from directory structure
- Simplifies route file discovery and tooling
- Provides a clear pattern for organizing related routes

## Related
- Links to US-004 (Meta Route Segments)
- Links to US-005 (Route Segment Organization)
- Will need clear documentation on file naming requirements
- Consider impact on developer tooling and templates 