
export default function Card({ className = "", children }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-soft ${className}`}>{children}</div>;
}
