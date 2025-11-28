import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const defaultApiKey = process.env.GEMINI_API_KEY || "";

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export function createModel(apiKey?: string) {
  const key = apiKey || defaultApiKey;
  if (!key) {
    throw new Error("No API key provided");
  }
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });
}

export async function* streamChat(
  messages: ChatMessage[],
  userMessage: string,
  apiKey?: string
): AsyncGenerator<string> {
  const model = createModel(apiKey);
  const chat = model.startChat({
    history: messages,
  });

  const result = await chat.sendMessageStream(userMessage);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}
