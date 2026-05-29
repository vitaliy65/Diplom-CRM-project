import { z } from "zod";
import { Comment } from "@/lib/types";

const usedPartSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
});

export const createTicketSchema = z.object({
  clientId: z.string().min(1, "Оберіть клієнта"),
  clientEmail: z.string().email("Некоректний email"),
  clientName: z.string().min(1, "ПІБ клієнта обов'язкове"),
  clientPhone: z.string().min(1, "Телефон обов'язковий"),
  device: z.string().min(1, "Пристрій обов'язковий"),
  problem: z.string().optional().default(""),
  services: z.array(z.string()).min(1, "Оберіть хоча б один сервіс"),
  usedParts: z.array(usedPartSchema).default([]),
  isEmailDelivered: z.boolean().default(false),
});

export const updateTicketSchema = createTicketSchema.partial().extend({
  status: z.enum(["received", "in-progress", "ready", "delivered"]).optional(),
  isEmailDelivered: z.boolean().optional(),
  masterId: z.string().nullable().optional(),
  masterName: z.string().nullable().optional(),
  services: z.array(z.string()).optional(),
  usedParts: z.array(usedPartSchema).optional(),
  comments: z.array(z.custom<Comment>()).optional(),
  createdAt: z.string().optional(),
  readyAt: z.string().optional(),
});

/** Поля форми редагування заявки (панель послуг/запчастин) */
export const editTicketPanelSchema = z.object({
  status: z.enum(["received", "in-progress", "ready", "delivered"]).optional(),
  masterId: z.string().nullable().optional(),
  masterName: z.string().nullable().optional(),
  services: z.array(z.string()).default([]),
  usedParts: z.array(usedPartSchema).default([]),
});

export const clientSchema = z.object({
  name: z.string().min(2, "ПІБ має містити щонайменше 2 символи"),
  phone: z.string().min(10, "Некоректний телефон"),
  email: z.string().email("Некоректний email").or(z.literal("")),
});

export const sparePartSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  description: z.string().default(""),
  count: z.coerce.number().int().min(0, "Кількість не може бути від'ємною"),
  priceForOne: z.coerce.number().min(0, "Ціна не може бути від'ємною"),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  base_price: z.coerce.number().min(0),
  final_price: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type SparePartInput = z.infer<typeof sparePartSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
