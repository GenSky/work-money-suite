import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      <div className="app-body">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
