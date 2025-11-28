import { useState, useEffect, useCallback, useRef } from "react";
import {
  Message,
  WebSocketMessage,
  ConnectionStatus,
  ChatSession,
} from "../types";

const WS_URL = "ws://localhost:8080";
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const STORAGE_KEY = "chat_sessions";
const CURRENT_SESSION_KEY = "current_session_id";
const API_KEY_STORAGE = "gemini_api_key";

// Helper to get API key
const getApiKey = (): string => {
  return (localStorage.getItem(API_KEY_STORAGE) || "").trim();
};

// Helper to load sessions from localStorage
const loadSessions = (): ChatSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const sessions = JSON.parse(stored);
      return sessions.map((s: ChatSession) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }));
    }
  } catch (e) {
    console.error("Failed to load sessions:", e);
  }
  return [];
};

// Helper to save sessions to localStorage
const saveSessions = (sessions: ChatSession[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Failed to save sessions:", e);
  }
};

// Helper to get current session ID
const getCurrentSessionId = (): string | null => {
  return localStorage.getItem(CURRENT_SESSION_KEY);
};

// Helper to set current session ID
const setCurrentSessionId = (id: string | null) => {
  if (id) {
    localStorage.setItem(CURRENT_SESSION_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
};

export function useWebSocket() {
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(
    getCurrentSessionId
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const currentMessageIdRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus("connecting");
    setError(null);

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("connected");
        setError(null); // Clear any previous errors on successful connection
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          handleMessage(data);
        } catch (err) {
          console.error("Failed to parse message:", err);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnectionStatus("disconnected");
        setIsAiResponding(false);
        attemptReconnect();
      };

      ws.onerror = () => {
        console.error("WebSocket error");
        // Only set error if we're not already connected
        // The onclose event will handle reconnection
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          setConnectionStatus("error");
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setConnectionStatus("error");
      setError("Failed to connect to server");
    }
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setError("Failed to reconnect. Please check if the server is running.");
      setConnectionStatus("error");
      return;
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      console.log(
        `Reconnection attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`
      );
      connect();
    }, RECONNECT_DELAY);
  }, [connect]);

  const handleMessage = useCallback((data: WebSocketMessage) => {
    switch (data.type) {
      case "connected":
        console.log("Session established:", data.sessionId);
        break;

      case "message_received":
        currentMessageIdRef.current = data.messageId || null;
        break;

      case "stream_start":
        setIsAiResponding(true);
        // Add empty AI message that will be filled with streaming content
        const newAiMessage: Message = {
          id: data.messageId || Date.now().toString(),
          content: "",
          role: "ai",
          timestamp: new Date(),
          isStreaming: true,
        };
        setMessages((prev) => [...prev, newAiMessage]);
        break;

      case "stream_chunk":
        // Append chunk to the current AI message
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (
            lastMessage &&
            lastMessage.role === "ai" &&
            lastMessage.isStreaming
          ) {
            lastMessage.content += data.content || "";
          }
          return updated;
        });
        break;

      case "stream_end":
        setIsAiResponding(false);
        // Mark message as complete
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage && lastMessage.role === "ai") {
            lastMessage.isStreaming = false;
            lastMessage.content = data.fullContent || lastMessage.content;
          }
          return updated;
        });
        currentMessageIdRef.current = null;
        break;

      case "error":
        setIsAiResponding(false);
        setError(data.error || "An error occurred");
        // Remove the streaming message if there was an error
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.isStreaming) {
            return prev.slice(0, -1);
          }
          return prev;
        });
        break;
    }
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setError("Not connected to server");
        return;
      }

      if (isAiResponding) {
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send to server with API key
      const apiKey = getApiKey();
      wsRef.current.send(
        JSON.stringify({
          type: "chat",
          content,
          ...(apiKey && { apiKey }),
        })
      );

      setError(null);
    },
    [isAiResponding]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Start a new chat session
  const startNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions((prev) => {
      const updated = [newSession, ...prev];
      saveSessions(updated);
      return updated;
    });
    setCurrentSessionIdState(newSession.id);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  }, []);

  // Switch to a different chat session
  const switchSession = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setCurrentSessionIdState(sessionId);
        setCurrentSessionId(sessionId);
        setMessages(session.messages);
      }
    },
    [sessions]
  );

  // Delete a chat session
  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== sessionId);
        saveSessions(updated);
        return updated;
      });

      // If deleting current session, clear messages and switch to another or none
      if (sessionId === currentSessionId) {
        const remainingSessions = sessions.filter((s) => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSessionIdState(remainingSessions[0].id);
          setCurrentSessionId(remainingSessions[0].id);
          setMessages(remainingSessions[0].messages);
        } else {
          setCurrentSessionIdState(null);
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    },
    [sessions, currentSessionId]
  );

  // Clear messages in current session
  const clearCurrentChat = useCallback(() => {
    if (currentSessionId) {
      setMessages([]);
      setSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              title: "Cleared Chat",
              messages: [],
              updatedAt: new Date(),
            };
          }
          return s;
        });
        saveSessions(updated);
        return updated;
      });
    }
  }, [currentSessionId]);

  // Update current session when messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id === currentSessionId) {
            const title = messages[0]?.content.slice(0, 30) || "New Chat";
            return {
              ...s,
              title: title + (title.length >= 30 ? "..." : ""),
              messages,
              updatedAt: new Date(),
            };
          }
          return s;
        });
        saveSessions(updated);
        return updated;
      });
    }
  }, [messages, currentSessionId]);

  // Load current session on mount
  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find((s) => s.id === currentSessionId);
      if (session) {
        setMessages(session.messages);
      }
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
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
    reconnect: connect,
  };
}
