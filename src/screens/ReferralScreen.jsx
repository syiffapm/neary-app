import { useState } from "react";
import { Landmark, Check, ShieldCheck } from "lucide-react";
import { C, HEAD } from "../theme.js";
import { LENDERS } from "../data/business.js";
import { t, tp } from "../i18n/dict.js";
import { wegsStatus } from "../data/db.js";
import { Card, IconDot, Btn, Pill } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";

export function ReferralScreen({ db, go, back, act }) {
  const wegs = wegsStatus(db);
  const [sel, setSel] = useState([]);
  const [consent, setConsent] = useState(false);
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <div className="pb-4">
      <AppBar title="Finance Referral" onBack={back} />
      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center text-center">
          <IconDot icon={Landmark} size={62} />
          <h2 className="text-lg font-extrabold mt-3" style={{ color: C.navy, fontFamily: HEAD }}>Connect to Financial Institutions</h2>
          <p className="text-sm mt-1" style={{ color: C.mute }}>Share your business information to be considered for financial products and services.</p>
        </div>
        <div className="space-y-2.5">
          {LENDERS.map((l) => {
            const on = sel.includes(l.id);
            const declined = db.referral.status === "declined" && db.referral.lenders.includes(l.name);
            if (l.guarantee || declined) {
              return (
                <Card key={l.id} className="p-3.5" style={{ background: "#F7F7FA", opacity: 0.95 }}>
                  <div className="flex items-center gap-3" aria-disabled="true">
                    <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-[10px] font-extrabold text-white shrink-0" style={{ background: C.soft }}>{l.initials}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold" style={{ color: C.mute }}>{l.name}</div>
                      <div className="mt-1"><Pill tone={declined ? "red" : "amber"} small>{declined ? "Declined earlier" : "In discussion — not available yet"}</Pill></div>
                      <div className="text-[11px] mt-1" style={{ color: C.mute }}>{declined ? t("This lender said no last time. Choose another one.") : t("The guarantee is still being agreed with the Ministry and cannot be chosen yet. It is applied for through a lender, not on its own.")}</div>
                    </div>
                  </div>
                  {l.guarantee && (
                    <button onClick={() => go("wegs")} className="w-full flex items-center gap-2 mt-3 pt-3 border-t text-left active:opacity-60" style={{ borderColor: C.line }}>
                      <ShieldCheck size={15} style={{ color: wegs.eligible ? C.green : C.amber }} />
                      <span className="flex-1 text-xs font-bold" style={{ color: C.navy }}>{t("Your WEGS eligibility")}</span>
                      <Pill tone={wegs.eligible ? "green" : "amber"} small>{tp("{n} of {m}", { n: wegs.met, m: wegs.total })}</Pill>
                    </button>
                  )}
                </Card>
              );
            }
            return (
              <Card key={l.id} className="p-3.5" onClick={() => toggle(l.id)} style={on ? { borderColor: C.pink, background: C.blush2 } : undefined}>
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-[10px] font-extrabold text-white shrink-0" style={{ background: l.color }}>{l.initials}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold" style={{ color: C.navy }}>{l.name}</div>
                    <div className="text-xs" style={{ color: C.soft }}>{l.desc}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: C.mute }}>Typical: {l.typical}, decision {l.decision.toLowerCase()}</div>
                  </div>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={on ? { background: C.pink, color: "#fff" } : { border: `2px solid ${C.line}` }}>{on && <Check size={13} />}</span>
                </div>
              </Card>
            );
          })}
        </div>
        <Card className="p-3.5" onClick={() => { setConsent(!consent); act.setConsent("lenders", !consent); }} style={consent ? { borderColor: C.pink } : undefined}>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={consent ? { background: C.pink, color: "#fff" } : { border: `2px solid ${C.line}` }}>{consent && <Check size={13} />}</span>
            <span className="text-xs" style={{ color: C.mute }}>I agree to share my business information with the selected partner(s) for this referral. I can withdraw this at any time in my profile.</span>
          </div>
        </Card>
        <Btn full disabled={!sel.length || !consent} onClick={() => go("referralPack", sel.join(","))}>Review Referral Pack</Btn>
        <p className="text-xs text-center" style={{ color: C.soft }}>A referral is an introduction, not a loan offer.</p>
      </div>
    </div>
  );
}
