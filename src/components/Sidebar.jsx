import { NavLink } from "react-router-dom";
import { calculatorCategories, calculators } from "../data/calculators.js";

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div className={open ? "sidebar-overlay open" : "sidebar-overlay"} onClick={onClose} role="presentation" />
      <aside className={open ? "sidebar open" : "sidebar"} aria-label="Calculator categories">
        <div className="sidebar-section">
          <p className="eyebrow">Live calculators</p>
          {calculators
            .filter((calculator) => calculator.status === "Live")
            .map((calculator) => (
              <NavLink key={calculator.id} to={calculator.path} onClick={onClose}>
                {calculator.title}
              </NavLink>
            ))}
        </div>
        <div className="sidebar-section">
          <p className="eyebrow">Categories</p>
          {calculatorCategories.map((category) => (
            <a key={category.id} href={`/#${category.id}`} onClick={onClose}>
              {category.label}
            </a>
          ))}
        </div>
      </aside>
    </>
  );
}
