export interface Message {
  id: string;
  content: string;
  role: "user" | "ai";
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WebSocketMessage {
  type:
    | "connected"
    | "message_received"
    | "stream_start"
    | "stream_chunk"
    | "stream_end"
    | "error";
  sessionId?: string;
  messageId?: string;
  content?: string;
  fullContent?: string;
  error?: string;
}

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";
