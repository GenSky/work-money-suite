import CalculatorCard from "../components/CalculatorCard.jsx";
import { InputField } from "../components/InputField.jsx";
import Modal from "../components/Modal.jsx";
import { calculatorCategories, calculators, getCalculatorById } from "../data/calculators.js";
import { useFavorites } from "../hooks/useFavorites.js";
import { useHistory } from "../hooks/useHistory.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { formatDateTime } from "../utils/format.js";
import { websiteSchema } from "../utils/schema.js";
import { useMemo, useState } from "react";

export default function Dashboard() {
  usePageMeta(
    "Work & Money Suite",
    "A modern calculator suite for workdays, take-home pay, benefits, debt payoff, and retirement planning.",
    { path: "/", schema: websiteSchema() },
  );
  const { favorites, toggleFavorite } = useFavorites();
  const { history, clearHistory } = useHistory();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const favoriteCalculators = calculators.filter((calculator) => favorites.includes(calculator.id));
  const liveCount = calculators.filter((calculator) => calculator.status === "Live").length;
  const plannedCount = calculators.filter((calculator) => calculator.status === "Planned").length;
  const visibleCalculators = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return calculators;

    return calculators.filter((calculator) =>
      [calculator.title, calculator.summary, calculator.category, ...calculator.tags]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  return (
    <div className="dashboard">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Work & Money Suite</p>
          <h1>Practical calculators for workdays, paychecks, and financial decisions.</h1>
          <p>
            Estimate clock-out times, take-home pay, deductions, and future money choices with a
            professional, privacy-friendly toolset stored on this device.
          </p>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <span className="sun-shape" />
          <span className="city-shape tall" />
          <span className="city-shape mid" />
          <span className="city-shape short" />
          <span className="leaf-shape one" />
          <span className="leaf-shape two" />
          <span className="coin-shape" />
        </div>
        <div className="hero-panel" aria-label="Platform snapshot">
          <div>
            <span>Live</span>
            <strong>{liveCount}</strong>
          </div>
          <div>
            <span>Planned</span>
            <strong>{plannedCount}</strong>
          </div>
          <div>
            <span>Saved</span>
            <strong>{favorites.length}</strong>
          </div>
        </div>
      </section>

      <section className="quick-grid" id="history" aria-label="Quick access">
        <button className="quick-action" type="button" onClick={() => setHistoryOpen(true)}>
          <span>Recent calculations</span>
          <strong>{history.length}</strong>
        </button>
        <div className="quick-action">
          <span>Device storage</span>
          <strong>Local</strong>
        </div>
        <div className="quick-action">
          <span>Tax year</span>
          <strong>2026</strong>
        </div>
      </section>

      {favoriteCalculators.length ? (
        <section className="section-block" id="favorites">
          <div className="section-header">
            <div>
              <p className="eyebrow">Saved</p>
              <h2>Favorites</h2>
            </div>
          </div>
          <div className="calculator-grid">
            {favoriteCalculators.map((calculator) => (
              <CalculatorCard
                key={calculator.id}
                calculator={calculator}
                isFavorite={favorites.includes(calculator.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-block" id="calculators">
        <div className="section-header">
          <div>
            <p className="eyebrow">Library</p>
            <h2>Calculator suite</h2>
          </div>
        </div>
        <div className="library-tools">
          <InputField
            id="calculator-search"
            label="Search calculators"
            type="search"
            placeholder="Try paycheck, debt, bonus, PTO..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <p className="muted">
            Showing {visibleCalculators.length} of {calculators.length} calculators.
          </p>
        </div>
        {calculatorCategories.map((category) => {
          const categoryCalculators = visibleCalculators.filter((calculator) => calculator.category === category.id);
          if (!categoryCalculators.length) return null;

          return (
            <div className="category-block" id={category.id} key={category.id}>
              <div className="category-heading">
                <h3>{category.label}</h3>
                <p>{category.description}</p>
              </div>
              <div className="calculator-grid">
                {categoryCalculators.map((calculator) => (
                  <CalculatorCard
                    key={calculator.id}
                    calculator={calculator}
                    isFavorite={favorites.includes(calculator.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="section-block roadmap" id="roadmap">
        <div className="section-header">
          <div>
            <p className="eyebrow">Roadmap</p>
            <h2>Built to expand</h2>
          </div>
        </div>
        <ol>
          <li>V2 calculator library across work time, paychecks, benefits, debt, and retirement.</li>
          <li>Scenario comparisons, richer reports, and calculator-specific education modules.</li>
          <li>Embeddable business widgets and optional account sync in a future backend release.</li>
        </ol>
      </section>

      <Modal title="Recent calculations" isOpen={historyOpen} onClose={() => setHistoryOpen(false)}>
        <div className="history-list" id="recent-history-list">
          {history.length ? (
            history.map((item) => (
              <div className="history-item" key={`${item.calculatorId}-${item.createdAt}`}>
                <strong>{getCalculatorById(item.calculatorId)?.title ?? item.calculatorId}</strong>
                <span>{formatDateTime(item.createdAt)}</span>
                <p>{item.summary}</p>
              </div>
            ))
          ) : (
            <p className="muted">No saved calculations yet.</p>
          )}
        </div>
        {history.length ? (
          <button className="secondary-button" type="button" onClick={clearHistory}>
            Clear history
          </button>
        ) : null}
      </Modal>
    </div>
  );
}
