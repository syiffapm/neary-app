import { useState } from "react";
import { BookOpen, Star, ClipboardCheck } from "lucide-react";
import { t, tp } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { MODULE_BODY } from "../data/business.js";
import { lessonNumber } from "../data/db.js";
import { Card, Btn, Empty } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";

export function ModuleScreen({ db, id, back, act }) {
  const m = db.modules.find((x) => x.id === id);
  const [page, setPage] = useState(0);
  if (!m) return <div><AppBar title="Lesson" onBack={back} /><Empty icon={BookOpen} title="Lesson not found" /></div>;
  const body = (m.pages && m.pages.length ? m.pages : MODULE_BODY[m.id]) || ["This lesson is short and practical.", "Use what you learn in your records this week.", "Ask the Neary coach if anything is unclear."];
  const last = page >= body.length - 1;
  return (
    <div className="pb-4">
      <AppBar title={m.cat} onBack={back} />
      <div className="p-4 space-y-4">
        <div className="flex gap-1.5">{body.map((_, i) => <div key={i} className="flex-1 rounded-full" style={{ height: 4, background: i <= page ? C.pink : C.line }} />)}</div>
        <div className="text-xs font-bold" style={{ color: C.pink }}>{t("Lesson")} {lessonNumber(db, m.id)} {t("of")} {db.modules.length}</div>
        <h2 className="text-xl font-extrabold leading-tight" style={{ color: C.navy, fontFamily: HEAD }}>{t(m.t)}</h2>
        <div className="text-xs" style={{ color: C.soft }}>{tp("{n} min", { n: m.min })}, {t(m.cat)}{m.status === "Completed" ? `, ${t("Completed").toLowerCase()}` : ""}</div>
        <Card className="p-5" style={{ background: C.blush2 }}>
          <p className="text-base leading-relaxed" style={{ color: C.ink }}>{t(body[page])}</p>
        </Card>
        <div className="flex gap-3">
          {page > 0 && <Btn variant="quiet" onClick={() => setPage(page - 1)}>Back</Btn>}
          {!last ? <Btn full onClick={() => { setPage(page + 1); act.moduleProgress(m.id); }}>Next</Btn>
            : <Btn full onClick={() => { act.completeModule(m.id); back(); }}>{m.status === "Completed" ? "Finish again" : "Mark as completed"}</Btn>}
        </div>
        {last && m.task && (
          <Card className="p-4" style={{ background: C.aquaSoft }}>
            <div className="flex items-start gap-2.5">
              <ClipboardCheck size={18} style={{ color: "#1F8E86" }} className="shrink-0 mt-0.5" />
              <div><div className="text-sm font-bold mb-1" style={{ color: C.navy }}>{t("Your task")}</div><p className="text-sm" style={{ color: C.ink }}>{t(m.task)}</p></div>
            </div>
          </Card>
        )}
        {m.status === "Completed" && (
          <Card className="p-4">
            <div className="text-sm font-bold mb-2" style={{ color: C.navy }}>Was this useful?</div>
            <div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => act.rateModule(m.id, n)} aria-label={`Rate ${n}`}><Star size={24} style={{ color: (m.rating || 0) >= n ? C.pink : C.line }} fill={(m.rating || 0) >= n ? C.pink : "none"} /></button>
            ))}</div>
          </Card>
        )}
      </div>
    </div>
  );
}
