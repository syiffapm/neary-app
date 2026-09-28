import { Globe, Bell, QrCode, Plus, Check, ChevronRight, Play, Users, Store, Coins, GraduationCap, Receipt, Wallet, ShieldCheck } from "lucide-react";
import { t, tp } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { thisMonth, scoreOf, health, nextSteps, isReady, isFormal, READY_AT, wegsStatus } from "../data/db.js";
import { usd, DAY, NOW_MS } from "../data/format.js";
import { Card, Ring, Btn, IconDot, Row, Pill } from "../components/ui/Primitives.jsx";
import { SectionHead } from "../components/ui/AppBar.jsx";
import { JourneyStrip } from "../components/Journey.jsx";
import { TourHelp } from "../components/tour/Tour.jsx";
import { WomanAvatar, WomanReading } from "../components/ui/Illustrations.jsx";

const tr = (x) => t(x);
export function HomeScreen({ db, go, act }) {
  const t = thisMonth(db), sc = scoreOf(db), h = health(db), steps = nextSteps(db), wegs = wegsStatus(db);
  const todayIn = db.txns.filter((x) => x.type === "income" && x.at >= Date.UTC(2028, 0, 21)).reduce((a, x) => a + x.amount, 0);
  const learning = db.modules.find((m) => m.status === "In progress") || db.modules.find((m) => m.status === "Not started");
  const unread = db.notifications.filter((n) => !n.read).length;
  const matched = db.opps.filter((o) => !o.applied_by_me).length;
  const first = db.me.name.split(" ")[1] || db.me.name;
  return (
    <div className="pb-4">
      <div className="px-4 pt-4 pb-5" style={{ background: "linear-gradient(160deg, #FEF0F7 0%, #FFFFFF 62%, #EEFAF9 100%)" }}>
        <div className="flex items-center gap-2">
          <WomanAvatar seed={db.me.id} size={44} />
          <div className="flex-1 min-w-0">
            <div className="text-xs" style={{ color: C.soft }}>{tr("Good morning")}</div>
            <div className="text-lg font-extrabold leading-tight truncate" style={{ color: C.navy, fontFamily: HEAD }}>{first}</div>
          </div>
          <div className="flex items-center gap-2" data-tour="home-top">
          <TourHelp menu="home" />
          <button onClick={act.openLang} data-role="lang" className="p-2.5 rounded-full bg-white active:opacity-60" style={{ border: `1px solid ${C.line}`, minWidth: 44, minHeight: 44 }} aria-label={tr("Language")}>
            <Globe size={17} style={{ color: C.navy }} aria-hidden="true" />
          </button>
          <button onClick={() => go("notifications")} className="relative p-2.5 rounded-full bg-white active:opacity-60" style={{ border: `1px solid ${C.line}`, minWidth: 44, minHeight: 44 }} aria-label={tr("Notifications")}>
            <Bell size={17} style={{ color: C.navy }} />
            {unread > 0 && <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white rounded-full px-1.5" style={{ background: C.pink }}>{unread}</span>}
          </button>
          </div>
        </div>

        <Card tour="home-ring" className="p-4 mt-4" style={{ boxShadow: "0 8px 24px rgba(242,0,112,0.07)" }}>
          <div className="flex items-center gap-4">
            <Ring value={sc} size={104} sub={tr("out of 100")} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold" style={{ color: C.soft }}>FINANCE READINESS</div>
              <div className="text-sm font-bold mt-0.5" style={{ color: C.navy }}>{isReady(db) ? (isFormal(db) ? tr("You're ready to be referred") : tr("Score is ready. Formalize before you connect to a lender.")) : tp("{n} points to finance-ready", { n: READY_AT - sc })} <span className="font-normal" style={{ color: C.mute }}>· {tp("{n} docs needed", { n: db.docs.filter((d) => d.status === "Needed").length })}</span></div>
              <div className="flex items-center gap-3 mt-2.5 flex-wrap"><Btn small onClick={() => go("finance")}>View details</Btn>
                <button onClick={() => go("howScore")} className="text-xs font-bold underline" style={{ color: C.pinkDeep, minHeight: 32 }}>{tr("How is this calculated?")}</button></div>
            </div>
          </div>
          <button onClick={() => go("wegs")} className="w-full flex items-center gap-2.5 mt-3 pt-3 border-t text-left active:opacity-60" style={{ borderColor: C.line }}>
            <IconDot icon={ShieldCheck} size={30} bg={wegs.eligible ? C.greenSoft : C.amberSoft} color={wegs.eligible ? C.green : C.amber} />
            <span className="flex-1 min-w-0 text-xs font-bold" style={{ color: C.navy }}>{tr("Guarantee eligibility")}</span>
            <Pill tone={wegs.eligible ? "green" : "amber"} small>{tp("{n} of {m}", { n: wegs.met, m: wegs.total })}</Pill>
          </button>
        </Card>

        <div className="grid grid-cols-2 gap-2 mt-3" data-tour="home-actions">
          {[[QrCode, "Get paid", () => go("pay")], [Plus, "Add record", () => act.openAdd()]].map(([I, l, fn]) => (
            <button key={l} onClick={fn} className="rounded-2xl bg-white py-3 flex flex-col items-center gap-1.5 active:opacity-60" style={{ border: `1px solid ${C.line}` }}>
              <IconDot icon={I} size={34} />
              <span className="text-[11px] font-bold" style={{ color: C.navy }}>{tr(l)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div data-tour="home-journey"><JourneyStrip db={db} go={go} act={act} /></div>
        <Card tour="home-month" className="p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div><div className="text-xs font-bold" style={{ color: C.soft }}>{tr("THIS MONTH")}</div><div className="text-2xl font-extrabold leading-tight" style={{ color: C.navy, fontFamily: HEAD }}>{usd(t.inc)}</div><div className="text-xs" style={{ color: C.soft }}>{tr("Sales")}</div></div>
            <div className="text-right"><div className="text-xs font-bold" style={{ color: C.soft }}>{tr("TODAY")}</div><div className="text-xl font-extrabold" style={{ color: C.aqua, fontFamily: HEAD }}>{usd(todayIn)}</div></div>
          </div>
          <div className="flex gap-3 mt-3 pt-3 border-t" style={{ borderColor: C.line }}>
            {[["Expenses", usd(t.exp), C.pinkDeep], ["Net cash flow", usd(t.net), C.green]].map(([l, v, col]) => (
              <div key={l} className="flex-1"><div className="text-[11px]" style={{ color: C.soft }}>{tr(l)}</div><div className="text-base font-extrabold" style={{ color: col, fontFamily: HEAD }}>{v}</div></div>
            ))}
            <button onClick={() => go("cash")} className="self-center p-2 rounded-full" style={{ background: C.blush }} aria-label="Open cash flow"><ChevronRight size={16} style={{ color: C.pink }} /></button>
          </div>
        </Card>

        <div>
          <SectionHead action="See all" onAction={() => go("health")}>Business Health</SectionHead>
          <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
            {h.map((x) => (
              <Row key={x.id} icon={x.id === "profile" ? Store : x.id === "records" ? Receipt : x.id === "cash" ? Wallet : ShieldCheck}
                iconBg={x.ok ? C.greenSoft : C.amberSoft} iconColor={x.ok ? C.green : C.amber}
                title={x.label} sub={x.detail} onClick={() => go(...x.go)}
                right={<Pill tone={x.ok ? "green" : "amber"} small>{x.ok ? "Good" : "Needs attention"}</Pill>} />
            ))}
          </Card>
        </div>

        <div>
          <SectionHead action="See all" onAction={() => go("steps")}>Recommended Next Steps</SectionHead>
          <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
            {steps.filter((s) => !s.done).slice(0, 3).map((s, i) => (
              <button key={s.id} onClick={() => go(...s.go)} className="w-full flex items-center gap-3 py-3 text-left active:opacity-60">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0" style={{ background: C.pink, color: "#fff", fontFamily: HEAD }}>{i + 1}</span>
                <span className="flex-1 min-w-0 text-sm font-bold truncate" style={{ color: C.navy }}>{tr(s.t)}</span>
                <ChevronRight size={16} style={{ color: C.pink }} />
              </button>
            ))}
          </Card>
        </div>

        {learning && (
          <div>
            <SectionHead action="See all" onAction={() => go("learn")}>Today's Learning</SectionHead>
            <Card className="p-4" style={{ background: "linear-gradient(135deg, #FEF0F7 0%, #EEFAF9 100%)" }}>
              <div className="flex items-center gap-3">
                <WomanReading size={62} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold" style={{ color: C.navy, fontFamily: HEAD }}>{tr("Personalized tips for your business")}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.mute }}>{tr("Based on your records, this helps with what needs attention now.")}</div>
                </div>
              </div>
              <Btn full className="mt-3" onClick={() => go("module", learning.id)}><Play size={14} />{learning.status === "In progress" ? "Continue" : "Watch"} {learning.min}-min tip</Btn>
            </Card>
          </div>
        )}

        <div>
          <SectionHead action="See all" onAction={() => go("grow")}>Opportunities for You</SectionHead>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {db.opps.slice(0, 3).map((o) => (
              <Card key={o.id} className="p-3 shrink-0" style={{ width: 210 }} onClick={() => go("opp", o.id)}>
                <IconDot icon={o.type === "Mentorship" ? Users : o.type === "Market access" ? Store : o.type === "Finance" ? Coins : GraduationCap} size={34} />
                <div className="text-xs font-bold mt-2" style={{ color: C.pink }}>{tr(o.type)}</div>
                <div className="text-sm font-extrabold leading-tight" style={{ color: C.navy }}>{tr(o.t)}</div>
                {o.reward && <div className="text-[11px] font-bold mt-1" style={{ color: C.pinkDeep }}>{tr(o.reward)}</div>}
                <div className="text-[11px] mt-1" style={{ color: C.soft }}>Closes in {Math.ceil((o.closes - NOW_MS) / DAY)} days</div>
                {o.applied_by_me && <div className="mt-1"><Pill tone="green" small><Check size={10} />Applied</Pill></div>}
              </Card>
            ))}
          </div>
        </div>
        <div className="text-[11px] text-center pt-2" style={{ color: C.soft }}>{matched} {tr("opportunities match your business today")}</div>
      </div>
    </div>
  );
}
