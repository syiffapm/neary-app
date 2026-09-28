import { useState, useEffect, useRef } from "react";
import {
  Home, Receipt, BookOpen, TrendingUp, User, Wifi, BatteryFull, Signal, AlertCircle, Clock, CheckCircle2, Bot,
} from "lucide-react";
import { t, setLocale, localeFont, LANGS } from "./i18n/dict.js";
import { C, HEAD, BODY, GRAD, setContrast } from "./theme.js";
import { STORAGE_KEY, freshDB, migrate, scoreOf } from "./data/db.js";
import { GUIDES, LENDERS } from "./data/business.js";
import { NOW_MS, usd } from "./data/format.js";
import storage from "./lib/storage.js";
import { aiReply } from "./lib/aiReply.js";

import { HomeScreen } from "./screens/HomeScreen.jsx";
import { HealthScreen } from "./screens/HealthScreen.jsx";
import { StepsScreen } from "./screens/StepsScreen.jsx";
import { ProfileDetailScreen } from "./screens/ProfileDetailScreen.jsx";
import { CashScreen } from "./screens/CashScreen.jsx";
import { TxnsScreen } from "./screens/TxnsScreen.jsx";
import { PayScreen } from "./screens/PayScreen.jsx";
import { LearnScreen } from "./screens/LearnScreen.jsx";
import { ModuleScreen } from "./screens/ModuleScreen.jsx";
import { FinanceScreen } from "./screens/FinanceScreen.jsx";
import { SummaryScreen } from "./screens/SummaryScreen.jsx";
import { DocsScreen } from "./screens/DocsScreen.jsx";
import { ReferralScreen } from "./screens/ReferralScreen.jsx";
import { ReferralPackScreen } from "./screens/ReferralPackScreen.jsx";
import { ReferralStatusScreen } from "./screens/ReferralStatusScreen.jsx";
import { RegisterScreen } from "./screens/RegisterScreen.jsx";
import { FormalizationScreen } from "./screens/FormalizationScreen.jsx";
import { GuideScreen } from "./screens/GuideScreen.jsx";
import { GrowScreen } from "./screens/GrowScreen.jsx";
import { OppScreen } from "./screens/OppScreen.jsx";
import { CommunityScreen } from "./screens/CommunityScreen.jsx";
import { NotificationsScreen } from "./screens/NotificationsScreen.jsx";
import { ProfileScreen } from "./screens/ProfileScreen.jsx";
import { ChatScreen } from "./screens/ChatScreen.jsx";
import { OnboardingScreen } from "./screens/OnboardingScreen.jsx";
import { WelcomeGateScreen } from "./screens/WelcomeGateScreen.jsx";
import { LoginScreen } from "./screens/LoginScreen.jsx";
import { HowScoreScreen } from "./screens/HowScoreScreen.jsx";
import { WegsScreen } from "./screens/WegsScreen.jsx";
import { PrivacyScreen } from "./screens/PrivacyScreen.jsx";
import { AboutScreen } from "./screens/AboutScreen.jsx";
import { AccessibilityScreen } from "./screens/AccessibilityScreen.jsx";
import { FeedbackScreen } from "./screens/FeedbackScreen.jsx";

import { AddTxnSheet } from "./components/AddTxnSheet.jsx";
import { ImportTxnsSheet } from "./components/ImportTxnsSheet.jsx";
import { GoalSheet } from "./components/GoalSheet.jsx";
import { ReplySheet } from "./components/ReplySheet.jsx";
import { LanguageSheet } from "./components/ui/LanguageSheet.jsx";
import { Tour } from "./components/tour/Tour.jsx";
import { TourContext, useTourController } from "./components/tour/useTour.js";

const TAB_LABEL = { home: "Home", records: "Records", learn: "Learn", grow: "Grow", profile: "Profile" };
const TABS = [["home", "Home", Home], ["records", "Records", Receipt], ["learn", "Learn", BookOpen], ["grow", "Grow", TrendingUp], ["profile", "Profile", User]];
const TAB_OF = { formalization: "home", guide: "home", home: "home", health: "home", steps: "home", profileDetail: "profile", records: "records", cash: "records", txns: "records", pay: "records", learn: "learn", module: "learn", finance: "home", summary: "home", docs: "profile", referral: "home", referralPack: "home", referralStatus: "home", register: "profile", grow: "grow", opp: "grow", community: "grow", profile: "profile", notifications: "home", chat: "home", howScore: "home", privacy: "profile", about: "profile", accessibility: "profile", feedback: "profile", wegs: "home" };
const ZOOM = { normal: 1, large: 1.15, xl: 1.3 };
const nextId = (prefix, list) => `${prefix}-${String((list || []).length + 1).padStart(3, "0")}`;

export default function NearyApp() {
  const [db, setDb] = useState(null);
  const [stack, setStack] = useState([["home"]]);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [toast, setToast] = useState(null);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [authMode, setAuthMode] = useState(() => {
    if (typeof window === "undefined") return null;
    const p = new URLSearchParams(window.location.search).get("auth");
    return p === "login" || p === "register" ? p : null;
  });
  // A link from the landing page (?auth=login / ?auth=register) means she
  // deliberately asked for that screen — show it even if this browser
  // already has a session from earlier testing, until she actually goes
  // through it (then it behaves normally again).
  const [forceAuth, setForceAuth] = useState(() => {
    if (typeof window === "undefined") return false;
    const p = new URLSearchParams(window.location.search).get("auth");
    return p === "login" || p === "register";
  });
  const first = useRef(true);
  const boot = useRef(Date.now());
  const clock = () => NOW_MS + (Date.now() - boot.current);
  const nextTxnId = (list) => `T-${String(list.reduce((m, x) => Math.max(m, parseInt(String(x.id).slice(2), 10) || 0), 0) + 1).padStart(4, "0")}`;
  setLocale(db?.settings?.lang || "en");
  const cur = stack[stack.length - 1];
  const screen = cur[0], arg = cur[1];
  const tour = useTourController({ db, setDb, screen, tab: TAB_OF[screen] || "home", goTab: (k) => setStack([[k]]), blocked: addOpen || goalOpen || langOpen || !!replyTo });

  useEffect(() => {
    let dead = false;
    (async () => {
      let data = null;
      try { const r = await storage.get(STORAGE_KEY); if (r && r.value) data = JSON.parse(r.value); } catch (e) { /* first run */ }
      if (!dead) setDb(migrate(data));
    })();
    return () => { dead = true; };
  }, []);
  useEffect(() => {
    if (!db) return;
    if (first.current) { first.current = false; return; }
    const timer = setTimeout(async () => { try { await storage.set(STORAGE_KEY, JSON.stringify(db)); } catch (e) { /* keep in memory */ } }, 800);
    return () => clearTimeout(timer);
  }, [db]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), 2600); return () => clearTimeout(timer); }, [toast]);
  // Reconnecting flushes anything recorded while the phone had no signal.
  useEffect(() => {
    if (!online || !db || !db.outbox || !db.outbox.length) return;
    setSyncing(true);
    const n = db.outbox.length;
    const timer = setTimeout(() => {
      setDb((p) => ({ ...p, outbox: [], txns: p.txns.map((x) => (x.pending ? { ...x, pending: false } : x)) }));
      setSyncing(false);
      setToast(`${n} ${n === 1 ? "change" : "changes"} synced`);
    }, 1400);
    return () => clearTimeout(timer);
  }, [online, db && db.outbox && db.outbox.length]);

  if (!db) {
    return (
      <div className="min-h-[600px] flex items-center justify-center" style={{ fontFamily: BODY, background: "#FFFAFC" }}>
        <div className="text-center"><div className="w-9 h-9 mx-auto rounded-full border-4" style={{ borderColor: C.blush, borderTopColor: C.pink, animation: "spin 1s linear infinite" }} /><div className="mt-3 text-sm font-semibold" style={{ color: C.navy }}>Neary Smart Business</div></div>
      </div>
    );
  }

  const mutate = (fn) => setDb((p) => { const n = { ...p }; fn(n); return n; });
  const queueOffline = (label) => mutate((n) => { n.outbox = [...(n.outbox || []), { id: `O-${Date.now()}`, at: clock(), label }]; });

  const notify = (msg) => setToast(msg);
  const push = (...s) => setStack((k) => [...k, s]);
  const back = () => setStack((k) => (k.length > 1 ? k.slice(0, -1) : k));
  const go = (s, a) => {
    if (s === "__add") return setAddOpen(true);
    if (s === "__officer") { act.officer(); return; }
    if (TABS.some(([t]) => t === s)) return setStack([[s]]);
    push(s, a);
  };
  setContrast(!!(db.settings && db.settings.highContrast));
  const scoreBefore = scoreOf(db);
  const afterScore = (n, msg) => { const s = scoreOf(n); if (s > scoreBefore) notify(`${msg} Readiness score is now ${s}.`); else notify(msg); };

  const act = {
    toast: notify,
    openAdd: () => setAddOpen(true),
    openImport: () => setImportOpen(true),
    openGoal: () => setGoalOpen(true),
    openLang: () => setLangOpen(true),
    openReply: (id) => setReplyTo(id),
    addTxn: (tx) => {
      mutate((n) => { n.txns = [...n.txns, { ...tx, id: nextTxnId(n.txns), at: clock(), pending: !online }]; afterScore(n, online ? "Record saved." : "Saved on your phone. It will sync when you are back online."); });
      if (!online) queueOffline("Record added");
    },
    importTxns: (rows) => {
      mutate((n) => {
        let list = n.txns;
        rows.forEach((tx) => { list = [...list, { ...tx, id: nextTxnId(list), at: tx.at || clock(), pending: !online, imported: true }]; });
        n.txns = list;
        afterScore(n, `${rows.length} record${rows.length === 1 ? "" : "s"} imported.`);
      });
      if (!online) queueOffline(`${rows.length} records imported`);
    },
    setOnline: (v) => setOnline(v),
    startFullTour: () => { setStack([["home"]]); tour.api.startFull(); },
    resetTours: () => { tour.resetTours(); notify("Tour hints reset. Each menu tour will show again."); },
    openJourney: () => setStack([["grow", "journey"]]),
    /* ---- onboarding and consent ---- */
    completeOnboarding: ({ phone, consents, biz, sector, province, businessStage }) => {
      mutate((n) => {
        n.seenOnboarding = true;
        n.loggedIn = true;
        n.account = { phone: phone || n.account.phone, registeredAt: clock() };
        n.consents = { scoring: !!consents.scoring, lenders: !!consents.lenders, aiCoach: !!consents.aiCoach, at: clock() };
        n.me = { ...n.me, ...(biz ? { biz } : {}), ...(sector ? { sector } : {}), ...(province ? { province } : {}), ...(phone ? { phone } : {}), ...(businessStage ? { businessStage } : {}) };
      });
      setAuthMode(null); setForceAuth(false);
      setStack([["home"]]);
      notify("Welcome to Neary");
    },
    skipOnboarding: () => { mutate((n) => { n.seenOnboarding = true; n.loggedIn = true; n.consents = { scoring: true, lenders: false, aiCoach: true, at: clock() }; }); setAuthMode(null); setForceAuth(false); setStack([["home"]]); },
    replayOnboarding: () => { mutate((n) => { n.seenOnboarding = false; }); setStack([["home"]]); },
    login: (phone) => {
      mutate((n) => { n.loggedIn = true; n.seenOnboarding = true; if (phone) n.account = { ...n.account, phone }; });
      setAuthMode(null); setForceAuth(false);
      setStack([["home"]]);
      notify(db.me && db.me.name ? `Welcome back, ${db.me.name}` : "Welcome back");
    },
    logout: () => {
      mutate((n) => { n.loggedIn = false; });
      setAuthMode("login");
      setStack([["home"]]);
    },
    setConsent: (key, val) => {
      mutate((n) => {
        n.consents = { ...n.consents, [key]: val, at: clock() };
        n.consentLog = [{ at: clock(), type: key, action: val ? "granted" : "withdrawn" }, ...(n.consentLog || [])];
      });
      if (key === "lenders" && !val && db.referral.status !== "none") act.withdrawConsent();
      else notify(val ? "Consent given" : "Consent withdrawn");
    },
    setSetting: (key, val) => mutate((n) => { n.settings = { ...n.settings, [key]: val }; }),
    /* ---- score review, data rights, feedback ---- */
    submitScoreReview: ({ reason, note }) => {
      mutate((n) => { n.scoreReviews = [{ id: nextId("SR", n.scoreReviews), reason, note: note || "", status: "Open", createdAt: clock(), scoreAtRequest: scoreOf(n) }, ...n.scoreReviews]; });
      notify("Review requested. An officer will look at your score.");
    },
    resolveScoreReview: (id, status) => { mutate((n) => { n.scoreReviews = n.scoreReviews.map((r) => (r.id === id ? { ...r, status, resolvedAt: clock() } : r)); }); notify(`Demo: review marked ${status}`); },
    submitDataRequest: ({ type, note }) => {
      mutate((n) => { n.dataRequests = [{ id: nextId("DR", n.dataRequests), type, status: "Received", createdAt: clock(), dueAt: clock() + 30 * 86400000, note: note || "" }, ...n.dataRequests]; });
      notify("Request received. We will answer within 30 days.");
    },
    addFeedback: ({ rating, category, text }) => {
      mutate((n) => { n.feedback = [{ id: nextId("FB", n.feedback), rating, category, text: text || "", createdAt: clock() }, ...n.feedback]; });
      notify("Thank you for your feedback");
    },
    /* ---- follow-ups (officer call-backs, re-checks, coaching, other lender) ---- */
    addFollowUp: (type, note, dueDays) => mutate((n) => { n.followUps = [{ id: nextId("FU", n.followUps), type, note, status: "Open", createdAt: clock(), dueAt: dueDays ? clock() + dueDays * 86400000 : null }, ...n.followUps]; }),
    officer: () => { act.addFollowUp("officer", `Call-back requested from ${db.me.province}`, 2); notify(`A MoWA officer in ${db.me.province} will call you back`); },
    decideReferral: (decision) => {
      mutate((n) => {
        if (n.referral.status === "none") return;
        const name = n.referral.lenders[0] || "The lender";
        n.referral = { ...n.referral, status: decision, decidedAt: clock(), events: [...n.referral.events, { at: clock(), t: decision === "approved" ? `${name} approved your application in principle` : `${name} could not offer you a loan this time` }] };
        n.notifications = [{ id: `N${Date.now()}`, at: clock(), icon: "ref", t: decision === "approved" ? "Referral approved" : "Referral not approved", s: decision === "approved" ? `${name} will contact you to finish the paperwork` : "See what you can do next", read: false, go: ["referralStatus"] }, ...n.notifications];
      });
      notify(decision === "approved" ? "Demo: lender approved" : "Demo: lender declined");
    },
    /* ---- AI coach feedback ---- */
    rateChat: (i, fb, fbReason) => mutate((n) => { n.chat = n.chat.map((m, k) => (k === i ? { ...m, fb, fbReason: fbReason || "" } : m)); }),
    reportChat: (i, fbReason) => { mutate((n) => { n.chat = n.chat.map((m, k) => (k === i ? { ...m, fb: "down", fbReason, reported: true } : m)); }); notify("Reported. A person will review this answer."); },
    setLang: (l) => { mutate((n) => { n.settings = { ...(n.settings || {}), lang: l }; }); notify(`${LANGS.find((x) => x.code === l)?.native}`); },
    simulatePayment: () => {
      if (!online) { notify("You need a connection to receive a payment"); return; }
      const amt = Math.round((3 + Math.random() * 22) * 4) / 4;
      mutate((n) => {
        n.txns = [...n.txns, { id: nextTxnId(n.txns), at: clock(), type: "income", amount: amt, cat: "Customer payment", method: "khqr" }];
        n.notifications = [{ id: `N${Date.now()}`, at: clock(), icon: "pay", t: "Payment received", s: `${usd(amt)} from a customer through KHQR`, read: false, go: ["txns"] }, ...n.notifications];
      });
      notify(`${usd(amt)} received and recorded`);
    },
    uploadDoc: (id) => { mutate((n) => { n.docs = n.docs.map((d) => (d.id === id ? { ...d, status: "Verified" } : d)); afterScore(n, "Document added and verified."); }); },
    toggleSummary: (id) => { mutate((n) => { n.summary = n.summary.map((s) => (s.id === id ? { ...s, done: !s.done } : s)); afterScore(n, "Summary updated."); }); },
    setProfileField: (id, value) => { mutate((n) => { n.profileFields = n.profileFields.map((f) => (f.id === id ? { ...f, value, done: !!value.trim() } : f)); }); notify("Profile updated"); },
    moduleProgress: (id) => mutate((n) => { n.modules = n.modules.map((m) => (m.id === id && m.status === "Not started" ? { ...m, status: "In progress" } : m)); }),
    completeModule: (id) => { mutate((n) => { n.modules = n.modules.map((m) => (m.id === id ? { ...m, status: "Completed" } : m)); }); notify("Lesson completed"); },
    rateModule: (id, r) => { mutate((n) => { n.modules = n.modules.map((m) => (m.id === id ? { ...m, rating: r } : m)); }); notify("Thank you for the rating"); },
    applyOpp: (id) => { mutate((n) => { n.opps = n.opps.map((o) => (o.id === id ? { ...o, applied_by_me: true, applied: o.applied + 1 } : o)); }); notify("Application sent"); },
    setWegsCriterion: (key, val) => mutate((n) => { n.wegs = { criteria: { ...n.wegs.criteria, [key]: val }, lastUpdated: clock() }; }),
    requestMentor: (mentorId, note) => {
      mutate((n) => { n.mentorRequests = [{ id: nextId("MR", n.mentorRequests), mentorId, at: clock(), status: "Requested", note: note || "" }, ...n.mentorRequests]; });
      const m = db.mentors.find((x) => x.id === mentorId);
      notify(m ? `Request sent to ${m.name}` : "Request sent");
    },
    toggleGuideStep: (gid, sid) => {
      mutate((n) => {
        n.guides = n.guides.map((g) => (g.id === gid ? { ...g, done: g.done.includes(sid) ? g.done.filter((x) => x !== sid) : [...g.done, sid] } : g));
      });
      const g = GUIDES.find((x) => x.id === gid);
      const rec = db.guides.find((x) => x.id === gid) || { done: [] };
      if (!rec.done.includes(sid)) { const left = g.steps.filter((s) => !s.auto).length - (rec.done.length + 1); notify(left > 0 ? `Step done, ${left} to go` : "Guide completed"); }
    },
    toggleGoal: (id) => mutate((n) => { n.goals = n.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)); }),
    addGoal: (label) => { mutate((n) => { n.goals = [...n.goals, { id: `G-${Date.now()}`, label, done: false }]; }); notify("Goal added"); },
    bookProvider: (id) => { mutate((n) => { n.providers = n.providers.map((p) => (p.id === id ? { ...p, booked: true } : p)); }); notify("The provider will call you back"); },
    likePost: (id) => mutate((n) => { n.community = n.community.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)); }),
    addReply: (id, text) => { mutate((n) => { n.community = n.community.map((p) => (p.id === id ? { ...p, replies: [...p.replies, { who: "Sokha", at: clock(), text }] } : p)); }); notify("Reply posted"); },
    addPost: (text) => { mutate((n) => { n.community = [{ id: `C${Date.now()}`, who: "Sokha", biz: n.me.sector, at: clock(), text, likes: 0, liked: false, replies: [] }, ...n.community]; }); notify("Posted to the community"); },
    submitReferral: (ids) => {
      const names = ids.filter((i) => !LENDERS.find((l) => l.id === i)?.guarantee).map((i) => LENDERS.find((l) => l.id === i)?.name).filter(Boolean);
      mutate((n) => {
        if (["approved", "declined"].includes(n.referral.status)) n.referralHistory = [...n.referralHistory, n.referral];
        n.referral = { status: "submitted", lenders: names, consent: true, submittedAt: clock(), guarantee: false, events: [{ at: clock(), t: `Referral pack sent to ${names.join(" and ")}` }] };
        n.notifications = [{ id: `N${Date.now()}`, at: clock(), icon: "ref", t: "Referral sent", s: `${names.join(", ")} received your pack`, read: false, go: ["referralStatus"] }, ...n.notifications];
      });
      notify("Referral sent");
      setTimeout(() => { mutate((n) => { if (n.referral.status !== "submitted") return; n.referral = { ...n.referral, events: [...n.referral.events, { at: clock(), t: `${n.referral.lenders[0]} opened your referral` }] }; }); }, 6000);
    },
    withdrawConsent: () => { mutate((n) => { n.referral = { status: "none", lenders: [], consent: false, submittedAt: null, events: [], guarantee: false }; }); notify("Consent withdrawn. Your data is no longer shared."); },
    saveRegistration: (patch) => mutate((n) => { n.registration = { ...n.registration, ...patch, status: "in_progress" }; }),
    submitRegistration: ({ type, details }) => { mutate((n) => { n.registration = { ...n.registration, type, details, status: "submitted", submittedAt: clock(), step: 3 }; }); notify("Registration submitted to business.gov.kh"); },
    readAll: () => mutate((n) => { n.notifications = n.notifications.map((x) => ({ ...x, read: true })); }),
    readOne: (id) => mutate((n) => { n.notifications = n.notifications.map((x) => (x.id === id ? { ...x, read: true } : x)); }),
    reset: async () => { try { await storage.delete(STORAGE_KEY); } catch (e) { /* ignore */ } first.current = true; setDb(freshDB()); setAuthMode(null); setForceAuth(false); setStack([["home"]]); notify("Demonstration data reset"); },
    send: (text) => {
      setDb((p) => {
        const withMe = { ...p, chat: [...p.chat, { role: "me", at: clock(), text }] };
        const r = aiReply(withMe, text);
        return { ...withMe, chat: [...withMe.chat, { role: "ai", at: clock() + 1, text: r.text, chips: r.chips }] };
      });
    },
    isOnline: online,
    chip: (c) => { const [s, a] = c.go; if (s === "__ask") return act.send(a); if (s === "__officer") return act.officer(); if (s === "__add") return setAddOpen(true); go(s, a); },
  };

  const tab = TAB_OF[screen] || "home";
  const needsAuth = forceAuth || !db.loggedIn;
  const hasAccount = !!(db.account && db.account.registeredAt);
  const gateMode = authMode || (hasAccount ? "login" : "welcome");
  const onboarding = needsAuth || !db.seenOnboarding;
  const body = needsAuth ? (
    gateMode === "register" ? <OnboardingScreen db={db} act={act} />
      : gateMode === "login" ? <LoginScreen db={db} act={act} onBack={authMode === null ? undefined : () => setAuthMode(null)} onRegister={() => setAuthMode("register")} />
      : <WelcomeGateScreen act={act} onRegister={() => setAuthMode("register")} onLogin={() => setAuthMode("login")} />
  ) : !db.seenOnboarding ? <OnboardingScreen db={db} act={act} /> : (() => {
    switch (screen) {
      case "home": return <HomeScreen db={db} go={go} act={act} />;
      case "health": return <HealthScreen db={db} go={go} back={back} />;
      case "steps": return <StepsScreen db={db} go={go} back={back} />;
      case "profileDetail": return <ProfileDetailScreen db={db} back={back} act={act} />;
      case "records": case "cash": return <CashScreen db={db} go={go} back={screen === "cash" ? back : null} act={act} />;
      case "txns": return <TxnsScreen db={db} back={back} act={act} />;
      case "pay": return <PayScreen db={db} back={back} act={act} />;
      case "learn": return <LearnScreen db={db} go={go} act={act} />;
      case "module": return <ModuleScreen db={db} id={arg} back={back} act={act} />;
      case "finance": return <FinanceScreen db={db} go={go} back={back} act={act} />;
      case "summary": return <SummaryScreen db={db} back={back} act={act} />;
      case "docs": return <DocsScreen db={db} back={back} act={act} />;
      case "referral": return <ReferralScreen db={db} go={go} back={back} act={act} />;
      case "referralPack": return <ReferralPackScreen db={db} ids={arg} back={back} act={act} go={go} />;
      case "referralStatus": return <ReferralStatusScreen db={db} back={back} go={go} act={act} />;
      case "register": return <RegisterScreen db={db} back={back} act={act} go={go} />;
      case "formalization": return <FormalizationScreen db={db} go={go} back={back} />;
      case "guide": return <GuideScreen db={db} id={arg} go={go} back={back} act={act} />;
      case "grow": return <GrowScreen db={db} go={go} act={act} initialTab={arg} />;
      case "opp": return <OppScreen db={db} id={arg} back={back} act={act} />;
      case "community": return <CommunityScreen db={db} back={back} act={act} />;
      case "notifications": return <NotificationsScreen db={db} go={go} back={back} act={act} />;
      case "profile": return <ProfileScreen db={db} go={go} act={act} />;
      case "chat": return <ChatScreen db={db} back={back} act={act} preset={arg} />;
      case "howScore": return <HowScoreScreen db={db} go={go} back={back} act={act} />;
      case "wegs": return <WegsScreen db={db} go={go} back={back} act={act} />;
      case "privacy": return <PrivacyScreen db={db} back={back} act={act} go={go} />;
      case "about": return <AboutScreen back={back} />;
      case "accessibility": return <AccessibilityScreen db={db} back={back} act={act} />;
      case "feedback": return <FeedbackScreen db={db} back={back} act={act} />;
      default: return <HomeScreen db={db} go={go} act={act} />;
    }
  })();

  const showTabs = !onboarding && !["chat", "module"].includes(screen);
  const zoom = ZOOM[db.settings && db.settings.textSize] || 1;
  const phone = (
    <div className="relative overflow-hidden w-full max-w-[430px] mx-auto" style={{ height: "100vh", maxHeight: "100vh", background: "#fff", fontFamily: localeFont(BODY), color: C.ink }}>
    <div className="relative flex flex-col" data-hc={db.settings && db.settings.highContrast ? "1" : "0"} data-reduce-motion={db.settings && db.settings.reduceMotion ? "1" : "0"} data-textsize={(db.settings && db.settings.textSize) || "normal"} style={zoom === 1 ? { width: "100%", height: "100%" } : { transform: `scale(${zoom})`, transformOrigin: "top left", width: `${100 / zoom}%`, height: `${100 / zoom}%` }}>
      <div className="flex items-center justify-between px-6 pt-2.5 pb-1 shrink-0 text-[11px] font-bold" style={{ color: C.navy }}>
        <span>8:45</span>
        <span className="flex items-center gap-1.5"><Signal size={12} /><Wifi size={12} /><BatteryFull size={14} /></span>
      </div>
      {(!online || syncing || (db.outbox && db.outbox.length > 0)) && (
        <div className="shrink-0 px-4 py-1.5 flex items-center gap-2 text-[11px] font-bold" style={{ background: syncing ? C.aquaSoft : !online ? C.amberSoft : C.aquaSoft, color: syncing ? "#1F8E86" : !online ? C.amber : "#1F8E86" }} role="status">
          {syncing ? <><span className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: "#1F8E86", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />{t("Syncing your records")}</>
            : !online ? <><AlertCircle size={13} />{t("No internet connection")}{db.outbox && db.outbox.length ? `, ${db.outbox.length} ${t("Waiting to sync")}` : `, ${t("Saved on your phone")}`}</>
            : <><Clock size={13} />{db.outbox.length} {t("Waiting to sync")}</>}
        </div>
      )}
      <main id="app-main" className="flex-1 overflow-y-auto overscroll-contain" style={{ scrollbarWidth: "thin", paddingBottom: screen === "chat" || onboarding ? 0 : 96 }} aria-live="polite">{body}</main>
      {showTabs && (
        <nav data-tour="tabbar" className="flex shrink-0 px-1 pt-1.5 pb-2" style={{ borderTop: `1px solid ${C.line}`, background: "#fff" }} aria-label={t("Main")} role="tablist">
          {TABS.map(([k, l, I]) => {
            const on = tab === k;
            return (
              <button key={k} onClick={() => setStack([[k]])} role="tab" aria-selected={on} aria-label={t(l)} className="flex-1 flex flex-col items-center gap-0.5 py-1 active:opacity-60" style={{ minHeight: 48 }}>
                <I size={20} style={{ color: on ? C.pink : C.soft }} strokeWidth={on ? 2.4 : 2} aria-hidden="true" />
                <span className="text-[10px] font-bold" style={{ color: on ? C.pink : C.soft }}>{t(l)}</span>
              </button>
            );
          })}
        </nav>
      )}
      {screen !== "chat" && !onboarding && (
        <button data-tour="ask" onClick={() => go("chat")} aria-label={t("Ask Neary")} className="absolute rounded-full flex items-center justify-center active:scale-95" style={{ right: 14, bottom: showTabs ? 70 : 18, width: 52, height: 52, background: GRAD, color: "#fff", boxShadow: "0 6px 18px rgba(242,0,112,0.35), 0 0 0 6px rgba(255,255,255,0.92)", transition: "transform .1s" }}>
          <Bot size={23} />
        </button>
      )}
      {addOpen && <AddTxnSheet onClose={() => setAddOpen(false)} act={act} />}
      {importOpen && <ImportTxnsSheet onClose={() => setImportOpen(false)} act={act} />}
      {goalOpen && <GoalSheet onClose={() => setGoalOpen(false)} act={act} />}
      {langOpen && <LanguageSheet current={(db.settings && db.settings.lang) || "en"} onPick={act.setLang} onClose={() => setLangOpen(false)} />}
      {replyTo && <ReplySheet onClose={() => setReplyTo(null)} act={act} id={replyTo} />}
      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 z-[60] rounded-full px-4 py-2.5 text-xs font-bold text-white flex items-center gap-2 max-w-[90%]" style={{ bottom: showTabs ? 78 : 24, background: C.navy, boxShadow: "0 10px 24px rgba(0,30,108,0.3)" }} role="status" aria-live="assertive">
          <CheckCircle2 size={14} style={{ color: "#7FE0B4" }} /><span className="truncate">{t(toast)}</span>
        </div>
      )}
      {tour.run && !onboarding && <Tour run={tour.run} onNext={tour.next} onBack={tour.back} onClose={tour.close} onSkipAll={tour.skipAll} reduce={!!(db.settings && db.settings.reduceMotion) || (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)} />}
    </div>
    </div>
  );

  return (
    <TourContext.Provider value={tour.api}>
    <div className="min-h-screen w-full flex justify-center" style={{ background: "radial-gradient(circle at 20% 0%, #FCE1EE 0, rgba(252,225,238,0) 42%), radial-gradient(circle at 90% 100%, #DFF6F4 0, rgba(223,246,244,0) 40%), #FFF7FB" }}>
      {phone}
    </div>
    </TourContext.Provider>
  );
}
