import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../types";

interface ChatMessageProps {
  message: Message;
}

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // User message - with container
  if (isUser) {
    return (
      <div className="message-animate flex justify-end mb-4 w-full group">
        <div className="max-w-[75%] bg-bg-light dark:bg-white/[0.08] text-text-primary dark:text-text-primary-dark rounded-2xl rounded-br-sm px-4 py-3">
          <p className="text-sm md:text-base whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <div className="flex items-center justify-end gap-2 mt-2">
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
              {formatTime(message.timestamp)}
            </p>
            <button
              onClick={handleCopy}
              className="p-0.5 rounded text-text-secondary dark:text-text-secondary-dark hover:text-purple-500 dark:hover:text-purple-400 transition-all opacity-0 group-hover:opacity-100"
              title="Copy message"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AI message - no container, just content with avatar
  return (
    <div className="message-animate flex justify-start mb-6 w-full group">
      <div className="flex items-start gap-3 max-w-[85%]">
        {/* AI Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="prose prose-sm md:prose-base max-w-none markdown-content dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0 text-text-primary dark:text-text-primary-dark leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-3 space-y-1.5 text-text-primary dark:text-text-primary-dark">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-3 space-y-1.5 text-text-primary dark:text-text-primary-dark">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-text-primary dark:text-text-primary-dark">
                    {children}
                  </li>
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code
                      className="bg-bg-accented dark:bg-bg-accented-dark px-1.5 py-0.5 rounded text-sm font-mono text-purple-700 dark:text-purple-400"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      className={`block bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto my-2 ${className}`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded-lg overflow-x-auto my-3">
                    {children}
                  </pre>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mb-3 text-text-primary-new dark:text-text-primary-new-dark">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold mb-2 text-text-primary-new dark:text-text-primary-new-dark">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-bold mb-2 text-text-primary-new dark:text-text-primary-new-dark">
                    {children}
                  </h3>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-text-primary-new dark:text-text-primary-new-dark">
                    {children}
                  </strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-purple-400 dark:border-purple-500 pl-4 my-3 text-text-secondary dark:text-text-secondary-dark italic">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full border border-border-regular dark:border-border-regular-dark rounded">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border-regular dark:border-border-regular-dark px-3 py-1.5 bg-bg-accented dark:bg-bg-accented-dark font-semibold text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border-regular dark:border-border-regular-dark px-3 py-1.5">
                    {children}
                  </td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && (
              <span className="inline-block w-2 h-5 ml-1 bg-purple-500 animate-pulse rounded-sm" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
              {formatTime(message.timestamp)}
            </p>
            <button
              onClick={handleCopy}
              className="p-0.5 rounded text-text-secondary dark:text-text-secondary-dark hover:text-purple-500 dark:hover:text-purple-400 transition-all opacity-0 group-hover:opacity-100"
              title="Copy message"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
