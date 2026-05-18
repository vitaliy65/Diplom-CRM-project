"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCog,
  Wrench,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type View = "dashboard" | "tickets" | "clients" | "master" | "users";

interface AppSidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const menuItems = [
  { id: "dashboard" as View, label: "Головна", icon: LayoutDashboard },
  { id: "tickets" as View, label: "Заявки", icon: ClipboardList },
  { id: "clients" as View, label: "Клієнти", icon: Users },
  { id: "master" as View, label: "Майстер", icon: Wrench },
  { id: "users" as View, label: "Користувачі", icon: UserCog },
];

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-screen bg-sidebar border-r border-sidebar-border    ",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-sidebar-border",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            SC
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground text-sm">
                FixFlo
              </span>
              <span className="text-xs text-muted-foreground">CRM System</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {menuItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={currentView === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    collapsed && "justify-center px-2",
                    currentView === item.id &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                  onClick={() => onViewChange(item.id)}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Footer */}
        <div className="p-2 space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10 text-muted-foreground",
                  collapsed && "justify-center px-2",
                )}
              >
                <Settings className="h-5 w-5 shrink-0" />
                {!collapsed && <span>Налаштування</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Налаштування</TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10 text-muted-foreground hover:text-destructive",
                  collapsed && "justify-center px-2",
                )}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!collapsed && <span>Вийти</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Вийти</TooltipContent>}
          </Tooltip>
        </div>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
