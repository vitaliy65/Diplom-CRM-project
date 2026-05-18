"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Search, Mail, Phone, ClipboardList, Users } from "lucide-react";
import {
  createClient,
  selectClients,
  selectClientsLoading,
} from "@/store/slices/clients-slice";
import { selectTickets } from "@/store/slices/tickets-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Client } from "@/lib/types";
import { CreateClientDialog } from "../../clients-view-components/CreateClientDialog";
import { ClientCard } from "../../clients-view-components/ClientCard";
import { StatusBadge } from "../../tickets-view-components/StatusBadge";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ClientsView() {
  const dispatch = useAppDispatch();
  const clients = useAppSelector(selectClients);
  const tickets = useAppSelector(selectTickets);
  const loading = useAppSelector(selectClientsLoading);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const clientTickets = selectedClient
    ? tickets.filter((t) => t.clientId === selectedClient.id)
    : [];

  return (
    <motion.div
      className="general-view-settings"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-auto max-w-7xl md:pl-16">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Клієнти</h1>
              </div>
              <p className="text-muted-foreground">
                База даних клієнтів сервісного центру
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
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="h-4 w-4" />
                    Новий клієнт
                  </Button>
                </motion.div>
              </DialogTrigger>
              <CreateClientDialog
                onClose={() => setIsCreateDialogOpen(false)}
                onSubmit={async (payload) => {
                  const result = await dispatch(createClient(payload));
                  if (createClient.fulfilled.match(result)) {
                    toast.success("Клієнта додано");
                    setIsCreateDialogOpen(false);
                  } else {
                    toast.error(
                      (result.payload as string) || "Помилка додавання клієнта",
                    );
                  }
                }}
              />
            </Dialog>
          </div>
        </motion.div>
        {loading && (
          <p className="text-sm text-muted-foreground mb-3">
            Завантаження клієнтів...
          </p>
        )}

        {/* Search */}
        <motion.div variants={itemVariants} className="bento-card p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук за ПІБ, телефоном, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>
        </motion.div>

        {/* Clients Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {filteredClients.map((client, index) => (
              <ClientCard
                key={client.id}
                client={client}
                index={index}
                onClick={() => setSelectedClient(client)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredClients.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="bento-card p-8 text-center"
          >
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">Клієнтів не знайдено</p>
            <p className="text-sm text-muted-foreground mt-1">
              Спробуйте змінити параметри пошуку
            </p>
          </motion.div>
        )}

        {/* Client Details Sheet */}
        <Sheet
          open={!!selectedClient}
          onOpenChange={(open) => !open && setSelectedClient(null)}
        >
          <SheetContent className="bg-card border-border/50 w-full sm:max-w-lg overflow-y-auto p-4">
            <SheetHeader>
              <SheetTitle className="text-foreground">
                Профіль клієнта
              </SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Детальна інформація та історія звернень
              </SheetDescription>
            </SheetHeader>
            {selectedClient && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-6"
              >
                {/* Client Info */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/30 to-primary/10 ring-1 ring-primary/20">
                    <span className="text-xl font-bold text-primary">
                      {selectedClient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedClient.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ID: {selectedClient.id}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bento-card p-4 space-y-3">
                  <a
                    href={`tel:${selectedClient.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-secondary/30"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">
                      {selectedClient.phone}
                    </span>
                  </a>
                  <a
                    href={`mailto:${selectedClient.email}`}
                    className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-secondary/30"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-glow-purple/20">
                      <Mail className="h-4 w-4 text-glow-purple" />
                    </div>
                    <span className="text-foreground">
                      {selectedClient.email}
                    </span>
                  </a>
                </div>

                {/* Tickets History */}
                <div>
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    Історія заявок
                  </h4>
                  <div className="space-y-2">
                    {clientTickets.length > 0 ? (
                      clientTickets.map((ticket) => (
                        <div key={ticket.id} className="bento-card p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs text-muted-foreground">
                              {ticket.id}
                            </span>
                            <StatusBadge status={ticket.status} />
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {ticket.device}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {ticket.problem}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Немає заявок
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </motion.div>
  );
}
