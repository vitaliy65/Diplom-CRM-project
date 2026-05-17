import { motion } from "framer-motion";

interface Activity {
  id: number;
  text: string;
  time: string;
  type: string;
}

interface ActivityItemProps {
  activity: Activity;
  onClick?: () => void;
}

export function ActivityItem({ activity, onClick }: ActivityItemProps) {
  const dotColors: Record<string, string> = {
    new: "bg-glow-blue dot-glow-blue",
    progress: "bg-glow-amber dot-glow-amber",
    ready: "bg-glow-green dot-glow-green",
    delivered: "bg-glow-purple",
    sla: "bg-glow-red dot-glow-red",
  };

  return (
    <motion.div
      className="flex items-start gap-3 rounded-xl p-2 md:p-3 transition-colors hover:bg-secondary/30 cursor-pointer select-none"
      whileHover={{ x: 4 }}
      onClick={onClick}
    >
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColors[activity.type]}`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-sm text-foreground line-clamp-2">
          {activity.text}
        </p>
        <p className="text-[10px] md:text-xs text-muted-foreground">
          {activity.time}
        </p>
      </div>
    </motion.div>
  );
}
