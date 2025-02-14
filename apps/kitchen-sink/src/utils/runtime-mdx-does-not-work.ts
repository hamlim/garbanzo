import { evaluate } from "@mdx-js/mdx";
import { Fragment } from "react";
import * as jsxRuntime from "react/jsx-runtime";
import rehypeMdxCodeProps from "rehype-mdx-code-props";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

type Options = {
  content: string;
  useMDXComponents: () => Record<string, React.ComponentType>;
};

type Result<FrontMatter extends Record<string, unknown>> = {
  Component: React.ComponentType;
  frontmatter: FrontMatter;
};

export async function transformMDX<
  FrontMatter extends Record<string, unknown>,
>({ content, useMDXComponents }: Options): Promise<Result<FrontMatter>> {
  let result = await evaluate(content, {
    remarkPlugins: [
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: "frontmatter" }],
      remarkGfm,
    ],
    rehypePlugins: [rehypeMdxCodeProps],
    Fragment,
    useMDXComponents,
    jsx: jsxRuntime.jsx,
    jsxs: jsxRuntime.jsxs,
    // @ts-expect-error - not sure what's happening here
    jsxDEV: jsxRuntime.jsxDEV,
  });

  return {
    Component: result.default,
    frontmatter: result.frontmatter ?? {},
  } as Result<FrontMatter>;
}
