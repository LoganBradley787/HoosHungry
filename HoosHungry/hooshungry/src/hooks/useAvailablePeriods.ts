import { useEffect, useState } from "react";
import { menuAPI } from "../api/endpoints";

export interface UseAvailablePeriodsResult {
  periods: { key: string; name: string }[];
  loading: boolean;
  error: string | null;
  currentHall: string | null;
}

export function useAvailablePeriods(
  hall: "ohill" | "newcomb" | "runk"
): UseAvailablePeriodsResult {
  const [periods, setPeriods] = useState<{ key: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentHall, setCurrentHall] = useState<string | null>(null); // ADD THIS

  useEffect(() => {
    setLoading(true);
    setCurrentHall(null); // Clear current hall when fetching
    menuAPI
      .getAvailablePeriods(hall)
      .then((res) => {
        setPeriods(res.periods);
        setCurrentHall(hall); // Set current hall after success
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to load available periods");
        setPeriods([]);
        setCurrentHall(null);
      })
      .finally(() => setLoading(false));
  }, [hall]);

  return { periods, loading, error, currentHall }; // Return currentHall
}
