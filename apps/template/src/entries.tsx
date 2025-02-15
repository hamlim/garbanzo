import { createPages } from "waku";
import type { PathsForPages } from "waku/router";

import HomeLayout from "./app/_layout";
import Root from "./app/_root";
import { GET as greet } from "./app/api/greet.route";
import HomePage from "./app/index.page";
import MDXDemoPage from "./app/mdx/index.page";

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
      path: "/mdx",
      component: MDXDemoPage,
    }),

    createApi({
      path: "/api/greet",
      render: "dynamic",
      handlers: {
        GET: greet,
      },
    }),
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
