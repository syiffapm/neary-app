import { CheckCircle2, Circle } from "lucide-react";
import { C, HEAD } from "../theme.js";
import { scoreParts } from "../data/db.js";
import { Card, Meter, IconDot, Pill } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";

export function SummaryScreen({ db, back, act }) {
  const p = scoreParts(db);
  return (
    <div>
      <AppBar title="Financial Summary" onBack={back} />
      <div className="p-4 space-y-3">
        <Card className="p-4">
          <div className="flex items-center justify-between"><span className="text-sm font-bold" style={{ color: C.navy }}>Summary completeness</span><span className="font-extrabold" style={{ color: C.pink, fontFamily: HEAD }}>{p.summary} / 25</span></div>
          <div className="mt-2"><Meter value={p.summary} max={25} /></div>
        </Card>
        <p className="text-sm" style={{ color: C.mute }}>Lenders ask for these four things first. Each one you complete raises your score.</p>
        {db.summary.map((s) => (
          <Card key={s.id} className="p-3.5" onClick={() => act.toggleSummary(s.id)}>
            <div className="flex items-center gap-3">
              <IconDot icon={s.done ? CheckCircle2 : Circle} size={36} bg={s.done ? C.greenSoft : C.blush2} color={s.done ? C.green : C.soft} />
              <div className="flex-1 min-w-0"><div className="text-sm font-bold" style={{ color: C.navy }}>{s.label}</div><div className="text-xs" style={{ color: C.soft }}>{s.hint}</div></div>
              {s.done ? <Pill tone="green" small>Done</Pill> : <Pill tone="amber" small>+6 points</Pill>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
