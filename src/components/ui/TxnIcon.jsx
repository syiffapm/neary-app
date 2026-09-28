import { QrCode, Receipt, Landmark } from "lucide-react";
import { C } from "../../theme.js";
import { IconDot } from "./Primitives.jsx";

export function TxnIcon({ t, size = 38 }) {
  const map = { khqr: [QrCode, C.aquaSoft, "#1F8E86"], manual: [Receipt, C.blush, C.pink], bank: [Landmark, "#EEF1FB", C.navy] };
  const [I, bg, col] = map[t.method] || map.manual;
  return <IconDot icon={I} size={size} bg={t.type === "income" ? bg : C.blush2} color={t.type === "income" ? col : C.pinkDeep} />;
}
