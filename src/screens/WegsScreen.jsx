import { ShieldCheck, CheckCircle2, Circle, Info, ArrowRight } from "lucide-react";
import { t, tp } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { WEGS_CRITERIA, WEGS_NEEDED, wegsStatus } from "../data/db.js";
import { fmtDate } from "../data/format.js";
import { Card, Row, Btn, Switch } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";

export function WegsScreen({ db, go, back, act }) {
  const st = wegsStatus(db);
  const c = db.wegs.criteria;
  return (
    <div className="pb-4">
      <AppBar title="Guarantee eligibility (WEGS)" onBack={back} />
      <div className="p-4 space-y-4">
        <Card className="p-3.5" style={{ background: C.blush2 }}>
          <div className="flex gap-2.5">
            <Info size={16} style={{ color: C.pink }} className="shrink-0 mt-0.5" />
            <div className="text-xs" style={{ color: C.mute }}>
              {t("The Credit Guarantee Corporation of Cambodia (CGCC) only counts a business as “women-owned” for its Women Entrepreneurs Guarantee Scheme if it meets at least 2 of the 4 tests below. This is separate from your readiness score — it decides whether you qualify for this specific guarantee.")}
            </div>
          </div>
        </Card>

        <Card className="p-4 text-center" style={st.eligible ? { background: C.greenSoft, borderColor: C.greenSoft } : { background: C.amberSoft, borderColor: C.amberSoft }}>
          <ShieldCheck size={28} style={{ color: st.eligible ? C.green : C.amber }} className="mx-auto" />
          <div className="text-lg font-extrabold mt-1.5" style={{ color: st.eligible ? C.green : C.amber, fontFamily: HEAD }}>
            {tp("You meet {n} of {m}", { n: st.met, m: st.total })}
          </div>
          <div className="text-sm mt-0.5" style={{ color: C.ink }}>
            {st.eligible ? t("2 of 4 needed — you qualify for the WEGS guarantee.") : tp("2 of 4 needed — you need {n} more.", { n: Math.max(0, WEGS_NEEDED - st.met) })}
          </div>
          {db.wegs.lastUpdated && <div className="text-[11px] mt-1" style={{ color: C.soft }}>{tp("Last confirmed {d}", { d: fmtDate(db.wegs.lastUpdated) })}</div>}
        </Card>

        <div>
          <SectionHead>The 4 tests</SectionHead>
          <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
            {WEGS_CRITERIA.map((x) => (
              <div key={x.key} className="flex items-start gap-3 py-3.5">
                <span className="mt-0.5 shrink-0" style={{ color: c[x.key] ? C.green : C.soft }}>{c[x.key] ? <CheckCircle2 size={18} /> : <Circle size={18} />}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold" style={{ color: C.navy }}>{t(x.t)}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.soft }}>{t(x.d)}</div>
                </div>
                <Switch on={!!c[x.key]} onChange={(v) => act.setWegsCriterion(x.key, v)} label={x.t} />
              </div>
            ))}
          </Card>
          <p className="text-[11px] mt-2" style={{ color: C.soft }}>{t("You confirm these yourself. CGCC or your lender may ask you to show proof, such as your registration certificate or payroll records.")}</p>
        </div>

        {!st.eligible && (
          <div>
            <SectionHead>What to do next</SectionHead>
            <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
              <Row icon={ArrowRight} title="Ask about naming a woman as legal representative" sub="Often the fastest change if your registration allows it" right={null} />
              <Row icon={ArrowRight} title="Check your shareholding split" sub="A majority female share only needs updated paperwork, not a new registration" right={null} />
              <Row icon={ArrowRight} title="You can still apply to a regular lender" sub="WEGS is only needed for the CGCC guarantee product" onClick={() => go("referral")} />
              <Row icon={ArrowRight} title="Talk to a MoWA officer" sub="They can advise which change is realistic for your business" onClick={() => act.officer()} />
            </Card>
          </div>
        )}

        <Btn full variant={st.eligible ? "primary" : "ghost"} onClick={() => go("referral")}>{st.eligible ? "Continue to Connect to Financial Institutions" : "See other financing options"}</Btn>
      </div>
    </div>
  );
}
