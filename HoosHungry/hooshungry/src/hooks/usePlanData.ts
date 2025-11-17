import { useState, useEffect } from "react";
import { planAPI, type WeekPlanResponse } from "../api/planEndpoints";

export function useWeekPlan(selectedDate: Date) {
  const [data, setData] = useState<WeekPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeekPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        const dateStr = selectedDate.toISOString().split("T")[0];
        const weekData = await planAPI.getWeekPlan(dateStr);
        setData(weekData);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch week plan");
        console.error("Error fetching week plan:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekPlan();
  }, [selectedDate]);

  return { data, loading, error };
}
