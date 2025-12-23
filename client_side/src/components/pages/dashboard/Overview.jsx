// src/pages/dashboard/Overview.jsx
import { useEffect, useState } from "react";
import StatCard from "../../ui/StatCard";
import { listResources, listModels, listIdeas } from "../../../services/firestore";
import { Database, Brain, Lightbulb, TrendingUp, Activity, Users, FileText, BarChart3 } from "lucide-react";

export default function Overview() {
  const [stats, setStats] = useState({ resources: 0, models: 0, ideas: 0 });

  useEffect(() => {
    (async () => {
      const [r, m, i] = await Promise.all([listResources(), listModels(), listIdeas()]);
      setStats({ resources: r.length, models: m.length, ideas: i.length });
    })();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <div className="text-3xl font-bold text-slate-900">Overview</div>
            <div className="text-sm text-slate-600 mt-1">Quick snapshot of your knowledge base</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Resources" value={stats.resources} icon={<Database className="w-5 h-5" />} />
        <StatCard label="Models" value={stats.models} icon={<Brain className="w-5 h-5" />} />
        <StatCard label="Ideas" value={stats.ideas} icon={<Lightbulb className="w-5 h-5" />} />
      </div>

      {/* Workflow Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-indigo-600" />
            <div className="text-lg font-semibold text-slate-900">Workflow Process</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">Upload</div>
                <div className="text-xs text-slate-600">Add PDFs, TXT, CSV, or JSON files</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">Chunk</div>
                <div className="text-xs text-slate-600">Content is broken into manageable pieces</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">Embed</div>
                <div className="text-xs text-slate-600">Generate semantic embeddings</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">Store</div>
                <div className="text-xs text-slate-600">Save to Firestore for search</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div className="text-lg font-semibold text-slate-900">Quick Actions</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Resources</div>
                  <div className="text-xs text-slate-600">{stats.resources} files uploaded</div>
                </div>
              </div>
              <div className="text-xs text-green-600 font-medium">Manage</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Models</div>
                  <div className="text-xs text-slate-600">{stats.models} AI models</div>
                </div>
              </div>
              <div className="text-xs text-green-600 font-medium">Configure</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Ideas</div>
                  <div className="text-xs text-slate-600">{stats.ideas} ideas saved</div>
                </div>
              </div>
              <div className="text-xs text-green-600 font-medium">Explore</div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Getting Started</div>
            <div className="text-sm text-slate-600 mt-1">
              Navigate to the <span className="font-semibold text-amber-700">Resources</span> page to upload your first document. 
              The system will automatically process and embed your content for intelligent search and retrieval.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
