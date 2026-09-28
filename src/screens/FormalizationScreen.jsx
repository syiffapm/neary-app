import { Building2, FileText, Landmark, Wallet, Receipt, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C, HEAD, GRAD } from "../theme.js";
import { formalStatus, guideState } from "../data/db.js";
import { GUIDES, FORMAL_STEPS } from "../data/business.js";
import { DAY, NOW_MS } from "../data/format.js";
import { Card, IconDot, Meter } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";

export const GUIDE_ICON = { type: Building2, reg: FileText, tax: Landmark, bank: Wallet, records: Receipt };

export function FormalizationScreen({ db, go, back }) {
  const status = formalStatus(db);
  const stageIdx = FORMAL_STEPS.indexOf(status);
  const overall = GUIDES.reduce((a, g) => a + guideState(db, g).count, 0);
  const overallTotal = GUIDES.reduce((a, g) => a + g.steps.length, 0);
  return (
    <div className="pb-4">
      <AppBar title="Become Formal" onBack={back} />
      <div className="p-4 space-y-4">
        <Card className="p-4" style={{ background: "linear-gradient(135deg, #FEF0F7 0%, #EEFAF9 100%)" }}>
          <div className="text-xs font-bold" style={{ color: C.soft }}>YOUR FORMALIZATION STATUS</div>
          <div className="text-lg font-extrabold leading-tight mt-0.5" style={{ color: C.navy, fontFamily: HEAD }}>{t(status)}</div>
          <div className="flex gap-1.5 mt-3">
            {FORMAL_STEPS.slice(1).map((s, i) => (
              <div key={s} className="flex-1"><div className="rounded-full" style={{ height: 6, background: i < stageIdx ? C.pink : "#F2DEE9" }} /><div className="text-[9px] mt-1 leading-tight" style={{ color: i < stageIdx ? C.pinkDeep : C.soft }}>{t(s)}</div></div>
            ))}
          </div>
          <div className="text-xs mt-3" style={{ color: C.mute }}>{overall} of {overallTotal} steps done across all guides. Registering makes you visible to buyers, banks and government programs.</div>
        </Card>

        {GUIDES.map((g) => {
          const st = guideState(db, g);
          const I = GUIDE_ICON[g.icon] || FileText;
          const stale = NOW_MS - g.validatedAt > 60 * DAY;
          return (
            <Card key={g.id} className="p-4" onClick={() => go("guide", g.id)}>
              <div className="flex items-start gap-3">
                <IconDot icon={st.complete ? CheckCircle2 : I} size={44} bg={st.complete ? C.greenSoft : C.blush} color={st.complete ? C.green : C.pink} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold leading-tight" style={{ color: C.navy }}>{g.t}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.soft }}>{g.sub}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1"><Meter value={st.count} max={st.total} h={5} color={st.complete ? C.green : GRAD} /></div>
                    <span className="text-[11px] font-bold shrink-0" style={{ color: st.complete ? C.green : C.soft }}>{st.count}/{st.total}</span>
                  </div>
                  {g.caution && <div className="flex items-start gap-1.5 mt-2"><AlertCircle size={12} style={{ color: C.amber }} className="shrink-0 mt-0.5" /><span className="text-[11px]" style={{ color: C.amber }}>Being confirmed with the tax department</span></div>}
                  {stale && !g.caution && <div className="text-[11px] mt-1.5" style={{ color: C.soft }}>Checked {Math.floor((NOW_MS - g.validatedAt) / DAY)} days ago</div>}
                </div>
                <ChevronRight size={16} style={{ color: C.pink }} className="mt-3" />
              </div>
            </Card>
          );
        })}
        <p className="text-xs" style={{ color: C.soft }}>These guides follow the official procedures. The Ministry of Women's Affairs re-checks them regularly, and the date each was last checked is shown inside the guide.</p>
      </div>
    </div>
  );
}
