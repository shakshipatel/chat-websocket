import { useRef, useEffect, useState, useCallback } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { ConnectionIndicator } from "./components/ConnectionIndicator";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { TypingIndicator } from "./components/TypingIndicator";
import { SuggestionCards } from "./components/SuggestionCards";
import { RecentMessages } from "./components/RecentMessages";
import { ThemeToggle } from "./components/ThemeToggle";
import { ScrollIndicator } from "./components/ScrollIndicator";
import { ApiKeySettings, getStoredApiKey } from "./components/ApiKeySettings";

const SUGGESTIONS = [
  "Write a to-do list for a personal project",
  "Generate an email to reply to a job offer",
  "Summarize this article in one paragraph",
  "How does AI work in a technical capacity",
];

function App() {
  const {
    messages,
    sessions,
    currentSessionId,
    connectionStatus,
    isAiResponding,
    error,
    sendMessage,
    clearError,
    startNewChat,
    switchSession,
    deleteSession,
    clearCurrentChat,
    reconnect,
  } = useWebSocket();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const [userName] = useState("User");
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(() => !!getStoredApiKey());

  // Register message ref
  const registerMessageRef = useCallback(
    (id: string, element: HTMLDivElement | null) => {
      if (element) {
        messageRefsMap.current.set(id, element);
      } else {
        messageRefsMap.current.delete(id);
      }
    },
    []
  );

  // Auto-scroll to latest message with smooth scrolling
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  // Scroll when messages change or AI is responding
  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiResponding]);

  const handleSuggestionSelect = (suggestion: string) => {
    if (!currentSessionId) {
      startNewChat();
    }
    setTimeout(() => sendMessage(suggestion), 100);
  };

  const handleNewChat = () => {
    startNewChat();
  };

  const handleSendMessage = (content: string) => {
    if (!currentSessionId) {
      startNewChat();
      setTimeout(() => sendMessage(content), 100);
    } else {
      sendMessage(content);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-screen flex flex-col bg-bg-opaque dark:bg-bg-opaque-dark overflow-hidden">
      {/* Header - Fixed */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-4 border-b border-border-light dark:border-border-light-dark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <span className="text-text-primary dark:text-text-primary-dark font-semibold text-lg">
            ChatGPT 4o
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {/* API Key Settings Button */}
          <button
            onClick={() => setShowApiKeySettings(true)}
            className={`p-2 rounded-lg transition-colors ${
              hasApiKey
                ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50"
                : "text-text-secondary dark:text-text-secondary-dark hover:bg-bg-accented dark:hover:bg-bg-accented-dark"
            }`}
            title={hasApiKey ? "API Key configured" : "Set API Key"}
          >
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </button>
          <button
            onClick={handleNewChat}
            className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Chat
          </button>
          <ConnectionIndicator
            status={connectionStatus}
            onReconnect={reconnect}
          />
        </div>
      </header>

      {/* Main Content - Fixed height, no overflow */}
      <main className="flex-1 flex min-h-0">
        {/* Left Sidebar - Fixed, scrollable independently */}
        <div className="hidden lg:flex lg:flex-col w-72 border-r border-border-light dark:border-border-light-dark bg-bg-light dark:bg-bg-light-dark flex-shrink-0">
          <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-light-dark">
            <h3 className="text-text-primary dark:text-text-primary-dark text-base font-semibold">
              Chat History
            </h3>
            <button
              onClick={handleNewChat}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
            >
              + New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
            {sessions.length > 0 ? (
              <RecentMessages
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelectSession={switchSession}
                onDeleteSession={deleteSession}
                onClearChat={clearCurrentChat}
              />
            ) : (
              <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
                No chats yet
              </p>
            )}
          </div>
        </div>

        {/* Main Chat Area - Takes remaining space */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Error Banner */}
          {error && (
            <div className="flex-shrink-0 mx-4 md:mx-8 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between">
              <span className="text-red-600 dark:text-red-400">{error}</span>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {!hasMessages ? (
            /* Welcome Screen - Scrollable if needed */
            <div className="flex-1 overflow-y-auto px-4 md:px-8">
              <div className="flex flex-col items-center justify-center min-h-full max-w-4xl mx-auto w-full py-8">
                {/* AI Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white/80" />
                  </div>
                </div>

                {/* Greeting */}
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-text-primary-dark text-center mb-2">
                  {getGreeting()}, {userName}
                </h1>
                <p className="text-2xl md:text-3xl text-text-secondary dark:text-text-secondary-dark mb-8">
                  What's on{" "}
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">
                    your mind?
                  </span>
                </p>

                {/* Input Area */}
                <div className="w-full max-w-2xl mb-8">
                  <ChatInput
                    onSend={handleSendMessage}
                    disabled={
                      isAiResponding || connectionStatus !== "connected"
                    }
                  />
                </div>

                {/* Suggestions */}
                <div className="w-full">
                  <div className="mb-4">
                    <span className="text-text-secondary dark:text-text-secondary-dark text-sm uppercase tracking-wide">
                      Get started with an example below
                    </span>
                  </div>
                  <SuggestionCards
                    suggestions={SUGGESTIONS}
                    onSelect={handleSuggestionSelect}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Chat View - Messages scrollable, input sticky */
            <div className="flex-1 flex flex-col min-h-0 w-full relative">
              {/* Scroll Indicator */}
              <ScrollIndicator
                messages={messages}
                containerRef={messagesContainerRef}
                messageRefs={messageRefsMap.current}
              />

              {/* Messages Container - Scrollable */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto py-4 space-y-2 scroll-smooth px-4 md:px-6 hide-scrollbar"
              >
                <div className="max-w-4xl mx-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      ref={(el) => registerMessageRef(message.id, el)}
                    >
                      <ChatMessage message={message} />
                    </div>
                  ))}
                  {isAiResponding &&
                    messages[messages.length - 1]?.role === "user" && (
                      <TypingIndicator />
                    )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area - Sticky at bottom, centered with fixed width */}
              <div className="flex-shrink-0 py-4 px-4 md:px-6 bg-bg-opaque dark:bg-bg-opaque-dark">
                <div className="max-w-2xl mx-auto">
                  <ChatInput
                    onSend={handleSendMessage}
                    disabled={
                      isAiResponding || connectionStatus !== "connected"
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* API Key Settings Modal */}
      <ApiKeySettings
        isOpen={showApiKeySettings}
        onClose={() => setShowApiKeySettings(false)}
        onSave={(key) => setHasApiKey(!!key)}
      />
    </div>
  );
}

export default App;
