// src/components/dashboard/Topbar.jsx
import { signOut } from "firebase/auth";
import { Menu } from "lucide-react";
import { auth } from "../../services/firebase";
import Button from "../ui/Button";

export default function Topbar({ user, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-1 rounded-md text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Team Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="hidden text-sm text-slate-600 sm:block">
          {user?.displayName || user?.email}
        </div>
        <Button 
          variant="ghost" 
          onClick={() => signOut(auth)}
          className="text-sm"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
