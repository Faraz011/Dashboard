// src/pages/dashboard/Ideas.jsx
import { useEffect, useState } from "react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import { api } from "../../../services/api";
import { createIdea, likeIdea, listIdeas, updateIdea } from "../../../services/firestore";
import { useAuth } from "../../../hooks/useAuth";
import { Lightbulb, Heart, Plus, Brain, Hash, Calendar, User, Sparkles, TrendingUp } from "lucide-react";

export default function Ideas() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [topicBusy, setTopicBusy] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

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

    setTopicBusy(true);
    try {
      const res = await api.post("/api/topics", { texts });
      // Backend returns topics list (global). Here we just store the top topic name on all ideas for simplicity.
      const topTopic = res.data.topics?.[0]?.name || "General";
      await Promise.all(ideas.map((i) => updateIdea(i.id, { topic: topTopic })));
      await refresh();
    } finally {
      setTopicBusy(false);
    }
  }

  const sortedIdeas = [...ideas].sort((a, b) => {
    switch (sortBy) {
      case "likes":
        return (b.likes || 0) - (a.likes || 0);
      case "recent":
        return new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - new Date(a.createdAt?.toDate?.() || a.createdAt || 0);
      default:
        return 0;
    }
  });

  const totalLikes = ideas.reduce((sum, idea) => sum + (idea.likes || 0), 0);
  const uniqueTopics = [...new Set(ideas.map(idea => idea.topic).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-3xl font-bold text-slate-900">Ideas</div>
                <div className="text-sm text-slate-600 mt-1">Share and collaborate on innovative insights</div>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span className="font-medium">{ideas.length} ideas</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="font-medium">{totalLikes} likes</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span className="font-medium">{uniqueTopics.length} topics</span>
              </div>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={runTopicModeling} 
            disabled={ideas.length < 2 || topicBusy}
            className="flex items-center gap-2"
          >
            {topicBusy ? (
              <>
                <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Auto-detect topics
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Create Idea Form */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-100">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-yellow-600" />
          <div className="text-lg font-semibold text-slate-900">Share New Idea</div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Input 
              placeholder="Give your idea a catchy title..." 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              required 
              className="bg-white"
            />
          </div>
          <div>
            <Textarea 
              placeholder="Describe your idea in detail... What problem does it solve? How would it work?" 
              rows={4} 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              required 
              className="bg-white"
            />
          </div>
          <Button 
            disabled={busy} 
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Share Idea
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Sort and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Sort by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("recent")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                sortBy === "recent" 
                  ? "bg-yellow-600 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy("likes")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                sortBy === "likes" 
                  ? "bg-yellow-600 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Popular
            </button>
          </div>
        </div>
        
        {ideas.length > 0 && (
          <div className="text-sm text-slate-500">
            Showing {sortedIdeas.length} of {ideas.length} ideas
          </div>
        )}
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {sortedIdeas.map((i) => (
          <Card key={i.id} className="group hover:shadow-lg transition-all duration-200 border border-slate-200 hover:border-yellow-200">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-slate-900 mb-2 line-clamp-2">{i.title}</div>
                  {i.topic && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mb-2">
                      <Hash className="w-3 h-3" />
                      {i.topic}
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => likeIdea(i.id)}
                  className="flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">{i.likes || 0}</span>
                </Button>
              </div>
              
              <div className="text-sm text-slate-700 line-clamp-3 mb-4">
                {i.description}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3 h-3" />
                  <span>Shared by you</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(i.createdAt?.toDate?.() || i.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {ideas.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <Lightbulb className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="text-lg font-semibold text-slate-900 mb-2">No ideas yet</div>
          <div className="text-sm text-slate-500 mb-6">Start sharing your innovative thoughts with the team</div>
        </div>
      )}
    </div>
  );
}
