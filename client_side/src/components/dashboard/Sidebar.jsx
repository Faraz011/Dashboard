// src/components/dashboard/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, BarChart3, Database, Brain, Lightbulb, MessageCircle, PieChart, Settings, HelpCircle, LogOut } from "lucide-react";
import Button from "../ui/Button";

const linkBase = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200";
const linkIdle = "text-slate-700 hover:bg-slate-100 hover:text-slate-900";
const linkActive = "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600";

export default function Sidebar({ onNavigate, collapsed = false, onToggleCollapse }) {
  const items = [
    { to: "/dashboard/overview", label: "Overview", icon: <BarChart3 className="w-5 h-5" /> },
    { to: "/dashboard/resources", label: "Resources", icon: <Database className="w-5 h-5" /> },
    { to: "/dashboard/models", label: "Models", icon: <Brain className="w-5 h-5" /> },
    { to: "/dashboard/ideas", label: "Ideas", icon: <Lightbulb className="w-5 h-5" /> },
    { to: "/dashboard/chat", label: "Chat", icon: <MessageCircle className="w-5 h-5" /> },
    { to: "/dashboard/analytics", label: "Analytics", icon: <PieChart className="w-5 h-5" /> },
  ];

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <div className={`h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Dashboard</h2>
              <p className="text-xs text-slate-500">Knowledge Base</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          {/* Mobile Close Button */}
          <button 
            onClick={onNavigate}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Desktop Collapse Toggle */}
          {!collapsed && (
            <button 
              onClick={onToggleCollapse}
              className="hidden md:flex p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          
          {collapsed && (
            <button 
              onClick={onToggleCollapse}
              className="hidden md:flex p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Navigation */}
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
              <div className={`transition-all duration-200 ${
                collapsed ? 'mx-auto' : ''
              }`}>
                {item.icon}
              </div>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {item.label}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <HelpCircle className="w-4 h-4" />
              <span>Help & Support</span>
            </div>
            <div className="text-xs text-slate-400">
              Version 1.0.0
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="text-xs text-slate-400">v1.0</div>
          </div>
        )}
      </div>
    </div>
  );
}
