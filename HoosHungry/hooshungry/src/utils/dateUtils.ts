/**
 * Format a Date as YYYY-MM-DD in the local timezone.
 *
 * IMPORTANT: Do NOT use `date.toISOString().split("T")[0]` — that returns
 * the UTC date, which can be a day ahead/behind the user's local date
 * depending on their timezone and the time of day.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
