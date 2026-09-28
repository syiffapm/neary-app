import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { C, HEAD, inputCls } from "../theme.js";
import { scoreParts } from "../data/db.js";
import { Card, Row, Meter, Field, Btn } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";
import { Sheet } from "../components/ui/Sheet.jsx";

export function ProfileDetailScreen({ db, back, act }) {
  const [edit, setEdit] = useState(null);
  const p = scoreParts(db);
  return (
    <div>
      <AppBar title="Business Profile" onBack={back} />
      <div className="p-4 space-y-3">
        <Card className="p-4">
          <div className="flex items-center justify-between"><span className="text-sm font-bold" style={{ color: C.navy }}>Profile completeness</span><span className="font-extrabold" style={{ color: C.pink, fontFamily: HEAD }}>{p.profile} / 25</span></div>
          <div className="mt-2"><Meter value={p.profile} max={25} /></div>
        </Card>
        <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
          {db.profileFields.map((f) => (
            <Row key={f.id} title={f.label} sub={f.done ? f.value : "Not filled in yet"} onClick={() => setEdit(f)}
              icon={f.done ? CheckCircle2 : Circle} iconBg={f.done ? C.greenSoft : C.blush2} iconColor={f.done ? C.green : C.soft} />
          ))}
        </Card>
        <p className="text-xs" style={{ color: C.soft }}>Lenders and program officers see this summary, not your phone number or ID.</p>
      </div>
      {edit && (
        <Sheet title={edit.label} onClose={() => setEdit(null)} footer={<Btn full onClick={() => { act.setProfileField(edit.id, edit.value); setEdit(null); }} disabled={!edit.value.trim()}>Save</Btn>}>
          <Field label={edit.label}><input className={inputCls} style={{ borderColor: C.line }} value={edit.value} onChange={(e) => setEdit({ ...edit, value: e.target.value })} /></Field>
        </Sheet>
      )}
    </div>
  );
}
