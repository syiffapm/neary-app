import { CheckCircle2, Clock, Camera } from "lucide-react";
import { C, HEAD } from "../theme.js";
import { scoreParts } from "../data/db.js";
import { Card, Meter, IconDot, Pill, Btn } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";

export function DocsScreen({ db, back, act }) {
  const p = scoreParts(db);
  const tone = { Verified: "green", "Under review": "amber", Needed: "neutral" };
  return (
    <div>
      <AppBar title="Required Documents" onBack={back} />
      <div className="p-4 space-y-3">
        <Card className="p-4">
          <div className="flex items-center justify-between"><span className="text-sm font-bold" style={{ color: C.navy }}>Documents verified</span><span className="font-extrabold" style={{ color: C.pink, fontFamily: HEAD }}>{p.documents} / 20</span></div>
          <div className="mt-2"><Meter value={p.documents} max={20} /></div>
        </Card>
        {db.docs.map((d) => (
          <Card key={d.id} className="p-3.5">
            <div className="flex items-center gap-3">
              <IconDot icon={d.status === "Verified" ? CheckCircle2 : d.status === "Under review" ? Clock : Camera} size={38}
                bg={d.status === "Verified" ? C.greenSoft : d.status === "Under review" ? C.amberSoft : C.blush} color={d.status === "Verified" ? C.green : d.status === "Under review" ? C.amber : C.pink} />
              <div className="flex-1 min-w-0"><div className="text-sm font-bold" style={{ color: C.navy }}>{d.name}</div><div className="text-xs" style={{ color: C.soft }}>{d.note}</div></div>
              <Pill tone={tone[d.status]} small>{d.status}</Pill>
            </div>
            {d.status === "Needed" && <Btn full small variant="ghost" className="mt-3" onClick={() => act.uploadDoc(d.id)}><Camera size={14} />Take a photo</Btn>}
          </Card>
        ))}
        <p className="text-xs" style={{ color: C.soft }}>Your documents stay on the platform. They are only shared with a lender after you agree to a referral.</p>
      </div>
    </div>
  );
}
