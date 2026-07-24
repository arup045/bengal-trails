// Shared helpers for managing a booking after it's made: re-open the printable
// e-voucher, and add the stay to a calendar. Used by the profile "My Bookings"
// list (and reusable from the booking flow).

export interface BookingLike {
  bookingId?: string; booking_id?: string;
  destinationName?: string; destination_name?: string;
  destinationSlug?: string; destination_slug?: string;
  checkIn?: string; check_in?: string;
  checkOut?: string; check_out?: string;
  guests?: number; rooms?: number;
  total?: number | string;
  status?: string;
  addOns?: unknown; add_ons?: unknown;
}

export interface NormalBooking {
  id: string; name: string; slug: string;
  checkIn: string; checkOut: string;
  guests: number; rooms: number; total: number; status: string; addOns: string[];
}

/** API responses arrive camelCased, but raw rows may be snake_case — accept both. */
export function normalizeBooking(b: BookingLike): NormalBooking {
  const addOnsRaw = (b.addOns ?? b.add_ons) as unknown;
  return {
    id: b.bookingId || b.booking_id || '',
    name: b.destinationName || b.destination_name || 'Your trip',
    slug: b.destinationSlug || b.destination_slug || '',
    checkIn: (b.checkIn || b.check_in || '').slice(0, 10),
    checkOut: (b.checkOut || b.check_out || '').slice(0, 10),
    guests: Number(b.guests) || 1,
    rooms: Number(b.rooms) || 1,
    total: Number(b.total) || 0,
    status: String(b.status || 'pending'),
    addOns: Array.isArray(addOnsRaw) ? (addOnsRaw as any[]).map((a) => (typeof a === 'string' ? a : a?.name)).filter(Boolean) : [],
  };
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return Math.round((b - a) / 86_400_000);
}

// ── Calendar ────────────────────────────────────────────────────────────────
const ymd = (d: string) => d.replace(/-/g, '');
/** Day after `d` — used when a booking has no check-out (all-day end is exclusive). */
function nextDay(d: string): string {
  const t = new Date(d).getTime();
  if (!Number.isFinite(t)) return d;
  return new Date(t + 86_400_000).toISOString().slice(0, 10);
}

export function googleCalendarUrl(b: BookingLike): string {
  const n = normalizeBooking(b);
  const start = n.checkIn;
  const end = n.checkOut || nextDay(n.checkIn);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${n.name} — Bengal Trails`,
    dates: `${ymd(start)}/${ymd(end)}`,
    details: `Booking ${n.id}\n${n.guests} guest(s), ${n.rooms} room(s)${n.addOns.length ? `\nAdd-ons: ${n.addOns.join(', ')}` : ''}`,
    location: `${n.name}, West Bengal, India`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Downloads a .ics so the stay lands in Apple/Outlook calendars too. */
export function downloadIcs(b: BookingLike): void {
  const n = normalizeBooking(b);
  const start = n.checkIn;
  const end = n.checkOut || nextDay(n.checkIn);
  const esc = (s: string) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bengal Trails//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${n.id || Date.now()}@bengal-trails`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;VALUE=DATE:${ymd(start)}`,
    `DTEND;VALUE=DATE:${ymd(end)}`,
    `SUMMARY:${esc(`${n.name} — Bengal Trails`)}`,
    `DESCRIPTION:${esc(`Booking ${n.id} · ${n.guests} guest(s), ${n.rooms} room(s)`)}`,
    `LOCATION:${esc(`${n.name}, West Bengal, India`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `bengal-trails-${n.id || 'booking'}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── E-voucher ───────────────────────────────────────────────────────────────
const h = (s: unknown) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Opens the printable voucher in a new window (browser "Save as PDF"). */
export function openVoucher(b: BookingLike): boolean {
  const n = normalizeBooking(b);
  const w = window.open('', '_blank', 'width=720,height=900');
  if (!w) return false; // caller shows a "allow pop-ups" toast
  const row = (a: string, v: string) =>
    `<tr><td style="padding:8px 0;color:#64748b">${h(a)}</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0f172a">${h(v)}</td></tr>`;
  const nights = nightsBetween(n.checkIn, n.checkOut);
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Voucher ${h(n.id)}</title>
    <style>body{font-family:Poppins,Arial,sans-serif;color:#0f172a;max-width:640px;margin:32px auto;padding:0 24px}
    .h{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #7c3aed;padding-bottom:16px;margin-bottom:24px}
    .brand{font-size:24px;font-weight:800}.brand span{color:#7c3aed}
    .tag{background:#ede9fe;color:#6d28d9;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase}
    .id{font-size:13px;color:#64748b;margin-bottom:4px}.big{font-size:22px;font-weight:800;margin-bottom:24px}
    table{width:100%;border-collapse:collapse;font-size:14px}.tot{border-top:2px solid #e2e8f0;font-size:16px}
    .foot{margin-top:32px;font-size:12px;color:#94a3b8;text-align:center}</style></head><body>
    <div class="h"><div class="brand">Bengal <span>Trails</span></div><div class="tag">${h(n.status)}</div></div>
    <div class="id">Booking ID</div><div class="big">${h(n.id)}</div>
    <table>
      ${row('Destination', n.name)}
      ${row('Check-in', n.checkIn || '—')}
      ${row('Check-out', n.checkOut || '—')}
      ${nights ? row('Nights', String(nights)) : ''}
      ${row('Guests', String(n.guests))}
      ${row('Rooms', String(n.rooms))}
      ${n.addOns.length ? row('Add-ons', n.addOns.join(', ')) : ''}
      <tr class="tot"><td style="padding:12px 0;font-weight:700">Total</td><td style="padding:12px 0;text-align:right;font-weight:800;color:#7c3aed">₹${h(n.total.toLocaleString('en-IN'))}</td></tr>
    </table>
    <p class="foot">Show this voucher at check-in. Free cancellation up to 48h before arrival.<br/>Bengal Trails — West Bengal Travel Guide</p>
    </body></html>`);
  w.document.close(); w.focus();
  setTimeout(() => { try { w.print(); } catch { /* user can print manually */ } }, 300);
  return true;
}
