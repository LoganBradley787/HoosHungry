import { useState, useEffect, useCallback, useRef } from "react";
import { planAPI, type WeekPlanResponse } from "../api/planEndpoints";
import { toLocalDateString } from "../utils/dateUtils";

export function useWeekPlan(selectedDate: Date) {
  const [data, setData] = useState<WeekPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Map<string, WeekPlanResponse>>(new Map());

  const fetchWeekPlan = useCallback(async () => {
    const dateStr = toLocalDateString(selectedDate);
    const cached = cache.current.get(dateStr);

    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      setError(null);
      const weekData = await planAPI.getWeekPlan(dateStr);
      cache.current.set(dateStr, weekData);
      setData(weekData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch week plan");
      console.error("Error fetching week plan:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchWeekPlan();
  }, [fetchWeekPlan]);

  return { data, loading, error, refetch: fetchWeekPlan };
}
