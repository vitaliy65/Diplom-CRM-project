import {
  LayoutDashboard,
  Mail,
  Settings,
  ShieldUser,
  Ticket,
  UserCog,
  Users,
  Warehouse,
  WrenchIcon,
} from "lucide-react";

export type ViewType =
  | "dashboard"
  | "tickets"
  | "send-email"
  | "clients"
  | "services"
  | "storage"
  | "master"
  | "users"
  | "settings";

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
    id: "send-email",
    url: "/send-email",
    icon: Mail,
    label: "пошта",
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
    id: "services",
    url: "/services",
    icon: WrenchIcon,
    label: "Сервіси",
    roles: ["admin", "manager"],
  },
  {
    id: "storage",
    url: "/storage",
    icon: Warehouse,
    label: "Склад",
    roles: ["admin", "manager"],
  },
  {
    id: "master",
    url: "/master",
    icon: UserCog,
    label: "Майстер",
    roles: ["master"],
  },
  {
    id: "users",
    url: "/users",
    icon: ShieldUser,
    label: "Адмін",
    roles: ["admin"],
  },
  {
    id: "settings",
    url: "/settings",
    icon: Settings,
    label: "Налаштування",
    roles: ["admin", "manager", "master"],
  },
];
