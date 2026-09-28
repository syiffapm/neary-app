import { useState } from "react";
import { Sparkles, Users, Store, Coins, GraduationCap, Clock, Check, ChevronRight, TrendingUp, Star, FileText, ShieldCheck, Phone, MessageCircle, Gift } from "lucide-react";
import { t, tp } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { monthSeries } from "../data/db.js";
import { fmtDate, DAY, NOW_MS } from "../data/format.js";
import { Card, IconDot, Segmented, Pill, Row, Btn } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";
import { TourHelp } from "../components/tour/Tour.jsx";
import { JourneyTracker } from "../components/Journey.jsx";

const STATUS_TONE = { Requested: "amber", Matched: "aqua", Completed: "green" };

export function GrowScreen({ db, go, act, initialTab }) {
  const [tab, setTab] = useState(["journey", "support", "mentors"].includes(initialTab) ? initialTab : "opps");
  const goals = db.goals, doneGoals = goals.filter((g) => g.done).length;
  const sortedMentors = [...db.mentors].sort((a, b) => {
    const score = (m) => (m.sector === db.me.sector ? 2 : 0) + (m.province === db.me.province ? 1 : 0);
    return score(b) - score(a);
  });
  return (
    <div className="pb-4">
      <AppBar title="Grow & Connect" right={<TourHelp menu="grow" />} />
      <div className="px-4 pt-3 pb-2 sticky top-[52px] z-10" style={{ background: "#fff" }}>
        <Segmented tour="grow-seg" options={[["opps", "Opportunities"], ["journey", "My Journey"], ["mentors", "Mentors"], ["support", "Support"]]} value={tab} onChange={setTab} />
      </div>
      <div className="px-4 space-y-4 pt-2">
        {tab === "opps" && (
          <>
            <Card className="p-4 text-center" style={{ background: "linear-gradient(135deg, #FEF0F7 0%, #EEFAF9 100%)" }}>
              <div className="flex justify-center"><IconDot icon={Sparkles} size={52} bg="#fff" /></div>
              <div className="text-lg font-extrabold mt-2" style={{ color: C.navy, fontFamily: HEAD }}>{t("You're Ready to Grow!")}</div>
              <div className="text-sm" style={{ color: C.mute }}>{t("Turn your ideas into action with these next steps.")}</div>
            </Card>
            {db.opps.map((o, oi) => (
              <Card key={o.id} tour={oi === 0 ? "grow-opp" : undefined} className="p-4" onClick={() => go("opp", o.id)}>
                <div className="flex items-start gap-3">
                  <IconDot icon={o.type === "Mentorship" ? Users : o.type === "Market access" ? Store : o.type === "Finance" ? Coins : GraduationCap} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold" style={{ color: C.pink }}>{t(o.type)}</div>
                    <div className="text-sm font-extrabold leading-tight" style={{ color: C.navy }}>{t(o.t)}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.soft }}>{t(o.by)}</div>
                  </div>
                  {o.applied_by_me ? <Pill tone="green" small><Check size={10} />Applied</Pill> : <ChevronRight size={16} style={{ color: C.pink }} />}
                </div>
                {o.reward && (
                  <div className="flex items-start gap-2 mt-3 pt-3 border-t" style={{ borderColor: C.line }}>
                    <Gift size={15} style={{ color: C.pinkDeep }} className="shrink-0 mt-0.5" />
                    <span className="text-xs font-bold" style={{ color: C.pinkDeep }}>{t(o.reward)}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: C.soft }}>
                  <span className="flex items-center gap-1"><Clock size={11} />Closes in {Math.ceil((o.closes - NOW_MS) / DAY)} days</span>
                  <span>{o.places} places</span>
                </div>
              </Card>
            ))}
          </>
        )}
        {tab === "journey" && (
          <>
            <JourneyTracker db={db} go={go} />
            <div data-tour="grow-goals">
              <SectionHead action="Add goal" onAction={() => act.openGoal()}>My Goals</SectionHead>
              <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
                {goals.map((g) => (
                  <button key={g.id} onClick={() => act.toggleGoal(g.id)} className="w-full flex items-center gap-3 py-3 text-left active:opacity-60">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={g.done ? { background: C.green, color: "#fff" } : { border: `2px solid ${C.pink}` }}>{g.done && <Check size={14} />}</span>
                    <span className="flex-1 text-sm font-semibold" style={{ color: g.done ? C.soft : C.navy, textDecoration: g.done ? "line-through" : "none" }}>{g.label}</span>
                  </button>
                ))}
              </Card>
            </div>
            <Card className="p-4" style={{ background: "linear-gradient(135deg, #FEF0F7 0%, #EEFAF9 100%)" }}>
              <div className="text-sm font-extrabold" style={{ color: C.navy, fontFamily: HEAD }}>You're Making Progress!</div>
              <div className="flex items-end gap-2 mt-3 h-20">
                {monthSeries(db).map((m, i) => (
                  <div key={m.m} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-lg" style={{ height: `${Math.max(8, (m.sales / 1500) * 72)}px`, background: i === 3 ? C.pink : "#F9BCDB" }} />
                    <span className="text-[10px]" style={{ color: C.soft }}>{m.m}</span>
                  </div>
                ))}
                <TrendingUp size={22} style={{ color: C.pink }} className="mb-6" />
              </div>
              <div className="text-xs text-center mt-1" style={{ color: C.mute }}>Keep going, new opportunities are within reach. {doneGoals} of {goals.length} goals reached.</div>
            </Card>
            <div>
              <SectionHead>Achievements</SectionHead>
              <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
                {db.achievements.slice().reverse().map((a) => (
                  <Row key={a.id} icon={Star} iconBg={C.amberSoft} iconColor={C.amber} title={a.t} sub={fmtDate(a.at)} right={null} />
                ))}
              </Card>
            </div>
          </>
        )}
        {tab === "mentors" && (
          <>
            <p className="text-sm" style={{ color: C.mute }}>{t("Verified women entrepreneurs who share what worked for them. Sessions are by phone or messaging, usually 1 to 2 hours, about once a month.")}</p>
            {db.mentorRequests.length > 0 && (
              <div>
                <SectionHead>My requests</SectionHead>
                <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
                  {db.mentorRequests.map((r) => {
                    const m = db.mentors.find((x) => x.id === r.mentorId);
                    return <Row key={r.id} icon={Users} title={m ? m.name : r.mentorId} sub={`${fmtDate(r.at)}`} right={<Pill tone={STATUS_TONE[r.status] || "neutral"} small>{r.status}</Pill>} />;
                  })}
                </Card>
              </div>
            )}
            <SectionHead>{tp("{sector} mentors near you", { sector: db.me.sector })}</SectionHead>
            {sortedMentors.map((m) => {
              const requested = db.mentorRequests.some((r) => r.mentorId === m.id);
              return (
                <Card key={m.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <IconDot icon={Users} size={44} bg={C.aquaSoft} color="#1F8E86" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap"><div className="text-sm font-extrabold" style={{ color: C.navy }}>{m.name}</div><Pill tone="green" small><Check size={10} />Verified</Pill></div>
                      <div className="text-xs mt-0.5" style={{ color: C.soft }}>{t(m.sector)}, {m.province}</div>
                      <div className="text-xs mt-1.5" style={{ color: C.mute }}>{m.bio}</div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px]" style={{ color: C.soft }}>
                        <span className="flex items-center gap-1">{m.contact.startsWith("Phone") ? <Phone size={11} /> : <MessageCircle size={11} />}{t(m.contact)}</span>
                      </div>
                      <div className="text-[11px] mt-1" style={{ color: C.soft }}>{t("Honorarium")}: {t(m.honorarium)}</div>
                    </div>
                  </div>
                  <Btn full small variant={requested ? "aqua" : "ghost"} className="mt-3" disabled={requested} onClick={() => act.requestMentor(m.id)}>{requested ? "Requested" : "Request this mentor"}</Btn>
                </Card>
              );
            })}
          </>
        )}
        {tab === "support" && (
          <>
            <p className="text-sm" style={{ color: C.mute }}>Verified providers checked by the Ministry of Women's Affairs and LinkIT.</p>
            {db.providers.map((p, pi) => (
              <Card key={p.id} tour={pi === 0 ? "grow-support" : undefined} className="p-4">
                <div className="flex items-start gap-3">
                  <IconDot icon={p.cat === "Accounting" ? FileText : p.cat === "Legal" ? ShieldCheck : p.cat === "Marketing" ? Sparkles : Store} size={44} bg={C.aquaSoft} color="#1F8E86" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-extrabold" style={{ color: C.navy }}>{p.name}</div>
                    <div className="text-xs" style={{ color: C.soft }}>{p.desc}</div>
                    <div className="flex items-center gap-2 mt-1"><Pill tone="green" small><Check size={10} />Verified Provider</Pill><span className="text-[11px]" style={{ color: C.soft }}>{p.rating} ★, {p.jobs} jobs</span></div>
                    <div className="text-xs font-bold mt-1" style={{ color: C.pinkDeep }}>{p.price}</div>
                  </div>
                </div>
                <Btn full small variant={p.booked ? "aqua" : "ghost"} className="mt-3" disabled={p.booked} onClick={() => act.bookProvider(p.id)}>{p.booked ? "Request sent" : "Request a callback"}</Btn>
              </Card>
            ))}
            <Btn full variant="quiet" onClick={() => go("community")}><Users size={15} />Open the community</Btn>
          </>
        )}
      </div>
    </div>
  );
}
