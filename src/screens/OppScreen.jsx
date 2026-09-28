import { Users, Store, Coins, GraduationCap, Clock, Sparkles, CheckCircle2, Gift } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { DAY, NOW_MS } from "../data/format.js";
import { fmtDate } from "../data/format.js";
import { Card, IconDot, Row, Btn, Empty } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";

export function OppScreen({ db, id, back, act }) {
  const o = db.opps.find((x) => x.id === id);
  if (!o) return <div><AppBar title="Opportunity" onBack={back} /><Empty title="Not found" /></div>;
  return (
    <div className="pb-4">
      <AppBar title={o.type} onBack={back} />
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <IconDot icon={o.type === "Mentorship" ? Users : o.type === "Market access" ? Store : o.type === "Finance" ? Coins : GraduationCap} size={54} />
          <div><h2 className="text-lg font-extrabold leading-tight" style={{ color: C.navy, fontFamily: HEAD }}>{o.t}</h2><div className="text-xs mt-0.5" style={{ color: C.soft }}>{t(o.by)}</div></div>
        </div>
        {o.reward && (
          <Card className="p-4" style={{ background: "linear-gradient(135deg, #FEF0F7 0%, #EEFAF9 100%)" }}>
            <div className="flex items-start gap-3">
              <Gift size={22} style={{ color: C.pinkDeep }} className="shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold" style={{ color: C.soft }}>{t("YOUR REWARD")}</div>
                <div className="text-sm font-extrabold leading-tight" style={{ color: C.pinkDeep }}>{t(o.reward)}</div>
              </div>
            </div>
          </Card>
        )}
        <Card className="p-4"><p className="text-sm" style={{ color: C.mute }}>{o.about}</p></Card>
        <Card className="p-3.5" style={{ background: C.aquaSoft, borderColor: C.aquaSoft }}>
          <div className="flex gap-2.5"><Sparkles size={16} style={{ color: "#1F8E86" }} className="shrink-0 mt-0.5" />
            <div className="text-xs" style={{ color: C.ink }}><b>Why you were matched:</b> {o.why}</div></div>
        </Card>
        <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
          <Row icon={Clock} title="Applications close" sub={`${fmtDate(o.closes)}, in ${Math.ceil((o.closes - NOW_MS) / DAY)} days`} right={null} />
          <Row icon={Users} title="Places available" sub={`${o.places} places, ${o.applied} women applied so far`} right={null} />
        </Card>
        {o.applied_by_me ? (
          <Card className="p-4 text-center" style={{ background: C.greenSoft, borderColor: C.greenSoft }}>
            <CheckCircle2 size={26} style={{ color: C.green }} className="mx-auto" />
            <div className="text-sm font-bold mt-1.5" style={{ color: C.green }}>Your application was sent</div>
            <div className="text-xs mt-0.5" style={{ color: C.mute }}>The organiser will contact you on your registered number.</div>
          </Card>
        ) : <Btn full onClick={() => act.applyOpp(o.id)}>Apply now</Btn>}
      </div>
    </div>
  );
}
