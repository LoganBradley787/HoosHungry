import apiClient from "./client";

// Types for chat messages
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
  context?: {
    current_plan_date?: string;
    dietary_goals?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
    };
  };
}

export interface ChatResponse {
  message: string;
  suggestions?: MealSuggestion[];
}

// Placeholder API functions - replace with actual backend calls
export const promptAPI = {
  /**
   * Send a message to the AI and get a response
   * TODO: Connect to actual backend endpoint
   */
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    // Placeholder: Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Placeholder response - replace with actual API call:
    // const response = await apiClient.post("/prompt/chat/", request);
    // return response.data;

    return {
      message: generatePlaceholderResponse(request.message),
      suggestions: generatePlaceholderSuggestions(request.message),
    };
  },

  /**
   * Get conversation history
   * TODO: Connect to actual backend endpoint
   */
  getHistory: async (): Promise<ChatMessage[]> => {
    // Placeholder: Return empty history
    // const response = await apiClient.get("/prompt/history/");
    // return response.data;
    return [];
  },

  /**
   * Clear conversation history
   * TODO: Connect to actual backend endpoint
   */
  clearHistory: async (): Promise<void> => {
    // Placeholder
    // await apiClient.delete("/prompt/history/");
  },

  /**
   * Apply a meal suggestion to the plan
   * TODO: Connect to actual backend endpoint
   */
  applySuggestion: async (suggestion: MealSuggestion): Promise<void> => {
    // Placeholder: Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // const response = await apiClient.post("/prompt/apply-suggestion/", suggestion);
    // return response.data;
  },
};

// Helper functions for placeholder responses
function generatePlaceholderResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("protein")) {
    return "Based on your protein goals, I'd recommend adding some grilled chicken from The Hearth at OHill. It's a great lean protein source with about 35g per serving. Would you like me to add it to your lunch?";
  }

  if (lowerMessage.includes("low calorie") || lowerMessage.includes("diet")) {
    return "For a lower calorie option, the salad bar at Newcomb has some great choices. The mixed greens with grilled vegetables is around 150 calories and very filling. I can also suggest swapping out any fried items for grilled alternatives.";
  }

  if (lowerMessage.includes("breakfast")) {
    return "For breakfast, I'd suggest the egg white omelet from Runk - it's high in protein and low in calories. Pair it with some fresh fruit for a balanced start to your day!";
  }

  if (lowerMessage.includes("vegetarian") || lowerMessage.includes("vegan")) {
    return "There are great plant-based options available! The Beyond Burger at OHill is excellent, and Newcomb has a dedicated vegetarian station with rotating options. Would you like me to filter for vegetarian items?";
  }

  return "I can help you optimize your meal plan! Tell me about your dietary goals - are you looking to increase protein, reduce calories, or accommodate any dietary restrictions? I can also suggest specific items from today's dining hall menus.";
}

function generatePlaceholderSuggestions(message: string): MealSuggestion[] {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("protein")) {
    return [
      {
        id: 101,
        item_name: "Grilled Chicken Breast",
        dining_hall: "OHill",
        station: "The Hearth",
        calories: 280,
        protein: 35,
        action: "add",
        reason: "High protein, lean option",
      },
      {
        id: 102,
        item_name: "Greek Yogurt Parfait",
        dining_hall: "Newcomb",
        station: "Fresh Focus",
        calories: 180,
        protein: 15,
        action: "add",
        reason: "Good protein snack",
      },
    ];
  }

  if (lowerMessage.includes("low calorie")) {
    return [
      {
        id: 201,
        item_name: "Garden Salad",
        dining_hall: "Newcomb",
        station: "Salad Bar",
        calories: 120,
        protein: 4,
        action: "add",
        reason: "Low calorie, nutrient dense",
      },
    ];
  }

  return [];
}

export default promptAPI;
