import { Check, Clock, X, Landmark, GraduationCap, PhoneCall, CalendarClock, PartyPopper, ListChecks } from "lucide-react";
import { t, tp } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { fmtDate, fmtTime } from "../data/format.js";
import { Card, Pill, Row, Btn, IconDot } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";

const FU_LABEL = { lender: "Applying to another lender", coaching: "Coaching lesson", officer: "Officer call-back", recheck: "Re-check readiness" };

/* Shown on the status screen and the finance summary once a lender declines. */
export function DeclinedNextSteps({ db, go, act }) {
  const lesson = db.modules.find((m) => m.cat === "Finance" && m.status !== "Completed") || db.modules.find((m) => m.status !== "Completed");
  const actions = [
    [Landmark, "Apply to another lender", "Pick a different partner and send a new pack", () => { act.addFollowUp("lender", "Chose to apply to another lender", null); go("referral"); }],
    [GraduationCap, "Follow a coaching module", lesson ? lesson.t : "Open the lessons", () => { act.addFollowUp("coaching", lesson ? `Started lesson: ${lesson.t}` : "Opened the lessons", null); lesson ? go("module", lesson.id) : go("learn"); }],
    [PhoneCall, "Talk to an officer", "An officer calls you back within 2 days", () => act.officer()],
    [CalendarClock, "Re-check my readiness later", "We remind you in 30 days", () => { act.addFollowUp("recheck", "Re-check readiness score", 30); act.toast("We will remind you to re-check in 30 days"); }],
  ];
  return (
    <Card className="p-4" style={{ borderColor: C.red }}>
      <div className="text-base font-extrabold" style={{ color: C.navy, fontFamily: HEAD }}>{t("What you can do next")}</div>
      <p className="text-xs mt-0.5" style={{ color: C.mute }}>{t("A no from one lender is not a no from all of them. Lenders decide for their own reasons.")}</p>
      <div className="divide-y mt-1" style={{ borderColor: C.line }}>
        {actions.map(([I, title, sub, fn]) => <Row key={title} icon={I} title={title} sub={sub} onClick={fn} />)}
      </div>
    </Card>
  );
}

export function ReferralStatusScreen({ db, back, go, act }) {
  const r = db.referral;
  const decided = r.status === "approved" || r.status === "declined";
  const stages = ["Referred", "Application pending", r.status === "approved" ? "Approved" : r.status === "declined" ? "Declined" : "Decision"];
  const idx = r.status === "submitted" ? 0 : r.status === "pending" ? 1 : 2;
  return (
    <div className="pb-4">
      <AppBar title="Your Referral" onBack={back} />
      <div className="p-4 space-y-4">
        <Card className="p-4">
          <div className="text-xs font-bold" style={{ color: C.soft }}>{t("SENT")} {r.submittedAt ? fmtDate(r.submittedAt).toUpperCase() : ""}</div>
          <div className="flex flex-wrap gap-2 mt-2">{r.lenders.map((n) => <Pill key={n} tone="pink">{n}</Pill>)}</div>
          <div className="mt-4 space-y-3">
            {stages.map((s, i) => {
              const last = i === 2 && decided;
              const bg = last ? (r.status === "approved" ? C.green : C.red) : C.pink;
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={i <= idx ? { background: bg, color: "#fff" } : { background: C.blush2, color: C.soft, border: `1px solid ${C.line}` }}>{last ? (r.status === "approved" ? <Check size={13} /> : <X size={13} />) : i < idx ? <Check size={13} /> : i + 1}</span>
                  <span className="text-sm font-bold" style={{ color: i <= idx ? C.navy : C.soft }}>{t(s)}</span>
                  {i === idx && !decided && <Pill tone="amber" small>Now</Pill>}
                </div>
              );
            })}
          </div>
        </Card>

        {r.status === "approved" && (
          <Card className="p-4" style={{ background: C.greenSoft, borderColor: C.green }}>
            <div className="flex gap-3"><IconDot icon={PartyPopper} size={40} bg="#fff" color={C.green} />
              <div><div className="text-sm font-extrabold" style={{ color: C.navy }}>{t("Approved in principle")}</div><div className="text-xs mt-0.5" style={{ color: C.mute }}>{t("The lender will call you to finish the paperwork. The final terms are the lender's decision. Read them carefully and ask an officer if anything is unclear.")}</div></div></div>
          </Card>
        )}
        {r.status === "declined" && (
          <>
            <Card className="p-4" style={{ background: C.redSoft, borderColor: C.red }}>
              <div className="text-sm font-extrabold" style={{ color: C.navy }}>{t("The lender could not offer a loan this time")}</div>
              <div className="text-xs mt-0.5" style={{ color: C.mute }}>{t("This is not a judgement on you or your business. Your records and score stay as they are.")}</div>
            </Card>
            <DeclinedNextSteps db={db} go={go} act={act} />
          </>
        )}

        <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
          {r.events.slice().reverse().map((e, i) => <Row key={i} icon={Clock} title={e.t} sub={`${fmtDate(e.at)}, ${fmtTime(e.at)}`} right={null} />)}
        </Card>

        {db.followUps.length > 0 && (
          <div>
            <SectionHead>My follow-ups</SectionHead>
            <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
              {db.followUps.slice(0, 5).map((f) => <Row key={f.id} icon={ListChecks} iconBg={C.aquaSoft} iconColor="#1F8E86" title={FU_LABEL[f.type] || f.type} sub={f.dueAt ? tp("{d}, due {e}", { d: fmtDate(f.createdAt), e: fmtDate(f.dueAt) }) : fmtDate(f.createdAt)} right={<Pill tone="amber" small>{f.status}</Pill>} />)}
            </Card>
          </div>
        )}

        <Card className="p-3.5" style={{ background: C.aquaSoft, borderColor: C.aquaSoft }}>
          <div className="text-xs" style={{ color: C.ink }}>{t("The lender will contact you on your registered phone number. Neary never asks for a fee to arrange a loan.")}</div>
        </Card>

        <Card className="p-4" style={{ background: C.amberSoft, borderColor: C.amber, borderStyle: "dashed" }}>
          <div className="text-xs font-extrabold" style={{ color: C.amber }}>{t("Demo: simulate lender decision")}</div>
          <p className="text-[11px] mt-0.5" style={{ color: C.mute }}>{t("Only for testing. In real use the lender sends the decision.")}</p>
          <div className="flex gap-2 mt-2.5"><Btn small variant="aqua" onClick={() => act.decideReferral("approved")}>Approve</Btn><Btn small variant="quiet" onClick={() => act.decideReferral("declined")}>Decline</Btn></div>
        </Card>
      </div>
    </div>
  );
}
