import { readFile } from "node:fs/promises";
import { Action } from "@local/components/action";
import { Heading } from "@local/components/heading";
import { transformMDX } from "../utils/mdx";

export default async function MDXDemoPage() {
  let contents = await readFile("./private/test.mdx", "utf-8");

  let { Component, frontmatter } = await transformMDX({
    content: contents,
    useMDXComponents: () => ({
      h1: (props) => <Heading level={1} {...props} />,
      h2: (props) => <Heading level={2} {...props} />,
      h3: (props) => <Heading level={3} {...props} />,
      h4: (props) => <Heading level={4} {...props} />,
      h5: (props) => <Heading level={5} {...props} />,
      h6: (props) => <Heading level={6} {...props} />,
      a: (props) => <Action is="a" {...props} />,
      p: (props) => <p {...props} />,
      ul: (props) => <ul {...props} />,
      ol: (props) => <ol {...props} />,
      li: (props) => <li {...props} />,
      blockquote: (props) => <blockquote {...props} />,
    }),
  });

  return (
    <section className="font-mono">
      <pre className="font-mono">{JSON.stringify(frontmatter, null, 2)}</pre>
      <div className="border border-gray-200 rounded-lg p-4">
        <Component />
      </div>
    </section>
  );
}
