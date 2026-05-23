import { ViewType } from "@/static/MenuItems";
import { useAppDispatch } from "@/store/hooks";
import { setSelectedClientId } from "@/store/slices/selected-client-slice";
import { setSelectedPartId } from "@/store/slices/selected-parts-slice";
import { setSelectedServiceId } from "@/store/slices/selected-service-slice";
import { setActiveView } from "@/store/slices/view-slice";
import { useRouter } from "next/navigation";
import { statusLabels, TicketStatus } from "@/lib/types"; // for status rendering

interface TableViewBoxI {
  headers: string[];
  data: TableRow[][];
}

export interface TableRow {
  text: string;
  obj?: { labelText: string; id: string; viewType: ViewType }[];
}

// Status UI map for nice colored status rendering
const statusColorClass: Record<TicketStatus, string> = {
  received: "bg-status-received/35 text-foreground/75",
  "in-progress": "bg-status-in-progress/35 text-foreground/75",
  ready: "bg-status-ready/35 text-foreground/75",
  delivered: "bg-status-delivered/35 text-foreground/75",
};

// Renders status badge (for status field)
function RenderStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={
        `inline-block rounded-xl px-3 py-1 font-semibold text-xs shadow-sm border border-border whitespace-nowrap ` +
        statusColorClass[status]
      }
    >
      {statusLabels[status]}
    </span>
  );
}

// TableHeader с вертикальными перегородками (border-r)
function TableHeader({ headers }: { headers: string[] }) {
  return (
    <thead>
      <tr className="bg-muted text-sm text-muted-foreground">
        {headers.map((header, idx) => (
          <th
            key={idx}
            className={
              "py-2 px-3 font-semibold text-left border-b border-border" +
              (idx !== headers.length - 1 ? " border-r border-border" : "")
            }
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

// Генерируем div с несколькими span с синим фоном
function RenderObjLabel({
  obj,
}: {
  obj: { labelText: string; id: string; viewType: ViewType }[];
}) {
  const dispatch = useAppDispatch();
  const router = useRouter(); // Using useRouter for navigation

  return (
    <div className="flex flex-wrap gap-1">
      {obj.map(({ labelText, id, viewType }, idx) => (
        <span
          key={id}
          className="bento-card text-xs px-2 py-1 cursor-pointer"
          onClick={() => {
            switch (viewType) {
              case "clients":
                dispatch(setActiveView("clients"));
                dispatch(setSelectedClientId(id));
                break;
              case "master":
                break;
              case "services":
                dispatch(setActiveView("services"));
                dispatch(setSelectedServiceId(id));
                break;
              case "storage":
                dispatch(setActiveView("storage"));
                dispatch(setSelectedPartId(id));
                break;
            }
            router.push(`./${viewType}`);
          }}
        >
          {labelText}
        </span>
      ))}
    </div>
  );
}

// функция проверки, поле ли это статус
function isStatusField(header: string) {
  // Можно поменять на ваш реальный кейс если имя может быть иное
  return ["Статус", "status"].some(
    (val) =>
      val.toLowerCase() === header.toLowerCase() ||
      header.toLowerCase().includes("статус"),
  );
}

// TableRow с вертикальными перегородками (border-r)
function TableRowComponent({
  row,
  headers,
}: {
  row: TableRow[];
  headers: string[];
}) {
  // Если row.length меньше headers.length — дополняем прочерками
  const completedRow: TableRow[] = [
    ...row,
    ...Array.from({ length: headers.length - row.length }, () => ({
      text: "-",
    })),
  ].slice(0, headers.length);

  return (
    <tr className="hover:bg-accent transition-colors">
      {completedRow.map((cell, idx) => {
        const hasValue =
          typeof cell.text === "string" && cell.text.trim() !== "";
        const thisHeader = headers[idx];
        // если это поле статуса и оно валидно
        const isStatus = isStatusField(thisHeader);
        const isKnownStatus =
          isStatus &&
          hasValue &&
          (
            ["received", "in-progress", "ready", "delivered"] as string[]
          ).includes(cell.text);

        return (
          <td
            key={idx}
            className={
              "py-2 px-3 text-sm border-b border-border whitespace-nowrap" +
              (idx !== headers.length - 1 ? " border-r border-border" : "")
            }
          >
            {/* Если есть obj - показываем его, иначе если статус - кастомно, иначе текст */}
            {cell.obj && cell.obj.length > 0 ? (
              <RenderObjLabel obj={cell.obj} />
            ) : isStatus && isKnownStatus ? (
              <RenderStatusBadge status={cell.text as TicketStatus} />
            ) : hasValue ? (
              cell.text
            ) : (
              "-"
            )}
          </td>
        );
      })}
    </tr>
  );
}

export default function TableViewBox({ headers, data }: TableViewBoxI) {
  return (
    <div className="overflow-auto border rounded-lg shadow bg-card">
      <table className="min-w-full divide-y divide-border">
        <TableHeader headers={headers} />
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                className="py-4 px-3 text-center text-muted-foreground"
                colSpan={headers.length}
              >
                Даних не знайдено
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <TableRowComponent key={idx} row={row} headers={headers} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
