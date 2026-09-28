import { Check, Lock, ChevronRight, ShieldCheck } from "lucide-react";
import { t, tp } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { journeySteps } from "../data/db.js";
import { Card } from "./ui/Primitives.jsx";

const tone = (st) => (st.state === "done" ? { bg: C.green, fg: "#fff" } : st.state === "current" ? { bg: C.pink, fg: "#fff" } : { bg: C.line, fg: C.mute });

/* Compact strip for Home. */
export function JourneyStrip({ db, go, act }) {
  const steps = journeySteps(db);
  const doneN = steps.filter((s) => s.state === "done").length;
  const cur = steps.find((s) => s.state === "current") || steps.find((s) => s.state === "locked");
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0"><div className="text-xs font-bold" style={{ color: C.soft }}>{t("YOUR JOURNEY")}</div>
          <div className="text-sm font-extrabold truncate" style={{ color: C.navy, fontFamily: HEAD }}>{cur ? `${t("Next")}: ${t(cur.label)}` : t("Journey complete")}</div></div>
        <button onClick={act.openJourney} className="text-xs font-bold shrink-0" style={{ color: C.pink, minHeight: 32 }}>{t("See all")}</button>
      </div>
      <div className="flex gap-1 mt-3" role="list" aria-label={tp("{n} of 8 steps done", { n: doneN })}>
        {steps.map((s, i) => {
          const c = tone(s);
          return (
            <button key={s.id} role="listitem" onClick={() => go(...s.go)} aria-label={`${t(s.label)}: ${s.state === "done" ? t("Done") : s.locked ? t("Locked") : t("To do")}`} className="flex-1 min-w-0 rounded-full flex items-center justify-center text-[10px] font-extrabold" style={{ height: 28, background: c.bg, color: c.fg, outline: s.gate ? `2px solid ${C.navy}` : "none", outlineOffset: 1 }}>
              {s.state === "done" ? <Check size={12} aria-hidden="true" /> : s.locked ? <Lock size={10} aria-hidden="true" /> : i + 1}
            </button>
          );
        })}
      </div>
      <div className="text-[11px] mt-2" style={{ color: C.soft }}>{tp("{n} of 8 steps done", { n: doneN })}. {t("Formalize comes before finance.")}</div>
    </Card>
  );
}

/* Full vertical tracker for Grow, My Journey. */
export function JourneyTracker({ db, go }) {
  const steps = journeySteps(db);
  return (
    <Card className="p-4">
      <div className="text-sm font-extrabold" style={{ color: C.navy, fontFamily: HEAD }}>{t("Your business journey")}</div>
      <p className="text-xs mt-0.5 mb-2" style={{ color: C.mute }}>{t("Each step is worked out from what you have done in the app. Tap a step to go there.")}</p>
      <ol className="relative">
        {steps.map((s, i) => {
          const c = tone(s);
          return (
            <li key={s.id}>
              {s.needsGate && steps[i - 1] && !steps[i - 1].needsGate && (
                <div className="flex items-center gap-2 my-1 ml-1 text-[11px] font-bold" style={{ color: C.navy }}><ShieldCheck size={13} style={{ color: C.pinkDeep }} aria-hidden="true" /><span>{s.locked ? t("Gate: formalize to unlock finance") : t("Gate passed: you are formal")}</span></div>
              )}
              <button onClick={() => go(...s.go)} className="w-full flex items-stretch gap-3 text-left active:opacity-60" style={{ opacity: s.locked ? 0.7 : 1 }}>
                <span className="flex flex-col items-center shrink-0">
                  <span className="rounded-full flex items-center justify-center text-xs font-extrabold" style={{ width: 30, height: 30, background: c.bg, color: c.fg, outline: s.gate ? `2px solid ${C.navy}` : "none", outlineOffset: 2 }}>{s.state === "done" ? <Check size={15} aria-hidden="true" /> : s.locked ? <Lock size={13} aria-hidden="true" /> : i + 1}</span>
                  {i < steps.length - 1 && <span className="flex-1 w-[3px] my-0.5 rounded" style={{ background: s.state === "done" ? C.green : C.line, minHeight: 10 }} />}
                </span>
                <span className="flex-1 min-w-0 pb-3">
                  <span className="block text-sm font-bold" style={{ color: s.state === "current" ? C.pinkDeep : C.navy }}>{t(s.label)}{s.gate && <span className="ml-1.5 text-[10px] font-extrabold rounded-full px-1.5 py-0.5" style={{ background: C.navy, color: "#fff" }}>{t("GATE")}</span>}</span>
                  <span className="block text-xs" style={{ color: C.soft }}>{s.locked ? t("Locked until you formalize") : s.state === "done" ? t("Done") : t(s.hint)}</span>
                </span>
                <ChevronRight size={15} style={{ color: C.pink }} className="self-center shrink-0" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
