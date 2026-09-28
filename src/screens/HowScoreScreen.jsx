import { useState } from "react";
import { CheckCircle2, Circle, Flag, Info, QrCode } from "lucide-react";
import { t, tp } from "../i18n/dict.js";
import { C, HEAD, inputCls } from "../theme.js";
import { scoreOf, scoreParts, READY_AT, formalStatus, isFormal, guideState, scoreCoverage } from "../data/db.js";
import { GUIDES } from "../data/business.js";
import { fmtDate } from "../data/format.js";
import { Card, Meter, Pill, Btn, Field, Row, Ring } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";
import { Sheet } from "../components/ui/Sheet.jsx";

export const REVIEW_REASONS = ["Records missing or wrong", "Document verified but not counted", "Business details out of date", "Other"];
const STATUS_TONE = { Open: "amber", Upheld: "neutral", Adjusted: "green" };

export function HowScoreScreen({ db, back, act }) {
  const sc = scoreOf(db), p = scoreParts(db), cov = scoreCoverage(db);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const parts = [
    { l: "Business profile", w: 25, v: p.profile, how: "Fill in every detail of your business profile." },
    { l: "Transaction records", w: 30, v: p.records, how: "Record sales and costs in each of the last 4 weeks, and at least 40 records in 30 days." },
    { l: "Basic financial summary", w: 25, v: p.summary, how: "Finish the tasks in your financial summary." },
    { l: "Verified documents", w: 20, v: p.documents, how: "Each verified document adds 5 points." },
  ];
  const fs = formalStatus(db);
  const recordsOk = guideState(db, GUIDES.find((g) => g.id === "G-05")).complete;
  const registered = db.registration.status === "submitted";
  const taxId = guideState(db, GUIDES.find((g) => g.id === "G-03")).complete;
  const defs = [
    { l: "Records correct", d: "Your records cover 3 unbroken months, business and household money are kept apart, and you record every week.", ok: recordsOk },
    { l: "Business registered", d: "Your business is registered with the Ministry of Commerce through business.gov.kh. Today this is what you tell us, until official access exists.", ok: registered },
    { l: "Tax ID", d: "You have applied for, or hold, a tax identification number from the General Department of Taxation. Also self-reported for now.", ok: taxId },
  ];
  const close = () => { setOpen(false); setReason(""); setNote(""); };
  return (
    <div className="pb-4">
      <AppBar title="How your score works" onBack={back} />
      <div className="p-4 space-y-4">
        <Card className="p-4 text-center" style={{ background: "linear-gradient(135deg, #FEF0F7 0%, #EEFAF9 100%)" }}>
          <div className="text-xs font-bold" style={{ color: C.soft }}>{t("YOUR SCORE TODAY")}</div>
          <div className="text-4xl font-extrabold" style={{ color: C.pinkDeep, fontFamily: HEAD }}>{sc}<span className="text-base" style={{ color: C.soft }}> / 100</span></div>
          <p className="text-xs mt-1" style={{ color: C.mute }}>{t("The score is only a measure of how complete and steady your records are. It is not a loan decision.")}</p>
        </Card>

        <div>
          <SectionHead>The four parts</SectionHead>
          <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
            {parts.map((x) => (
              <div key={x.l} className="py-3">
                <div className="flex items-center justify-between gap-2"><span className="text-sm font-bold" style={{ color: C.navy }}>{t(x.l)}</span><span className="text-xs font-extrabold" style={{ color: C.pinkDeep }}>{x.v} / {x.w}</span></div>
                <div className="mt-1.5"><Meter value={x.v} max={x.w} h={6} /></div>
                <div className="text-xs mt-1.5" style={{ color: C.soft }}>{t(x.how)}</div>
              </div>
            ))}
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-baseline justify-between"><span className="text-sm font-bold" style={{ color: C.navy }}>{t("Finance-ready line")}</span><span className="text-xl font-extrabold" style={{ color: C.green, fontFamily: HEAD }}>{READY_AT}</span></div>
          <p className="text-xs mt-1" style={{ color: C.mute }}>{tp("At {n} points or more you can ask to be introduced to a lender. The programme administrator sets this number for everyone; it is {n} right now.", { n: READY_AT })}</p>
        </Card>

        <div>
          <SectionHead>Data coverage</SectionHead>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Ring value={cov.pct} size={56} label={`${cov.pct}%`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold" style={{ color: C.navy }}>{tp("{pct}% of your recorded sales came through QR payments the app can verify directly", { pct: cov.pct })}</div>
                <div className="text-xs mt-0.5" style={{ color: C.soft }}>{tp("The rest, {n} of {m} sales in the last 90 days, is self-reported.", { n: cov.total - cov.khqr, m: cov.total })}</div>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: C.mute }}>{t("A QR-based score only sees payments that pass through your own KHQR code. It cannot see cash sales you record by hand, so it is an honest but incomplete picture. A lender may ask for bank or wallet statements to fill the gap; that is normal, not a penalty.")}</p>
            {cov.low && (
              <div className="mt-3 pt-3 border-t flex gap-2.5" style={{ borderColor: C.line }}>
                <QrCode size={16} style={{ color: C.pink }} className="shrink-0 mt-0.5" />
                <div className="text-xs" style={{ color: C.ink }}>{t("You have few recorded sales so far. Using your KHQR code for more of your sales, or recording cash sales the same day, gives lenders a clearer picture.")}</div>
              </div>
            )}
          </Card>
        </div>

        <div>
          <SectionHead>What "Compliance" means</SectionHead>
          <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
            {defs.map((x) => (
              <div key={x.l} className="py-3 flex gap-3">
                <span className="mt-0.5 shrink-0" style={{ color: x.ok ? C.green : C.soft }}>{x.ok ? <CheckCircle2 size={18} /> : <Circle size={18} />}</span>
                <div className="flex-1"><div className="text-sm font-bold" style={{ color: C.navy }}>{t(x.l)} <Pill small tone={x.ok ? "green" : "neutral"}>{x.ok ? "Done" : "Not yet"}</Pill></div><div className="text-xs mt-0.5" style={{ color: C.mute }}>{t(x.d)}</div></div>
              </div>
            ))}
          </Card>
          <p className="text-xs mt-2" style={{ color: C.soft }}>{t("Your formalization status now:")} <b style={{ color: C.navy }}>{t(fs)}</b>{isFormal(db) ? "" : `. ${t("Formalizing comes before being finance-ready.")}`}</p>
        </div>

        <Card className="p-4" style={{ background: C.blush2 }}>
          <div className="flex gap-2.5"><Info size={16} style={{ color: C.pink }} className="shrink-0 mt-0.5" /><div className="text-xs" style={{ color: C.mute }}>{t("If you think your score is wrong, you can ask for a review. An officer looks at your records and answers you.")}</div></div>
          <Btn full variant="ghost" className="mt-3" onClick={() => setOpen(true)}><Flag size={14} />Ask for a review of my score</Btn>
        </Card>

        <div>
          <SectionHead>My review requests</SectionHead>
          {db.scoreReviews.length === 0 ? <p className="text-sm" style={{ color: C.soft }}>{t("You have not asked for a review yet.")}</p> : (
            <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
              {db.scoreReviews.map((r) => (
                <div key={r.id} className="py-3">
                  <Row className="!py-0" title={r.reason} sub={`${r.id}, ${fmtDate(r.createdAt)}, ${tp("score {n} at the time", { n: r.scoreAtRequest })}`} right={<Pill tone={STATUS_TONE[r.status] || "neutral"} small>{r.status}</Pill>} />
                  {r.note && <div className="text-xs mt-1 pl-[50px]" style={{ color: C.mute }}>{r.note}</div>}
                  {r.status === "Open" && (
                    <div className="flex items-center gap-2 mt-2 pl-[50px] flex-wrap"><span className="text-[10px] font-bold" style={{ color: C.amber }}>{t("Demo: simulate officer answer")}</span>
                      <button onClick={() => act.resolveScoreReview(r.id, "Upheld")} className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: "#EEF0F8", color: C.navy }}>{t("Upheld")}</button>
                      <button onClick={() => act.resolveScoreReview(r.id, "Adjusted")} className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: C.greenSoft, color: C.green }}>{t("Adjusted")}</button></div>
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
      {open && (
        <Sheet title="Ask for a review of my score" sub="Tell us what looks wrong" onClose={close}
          footer={<Btn full disabled={!reason} onClick={() => { act.submitScoreReview({ reason, note: note.trim() }); close(); }}>Send request</Btn>}>
          <div role="radiogroup" aria-label={t("Reason")} className="space-y-2">
            {REVIEW_REASONS.map((r) => (
              <button key={r} role="radio" aria-checked={reason === r} onClick={() => setReason(r)} className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left" style={reason === r ? { border: `1.5px solid ${C.pink}`, background: C.blush2 } : { border: `1.5px solid ${C.line}` }}>
                <span className="w-5 h-5 rounded-full shrink-0" style={{ border: `2px solid ${reason === r ? C.pink : C.soft}`, background: reason === r ? C.pink : "#fff", boxShadow: reason === r ? "inset 0 0 0 3px #fff" : "none" }} />
                <span className="text-sm font-bold" style={{ color: C.navy }}>{t(r)}</span>
              </button>
            ))}
          </div>
          <Field label="Note (optional)"><textarea className={inputCls} style={{ borderColor: C.line }} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("Add anything that helps the officer")} /></Field>
          <p className="text-[11px]" style={{ color: C.soft }}>{tp("Your score now is {n}. It is saved with your request.", { n: sc })}</p>
        </Sheet>
      )}
    </div>
  );
}
