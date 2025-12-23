// src/components/dashboard/Topbar.jsx
import { signOut } from "firebase/auth";
import { Menu, Search, Bell, User, LogOut, Settings } from "lucide-react";
import { auth } from "../../services/firebase";
import Button from "../ui/Button";
import { useState } from "react";

export default function Topbar({ user, onMenuClick, isSidebarOpen }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-3 md:px-6 md:py-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Menu className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Knowledge Management System</p>
          </div>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-48 lg:w-64"
          />
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        
        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-indigo-600" />
              )}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-slate-900">
                {user?.displayName || user?.email?.split('@')[0]}
              </div>
              <div className="text-xs text-slate-500">
                {user?.email}
              </div>
            </div>
          </button>
          
          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-sm font-medium text-slate-900">
                  {user?.displayName || user?.email?.split('@')[0]}
                </div>
                <div className="text-xs text-slate-500">
                  {user?.email}
                </div>
              </div>
              
              <button className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
