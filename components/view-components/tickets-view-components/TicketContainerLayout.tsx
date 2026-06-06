"use client";

import { useState } from "react";
import { CreateTicketDialog } from "./CreateTicketDialog";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectClients } from "@/store/slices/clients-slice";
import TopViewButtons from "@/components/buttons/TopViewButtons";
import { selectTickets, setFilteredItems } from "@/store/slices/tickets-slice";
import { ticketConfig } from "@/filters";
import type { Ticket } from "@/lib/types";
import { EditTicketDialog } from "./EditTicketDialog";
import { ticketsExportConfig } from "@/lib/csv/Exportconfigs";
import ViewStyleSwitch, { type TicketViewStyle } from "./ViewStyleSwitch";
import TicketTableView from "./TicketTableView";
import KanbanBoard from "./kanban/KanbanBoard";

export default function TicketContainerLayout() {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector(selectTickets);
  const clients = useAppSelector(selectClients);

  const [viewStyle, setViewStyle] = useState<TicketViewStyle>("table");
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [saving] = useState(false);

  const handleRowClick = (ticketId?: string) => {
    if (!ticketId) return;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) setEditingTicket(ticket);
  };

  return (
    <div className="container-layout">
      <TopViewButtons
        ChildrenCreateDialog={<CreateTicketDialog clients={clients} />}
        data={tickets}
        filterConfig={ticketConfig}
        onSort={(result, filterActive) =>
          dispatch(setFilteredItems({ items: result, filterActive }))
        }
        exportSelector={ticketsExportConfig.selector}
        exportOptions={ticketsExportConfig.options}
      />

      <div className="flex justify-end">
        <ViewStyleSwitch value={viewStyle} onChange={setViewStyle} />
      </div>

      {viewStyle === "table" ? (
        <TicketTableView onRowClick={handleRowClick} />
      ) : (
        <KanbanBoard onCardClick={setEditingTicket} />
      )}

      <EditTicketDialog
        editingTicket={editingTicket}
        setEditingTicket={setEditingTicket}
        saving={saving}
      />
    </div>
  );
}
