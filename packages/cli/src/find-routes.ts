export type RouteKind = "page" | "api";

export type RouteType =
  // e.g. a leaf node in the route tree, will render a page or an api
  "generic" | "@layout" | "@root" | "@not-found" | "@error";

export type Route = {
  // the on-disk path to the file for the route
  // relative to the appPath
  // e.g. `api/users.route.ts`
  // or `index.page.tsx`
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
  // or an API route (expected to export a collection of route handlers [GET, POST, PUT, DELETE, etc.])
  kind: RouteKind;
  // The type of route, either a generic route (expected to export a default React server component)
  // or a special route (expected to export a React server component that is not a page)
  type: RouteType;
};

/**
 * Special Files:
 *
 * - `@layout.tsx` - Layout (shared wrapper) for the current route path
 * - `@root.tsx` - Root layout (shared wrapper) for the entire app (limit one per app)
 * - `@not-found.tsx` - Not found page for the current route path
 * - `@error.tsx` - Error page for the current route path
 *
 */

/**
 * Collect routes for a given directory root (appPath)
 * @param appPath - The root directory of the app, usually `./src/app`
 * @returns An array of routes found in the appPath, will be used to generate the `entries.tsx` file
 */
export async function findRoutes(appPath: string): Promise<Array<Route>> {
  return [];
}
