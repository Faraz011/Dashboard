// src/components/ui/StatCard.jsx
import Card from "./Card";

export default function StatCard({ label, value, icon = null, trend = null, className = "" }) {
  return (
    <Card className={`p-6 ${className}`} hover={true}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-600 mb-2">{label}</div>
          <div className="text-3xl font-bold text-slate-900">{value}</div>
          {trend && (
            <div className={`mt-2 text-sm font-medium flex items-center gap-1 ${
              trend.value > 0 ? "text-emerald-600" : "text-rose-600"
            }`}>
              {trend.value > 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
              <span className="text-slate-500 font-normal">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
