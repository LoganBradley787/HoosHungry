import apiClient from "./client";

// Types
export interface MealItem {
  id: number;
  menu_item_id: number;
  menu_item_name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number | null;
  carbs_per_serving: number | null;
  fat_per_serving: number | null;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  dining_hall: string;
  station_name: string;
  added_at: string;
}

export interface DayMeals {
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  snack: MealItem[];
}

export interface DailySummary {
  date: string;
  has_meals: boolean;
  total_calories: number;
  meal_count: number;
  breakfast_count: number;
  lunch_count: number;
  dinner_count: number;
}

export interface WeekPlanResponse {
  plan_id: number;
  week_start_date: string;
  daily_calorie_goal: number | null;
  daily_protein_goal: number | null;
  daily_carbs_goal: number | null;
  daily_fat_goal: number | null;
  week_summary: DailySummary[];
}

export interface DailyPlanResponse {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meals: DayMeals;
  goals: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  };
}

export interface AddMealItemRequest {
  date: string; // YYYY-MM-DD
  menu_item_id: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  servings?: number;
}

export interface UpdateGoalsRequest {
  daily_calorie_goal?: number;
  daily_protein_goal?: number;
  daily_carbs_goal?: number;
  daily_fat_goal?: number;
}

export const planAPI = {
  // Get weekly plan summary
  getWeekPlan: async (date: string): Promise<WeekPlanResponse> => {
    const response = await apiClient.get("/plan/week/", {
      params: { date },
    });
    return response.data;
  },

  // Get detailed daily plan
  getDailyPlan: async (date: string): Promise<DailyPlanResponse> => {
    const response = await apiClient.get("/plan/daily/", {
      params: { date },
    });
    return response.data;
  },

  // Add menu item to plan
  addMealItem: async (data: AddMealItemRequest): Promise<MealItem> => {
    const response = await apiClient.post("/plan/add-item/", data);
    return response.data;
  },

  // Update servings for a meal item
  updateMealItem: async (
    itemId: number,
    servings: number
  ): Promise<MealItem> => {
    const response = await apiClient.patch(`/plan/item/${itemId}/`, {
      servings,
    });
    return response.data;
  },

  // Delete meal item
  deleteMealItem: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/plan/item/${itemId}/delete/`);
  },

  // Update nutritional goals
  updateGoals: async (
    date: string,
    goals: UpdateGoalsRequest
  ): Promise<WeekPlanResponse> => {
    const response = await apiClient.patch("/plan/goals/", goals, {
      params: { date },
    });
    return response.data;
  },
};
