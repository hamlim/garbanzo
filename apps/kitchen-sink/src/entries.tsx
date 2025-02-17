/* this file is automatically generated by garbanzo */
/* DO NOT MANUALLY EDIT THIS FILE */

import { createPages } from "waku";
import type { PathsForPages } from "waku/router";

import layout0 from "./app/@layout";
import notFound1 from "./app/@not-found";
import root2 from "./app/@root";
import page3 from "./app/mdx-demo/page.static";
import page4 from "./app/page";

let pages = createPages(async ({ createPage, createLayout, createRoot, createApi }) => [
createLayout({
  render: "dynamic",
  path: "/",
  component: layout0,
}),
createPage({
  render: "dynamic",
  path: "/[...path]",
  component: notFound1,
}),
createRoot({
  render: "dynamic",
  component: root2,
}),
createPage({
  render: "static",
  path: "/mdx-demo",
  component: page3,
}),
createPage({
  render: "dynamic",
  path: "/",
  component: page4,
}),
]);

declare module "waku/router" {
  interface RouteConfig {
    paths: PathsForPages<typeof pages>;
  }
  interface CreatePagesConfig {
    pages: typeof pages;
  }
}

export default pages;