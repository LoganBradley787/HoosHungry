import { useEffect, useState } from "react";
import { menuAPI } from "../api/endpoints";

export interface UseAvailablePeriodsResult {
  periods: { key: string; name: string }[];
  loading: boolean;
  error: string | null;
}

export function useAvailablePeriods(
  hall: "ohill" | "newcomb" | "runk"
): UseAvailablePeriodsResult {
  const [periods, setPeriods] = useState<{ key: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    menuAPI
      .getAvailablePeriods(hall)
      .then((res) => {
        setPeriods(res.periods);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to load available periods");
        setPeriods([]);
      })
      .finally(() => setLoading(false));
  }, [hall]);

  return { periods, loading, error };
}
