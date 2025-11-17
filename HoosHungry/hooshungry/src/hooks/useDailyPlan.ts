import { useState, useEffect, useCallback } from "react";
import { planAPI, type DailyPlanResponse } from "../api/planEndpoints";

export function useDailyPlan(selectedDate: Date) {
  const [data, setData] = useState<DailyPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const dailyData = await planAPI.getDailyPlan(dateStr);
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

  // Return refresh function to refetch after adding/removing items
  return { data, loading, error, refresh: fetchDailyPlan };
}
