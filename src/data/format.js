import { LOCALE, MONTHS_I18N, REL_I18N } from "../i18n/dict.js";

/* Same platform clock as the administration console. */
export const DAY = 86400000;
export const NOW_MS = Date.UTC(2028, 0, 21, 8, 45);
export const JOINED_MS = Date.UTC(2027, 9, 12, 10, 20);
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthName = (i) => (typeof MONTHS_I18N !== "undefined" && MONTHS_I18N[LOCALE] ? MONTHS_I18N[LOCALE][i] : MON[i]);
export const fmtDate = (ms) => { const d = new Date(ms); return `${d.getUTCDate()} ${monthName(d.getUTCMonth())} ${d.getUTCFullYear()}`; };
export const fmtShort = (ms) => { const d = new Date(ms); return `${d.getUTCDate()} ${monthName(d.getUTCMonth())}`; };
export const fmtTime = (ms) => { const d = new Date(ms); return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`; };
export const ago = (ms, now = NOW_MS) => {
  const R = (typeof REL_I18N !== "undefined" && REL_I18N[LOCALE]) || null;
  const m = Math.round((now - ms) / 60000);
  if (m < 1) return R ? R[0] : "just now";
  if (m < 60) return R ? `${m} ${R[1]}` : `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return R ? `${h} ${R[2]}` : `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return R ? R[3] : "yesterday";
  if (d < 31) return R ? `${d} ${R[4]}` : `${d} days ago`;
  return fmtDate(ms);
};
export const usd = (n) => "US$" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
export const monthStart = (ms) => { const d = new Date(ms); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1); };

export function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function integerize(values, total) {
  const s = values.reduce((a, b) => a + b, 0) || 1;
  const raw = values.map((v) => (v / s) * total);
  const out = raw.map(Math.floor);
  const rem = total - out.reduce((a, b) => a + b, 0);
  raw.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]).slice(0, rem).forEach(([, i]) => out[i]++);
  return out;
}
