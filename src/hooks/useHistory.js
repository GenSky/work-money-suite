import { useLocalStorage } from "./useLocalStorage.js";

export function useHistory() {
  const [history, setHistory] = useLocalStorage("wms-history", []);

  function addHistory(entry) {
    setHistory((current) => [{ ...entry, createdAt: Date.now() }, ...current].slice(0, 20));
  }

  function clearHistory() {
    setHistory([]);
  }

  return { history, addHistory, clearHistory };
}
