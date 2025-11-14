import { useState, useEffect } from "react";
import { menuAPI } from "../api/endpoints";
import type { MenuInfoResponse, MenuInfoParams } from "../api/endpoints";

export function useMenuData(params: MenuInfoParams) {
  const [data, setData] = useState<MenuInfoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
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
  }, [params.period, params.hall]);

  return { data, loading, error };
}
