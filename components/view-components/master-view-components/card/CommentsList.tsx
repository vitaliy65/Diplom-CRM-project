import { MessageSquare } from "lucide-react";
import type { Comment } from "@/lib/types";

export function CommentsList({ comments }: { comments: Comment[] }) {
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
          <div className="flex flex-col">
            <span className="font-medium text-xs text-muted-foreground">
              {c.authorName}{" "}
              <span className="font-normal">
                ·{" "}
                {new Date(c.createdAt).toLocaleString("uk-UA", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </span>
            <span className="text-foreground">{c.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
