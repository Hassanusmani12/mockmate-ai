import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiCode } from 'react-icons/fi';

const cleanAsterisks = (text) => {
  if (!text) return '';
  return text
    .replace(/\*{4,}/g, '')
    .replace(/\*{3,}/g, '')
    .replace(/\*\*\s*\*\*/g, '')
    .replace(/\*\s*\*/g, '')
    .trim();
};

const CodeBlock = ({ children }) => (
  <div className="bg-gray-900 dark:bg-gray-950 text-green-400 rounded-xl p-4 my-3 overflow-x-auto text-sm font-mono leading-relaxed">
    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
      <FiCode className="w-4 h-4 text-gray-500" />
      <span className="text-xs text-gray-500 uppercase tracking-wider">Code</span>
    </div>
    <pre className="whitespace-pre-wrap">{String(children).replace(/\n$/, '')}</pre>
  </div>
);

const InlineCode = ({ children }) => (
  <code className="bg-gray-200 dark:bg-gray-700 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded-md text-sm font-mono">
    {children}
  </code>
);

const isBlock = (child) =>
  React.isValidElement(child) &&
  (child.type === 'pre' || child.type === 'div' || child.type === 'table' || child.type === 'blockquote');

const MarkdownContent = ({ content, accent }) => {
  const clean = cleanAsterisks(content);
  const accentColor = accent || 'purple';

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          if (inline) return <InlineCode>{children}</InlineCode>;
          return <CodeBlock>{children}</CodeBlock>;
        },
        p({ children }) {
          if (React.Children.toArray(children).some(isBlock)) {
            return <div className="my-2 leading-relaxed text-gray-700 dark:text-gray-300">{children}</div>;
          }
          return <p className="my-2 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>;
        },
        table({ children }) {
          return <div className="overflow-x-auto my-3"><table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">{children}</table></div>;
        },
        th({ children }) {
          return <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-left font-semibold">{children}</th>;
        },
        td({ children }) {
          return <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">{children}</td>;
        },
        blockquote({ children }) {
          const borderColor = accentColor === 'emerald' ? 'border-emerald-400' : 'border-purple-400';
          const bgColor = accentColor === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/5' : 'bg-purple-50 dark:bg-purple-500/5';
          return (
            <blockquote className={`border-l-4 ${borderColor} dark:${borderColor} pl-4 py-2 my-3 ${bgColor} rounded-r-xl italic text-gray-700 dark:text-gray-300`}>
              {children}
            </blockquote>
          );
        },
        ul({ children }) {
          return <ul className="list-disc pl-5 my-2 space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-5 my-2 space-y-1 text-gray-700 dark:text-gray-300">{children}</ol>;
        },
        h1({ children }) { return <h1 className="text-xl font-bold mt-5 mb-3 text-gray-900 dark:text-white">{children}</h1>; },
        h2({ children }) { return <h2 className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-white">{children}</h2>; },
        h3({ children }) { return <h3 className="text-base font-semibold mt-3 mb-2 text-gray-900 dark:text-white">{children}</h3>; },
      }}
    >
      {clean}
    </ReactMarkdown>
  );
};

export default MarkdownContent;
