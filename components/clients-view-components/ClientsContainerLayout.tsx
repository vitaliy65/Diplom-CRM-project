"use client";

import TableViewBox from "../static/TableViewBox";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectPaginatedClients,
  selectClientsTotalRows,
  selectClientsCurrentPage,
  selectClientsRowsPerPage,
  setCurrentPage,
  setRowsPerPage,
} from "@/store/slices/clients-slice";
import TopViewButtons from "../buttons/TopViewButtons";
import ShowTablePage from "../static/ShowTablePage";
import type { Client } from "@/lib/types";
import { CreateClientDialog } from "./CreateClientDialog";

// порядок отображения полей таблицы клиентов
const CLIENT_COLUMNS: Array<keyof Client> = [
  "name",
  "email",
  "phone",
  "ticketCount",
];

export default function ClientsContainerLayout() {
  const dispatch = useAppDispatch();

  const clients = useAppSelector(selectPaginatedClients);
  const totalRows = useAppSelector(selectClientsTotalRows);
  const currentPage = useAppSelector(selectClientsCurrentPage);
  const rowsPerPage = useAppSelector(selectClientsRowsPerPage);

  const headers = CLIENT_COLUMNS as string[];

  const data = clients.map((client) =>
    headers.map((key) => ({
      text:
        client[key as keyof Client] == null
          ? ""
          : String(client[key as keyof Client]),
    })),
  );

  return (
    <div className="flex h-full flex-col flex-1 gap-4">
      <TopViewButtons ChildrenCreateDialog={<CreateClientDialog />} />
      <TableViewBox headers={headers} data={data} />
      <ShowTablePage
        totalRows={totalRows}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onChangePage={(page) => dispatch(setCurrentPage(page))}
        onChangeRowsPerPage={(n) => dispatch(setRowsPerPage(n))}
      />
    </div>
  );
}
