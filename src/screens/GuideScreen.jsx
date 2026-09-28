import { FileText, AlertCircle, CheckCircle2, Camera, Check } from "lucide-react";
import { C, HEAD, GRAD } from "../theme.js";
import { guideState } from "../data/db.js";
import { GUIDES } from "../data/business.js";
import { fmtDate, DAY, NOW_MS } from "../data/format.js";
import { Card, IconDot, Meter, Row, Btn, Empty } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";
import { GUIDE_ICON } from "./FormalizationScreen.jsx";

export function GuideScreen({ db, id, go, back, act }) {
  const g = GUIDES.find((x) => x.id === id);
  if (!g) return <div><AppBar title="Guide" onBack={back} /><Empty icon={FileText} title="Guide not found" /></div>;
  const st = guideState(db, g);
  const I = GUIDE_ICON[g.icon] || FileText;
  const stale = NOW_MS - g.validatedAt > 60 * DAY;
  const needs = [...new Set(g.steps.flatMap((s) => (s.need ? s.need.split(", ") : [])))];
  const docStatus = (label) => {
    const l = label.toLowerCase();
    if (l.includes("id card")) return db.docs.find((d) => d.id === "D1")?.status;
    if (l.includes("business photo")) return db.docs.find((d) => d.id === "D2")?.status;
    if (l.includes("address")) return db.docs.find((d) => d.id === "D3")?.status;
    if (l.includes("certificate")) return db.registration.status === "submitted" ? "Submitted, awaiting approval" : "Needed";
    return null;
  };
  return (
    <div className="pb-4">
      <AppBar title="Formalization Guide" onBack={back} />
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <IconDot icon={I} size={52} />
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold leading-tight" style={{ color: C.navy, fontFamily: HEAD }}>{g.t}</h2>
            <div className="text-xs mt-0.5" style={{ color: C.soft }}>{g.sub}</div>
          </div>
        </div>

        <Card className="p-3.5">
          <div className="flex items-center gap-2"><span className="text-xs font-bold" style={{ color: C.navy }}>Your progress</span><span className="ml-auto text-xs font-extrabold" style={{ color: st.complete ? C.green : C.pink }}>{st.count} of {st.total}</span></div>
          <div className="mt-2"><Meter value={st.count} max={st.total} color={st.complete ? C.green : GRAD} /></div>
        </Card>

        {g.caution && (
          <Card className="p-3.5" style={{ background: C.amberSoft, borderColor: C.amberSoft }}>
            <div className="flex gap-2.5"><AlertCircle size={16} style={{ color: C.amber }} className="shrink-0 mt-0.5" /><div className="text-xs" style={{ color: C.ink }}>{g.caution}</div></div>
            <Btn full small variant="quiet" className="mt-2.5" onClick={() => act.toast(`A MoWA officer in ${db.me.province} will call you back`)}>Ask my provincial officer</Btn>
          </Card>
        )}

        {needs.length > 0 && (
          <div>
            <SectionHead>What you need</SectionHead>
            <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
              {needs.map((n) => {
                const s = docStatus(n);
                const ok = s === "Verified" || s === "Under review" || s === "Submitted, awaiting approval";
                return <Row key={n} icon={ok ? CheckCircle2 : Camera} iconBg={ok ? C.greenSoft : C.blush} iconColor={ok ? C.green : C.pink}
                  title={n} sub={s || "Bring the original with you"} right={s && !ok ? <Btn small variant="ghost" onClick={() => go("docs")}>Add</Btn> : null} />;
              })}
            </Card>
          </div>
        )}

        <div>
          <SectionHead>Steps</SectionHead>
          <div className="space-y-2.5">
            {g.steps.map((s, i) => {
              const done = st.done[i];
              const locked = !!s.auto;
              return (
                <Card key={s.id} className="p-3.5" style={done ? { borderColor: C.greenSoft, background: "#FAFEFC" } : undefined}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => !locked && act.toggleGuideStep(g.id, s.id)} disabled={locked}
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={done ? { background: C.green, color: "#fff" } : { border: `2px solid ${locked ? C.line : C.pink}`, color: C.pink }}
                      aria-label={done ? "Completed" : "Mark step done"}>
                      {done ? <Check size={14} /> : <span className="text-xs font-extrabold">{i + 1}</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold" style={{ color: done ? C.soft : C.navy }}>{s.t}</div>
                      <div className="text-xs mt-1 leading-relaxed" style={{ color: C.mute }}>{s.d}</div>
                      {locked && <div className="text-[11px] mt-1.5 font-semibold" style={{ color: done ? C.green : C.soft }}>{done ? "Done automatically from your records" : "Tracked automatically from your records"}</div>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {g.action === "register" && (
          <Btn full onClick={() => go("register")}>{db.registration.status === "submitted" ? "View your registration" : "Open the registration form"}</Btn>
        )}
        {g.id === "G-04" && <Btn full variant="ghost" onClick={() => go("referral")}>See partner banks</Btn>}
        {g.id === "G-05" && <Btn full variant="ghost" onClick={() => go("txns")}>Check my records</Btn>}
        {g.id === "G-03" && db.registration.status !== "submitted" && (
          <Card className="p-3.5" style={{ background: C.blush2 }}>
            <div className="text-xs" style={{ color: C.mute }}>Register your business first. A Tax ID normally needs the registration certificate.</div>
            <Btn full small className="mt-2.5" onClick={() => go("guide", "G-02")}>Go to registration guide</Btn>
          </Card>
        )}

        <Card className="p-3.5">
          <div className="text-[11px]" style={{ color: C.soft }}>
            <b style={{ color: C.navy }}>Source:</b> {g.source}. Maintained by {g.owner}.<br />
            Last checked {fmtDate(g.validatedAt)}{stale ? ", due for re-checking" : ""}.
          </div>
        </Card>
      </div>
    </div>
  );
}
