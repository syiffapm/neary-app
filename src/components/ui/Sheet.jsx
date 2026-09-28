import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { t } from "../../i18n/dict.js";
import { C, HEAD } from "../../theme.js";
import { T } from "./Primitives.jsx";

export function useDialog(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = typeof document !== "undefined" ? document.activeElement : null;
    const node = ref.current;
    const focusables = () => (node ? [...node.querySelectorAll('button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((e) => !e.disabled) : []);
    focusables()[0]?.focus?.();
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose?.(); return; }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus?.(); };
  }, [onClose]);
  return ref;
}
export function Sheet({ title, sub, onClose, children, footer }) {
  const ref = useDialog(onClose);
  return (
    <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(0,30,108,0.35)" }} onMouseDown={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={T(title)} className="w-full bg-white rounded-t-3xl max-h-[92%] flex flex-col" onMouseDown={(e) => e.stopPropagation()} style={{ animation: "sheetUp .22s ease-out" }}>
        <div className="px-5 pt-3 pb-3 border-b shrink-0" style={{ borderColor: C.line }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: C.line }} />
          <div className="flex items-start justify-between gap-3">
            <div><h3 className="text-lg font-extrabold" style={{ color: C.navy, fontFamily: HEAD }}>{T(title)}</h3>{sub && <p className="text-xs mt-0.5" style={{ color: C.soft }}>{T(sub)}</p>}</div>
            <button onClick={onClose} className="p-2 rounded-full shrink-0" style={{ background: C.blush, color: C.pink }} aria-label={t("Close")}><X size={15} aria-hidden="true" /></button>
          </div>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1 space-y-3">{children}</div>
        {footer && <div className="px-5 py-3 border-t shrink-0" style={{ borderColor: C.line }}>{footer}</div>}
      </div>
    </div>
  );
}
