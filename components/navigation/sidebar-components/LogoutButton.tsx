import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

/**
 * Logout button for sidebar and mobile overlay.
 */
export function LogoutButton({
  expanded,
  onClick,
  className = "",
}: {
  expanded?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
        className,
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
    >
      <LogOut className="h-5 w-5 shrink-0" />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap"
          >
            Вийти
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
