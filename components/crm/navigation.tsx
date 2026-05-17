"use client";

import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Wrench,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNavButton } from "../navigation/sidebar-components/SidebarNavButton";
import { LogoutButton } from "../navigation/sidebar-components/LogoutButton";
import { MobileBottomNavItem } from "../navigation/sidebar-components/MobileBottomNavItem";
import { MobileOverlayNavItem } from "../navigation/sidebar-components/MobileOverlayNavItem";

interface FloatingSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  userRole: string;
  onLogout: () => void;
}

const menuItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Дашборд",
    roles: ["admin", "manager"],
  },
  { id: "tickets", icon: Ticket, label: "Заявки", roles: ["admin", "manager"] },
  { id: "clients", icon: Users, label: "Клієнти", roles: ["admin", "manager"] },
  {
    id: "master",
    icon: Wrench,
    label: "Майстер",
    roles: ["admin", "manager", "master"],
  },
  { id: "users", icon: Settings, label: "Адмін", roles: ["admin"] },
];

export function FloatingSidebar({
  activeView,
  onViewChange,
  userRole,
  onLogout,
}: FloatingSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(userRole),
  );

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        className="fixed left-4 top-1/2 z-50 -translate-y-1/2 hidden md:block"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <motion.nav
          className="bg-card rounded-2xl p-2 flex flex-col gap-1"
          animate={{ width: isExpanded ? 180 : 56 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {filteredItems.map((item) => (
            <SidebarNavButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeView === item.id}
              expanded={isExpanded}
              onClick={() => onViewChange(item.id)}
            />
          ))}

          <div className="my-2 h-px bg-border/50" />

          <LogoutButton expanded={isExpanded} onClick={onLogout} />
        </motion.nav>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="glass border-t border-border/50 px-2 py-2 safe-area-bottom">
          <div className="flex items-center justify-around">
            {filteredItems.slice(0, 4).map((item) => (
              <MobileBottomNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeView === item.id}
                onClick={() => onViewChange(item.id)}
              />
            ))}
            {filteredItems.length > 4 && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-muted-foreground"
                type="button"
              >
                <div className="rounded-lg p-1.5">
                  <Menu className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium">Більше</span>
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-61 glass rounded-t-3xl p-4 safe-area-bottom md:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Меню</h3>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-secondary/50"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <MobileOverlayNavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={activeView === item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                ))}
                <div className="my-2 h-px bg-border/50" />
                <LogoutButton
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-destructive hover:bg-destructive/10"
                />
              </div>
            </motion.div>
          </Fragment>
        )}
      </AnimatePresence>
    </>
  );
}
