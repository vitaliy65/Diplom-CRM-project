import { cn } from "@/lib/utils";
/**
 * Mobile overlay navigation item.
 */
export function MobileOverlayNavItem({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors",
        isActive
          ? "bg-primary/20 text-primary"
          : "text-foreground hover:bg-secondary/50",
      )}
      type="button"
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
