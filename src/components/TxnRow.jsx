import { t } from "../i18n/dict.js";
import { fmtDate, usd } from "../data/format.js";
import { C } from "../theme.js";
import { TxnIcon } from "./ui/TxnIcon.jsx";

const tt = (s) => t(s);
export function TxnRow({ t, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-3 text-left" disabled={!onClick}>
      <TxnIcon t={t} />
      <span className="flex-1 min-w-0">
        <span className="block text-[11px]" style={{ color: C.soft }}>{fmtDate(t.at)}</span>
        <span className="block text-sm font-bold truncate" style={{ color: C.navy }}>{tt(t.cat)}</span>
        <span className="block text-[11px]" style={{ color: C.soft }}>{tt(t.method === "khqr" ? "KHQR" : t.method === "bank" ? "Bank transfer" : "Manual entry")}{t.note ? `, ${t.note}` : ""}</span>
      </span>
      <span className="text-right shrink-0">
        <span className="block text-sm font-extrabold" style={{ color: t.type === "income" ? C.green : C.pinkDeep }}>{t.type === "income" ? "+" : "-"}{usd(t.amount)}</span>
        {t.pending && <span className="block text-[10px] font-bold" style={{ color: C.amber }}>{tt("Waiting to sync")}</span>}
      </span>
    </button>
  );
}
