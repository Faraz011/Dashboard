// src/pages/dashboard/Models.jsx
import { useEffect, useState } from "react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import { createModel, listModels } from "../../../services/firestore";
import { useAuth } from "../../../hooks/useAuth";

export default function Models() {
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [form, setForm] = useState({ name: "", type: "CNN", description: "", sharpeRatio: "", winRate: "", maxDrawdown: "" });
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setModels(await listModels());
  }
  useEffect(() => { refresh(); }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await createModel(
        {
          name: form.name,
          type: form.type,
          description: form.description,
          performance: {
            sharpeRatio: form.sharpeRatio ? Number(form.sharpeRatio) : null,
            winRate: form.winRate ? Number(form.winRate) : null,
            maxDrawdown: form.maxDrawdown ? Number(form.maxDrawdown) : null,
          },
        },
        user.uid
      );
      setForm({ name: "", type: "CNN", description: "", sharpeRatio: "", winRate: "", maxDrawdown: "" });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="text-2xl font-bold text-slate-900">Models</div>
      <div className="mt-1 text-sm text-slate-500">Track model specs and performance.</div>

      <Card className="mt-6">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input placeholder="Model name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {["CNN", "LSTM", "HMM", "Ensemble", "Transformer", "RL"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <Textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input placeholder="Sharpe ratio" type="number" step="0.01" value={form.sharpeRatio} onChange={(e) => setForm({ ...form, sharpeRatio: e.target.value })} />
            <Input placeholder="Win rate (%)" type="number" step="0.01" value={form.winRate} onChange={(e) => setForm({ ...form, winRate: e.target.value })} />
            <Input placeholder="Max drawdown (%)" type="number" step="0.01" value={form.maxDrawdown} onChange={(e) => setForm({ ...form, maxDrawdown: e.target.value })} />
          </div>
          <Button disabled={busy}>{busy ? "Saving..." : "Create model"}</Button>
        </form>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {models.map((m) => (
          <Card key={m.id}>
            <div className="text-sm font-bold text-slate-900">{m.name}</div>
            <div className="mt-1 text-xs text-slate-500">{m.type}</div>
            <div className="mt-3 text-sm text-slate-700">{m.description}</div>
            <div className="mt-3 text-xs text-slate-600">
              Sharpe: {m.performance?.sharpeRatio ?? "—"} • Win: {m.performance?.winRate ?? "—"} • DD: {m.performance?.maxDrawdown ?? "—"}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
