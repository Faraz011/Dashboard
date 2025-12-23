
export default function Card({ className = "", children, hover = false, ...props }) {
  const base = "rounded-xl border border-slate-200 bg-white transition-all duration-200";
  const shadows = hover 
    ? "shadow-sm hover:shadow-md hover:border-slate-300" 
    : "shadow-sm";
  
  return (
    <div 
      className={`${base} ${shadows} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
}
