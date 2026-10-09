// src/components/ui/EmptyState.jsx
export default function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 anim-slide-up">
      <div className="text-5xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-lg font-bold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 text-center max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  );
}