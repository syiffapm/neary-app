import { t, tp } from "../i18n/dict.js";
import { NOW_MS, DAY, monthStart, usd } from "./format.js";
import { ME, MONTHS, buildTxns, DOCS, SUMMARY_TASKS, PROFILE_FIELDS, MODULES, GOALS, ACHIEVEMENTS, OPPS, PROVIDERS, COMMUNITY, GUIDES, FORMAL_STEPS, MENTORS } from "./business.js";

export const STORAGE_KEY = "neary-app-db-v1";

export function freshDB() {
  return {
    version: 1,
    me: ME,
    txns: buildTxns(),
    docs: DOCS.map((d) => ({ ...d })),
    summary: SUMMARY_TASKS.map((d) => ({ ...d })),
    profileFields: PROFILE_FIELDS.map((d) => ({ ...d })),
    modules: MODULES.map((d) => ({ ...d })),
    goals: GOALS.map((d) => ({ ...d })),
    achievements: ACHIEVEMENTS.map((d) => ({ ...d })),
    opps: OPPS.map((d) => ({ ...d, applied_by_me: false })),
    providers: PROVIDERS.map((d) => ({ ...d, booked: false })),
    community: COMMUNITY.map((d) => ({ ...d, replies: d.replies.map((r) => ({ ...r })) })),
    referral: { status: "none", lenders: [], consent: false, submittedAt: null, events: [], guarantee: false },
    registration: { status: "not_started", step: 0, type: null, details: { name: "Sokha's Traditional Crafts", owner: "Chan Sokha", address: "", phone: ME.phone }, submittedAt: null },
    khqr: { connected: true, connectedAt: Date.UTC(2027, 9, 19, 10, 40) },
    salesTarget: 1500,
    settings: { lang: "en", textSize: "normal", highContrast: false, reduceMotion: false, toursSeen: {} },
    consents: { scoring: true, lenders: false, aiCoach: true, at: null },
    consentLog: [],
    account: { phone: ME.phone, registeredAt: null },
    wegs: { criteria: { shareholding: true, manager: true, legalRep: false, workforce: false }, lastUpdated: NOW_MS - 40 * DAY },
    mentors: MENTORS.map((m) => ({ ...m })),
    mentorRequests: [],
    scoreReviews: [],
    dataRequests: [],
    feedback: [],
    followUps: [],
    referralHistory: [],
    outbox: [],
    chat: [
      { role: "ai", at: NOW_MS - 3 * 60000, text: "Good morning Sokha. You received a KHQR payment of US$12.50 a minute ago. Ask me anything about your business." },
    ],
    notifications: [
      { id: "N1", at: Date.UTC(2028, 0, 21, 8, 44), icon: "pay", t: "Payment received", s: "US$12.50 from a customer through KHQR", read: false, go: ["txns"] },
      { id: "N2", at: Date.UTC(2028, 0, 20, 16, 10), icon: "spark", t: "You match a new opportunity", s: "Provincial Handicraft and Food Fair in Siem Reap", read: false, go: ["opp", "OP-2"] },
      { id: "N3", at: Date.UTC(2028, 0, 19, 9, 0), icon: "doc", t: "Two documents still needed", s: "Adding them raises your readiness score", read: true, go: ["finance"] },
      { id: "N4", at: Date.UTC(2028, 0, 17, 19, 30), icon: "learn", t: "Continue where you stopped", s: "Preparing for a loan: what lenders ask for", read: true, go: ["module", "LM-05"] },
    ],
    guides: GUIDES.map((g) => ({ id: g.id, done: [] })),
    seenOnboarding: false,
    loggedIn: false,
  };
}

/* Saved data from an earlier version is upgraded in place rather than
   discarded, so nothing she has recorded is ever lost on an update. */
export function migrate(saved) {
  const base = freshDB();
  if (!saved || typeof saved !== "object") return base;
  const out = { ...base, ...saved };
  Object.keys(base).forEach((k) => {
    const b = base[k], v = saved[k];
    if (Array.isArray(b)) { if (!Array.isArray(v)) out[k] = b; }
    else if (b && typeof b === "object") { if (!v || typeof v !== "object" || Array.isArray(v)) out[k] = b; else out[k] = { ...b, ...v }; }
    else if (v === undefined) out[k] = b;
  });
  // Arrays she already has are kept, but lessons added since she saved are appended.
  if (Array.isArray(saved.modules)) {
    const have = new Set(saved.modules.map((m) => m.id));
    out.modules = [...saved.modules, ...base.modules.filter((m) => !have.has(m.id))];
  }
  if (!out.settings.toursSeen || typeof out.settings.toursSeen !== "object" || Array.isArray(out.settings.toursSeen)) out.settings.toursSeen = {};
  out.version = base.version;
  return out;
}

/* ---------------- selectors: everything is derived from records ----- */
const inRange = (t, a, b) => t.at >= a && t.at < b;
const r2 = (n) => Math.round(n * 100) / 100;
function monthTotals(db, start, end) {
  const inc = r2(db.txns.filter((t) => t.type === "income" && inRange(t, start, end)).reduce((a, t) => a + t.amount, 0));
  const exp = r2(db.txns.filter((t) => t.type === "expense" && inRange(t, start, end)).reduce((a, t) => a + t.amount, 0));
  return { inc, exp, net: r2(inc - exp) };
}
// Compares the share of income eaten by costs this month against last month.
export function costTrend(db) {
  const ms = monthStart(NOW_MS);
  const prevStart = Date.UTC(new Date(ms).getUTCFullYear(), new Date(ms).getUTCMonth() - 1, 1);
  const cur = monthTotals(db, ms, NOW_MS + 1), prev = monthTotals(db, prevStart, ms);
  const share = cur.inc ? (cur.exp / cur.inc) * 100 : 0;
  const prevShare = prev.inc ? (prev.exp / prev.inc) * 100 : share;
  return { share, prevShare, delta: share - prevShare, cur, prev };
}
export function thisMonth(db) { return monthTotals(db, monthStart(NOW_MS), NOW_MS + 1); }
export function allTime(db) { return monthTotals(db, 0, NOW_MS + 1); }
export function monthSeries(db) {
  return MONTHS.map((m) => { const t = monthTotals(db, m.start, m.key === "2028-00" ? NOW_MS + 1 : m.end); return { m: m.label, sales: Math.round(t.inc), net: Math.round(t.net) }; });
}
export function weeksCovered(db) {
  let n = 0;
  for (let w = 0; w < 4; w++) { const end = NOW_MS - w * 7 * DAY, start = end - 7 * DAY; if (db.txns.some((t) => t.at >= start && t.at < end)) n++; }
  return n;
}
export function scoreParts(db) {
  const profile = Math.round(25 * (db.profileFields.filter((f) => f.done).length / db.profileFields.length));
  const n30 = db.txns.filter((t) => t.at >= NOW_MS - 30 * DAY).length;
  const records = Math.round(12 * (weeksCovered(db) / 4) + 18 * Math.min(1, n30 / 40));
  const summary = Math.floor(25 * (db.summary.filter((t) => t.done).length / db.summary.length));
  const documents = db.docs.filter((d) => d.status === "Verified").length * 5;
  return { profile, records, summary, documents };
}
export const scoreOf = (db) => { const p = scoreParts(db); return p.profile + p.records + p.summary + p.documents; };
export const READY_AT = 70;
export const isReady = (db) => scoreOf(db) >= READY_AT;

/* ---------------- score coverage: how much of her sales the app can verify directly ---- */
export function scoreCoverage(db) {
  const window = db.txns.filter((t) => t.type === "income" && t.at >= NOW_MS - 90 * DAY);
  const total = window.length;
  const khqr = window.filter((t) => t.method === "khqr").length;
  const ratio = total ? khqr / total : 0;
  return { khqr, total, ratio, pct: Math.round(ratio * 100), low: total > 0 && total < 15 && ratio < 0.2 };
}

/* ---------------- WEGS: CGCC's women-owned guarantee eligibility test --- */
export const WEGS_CRITERIA = [
  { key: "shareholding", t: "Majority female shareholding", d: "More than half of the business is owned by one or more women." },
  { key: "manager", t: "A woman as manager", d: "A woman runs the day-to-day operations of the business." },
  { key: "legalRep", t: "A woman as the registered legal representative", d: "A woman is named as the legal representative on the business registration." },
  { key: "workforce", t: "A majority-female workforce", d: "More than half of the people working in the business are women." },
];
export const WEGS_NEEDED = 2;
export function wegsStatus(db) {
  const c = (db.wegs && db.wegs.criteria) || {};
  const met = WEGS_CRITERIA.filter((x) => c[x.key]).length;
  return { met, needed: WEGS_NEEDED, total: WEGS_CRITERIA.length, eligible: met >= WEGS_NEEDED };
}


/* ---------------- formalization ------------------------------------ */
function monthsOfRecords(db) {
  if (!db.txns.length) return 0;
  const first = Math.min(...db.txns.map((t) => t.at));
  return (NOW_MS - first) / (30.4 * DAY);
}
function autoStepDone(db, key) {
  if (key === "weeks") return weeksCovered(db) >= 4;
  if (key === "module") return db.modules.find((m) => m.id === "LM-08")?.status === "Completed";
  if (key === "months") return monthsOfRecords(db) >= 3;
  return false;
}
export function guideState(db, g) {
  const rec = (db.guides || []).find((x) => x.id === g.id) || { done: [] };
  const done = g.steps.map((st) => (st.auto ? autoStepDone(db, st.auto) : rec.done.includes(st.id)));
  if (g.id === "G-02" && db.registration.status === "submitted") done.forEach((_, i) => (done[i] = true));
  return { done, count: done.filter(Boolean).length, total: g.steps.length, complete: done.every(Boolean) };
}
export function formalStatus(db) {
  if (guideState(db, GUIDES.find((g) => g.id === "G-03")).complete) return FORMAL_STEPS[3];
  if (db.registration.status === "submitted") return FORMAL_STEPS[2];
  if (guideState(db, GUIDES.find((g) => g.id === "G-05")).complete) return FORMAL_STEPS[1];
  return FORMAL_STEPS[0];
}

export function health(db) {
  const p = scoreParts(db);
  const mt = thisMonth(db);
  return [
    { id: "profile", label: t("Business profile"), ok: p.profile >= 25, detail: tp("{n} of {m} details complete", { n: db.profileFields.filter((f) => f.done).length, m: db.profileFields.length }), go: ["profileDetail"] },
    { id: "records", label: t("Records"), ok: p.records >= 27, detail: tp("{n} of the last 4 weeks have records", { n: weeksCovered(db) }), go: ["txns"] },
    { id: "cash", label: t("Cash flow"), ok: mt.net > 0 && costTrend(db).delta <= 2, detail: mt.net <= 0 ? t("You are spending more than you earn this month") : costTrend(db).delta > 2 ? tp("Costs took {a}% of your sales this month, up from {b}% last month", { a: costTrend(db).share.toFixed(0), b: costTrend(db).prevShare.toFixed(0) }) : tp("Net {a} this month", { a: usd(mt.net) }), go: ["cash"] },
    { id: "compliance", label: t("Compliance"), ok: [FORMAL_STEPS[2], FORMAL_STEPS[3]].includes(formalStatus(db)), detail: formalStatus(db) === FORMAL_STEPS[0] ? t("No formalization step completed yet") : formalStatus(db) === FORMAL_STEPS[1] ? t("Records are compliant, business not registered yet") : t(formalStatus(db)), go: ["formalization"] },
  ];
}
export function nextSteps(db) {
  const p = scoreParts(db);
  const g = (id) => guideState(db, GUIDES.find((x) => x.id === id)).complete;
  return [
    { id: "profile", t: t("Complete your business profile"), done: p.profile >= 25, go: ["profileDetail"] },
    { id: "register", t: t("Register your business"), done: db.registration.status === "submitted", go: ["guide", "G-02"] },
    { id: "tax", t: t("Get tax identification"), done: g("G-03"), go: ["guide", "G-03"] },
    { id: "account", t: t("Open a business account"), done: g("G-04"), go: ["guide", "G-04"] },
    { id: "compliance", t: t("Keep compliant records"), done: g("G-05"), go: ["guide", "G-05"] },
  ];
}

/* ---------------- learning: always shown in curriculum order, so lessons
   never jump around (e.g. lesson 3 followed by lesson 6) regardless of
   completion status ---- */
export function orderedModules(db) {
  return [...db.modules].sort((a, b) => (parseInt(a.id.slice(3), 10) || 0) - (parseInt(b.id.slice(3), 10) || 0));
}
export function lessonNumber(db, id) {
  return orderedModules(db).findIndex((m) => m.id === id) + 1;
}

/* ---------------- journey: eight steps, all derived from records ---- */
export const isFormal = (db) => [FORMAL_STEPS[2], FORMAL_STEPS[3]].includes(formalStatus(db));
export function journeySteps(db) {
  const p = scoreParts(db);
  const formal = isFormal(db);
  const raw = [
    { id: "register", label: "Register", done: !!db.seenOnboarding, go: ["profileDetail"], hint: "Create your account and choose what you agree to" },
    { id: "learn", label: "Learn", done: db.modules.filter((m) => m.status === "Completed").length >= 3, go: ["learn"], hint: "Complete three short lessons" },
    { id: "manage", label: "Manage business", done: weeksCovered(db) >= 3 && db.txns.length >= 20, go: ["txns"], hint: "Record sales and costs for at least 3 of the last 4 weeks" },
    { id: "coach", label: "Coach", done: (db.chat || []).some((m) => m.role === "me"), go: ["chat"], hint: "Ask the AI coach one question" },
    { id: "health", label: "Health check", done: p.profile >= 25 && p.records >= 27, go: ["health"], hint: "Complete your profile and keep your records steady" },
    { id: "formalize", label: "Formalize", done: formal, go: ["formalization"], gate: true, hint: "Register your business. This comes before finance." },
    { id: "ready", label: "Finance-ready", done: formal && isReady(db), go: ["finance"], needsGate: true, hint: `Reach a readiness score of ${READY_AT}` },
    { id: "bank", label: "Connect to bank", done: db.referral.status !== "none", go: ["referral"], needsGate: true, hint: "Ask for an introduction to a lender" },
  ];
  let currentSet = false;
  return raw.map((st) => {
    const locked = !!st.needsGate && !formal;
    let state = st.done ? "done" : locked ? "locked" : "todo";
    if (state === "todo" && !currentSet) { state = "current"; currentSet = true; }
    return { ...st, state, locked };
  });
}
