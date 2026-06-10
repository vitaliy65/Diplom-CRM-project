"use client";

import { useState, useEffect } from "react";
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
import { useSearchParams } from "next/navigation";

export default function TicketContainerLayout() {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector(selectTickets);
  const clients = useAppSelector(selectClients);
  const searchParams = useSearchParams();

  const [viewStyle, setViewStyle] = useState<TicketViewStyle>("table");
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [saving] = useState(false);

  // Filter tickets by search params, if "id" is found in query
  useEffect(() => {
    const Id = searchParams?.get("id");
    if (Id) {
      const filtered = tickets.filter((t) => t.id === Id);
      dispatch(setFilteredItems({ items: filtered, filterActive: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, tickets, searchParams]);

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
