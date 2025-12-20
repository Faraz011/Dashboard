// src/components/ui/Textarea.jsx
export default function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${className}`}
      {...props}
    />
  );
}
