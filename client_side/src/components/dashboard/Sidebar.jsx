// src/components/dashboard/Sidebar.jsx
import { NavLink } from "react-router-dom";

const linkBase =
  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition";
const linkIdle = "text-slate-700 hover:bg-slate-100";
const linkActive = "bg-indigo-50 text-indigo-700";

export default function Sidebar() {
  const items = [
    { to: "/dashboard/overview", label: "Overview" },
    { to: "/dashboard/resources", label: "Resources" },
    { to: "/dashboard/models", label: "Models" },
    { to: "/dashboard/ideas", label: "Ideas" },
    { to: "/dashboard/chat", label: "Chat" },
    { to: "/dashboard/analytics", label: "Charts" },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4 hidden md:block">
      <div className="px-2 pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Menu</div>
      <nav className="space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
          >
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
