import { useState } from "react";
import { C, inputCls } from "../theme.js";
import { Sheet } from "./ui/Sheet.jsx";
import { Field, Btn } from "./ui/Primitives.jsx";

export function GoalSheet({ onClose, act }) {
  const [t, setT] = useState("");
  return <Sheet title="Add a goal" sub="Make it specific and give it a date." onClose={onClose} footer={<Btn full disabled={t.trim().length < 4} onClick={() => { act.addGoal(t.trim()); onClose(); }}>Add goal</Btn>}>
    <Field label="Your goal"><input className={inputCls} style={{ borderColor: C.line }} value={t} onChange={(e) => setT(e.target.value)} placeholder="e.g. Sell 40 scarves a month by June" /></Field>
  </Sheet>;
}
