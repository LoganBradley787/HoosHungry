import apiClient from "./client";

export interface MenuInfoParams {
  period: "breakfast" | "lunch" | "dinner" | "late_night";
  hall: "ohill" | "newcomb" | "runk";
}

export interface NutritionInfo {
  calories: string | null;
  protein: string | null;
  total_carbohydrates: string | null;
  cholesterol: string | null;
  total_fat: string | null;
  trans_fat: string | null;
  saturated_fat: string | null;
  total_sugars: string | null;
  dietary_fiber: string | null;
  sodium: string | null;
  serving_size: string | null;
}

export interface Allergen {
  name: string;
}

export interface MenuItem {
  id: number;
  item_name: string;
  item_description: string | null;
  ingredients: string | null;
  item_category: string | null;
  is_gluten: boolean;
  is_vegan: boolean;
  is_vegetarian: boolean;
  allergens: Allergen[];
  nutrition_info: NutritionInfo | null;
}

export interface Station {
  id: number;
  name: string;
  number: string;
  menu_items: MenuItem[];
}

export interface Period {
  id: number;
  name: string;
  vendor_id: string;
  start_time: string;
  end_time: string;
  stations: Station[];
}

export interface MenuInfoResponse {
  dining_hall: string;
  date: string;
  day_name: string;
  hall_hours: {
    open_time: string;
    close_time: string;
  };
  period: Period;
}

export const menuAPI = {
  getMenuInfo: async (params: MenuInfoParams): Promise<MenuInfoResponse> => {
    const response = await apiClient.get("/menu_info/", { params });
    return response.data;
  },
};
