import { useLocalStorage } from "./useLocalStorage.js";

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage("wms-favorites", []);

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id],
    );
  }

  return { favorites, toggleFavorite };
}
