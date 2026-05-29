import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { renderTicketEmail } from "@/lib/email/ticketTemplate";
import type { Ticket } from "@/lib/types";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  const ticket: Ticket = await req.json();

  if (!ticket?.id) {
    return NextResponse.json({ error: "Invalid ticket data" }, { status: 400 });
  }
  if (!ticket.clientEmail) {
    return NextResponse.json(
      { error: "Client has no email address" },
      { status: 400 },
    );
  }

  try {
    await transporter.sendMail({
      from: `"Сервісний центр" <${process.env.GMAIL_USER}>`,
      to: ticket.clientEmail,
      subject: `Заявка #${ticket.id.slice(0, 8).toUpperCase()} — оновлення статусу`,
      html: renderTicketEmail(ticket),
    });
  } catch (err) {
    console.error("[send-ticket-email]", err);
    return NextResponse.json(
      { error: "Не вдалося надіслати лист" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
