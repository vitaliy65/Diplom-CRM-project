"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, Wrench, Package, ReceiptText } from "lucide-react";
import type { Ticket, Service, SpareParts } from "@/lib/types";
import { itemVariants } from "@/components/crm/views/dashboard-view";

type EarnReportProps = {
  tickets: Ticket[];
  services: Service[];
  storage: SpareParts[];
};

const currency = new Intl.NumberFormat("uk-UA", {
  style: "currency",
  currency: "UAH",
  maximumFractionDigits: 0,
});

export function EarnReport({ tickets, services, storage }: EarnReportProps) {
  const report = useMemo(() => {
    const serviceById = new Map(services.map((s) => [s.id, s]));
    const partById = new Map(storage.map((p) => [p.id, p]));

    let servicesEarnings = 0;
    let partsEarnings = 0;
    let earningTickets = 0;

    for (const ticket of tickets) {
      // Only completed tickets count toward earnings.
      const isCompleted =
        ticket.status === "ready" || ticket.status === "delivered";
      if (!isCompleted) continue;

      const hasServices = (ticket.services?.length ?? 0) > 0;
      const hasParts = (ticket.usedParts?.length ?? 0) > 0;

      // Completed tickets without any services AND without any parts are excluded.
      if (!hasServices && !hasParts) continue;

      let ticketServices = 0;
      for (const serviceId of ticket.services ?? []) {
        const service = serviceById.get(serviceId);
        if (service) ticketServices += service.final_price;
      }

      let ticketParts = 0;
      for (const used of ticket.usedParts ?? []) {
        const part = partById.get(used.id);
        if (part) ticketParts += part.priceForOne * used.quantity;
      }

      // Guard against tickets whose services/parts no longer exist.
      if (ticketServices === 0 && ticketParts === 0) continue;

      servicesEarnings += ticketServices;
      partsEarnings += ticketParts;
      earningTickets += 1;
    }

    return {
      total: servicesEarnings + partsEarnings,
      servicesEarnings,
      partsEarnings,
      earningTickets,
    };
  }, [tickets, services, storage]);

  return (
    <motion.div variants={itemVariants} className="col-span-2 md:col-span-12">
      <div className="bento-card p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-4 w-4 md:h-5 md:w-5 text-glow-green" />
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Звіт по заробітку
          </h3>
          <span className="ml-auto text-[10px] md:text-xs text-muted-foreground">
            {report.earningTickets} завершених заявок з оплатою
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {/* Total */}
          <div className="rounded-xl bg-glow-green/10 p-4 flex flex-col gap-1 sm:col-span-1">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-glow-green" />
              <span className="text-xs md:text-sm text-muted-foreground">
                Загальний заробіток
              </span>
            </div>
            <span className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {currency.format(report.total)}
            </span>
          </div>

          {/* Services */}
          <div className="rounded-xl bg-secondary/40 p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-glow-blue" />
              <span className="text-xs md:text-sm text-muted-foreground">
                З послуг
              </span>
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {currency.format(report.servicesEarnings)}
            </span>
          </div>

          {/* Parts */}
          <div className="rounded-xl bg-secondary/40 p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-glow-amber" />
              <span className="text-xs md:text-sm text-muted-foreground">
                Із запчастин
              </span>
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {currency.format(report.partsEarnings)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
