import { Moon, Sun } from "./icons.jsx";
import { useTheme } from "../hooks/useTheme.js";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Toggle dark mode">
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
