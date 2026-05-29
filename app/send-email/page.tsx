"use client";
import { motion, AnimatePresence } from "framer-motion";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Mail,
  Send,
  CheckCheck,
  AlertCircle,
  Clock,
  Search,
  X,
  ChevronRight,
  Inbox,
  Check,
} from "lucide-react";
import ViewContainer from "@/components/static/ViewContainer";
import { StatusBadge } from "@/components/view-components/send-email-view-components/StatusBadge";
import { StatCard } from "@/components/view-components/send-email-view-components/StatCard";
import { getInitials } from "@/lib/utils";
import { formatDate } from "@/lib/time";
import { useBroadcastEmail } from "@/hooks/useBroadcastEmail";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BroadcastPage() {
  const {
    search,
    setSearch,
    rows,
    filtered,
    selected,
    toggleSelect,
    validInFiltered,
    allFilteredSelected,
    toggleAll,
    validSelected,
    isSendingAll,
    handleSendSelected,
    handleSendOne,
    stats,
  } = useBroadcastEmail();

  function SendAllButton() {
    return (
      <button
        onClick={handleSendSelected}
        disabled={isSendingAll || validSelected === 0}
        className="inline-flex max-md:w-full justify-center items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-40"
      >
        {isSendingAll ? (
          <>
            <Clock className="h-4 w-4 animate-spin" />
            Надсилання…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Надіслати вибраним
            {validSelected > 0 && (
              <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">
                {validSelected}
              </span>
            )}
          </>
        )}
      </button>
    );
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <ViewContainer
        title="Розсилка"
        description="Сповістіть клієнтів про готові пристрої"
        rightButton={<SendAllButton />}
      >
        {/* ── Stats ── */}
        <div className="mb-6 w-full grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Готові заявки"
            value={stats.total}
            icon={<Inbox className="h-4 w-4" />}
          />
          <StatCard
            label="Є email"
            value={stats.withEmail}
            icon={<Mail className="h-4 w-4" />}
            variant="accent"
          />
          <StatCard
            label="Надіслано"
            value={stats.sent}
            icon={<CheckCheck className="h-4 w-4" />}
            variant="success"
          />
          <StatCard
            label="Без email"
            value={stats.noEmail}
            icon={<AlertCircle className="h-4 w-4" />}
            variant={stats.noEmail > 0 ? "warn" : "default"}
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="mb-3 w-full flex flex-wrap items-center gap-3">
          <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground max-w-sm">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук за клієнтом, пристроєм…"
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {validInFiltered.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {allFilteredSelected ? "Зняти всі" : "Вибрати всі"}
            </button>
          )}
        </div>

        {/* ── List ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border py-16 w-full h-full">
            <Inbox className="h-9 w-9 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {rows.length === 0
                ? "Немає заявок зі статусом «Готово»"
                : "Нічого не знайдено"}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden w-full rounded-xl border border-border bg-background">
            <AnimatePresence initial={false}>
              {filtered.map(({ ticket, status }, idx) => {
                const isSelected = selected.has(ticket.id);
                const isEmailDelivered = ticket.isEmailDelivered;
                const hasEmail = Boolean(ticket.clientEmail);
                const initials = getInitials(ticket.clientName ?? "?");
                const isLast = idx === filtered.length - 1;

                return (
                  <motion.div
                    key={ticket.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className={[
                      "flex  items-center gap-3 px-4 py-3.5 transition-colors",
                      !isLast && "border-b border-border",
                      isSelected && hasEmail && "bg-primary/3",
                      !hasEmail && "opacity-50",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {/* Checkbox */}
                    <Checkbox.Root
                      checked={isSelected && hasEmail}
                      onCheckedChange={() =>
                        hasEmail && toggleSelect(ticket.id)
                      }
                      disabled={!hasEmail || isEmailDelivered}
                      aria-label={isSelected ? "Зняти вибір" : "Вибрати"}
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border border-border bg-background transition-colors data-[state=checked]:border-foreground data-[state=checked]:bg-foreground disabled:cursor-not-allowed"
                    >
                      <Checkbox.Indicator>
                        <Check
                          className="h-2.5 w-2.5 text-background"
                          strokeWidth={3}
                        />
                      </Checkbox.Indicator>
                    </Checkbox.Root>

                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold tracking-wide bg-amber-400/50`}
                    >
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium">
                          {ticket.clientName}
                        </span>
                        {ticket.device && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            {ticket.device}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1">
                        {hasEmail ? (
                          <>
                            <Mail className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="truncate text-xs text-muted-foreground">
                              {ticket.clientEmail}
                            </span>
                          </>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            Email не вказано
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <span className="hidden text-xs text-muted-foreground md:block">
                      {formatDate(ticket.createdAt)}
                    </span>

                    {/* Action */}
                    <div className="shrink-0">
                      {status !== "idle" ? (
                        <StatusBadge status={status} />
                      ) : hasEmail ? (
                        isEmailDelivered ? (
                          <div className="flex h-7 w-7 items-center justify-center">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-500">
                              <Check
                                className="h-4 w-4 text-white"
                                strokeWidth={3}
                              />
                            </span>
                          </div>
                        ) : (
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button
                                onClick={() => handleSendOne(ticket)}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content
                                className="rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md"
                                sideOffset={5}
                              >
                                Надіслати цьому клієнту
                                <Tooltip.Arrow className="fill-foreground" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        )
                      ) : (
                        <div className="h-7 w-7" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </ViewContainer>
    </Tooltip.Provider>
  );
}
