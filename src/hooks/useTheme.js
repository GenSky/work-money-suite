import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage.js";

export function useTheme() {
  const [theme, setTheme] = useLocalStorage("wms-theme", "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return { theme, setTheme, toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark") };
}
