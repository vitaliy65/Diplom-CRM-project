export function CheckTicketFields(payload: any): string[] {
  const missingFields: string[] = [];
  if (!payload.clientId || payload.clientId.trim() === "")
    missingFields.push("Клієнт");
  if (!payload.clientName || payload.clientName.trim() === "")
    missingFields.push("ПІБ клієнта");
  if (!payload.clientPhone || payload.clientPhone.trim() === "")
    missingFields.push("Телефон");
  if (!payload.device || payload.device.trim() === "")
    missingFields.push("Пристрій");
  if (!payload.services || payload.services.length === 0)
    missingFields.push("Сервіси");
  return missingFields;
}
