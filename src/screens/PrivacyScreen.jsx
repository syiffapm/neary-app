import { useState } from "react";
import { Download, PenLine, Trash2, ShieldAlert, MapPin, UserCog, Clock, History, ShieldCheck, ShieldOff } from "lucide-react";
import { t, tp } from "../i18n/dict.js";
import { C, inputCls } from "../theme.js";
import { fmtDate } from "../data/format.js";
import { Card, Pill, Btn, Row, Field, Switch } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";
import { Sheet } from "../components/ui/Sheet.jsx";

const PROPOSED = "Proposed — to be confirmed with MoWA";
const GROUPS = [
  { k: "Personal", tone: "pink", rows: [
    ["Name, phone number", "To create your account and contact you", "You, your facilitator, MoWA programme staff"],
    ["Province, business name and sector", "To match you to programmes near you", "You, your facilitator, MoWA programme staff"],
  ] },
  { k: "Financial-sensitive", tone: "amber", rows: [
    ["Sales and cost records", "To calculate your readiness score", "You. A lender only if you start a referral"],
    ["Documents you upload", "To verify your business for the score", "You, the verifying officer. A lender only in a referral"],
    ["Referral and lender decision", "To track your introduction to a lender", "You, the lender you chose, MoWA programme staff"],
  ] },
  { k: "Usage", tone: "aqua", rows: [
    ["Learning progress", "To suggest the next lesson", "You, your facilitator, MoWA (summary numbers)"],
    ["Questions you ask the AI coach", "To answer you and to improve the coach", "You, LinkIT support staff when reviewing a report"],
  ] },
];
const RETENTION = [
  ["Account and profile details", "While your account is open, then 12 months"],
  ["Sales, cost and document records", "5 years after they were recorded"],
  ["Referral records", "5 years after the decision"],
  ["AI coach questions", "12 months"],
  ["Learning and usage data", "24 months"],
  ["Data-rights requests", "3 years, as proof we answered you"],
];
const REQ_LABEL = { access: "Download my data", correction: "Ask to correct my data", deletion: "Ask to delete my data" };
const CONSENT_LOG_LABEL = { scoring: "sharing your records for scoring", lenders: "sharing with lenders", aiCoach: "the AI coach processing your questions" };

export function PrivacyScreen({ db, back, act, go }) {
  const [sheet, setSheet] = useState(null);   // "correction" | "deletion" | null
  const [note, setNote] = useState("");
  const c = db.consents;
  const consentRows = [
    ["scoring", "Use my records to compute my readiness score", "Required for the score. To withdraw this, ask to delete your data.", true],
    ["lenders", "Share with lenders only when I choose", "Nothing is sent unless you approve a referral pack.", false],
    ["aiCoach", "AI coach may process my questions", "Optional. Turn it off and the coach stays closed.", false],
  ];
  const download = () => {
    const slice = { exportedAt: new Date().toISOString(), profile: { ...db.me, account: db.account }, consents: db.consents, settings: db.settings, records: db.txns, documents: db.docs, profileDetails: db.profileFields, financialSummary: db.summary, learning: db.modules.map((m) => ({ id: m.id, title: m.t, status: m.status, rating: m.rating })), referral: db.referral, referralHistory: db.referralHistory, aiCoachChat: db.chat, scoreReviews: db.scoreReviews, dataRequests: db.dataRequests, feedback: db.feedback, followUps: db.followUps };
    const blob = new Blob([JSON.stringify(slice, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "neary-my-data.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    act.submitDataRequest({ type: "access", note: "Downloaded in the app" });
  };
  const close = () => { setSheet(null); setNote(""); };
  return (
    <div className="pb-4">
      <AppBar title="Privacy and my data" onBack={back} />
      <div className="p-4 space-y-5">
        <div>
          <SectionHead>My consents</SectionHead>
          <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
            {consentRows.map(([k, title, sub, locked]) => (
              <div key={k} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0"><div className="text-sm font-bold" style={{ color: C.navy }}>{t(title)}</div><div className="text-xs" style={{ color: C.soft }}>{t(sub)}</div></div>
                {locked ? <Pill tone="green" small>On, required</Pill> : (
                  <Switch on={c[k]} onChange={(v) => act.setConsent(k, v)} label={title} />
                )}
              </div>
            ))}
          </Card>
        </div>

        <div>
          <SectionHead>Consent history</SectionHead>
          {(!db.consentLog || db.consentLog.length === 0) ? <p className="text-sm" style={{ color: C.soft }}>{t("No consent changes recorded yet.")}</p> : (
            <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
              {db.consentLog.map((e, i) => (
                <Row key={i} className="!py-2.5" icon={e.action === "granted" ? ShieldCheck : ShieldOff}
                  iconBg={e.action === "granted" ? C.greenSoft : C.redSoft} iconColor={e.action === "granted" ? C.green : C.red}
                  title={tp(e.action === "granted" ? "You allowed {a}" : "You withdrew {a}", { a: t(CONSENT_LOG_LABEL[e.type] || e.type) })}
                  sub={fmtDate(e.at)} right={null} />
              ))}
            </Card>
          )}
          <p className="text-[11px] mt-2 flex items-center gap-1" style={{ color: C.soft }}><History size={11} />{t("Every grant or withdrawal is kept here permanently, it is never overwritten.")}</p>
        </div>

        <div>
          <SectionHead>What data we hold</SectionHead>
          <div className="space-y-3">
            {GROUPS.map((g) => (
              <Card key={g.k} className="p-4">
                <Pill tone={g.tone}>{g.k}</Pill>
                <div className="divide-y mt-1" style={{ borderColor: C.line }}>
                  {g.rows.map(([d, why, who]) => (
                    <div key={d} className="py-2.5">
                      <div className="text-sm font-bold" style={{ color: C.navy }}>{t(d)}</div>
                      <div className="text-xs mt-0.5" style={{ color: C.mute }}><b>{t("Why")}:</b> {t(why)}</div>
                      <div className="text-xs" style={{ color: C.mute }}><b>{t("Who can see it")}:</b> {t(who)}</div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <SectionHead>How long we keep it</SectionHead>
          <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
            {RETENTION.map(([d, p]) => (
              <div key={d} className="py-2.5">
                <div className="text-sm font-bold" style={{ color: C.navy }}>{t(d)}</div>
                <div className="text-xs font-bold mt-0.5" style={{ color: C.pinkDeep }}>{t(p)}</div>
                <div className="mt-1.5"><span className="inline-block rounded-2xl px-2 py-0.5 text-[10px] font-bold" style={{ background: C.amberSoft, color: C.amber }}>{t(PROPOSED)}</span></div>
              </div>
            ))}
          </Card>
        </div>

        <Card className="p-4">
          <Row icon={MapPin} title="Where your data is stored" sub="Hosting location under review with MoWA" right={null} />
          <Row icon={UserCog} title="Privacy questions" sub="Data Protection Officer — to be appointed" right={null} />
        </Card>

        <div>
          <SectionHead>My data rights</SectionHead>
          <div className="space-y-2">
            <Btn full variant="ghost" onClick={download}><Download size={15} />Download my data</Btn>
            <Btn full variant="quiet" onClick={() => setSheet("correction")}><PenLine size={15} />Ask to correct my data</Btn>
            <Btn full variant="quiet" onClick={() => setSheet("deletion")}><Trash2 size={15} />Ask to delete my data</Btn>
          </div>
          <p className="text-[11px] mt-2" style={{ color: C.soft }}>{t("We answer correction and deletion requests within 30 days.")}</p>
        </div>

        <div>
          <SectionHead>My requests</SectionHead>
          {db.dataRequests.length === 0 ? <p className="text-sm" style={{ color: C.soft }}>{t("No requests yet.")}</p> : (
            <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
              {db.dataRequests.map((r) => (
                <div key={r.id} className="py-3">
                  <Row className="!py-0" icon={r.type === "deletion" ? Trash2 : r.type === "correction" ? PenLine : Download} title={REQ_LABEL[r.type]} sub={`${r.id}, ${fmtDate(r.createdAt)}`} right={<Pill tone="amber" small>{r.status}</Pill>} />
                  <div className="text-xs mt-1 pl-[50px] flex items-center gap-1" style={{ color: C.mute }}><Clock size={11} />{tp("Answer due by {d}", { d: fmtDate(r.dueAt) })}</div>
                  {r.note && <div className="text-xs pl-[50px]" style={{ color: C.soft }}>{r.note}</div>}
                </div>
              ))}
            </Card>
          )}
        </div>

        <Card className="p-4" style={{ background: C.blush2 }}>
          <div className="flex gap-2.5"><ShieldAlert size={18} style={{ color: C.pink }} className="shrink-0 mt-0.5" /><div className="text-xs font-semibold" style={{ color: C.navy }}>{t("If your data is ever exposed we will tell you and the Ministry within 72 hours.")}</div></div>
        </Card>
      </div>
      {sheet && (
        <Sheet title={sheet === "deletion" ? "Ask to delete my data" : "Ask to correct my data"} sub="We reply within 30 days" onClose={close}
          footer={<Btn full variant={sheet === "deletion" ? "navy" : "primary"} disabled={sheet === "correction" && !note.trim()} onClick={() => { act.submitDataRequest({ type: sheet, note: note.trim() }); close(); }}>{sheet === "deletion" ? "Yes, ask to delete" : "Send request"}</Btn>}>
          <p className="text-sm" style={{ color: C.mute }}>{sheet === "deletion"
            ? t("We will delete your account and records within 30 days. Deleting removes your readiness score and any lender referral in progress. You can also ask us to keep what the law requires. We will confirm by phone before we delete anything.")
            : t("Tell us which detail is wrong and what it should say. We will fix it or explain why we cannot within 30 days.")}</p>
          <Field label={sheet === "deletion" ? "Anything you want us to know (optional)" : "What should we correct?"}><textarea className={inputCls} style={{ borderColor: C.line }} rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        </Sheet>
      )}
    </div>
  );
}
