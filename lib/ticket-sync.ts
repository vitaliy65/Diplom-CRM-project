import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Client, Ticket, UserProfile, UsedPartsTicket } from "@/lib/types";

/** Гарантує масиви та рядки для старих/неповних документів у Firestore */
export function normalizeTicketFromFirestore(
  id: string,
  raw: Partial<Ticket>,
): Ticket {
  return {
    id,
    clientId: raw.clientId ?? "",
    clientName: raw.clientName ?? "",
    clientPhone: raw.clientPhone ?? "",
    device: raw.device ?? "",
    problem: raw.problem ?? "",
    status: raw.status ?? "received",
    masterId: raw.masterId ?? null,
    masterName: raw.masterName ?? null,
    createdAt: raw.createdAt ?? "",
    readyAt: raw.readyAt ?? "",
    slaViolation: Boolean(raw.slaViolation),
    comments: Array.isArray(raw.comments) ? raw.comments : [],
    services: Array.isArray(raw.services) ? raw.services : [],
    usedParts: Array.isArray(raw.usedParts)
      ? (raw.usedParts as UsedPartsTicket[])
      : [],
  };
}

export function resolveTicketSnapshots(
  data: Partial<Ticket>,
  clients: Client[],
  masters: UserProfile[],
): Partial<Ticket> {
  const client = data.clientId
    ? clients.find((c) => c.id === data.clientId)
    : undefined;
  const master = data.masterId
    ? masters.find((m) => m.id === data.masterId)
    : undefined;

  return {
    ...data,
    clientName: client?.name ?? data.clientName ?? "",
    clientPhone: client?.phone ?? data.clientPhone ?? "",
    masterName: data.masterId
      ? (master?.name ?? data.masterName ?? null)
      : null,
    masterId:
      data.masterId && String(data.masterId).trim() !== ""
        ? data.masterId
        : null,
  };
}

export async function syncTicketsForClient(
  clientId: string,
  patch: { clientName?: string; clientPhone?: string },
): Promise<void> {
  if (!db) return;
  const q = query(collection(db, "tickets"), where("clientId", "==", clientId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.update(d.ref, patch));
  await batch.commit();
}

export async function syncTicketsForMaster(
  masterId: string,
  masterName: string,
): Promise<void> {
  if (!db) return;
  const q = query(collection(db, "tickets"), where("masterId", "==", masterId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.update(d.ref, { masterName }));
  await batch.commit();
}

export function countTicketsForClient(
  tickets: Ticket[],
  clientId: string,
): number {
  return tickets.filter((t) => t.clientId === clientId).length;
}

export async function setClientTicketCount(
  clientId: string,
  count: number,
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(collection(db, "clients"), clientId), {
    ticketCount: Math.max(0, count),
  });
}
