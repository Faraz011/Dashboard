// src/components/auth/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      nav("/dashboard/overview");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-50 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="text-2xl font-bold text-slate-900">Team Dashboard</div>
        <div className="mt-1 text-sm text-slate-500">Login to continue</div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">Password</div>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          <Button disabled={busy} className="w-full">{busy ? "Signing in..." : "Login"}</Button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          No account? <Link className="font-semibold text-indigo-600 hover:underline" to="/signup">Sign up</Link>
        </div>
      </Card>
    </div>
  );
}
