// src/components/dashboard/Topbar.jsx
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import Button from "../ui/Button";

export default function Topbar({ user }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur px-6 py-4">
      <div className="text-lg font-bold text-slate-900">AI Team Dashboard</div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-sm text-slate-600">
          {user?.displayName || user?.email}
        </div>
        <Button variant="ghost" onClick={() => signOut(auth)}>Logout</Button>
      </div>
    </div>
  );
}
