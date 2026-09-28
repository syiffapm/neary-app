import { useState } from "react";
import { Search, Plus, Receipt, FileSpreadsheet } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C } from "../theme.js";
import { usd } from "../data/format.js";
import { Card, Segmented, Empty, Btn } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";
import { TxnRow } from "../components/TxnRow.jsx";

const tt = (s) => t(s);

export function TxnsScreen({ db, back, act }) {
  const [f, setF] = useState("all");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(30);
  const rows = db.txns.filter((t) => (f === "all" || t.type === f) && (!q || t.cat.toLowerCase().includes(q.toLowerCase()) || (t.note || "").toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.at - a.at);
  const shown = rows.slice(0, limit);
  const sum = rows.reduce((a, t) => a + (t.type === "income" ? t.amount : -t.amount), 0);
  return (
    <div className="pb-4">
      <AppBar title="Transactions" onBack={back} right={
        <div className="flex items-center gap-2">
          <button onClick={() => act.openImport()} className="p-2 rounded-full" style={{ background: C.blush, color: C.pink }} aria-label="Import records from a file"><FileSpreadsheet size={16} /></button>
          <button onClick={() => act.openAdd()} className="p-2 rounded-full" style={{ background: C.pink, color: "#fff" }} aria-label="Add record"><Plus size={16} /></button>
        </div>
      } />
      <div className="px-4 pt-3 pb-2 space-y-3 sticky top-[52px] z-10" style={{ background: "#fff" }}>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-3" style={{ color: C.soft }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transactions" className="w-full text-sm rounded-full border pl-10 pr-4 py-2.5" style={{ borderColor: C.line }} />
        </div>
        <Segmented options={[["all", "All"], ["income", "Income"], ["expense", "Expenses"]]} value={f} onChange={(v) => { setF(v); setLimit(30); }} />
      </div>
      <div className="px-4">
        <div className="flex justify-between text-xs py-2" style={{ color: C.soft }}><span>{rows.length} {tt("records")}</span><span>{tt("Net")} <b style={{ color: sum >= 0 ? C.green : C.red }}>{usd(sum)}</b></span></div>
        <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
          {shown.map((t) => <TxnRow key={t.id} t={t} />)}
        </Card>
        {rows.length === 0 && <Empty icon={Receipt} title="No transactions found" text="Try a different filter or search." />}
        {limit < rows.length && <Btn full variant="quiet" className="mt-3" onClick={() => setLimit(limit + 40)}>Show more</Btn>}
      </div>
    </div>
  );
}
