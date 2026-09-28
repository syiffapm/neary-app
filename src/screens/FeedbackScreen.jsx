import { useState } from "react";
import { Star } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C, inputCls } from "../theme.js";
import { fmtDate } from "../data/format.js";
import { Card, Btn, Field, Chips, Pill } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";

const CATS = ["App", "Learning", "AI coach", "Payments", "Other"];
export function FeedbackScreen({ db, back, act }) {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("App");
  const [text, setText] = useState("");
  return (
    <div className="pb-4">
      <AppBar title="Give feedback" onBack={back} />
      <div className="p-4 space-y-4">
        <Card className="p-4 space-y-4">
          <div>
            <div className="text-xs font-bold mb-1.5" style={{ color: C.navy }} id="fb-rate">{t("How is Neary working for you?")}</div>
            <div className="flex gap-1" role="radiogroup" aria-labelledby="fb-rate">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} role="radio" aria-checked={rating === n} onClick={() => setRating(n)} aria-label={`${n} / 5`} style={{ minHeight: 44 }} className="flex-1 min-w-0 flex items-center justify-center">
                  <Star size={30} style={{ color: rating >= n ? C.pink : C.soft }} fill={rating >= n ? C.pink : "none"} />
                </button>
              ))}
            </div>
          </div>
          <div><div className="text-xs font-bold mb-1.5" style={{ color: C.navy }}>{t("What is it about?")}</div><Chips options={CATS.map((c) => [c, c])} value={category} onChange={setCategory} /></div>
          <Field label="Tell us more (optional)"><textarea className={inputCls} style={{ borderColor: C.line }} rows={4} value={text} onChange={(e) => setText(e.target.value)} /></Field>
          <Btn full disabled={!rating} onClick={() => { act.addFeedback({ rating, category, text: text.trim() }); setRating(0); setText(""); setCategory("App"); }}>Send feedback</Btn>
        </Card>
        <div>
          <SectionHead>My past feedback</SectionHead>
          {db.feedback.length === 0 ? <p className="text-sm" style={{ color: C.soft }}>{t("You have not sent any feedback yet.")}</p> : (
            <div className="space-y-2">
              {db.feedback.map((f) => (
                <Card key={f.id} className="p-3.5">
                  <div className="flex items-center justify-between"><span aria-label={`${f.rating} / 5`} className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} style={{ color: f.rating >= n ? C.pink : C.line }} fill={f.rating >= n ? C.pink : "none"} />)}</span><Pill small tone="pink">{f.category}</Pill></div>
                  {f.text && <div className="text-sm mt-1.5" style={{ color: C.ink }}>{f.text}</div>}
                  <div className="text-[11px] mt-1" style={{ color: C.soft }}>{fmtDate(f.createdAt)}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
