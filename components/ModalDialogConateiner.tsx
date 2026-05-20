import { ReactNode } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "./ui/dialog";
import { cn } from "@/lib/utils";

export default function ModalDialogConateiner({
  children,
  title,
  description,
  className,
}: {
  children: ReactNode;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <DialogContent
      className={cn(
        " border-border/50 w-[calc(100%-2rem)] sm:max-w-md mx-auto",
        className,
      )}
    >
      <DialogHeader>
        <DialogTitle className="text-foreground">{title}</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {description}
        </DialogDescription>
      </DialogHeader>
      {children}
    </DialogContent>
  );
}
