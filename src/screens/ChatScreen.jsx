import { useState, useRef, useEffect } from "react";
import { Bot, Send, ThumbsUp, ThumbsDown, Flag, PhoneCall, Info } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { fmtTime } from "../data/format.js";
import { Pill, IconDot, Btn } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";
import { Sheet } from "../components/ui/Sheet.jsx";

const DOWN_REASONS = ["Not correct", "Not helpful", "Hard to understand", "Unsafe or rude"];
const REPORT_REASONS = ["Wrong or made-up information", "It sounded like a credit, legal or tax decision", "Unsafe or harmful", "Something else"];

export function ChatScreen({ db, back, act, preset }) {
  const [text, setText] = useState("");
  const [report, setReport] = useState(null);
  const allowed = db.consents ? db.consents.aiCoach !== false : true;
  const endRef = useRef(null);
  const sent = useRef(false);
  useEffect(() => { if (preset && !sent.current && allowed) { sent.current = true; act.send(preset); } }, [preset]);
  useEffect(() => { endRef.current?.scrollIntoView?.({ block: "end" }); }, [db.chat.length]);
  const last = db.chat[db.chat.length - 1];
  const chips = last && last.role === "ai" ? last.chips || [] : [];
  const starter = [["Am I finance-ready?", "Am I finance-ready?"], ["Help me register my business", "Help me register my business"], ["Show my cash flow", "Show my cash flow"], ["Find relevant programs", "Find relevant programs for me"]];
  return (
    <div className="flex flex-col h-full">
      <AppBar title="Neary AI" onBack={back} right={<Pill tone="aqua" small>Advisory only</Pill>} />
      <div className="shrink-0 px-4 py-2.5 flex items-start gap-2.5" style={{ background: C.aquaSoft, borderBottom: `1px solid ${C.line}` }} role="note">
        <Info size={15} style={{ color: "#1F8E86" }} className="shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 text-[11px] font-semibold leading-snug" style={{ color: C.ink }}>{t("You are chatting with an AI assistant, not a person. It gives advice only — never credit, legal or tax decisions.")}</div>
        <button onClick={act.officer} className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold" style={{ background: "#fff", color: C.pinkDeep, border: `1px solid ${C.line}`, minHeight: 32 }}><PhoneCall size={12} aria-hidden="true" />{t("Talk to an officer")}</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <div className="flex items-center gap-2.5 pb-1">
          <IconDot icon={Bot} size={38} />
          <div><div className="text-sm font-extrabold" style={{ color: C.navy, fontFamily: HEAD }}>Neary AI</div><div className="text-[11px]" style={{ color: C.soft }}>Your Business Coach</div></div>
        </div>
        {db.chat.map((m, i) => (
          <div key={i} className={`flex ${m.role === "me" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[84%] rounded-2xl px-3.5 py-2.5" style={m.role === "me" ? { background: C.blush, borderTopRightRadius: 6 } : { background: "#F3F4F8", borderTopLeftRadius: 6 }}>
              <div className="text-sm" style={{ color: C.ink }}>{m.text}</div>
              <div className="text-[10px] mt-1" style={{ color: C.soft }}>{fmtTime(m.at)}</div>
              {m.role === "ai" && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: C.line }}>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => act.rateChat(i, m.fb === "up" ? undefined : "up")} aria-pressed={m.fb === "up"} aria-label={t("Helpful")} className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: m.fb === "up" ? C.greenSoft : "#fff", color: m.fb === "up" ? C.green : C.mute, border: `1px solid ${m.fb === "up" ? C.green : C.line}` }}><ThumbsUp size={15} aria-hidden="true" fill={m.fb === "up" ? "currentColor" : "none"} /></button>
                    <button onClick={() => act.rateChat(i, m.fb === "down" ? undefined : "down")} aria-pressed={m.fb === "down"} aria-label={t("Not helpful")} className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: m.fb === "down" ? C.redSoft : "#fff", color: m.fb === "down" ? C.red : C.mute, border: `1px solid ${m.fb === "down" ? C.red : C.line}` }}><ThumbsDown size={15} aria-hidden="true" fill={m.fb === "down" ? "currentColor" : "none"} /></button>
                    <button onClick={() => setReport(i)} className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold underline" style={{ color: C.mute, minHeight: 36 }}><Flag size={11} aria-hidden="true" />{m.reported ? t("Reported") : t("Report a problem with this answer")}</button>
                  </div>
                  {m.fb === "down" && (
                    <div className="mt-1.5"><div className="text-[11px] font-bold mb-1" style={{ color: C.mute }}>{t("What went wrong?")}</div>
                      <div className="flex flex-wrap gap-1.5">{DOWN_REASONS.map((r) => <button key={r} onClick={() => act.rateChat(i, "down", r)} aria-pressed={m.fbReason === r} className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={m.fbReason === r ? { background: C.pink, color: "#fff" } : { background: "#fff", color: C.navy, border: `1px solid ${C.line}` }}>{t(r)}</button>)}</div></div>
                  )}
                  {m.fb === "up" && <div className="text-[11px] mt-1" style={{ color: C.green }}>{t("Thanks, noted.")}</div>}
                </div>
              )}
            </div>
          </div>
        ))}
        {db.chat.length <= 1 && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {starter.map(([l, v]) => (
              <button key={l} onClick={() => act.send(v)} className="rounded-2xl px-3 py-2.5 text-xs font-bold text-left" style={{ border: `1px solid ${C.line}`, color: C.pinkDeep, background: "#fff" }}>{l}</button>
            ))}
          </div>
        )}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {chips.map((c, i) => <button key={i} onClick={() => act.chip(c)} className="rounded-full px-3.5 py-1.5 text-xs font-bold" style={{ background: C.blush, color: C.pinkDeep }}>{c.label}</button>)}
          </div>
        )}
        <div ref={endRef} />
      </div>
      {!allowed ? (
        <div className="px-4 py-3 border-t space-y-2" style={{ borderColor: C.line, background: "#fff" }}>
          <div className="text-xs" style={{ color: C.mute }}>{t("The AI coach is off because you did not agree to it processing your questions. Turn it on to chat, or talk to an officer instead.")}</div>
          <div className="flex gap-2"><Btn small onClick={() => act.setConsent("aiCoach", true)}>Turn on the AI coach</Btn><Btn small variant="quiet" onClick={act.officer}>Talk to an officer</Btn></div>
        </div>
      ) : (
      <div className="px-3 py-2.5 border-t flex items-center gap-2" style={{ borderColor: C.line, background: "#fff" }}>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { act.send(text.trim()); setText(""); } }}
          aria-label={t("Ask me anything...")} placeholder={t("Ask me anything...")} className="flex-1 text-sm rounded-full border px-4 py-2.5" style={{ borderColor: C.line }} />
        <button onClick={() => { if (text.trim()) { act.send(text.trim()); setText(""); } }} disabled={!text.trim()} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: C.pink, color: "#fff", opacity: text.trim() ? 1 : 0.5 }} aria-label={t("Send")}><Send size={16} /></button>
      </div>
      )}
      {report !== null && (
        <Sheet title="Report a problem with this answer" sub="A person will read your report" onClose={() => setReport(null)}>
          <div className="space-y-2">{REPORT_REASONS.map((r) => <button key={r} onClick={() => { act.reportChat(report, r); setReport(null); }} className="w-full text-left rounded-2xl px-3.5 py-3 text-sm font-bold" style={{ border: `1.5px solid ${C.line}`, color: C.navy }}>{t(r)}</button>)}</div>
        </Sheet>
      )}
    </div>
  );
}
