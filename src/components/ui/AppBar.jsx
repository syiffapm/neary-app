import { ChevronLeft } from "lucide-react";
import { t } from "../../i18n/dict.js";
import { C, HEAD } from "../../theme.js";
import { T } from "./Primitives.jsx";

export function AppBar({ title, onBack, right }) {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 px-4 py-3" style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}` }}>
      {onBack && <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-full active:opacity-60" aria-label={t("Back")} style={{ minWidth: 44, minHeight: 44 }}><ChevronLeft size={22} style={{ color: C.navy }} aria-hidden="true" /></button>}
      <h1 className="flex-1 text-base font-extrabold truncate" style={{ color: C.navy, fontFamily: HEAD }}>{T(title)}</h1>
      {right}
    </div>
  );
}
export function SectionHead({ children, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-base font-extrabold" style={{ color: C.navy, fontFamily: HEAD }}>{T(children)}</h2>
      {action && <button onClick={onAction} className="text-xs font-bold active:opacity-60" style={{ color: C.pink }}>{T(action)}</button>}
    </div>
  );
}
