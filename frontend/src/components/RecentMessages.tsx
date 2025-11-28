import React, { useState } from "react";
import { ChatSession } from "../types";

interface Props {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearChat?: () => void;
}

export const RecentMessages: React.FC<Props> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onClearChat,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (sessions.length === 0) return null;

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClearChat?.();
  };

  return (
    <div className="space-y-1">
      {sessions.slice(0, 10).map((session) => {
        const isActive = currentSessionId === session.id;
        const isHovered = hoveredId === session.id;
        const showClearButton =
          isActive && session.messages.length > 0 && onClearChat;

        return (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            onMouseEnter={() => setHoveredId(session.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`px-3 py-2.5 rounded-lg transition-all cursor-pointer relative group ${
              isActive
                ? "bg-purple-100 dark:bg-purple-900/40 border-l-2 border-purple-500"
                : "hover:bg-bg-regular dark:hover:bg-bg-regular-dark border-l-2 border-transparent"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isActive
                      ? "text-purple-700 dark:text-purple-300"
                      : "text-text-primary dark:text-text-primary-dark"
                  }`}
                >
                  {session.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs ${
                      isActive
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-text-secondary dark:text-text-secondary-dark"
                    }`}
                  >
                    {session.messages.length} msg
                  </span>
                  <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
                    •
                  </span>
                  <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
                    {new Date(session.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              {/* Action buttons - Clear (for active) or Delete (on hover) */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {showClearButton && isHovered && (
                  <button
                    onClick={handleClear}
                    className="p-1.5 rounded hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
                    title="Clear chat"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                )}
                {isHovered && (
                  <button
                    onClick={(e) => handleDelete(e, session.id)}
                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                    title="Delete chat"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
