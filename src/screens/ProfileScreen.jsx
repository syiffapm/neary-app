import { Store, Camera, Compass, Building2, QrCode, ShieldCheck, Lock, Users, Globe, Wifi, Bell, MessageCircle, LogOut, Info, Accessibility, Star, RotateCcw, FileLock } from "lucide-react";
import { t, tp, LANGS } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { scoreOf, allTime, formalStatus } from "../data/db.js";
import { fmtDate, usd } from "../data/format.js";
import { Card, Row, Pill, Segmented } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";
import { TourHelp } from "../components/tour/Tour.jsx";
import { WomanAvatar } from "../components/ui/Illustrations.jsx";

export function ProfileScreen({ db, go, act }) {
  const sc = scoreOf(db), all = allTime(db);
  const r = db.referral;
  return (
    <div className="pb-4">
      <AppBar title="Profile" right={<TourHelp menu="profile" />} />
      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center">
          <WomanAvatar seed={db.me.id} size={76} />
          <div className="text-lg font-extrabold mt-2" style={{ color: C.navy, fontFamily: HEAD }}>{db.me.name}</div>
          <div className="text-sm font-semibold" style={{ color: C.pink }}>{db.me.biz}</div>
          <div className="text-xs mt-0.5" style={{ color: C.soft }}>{db.me.province}, member since {fmtDate(db.me.joinedAt)}</div>
        </div>
        <div className="grid grid-cols-3 gap-2" data-tour="prof-tiles">
          {[["Readiness", sc], ["Records", db.txns.length], ["Net profit", usd(all.net)]].map(([l, v]) => (
            <Card key={l} className="p-2 min-w-0 text-center"><div className="text-sm font-extrabold break-words" style={{ color: C.pinkDeep, fontFamily: HEAD }}>{v}</div><div className="text-[11px]" style={{ color: C.soft }}>{t(l)}</div></Card>
          ))}
        </div>
        <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
          <Row icon={Store} title="Business profile" sub="What you sell, where you work" onClick={() => go("profileDetail")} />
          <Row tour="prof-docs" icon={Camera} title="My documents" sub={`${db.docs.filter((d) => d.status === "Verified").length} verified, ${db.docs.filter((d) => d.status === "Needed").length} needed`} onClick={() => go("docs")} />
          <Row icon={Building2} title="Become formal" sub={formalStatus(db)} onClick={() => go("formalization")} />
          <Row icon={QrCode} title="KHQR merchant" sub={`ID ${db.me.merchantId}, connected`} onClick={() => go("pay")} />
        </Card>
        <div data-tour="prof-privacy">
          <SectionHead>Privacy and consent</SectionHead>
          <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
            <Row icon={ShieldCheck} iconBg={C.greenSoft} iconColor={C.green} title="Data sharing consent"
              sub={r.status === "none" ? t("Not shared with any lender") : tp("Shared with {a}", { a: r.lenders.join(", ") })}
              right={r.status !== "none" ? <button onClick={act.withdrawConsent} className="text-xs font-bold" style={{ color: C.red }}>Withdraw</button> : <Pill tone="neutral" small>None</Pill>} />
            <Row icon={FileLock} title="Privacy and my data" sub="What we hold, how long, download or delete" onClick={() => go("privacy")} />
            <Row icon={Lock} title="Who can see my records" sub="Only you, and a lender you choose" right={null} />
            <Row icon={Users} title={t("My facilitator")} sub={`${db.me.facilitator}, ${db.me.facilitatorRole}`} right={null} />
          </Card>
        </div>
        <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
          <Row tour="prof-lang" icon={Globe} title="Language" sub={LANGS.find((l) => l.code === (db.settings?.lang || "en"))?.native} onClick={act.openLang} />
          <div className="py-3" data-tour="prof-conn">
            <Row icon={Wifi} title="Connection" sub={db.outbox && db.outbox.length ? tp("{n} changes waiting to sync", { n: db.outbox.length }) : t("Test how the app behaves with no signal")} right={null} />
            <div className="mt-2"><Segmented options={[["on", "Online"], ["off", "No signal"]]} value={act.isOnline ? "on" : "off"} onChange={(v) => act.setOnline(v === "on")} /></div>
          </div>
          <Row tour="prof-a11y" icon={Accessibility} title="Accessibility" sub="Text size, high contrast, reduce motion" onClick={() => go("accessibility")} />
          <Row icon={Bell} title="Notifications" sub="Payments, opportunities and reminders" onClick={() => go("notifications")} />
          <Row icon={MessageCircle} title="Get help" sub={t("Talk to an officer")} onClick={() => act.officer()} />
          <Row icon={Star} title="Give feedback" sub="Tell us how Neary is working for you" onClick={() => go("feedback")} />
          <Row icon={Info} title="About Neary and what it does not do" sub="Who runs it, and its limits" onClick={() => go("about")} />
          <Row icon={Compass} title="Take the full tour" sub="A quick walk through every menu" onClick={act.startFullTour} />
          <Row icon={RotateCcw} title="Reset tour hints" sub="Show each menu tour again the next time you open it" onClick={act.resetTours} />
          <Row icon={RotateCcw} title="Replay onboarding" sub="See the welcome and consent steps again" onClick={act.replayOnboarding} />
          <Row icon={LogOut} title="Log out" sub="Your records stay saved. Log back in any time." onClick={act.logout} />
          <Row icon={LogOut} iconBg={C.redSoft} iconColor={C.red} title="Reset this demonstration" sub="Restores the original records" onClick={act.reset} />
        </Card>
        <div className="text-center text-[11px] pt-2" style={{ color: C.soft }}>Neary Smart Business, Ministry of Women's Affairs. Operated by LinkIT.</div>
      </div>
    </div>
  );
}
