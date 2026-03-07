import { useState, useEffect, useCallback } from "react";
import { ratingsAPI, type RatingResult, type RatingsMap } from "../api/ratingEndpoints";
import { useAuth } from "../contexts/AuthContext";

const EMPTY_RATING: RatingResult = { upvotes: 0, downvotes: 0, user_vote: null };

/**
 * Fetches all ratings for a dining hall once. Exposes per-item read access
 * and optimistic vote/remove mutations.
 *
 * Usage in Menu.tsx:
 *   const { getRating, submitVote, removeVote } = useRatings(hall);
 */
export function useRatings(dining_hall: "ohill" | "newcomb" | "runk") {
  const { token } = useAuth();
  const [ratings, setRatings] = useState<RatingsMap>({});

  // Re-fetch whenever hall changes or user logs in/out
  useEffect(() => {
    if (!token) { setRatings({}); return; }
    ratingsAPI.getRatings(dining_hall)
      .then(setRatings)
      .catch(() => {}); // non-critical — cards just show no ratings
  }, [token, dining_hall]);

  /** Read the aggregate for a single item (returns zeros if unrated). */
  const getRating = useCallback(
    (item_name: string): RatingResult => ratings[item_name] ?? EMPTY_RATING,
    [ratings]
  );

  /**
   * Submit or change a vote. Optimistic update: UI updates immediately,
   * reverts to previous state if the request fails.
   */
  const submitVote = useCallback(
    async (item_name: string, is_upvote: boolean) => {
      const snapshot = ratings[item_name] ?? EMPTY_RATING;
      const wasUp = snapshot.user_vote === "up";
      const wasDown = snapshot.user_vote === "down";

      // Optimistic: adjust counts immediately
      setRatings((prev) => ({
        ...prev,
        [item_name]: {
          upvotes: snapshot.upvotes + (is_upvote ? 1 : 0) - (wasUp ? 1 : 0),
          downvotes: snapshot.downvotes + (!is_upvote ? 1 : 0) - (wasDown ? 1 : 0),
          user_vote: is_upvote ? "up" : "down",
        },
      }));

      try {
        const updated = await ratingsAPI.submitVote(item_name, dining_hall, is_upvote);
        setRatings((prev) => ({ ...prev, [item_name]: updated }));
      } catch {
        setRatings((prev) => ({ ...prev, [item_name]: snapshot }));
      }
    },
    [ratings, dining_hall]
  );

  /**
   * Remove the user's vote. Optimistic update with revert on failure.
   */
  const removeVote = useCallback(
    async (item_name: string) => {
      const snapshot = ratings[item_name] ?? EMPTY_RATING;

      setRatings((prev) => ({
        ...prev,
        [item_name]: {
          upvotes: snapshot.upvotes - (snapshot.user_vote === "up" ? 1 : 0),
          downvotes: snapshot.downvotes - (snapshot.user_vote === "down" ? 1 : 0),
          user_vote: null,
        },
      }));

      try {
        const updated = await ratingsAPI.removeVote(item_name, dining_hall);
        setRatings((prev) => ({ ...prev, [item_name]: updated }));
      } catch {
        setRatings((prev) => ({ ...prev, [item_name]: snapshot }));
      }
    },
    [ratings, dining_hall]
  );

  return { getRating, submitVote, removeVote };
}
