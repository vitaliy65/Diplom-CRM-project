import React from "react";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { itemVariants } from "../crm/views/dashboard-view";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  dotClass?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  dotClass,
}: StatCardProps) {
  console.log("[StatCard] I'm rendered");
  return (
    <motion.div
      variants={itemVariants}
      className="bento-card card-lift p-4 md:p-6 min-h-[142px]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs md:text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 md:mt-2 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {trend && (
            <div className="mt-1 md:mt-2 flex items-center gap-1 text-[10px] md:text-xs text-glow-green">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:inline">{trend}</span>
            </div>
          )}
        </div>
        <div className="relative rounded-lg md:rounded-xl bg-secondary/50 p-2 md:p-3">
          <Icon className="h-4 w-4 md:h-6 md:w-6 text-foreground/70" />
          {dotClass && (
            <span
              className={`absolute -right-1 -top-1 h-2 w-2 md:h-3 md:w-3 rounded-full ${dotClass}`}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
