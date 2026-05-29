export function StatCard({
  label,
  value,
  icon,
  variant = "default",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warn";
}) {
  const styles = {
    default: "bg-muted/40 border-border",
    accent: "bg-primary/5 border-primary/20",
    success: "bg-emerald-500/8 border-emerald-500/20",
    warn: "bg-destructive/6 border-destructive/20",
  };
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${styles[variant]}`}
    >
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
