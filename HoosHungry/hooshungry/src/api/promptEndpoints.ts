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
    return response.data;
  },

  getHistory: async (): Promise<ChatMessage[]> => {
    const response = await apiClient.get("/prompt/history/");
    return response.data.map((msg: {
      id: number;
      role: "user" | "assistant";
      content: string;
      timestamp: string;
      suggestions: MealSuggestion[] | null;
    }) => ({
      id: String(msg.id),
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      suggestions: msg.suggestions ?? undefined,
    }));
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
