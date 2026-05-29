import { AlertCircle, CheckCheck, Clock } from "lucide-react";

export type SendStatus = "idle" | "sending" | "sent" | "error";

export function StatusBadge({ status }: { status: SendStatus }) {
  if (status === "sent")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
        <CheckCheck className="h-3 w-3" />
        Надіслано
      </span>
    );
  if (status === "error")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
        <AlertCircle className="h-3 w-3" />
        Помилка
      </span>
    );
  if (status === "sending")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3 animate-spin" />
        Надсилання
      </span>
    );
  return null;
}
