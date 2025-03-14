import { describe, expect, test } from "bun:test";
import type { RouteDefinition } from "@garbanzo/types";
import { memfs } from "memfs";
import { type RequiredFSFeatures, findRoutes } from "../find-routes";

function makeFS(tree: Parameters<typeof memfs>[0]): RequiredFSFeatures {
  let memoryFs = memfs(tree, "./");
  return memoryFs.fs as RequiredFSFeatures;
}

// __name is an implementation detail
function cleanRouteDefinition(
  route: RouteDefinition,
): Omit<RouteDefinition, "__name"> {
  let { __name, ...rest } = route;
  return rest;
}

function sortRoutes(a: RouteDefinition, b: RouteDefinition): number {
  return a.route.localeCompare(b.route);
}

describe("findRoutes", () => {
  test("should return an empty array if no routes are found", () => {
    let fs = makeFS({
      src: {
        app: {},
      },
    });
    let routes = findRoutes("./src/app/", {
      fs,
    });

    expect(routes).toEqual([]);
  });

  test("handles basic routes", () => {
    let fs = makeFS({
      src: {
        app: {
          "page.tsx": "export default function Homepage() {}",
          dashboard: {
            "page.tsx": "export default function Dashboard() {}",
          },
          api: {
            "route.ts": "export default function apiRoute() {}",
          },
        },
      },
    });
    let routes = findRoutes("./src/app/", {
      fs,
    });

    expect(routes.toSorted(sortRoutes).map(cleanRouteDefinition)).toEqual(
      (
        [
          {
            filePath: "api/route.ts",
            kind: "route",
            route: "/api",
            type: "static-segment",
          },
          {
            filePath: "dashboard/page.tsx",
            kind: "dynamic-page",
            route: "/dashboard",
            type: "static-segment",
          },
          {
            filePath: "page.tsx",
            kind: "dynamic-page",
            route: "/",
            type: "static-segment",
          },
        ] as Array<RouteDefinition>
      ).toSorted(sortRoutes),
    );
  });

  test("handles static routes", () => {
    let fs = makeFS({
      src: {
        app: {
          "page.tsx": "export default function Homepage() {}",
          dashboard: {
            "page.tsx": "export default function Dashboard() {}",
          },
          blog: {
            "some-post": {
              "page.static.tsx": "export default function BlogPost() {}",
            },
          },
          api: {
            "route.ts": "export default function apiRoute() {}",
          },
        },
      },
    });
    let routes = findRoutes("./src/app/", {
      fs,
    });

    expect(routes.toSorted(sortRoutes).map(cleanRouteDefinition)).toEqual(
      (
        [
          {
            filePath: "api/route.ts",
            kind: "route",
            route: "/api",
            type: "static-segment",
          },
          {
            filePath: "dashboard/page.tsx",
            kind: "dynamic-page",
            route: "/dashboard",
            type: "static-segment",
          },
          {
            filePath: "blog/some-post/page.static.tsx",
            kind: "static-page",
            route: "/blog/some-post",
            type: "static-segment",
          },
          {
            filePath: "page.tsx",
            kind: "dynamic-page",
            route: "/",
            type: "static-segment",
          },
        ] as Array<RouteDefinition>
      ).toSorted(sortRoutes),
    );
  });

  test("ignores non-route segment files", () => {
    let fs = makeFS({
      src: {
        app: {
          "page.tsx": "export default function Homepage() {}",
          "actions.ts": '"use server";\n\nexport async function action() {}',
          dashboard: {
            "actions.ts": '"use server";\n\nexport async function action() {}',
            "page.tsx": "export default function Dashboard() {}",
          },
          api: {
            "helpers.ts": "export function helper() {}",
            "route.ts": "export default function apiRoute() {}",
          },
        },
      },
    });
    let routes = findRoutes("./src/app/", {
      fs,
    });

    expect(routes.toSorted(sortRoutes).map(cleanRouteDefinition)).toEqual(
      (
        [
          {
            filePath: "api/route.ts",
            kind: "route",
            route: "/api",
            type: "static-segment",
          },
          {
            filePath: "dashboard/page.tsx",
            kind: "dynamic-page",
            route: "/dashboard",
            type: "static-segment",
          },
          {
            filePath: "page.tsx",
            kind: "dynamic-page",
            route: "/",
            type: "static-segment",
          },
        ] as Array<RouteDefinition>
      ).toSorted(sortRoutes),
    );
  });

  test("handles dynamic and catch-all routes", () => {
    let fs = makeFS({
      src: {
        app: {
          "page.tsx": "export default function Homepage() {}",
          dashboard: {
            "page.tsx": "export default function Dashboard() {}",
          },
          api: {
            "route.ts": "export default function apiRoute() {}",
          },
          "[id]": {
            "page.tsx": "export default function DynamicSegment({id}) {}",
          },
          "[...slug]": {
            "page.tsx": "export default function CatchAllSegment({slug}) {}",
          },
        },
      },
    });
    let routes = findRoutes("./src/app/", {
      fs,
    });

    expect(routes.toSorted(sortRoutes).map(cleanRouteDefinition)).toEqual(
      (
        [
          {
            filePath: "[...slug]/page.tsx",
            kind: "dynamic-page",
            route: "/[...slug]",
            type: "catch-all-segment",
          },
          {
            filePath: "[id]/page.tsx",
            kind: "dynamic-page",
            route: "/[id]",
            type: "dynamic-segment",
          },
          {
            filePath: "api/route.ts",
            kind: "route",
            route: "/api",
            type: "static-segment",
          },
          {
            filePath: "dashboard/page.tsx",
            kind: "dynamic-page",
            route: "/dashboard",
            type: "static-segment",
          },
          {
            filePath: "page.tsx",
            kind: "dynamic-page",
            route: "/",
            type: "static-segment",
          },
        ] as Array<RouteDefinition>
      ).toSorted(sortRoutes),
    );
  });

  test("handles meta route segments", () => {
    let fs = makeFS({
      src: {
        app: {
          "@root.tsx": "export default function Root() {}",
          "@layout.tsx": "export default function Layout() {}",
          "@not-found.tsx": "export default function NotFound() {}",
          "page.tsx": "export default function Homepage() {}",
          dashboard: {
            "@layout.tsx": "export default function Layout() {}",
            "page.tsx": "export default function Dashboard() {}",
          },
          api: {
            "route.ts": "export default function apiRoute() {}",
          },
        },
      },
    });
    let routes = findRoutes("./src/app/", {
      fs,
    });

    expect(routes.toSorted(sortRoutes).map(cleanRouteDefinition)).toEqual(
      (
        [
          {
            filePath: "@layout.tsx",
            kind: "meta",
            route: "/",
            type: "@layout",
          },
          {
            filePath: "@not-found.tsx",
            kind: "meta",
            route: "/[...path]",
            type: "@not-found",
          },
          {
            filePath: "@root.tsx",
            kind: "meta",
            route: "/",
            type: "@root",
          },
          {
            filePath: "api/route.ts",
            kind: "route",
            route: "/api",
            type: "static-segment",
          },
          {
            filePath: "dashboard/@layout.tsx",
            kind: "meta",
            route: "/dashboard",
            type: "@layout",
          },
          {
            filePath: "dashboard/page.tsx",
            kind: "dynamic-page",
            route: "/dashboard",
            type: "static-segment",
          },
          {
            filePath: "page.tsx",
            kind: "dynamic-page",
            route: "/",
            type: "static-segment",
          },
        ] as Array<RouteDefinition>
      ).toSorted(sortRoutes),
    );
  });

  test("handles not-found routes", () => {
    let fs = makeFS({
      src: {
        app: {
          "@root.tsx": "export default function Root() {}",
          "@layout.tsx": "export default function Layout() {}",
          "@not-found.tsx": "export default function NotFound() {}",
          "page.tsx": "export default function Homepage() {}",
          dashboard: {
            "@layout.tsx": "export default function Layout() {}",
            "page.tsx": "export default function Dashboard() {}",
            "@not-found.tsx": "export default function NotFound() {}",
          },
          blog: {
            "some-page": {
              "page.tsx": "export default function BlogPost() {}",
            },
            "@not-found.tsx": "export default function NotFound() {}",
          },
          api: {
            "route.ts": "export default function apiRoute() {}",
            "@not-found.tsx": "export default function NotFound() {}",
          },
        },
      },
    });
    let routes = findRoutes("./src/app/", {
      fs,
    });

    expect(routes.toSorted(sortRoutes).map(cleanRouteDefinition)).toEqual(
      (
        [
          {
            filePath: "@layout.tsx",
            kind: "meta",
            route: "/",
            type: "@layout",
          },
          {
            filePath: "@root.tsx",
            kind: "meta",
            route: "/",
            type: "@root",
          },
          {
            filePath: "@not-found.tsx",
            kind: "meta",
            route: "/[...path]",
            type: "@not-found",
          },
          {
            filePath: "api/route.ts",
            kind: "route",
            route: "/api",
            type: "static-segment",
          },
          {
            filePath: "api/@not-found.tsx",
            kind: "meta",
            route: "/api/[...path]",
            type: "@not-found",
          },
          {
            filePath: "blog/@not-found.tsx",
            kind: "meta",
            route: "/blog/[...path]",
            type: "@not-found",
          },
          {
            filePath: "blog/some-page/page.tsx",
            kind: "dynamic-page",
            route: "/blog/some-/page",
            type: "static-segment",
          },
          {
            filePath: "dashboard/@layout.tsx",
            kind: "meta",
            route: "/dashboard",
            type: "@layout",
          },
          {
            filePath: "dashboard/page.tsx",
            kind: "dynamic-page",
            route: "/dashboard",
            type: "static-segment",
          },
          {
            filePath: "page.tsx",
            kind: "dynamic-page",
            route: "/",
            type: "static-segment",
          },
          {
            filePath: "dashboard/@not-found.tsx",
            kind: "meta",
            route: "/dashboard/[...path]",
            type: "@not-found",
          },
        ] as Array<RouteDefinition>
      ).toSorted(sortRoutes),
    );
  });

  test("reports duplicate routes for conflicting not-found and catch-all segment", () => {
    let fs = makeFS({
      src: {
        app: {
          "@not-found.tsx": "export default function NotFound() {}",
          "[...slug]": {
            "page.tsx": "export default function CatchAll() {}",
          },
        },
      },
    });

    expect(() => findRoutes("./src/app/", { fs })).toThrowError(
      [
        "Found 1 duplicate route: ",
        "- /[...path] (catch-all segment created by @not-found meta segment [@not-found.tsx]) conflicts with route /[...slug] (added by catch-all-segment [[...slug]/page.tsx])",
      ].join("\n"),
    );
  });
});
