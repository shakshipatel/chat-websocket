import React from "react";

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
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

        {/* Working indicator */}
        <div className="flex items-center gap-2 py-2">
          {/* Rotating Loader */}
          <div className="w-4 h-4">
            <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-text-secondary dark:border-t-text-secondary-dark rounded-full animate-spin" />
          </div>

          {/* Working Text */}
          <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
            Working...
          </span>
        </div>
      </div>
    </div>
  );
};
