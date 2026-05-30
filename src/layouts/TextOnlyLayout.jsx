import { NavLink, Outlet } from "react-router-dom";
import { calculatorCategories, calculators } from "../data/calculators.js";

export default function TextOnlyLayout() {
  const liveCalculators = calculators.filter((calculator) => calculator.status === "Live");

  return (
    <div className="text-only-shell">
      <header className="text-only-header">
        <div>
          <p className="eyebrow">Text-only mode</p>
          <p className="text-only-site-name">Work & Money Suite</p>
          <p>Fast, low-distraction calculator pages using the same saved inputs and calculation models.</p>
        </div>
        <nav aria-label="Text-only navigation">
          <NavLink to="/text">Text home</NavLink>
          <NavLink to="/">Full site</NavLink>
        </nav>
      </header>

      <div className="text-only-grid">
        <aside className="text-only-nav" aria-label="Text-only calculator list">
          <strong>Calculators</strong>
          {liveCalculators.map((calculator) => (
            <NavLink key={calculator.id} to={`/text${calculator.path}`}>
              {calculator.title}
            </NavLink>
          ))}
          <strong>Categories</strong>
          {calculatorCategories.map((category) => (
            <a key={category.id} href={`/text#${category.id}`}>
              {category.label}
            </a>
          ))}
        </aside>
        <main className="text-only-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
