import { ChevronRight, Search } from "lucide-react";
import { t } from "../../i18n/dict.js";
import { C, HEAD, GRAD } from "../../theme.js";

export function Card({ children, className = "", style, onClick, tour }) {
  const Tag = onClick ? "button" : "div";
  return <Tag data-tour={tour} onClick={onClick} className={`bg-white rounded-2xl border w-full ${onClick ? "text-left active:opacity-70" : ""} ${className}`} style={{ borderColor: C.line, ...style }}>{children}</Tag>;
}
export const T = (c) => (typeof c === "string" ? t(c) : c);
export function Pill({ tone = "neutral", children, small }) {
  const tn = { neutral: ["#EEF0F8", C.navy], green: [C.greenSoft, C.green], amber: [C.amberSoft, C.amber], red: [C.redSoft, C.red], pink: [C.blush, C.pinkDeep], aqua: [C.aquaSoft, "#1F8E86"] }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full font-bold whitespace-nowrap ${small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`} style={{ background: tn[0], color: tn[1] }}>{T(children)}</span>;
}
export function Btn({ children, onClick, variant = "primary", disabled, full, small, className = "" }) {
  const v = {
    primary: { background: C.pink, color: "#fff", border: `1.5px solid ${C.pink}` },
    ghost: { background: "#fff", color: C.pink, border: `1.5px solid ${C.pink}` },
    subtle: { background: C.blush, color: C.pinkDeep, border: `1.5px solid ${C.blush}` },
    aqua: { background: C.aquaSoft, color: "#1F8E86", border: `1.5px solid ${C.aquaSoft}` },
    navy: { background: C.navy, color: "#fff", border: `1.5px solid ${C.navy}` },
    quiet: { background: "#fff", color: C.navy, border: `1.5px solid ${C.line}` },
  }[variant];
  return (
    <button type="button" disabled={disabled} onClick={disabled ? undefined : onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold active:scale-[0.98] ${small ? "px-3.5 py-2 text-xs" : "px-5 py-3 text-sm"} ${full ? "w-full" : ""} ${className}`}
      style={{ ...v, opacity: disabled ? 0.45 : 1, transition: "transform .1s" }}>{T(children)}</button>
  );
}
export function IconDot({ icon: Icon, size = 40, bg = C.blush, color = C.pink }) {
  return <span className="rounded-2xl flex items-center justify-center shrink-0" style={{ width: size, height: size, background: bg, color }}><Icon size={Math.round(size * 0.46)} /></span>;
}
export function Row({ icon: Icon, iconBg, iconColor, title, sub, right, onClick, badge, className = "", tour }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag data-tour={tour} onClick={onClick} className={`w-full flex items-center gap-3 py-3 text-left ${onClick ? "active:opacity-60" : ""} ${className}`}>
      {Icon && <IconDot icon={Icon} size={38} bg={iconBg || C.blush} color={iconColor || C.pink} />}
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold truncate" style={{ color: C.navy }}>{T(title)}</span>
        {sub && <span className="block text-xs truncate" style={{ color: C.soft }}>{T(sub)}</span>}
      </span>
      {badge}
      {right !== undefined ? right : onClick ? <ChevronRight size={16} style={{ color: C.pink }} /> : null}
    </Tag>
  );
}
export function Meter({ value, max = 100, h = 8, color }) {
  return <div className="w-full rounded-full" style={{ background: "#F5E3EC", height: h }}><div className="rounded-full" style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%`, height: h, background: color || GRAD, transition: "width .4s" }} /></div>;
}
/* Progress ring. The caption sits inside only when the inscribed square is
   wide enough for it; on small rings it moves below, so no text can ever run
   under the stroke. */
export function Ring({ value, max = 100, size = 148, label, sub, tone }) {
  const stroke = Math.max(7, Math.round(size * 0.085));
  const r = size / 2 - stroke / 2 - 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const col = tone || (pct >= 0.7 ? C.green : pct >= 0.5 ? C.amber : C.pink);
  const box = Math.floor((2 * (r - stroke / 2) - 4) / Math.SQRT2);   // largest square inside the ring
  const numSize = Math.round(size * 0.3);
  const subSize = Math.max(10, Math.round(size * 0.088));
  const subFitsInside = sub ? String(sub).length * subSize * 0.55 <= box : true;
  const ring = (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EFE6EB" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={col} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: "stroke-dashoffset .6s" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center" style={{ width: box, maxWidth: box }}>
          <span className="font-extrabold leading-none" style={{ color: col, fontFamily: HEAD, fontSize: numSize }}>{label ?? value}</span>
          {sub && subFitsInside && <span className="leading-tight truncate w-full" style={{ color: C.soft, fontSize: subSize, marginTop: 2 }}>{sub}</span>}
        </div>
      </div>
    </div>
  );
  if (sub && !subFitsInside) {
    return (
      <div className="flex flex-col items-center shrink-0">
        {ring}
        <span className="leading-tight mt-1 whitespace-nowrap" style={{ color: C.soft, fontSize: subSize }}>{sub}</span>
      </div>
    );
  }
  return ring;
}
export function Segmented({ options, value, onChange, tour }) {
  return (
    <div data-tour={tour} className="flex flex-wrap gap-1 p-1 rounded-3xl" style={{ background: C.blush2, border: `1px solid ${C.line}` }}>
      {options.map(([k, l]) => (
        <button key={k} data-tour={tour ? `${tour}-${k}` : undefined} onClick={() => onChange(k)} className="flex-1 min-w-fit px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
          style={value === k ? { background: C.pink, color: "#fff" } : { color: C.navy }}>{T(l)}</button>
      ))}
    </div>
  );
}
export function Chips({ options, value, onChange, tour }) {
  return (
    <div data-tour={tour} className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {options.map(([k, l]) => (
        <button key={k} onClick={() => onChange(k)} className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0"
          style={value === k ? { background: C.pink, color: "#fff" } : { background: "#fff", color: C.navy, border: `1px solid ${C.line}` }}>{T(l)}</button>
      ))}
    </div>
  );
}
export function Field({ label, hint, children }) {
  return <label className="block"><span className="block text-xs font-bold mb-1.5" style={{ color: C.navy }}>{T(label)}</span>{children}{hint && <span className="block text-[11px] mt-1" style={{ color: C.soft }}>{hint}</span>}</label>;
}
export function Empty({ icon: Icon = Search, title, text }) {
  return <div className="py-12 text-center"><div className="flex justify-center"><IconDot icon={Icon} size={52} /></div><div className="font-bold mt-3" style={{ color: C.navy }}>{T(title)}</div>{text && <div className="text-sm mt-1 px-8" style={{ color: C.soft }}>{text}</div>}</div>;
}
export function Switch({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={!!on} aria-label={T(label)} onClick={() => onChange(!on)} className="shrink-0 rounded-full relative" style={{ width: 46, height: 26, background: on ? C.green : C.soft }}>
      <span className="absolute top-[3px] rounded-full bg-white" style={{ width: 20, height: 20, left: on ? 23 : 3, transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
    </button>
  );
}
