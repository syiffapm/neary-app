import { useState, useRef } from "react";
import { Camera, Sparkles, X } from "lucide-react";
import { C, inputCls } from "../theme.js";
import { Sheet } from "./ui/Sheet.jsx";
import { Segmented, Field, Btn, Card } from "./ui/Primitives.jsx";
import { t } from "../i18n/dict.js";

const tt = (s) => t(s);
const INC_CATS = ["Customer payment", "Cash sale", "Market stall sale", "Wholesale order", "Other income"];
const EXP_CATS = ["Raw materials", "Supplier payment", "Market stall fee", "Transport", "Packaging", "Utilities", "Other cost"];

export function AddTxnSheet({ onClose, act }) {
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState(INC_CATS[0]);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("manual");
  const [photo, setPhoto] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const fileRef = useRef(null);
  const cats = type === "income" ? INC_CATS : EXP_CATS;
  const amt = parseFloat(amount);
  const valid = amt > 0 && amt <= 100000;

  const onPickReceipt = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhoto(url);
    setScanning(true);
    setScanned(false);
    setTimeout(() => {
      const guessAmt = Math.round((5 + Math.random() * 60) * 4) / 4;
      const guessCat = type === "income" ? INC_CATS[Math.floor(Math.random() * INC_CATS.length)] : EXP_CATS[Math.floor(Math.random() * EXP_CATS.length)];
      setAmount(String(guessAmt));
      setCat(guessCat);
      setScanning(false);
      setScanned(true);
    }, 1300);
  };
  const clearPhoto = () => { setPhoto(null); setScanned(false); if (fileRef.current) fileRef.current.value = ""; };

  return (
    <Sheet title="Add a record" sub="Recording every day keeps your score strong." onClose={onClose}
      footer={<Btn full disabled={!valid} onClick={() => { act.addTxn({ type, amount: Math.round(amt * 100) / 100, cat, note: note.trim(), method, receiptScanned: scanned }); onClose(); }}>Save record</Btn>}>
      <Segmented options={[["income", "Money in"], ["expense", "Money out"]]} value={type} onChange={(v) => { setType(v); setCat(v === "income" ? INC_CATS[0] : EXP_CATS[0]); }} />

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPickReceipt} />
      {!photo ? (
        <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-3 rounded-2xl p-3.5" style={{ border: `1.5px dashed ${C.line}`, background: C.blush2 }}>
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#fff", color: C.pink }}><Camera size={18} /></span>
          <span className="text-left">
            <span className="block text-sm font-bold" style={{ color: C.navy }}>Scan a receipt instead</span>
            <span className="block text-xs" style={{ color: C.soft }}>We'll try to read the amount for you</span>
          </span>
        </button>
      ) : (
        <Card className="p-3 flex items-center gap-3">
          <img src={photo} alt="Receipt" className="w-14 h-14 rounded-xl object-cover shrink-0" style={{ border: `1px solid ${C.line}` }} />
          <div className="flex-1 min-w-0">
            {scanning ? (
              <span className="text-xs font-bold" style={{ color: C.pink }}>Reading your receipt…</span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "#1F8E86" }}><Sparkles size={13} />Simulated scan — check the numbers below</span>
            )}
          </div>
          <button onClick={clearPhoto} aria-label="Remove receipt" className="p-1.5 rounded-full shrink-0" style={{ background: C.blush, color: C.pink }}><X size={13} /></button>
        </Card>
      )}

      <Field label="Amount (US$)">
        <div className="relative">
          <span className="absolute left-4 top-3 text-sm font-bold" style={{ color: C.soft }}>US$</span>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" className={inputCls + " pl-12 text-lg font-extrabold"} style={{ borderColor: C.line, color: C.navy }} />
        </div>
      </Field>
      <Field label="Category">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => <button key={c} onClick={() => setCat(c)} className="px-3 py-1.5 rounded-full text-xs font-bold" style={cat === c ? { background: C.pink, color: "#fff" } : { background: "#fff", color: C.navy, border: `1px solid ${C.line}` }}>{tt(c)}</button>)}
        </div>
      </Field>
      <Field label="How was it paid?">
        <Segmented options={[["manual", "Cash"], ["khqr", "KHQR"], ["bank", "Bank"]]} value={method} onChange={setMethod} />
      </Field>
      <Field label="Note (optional)"><input className={inputCls} style={{ borderColor: C.line }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. 3 silk scarves" /></Field>
    </Sheet>
  );
}
