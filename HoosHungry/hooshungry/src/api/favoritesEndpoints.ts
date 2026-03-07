const ACCOUNTS_BASE = `${import.meta.env.VITE_API_BASE}/accounts`;

function authHeaders(extra: Record<string, string> = {}) {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...extra,
  };
}

export const favoritesAPI = {
  getFavorites: async (): Promise<string[]> => {
    const res = await fetch(`${ACCOUNTS_BASE}/favorites/`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch favorites");
    return (await res.json()).favorites;
  },
  addFavorite: async (item_name: string): Promise<string[]> => {
    const res = await fetch(`${ACCOUNTS_BASE}/favorites/add/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ item_name }),
    });
    if (!res.ok) throw new Error("Failed to add favorite");
    return (await res.json()).favorites;
  },
  removeFavorite: async (item_name: string): Promise<string[]> => {
    const res = await fetch(`${ACCOUNTS_BASE}/favorites/remove/`, {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ item_name }),
    });
    if (!res.ok) throw new Error("Failed to remove favorite");
    return (await res.json()).favorites;
  },
};
