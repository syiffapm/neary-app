import { Store, Receipt, Wallet, ShieldCheck, Bot, Calculator } from "lucide-react";
import { C } from "../theme.js";
import { health, thisMonth, costTrend } from "../data/db.js";
import { usd } from "../data/format.js";
import { Card, IconDot, Pill, Btn, Row } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";

export function HealthScreen({ db, go, back }) {
  const h = health(db), t = thisMonth(db), ct = costTrend(db);
  return (
    <div>
      <AppBar title="Business Health" onBack={back} />
      <div className="p-4 space-y-3">
        <p className="text-sm" style={{ color: C.mute }}>Here is an overview of your business. Tap any item to see what to do next.</p>
        {h.map((x) => (
          <Card key={x.id} className="p-4" onClick={() => go(...x.go)}>
            <div className="flex items-center gap-3 flex-wrap">
              <IconDot icon={x.id === "profile" ? Store : x.id === "records" ? Receipt : x.id === "cash" ? Wallet : ShieldCheck} size={42} bg={x.ok ? C.greenSoft : C.amberSoft} color={x.ok ? C.green : C.amber} />
              <div className="flex-1 min-w-[8rem]"><div className="font-bold" style={{ color: C.navy }}>{x.label}</div><div className="text-xs" style={{ color: C.soft }}>{x.detail}</div></div>
              <Pill tone={x.ok ? "green" : "amber"}>{x.ok ? "Good" : "Needs attention"}</Pill>
            </div>
          </Card>
        ))}
        <Card className="p-4" style={{ background: C.blush2 }}>
          <div className="flex items-start gap-2.5">
            <IconDot icon={Bot} size={34} bg="#fff" />
            <div className="text-sm" style={{ color: C.mute }}>
              <b style={{ color: C.navy }}>Neary AI:</b> Your sales went up this month, but costs took {ct.share.toFixed(0)}% of your sales against {ct.prevShare.toFixed(0)}% last month. Your net is still positive at {usd(t.net)}. Raw materials are your largest cost.
            </div>
          </div>
          <Btn full variant="ghost" className="mt-3" onClick={() => go("chat", "Why did my expenses increase?")}>Ask about this</Btn>
        </Card>
        <Card className="px-4"><Row icon={Calculator} title="How your score works" sub="What counts, and what Compliance means" onClick={() => go("howScore")} /></Card>
        <Btn full onClick={() => go("steps")}>View Recommendations</Btn>
      </div>
    </div>
  );
}
