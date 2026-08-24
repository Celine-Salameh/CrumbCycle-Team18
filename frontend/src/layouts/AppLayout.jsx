import { BarChart3, Bell, HandHeart, LayoutDashboard, LogOut, Menu, PackageSearch, Settings, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import BrandLogo from "../components/brand/BrandLogo";

const navItems = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Surplus", to: "/dashboard/surplus", icon: PackageSearch },
  { label: "Impact", to: "/dashboard/impact", icon: BarChart3 },
  { label: "Partners", to: "/dashboard/partners", icon: HandHeart },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = user?.full_name?.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "CC";

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand"><BrandLogo compact /><button type="button" className="icon-button sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X /></button></div>
        <nav className="sidebar__nav" aria-label="Application navigation">
          <span className="sidebar__label">Workspace</span>
          {navItems.map(({ label, to, icon: Icon, end }) => <NavLink end={end} key={label} to={to} onClick={() => setSidebarOpen(false)}><Icon size={19} /><span>{label}</span></NavLink>)}
          <span className="sidebar__label sidebar__label--second">Account</span>
          <a href="#settings"><Settings size={19} /><span>Settings</span></a>
        </nav>
        <button className="sidebar__logout" type="button" onClick={handleLogout}><LogOut size={19} /> Log out</button>
      </aside>
      {sidebarOpen && <button className="sidebar-scrim" type="button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <div className="app-main">
        <header className="app-header">
          <button type="button" className="icon-button app-header__menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu /></button>
          <div><span className="app-header__eyebrow">CrumbCycle workspace</span><strong>Impact overview</strong></div>
          <div className="app-header__profile"><button className="icon-button" type="button" aria-label="Notifications"><Bell size={20} /></button><span className="avatar">{initials}</span><span className="app-header__user"><strong>{user?.full_name || "CrumbCycle user"}</strong><small>{user?.role?.name || "Member"}</small></span></div>
        </header>
        <main className="app-content"><Outlet /></main>
      </div>
    </div>
  );
}
