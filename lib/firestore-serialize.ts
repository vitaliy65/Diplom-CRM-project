/**
 * Утиліти для перетворення даних Firestore у серіалізовані (plain) значення,
 * придатні для зберігання в Redux store.
 *
 * Firestore повертає поля типу `createdAt` як обʼєкти Timestamp
 * ({ seconds, nanoseconds } або з методом toDate()). Такі значення є
 * несеріалізованими і викликають попередження Redux:
 * "A non-serializable value was detected in the state".
 */

type FirestoreTimestampLike = {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
};

/** Перевіряє, чи значення схоже на Firestore Timestamp. */
function isTimestampLike(value: unknown): value is FirestoreTimestampLike {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (typeof v.toDate === "function") ||
    (typeof v.seconds === "number" && typeof v.nanoseconds === "number")
  );
}

/** Перетворює Firestore Timestamp (або сумісне значення) у ISO-рядок. */
export function timestampToIso(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Date(value).toISOString();
  if (isTimestampLike(value)) {
    if (typeof value.toDate === "function") {
      return value.toDate().toISOString();
    }
    return new Date(value.seconds * 1000).toISOString();
  }
  return "";
}

/**
 * Рекурсивно перетворює всі несеріалізовані значення (Timestamp) у звичайні
 * рядки. Повертає копію даних, придатну для збереження в Redux.
 */
export function serializeFirestore<T>(input: T): T {
  if (input === null || input === undefined) return input;

  if (isTimestampLike(input)) {
    return timestampToIso(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => serializeFirestore(item)) as unknown as T;
  }

  if (typeof input === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      result[key] = serializeFirestore(value);
    }
    return result as T;
  }

  return input;
}

/**
 * Нормалізує масив сервісів заявки до масиву рядкових ID.
 * У Firestore трапляються як рядки (ID), так і повні обʼєкти сервісу.
 */
export function normalizeServiceIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "id" in item) {
        return String((item as { id: unknown }).id ?? "");
      }
      return "";
    })
    .filter((id) => id.length > 0);
}
