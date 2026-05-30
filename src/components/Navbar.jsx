import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import { MenuIcon } from "./icons.jsx";

export default function Navbar({ onOpenMenu }) {
  return (
    <header className="navbar">
      <Link className="brand" to="/" aria-label="Work & Money Suite home">
        <span className="brand-mark">W</span>
        <span>
          <strong>Work & Money Suite</strong>
          <small>Calculators for work and pay</small>
        </span>
      </Link>
      <nav className="top-nav" aria-label="Primary navigation">
        <Link to="/#calculators">Calculators</Link>
        <Link to="/#history">History</Link>
        <Link to="/#roadmap">Roadmap</Link>
        <Link to="/text">Text-only</Link>
      </nav>
      <div className="navbar-actions">
        <ThemeToggle />
        <button className="icon-button mobile-only" type="button" onClick={onOpenMenu} aria-label="Open navigation">
          <MenuIcon />
        </button>
      </div>
    </header>
  );
}
