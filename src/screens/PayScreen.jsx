import { useState, useMemo } from "react";
import { Download, Share2, CheckCircle2, Wallet, Landmark, Store } from "lucide-react";
import { C, HEAD, inputCls } from "../theme.js";
import { khqrPayload, qrMatrix } from "../lib/qr.js";
import { usd } from "../data/format.js";
import { Card, Segmented, Btn, Row } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";
import { QrSvg } from "../components/ui/QrSvg.jsx";
import { TxnRow } from "../components/TxnRow.jsx";

export function PayScreen({ db, back, act }) {
  const [tab, setTab] = useState("khqr");
  const [amt, setAmt] = useState("");
  const [showAmt, setShowAmt] = useState(false);
  const amount = parseFloat(amt) > 0 ? parseFloat(amt) : null;
  const payload = useMemo(() => khqrPayload({ merchantId: db.me.merchantId, name: "Sokhas Traditional Crafts", city: "Siem Reap", amount: showAmt ? amount : null }), [db.me.merchantId, showAmt, amount]);
  const matrix = useMemo(() => { try { return qrMatrix(payload); } catch (e) { return null; } }, [payload]);
  const todayKhqr = db.txns.filter((t) => t.method === "khqr" && t.at >= Date.UTC(2028, 0, 21));
  return (
    <div className="pb-4">
      <AppBar title="Accept Payments" onBack={back} />
      <div className="p-4 space-y-4">
        <Segmented options={[["khqr", "KHQR"], ["other", "Other Methods"]]} value={tab} onChange={setTab} />
        {tab === "khqr" ? (
          <>
            <Card className="p-5 flex flex-col items-center">
              <div className="text-lg font-extrabold tracking-tight" style={{ fontFamily: HEAD }}><span style={{ color: C.navy }}>NEA</span><span style={{ color: C.pink }}>RY</span><span style={{ color: C.navy }}> PAY</span></div>
              <div className="mt-3 p-3 rounded-2xl bg-white" style={{ border: `1px solid ${C.line}` }}>
                {matrix ? <QrSvg matrix={matrix} size={198} /> : <div className="text-xs" style={{ color: C.red }}>Could not build the code</div>}
              </div>
              <div className="font-extrabold mt-3" style={{ color: C.navy }}>{db.me.biz}</div>
              <div className="text-xs" style={{ color: C.soft }}>Merchant ID: {db.me.merchantId}</div>
              {showAmt && amount && <div className="mt-2 text-2xl font-extrabold" style={{ color: C.pink, fontFamily: HEAD }}>{usd(amount)}</div>}
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div><div className="text-sm font-bold" style={{ color: C.navy }}>Ask for a set amount</div><div className="text-xs" style={{ color: C.soft }}>The customer cannot change it</div></div>
                <button role="switch" aria-checked={showAmt} onClick={() => setShowAmt(!showAmt)} className="relative w-11 h-6 rounded-full shrink-0" style={{ background: showAmt ? C.pink : "#E3D9E0" }}>
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white" style={{ left: showAmt ? 22 : 2, transition: "left .15s" }} />
                </button>
              </div>
              {showAmt && (
                <div className="mt-3">
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm font-bold" style={{ color: C.soft }}>US$</span>
                    <input inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" className={inputCls + " pl-12 font-extrabold"} style={{ borderColor: C.line, color: C.navy }} />
                  </div>
                </div>
              )}
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Btn variant="quiet" onClick={() => act.toast("Saved to your phone")}><Download size={15} />Download QR</Btn>
              <Btn variant="quiet" onClick={() => act.toast("Share sheet opened")}><Share2 size={15} />Share QR</Btn>
            </div>
            <Card className="p-3.5" style={{ background: C.greenSoft, borderColor: C.greenSoft }}>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={20} style={{ color: C.green }} />
                <div><div className="text-sm font-bold" style={{ color: C.green }}>KHQR connected</div><div className="text-xs" style={{ color: C.mute }}>You can receive payments. Every payment is recorded for you.</div></div>
              </div>
            </Card>
            <Btn full variant="aqua" onClick={() => act.simulatePayment()}>Simulate a customer paying</Btn>
            <div>
              <SectionHead>Received today</SectionHead>
              <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
                {todayKhqr.length ? todayKhqr.sort((a, b) => b.at - a.at).map((t) => <TxnRow key={t.id} t={t} />) : <div className="py-5 text-center text-sm" style={{ color: C.soft }}>No KHQR payments yet today</div>}
              </Card>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {[[Wallet, "Cash", "Record it yourself so your records stay complete", () => act.openAdd()],
              [Landmark, "Bank transfer", "Give the customer your account details, then record it", () => act.openAdd()],
              [Store, "Pay on delivery", "Record the sale when the customer receives the goods", () => act.openAdd()]].map(([I, t, s, fn]) => (
              <Card key={t} className="px-4" onClick={fn}><Row icon={I} title={t} sub={s} /></Card>
            ))}
            <p className="text-xs" style={{ color: C.soft }}>KHQR payments are recorded for you. Other methods need a quick manual record.</p>
          </div>
        )}
      </div>
    </div>
  );
}
