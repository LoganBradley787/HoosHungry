const ACCOUNTS_BASE = `${import.meta.env.VITE_API_BASE}/accounts`;

export interface UserProfile {
  remaining_ai_usages: number;
  premium_member: boolean;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  default_calorie_goal: number | null;
  default_protein_goal: number | null;
  default_carbs_goal: number | null;
  default_fat_goal: number | null;
  default_fiber_goal: number | null;
  default_sodium_goal: number | null;
  goal_type: "maintain" | "lose" | "gain";
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
}

export interface SuggestedGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export interface UpdateProfileRequest {
  is_vegan?: boolean;
  is_vegetarian?: boolean;
  is_gluten_free?: boolean;
  default_calorie_goal?: number | null;
  default_protein_goal?: number | null;
  default_carbs_goal?: number | null;
  default_fat_goal?: number | null;
  default_fiber_goal?: number | null;
  default_sodium_goal?: number | null;
  goal_type?: "maintain" | "lose" | "gain";
  activity_level?: "sedentary" | "light" | "moderate" | "active" | "very_active";
}

export const accountAPI = {
  getProfile: async (): Promise<UserProfile> => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${ACCOUNTS_BASE}/profile/`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

  suggestGoals: async (): Promise<SuggestedGoals> => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${ACCOUNTS_BASE}/profile/goals/suggest/`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch suggested goals");
    return response.json();
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${ACCOUNTS_BASE}/profile/update/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update profile");
    return response.json();
  },
};
