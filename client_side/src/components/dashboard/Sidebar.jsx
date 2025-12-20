// src/components/dashboard/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

const linkBase = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";
const linkIdle = "text-slate-700 hover:bg-slate-100";
const linkActive = "bg-indigo-50 text-indigo-700";

export default function Sidebar({ onNavigate }) {
  const items = [
    { to: "/dashboard/overview", label: "Overview" },
    { to: "/dashboard/resources", label: "Resources"  },
    { to: "/dashboard/models", label: "Models" },
    { to: "/dashboard/ideas", label: "Ideas"  },
    { to: "/dashboard/chat", label: "Chat" },
    { to: "/dashboard/analytics", label: "Analytics"},
  ];

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <div className="h-full w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
        <button 
          onClick={onNavigate}
          className="md:hidden p-1 rounded-md hover:bg-slate-100 text-slate-500"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) => 
                `${linkBase} ${isActive ? linkActive : linkIdle} group`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          v1.0.0
        </div>
      </div>
    </div>
  );
}
