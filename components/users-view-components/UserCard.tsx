import { MoreVertical, Pencil, Settings, Shield, ShieldCheck, ShieldX, Trash2, Wrench } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { roleLabels, type UserProfile as User } from "@/lib/types"
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

export const roleConfig = {
    admin: { icon: Shield, color: "text-glow-purple", bgColor: "bg-glow-purple/20", dotClass: "bg-glow-purple" },
    manager: { icon: Settings, color: "text-glow-blue", bgColor: "bg-glow-blue/20", dotClass: "bg-glow-blue dot-glow-blue" },
    master: { icon: Wrench, color: "text-glow-green", bgColor: "bg-glow-green/20", dotClass: "bg-glow-green dot-glow-green" },
  }

export function UserCard({
    user,
    index,
    onToggleStatus,
  }: {
    user: User
    index: number
    onToggleStatus: () => void
  }) {
    const config = roleConfig[user.role]
    const Icon = config.icon
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ delay: index * 0.03 }}
        className={cn("bento-card p-4", !user.active && "opacity-60")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  user.active ? "bg-linear-to-br from-primary/30 to-primary/10" : "bg-secondary"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-bold",
                    user.active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
              {user.active && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-glow-green dot-glow-green ring-2 ring-background" />
              )}
            </div>
  
            {/* Info */}
            <div>
              <div className="flex items-center gap-2">
                <p className={cn("font-medium", user.active ? "text-foreground" : "text-muted-foreground")}>
                  {user.name}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    config.bgColor,
                    config.color
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {roleLabels[user.role]}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {user.email}
              </div>
            </div>
          </div>
  
          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Switch checked={user.active} onCheckedChange={onToggleStatus} />
              <span className={cn("text-sm", user.active ? "text-glow-green" : "text-muted-foreground")}>
                {user.active ? "Активний" : "Неактивний"}
              </span>
            </div>
  
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="">
                <DropdownMenuItem>
                  <Pencil className="h-4 w-4 mr-2" />
                  Редагувати
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleStatus}>
                  {user.active ? (
                    <>
                      <ShieldX className="h-4 w-4 mr-2" />
                      Деактивувати
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Активувати
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-glow-red focus:text-glow-red">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Видалити
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    )
  }