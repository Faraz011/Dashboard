// src/components/auth/Signup.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      nav("/dashboard/overview");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-50 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="text-2xl font-bold text-slate-900">Create account</div>
        <div className="mt-1 text-sm text-slate-500">Email/password signup</div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">Name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">Password</div>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          <Button disabled={busy} className="w-full">{busy ? "Creating..." : "Sign up"}</Button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Already have an account? <Link className="font-semibold text-indigo-600 hover:underline" to="/login">Login</Link>
        </div>
      </Card>
    </div>
  );
}
