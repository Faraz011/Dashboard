// src/App.jsx
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import { AuthContext } from "./context/AuthContext";

import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import DashboardLayout from "./components/dashboard/DashboardLayout.jsx";

import Overview from "./components/pages/dashboard/Overview";
import Resources from "./components/pages/dashboard/Resources";
import Models from "./components/pages/dashboard/Models";
import Ideas from "./components/pages/dashboard/Ideas";
import Chat from "./components/pages/dashboard/Chat";
import Analytics from "./components/pages/dashboard/Analytics";

function Protected({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [boot, setBoot] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setBoot(false);
    });
  }, []);

  if (boot) {
    return <div className="min-h-full grid place-items-center bg-slate-50 text-slate-600">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user }}>
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard/overview" : "/login"} replace />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard/overview" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard/overview" replace /> : <Signup />} />

        <Route
          path="/dashboard"
          element={
            <Protected user={user}>
              <DashboardLayout />
            </Protected>
          }
        >
          <Route path="overview" element={<Overview />} />
          <Route path="resources" element={<Resources />} />
          <Route path="models" element={<Models />} />
          <Route path="ideas" element={<Ideas />} />
          <Route path="chat" element={<Chat />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}
