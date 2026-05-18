"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Users,
  Zap,
  TicketIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTickets } from "@/store/slices/tickets-slice";
import { selectClients } from "@/store/slices/clients-slice";
import { selectMasters } from "@/store/slices/users-slice";
import { StatCard } from "../../dashboard-view-components/StatCard";
import { ActivityItem } from "../../dashboard-view-components/ActivityItem";
import { Ticket } from "@/lib/types";
import { getWeeklyData } from "@/lib/utils";
import { PieCustomTooltip } from "../../dashboard-view-components/PieCustomTooltip";
import { setSelectedTicketId } from "@/store/slices/selected-ticket-slice";
import { useRouter } from "next/navigation";
import { menuItems } from "@/static/MenuItems";
import { setActiveView } from "@/store/slices/view-slice";
import { getAverageRepairTimeForAllMasters, getSlaPercent } from "@/lib/master";

let _dashboardAnimated = false;

// ---------------------------------------------------------------------------
// Animation variants — defined outside component to avoid recreation on render
// ---------------------------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

// ---------------------------------------------------------------------------
// Static data — defined outside component so references are always stable
// ---------------------------------------------------------------------------
const PIE_META = [
  { name: "Прийняті", color: "oklch(0.5 0.02 270)", key: "received" as const },
  {
    name: "В роботі",
    color: "oklch(0.72 0.2 250)",
    key: "inProgress" as const,
  },
  { name: "Готові", color: "oklch(0.78 0.2 155)", key: "ready" as const },
  {
    name: "Видані",
    color: "oklch(49.6% 0.265 301.924)",
    key: "delivered" as const,
  },
] as const;

const PIE_FALLBACK = [
  { name: "Немає даних", value: 1, color: "#ccc", total: 1 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DashboardView() {
  const tickets = useAppSelector(selectTickets) as Ticket[];
  const clients = useAppSelector(selectClients);
  const masters = useAppSelector(selectMasters);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // ------------------------------------------------------------------
  // Memoised derivations — recalculate only when source data changes
  // ------------------------------------------------------------------
  const statusCounts = {
    received: tickets.filter((t) => t.status === "received").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    ready: tickets.filter((t) => t.status === "ready").length,
    delivered: tickets.filter((t) => t.status === "delivered").length,
    slaViolation: tickets.filter((t) => t.slaViolation).length,
  };

  const weeklyData = getWeeklyData(tickets);

  const recentActivities = tickets.slice(0, 5).map((ticket, idx) => ({
    id: idx + 1,
    ticketId: ticket.id,
    text: `Заявка ${ticket.id}: ${ticket.clientName}`,
    time: "щойно",
    type:
      ticket.status === "ready"
        ? "ready"
        : ticket.status === "in-progress"
          ? "progress"
          : "new",
  }));

  const { pieData, totalStatuses } = useMemo(() => {
    const total =
      statusCounts.received +
      statusCounts.inProgress +
      statusCounts.ready +
      statusCounts.delivered;

    if (total === 0) return { pieData: PIE_FALLBACK, totalStatuses: 0 };

    const data = PIE_META.map((meta) => ({
      name: meta.name,
      color: meta.color,
      key: meta.key,
      value: statusCounts[meta.key],
      total,
    }));

    return { pieData: data, totalStatuses: total };
  }, [statusCounts]);

  const activeMasters = masters.filter((m) => m.active).length;

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <motion.div
      className="general-view-settings"
      initial={_dashboardAnimated ? false : "hidden"}
      animate="visible"
      variants={containerVariants}
      onAnimationComplete={() => {
        _dashboardAnimated = true;
      }}
    >
      <div className="mx-auto max-w-7xl md:pl-16">
        <motion.div variants={itemVariants} className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Дашборд
          </h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">
            Огляд активності сервісного центру
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4">
          {/* ── Stat Cards ────────────────────────────────────────────── */}

          <div className="col-span-1 md:col-span-3">
            <StatCard
              title="Всього заявок"
              value={tickets.length}
              icon={TicketIcon}
            />
          </div>

          <div className="col-span-1 md:col-span-3">
            <StatCard
              title="В роботі"
              value={statusCounts.inProgress}
              icon={Clock}
              dotClass="bg-glow-blue dot-glow-blue"
            />
          </div>

          <div className="col-span-1 md:col-span-3">
            <StatCard
              title="Завершені"
              value={statusCounts.ready + statusCounts.delivered}
              icon={CheckCircle2}
              dotClass="bg-glow-green dot-glow-green"
            />
          </div>

          <div className="col-span-1 md:col-span-3">
            <StatCard
              title="SLA порушення"
              value={statusCounts.slaViolation}
              icon={AlertTriangle}
              dotClass="bg-glow-red dot-glow-red"
            />
          </div>

          {/* ── Area Chart ────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="col-span-2 md:col-span-8"
          >
            <div className="bento-card p-4 md:p-6 h-[280px] md:h-[340px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">
                    Тренд заявок
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    За останні 7 днів
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-glow-blue" />
                    <span className="text-muted-foreground">Отримані</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-glow-green" />
                    <span className="text-muted-foreground">Завершені</span>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient
                      id="gradientTickets"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="oklch(0.72 0.2 250)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor="oklch(0.72 0.2 250)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="gradientCompleted"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="oklch(0.78 0.2 155)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor="oklch(0.78 0.2 155)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.25 0.01 270 / 0.3)"
                  />
                  <XAxis
                    dataKey="day"
                    stroke="oklch(0.5 0 0)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.5 0 0)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.12 0.008 270)",
                      border: "1px solid oklch(0.25 0.01 270)",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px oklch(0 0 0 / 0.3)",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "oklch(0.95 0 0)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tickets"
                    stroke="oklch(0.72 0.2 250)"
                    strokeWidth={2}
                    fill="url(#gradientTickets)"
                    name="Отримані"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="oklch(0.78 0.2 155)"
                    strokeWidth={2}
                    fill="url(#gradientCompleted)"
                    name="Завершені"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ── Pie Chart ─────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="col-span-2 md:col-span-4"
          >
            <div className="bento-card p-4 md:p-6 h-[280px] md:h-[340px]">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                Розподіл статусів
              </h3>
              <ResponsiveContainer width="100%" height="65%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={1}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<PieCustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-wrap justify-center gap-2 md:gap-3 text-[10px] md:text-xs">
                {totalStatuses > 0 ? (
                  pieData.map((item) =>
                    item.value > 0 ? (
                      <div
                        key={item.name}
                        className="flex items-center gap-1.5"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">
                          {item.name}
                        </span>
                      </div>
                    ) : null,
                  )
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted" />
                    <span className="text-muted-foreground">Немає даних</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Activity Feed ─────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="col-span-2 md:col-span-5"
          >
            <div className="bento-card p-4 md:p-6 h-auto md:h-[300px]">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">
                  Остання активність
                </h3>
              </div>
              <div className="space-y-1 overflow-y-auto max-h-[200px] md:max-h-[220px] pr-2">
                {recentActivities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onClick={() => {
                      dispatch(setSelectedTicketId(activity.ticketId));
                      dispatch(setActiveView("tickets"));
                      router.push(
                        menuItems.findLast((item) => item.id == "tickets")
                          ?.url || "",
                      );
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Team Stats ────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-4"
          >
            <div className="bento-card p-4 md:p-6 h-full md:h-[300px]">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">
                  Команда
                </h3>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    Активних майстрів
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-foreground">
                    {activeMasters}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    Всього клієнтів
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-foreground">
                    {clients.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    Сер. час ремонту
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-foreground">
                    {getAverageRepairTimeForAllMasters(tickets)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── SLA Ring ──────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-3"
          >
            <div className="bento-card p-4 md:p-6 h-full md:h-[300px] flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 md:h-5 md:w-5 text-glow-amber" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">
                  SLA
                </h3>
              </div>
              <div className="flex-1 flex items-center justify-center py-4">
                <div className="relative">
                  {(() => {
                    // Настройки круга
                    const percent = getSlaPercent(tickets);
                    const size = 128; // размер SVG
                    const strokeWidth = 8;
                    const radius = size / 2 - strokeWidth / 2;
                    const circumference = 2 * Math.PI * radius;
                    const progress = Math.max(0, Math.min(100, percent));
                    const offset = circumference * (1 - progress / 100);
                    const svgSize = `h-24 w-24 md:h-32 md:w-32 overflow-visible`;

                    return (
                      <svg
                        width={size}
                        height={size}
                        viewBox={`0 0 ${size} ${size}`}
                        className={`-rotate-90 transform ${svgSize}`}
                      >
                        <circle
                          cx={size / 2}
                          cy={size / 2}
                          r={radius}
                          stroke="oklch(0.2 0.01 270)"
                          strokeWidth={strokeWidth}
                          fill="none"
                        />
                        <circle
                          cx={size / 2}
                          cy={size / 2}
                          r={radius}
                          stroke="oklch(0.78 0.2 155)"
                          strokeWidth={strokeWidth}
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_4px_oklch(0.78_0.2_155/0.5)]"
                          style={{
                            transition:
                              "stroke-dashoffset 0.8s cubic-bezier(.42,0,1,1)",
                          }}
                        />
                      </svg>
                    );
                  })()}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl md:text-3xl font-bold text-foreground">
                      {getSlaPercent(tickets)}%
                    </span>
                    <span className="text-[10px] md:text-xs text-muted-foreground">
                      вчасно
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
