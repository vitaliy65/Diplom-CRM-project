import { ViewType } from "@/static/MenuItems";
import { useAppDispatch } from "@/store/hooks";
import { setSelectedClientId } from "@/store/slices/selected-client-slice";
import { setSelectedPartId } from "@/store/slices/selected-parts-slice";
import { setSelectedServiceId } from "@/store/slices/selected-service-slice";
import { setActiveView, setSelectedId } from "@/store/slices/view-slice";
import { useRouter } from "next/navigation";
import { statusLabels, TicketStatus } from "@/lib/types";
import { motion } from "framer-motion";
import { setSelectedMasterId } from "@/store/slices/selected-master-slice";
import { setSelectedTicketId } from "@/store/slices/selected-ticket-slice";
import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TableViewBoxI {
  headers: string[];
  data: TableRow[][];
  onRowClick: (rowIdx: number) => void;
  onDeleteRows?: (rowIndices: number[]) => void | Promise<void>;
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
function TableHeader({
  headers,
  selectable,
  allSelected,
  someSelected,
  onToggleAll,
}: {
  headers: string[];
  selectable: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
}) {
  return (
    <thead>
      <tr className="bg-muted text-sm text-muted-foreground">
        {selectable && (
          <th className="py-2 px-3 w-10 border-b border-r border-border">
            <Checkbox
              checked={
                allSelected ? true : someSelected ? "indeterminate" : false
              }
              onCheckedChange={onToggleAll}
              aria-label="Вибрати всі рядки"
            />
          </th>
        )}
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
        <a
          key={id}
          className="table-link text-sm px-2 py-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(setActiveView(viewType));
            dispatch(setSelectedId(id));

            // Добавить id в query (вручную с строкой, чтобы соответствовать типу)
            router.push(`./${viewType}?id=${encodeURIComponent(id)}`);
          }}
        >
          {labelText}
        </a>
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
  rowIdx,
  onRowClick,
  selectable,
  selected,
  onToggleRow,
}: {
  row: TableRow[];
  headers: string[];
  rowIdx: number;
  onRowClick: (rowIdx: number) => void;
  selectable: boolean;
  selected: boolean;
  onToggleRow: (rowIdx: number) => void;
}) {
  // Если row.length меньше headers.length — дополняем прочерками
  const completedRow: TableRow[] = [
    ...row,
    ...Array.from({ length: headers.length - row.length }, () => ({
      text: "-",
    })),
  ].slice(0, headers.length);

  return (
    <motion.tr
      key={`row-${rowIdx}`}
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        transition: { delay: 0.045 * rowIdx, duration: 0.1 },
      }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.1 },
      }}
      className={
        "cursor-pointer transition-color " +
        (selected ? "bg-primary/15" : "hover:bg-primary/10")
      }
      onClick={() => onRowClick(rowIdx)}
      viewport={{ once: true }}
    >
      {selectable && (
        <td
          className="py-1 px-3 w-10 border-b border-r border-border"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleRow(rowIdx)}
            aria-label={`Вибрати рядок ${rowIdx + 1}`}
          />
        </td>
      )}
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
              "py-1 px-2 text-sm border-b border-border whitespace-nowrap" +
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
    </motion.tr>
  );
}

export default function TableViewBox({
  headers,
  data,
  onRowClick,
  onDeleteRows,
}: TableViewBoxI) {
  const selectable = typeof onDeleteRows === "function";

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Сигнатура содержимого таблицы. При смене страницы / фильтра / после
  // удаления данные меняются — сбрасываем выбор, чтобы индексы не «протухали».
  const dataSignature = useMemo(
    () =>
      data
        .map((row) =>
          row
            .map((c) => c.text || c.obj?.map((o) => o.id).join("|") || "")
            .join("~"),
        )
        .join("¦"),
    [data],
  );

  useEffect(() => {
    setSelected(new Set());
  }, [dataSignature]);

  const allSelected = data.length > 0 && selected.size === data.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(data.map((_, idx) => idx)));
  };

  const toggleRow = (rowIdx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(rowIdx)) next.delete(rowIdx);
      else next.add(rowIdx);
      return next;
    });
  };

  const handleConfirmDelete = async () => {
    if (!onDeleteRows || selected.size === 0) return;
    setDeleting(true);
    try {
      await onDeleteRows([...selected].sort((a, b) => a - b));
      setSelected(new Set());
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const totalColumns = headers.length + (selectable ? 1 : 0);

  return (
    <div className="flex flex-col gap-2">
      {selectable && selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 bento-card hover:scale-none! px-4 py-2">
          <span className="text-sm font-medium">Вибрано: {selected.size}</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Видалити вибране
          </Button>
        </div>
      )}

      <div className="overflow-auto bento-card hover:scale-none!">
        <table className="min-w-full divide-y divide-border">
          <TableHeader
            headers={headers}
            selectable={selectable}
            allSelected={allSelected}
            someSelected={someSelected}
            onToggleAll={toggleAll}
          />
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  className="py-4 px-3 text-center text-muted-foreground"
                  colSpan={totalColumns}
                >
                  Даних не знайдено
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <TableRowComponent
                  key={idx}
                  row={row}
                  headers={headers}
                  rowIdx={idx}
                  onRowClick={onRowClick}
                  selectable={selectable}
                  selected={selected.has(idx)}
                  onToggleRow={toggleRow}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectable && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Видалити вибрані записи?</AlertDialogTitle>
              <AlertDialogDescription>
                Буде видалено {selected.size}{" "}
                {selected.size === 1 ? "запис" : "записів"}. Цю дію неможливо
                скасувати.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                Скасувати
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmDelete();
                }}
                disabled={deleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {deleting ? "Видалення..." : "Видалити"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
