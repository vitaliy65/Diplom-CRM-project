import { LayoutDashboard, Settings, Ticket, Users, Wrench } from "lucide-react";

export const menuItems = [
  {
    id: "dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    label: "Дашборд",
    roles: ["admin", "manager"],
  },
  {
    id: "tickets",
    url: "/tickets",
    icon: Ticket,
    label: "Заявки",
    roles: ["admin", "manager"],
  },
  {
    id: "clients",
    url: "/clients",
    icon: Users,
    label: "Клієнти",
    roles: ["admin", "manager"],
  },
  {
    id: "master",
    url: "/master",
    icon: Wrench,
    label: "Майстер",
    roles: ["admin", "manager", "master"],
  },
  {
    id: "users",
    url: "/users",
    icon: Settings,
    label: "Адмін",
    roles: ["admin"],
  },
];
