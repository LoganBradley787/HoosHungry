import { useState, useEffect, useCallback } from "react";
import { favoritesAPI } from "../api/favoritesEndpoints";
import { useAuth } from "../contexts/AuthContext";

export function useFavorites() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token) { setFavorites(new Set()); return; }
    favoritesAPI.getFavorites()
      .then(names => setFavorites(new Set(names)))
      .catch(() => {}); // silently ignore — favorites are non-critical
  }, [token]);

  const toggleFavorite = useCallback(async (item_name: string) => {
    const isFav = favorites.has(item_name);
    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      isFav ? next.delete(item_name) : next.add(item_name);
      return next;
    });
    try {
      const updated = isFav
        ? await favoritesAPI.removeFavorite(item_name)
        : await favoritesAPI.addFavorite(item_name);
      setFavorites(new Set(updated));
    } catch {
      // Revert on error
      setFavorites(prev => {
        const next = new Set(prev);
        isFav ? next.add(item_name) : next.delete(item_name);
        return next;
      });
    }
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite: (name: string) => favorites.has(name) };
}
