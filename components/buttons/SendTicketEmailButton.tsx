import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { Ticket } from "@/lib/types";

interface SendTicketEmailButtonProps {
  ticket: Ticket;
  clientEmail?: string;
}

export default function SendTicketEmailButton({
  ticket,
  clientEmail,
}: SendTicketEmailButtonProps) {
  const [sending, setSending] = useState(false);

  const hasEmail = Boolean(clientEmail);

  async function handleSend() {
    setSending(true);
    try {
      const res = await fetch("/api/send-ticket-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ticket, clientEmail }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Невідома помилка");
      }

      toast.success(`Лист надіслано на ${clientEmail}`);
    } catch (err) {
      toast.error(
        `Помилка надсилання: ${err instanceof Error ? err.message : "спробуйте ще раз"}`,
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleSend}
          disabled={sending || !hasEmail}
          aria-label="Надіслати email клієнту"
        >
          <Mail className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {!hasEmail
          ? "У клієнта немає email"
          : sending
            ? "Надсилання..."
            : "Надіслати email клієнту"}
      </TooltipContent>
    </Tooltip>
  );
}
