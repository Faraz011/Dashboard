// src/pages/dashboard/Ideas.jsx
import { useEffect, useState } from "react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import { api } from "../../../services/api";
import { createIdea, likeIdea, listIdeas, updateIdea } from "../../../services/firestore";
import { useAuth } from "../../../hooks/useAuth";

export default function Ideas() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setIdeas(await listIdeas());
  }
  useEffect(() => { refresh(); }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      // Optional: embed the idea text (so later you can do idea semantic search too)
      const emb = await api.post("/api/embed", { text: form.title + "\n" + form.description });

      await createIdea(
        {
          title: form.title,
          description: form.description,
          embedding: emb.data.embedding,
          topic: null,
        },
        user.uid
      );

      setForm({ title: "", description: "" });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function runTopicModeling() {
    // Simple batch topic discovery: send all idea texts to backend, then write back topic name
    const texts = ideas.map((i) => `${i.title}\n${i.description}`);
    if (texts.length < 2) return;

    const res = await api.post("/api/topics", { texts });
    // Backend returns topics list (global). Here we just store the top topic name on all ideas for simplicity.
    const topTopic = res.data.topics?.[0]?.name || "General";
    await Promise.all(ideas.map((i) => updateIdea(i.id, { topic: topTopic })));
    await refresh();
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-bold text-slate-900">Ideas</div>
          <div className="mt-1 text-sm text-slate-500">Share insights (with optional embedding + topic labeling).</div>
        </div>
        <Button variant="ghost" onClick={runTopicModeling} disabled={ideas.length < 2}>
          Auto-detect topics
        </Button>
      </div>

      <Card className="mt-6">
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <Button disabled={busy}>{busy ? "Sharing..." : "Share idea"}</Button>
        </form>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {ideas.map((i) => (
          <Card key={i.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-slate-900">{i.title}</div>
                <div className="mt-1 text-xs text-slate-500">{i.topic ? `Topic: ${i.topic}` : "Topic: —"}</div>
              </div>
              <Button variant="ghost" onClick={() => likeIdea(i.id)}>Like ({i.likes || 0})</Button>
            </div>
            <div className="mt-3 text-sm text-slate-700">{i.description}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
