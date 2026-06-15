"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export function MarkdownRenderer({ content }: Props) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-8 text-2xl font-bold text-zinc-900 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-xl font-semibold text-zinc-800">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-lg font-semibold text-zinc-800">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-zinc-700">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-6 text-zinc-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-6 text-zinc-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full border-collapse border border-zinc-200 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-zinc-200 px-3 py-2 text-zinc-700">
              {children}
            </td>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-900">{children}</strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline transition-colors"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono text-zinc-800">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-4 border-blue-400 bg-blue-50 px-4 py-2 text-zinc-700">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-zinc-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
