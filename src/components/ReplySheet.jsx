import { useState } from "react";
import { C, inputCls } from "../theme.js";
import { Sheet } from "./ui/Sheet.jsx";
import { Field, Btn } from "./ui/Primitives.jsx";

export function ReplySheet({ onClose, act, id }) {
  const [t, setT] = useState("");
  return <Sheet title="Reply" onClose={onClose} footer={<Btn full disabled={t.trim().length < 3} onClick={() => { act.addReply(id, t.trim()); onClose(); }}>Post reply</Btn>}>
    <Field label="Your reply"><textarea rows={4} className={inputCls} style={{ borderColor: C.line }} value={t} onChange={(e) => setT(e.target.value)} /></Field>
  </Sheet>;
}
