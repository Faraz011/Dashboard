// src/components/ui/Textarea.jsx
export default function Textarea({ className = "", error = false, ...props }) {
  const base = "w-full rounded-lg border bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 resize-vertical";
  const states = error
    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100";
  
  return (
    <textarea
      className={`${base} ${states} ${className}`}
      {...props}
    />
  );
}
