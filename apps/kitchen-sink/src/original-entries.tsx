import { createPages } from "waku";
import type { PathsForPages } from "waku/router";

import HomeLayout from "./app/@layout";
import Root from "./app/@root";
import MDXDemoPage from "./app/mdx-demo/page.static";
import HomePage from "./app/page";

const pages = createPages(
  async ({ createPage, createLayout, createRoot, createApi }) => [
    createRoot({
      render: "dynamic",
      component: Root,
    }),

    createLayout({
      render: "dynamic",
      path: "/",
      component: HomeLayout,
    }),

    createPage({
      render: "dynamic",
      path: "/",
      component: HomePage,
    }),

    createPage({
      render: "static",
      path: "/mdx-demo",
      component: MDXDemoPage,
    }),

    // createPage({
    //   render: "static",
    //   path: "/foo",
    //   component: FooPage,
    // }),

    // createPage({
    //   render: "static",
    //   path: "/bar",
    //   component: BarPage,
    // }),

    // createPage({
    //   render: "dynamic",
    //   path: "/baz",
    //   // Inline component is also possible.
    //   component: () => <h2>Dynamic: Baz</h2>,
    // }),

    // createPage({
    //   render: "dynamic",
    //   path: "/nested/baz",
    //   component: NestedBazPage,
    // }),

    // createPage({
    //   render: "static",
    //   path: "/nested/qux",
    //   component: NestedQuxPage,
    // }),

    // createLayout({
    //   render: "static",
    //   path: "/nested",
    //   component: NestedLayout,
    // }),

    // createPage({
    //   render: "static",
    //   path: "/nested/[id]",
    //   staticPaths: ["foo", "bar"],
    //   component: ({ id }) => (
    //     <>
    //       <h2>Nested</h2>
    //       <h3>Static: {id}</h3>
    //     </>
    //   ),
    // }),

    // createPage({
    //   render: "dynamic",
    //   path: "/wild/[...id]",
    //   component: ({ id }) => (
    //     <>
    //       <h2>Wildcard</h2>
    //       <h3>Slug: {id.join("/")}</h3>
    //     </>
    //   ),
    // }),

    // createLayout({
    //   render: "static",
    //   path: "/nested/[id]",
    //   component: DeeplyNestedLayout,
    // }),

    // createPage({
    //   render: "dynamic",
    //   path: "/nested/[id]",
    //   component: ({ id }) => (
    //     <>
    //       <h2>Nested</h2>
    //       <h3>Dynamic: {id}</h3>
    //     </>
    //   ),
    // }),

    // createPage({
    //   render: "dynamic",
    //   path: "/any/[...all]",
    //   component: ({ all }) => <h2>Catch-all: {all.join("/")}</h2>,
    // }),

    // // Custom Not Found page
    // createPage({
    //   render: "static",
    //   path: "/404",
    //   component: () => <h2>Not Found</h2>,
    // }),

    // createApi({
    //   path: "/api/hi.txt",
    //   render: "static",
    //   method: "GET",
    //   handler: async () => {
    //     const hiTxt = await readFile("./private/hi.txt");
    //     return new Response(hiTxt);
    //   },
    // }),

    // createApi({
    //   path: "/api/hi",
    //   render: "dynamic",
    //   handlers: {
    //     GET: async () => {
    //       return new Response("hello world!");
    //     },
    //     POST: async (req) => {
    //       const name = await req.text();
    //       return new Response(`hello ${name}!`);
    //     },
    //   },
    // }),

    // createApi({
    //   path: "/api/empty",
    //   render: "static",
    //   method: "GET",
    //   handler: async () => {
    //     return new Response(null, {
    //       status: 200,
    //     });
    //   },
    // }),
  ],
);

declare module "waku/router" {
  interface RouteConfig {
    paths: PathsForPages<typeof pages>;
  }
  interface CreatePagesConfig {
    pages: typeof pages;
  }
}

export default pages;
