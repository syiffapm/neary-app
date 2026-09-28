import { useState } from "react";
import { Store, Heart, MessageCircle } from "lucide-react";
import { C, inputCls } from "../theme.js";
import { ago } from "../data/format.js";
import { Card, Segmented, Row, Btn, Field } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";
import { Sheet } from "../components/ui/Sheet.jsx";
import { WomanAvatar } from "../components/ui/Illustrations.jsx";

export function CommunityScreen({ db, back, act }) {
  const [tab, setTab] = useState("all");
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <div className="pb-4">
      <AppBar title="Community" onBack={back} />
      <div className="px-4 pt-3 space-y-3">
        <Segmented options={[["all", "All"], ["disc", "Discussions"], ["events", "Events"]]} value={tab} onChange={setTab} />
        {tab === "events" ? (
          <Card className="p-4"><Row icon={Store} title="Provincial Handicraft and Food Fair" sub="12 to 14 February, Siem Reap provincial hall" right={null} /></Card>
        ) : db.community.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-start gap-3">
              <WomanAvatar seed={p.id + p.who} size={38} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-extrabold" style={{ color: C.navy }}>{p.who}</div>
                <div className="text-xs" style={{ color: C.soft }}>{p.biz}, {ago(p.at)}</div>
              </div>
            </div>
            <p className="text-sm mt-2.5" style={{ color: C.ink }}>{p.text}</p>
            <div className="flex items-center gap-4 mt-3">
              <button onClick={() => act.likePost(p.id)} className="flex items-center gap-1.5 text-xs font-bold active:opacity-60" style={{ color: p.liked ? C.pink : C.soft }}>
                <Heart size={15} fill={p.liked ? C.pink : "none"} />{p.likes}
              </button>
              <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: C.soft }}><MessageCircle size={15} />{p.replies.length}</span>
            </div>
            {p.replies.length > 0 && (
              <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: C.line }}>
                {p.replies.map((r, i) => (
                  <div key={i} className="flex gap-2.5"><WomanAvatar seed={r.who + i} size={26} /><div><div className="text-xs font-bold" style={{ color: C.navy }}>{r.who} <span className="font-normal" style={{ color: C.soft }}>{ago(r.at)}</span></div><div className="text-xs" style={{ color: C.mute }}>{r.text}</div></div></div>
                ))}
              </div>
            )}
            <Btn full small variant="quiet" className="mt-3" onClick={() => act.openReply(p.id)}>Reply</Btn>
          </Card>
        ))}
        <Btn full onClick={() => setOpen(true)}>Start a Discussion</Btn>
        <p className="text-xs text-center" style={{ color: C.soft }}>Be kind. Posts are moderated by MoWA officers.</p>
      </div>
      {open && (
        <Sheet title="Start a discussion" sub="Your first name and sector are shown, not your phone number." onClose={() => setOpen(false)}
          footer={<Btn full disabled={text.trim().length < 8} onClick={() => { act.addPost(text.trim()); setText(""); setOpen(false); }}>Post</Btn>}>
          <Field label="What would you like to ask or share?"><textarea rows={5} className={inputCls} style={{ borderColor: C.line }} value={text} onChange={(e) => setText(e.target.value)} /></Field>
        </Sheet>
      )}
    </div>
  );
}
