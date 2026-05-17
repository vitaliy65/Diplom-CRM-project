/**
 * Преобразует дату createdAt (Date|string|number) в удобочитаемый формат времени (дні, год, хв) с момента создания до текущего времени.
 *
 * @param createdAt - время создания (Date|string|number)
 * @returns строка, например: "2 дні 5 год 12 хв"
 */
export function toReadableTime(createdAt: Date | string | number): string {
  const created =
    typeof createdAt === "number" ? createdAt : new Date(createdAt).getTime();
  const now = Date.now();

  let ms = now - created;

  // Если ms больше, чем несколько тысяч лет — вероятно, ошибка
  if (!isFinite(ms) || ms < 0 || ms > 1000 * 60 * 60 * 24 * 365 * 50) return "";

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  ms -= days * 1000 * 60 * 60 * 24;
  const hours = Math.floor(ms / (1000 * 60 * 60));
  ms -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(ms / (1000 * 60));

  let result = [];
  if (days > 0) result.push(days + " дн" + (days === 1 ? "ь" : "і"));
  if (hours > 0) result.push(hours + " год");
  if (minutes > 0 || result.length === 0) result.push(minutes + " хв");

  return result.join(" ");
}
