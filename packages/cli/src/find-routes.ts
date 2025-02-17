import { readdirSync } from "node:fs";
import nodePath from "node:path";
import type { RouteDefinition } from "@garbanzo/types";

/**
 * Special Files:
 *
 * - `@layout.tsx` - Layout (shared wrapper) for the current route path
 * - `@root.tsx` - Root layout (shared wrapper) for the entire app (limit one per app)
 * - `@not-found.tsx` - Not found page for the current route path
 */

export type RequiredFSFeatures = {
  readdirSync: typeof readdirSync;
};

function createFileCollector(fs: RequiredFSFeatures) {
  return function collectFiles(path: string, files: Array<string> = []) {
    let entries = fs.readdirSync(path, { withFileTypes: true });

    for (let entry of entries) {
      if (entry.isDirectory()) {
        collectFiles(nodePath.join(path, entry.name), files);
      } else {
        files.push(nodePath.join(path, entry.name));
      }
    }

    return files;
  };
}

let defaultFSImplementation: RequiredFSFeatures = {
  readdirSync,
};

/**
 * Collect routes for a given directory root (appPath)
 * @param appPath - The root directory of the app, usually `./src/app`
 * @returns An array of routes found in the appPath, will be used to generate the `entries.tsx` file
 */
export function findRoutes(
  appPath: string,
  { fs }: { fs: RequiredFSFeatures } = {
    fs: defaultFSImplementation,
  },
): Array<RouteDefinition> {
  let collectFiles = createFileCollector(fs);
  let files = collectFiles(appPath);

  let routes: Array<RouteDefinition> = [];

  let count = 0;

  for (let file of files) {
    let cleanAppPath = appPath.replace("./", "");
    if (cleanAppPath.endsWith("/")) {
      cleanAppPath = cleanAppPath.slice(0, -1);
    }
    if (cleanAppPath.startsWith("/")) {
      cleanAppPath = cleanAppPath.slice(1);
    }
    file = file.replace(cleanAppPath, "");
    if (file.startsWith("/")) {
      file = file.slice(1);
    }
    let partialRoute: Partial<RouteDefinition> = {};

    partialRoute.filePath = file;
    let normalizedFile = file.replace(nodePath.sep, "/");

    let extension = nodePath.extname(file);
    let routeBasename = nodePath.basename(file).replace(extension, "");
    let routeSegments = normalizedFile.split(nodePath.sep);
    let routeParentSegment = routeSegments[routeSegments.length - 2] ?? "/";
    let route = normalizedFile
      .replace(routeBasename, "")
      .replace(extension, "");

    route = `/${route}`;

    if (route.endsWith("/") && route !== "/") {
      route = route.slice(0, -1);
    }

    switch (routeBasename) {
      case "@layout": {
        partialRoute.type = "@layout";
        partialRoute.kind = "meta";
        partialRoute.route = route;
        partialRoute.__name = `layout${count++}`;
        break;
      }
      case "@root": {
        partialRoute.type = "@root";
        partialRoute.kind = "meta";
        partialRoute.route = route;
        partialRoute.__name = `root${count++}`;
        break;
      }
      // Implementation wise - these will be a bit difficult
      // not-found could be a catch all segment
      case "@not-found": {
        partialRoute.type = "@not-found";
        partialRoute.kind = "meta";
        let notFoundRoute = route;
        if (!notFoundRoute.endsWith("/")) {
          notFoundRoute = `${notFoundRoute}/`;
        }
        notFoundRoute = `${notFoundRoute}[...path]`;
        partialRoute.route = notFoundRoute;
        partialRoute.__name = `notFound${count++}`;
        break;
      }
      case "page":
      case "page.static":
      case "route": {
        if (
          routeParentSegment.startsWith("[...") &&
          routeParentSegment.endsWith("]")
        ) {
          partialRoute.type = "catch-all-segment";
        } else if (
          routeParentSegment.startsWith("[") &&
          routeParentSegment.endsWith("]")
        ) {
          partialRoute.type = "dynamic-segment";
        } else {
          // @TODO: Handle invalid paths which have mismatching brackets?
          partialRoute.type = "static-segment";
        }

        if (routeBasename === "page") {
          partialRoute.kind = "dynamic-page";
          partialRoute.__name = `page${count++}`;
        } else if (routeBasename === "page.static") {
          partialRoute.kind = "static-page";
          partialRoute.__name = `page${count++}`;
        } else {
          partialRoute.kind = "route";
          partialRoute.__name = `route${count++}`;
        }

        partialRoute.route = route;

        break;
      }
      default: {
        // ignore - could be any other file that we don't care about!
      }
    }

    if (partialRoute.type) {
      routes.push(partialRoute as RouteDefinition);
    }
  }

  // find duplicate routes
  let uniqueRoutes = new Map<string, RouteDefinition>();
  let duplicateRoutes: Array<[RouteDefinition, RouteDefinition]> = [];

  for (let route of routes) {
    // @root and @layout meta segments don't "take over" actual routes
    if (route.type === "@root" || route.type === "@layout") {
      continue;
    }
    let normalizedRoute = route.route.replace(
      /\[\.\.\.[^\].]+\]/g,
      "<catch-all>",
    );
    if (uniqueRoutes.has(normalizedRoute)) {
      duplicateRoutes.push([
        // Route that conflicts
        route,
        // existing route
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        uniqueRoutes.get(normalizedRoute)!,
      ]);
    } else {
      uniqueRoutes.set(normalizedRoute, route);
    }
  }

  if (duplicateRoutes.length > 0) {
    throw new Error(
      `Found ${duplicateRoutes.length} duplicate route${duplicateRoutes.length === 1 ? "" : "s"}: \n${duplicateRoutes
        .map(([newRoute, existingRoute]) => {
          if (newRoute.type === "@not-found") {
            return `- ${newRoute.route} (catch-all segment created by @not-found meta segment [${newRoute.filePath}]) conflicts with route ${existingRoute.route} (added by ${existingRoute.type} [${existingRoute.filePath}])`;
          }
          if (existingRoute.type === "@not-found") {
            return `- ${existingRoute.route} (catch-all segment created by @not-found meta segment [${existingRoute.filePath}]) conflicts with route ${newRoute.route} (added by ${newRoute.type} [${newRoute.filePath}])`;
          }
          // I don't think we can actually hit this case
          return `- ${newRoute.route} (added by ${newRoute.type} segment [${newRoute.filePath}]) conflicts with route ${existingRoute.route} (added by ${existingRoute.type} segment [${existingRoute.filePath}])`;
        })
        .join("\n")}`,
    );
  }

  return routes;
}
