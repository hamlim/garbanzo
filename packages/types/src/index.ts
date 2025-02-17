export type RouteKind = "page" | "route" | "meta";

export type RouteType =
  // a static segment in the route path
  // e.g. `/users`
  | "static-segment"
  // a dynamic segment in the route path
  // e.g. `/[userId]`
  | "dynamic-segment"
  // a catch-all segment in the route path
  // e.g. `/[...slugs]`
  | "catch-all-segment"
  // a layout for the route segment
  | "@layout"
  // the root layout for the entire app
  | "@root"
  // the not found page for the route segment
  | "@not-found"
  // @TODO: decide if we want to support this or not!
  // the error page for the route segment
  | "@error";

export type RouteDefinition = {
  // the on-disk path to the file for the route
  // relative to the appPath
  // e.g. `api/users/route.ts`
  // or `page.tsx`
  // or `dashboard/@layout.tsx`
  // or `@root.tsx`
  // or `foo/@error.tsx`
  // or `@not-found.tsx`
  filePath: string;
  // the URL path for the route
  // e.g. `/`
  // or `/dashboard`
  // or `/dashboard/settings`
  // or `/api/users`
  route: string;
  // The kind of route, either a page (expected to export a default React server component)
  // or an API route (expected to export a default route handler)
  kind: RouteKind;
  // The type of the route segment
  // can be named segments (static, dynamic, or catch-all)
  // or special segments (@layout, @root, @not-found, @error)
  type: RouteType;
  // Automatically generated route segment name
  // used for imports within entries.tsx file
  __name: string;
};
