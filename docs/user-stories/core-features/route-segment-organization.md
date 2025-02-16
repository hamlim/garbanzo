---
id: US-005
title: Route Segment Organization and Nesting
status: draft
priority: high
created: 2025-02-16
---

## As a...
App developer using Garbanzo

## I want to...
have a clear and intuitive way to organize route segments and their associated layouts, especially for nested routes, without creating confusing or redundant directory structures

## So that...
I can maintain a clean and maintainable routing structure that scales well with application complexity

## Acceptance Criteria
- [ ] Implement the directory-based pattern with flat meta files as the canonical approach:
  ```
  dashboard/
    @layout.tsx
    @error.tsx
    page.tsx
    settings/
      page.tsx
      @layout.tsx
  ```
- [ ] Enforce that route segments must:
  - [ ] Be defined in directories using `page.<extension>` or `route.<extension>`
  - [ ] Not use segment names in the file (e.g., `dashboard.page.tsx` is invalid)
  - [ ] Be accompanied by meta files in the same directory when needed
- [ ] Ensure meta files:
  - [ ] Are prefixed with @ and placed in the same directory as their associated route
  - [ ] Apply to all routes within their directory and subdirectories
  - [ ] Can be nested (child directory meta files override parent directory ones)
- [ ] Implement clear validation and error messages for:
  - [ ] Invalid file structures (e.g., segment names in page files)
  - [ ] Misplaced meta components
  - [ ] Conflicting definitions
- [ ] Generate appropriate TypeScript types that reflect the directory structure
- [ ] Provide IDE tooling support for:
  - [ ] File creation templates
  - [ ] Navigation between related files
  - [ ] Visualization of route hierarchy

## Notes
We've chosen the directory-based pattern with flat meta files because:
- It provides clear ownership of meta components through directory structure
- Meta files are immediately visible in their directories
- The pattern scales well for deeply nested routes
- The pattern is easily migratable to from other popular tools like Next.js
- It maintains a clean separation between routes and their meta components
- It simplifies the relationship between routes and their associated files

Example valid structure:
```
app/
  @root.tsx
  @layout.tsx
  @error.tsx
  page.tsx
  about/
    page.tsx
  dashboard/
    @layout.tsx
    @error.tsx
    page.tsx
    settings/
      page.tsx
      @layout.tsx
    profile/
      page.tsx
```

Example invalid structures:
```
# Invalid: Named page files
dashboard.page.tsx

# Invalid: Meta files in wrong location
@layout.tsx
dashboard/
  page.tsx

# Invalid: Inconsistent naming
dashboard/
  index.tsx  # Should be page.tsx
```

## Related
- Links to US-003 (Standard Route Segments)
- Links to US-004 (Meta Route Segments)
- Will need to update documentation to reflect chosen pattern
- Consider providing migration tools for projects using other patterns 