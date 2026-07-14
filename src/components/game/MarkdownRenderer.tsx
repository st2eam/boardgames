import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkMahjongTiles } from "@/lib/remark-mahjong-tiles";
import { parseShortcode } from "@/lib/mahjong/shortcode";
import { InlineTile } from "./trainer/InlineTile";
import { extractToc } from "@/lib/markdown-toc";

interface Props {
  content: string;
}

export function MarkdownRenderer({ content }: Props) {
  const toc = extractToc(content);
  const idQueue = toc.map((item) => item.id);
  let headingIndex = 0;

  const nextHeadingId = () => {
    const id = idQueue[headingIndex] ?? `section-${headingIndex + 1}`;
    headingIndex += 1;
    return id;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMahjongTiles]}
      components={{
        h1: ({ children }) => (
          <h1 className="mb-4 mt-8 text-2xl font-bold text-stone-900 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => {
          const id = nextHeadingId();
          return (
            <h2
              id={id}
              className="mb-3 mt-6 scroll-mt-24 text-xl font-semibold text-primary-dark"
            >
              {children}
            </h2>
          );
        },
        h3: ({ children }) => {
          const id = nextHeadingId();
          return (
            <h3
              id={id}
              className="mb-2 mt-4 scroll-mt-24 text-lg font-semibold text-stone-800"
            >
              {children}
            </h3>
          );
        },
        p: ({ children }) => (
          <p className="mb-3 leading-relaxed text-stone-700">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-3 list-disc space-y-1 pl-6 text-stone-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 list-decimal space-y-1 pl-6 text-stone-700">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        table: ({ children }) => (
          <div className="mb-4 overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-amber-50/50">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="border-b border-border px-4 py-2.5 text-left font-semibold text-stone-800">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-border px-4 py-2.5 text-stone-700">
            {children}
          </td>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-stone-900">{children}</strong>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-accent hover:text-accent/80 underline decoration-accent/30 hover:decoration-accent transition-colors"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        ),
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            const text = typeof children === "string" ? children : String(children ?? "");
            if (text.startsWith("mj:")) {
              const code = text.slice(3);
              const tile = parseShortcode(code);
              if (tile) return <InlineTile tile={tile} />;
            }
            return (
              <code className="rounded-md bg-amber-50 px-1.5 py-0.5 text-sm font-mono text-primary-dark">
                {children}
              </code>
            );
          }
          return (
            <pre className="mb-4 overflow-x-auto rounded-lg bg-stone-900 p-4 text-sm text-amber-50">
              <code className={className}>{children}</code>
            </pre>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="mb-3 border-l-4 border-amber-400 bg-amber-50/50 px-4 py-2 text-stone-700 italic">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-6 border-border" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
