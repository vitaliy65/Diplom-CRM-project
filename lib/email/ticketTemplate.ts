import type { Ticket } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  received: "Прийнято",
  "in-progress": "В роботі",
  ready: "Готово",
  delivered: "Видано",
};

const STATUS_COLORS: Record<string, string> = {
  received: "#6366f1",
  "in-progress": "#f59e0b",
  ready: "#22c55e",
  delivered: "#64748b",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function renderTicketEmail(ticket: Ticket): string {
  const statusLabel = STATUS_LABELS[ticket.status] ?? ticket.status;
  const statusColor = STATUS_COLORS[ticket.status] ?? "#64748b";

  return /* html */ `
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Статус вашої заявки</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:32px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">
                Сервісний центр
              </p>
              <p style="margin:6px 0 0;font-size:14px;color:#94a3b8;">
                Оновлення статусу заявки
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 24px;font-size:16px;color:#334155;">
                Вітаємо, <strong>${ticket.clientName}</strong>!<br/>
                Ваша заявка оновлена. Нижче — актуальна інформація.
              </p>

              <!-- Status badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:${statusColor};color:#fff;padding:8px 20px;border-radius:20px;font-size:14px;font-weight:600;">
                    ${statusLabel}
                  </td>
                </tr>
              </table>

              <!-- Ticket details -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;font-size:14px;">
                ${row("Номер заявки", `#${ticket.id.slice(0, 8).toUpperCase()}`)}
                ${row("Пристрій", ticket.device ?? "—")}
                ${row("Опис проблеми", ticket.problem ?? "—")}
                ${row("Майстер", ticket.masterName ?? "Не призначено")}
                ${row("Дата прийому", formatDate(ticket.createdAt))}
                ${ticket.readyAt ? row("Дата готовності", formatDate(ticket.readyAt)) : ""}
                ${ticket.totalCost ? row("Вартість", `${ticket.totalCost} грн`) : ""}
              </table>

              ${
                ticket.status === "ready"
                  ? notice(
                      "Ваш пристрій готовий! Будь ласка, заберіть його в зручний для вас час.",
                      "#22c55e",
                    )
                  : ""
              }
              ${
                ticket.slaViolation
                  ? notice(
                      "Вибачте за затримку — ми працюємо над вирішенням якнайшвидше.",
                      "#f59e0b",
                    )
                  : ""
              }

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                Цей лист надіслано автоматично — не відповідайте на нього.<br/>
                З питань звертайтесь за телефоном або особисто до сервісного центру.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

function row(label: string, value: string) {
  return /* html */ `
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 16px;color:#64748b;width:40%;background:#f8fafc;">${label}</td>
      <td style="padding:12px 16px;color:#0f172a;font-weight:500;">${value}</td>
    </tr>
  `;
}

function notice(text: string, color: string) {
  return /* html */ `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
      <tr>
        <td style="background:${color}18;border-left:4px solid ${color};padding:14px 16px;border-radius:0 6px 6px 0;font-size:14px;color:#0f172a;">
          ${text}
        </td>
      </tr>
    </table>
  `;
}
