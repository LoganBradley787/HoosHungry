import { useState, useEffect, useCallback, useRef } from "react";
import { planAPI, type DailyPlanResponse, type MealItem, type DayMeals } from "../api/planEndpoints";
import { toLocalDateString } from "../utils/dateUtils";

function recalcTotals(meals: DayMeals): Pick<DailyPlanResponse, "total_calories" | "total_protein" | "total_carbs" | "total_fat"> {
  const all = [...meals.breakfast, ...meals.lunch, ...meals.dinner, ...meals.snack];
  return {
    total_calories: all.reduce((s, i) => s + i.total_calories, 0),
    total_protein: all.reduce((s, i) => s + i.total_protein, 0),
    total_carbs: all.reduce((s, i) => s + i.total_carbs, 0),
    total_fat: all.reduce((s, i) => s + i.total_fat, 0),
  };
}

export function useDailyPlan(selectedDate: Date) {
  const [data, setData] = useState<DailyPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Map<string, DailyPlanResponse>>(new Map());

  const fetchDailyPlan = useCallback(async () => {
    const dateStr = toLocalDateString(selectedDate);
    const cached = cache.current.get(dateStr);

    if (cached) {
      // Show stale data immediately — no loading flash — then refresh in background
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      setError(null);
      const dailyData = await planAPI.getDailyPlan(dateStr);
      cache.current.set(dateStr, dailyData);
      setData(dailyData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch daily plan");
      console.error("Error fetching daily plan:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDailyPlan();
  }, [fetchDailyPlan]);

  // Patch a single item in local state after a successful update — no re-fetch needed.
  const updateItem = useCallback((updated: MealItem) => {
    setData((prev) => {
      if (!prev) return prev;
      const meals: DayMeals = {
        breakfast: prev.meals.breakfast.map((i) => (i.id === updated.id ? updated : i)),
        lunch: prev.meals.lunch.map((i) => (i.id === updated.id ? updated : i)),
        dinner: prev.meals.dinner.map((i) => (i.id === updated.id ? updated : i)),
        snack: prev.meals.snack.map((i) => (i.id === updated.id ? updated : i)),
      };
      const next: DailyPlanResponse = { ...prev, meals, ...recalcTotals(meals) };
      cache.current.set(prev.date, next);
      return next;
    });
  }, []);

  // Remove an item from local state after a successful delete — no re-fetch needed.
  const deleteItem = useCallback((id: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const meals: DayMeals = {
        breakfast: prev.meals.breakfast.filter((i) => i.id !== id),
        lunch: prev.meals.lunch.filter((i) => i.id !== id),
        dinner: prev.meals.dinner.filter((i) => i.id !== id),
        snack: prev.meals.snack.filter((i) => i.id !== id),
      };
      const next: DailyPlanResponse = { ...prev, meals, ...recalcTotals(meals) };
      cache.current.set(prev.date, next);
      return next;
    });
  }, []);

  return { data, loading, error, refresh: fetchDailyPlan, refetch: fetchDailyPlan, updateItem, deleteItem };
}
