import { t } from "../i18n/dict.js";
import { C } from "../theme.js";
import { scoreOf, scoreParts, thisMonth, allTime, weeksCovered } from "../data/db.js";
import { LENDERS } from "../data/business.js";
import { usd } from "../data/format.js";
import { Card, Pill, Btn } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";

export function ReferralPackScreen({ db, ids, back, act, go }) {
  const sel = (ids || "").split(",").filter(Boolean);
  const p = scoreParts(db), mt = thisMonth(db), all = allTime(db);
  const rows = [
    ["Business", `${db.me.biz}, ${db.me.sector}`], ["Owner", db.me.name], ["Location", `${db.me.province}, Cambodia`],
    ["Trading since", "6 years, on Neary since 12 Oct 2027"], ["Readiness score", `${scoreOf(db)} out of 100`],
    ["Sales this month", usd(mt.inc)], ["Average monthly sales", usd(all.inc / 4)], ["Net profit since joining", usd(all.net)],
    ["Records", `${db.txns.length} transactions, ${weeksCovered(db)} of last 4 weeks covered`],
    ["Verified documents", `${p.documents / 5} of ${db.docs.length}`],
  ];
  return (
    <div className="pb-4">
      <AppBar title="Review Referral Pack" onBack={back} />
      <div className="p-4 space-y-4">
        <p className="text-sm" style={{ color: C.mute }}>This is exactly what {sel.length > 1 ? "each partner" : "the partner"} will see. Nothing else is shared.</p>
        <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5"><span className="text-xs" style={{ color: C.soft }}>{t(k)}</span><span className="text-xs font-bold text-right" style={{ color: C.navy }}>{v}</span></div>
          ))}
        </Card>
        <Card className="p-3.5" style={{ background: C.blush2 }}>
          <div className="text-xs font-bold mb-1.5" style={{ color: C.navy }}>Not shared</div>
          <div className="text-xs" style={{ color: C.mute }}>Your phone number, national ID number, individual customer names, and your chat with the Neary coach.</div>
        </Card>
        <div>
          <SectionHead>Going to</SectionHead>
          <div className="flex flex-wrap gap-2">{sel.map((id) => { const l = LENDERS.find((x) => x.id === id); return <Pill key={id} tone="pink">{l?.name}</Pill>; })}</div>
        </div>
        <Btn full onClick={() => { act.submitReferral(sel); go("referralStatus"); }}>Send referral</Btn>
      </div>
    </div>
  );
}
