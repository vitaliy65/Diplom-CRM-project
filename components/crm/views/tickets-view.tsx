"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, LayoutGrid, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createTicket,
  selectTickets,
  selectTicketsLoading,
} from "@/store/slices/tickets-slice";
import { selectMasters } from "@/store/slices/users-slice";
import { selectClients } from "@/store/slices/clients-slice";
import { KanbanBoard } from "../../tickets-view-components/KanbanBoard";
import { TicketsTable } from "../../tickets-view-components/TicketsTable";
import { CreateTicketDialog } from "../../tickets-view-components/CreateTicketDialog";

export const containerVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    y: [50, 0],
    transition: { staggerChildren: 0.1 },
  },
};

const variantItem = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function TicketsView() {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector(selectTickets);
  const masters = useAppSelector(selectMasters);
  const clients = useAppSelector(selectClients);
  const loading = useAppSelector(selectTicketsLoading);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [masterFilter, setMasterFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.clientPhone.includes(searchQuery) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesMaster =
      masterFilter === "all" || ticket.masterId === masterFilter;

    return matchesSearch && matchesStatus && matchesMaster;
  });

  const selectedTicketId = useAppSelector((s) => s.selectedTicket.id);

  useEffect(() => {
    if (selectedTicketId) {
      const el = document.getElementById("selected-ticket");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedTicketId]);

  return (
    <div className="general-view-settings">
      <div className="mx-auto max-w-7xl md:pl-16 scroll-smooth">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4 md:gap-6 mb-4 md:mb-6"
        >
          <motion.div
            variants={variantItem}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Заявки
              </h1>
              <p className="mt-1 text-sm md:text-base text-muted-foreground">
                Kanban-дошка управління заявками
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Нова заявка
                  </Button>
                </motion.div>
              </DialogTrigger>
              <CreateTicketDialog
                onClose={() => setIsCreateDialogOpen(false)}
                onSubmit={async (payload) => {
                  const missingFields: string[] = [];
                  if (!payload.clientId || payload.clientId.trim() === "")
                    missingFields.push("Клієнт");
                  if (!payload.clientName || payload.clientName.trim() === "")
                    missingFields.push("ПІБ клієнта");
                  if (!payload.clientPhone || payload.clientPhone.trim() === "")
                    missingFields.push("Телефон");
                  if (!payload.device || payload.device.trim() === "")
                    missingFields.push("Пристрій");
                  if (!payload.services || payload.services.length === 0)
                    missingFields.push("Сервіси");

                  if (missingFields.length > 0) {
                    toast.error(
                      `Будь ласка, заповніть усі обов'язкові поля: ${missingFields.join(", ")}`,
                    );
                    return;
                  }

                  const result = await dispatch(createTicket(payload));
                  if (createTicket.fulfilled.match(result)) {
                    toast.success("Заявку збережено");
                    setIsCreateDialogOpen(false);
                  } else {
                    toast.error(
                      (result.payload as string) || "Помилка збереження заявки",
                    );
                  }
                }}
                clients={clients}
              />
            </Dialog>
          </motion.div>

          {/* Filters */}
          <motion.div variants={variantItem} className="bento-card p-3 md:p-4">
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ID, клієнт, телефон..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-border focus:border-primary/50"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-2 md:gap-3 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36 bg-background/50 border-border text-sm">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectItem value="all">Всі статуси</SelectItem>
                    <SelectItem value="received">Прийнято</SelectItem>
                    <SelectItem value="in-progress">В роботі</SelectItem>
                    <SelectItem value="ready">Готово</SelectItem>
                    <SelectItem value="delivered">Видано</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={masterFilter} onValueChange={setMasterFilter}>
                  <SelectTrigger className="w-full sm:w-36 bg-background/50 border-border text-sm">
                    <SelectValue placeholder="Майстер" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectItem value="all">Всі майстри</SelectItem>
                    {masters.map((master) => (
                      <SelectItem key={master.id} value={master.id}>
                        {master.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-1 p-1 bg-background/50 rounded-xl border border-border ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("kanban")}
                    className={cn(
                      "rounded-lg h-8 w-8 p-0",
                      viewMode === "kanban" && "bg-primary/20 text-primary",
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className={cn(
                      "rounded-lg h-8 w-8 p-0",
                      viewMode === "table" && "bg-primary/20 text-primary",
                    )}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="text-sm text-muted-foreground">
            Завантаження заявок...
          </div>
        ) : null}
        {!loading &&
          (viewMode === "kanban" ? (
            <KanbanBoard key="kanban" tickets={filteredTickets} />
          ) : (
            <TicketsTable key="table" tickets={filteredTickets} />
          ))}
      </div>
    </div>
  );
}
