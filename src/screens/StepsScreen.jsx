import { Check, ChevronRight } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C } from "../theme.js";
import { nextSteps } from "../data/db.js";
import { Card } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";

const tr = (x) => t(x);
export function StepsScreen({ db, go, back }) {
  const steps = nextSteps(db);
  return (
    <div>
      <AppBar title="Recommended Next Steps" onBack={back} />
      <div className="p-4 space-y-3">
        <p className="text-sm" style={{ color: C.mute }}>Take these steps to build a stronger business.</p>
        {steps.map((s, i) => (
          <Card key={s.id} className="p-3.5" onClick={() => go(...s.go)}>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0" style={s.done ? { background: C.greenSoft, color: C.green } : { background: C.pink, color: "#fff" }}>{s.done ? <Check size={15} /> : i + 1}</span>
              <span className="flex-1 text-sm font-bold" style={{ color: s.done ? C.soft : C.navy, textDecoration: s.done ? "line-through" : "none" }}>{tr(s.t)}</span>
              <ChevronRight size={16} style={{ color: C.pink }} />
            </div>
          </Card>
        ))}
        <div className="text-xs text-center pt-2" style={{ color: C.soft }}>{steps.filter((s) => s.done).length} of {steps.length} completed</div>
      </div>
    </div>
  );
}
