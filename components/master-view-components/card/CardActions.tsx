import { MessageSquare } from "lucide-react";
import { TicketStatus } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "react-day-picker";

export function CardActions({
  status,
  onStatusChange,
  comment,
  setComment,
}: {
  status: TicketStatus;
  onStatusChange: (status: TicketStatus) => void;
  comment: string;
  setComment: (c: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Статус:</span>
        <Select
          value={status}
          onValueChange={(v) => onStatusChange(v as TicketStatus)}
        >
          <SelectTrigger className="flex-1 bg-secondary/50 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in-progress">В роботі</SelectItem>
            <SelectItem value="ready">Готово</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        placeholder="Додати коментар..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[80px] bg-secondary/50 border-border/50"
      />

      <Button
        className="w-full bg-primary hover:bg-primary/90 gap-2"
        disabled={!comment.trim()}
      >
        <MessageSquare className="h-4 w-4" />
        Додати коментар
      </Button>
    </div>
  );
}
