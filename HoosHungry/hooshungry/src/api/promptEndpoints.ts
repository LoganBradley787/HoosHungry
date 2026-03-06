import apiClient from "./client";
import { toLocalDateString } from "../utils/dateUtils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: MealSuggestion[];
}

export interface MealSuggestion {
  id: number;
  item_name: string;
  dining_hall: string;
  station: string;
  calories: number;
  protein: number;
  action: "add" | "remove" | "swap";
  reason: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: MealSuggestion[];
}

/**
 * If the message text looks like raw JSON (e.g. backend failed to parse a
 * truncated LLM response), extract the "message" and "suggestions" fields.
 */
function tryExtractFromJson(
  content: string,
  existingSuggestions?: MealSuggestion[]
): { message: string; suggestions?: MealSuggestion[] } {
  // Quick check — only attempt if content looks like JSON or a code-fenced block
  const trimmed = content.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("```")) {
    return { message: content, suggestions: existingSuggestions };
  }

  // Strip markdown code fences
  let text = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    const data = JSON.parse(text);
    if (data.message) {
      return { message: data.message, suggestions: data.suggestions ?? existingSuggestions };
    }
  } catch {
    // JSON may be truncated — try to extract the "message" value with a regex
    const msgMatch = text.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (msgMatch) {
      const extracted = msgMatch[1]
        .replace(/\\"/g, '"')
        .replace(/\\n/g, "\n");
      return { message: extracted, suggestions: existingSuggestions };
    }
  }

  return { message: content, suggestions: existingSuggestions };
}

/** Infer meal type from the current time of day. */
function inferMealType(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 20) return "dinner";
  return "snack";
}

export const promptAPI = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await apiClient.post("/prompt/chat/", request);
    const data = response.data as ChatResponse;
    // Defensively parse in case the backend returned raw JSON as the message
    const { message, suggestions } = tryExtractFromJson(data.message, data.suggestions);
    return { message, suggestions };
  },

  getHistory: async (): Promise<ChatMessage[]> => {
    const response = await apiClient.get("/prompt/history/");
    return response.data.map((msg: {
      id: number;
      role: "user" | "assistant";
      content: string;
      timestamp: string;
      suggestions: MealSuggestion[] | null;
    }) => {
      const { message, suggestions } = tryExtractFromJson(
        msg.content,
        msg.suggestions ?? undefined
      );
      return {
        id: String(msg.id),
        role: msg.role,
        content: message,
        timestamp: new Date(msg.timestamp),
        suggestions,
      };
    });
  },

  clearHistory: async (): Promise<void> => {
    await apiClient.delete("/prompt/history/");
  },

  applySuggestion: async (suggestion: MealSuggestion): Promise<void> => {
    const today = toLocalDateString(new Date());
    await apiClient.post("/plan/add-item/", {
      date: today,
      menu_item_id: suggestion.id,
      meal_type: inferMealType(),
      servings: 1,
    });
  },
};

export default promptAPI;
