import { useState, useEffect } from "react";
import { menuAPI } from "../api/endpoints";
import type { MenuInfoResponse, MenuInfoParams } from "../api/endpoints";

export function useMenuData(params: MenuInfoParams & { skip?: boolean }) {
  const [data, setData] = useState<MenuInfoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset error state when params change
    setError(null);

    // Early return if skip is true
    if (params.skip) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      try {
        setLoading(true);
        const menuData = await menuAPI.getMenuInfo(params);
        setData(menuData);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch menu data");
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [params.period, params.hall, params.skip]);

  return { data, loading, error };
}
