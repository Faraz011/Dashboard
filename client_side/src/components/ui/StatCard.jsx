// src/components/ui/StatCard.jsx
import Card from "./Card";

export default function StatCard({ label, value }) {
  return (
    <Card>
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
    </Card>
  );
}
