// "09:00:00" -> "9:00 AM"
export function formatClock(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

// Returns null when the branch has no hours saved, so the page can skip the line.
export function formatHours(
  opensAt?: string | null,
  closesAt?: string | null,
): string | null {
  if (!opensAt || !closesAt) return null;
  return `Open daily, ${formatClock(opensAt)} to ${formatClock(closesAt)}`;
}

export function formatPrice(price: number | string): string {
  return `₱${Number(price).toLocaleString("en-PH")}`;
}
