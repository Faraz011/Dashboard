// src/pages/dashboard/Analytics.jsx
import { useEffect, useState } from "react";
import Card from "../../ui/Card";
import StatCard from "../../ui/StatCard";
import { api } from "../../../services/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from "recharts";
import { BarChart3, PieChartIcon, TrendingUp, Database, Brain, Lightbulb, MessageCircle, Activity } from "lucide-react";

const COLORS = ["#4f46e5", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [dist, setDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const s = await api.get("/api/analytics/stats");
        const d = await api.get("/api/analytics/resource-distribution");

        setStats(s.data.stats);

        const distData = Object.entries(d.data.distribution || {}).map(([name, value]) => ({
          name: name.toUpperCase(),
          value,
        }));
        setDist(distData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const barData = stats
    ? [
        { name: "Resources", value: stats.totalResources || 0, color: "#4f46e5" },
        { name: "Models", value: stats.totalModels || 0, color: "#0ea5e9" },
        { name: "Ideas", value: stats.totalIdeas || 0, color: "#22c55e" },
        { name: "Chats", value: stats.totalChats || 0, color: "#f59e0b" },
      ]
    : [];

  const totalItems = barData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          <div>
            <div className="text-3xl font-bold text-slate-900">Analytics</div>
            <div className="text-sm text-slate-600 mt-1">Comprehensive insights into your knowledge base</div>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="font-medium">{totalItems} total items</span>
          </div>
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            <span className="font-medium">{dist.length} file types</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Resources" value={stats?.totalResources || 0} icon={<Database className="w-5 h-5" />} />
        <StatCard label="Models" value={stats?.totalModels || 0} icon={<Brain className="w-5 h-5" />} />
        <StatCard label="Ideas" value={stats?.totalIdeas || 0} icon={<Lightbulb className="w-5 h-5" />} />
        <StatCard label="Chats" value={stats?.totalChats || 0} icon={<MessageCircle className="w-5 h-5" />} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            <div className="text-lg font-semibold text-slate-900">Resource Distribution</div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dist}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {dist.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {dist.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">
              No resource data available
            </div>
          )}
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <div className="text-lg font-semibold text-slate-900">Content Overview</div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {barData.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">
              No content data available
            </div>
          )}
        </Card>
      </div>

      {/* Summary Section */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <div className="text-lg font-semibold text-slate-900">Summary Insights</div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {barData.map((item, index) => {
            const percentage = totalItems > 0 ? ((item.value / totalItems) * 100).toFixed(1) : '0';
            return (
              <div key={item.name} className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                <div className="text-xs text-slate-600">{percentage}% of total</div>
              </div>
            );
          })}
        </div>
        {barData.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-500">
            Start adding content to see analytics insights
          </div>
        )}
      </Card>
    </div>
  );
}
