import React, { useState, KeyboardEvent } from "react";

interface Props {
  onSend: (message: string) => void;
  disabled: boolean;
  maxLength?: number;
}

export const ChatInput: React.FC<Props> = ({
  onSend,
  disabled,
  maxLength = 1000,
}) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remainingChars = maxLength - input.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="bg-bg-opaque dark:bg-bg-opaque-dark rounded-2xl shadow-sm p-4 border border-border-regular dark:border-border-regular-dark">
      <div className="flex items-center gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI a question or make a request..."
          disabled={disabled}
          rows={1}
          className={`flex-1 resize-none rounded-xl border-0 px-4 py-3 text-text-primary dark:text-text-primary-dark placeholder-text-secondary dark:placeholder-text-secondary-dark focus:outline-none focus:ring-0 transition-colors ${
            disabled
              ? "bg-bg-accented dark:bg-bg-accented-dark cursor-not-allowed"
              : "bg-bg-light dark:bg-white/[0.08]"
          }`}
          style={{ minHeight: "48px", maxHeight: "150px" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = Math.min(target.scrollHeight, 150) + "px";
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim() || isOverLimit}
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            disabled || !input.trim() || isOverLimit
              ? "bg-bg-accented dark:bg-bg-accented-dark text-text-secondary dark:text-text-secondary-dark cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:scale-105"
          }`}
        >
          <svg
            className="w-5 h-5 rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex items-center gap-3">
          <button className="text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
            Press Enter to send
          </span>
        </div>
        <span
          className={`text-xs ${
            isOverLimit
              ? "text-red-500"
              : remainingChars < 100
              ? "text-yellow-500"
              : "text-text-secondary dark:text-text-secondary-dark"
          }`}
        >
          {remainingChars}
        </span>
      </div>
    </div>
  );
};
