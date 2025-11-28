import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { streamChat, ChatMessage } from "./gemini.js";

dotenv.config();

const PORT = parseInt(process.env.PORT || "8080");

const wss = new WebSocketServer({ port: PORT });

interface ClientSession {
  id: string;
  ws: WebSocket;
  history: ChatMessage[];
  apiKey?: string;
}

const sessions = new Map<WebSocket, ClientSession>();

console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket) => {
  const sessionId = uuidv4();
  const session: ClientSession = {
    id: sessionId,
    ws,
    history: [],
  };
  sessions.set(ws, session);

  console.log(`✅ Client connected: ${sessionId}`);

  // Send connection success
  ws.send(
    JSON.stringify({
      type: "connected",
      sessionId,
    })
  );

  ws.on("message", async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());

      // Handle API key setting
      if (message.type === "set_api_key") {
        session.apiKey = message.apiKey;
        console.log(`🔑 API key set for session ${sessionId}`);
        ws.send(
          JSON.stringify({
            type: "api_key_set",
            success: true,
          })
        );
        return;
      }

      if (message.type === "chat") {
        const userMessage = message.content;
        const messageId = uuidv4();
        // Use API key from message, session, or fall back to env
        const apiKey = (message.apiKey || session.apiKey || "").trim();

        console.log(`📩 Message from ${sessionId}: ${userMessage}`);
        console.log(
          `🔑 API key received: ${
            apiKey ? "Yes (length: " + apiKey.length + ")" : "No"
          }`
        );

        // Send acknowledgment
        ws.send(
          JSON.stringify({
            type: "message_received",
            messageId,
          })
        );

        // Start streaming response
        ws.send(
          JSON.stringify({
            type: "stream_start",
            messageId,
          })
        );

        let fullResponse = "";

        try {
          for await (const chunk of streamChat(
            session.history,
            userMessage,
            apiKey
          )) {
            fullResponse += chunk;

            ws.send(
              JSON.stringify({
                type: "stream_chunk",
                messageId,
                content: chunk,
              })
            );
          }

          // Update history
          session.history.push({
            role: "user",
            parts: [{ text: userMessage }],
          });
          session.history.push({
            role: "model",
            parts: [{ text: fullResponse }],
          });

          // Send stream complete
          ws.send(
            JSON.stringify({
              type: "stream_end",
              messageId,
              fullContent: fullResponse,
            })
          );

          console.log(`✅ Response complete for ${sessionId}`);
        } catch (error) {
          console.error("Streaming error:", error);
          ws.send(
            JSON.stringify({
              type: "error",
              messageId,
              error: "Failed to generate response. Please check your API key.",
            })
          );
        }
      }
    } catch (error) {
      console.error("Message parsing error:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          error: "Invalid message format",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log(`❌ Client disconnected: ${sessionId}`);
    sessions.delete(ws);
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for ${sessionId}:`, error);
    sessions.delete(ws);
  });
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  wss.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
