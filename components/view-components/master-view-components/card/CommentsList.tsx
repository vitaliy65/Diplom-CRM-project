import { MessageSquare } from "lucide-react";

export function CommentsList({ comments }: { comments: string[] }) {
  if (!comments.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Коментарі:</p>
      {comments.map((c, i) => (
        <div
          key={i}
          className="flex items-start gap-2 rounded-xl bg-secondary/30 p-3 text-sm"
        >
          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-foreground">{c}</span>
        </div>
      ))}
    </div>
  );
}
