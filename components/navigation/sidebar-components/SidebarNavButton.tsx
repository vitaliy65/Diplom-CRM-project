import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Sidebar navigation item for desktop.
 */
export function SidebarNavButton({
  icon: Icon,
  label,
  isActive,
  expanded,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors overflow-hidden",
        isActive
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
    >
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <Icon className="h-5 w-5 shrink-0" />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
