// ratingEndpoints.ts — mirrors favoritesEndpoints.ts pattern

const ACCOUNTS_BASE = `${import.meta.env.VITE_API_BASE}/accounts`;

function authHeaders(extra: Record<string, string> = {}) {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...extra,
  };
}

export interface RatingResult {
  upvotes: number;
  downvotes: number;
  user_vote: "up" | "down" | null;
}

/** Map of item_name → RatingResult for all rated items at a given hall */
export type RatingsMap = Record<string, RatingResult>;

export const ratingsAPI = {
  /** Fetch all ratings for a dining hall in one request. Items with no votes are absent from the map. */
  getRatings: async (dining_hall: string): Promise<RatingsMap> => {
    const res = await fetch(
      `${ACCOUNTS_BASE}/ratings/?dining_hall=${encodeURIComponent(dining_hall)}`,
      { headers: authHeaders() }
    );
    if (!res.ok) throw new Error("Failed to fetch ratings");
    return (await res.json()).ratings as RatingsMap;
  },

  /** Upsert a vote. Handles vote changes (up → down) automatically via update_or_create. */
  submitVote: async (
    item_name: string,
    dining_hall: string,
    is_upvote: boolean
  ): Promise<RatingResult> => {
    const res = await fetch(`${ACCOUNTS_BASE}/ratings/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ item_name, dining_hall, is_upvote }),
    });
    if (!res.ok) throw new Error("Failed to submit vote");
    return res.json();
  },

  /** Remove the current user's vote for an item at a hall. */
  removeVote: async (
    item_name: string,
    dining_hall: string
  ): Promise<RatingResult> => {
    const res = await fetch(`${ACCOUNTS_BASE}/ratings/`, {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ item_name, dining_hall }),
    });
    if (!res.ok) throw new Error("Failed to remove vote");
    return res.json();
  },
};
