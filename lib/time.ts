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

/**
 * Преобразует дату в полный читаемый формат даты и времени, например: "21.04.2024, 14:22:10"
 * @param date - дата (Date|string|number)
 * @returns строка полного времени и даты
 */
export function toFullDateTime(date: Date | string | number): string {
  let d: Date;

  if (typeof date === "number") {
    d = new Date(date);
  } else if (typeof date === "string") {
    d = new Date(date);
  } else {
    d = date;
  }

  if (isNaN(d.getTime())) return "";

  // Формат: "дд.мм.гггг, чч:мм:сс"
  const pad = (num: number) => num.toString().padStart(2, "0");

  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
}
