// src/components/dashboard/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardLayout() {
  const { user } = useAuth();
  return (
    <div className="min-h-full bg-slate-50">
      <Topbar user={user} />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
