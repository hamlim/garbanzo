---
id: US-004
title: Meta Route Segments Support
status: draft
priority: high
created: 2025-02-16
---

## As a...
App developer using Garbanzo

## I want to...
define special-purpose routes using meta route segments (prefixed with @) that control application-wide routing behavior and layout structure

## So that...
I can implement consistent layouts, error handling, and special routes across my application in a standardized way

## Acceptance Criteria
- [ ] Support `@home.page.<extension>` as the root route/homepage
  - [ ] Only allow this file in the `appPath` directory
  - [ ] Provide clear error if placed in other directories
  - [ ] Handle this route as the entry point for '/' path
- [ ] Support `@layout.<extension>` for route segment layouts
  - [ ] Must export a default component that accepts `children` prop
  - [ ] Apply layout to all routes in current directory and subdirectories
  - [ ] Support nested layouts (child layouts wrap content inside parent layouts)
- [ ] Support `@root.<extension>` for HTML document structure
  - [ ] Must export a component defining `<html>`, `<head>`, and `<body>` elements
  - [ ] Support meta tags and document-level configuration
  - [ ] Only allow one root file per application
- [ ] Support `@error.<extension>` for error boundaries
  - [ ] Must export an error boundary component
  - [ ] Catch and handle errors from any child routes/components
  - [ ] Provide error details to the boundary component
  - [ ] Support nested error boundaries
- [ ] Support `@not-found.<extension>` for 404 experiences
  - [ ] Handle requests to non-existent routes
  - [ ] Support custom 404 pages at different route segment levels
  - [ ] Cascade up to parent directories if no local handler exists
- [ ] Implement TypeScript types for all meta segment components
- [ ] Provide clear error messages for invalid meta segment usage
- [ ] Generate appropriate props and context types for each meta segment

## Notes
Meta route segments provide a powerful way to control application-wide behavior through special files prefixed with '@'. This convention follows similar patterns in other frameworks but with explicit naming to avoid ambiguity.

Example structure:
```
app/pages/
         ├── @root.tsx
         ├── @layout.tsx
         ├── @error.tsx
         ├── page.tsx
         ├── dashboard/
         │   ├── @layout.tsx
         │   ├── @error.tsx
         │   └── @not-found.tsx
         │   └── page.tsx
         └── settings/
             └── @layout.tsx
             └── page.tsx
```

Each meta segment serves a specific purpose:
- `page.*`: Application homepage/root route
- `@layout.*`: Layout wrapper for route segments
- `@root.*`: HTML document structure
- `@error.*`: Error boundary for catching errors
- `@not-found.*`: 404 page for unmatched routes

## Related
- Links to US-003 (Standard Route Segments)
- Will need documentation on the interaction between standard and meta route segments
- Consider future meta segments for other special cases (loading, authentication, etc.) 