import { useState, useRef } from "react";
import { FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { C } from "../theme.js";
import { Sheet } from "./ui/Sheet.jsx";
import { Card, Btn } from "./ui/Primitives.jsx";
import { usd, NOW_MS } from "../data/format.js";

const SAMPLE = "date,type,amount,category,note\n2028-01-18,income,25.00,Customer payment,3 silk scarves\n2028-01-19,expense,8.50,Raw materials,Thread and dye\n";

function downloadSample() {
  const blob = new Blob([SAMPLE], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "neary-records-template.csv"; a.click();
  URL.revokeObjectURL(url);
}

function splitCsvLine(line) {
  const out = []; let cur = ""; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (c === "," && !inQ) { out.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (!lines.length) return { rows: [], errors: ["The file is empty."] };
  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = (name) => header.indexOf(name);
  const iDate = idx("date"), iType = idx("type"), iAmount = idx("amount"), iCat = idx("category"), iNote = idx("note");
  if (iAmount === -1) return { rows: [], errors: ["No 'amount' column found. Download the template to see the expected format."] };
  const rows = []; const errors = [];
  for (let li = 1; li < lines.length; li++) {
    const cells = splitCsvLine(lines[li]);
    const rawAmt = (cells[iAmount] || "").replace(/[^0-9.\-]/g, "");
    const n = parseFloat(rawAmt);
    if (!Number.isFinite(n) || n === 0) { errors.push(`Row ${li + 1}: could not read an amount ("${cells[iAmount] || ""}").`); continue; }
    let type = iType !== -1 ? (cells[iType] || "").toLowerCase() : "";
    if (["income", "in", "money in", "sale"].includes(type)) type = "income";
    else if (["expense", "out", "money out", "cost"].includes(type)) type = "expense";
    else type = n < 0 ? "expense" : "income";
    const cat = (iCat !== -1 && cells[iCat]) ? cells[iCat] : (type === "income" ? "Other income" : "Other cost");
    const note = iNote !== -1 ? (cells[iNote] || "") : "";
    let at = NOW_MS;
    if (iDate !== -1 && cells[iDate]) { const p = Date.parse(cells[iDate]); if (!Number.isNaN(p)) at = p; }
    rows.push({ type, amount: Math.round(Math.abs(n) * 100) / 100, cat, note, method: "manual", at });
  }
  return { rows, errors };
}

export function ImportTxnsSheet({ onClose, act }) {
  const [fileName, setFileName] = useState(null);
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const onPick = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      setFileName(file.name); setRows([]);
      setErrors(["Excel files (.xlsx) aren't read directly yet — open it in Excel or Google Sheets and save as .csv first."]);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const { rows: r, errors: e2 } = parseCsv(String(reader.result || ""));
      setRows(r); setErrors(e2);
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    setImporting(true);
    setTimeout(() => { act.importTxns(rows); onClose(); }, 500);
  };

  return (
    <Sheet title="Import records from a file" sub="For a CSV export from another bookkeeping app or spreadsheet." onClose={onClose}
      footer={rows.length > 0 ? <Btn full disabled={importing} onClick={confirmImport}>{importing ? "Importing…" : `Import ${rows.length} record${rows.length === 1 ? "" : "s"}`}</Btn> : undefined}>
      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onPick} />
      {!fileName ? (
        <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-3 rounded-2xl p-4" style={{ border: `1.5px dashed ${C.line}`, background: C.blush2 }}>
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#fff", color: C.pink }}><FileSpreadsheet size={18} /></span>
          <span className="text-left">
            <span className="block text-sm font-bold" style={{ color: C.navy }}>Choose a .csv file</span>
            <span className="block text-xs" style={{ color: C.soft }}>Columns: date, type, amount, category, note</span>
          </span>
        </button>
      ) : (
        <Card className="p-3.5">
          <div className="text-sm font-bold" style={{ color: C.navy }}>{fileName}</div>
          {rows.length > 0 && <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: "#1F8E86" }}><CheckCircle2 size={13} />{rows.length} record{rows.length === 1 ? "" : "s"} ready to import</div>}
          <button className="text-xs font-bold underline mt-2" style={{ color: C.pinkDeep }} onClick={() => fileRef.current?.click()}>Choose a different file</button>
        </Card>
      )}

      {errors.length > 0 && (
        <Card className="p-3.5" style={{ background: "#FFF4E9" }}>
          <div className="flex gap-2"><AlertCircle size={15} style={{ color: C.amber }} className="shrink-0 mt-0.5" />
            <div className="text-xs" style={{ color: C.ink }}>
              {errors.slice(0, 5).map((e, i) => <div key={i}>{e}</div>)}
              {errors.length > 5 && <div>and {errors.length - 5} more row{errors.length - 5 === 1 ? "" : "s"} skipped.</div>}
            </div>
          </div>
        </Card>
      )}

      {rows.length > 0 && (
        <Card className="divide-y" style={{ borderColor: C.line }}>
          {rows.slice(0, 8).map((r, i) => (
            <div key={i} className="px-3.5 py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate" style={{ color: C.navy }}>{r.cat}</div>{r.note && <div className="text-xs truncate" style={{ color: C.soft }}>{r.note}</div>}</div>
              <div className="text-sm font-extrabold shrink-0" style={{ color: r.type === "income" ? C.green : C.red }}>{r.type === "income" ? "+" : "-"}{usd(r.amount)}</div>
            </div>
          ))}
          {rows.length > 8 && <div className="px-3.5 py-2 text-xs" style={{ color: C.soft }}>and {rows.length - 8} more…</div>}
        </Card>
      )}

      <button onClick={downloadSample} className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2" style={{ color: C.pinkDeep }}><Download size={13} />Download a template CSV</button>
    </Sheet>
  );
}
