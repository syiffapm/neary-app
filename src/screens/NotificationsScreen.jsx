import { QrCode, Sparkles, Camera, BookOpen, Landmark, Bell } from "lucide-react";
import { C } from "../theme.js";
import { ago } from "../data/format.js";
import { Card, Row, Empty } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";

export function NotificationsScreen({ db, go, back, act }) {
  const ICONS = { pay: [QrCode, C.aquaSoft, "#1F8E86"], spark: [Sparkles, C.blush, C.pink], doc: [Camera, C.amberSoft, C.amber], learn: [BookOpen, C.blush, C.pink], ref: [Landmark, C.blush2, C.navy] };
  return (
    <div>
      <AppBar title="Notifications" onBack={back} right={<button onClick={act.readAll} className="text-xs font-bold" style={{ color: C.pink }}>Mark all read</button>} />
      <div className="p-4 space-y-2">
        {db.notifications.map((n) => {
          const [I, bg, col] = ICONS[n.icon] || ICONS.spark;
          return (
            <Card key={n.id} className="px-4" onClick={() => { act.readOne(n.id); go(...n.go); }} style={n.read ? undefined : { borderColor: C.pink, background: C.blush2 }}>
              <Row icon={I} iconBg={bg} iconColor={col} title={n.t} sub={`${n.s}, ${ago(n.at)}`} />
            </Card>
          );
        })}
        {db.notifications.length === 0 && <Empty icon={Bell} title="No notifications" />}
      </div>
    </div>
  );
}
