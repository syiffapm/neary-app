import { CheckCircle2, Camera, FileText, Info, Landmark, Calculator, Lock, ShieldCheck } from "lucide-react";
import { t, tp } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { scoreOf, scoreParts, isReady, isFormal, READY_AT, wegsStatus } from "../data/db.js";
import { Card, Ring, Row, Btn, Pill } from "../components/ui/Primitives.jsx";
import { DeclinedNextSteps } from "./ReferralStatusScreen.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";
import { ago } from "../data/format.js";

export function FinanceScreen({ db, go, back, act }) {
  const sc = scoreOf(db), p = scoreParts(db), wegs = wegsStatus(db);
  const items = [
    { id: "profile", label: "Business profile", v: p.profile, max: 25, state: p.profile >= 25 ? "Completed" : "In progress", go: ["profileDetail"] },
    { id: "records", label: "Transaction records", v: p.records, max: 30, state: p.records >= 27 ? "Completed" : "In progress", go: ["txns"] },
    { id: "summary", label: "Basic financial summary", v: p.summary, max: 25, state: p.summary >= 25 ? "Completed" : "In progress", go: ["summary"] },
    { id: "docs", label: "Required documents", v: p.documents, max: 20, state: p.documents >= 20 ? "Completed" : `${db.docs.filter((d) => d.status === "Needed").length} items needed`, go: ["docs"] },
  ];
  const r = db.referral;
  return (
    <div className="pb-4">
      <AppBar title="Finance Readiness" onBack={back} />
      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center">
          <Ring value={sc} size={160} sub="out of 100" />
          <div className="text-lg font-extrabold mt-3" style={{ color: C.navy, fontFamily: HEAD }}>{isReady(db) ? "You're on the right track!" : "Keep going"}</div>
          <div className="text-sm text-center px-6" style={{ color: C.mute }}>Here's what's complete and what to work on next.</div>
        </div>
        <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
          {items.map((it) => {
            const done = it.state === "Completed";
            return <Row key={it.id} title={it.label} onClick={() => go(...it.go)}
              icon={done ? CheckCircle2 : it.id === "docs" ? Camera : FileText}
              iconBg={done ? C.greenSoft : C.amberSoft} iconColor={done ? C.green : C.amber}
              sub={<span style={{ color: done ? C.green : C.amber }} className="font-bold">{it.state}</span>}
              right={<span className="text-xs font-bold mr-1" style={{ color: C.soft }}>{it.v}/{it.max}</span>} />;
          })}
        </Card>
        <Card className="px-4"><Row icon={Calculator} title="How your score works" sub="The four parts, the finance-ready line, and how to ask for a review" onClick={() => go("howScore")} /></Card>
        <Card className="px-4">
          <Row icon={ShieldCheck} iconBg={wegs.eligible ? C.greenSoft : C.amberSoft} iconColor={wegs.eligible ? C.green : C.amber}
            title="Guarantee eligibility (WEGS)" sub={tp("You meet {n} of {m} CGCC tests", { n: wegs.met, m: wegs.total })}
            onClick={() => go("wegs")} right={<Pill tone={wegs.eligible ? "green" : "amber"} small>{wegs.eligible ? "Eligible" : "Not yet"}</Pill>} />
        </Card>
        {isReady(db) && !isFormal(db) && (
          <Card className="p-3.5" style={{ background: C.amberSoft, borderColor: C.amber }}>
            <div className="flex gap-2.5"><Lock size={16} style={{ color: C.amber }} className="shrink-0 mt-0.5" /><div className="text-xs" style={{ color: C.ink }}><b>{t("Formalize first.")}</b> {t("Your score is high enough, but lenders expect a registered business. Formalizing is the step before being finance-ready.")}<button onClick={() => go("formalization")} className="block mt-1 font-bold underline" style={{ color: C.pinkDeep }}>{t("Open Become formal")}</button></div></div>
          </Card>
        )}
        <Card className="p-3.5" style={{ background: C.blush2 }}>
          <div className="flex gap-2.5"><Info size={16} style={{ color: C.pink }} className="shrink-0 mt-0.5" />
            <div className="text-xs" style={{ color: C.mute }}>This score shows how prepared your records are. It is not a loan approval. Each lender makes its own decision.</div></div>
        </Card>
        {r.status === "none" ? (
          <Btn full disabled={!isReady(db)} onClick={() => go("referral")}>{isReady(db) ? "Connect to financial institutions" : `Reach ${READY_AT} to be referred`}</Btn>
        ) : (
          <Card className="p-4" onClick={() => go("referralStatus")}>
            <Row icon={Landmark} iconBg={r.status === "declined" ? C.redSoft : C.aquaSoft} iconColor={r.status === "declined" ? C.red : "#1F8E86"} title={`${t("Referral")} ${t(r.status === "submitted" ? "sent" : r.status)}`} sub={`${r.lenders.join(", ")}, ${ago(r.submittedAt)}`} badge={r.status === "declined" ? <Pill tone="red" small>Declined</Pill> : r.status === "approved" ? <Pill tone="green" small>Approved</Pill> : null} />
          </Card>
        )}
        {r.status === "declined" && <DeclinedNextSteps db={db} go={go} act={act} />}
      </div>
    </div>
  );
}
