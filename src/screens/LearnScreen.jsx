import { useState } from "react";
import { Play, FileText, ChevronRight, CheckCircle2, BookOpen } from "lucide-react";
import { t, tp } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { guideState, formalStatus, orderedModules, lessonNumber } from "../data/db.js";
import { GUIDES, LEARN_GROUPS, learnGroupOf } from "../data/business.js";
import { Card, Meter, Chips, Row, Pill, Btn, IconDot } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";
import { TourHelp } from "../components/tour/Tour.jsx";
import { WomanReading } from "../components/ui/Illustrations.jsx";

export function LearnScreen({ db, go, act }) {
  const [cat, setCat] = useState("All");
  const count = (g) => db.modules.filter((m) => learnGroupOf(m.cat) === g).length;
  const cats = [["All", `${t("All")} (${db.modules.length})`], ...LEARN_GROUPS.map(([g]) => [g, `${t(g)} (${count(g)})`])];
  const list = orderedModules(db).filter((m) => cat === "All" || learnGroupOf(m.cat) === cat);
  const done = db.modules.filter((m) => m.status === "Completed").length;
  const next = db.modules.find((m) => m.status === "In progress") || db.modules.find((m) => m.status === "Not started");
  return (
    <div className="pb-4">
      <AppBar title="Learn" right={<TourHelp menu="learn" />} />
      <div className="p-4 space-y-4">
        <Card tour="learn-today" className="p-4" style={{ background: "linear-gradient(135deg, #FEF0F7 0%, #EEFAF9 100%)" }}>
          <div className="flex items-center gap-3">
            <WomanReading size={64} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold" style={{ color: C.pink }}>TODAY'S LEARNING</div>
              <div className="text-sm font-extrabold leading-tight" style={{ color: C.navy, fontFamily: HEAD }}>{t("Personalized tips for your business")}</div>
              <div className="text-xs mt-1" style={{ color: C.mute }}>{t("Based on your recent records, here are ideas to help you grow and manage your cash flow better.")}</div>
            </div>
          </div>
          {next && <Btn full className="mt-3" onClick={() => go("module", next.id)}><Play size={14} />{next.status === "In progress" ? "Continue" : "Watch"} {next.min}-min tip</Btn>}
        </Card>
        <Card tour="learn-progress" className="p-4">
          <div className="flex items-center justify-between"><span className="text-sm font-bold" style={{ color: C.navy }}>{t("Your progress")}</span><span className="text-sm font-extrabold" style={{ color: C.pink }}>{done} of {db.modules.length}</span></div>
          <div className="mt-2"><Meter value={done} max={db.modules.length} /></div>
        </Card>
        <Card tour="learn-guides" className="p-4" onClick={() => go("formalization")}>
          <div className="flex items-center gap-3">
            <IconDot icon={FileText} size={44} bg={C.aquaSoft} color="#1F8E86" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-extrabold" style={{ color: C.navy }}>Formalization guides</div>
              <div className="text-xs" style={{ color: C.soft }}>{GUIDES.reduce((a, g) => a + guideState(db, g).count, 0)}/{GUIDES.reduce((a, g) => a + g.steps.length, 0)} {t("steps")} · {t(formalStatus(db))}</div>
            </div>
            <ChevronRight size={16} style={{ color: C.pink }} />
          </div>
        </Card>
        <Chips tour="learn-chips" options={cats} value={cat} onChange={setCat} />
        <div data-tour="learn-list">
          <SectionHead>{cat === "All" ? "Your Lessons, in Order" : "More for You"}</SectionHead>
          <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
            {list.map((m) => (
              <Row key={m.id} title={t(m.t)} sub={`${t("Lesson")} ${lessonNumber(db, m.id)} ${t("of")} ${db.modules.length}, ${tp("{n} min", { n: m.min })}`} onClick={() => go("module", m.id)}
                icon={m.status === "Completed" ? CheckCircle2 : m.status === "In progress" ? Play : BookOpen}
                iconBg={m.status === "Completed" ? C.greenSoft : m.status === "In progress" ? C.aquaSoft : C.blush}
                iconColor={m.status === "Completed" ? C.green : m.status === "In progress" ? "#1F8E86" : C.pink}
                right={m.status === "Completed" ? <Pill tone="green" small>Done</Pill> : m.status === "In progress" ? <Pill tone="aqua" small>Continue</Pill> : <ChevronRight size={16} style={{ color: C.pink }} />} />
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
