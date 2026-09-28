import { thisMonth, allTime, costTrend, scoreOf, scoreParts, weeksCovered, READY_AT, journeySteps } from "../data/db.js";
import { usd, NOW_MS, DAY } from "../data/format.js";

const SAFEGUARD = /(hurt myself|kill myself|beat(s|ing)? me|threaten\w*|violen\w*|abus\w*|unsafe at home|afraid of (him|my husband))/i;
const IDNUM = /\b\d{8,}\b/;
// Only her own merchant ID as a standalone number is allowed through.
const mentionsOwnMerchant = (raw, id) => new RegExp(`\\b${id}\\b`).test(raw);
export function aiReply(db, raw) {
  const q = raw.toLowerCase();
  const t = thisMonth(db), all = allTime(db), ct = costTrend(db), sc = scoreOf(db), p = scoreParts(db);
  const has = (...k) => k.some((w) => q.includes(w));
  const chip = (label, go) => ({ label, go });
  if (SAFEGUARD.test(raw)) return { text: "I am not the right help for this, and you deserve proper support. I can connect you to a trained officer at the Ministry of Women's Affairs who handles this confidentially. Would you like me to ask her to call you?", chips: [chip("Yes, ask her to call", ["__officer"])], flag: true };
  if (IDNUM.test(raw) && !mentionsOwnMerchant(raw, db.me.merchantId)) return { text: "I removed the long number from your message. Please do not share ID or bank numbers in chat. I do not need them to help you.", chips: [] };
  if (has("what should i do next", "what do i do next", "what now", "what's next", "whats next", "next step", "what should i do", "what next")) {
    const steps = journeySteps(db);
    const current = steps.find((s) => s.state === "current");
    const stage = db.me && db.me.businessStage;
    if (!current) return { text: `You have completed every step of your journey, including connecting to a lender. Your score is ${sc} out of 100 — from here it is about keeping your records steady and looking at the growth programs open to you.`, chips: [chip("See opportunities", ["grow"]), chip("Find a mentor", ["grow", "mentors"])] };
    const startingNote = stage === "starting" && ["learn", "manage"].includes(current.id) ? " Since you are just starting out, there is no rush — a couple of short lessons now make recording your first sales much easier." : "";
    const hint = current.hint.replace(/\.+$/, "");
    return { text: `Your readiness score is ${sc} out of 100. Your next step is "${current.label}": ${hint}.${startingNote}`, chips: [chip(`Go to ${current.label}`, current.go), chip("Why this order?", ["__ask", "Why is Formalize before Finance-ready?"])] };
  }
  if (has("why is formalize before", "why formalize before", "formalize before finance")) return { text: `Lenders and the guarantee scheme only take a referral once your business is at least at the "Compliant records" stage of formalization. Asking you to formalize first means we never send a referral that would just be turned away.`, chips: [chip("Start formalizing", ["formalization"])] };
  if (has("grow my business", "develop my business", "business development", "how do i grow", "expand my business", "scale my business", "improve my business", "grow business", "growth")) {
    const growModule = db.modules.find((m) => m.status !== "Completed" && /pric|growth|sell|digital/i.test(m.t || "")) || db.modules.find((m) => m.status !== "Completed");
    const opp = db.opps.find((o) => !o.applied_by_me);
    const mentor = (db.mentors || []).find((m) => m.sector === db.me.sector && m.verified) || (db.mentors || []).find((m) => m.verified);
    const parts = ["For growth I would look at three things: your pricing and margin, a steady sales channel, and a second pair of eyes on your plan."];
    if (growModule) parts.push(`"${growModule.t}" is a short lesson that fits.`);
    if (opp) parts.push(`"${opp.t}" is open right now and matches your business.`);
    if (mentor) parts.push(`${mentor.name}, a verified mentor in ${mentor.sector}, can also talk it through with you.`);
    return { text: parts.join(" "), chips: [growModule && chip("Open the lesson", ["module", growModule.id]), opp && chip("See the opportunity", ["opp", opp.id]), mentor && chip("Find a mentor", ["grow", "mentors"])].filter(Boolean) };
  }
  if (has("approve", "approved", "guarantee", "will the bank", "will they give")) return { text: `I cannot decide or promise a loan. That decision belongs to the lender. What I can tell you is that your readiness score is ${sc} out of 100, which is above the ${READY_AT} that partners look for, and your records cover ${weeksCovered(db)} of the last 4 weeks. I can prepare your referral pack so the lender sees this clearly.`, chips: [chip("See my readiness", ["finance"]), chip("Start a referral", ["referral"])] };
  if (has("how is my business", "business doing", "how am i doing", "this month")) return { text: `This month you sold ${usd(t.inc)} and spent ${usd(t.exp)}, leaving ${usd(t.net)}. Sales are up on last month, but costs took ${ct.share.toFixed(0)}% of your sales against ${ct.prevShare.toFixed(0)}% before. Raw materials are the biggest part.`, chips: [chip("Show my cash flow", ["cash"]), chip("Why did costs rise?", ["__ask", "Why did my expenses increase?"])] };
  if (has("expenses increase", "costs rise", "why did my expenses", "costs up")) return { text: `Your materials spending grew faster than your sales this month. Two things usually cause this: buying stock in bigger batches, or paying more per unit. Check your last five material purchases and compare the price per piece with December.`, chips: [chip("Open transactions", ["txns"]), chip("Lesson on cash flow", ["module", "LM-02"])] };
  if (has("cash flow", "cashflow", "profit", "how much did i earn")) return { text: `Since you joined you have sold ${usd(all.inc)} and spent ${usd(all.exp)}, so your net profit is ${usd(all.net)}. This month alone your net is ${usd(t.net)}.`, chips: [chip("Show my cash flow", ["cash"])] };
  if (has("finance-ready", "finance ready", "my score", "readiness")) {
    const missing = [];
    if (p.summary < 25) missing.push(`finish your financial summary (${db.summary.filter((s) => !s.done).length} tasks left)`);
    if (p.documents < 20) missing.push(`add ${db.docs.filter((d) => d.status === "Needed").length} documents`);
    return { text: `Your score is ${sc} out of 100. Your profile and records are complete. To go higher, ${missing.join(" and ")}.`, chips: [chip("See my readiness", ["finance"]), chip("Add documents", ["docs"])] };
  }
  if (has("register", "registration", "formal", "licence", "license")) return { text: `Most traders like you register as a sole proprietorship. You need your ID card, proof of your business address, and a business name that is free. I can walk you through it step by step and keep your progress saved.`, chips: [chip("Start registration", ["register"]), chip("Learn first", ["module", "LM-04"])] };
  if (has("tax", "gdt", "tax id")) return { text: `For a Tax ID you usually need your ID card, proof of address and your business registration. I want to be careful here: our tax guidance is still being confirmed with the General Department of Taxation, so please check with your provincial officer before you pay any fee.`, chips: [chip("Ask an officer", ["__officer"])] };
  if (has("khqr", "qr", "get paid", "accept payment")) return { text: `Your KHQR is already connected under merchant ID ${db.me.merchantId}. Show the code, the customer scans it, and the payment is recorded in your books automatically. You can also set a fixed amount so the customer cannot change it.`, chips: [chip("Open my QR", ["pay"])] };
  if (has("program", "opportunity", "grant", "mentor", "fair")) { const o = db.opps.filter((x) => !x.applied_by_me); return { text: o.length ? `${o.length} opportunities fit your business right now. The closest deadline is ${o[0].t}, closing in ${Math.ceil((o[0].closes - NOW_MS) / DAY)} days.` : "You have applied to every opportunity that fits right now. I will tell you when a new one appears.", chips: o.length ? [chip("See opportunities", ["grow"]), chip(o[0].t.slice(0, 22), ["opp", o[0].id])] : [] }; }
  if (has("loan", "borrow", "credit", "money from bank")) return { text: `I can introduce you to partner lenders, but only with your consent, and a referral is not a loan offer. Before you borrow, check that repayments stay under about a third of your usual monthly profit, which is around ${usd(all.net / 4 / 3)} for you.`, chips: [chip("How lenders decide", ["module", "LM-05"]), chip("Start a referral", ["referral"])] };
  if (has("price", "pricing", "how much should i charge")) return { text: `Add your material and labour cost per piece, then add a margin. Your overall margin this month is ${(100 - ct.share).toFixed(0)}%, which is thinner than last month. If you raise prices, do it on your best-selling item first and watch whether sales hold.`, chips: [chip("Pricing lesson", ["module", "LM-06"])] };
  if (has("record a sale", "add a sale", "record sale", "add record", "add transaction")) return { text: "I can open the record form for you. Recording on the same day keeps your score strong.", chips: [chip("Add a record", ["__add"])] };
  if (has("learn", "training", "course", "lesson")) { const m = db.modules.find((x) => x.status !== "Completed"); return { text: m ? `Based on your records I would start with “${m.t}”. It takes ${m.min} minutes.` : "You have completed every lesson available. New ones are added each month.", chips: m ? [chip("Open the lesson", ["module", m.id])] : [] }; }
  if (has("online", "facebook", "social", "marketing", "sell more")) return { text: `Selling online suits handicraft well. Start with clear photos on a plain background and a fixed price list. The Digital Selling Bootcamp covers exactly this, and you qualify because your KHQR is connected.`, chips: [chip("See the bootcamp", ["opp", "OP-3"]), chip("Find a provider", ["grow"])] };
  if (has("hello", "hi ", "hey", "good morning", "sues", "what can you do", "help me")) return { text: `Hello Sokha. I can explain your numbers, help you register your business, prepare you for finance, and find programs you qualify for. I give guidance only, I do not make credit or legal decisions.`, chips: [chip("What should I do next?", ["__ask", "What should I do next?"]), chip("How do I grow my business?", ["__ask", "How do I grow my business?"]), chip("Am I finance-ready?", ["__ask", "Am I finance-ready?"])] };
  return { text: `I am not confident enough to answer that from what I have been given. Rather than guess, I can pass your question to a MoWA officer in ${db.me.province}, or you can ask me about your sales, costs, registration, finance readiness or the programs you qualify for.`, chips: [chip("Ask an officer", ["__officer"]), chip("How is my business?", ["__ask", "How is my business doing this month?"])] };
}
