import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Mobile bottom nav item.
 */
export function MobileBottomNavItem({
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
        "flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors",
        isActive ? "text-primary" : "text-muted-foreground",
      )}
      type="button"
    >
      <div
        className={cn("relative rounded-lg p-1.5", isActive && "bg-primary/20")}
      >
        <Icon className="h-5 w-5" />
        {isActive && (
          <motion.div
            layoutId="mobileActiveIndicator"
            className="absolute inset-0 rounded-lg bg-primary/20"
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
