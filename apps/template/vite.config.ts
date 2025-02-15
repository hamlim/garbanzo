import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

import rehypeMdxCodeProps from "rehype-mdx-code-props";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

let mdxPlugin = mdx({
  remarkPlugins: [
    remarkFrontmatter,
    [remarkMdxFrontmatter, { name: "frontmatter" }],
    remarkGfm,
  ],
  rehypePlugins: [rehypeMdxCodeProps],
  providerImportSource: "#utils/mdx-components",
});

export default defineConfig({
  resolve: {
    alias: {
      "#utils/*": "./src/utils/*",
    },
  },
  plugins: [tailwindcss(), mdxPlugin],
});
