import { useState, useEffect } from "react";
import { planAPI, type HistoryEntry } from "../api/planEndpoints";

export function useCalorieTrend(days: number) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    planAPI
      .getHistory(days)
      .then(data => setHistory(data.history))
      .catch(err => console.error("Failed to fetch calorie history:", err))
      .finally(() => setLoading(false));
  }, [days]);

  return { history, loading };
}
