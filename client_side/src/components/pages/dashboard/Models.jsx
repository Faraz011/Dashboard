// src/pages/dashboard/Models.jsx
import { useEffect, useState } from "react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import { createModel, listModels } from "../../../services/firestore";
import { useAuth } from "../../../hooks/useAuth";
import { Brain, Plus, TrendingUp, TrendingDown, Activity, Calendar, User, BarChart3, Zap, Target } from "lucide-react";

export default function Models() {
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [form, setForm] = useState({ name: "", type: "CNN", description: "", sharpeRatio: "", winRate: "", maxDrawdown: "" });
  const [busy, setBusy] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  async function refresh() {
    setModels(await listModels());
  }
  useEffect(() => { refresh(); }, []);

  const sortedModels = [...models].sort((a, b) => {
    switch (sortBy) {
      case "sharpe":
        return (b.performance?.sharpeRatio || 0) - (a.performance?.sharpeRatio || 0);
      case "winrate":
        return (b.performance?.winRate || 0) - (a.performance?.winRate || 0);
      case "recent":
        return new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - new Date(a.createdAt?.toDate?.() || a.createdAt || 0);
      default:
        return 0;
    }
  });

  const avgSharpe = models.reduce((sum, m) => sum + (m.performance?.sharpeRatio || 0), 0) / models.length || 0;
  const avgWinRate = models.reduce((sum, m) => sum + (m.performance?.winRate || 0), 0) / models.length || 0;
  const modelTypes = [...new Set(models.map(m => m.type))];

  function getModelTypeColor(type) {
    const colors = {
      'CNN': 'bg-blue-100 text-blue-800',
      'LSTM': 'bg-purple-100 text-purple-800',
      'HMM': 'bg-green-100 text-green-800',
      'Ensemble': 'bg-orange-100 text-orange-800',
      'Transformer': 'bg-red-100 text-red-800',
      'RL': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  function getPerformanceColor(value, metric) {
    if (value === null || value === undefined) return 'text-gray-500';
    if (metric === 'sharpe') {
      return value > 1 ? 'text-green-600' : value > 0.5 ? 'text-yellow-600' : 'text-red-600';
    }
    if (metric === 'winrate') {
      return value > 60 ? 'text-green-600' : value > 50 ? 'text-yellow-600' : 'text-red-600';
    }
    if (metric === 'drawdown') {
      return value < 5 ? 'text-green-600' : value < 10 ? 'text-yellow-600' : 'text-red-600';
    }
    return 'text-gray-500';
  }

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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-600" />
          <div>
            <div className="text-3xl font-bold text-slate-900">AI Models</div>
            <div className="text-sm text-slate-600 mt-1">Track and manage your machine learning models</div>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="font-medium">{models.length} models</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="font-medium">{modelTypes.length} types</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="font-medium">Avg Sharpe: {avgSharpe.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Create Model Form */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-blue-600" />
          <div className="text-lg font-semibold text-slate-900">Create New Model</div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Input 
                placeholder="Model name (e.g., Trading Bot v2)" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
                className="bg-white"
              />
            </div>
            <div>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {["CNN", "LSTM", "HMM", "Ensemble", "Transformer", "RL"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Textarea 
              placeholder="Describe your model's architecture, training data, and use case..." 
              rows={3} 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              className="bg-white"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Input 
                placeholder="Sharpe ratio" 
                type="number" 
                step="0.01" 
                value={form.sharpeRatio} 
                onChange={(e) => setForm({ ...form, sharpeRatio: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <Input 
                placeholder="Win rate (%)" 
                type="number" 
                step="0.01" 
                value={form.winRate} 
                onChange={(e) => setForm({ ...form, winRate: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <Input 
                placeholder="Max drawdown (%)" 
                type="number" 
                step="0.01" 
                value={form.maxDrawdown} 
                onChange={(e) => setForm({ ...form, maxDrawdown: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>
          <Button 
            disabled={busy} 
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Create Model
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
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy("sharpe")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                sortBy === "sharpe" 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Sharpe Ratio
            </button>
            <button
              onClick={() => setSortBy("winrate")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                sortBy === "winrate" 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Win Rate
            </button>
          </div>
        </div>
        
        {models.length > 0 && (
          <div className="text-sm text-slate-500">
            Showing {sortedModels.length} of {models.length} models
          </div>
        )}
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {sortedModels.map((m) => (
          <Card key={m.id} className="group hover:shadow-lg transition-all duration-200 border border-slate-200 hover:border-blue-200">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-slate-900 mb-2 truncate">{m.name}</div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getModelTypeColor(m.type)}`}>
                    <Brain className="w-3 h-3" />
                    {m.type}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-slate-700 line-clamp-2 mb-4">
                {m.description || 'No description provided'}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Sharpe Ratio</span>
                  <span className={`font-semibold ${getPerformanceColor(m.performance?.sharpeRatio, 'sharpe')}`}>
                    {m.performance?.sharpeRatio ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Win Rate</span>
                  <span className={`font-semibold ${getPerformanceColor(m.performance?.winRate, 'winrate')}`}>
                    {m.performance?.winRate ? `${m.performance.winRate}%` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Max Drawdown</span>
                  <span className={`font-semibold ${getPerformanceColor(m.performance?.maxDrawdown, 'drawdown')}`}>
                    {m.performance?.maxDrawdown ? `${m.performance.maxDrawdown}%` : '—'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3 h-3" />
                  <span>Created by you</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(m.createdAt?.toDate?.() || m.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {models.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-lg font-semibold text-slate-900 mb-2">No models yet</div>
          <div className="text-sm text-slate-500 mb-6">Start by creating your first AI model</div>
        </div>
      )}

      {/* Performance Summary */}
      {models.length > 0 && (
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <div className="text-lg font-semibold text-slate-900">Performance Summary</div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">Average Sharpe Ratio</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{avgSharpe.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Average Win Rate</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{avgWinRate.toFixed(1)}%</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-slate-700">Total Models</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{models.length}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
