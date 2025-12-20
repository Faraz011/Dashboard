// src/pages/dashboard/Analytics.jsx
import { useEffect, useState } from "react";
import Card from "../../ui/Card";
import StatCard from "../../ui/StatCard";
import { api } from "../../../services/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#4f46e5", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [dist, setDist] = useState([]);

  useEffect(() => {
    (async () => {
      const s = await api.get("/api/analytics/stats");
      const d = await api.get("/api/analytics/resource-distribution");

      setStats(s.data.stats);

      const distData = Object.entries(d.data.distribution || {}).map(([name, value]) => ({
        name: name.toUpperCase(),
        value,
      }));
      setDist(distData);
    })();
  }, []);

  const barData = stats
    ? [
        { name: "Resources", value: stats.totalResources || 0 },
        { name: "Models", value: stats.totalModels || 0 },
        { name: "Ideas", value: stats.totalIdeas || 0 },
        { name: "Chats", value: stats.totalChats || 0 },
      ]
    : [];

  return (
    <div>
      <div className="text-2xl font-bold text-slate-900">Charts</div>
      <div className="mt-1 text-sm text-slate-500">High-level counts + resource distribution (no team analytics).</div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Resources" value={stats?.totalResources || 0} />
        <StatCard label="Models" value={stats?.totalModels || 0} />
        <StatCard label="Ideas" value={stats?.totalIdeas || 0} />
        <StatCard label="Chats" value={stats?.totalChats || 0} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="text-sm font-bold text-slate-900">Resource distribution</div>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dist} dataKey="value" nameKey="name" outerRadius={90} label>
                  {dist.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-bold text-slate-900">Totals</div>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
