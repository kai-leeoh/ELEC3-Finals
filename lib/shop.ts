// The shop runs on Philippine time (UTC+8, no daylight saving).
export const SHOP_OFFSET = '+08:00';
export const SHOP_TIMEZONE = 'Asia/Manila';
export const SLOT_MINUTES = 30;

const OFFSET_MS = 8 * 60 * 60 * 1000;

// "2026-09-28" for the moment d, as seen in the Philippines.
export function shopDate(d: Date = new Date()): string {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

export function formatSlot(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-PH', {
    timeZone: SHOP_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  });
}
