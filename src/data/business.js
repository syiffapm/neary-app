import { JOINED_MS, NOW_MS, DAY, mulberry32, integerize } from "./format.js";

export const ME = {
  id: "NSB-00412", name: "Chan Sokha", biz: "Sokha's Traditional Crafts", sector: "Tailoring & handicraft",
  province: "Siem Reap", district: "Siem Reap", stage: "Informal, fixed location", phone: "+855 12 845 302",
  merchantId: "12345678", joinedAt: JOINED_MS, facilitator: "Keo Leakena", facilitatorRole: "Women's Development Centre, Siem Reap",
  years: 6, workers: 3, products: "Silk scarves, krama, handwoven bags",
};

// Month totals, matching the figures shown to her in the app.
export const MONTHS = [
  { key: "2027-09", label: "Oct", start: Date.UTC(2027, 9, 12), end: Date.UTC(2027, 10, 1), inc: 900, exp: 620, nInc: 32, nExp: 9 },
  { key: "2027-10", label: "Nov", start: Date.UTC(2027, 10, 1), end: Date.UTC(2027, 11, 1), inc: 1250, exp: 800, nInc: 44, nExp: 12 },
  { key: "2027-11", label: "Dec", start: Date.UTC(2027, 11, 1), end: Date.UTC(2028, 0, 1), inc: 1450, exp: 880, nInc: 50, nExp: 13 },
  { key: "2028-00", label: "Jan", start: Date.UTC(2028, 0, 1), end: NOW_MS, inc: 1237.5, exp: 820, nInc: 45, nExp: 12 },
];
const INC_KINDS = [["Customer payment", "khqr", 0.62], ["Cash sale", "manual", 0.24], ["Market stall sale", "manual", 0.09], ["Wholesale order", "bank", 0.05]];
const EXP_KINDS = [["Raw materials", "manual", 0.42], ["Supplier payment", "bank", 0.2], ["Market stall fee", "manual", 0.14], ["Transport", "manual", 0.12], ["Packaging", "manual", 0.07], ["Utilities", "manual", 0.05]];

export function buildTxns() {
  const R = mulberry32(412028);
  const out = [];
  let n = 1;
  MONTHS.forEach((m) => {
    [["income", m.inc, m.nInc, INC_KINDS], ["expense", m.exp, m.nExp, EXP_KINDS]].forEach(([type, total, count, kinds]) => {
      const weights = Array.from({ length: count }, () => 0.4 + Math.pow(R(), 1.4) * 1.8);
      const cents = integerize(weights, Math.round(total * 100));
      const span = m.end - m.start;
      for (let i = 0; i < count; i++) {
        const t = m.start + Math.floor(Math.pow(R(), 0.92) * span);
        const d = new Date(t);
        const at = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 7 + Math.floor(R() * 11), Math.floor(R() * 60));
        let r = R(), pick = kinds[0];
        for (const k of kinds) { if (r < k[2]) { pick = k; break; } r -= k[2]; }
        out.push({ id: `T-${String(n++).padStart(4, "0")}`, at: Math.min(at, NOW_MS - 60000), type, amount: cents[i] / 100, cat: pick[0], method: pick[1] });
      }
    });
  });
  out.sort((a, b) => a.at - b.at);
  // The payment that arrived while she was opening the app this morning.
  out.push({ id: `T-${String(n++).padStart(4, "0")}`, at: Date.UTC(2028, 0, 21, 8, 44), type: "income", amount: 12.5, cat: "Customer payment", method: "khqr" });
  return out;
}

export const DOCS = [
  { id: "D1", name: "National ID card", note: "Front and back", status: "Verified" },
  { id: "D2", name: "Photo of your business", note: "Shopfront or work area", status: "Under review" },
  { id: "D3", name: "Proof of business address", note: "Rental agreement or utility bill", status: "Needed" },
  { id: "D4", name: "Recent bank or wallet statement", note: "Last 3 months", status: "Needed" },
];
export const SUMMARY_TASKS = [
  { id: "S1", label: "Set your monthly sales target", hint: "Helps the coach tell you if you are on track", done: true },
  { id: "S2", label: "List your main products and prices", hint: "Used to check your margins", done: true },
  { id: "S3", label: "Record your regular business costs", hint: "Rent, materials, transport and utilities", done: false },
  { id: "S4", label: "Confirm your average monthly income", hint: "Lenders ask for this first", done: false },
];
export const PROFILE_FIELDS = [
  { id: "P1", label: "Business name", value: "Sokha's Traditional Crafts", done: true },
  { id: "P2", label: "What you sell", value: "Silk scarves, krama, handwoven bags", done: true },
  { id: "P3", label: "Where you work", value: "Siem Reap, fixed stall", done: true },
  { id: "P4", label: "Years in operation", value: "6 years", done: true },
  { id: "P5", label: "People working with you", value: "3 (including 2 family members)", done: true },
];

export const MODULES = [
  { id: "LM-01", t: "Recording daily sales and expenses", cat: "Bookkeeping", min: 5, status: "Completed", rating: 5,
    pages: ["Write down every sale and every cost on the day it happens — waiting until the end of the week means you will forget half of them.", "For a sale, note the amount, what was sold, and how it was paid (cash, KHQR, or on credit). For a cost, note the amount and what it was for.", "Keep it simple: a notebook, or the Records tab in Neary, is enough. What matters is that you do it every single day."],
    task: "Record every sale and cost for the next 7 days without skipping a day." },
  { id: "LM-02", t: "Understanding your cash flow", cat: "Cash flow", min: 5, status: "Completed", rating: 5,
    pages: ["Cash flow is the money moving in and out of your business — different from profit, because you can look profitable on paper and still run out of cash.", "Add up everything that came in this month, then everything that went out. What is left is your net cash flow.", "If costs are eating a growing share of your sales, that is an early warning sign. Check it before it becomes a real problem."],
    task: "Open your Cash Flow screen and check whether your net cash flow this month is positive or negative." },
  { id: "LM-03", t: "Accepting KHQR payments safely", cat: "Payments", min: 4, status: "Completed", rating: 4,
    pages: ["KHQR lets any customer pay you instantly from their banking app, with no cash to carry or count.", "Only ever show your own merchant QR code. Never share your PIN, and never let anyone else's QR code stand in for yours.", "Every KHQR payment is recorded in your books automatically, which is one less thing for you to write down by hand."],
    task: "Show your KHQR code to your next three customers instead of asking for cash." },
  { id: "LM-06", t: "Pricing your products", cat: "Growth", min: 4, status: "Completed", rating: 4,
    pages: ["Add up the cost of materials and the time it takes you to make or prepare one item — that is your true cost per piece.", "Add a margin on top, usually 30 to 50 percent, depending on what similar sellers charge nearby.", "Test a small price increase on your best-selling item first, and watch whether sales hold before changing everything else."],
    task: "Calculate the true cost per piece for your best-selling product and compare it with your current price." },
  { id: "LM-08", t: "Separating business and household money", cat: "Cash flow", min: 5, status: "Completed", rating: 5,
    pages: ["Mixing business and household money makes it impossible to know if your business is actually making a profit.", "Keep a separate pot for business money — a second KHQR account, a labelled envelope, or a dedicated notebook page.", "Pay yourself a fixed regular amount from the business, rather than dipping in whenever you need cash."],
    task: "Set up one separate place — an account, envelope or notebook page — to hold only business money." },
  { id: "LM-05", t: "Preparing for a loan: what lenders ask for", cat: "Finance", min: 6, status: "In progress", rating: null, task: "Pull together three months of your own records and your ID before you ask a lender for anything." },
  { id: "LM-04", t: "Registering your business on business.gov.kh", cat: "Formalization", min: 6, status: "Not started", rating: null, task: "Gather your ID card, proof of address and a business name idea, ready to start registration." },
  { id: "LM-07", t: "Borrowing responsibly and avoiding over-indebtedness", cat: "Finance", min: 4, status: "Not started", rating: null, task: "Add up what you would repay in total on any loan you are considering — not only the monthly amount." },
  { id: "LM-09", t: "Setting your business goals", cat: "Growth", min: 4, status: "Not started", rating: null, task: "Write down one goal for income, one for skills and one for customers, each with a date." },
  { id: "LM-10", t: "Selling online: your first steps", cat: "Growth", min: 5, status: "Not started", rating: null, task: "Post your first three product photos with prices on Facebook or Telegram this week." },
];
/* The six e-learning categories in the programme documents. Finer labels on
   each module are kept; this only decides which filter chip they sit under. */
export const LEARN_GROUPS = [
  ["Bookkeeping", ["Bookkeeping", "Accounting"]],
  ["Cash flow", ["Cash flow"]],
  ["Payments", ["Payments", "Customer payment"]],
  ["Finance & lending readiness", ["Finance"]],
  ["Growth", ["Growth", "E-commerce", "Marketing"]],
  ["Formalization & legal", ["Formalization", "Legal"]],
];
export const learnGroupOf = (cat) => (LEARN_GROUPS.find(([, cats]) => cats.includes(cat)) || [cat])[0];
export const MODULE_BODY = {
  "LM-10": ["Selling online means customers can find and buy from you when your stall is closed. You do not need a website: a Facebook page or Telegram channel is enough to start.", "Take clear photos of your best three products in daylight on a plain background. Write the price, size and colour under each one, and post a fixed price list.", "Agree how you get paid and how the goods travel. Use your KHQR code for payment so every sale is recorded automatically, and agree a delivery partner and fee before you promise a date.", "Start small: post three times a week, answer messages the same day, and ask each happy customer for a photo review. Record every online sale in the app so your records stay complete."],
  "LM-05": ["Lenders look at four things: how long you have traded, how steady your income is, what you already owe, and whether your records match your story.", "Bring three months of records, your ID, proof of where you work, and a simple list of what you own that the business uses.", "Ask for the amount you can repay, not the largest amount offered. Work out the repayment against your worst month, not your best."],
  "LM-04": ["Registering makes your business visible to buyers, banks and government programs. Most small traders register as a sole proprietorship.", "You will need your ID card, proof of your business address, and a business name that is not already taken.", "The Neary app can guide you through business.gov.kh step by step and keep your progress saved."],
  "LM-07": ["Borrow for something that earns money, such as materials or equipment, rather than for daily household spending.", "Before you sign, add up the total you will repay, not only the monthly amount.", "If repayments would take more than a third of your usual monthly profit, the loan is probably too large."],
  "LM-09": ["A good goal is specific and has a date, for example: sell 40 scarves a month by June.", "Write down one goal for income, one for skills, and one for your customers.", "Review your goals every month against your records and adjust them."],
};

export const GOALS = [
  { id: "G1", label: "Launch online store", done: true },
  { id: "G2", label: "Improve digital marketing", done: true },
  { id: "G3", label: "Join a mentorship program", done: false },
  { id: "G4", label: "Explore export opportunities", done: false },
];
export const ACHIEVEMENTS = [
  { id: "A1", t: "First KHQR payment received", at: Date.UTC(2027, 9, 19, 11, 12) },
  { id: "A2", t: "Four weeks of records in a row", at: Date.UTC(2027, 10, 9, 18, 0) },
  { id: "A3", t: "100 transactions recorded", at: Date.UTC(2027, 11, 3, 16, 30) },
  { id: "A4", t: "Five learning modules completed", at: Date.UTC(2027, 11, 28, 20, 5) },
  { id: "A5", t: "Reached finance-ready status", at: Date.UTC(2028, 0, 9, 9, 40) },
];
export const OPPS = [
  { id: "OP-1", t: "Women Entrepreneur Mentorship Cohort", type: "Mentorship", by: "MoWA and Women's Development Centres", closes: NOW_MS + 9 * DAY, places: 60, applied: 88, why: "Your readiness score is above 50 and you are in Siem Reap.", about: "Six months of monthly guidance from an experienced woman entrepreneur in your sector, plus a small peer group that meets in Siem Reap.", reward: "6 months of paired mentorship, plus a peer cohort that meets in Siem Reap", status: "open" },
  { id: "OP-2", t: "Provincial Handicraft and Food Fair", type: "Market access", by: "Siem Reap Provincial Department of Women's Affairs", closes: NOW_MS + 21 * DAY, places: 40, applied: 36, why: "You sell handicraft in Siem Reap.", about: "A three-day fair at the provincial hall. A stall, a table and a banner are provided. You keep everything you earn.", reward: "A free 3-day stall, table and banner at the provincial fair — you keep everything you sell", status: "open" },
  { id: "OP-3", t: "Digital Selling Bootcamp", type: "Training", by: "E-commerce partner", closes: NOW_MS + 14 * DAY, places: 120, applied: 97, why: "You already accept KHQR payments.", about: "Four evening sessions on photographing your products, writing listings, and handling delivery, plus a showcase slot in the partner's online marketplace for graduates.", reward: "A showcase slot in the partner's online marketplace after you graduate", status: "open" },
  { id: "OP-4", t: "Apply for a Grant Program", type: "Finance", by: "Development partner", closes: NOW_MS + 34 * DAY, places: 25, applied: 12, why: "Open to registered and unregistered women-led businesses.", about: "A grant of up to US$1,500 for equipment. No repayment. You must show three months of records, which you already have.", reward: "A grant tranche of up to US$1,500 for equipment — no repayment", status: "open" },
];
export const MENTORS = [
  { id: "MT1", name: "Sreymom Chan", sector: "Tailoring & handicraft", province: "Siem Reap", bio: "Runs a 12-year silk weaving cooperative exporting to Phnom Penh boutiques. Strong on pricing and wholesale negotiation.", contact: "Phone call", verified: true, honorarium: "Nominal — set by mentor" },
  { id: "MT2", name: "Pisey Ouk", sector: "Food & Beverage", province: "Siem Reap", bio: "Owns a family noodle shop that grew into a small catering business. Good at costing recipes and managing suppliers.", contact: "Messaging (Telegram)", verified: true, honorarium: "Nominal — set by mentor" },
  { id: "MT3", name: "Sopheak Ly", sector: "Retail & grocery", province: "Battambang", bio: "Manages two grocery stalls and mentors on stock control, KHQR adoption, and dealing with wholesalers.", contact: "Phone call", verified: true, honorarium: "Nominal — set by mentor" },
  { id: "MT4", name: "Chanthou Roeun", sector: "Tailoring & handicraft", province: "Kampong Cham", bio: "Krama and garment maker who moved from home production to a registered workshop. Can walk you through formalization.", contact: "Messaging (WhatsApp)", verified: true, honorarium: "Nominal — set by mentor" },
  { id: "MT5", name: "Vanna Sok", sector: "E-commerce", province: "Phnom Penh", bio: "Sells handicraft and beauty products online. Helps women entrepreneurs start their first Facebook shop and set delivery terms.", contact: "Messaging (Telegram)", verified: true, honorarium: "Nominal — set by mentor" },
  { id: "MT6", name: "Ratanak Kim", sector: "Food & Beverage", province: "Siem Reap", bio: "Runs a small dried-fruit processing business supplying hotels. Focused on food safety basics and steady supply contracts.", contact: "Phone call", verified: true, honorarium: "Nominal — set by mentor" },
  { id: "MT7", name: "Sokunthea Pen", sector: "Retail & grocery", province: "Kampong Cham", bio: "Second-generation shopkeeper, now mentoring on separating household and business money and simple bookkeeping.", contact: "Messaging (WhatsApp)", verified: true, honorarium: "Nominal — set by mentor" },
  { id: "MT8", name: "Bopha Thann", sector: "Tailoring & handicraft", province: "Battambang", bio: "Weaves and trains other women in a cooperative. Experienced with CGCC guarantee applications and lender paperwork.", contact: "Phone call", verified: true, honorarium: "Nominal — set by mentor" },
];
export const PROVIDERS = [
  { id: "SP1", name: "Bayon Bookkeeping", cat: "Accounting", desc: "Bookkeeping and advisory", price: "From US$15 per month", rating: 4.7, jobs: 11 },
  { id: "SP2", name: "Angkor Contracts Clinic", cat: "Legal", desc: "Business registration, contracts", price: "First consultation free", rating: 4.5, jobs: 6 },
  { id: "SP3", name: "Old Market Creative", cat: "Marketing", desc: "Branding and digital marketing", price: "From US$40 per package", rating: 4.6, jobs: 9 },
  { id: "SP4", name: "Angkor Marketplace Setup", cat: "E-commerce", desc: "Online shop setup and delivery links", price: "From US$25", rating: 4.4, jobs: 6 },
];
export const COMMUNITY = [
  { id: "C1", who: "Sophea", biz: "Handmade Products", at: NOW_MS - 2 * 3600000, text: "Looking for advice on scaling my small business. Any tips?", likes: 24, liked: false, replies: [{ who: "Dara", at: NOW_MS - 90 * 60000, text: "Start with one product that already sells well, then add stock slowly." }] },
  { id: "C2", who: "Dara", biz: "Food & Beverage", at: NOW_MS - 26 * 3600000, text: "Just attended a great market event! Sharing my experience and key takeaways.", likes: 18, liked: false, replies: [] },
  { id: "C3", who: "Channary", biz: "Retail & grocery", at: NOW_MS - 2 * DAY, text: "KHQR made my records so much easier. I no longer write everything in a notebook at night.", likes: 31, liked: true, replies: [{ who: "Sokha", at: NOW_MS - 40 * 3600000, text: "Same for me. The app records the payment before the customer leaves." }] },
];
export const LENDERS = [
  { id: "ABA", name: "ABA Bank", desc: "Loans for micro and small businesses", color: "#0A2A6B", initials: "ABA", typical: "US$500 to US$5,000", decision: "About 8 days" },
  { id: "WING", name: "Wing Bank", desc: "Working capital and business loans", color: "#1B9E4B", initials: "Wing", typical: "US$300 to US$3,000", decision: "About 7 days" },
  { id: "PRASAC", name: "PRASAC", desc: "SME financing solutions", color: "#0B7C4B", initials: "PRA", typical: "US$500 to US$8,000", decision: "About 10 days" },
  { id: "CGCC", name: "CGCC", desc: "Credit guarantee support", color: "#1B4C9E", initials: "CGCC", typical: "Guarantee, not a loan", decision: "Applied with your lender", guarantee: true },
];
export const BIZ_TYPES = [
  { id: "sole", t: "Sole Proprietorship", sub: "Individual Business", note: "Most small traders choose this. Simplest and cheapest to register." },
  { id: "partner", t: "Partnership", sub: "Two or more owners", note: "Use this if you share ownership and profits with someone." },
  { id: "plc", t: "Private Limited Company", sub: "PLC", note: "More paperwork and cost. Usually for larger businesses with investors." },
];


/* Formalization guides. Each mirrors a guide published in the console,
   with the agency that owns the procedure and when it was last checked. */
export const GUIDES = [
  { id: "G-01", t: "Choose a business type", sub: "Decide how to register before you start", owner: "MoWA program team", source: "Ministry of Commerce guidance", validatedAt: NOW_MS - 11 * DAY, icon: "type",
    steps: [
      { id: "s1", t: "Compare the three types", d: "Sole proprietorship is one owner and the simplest. A partnership has two or more owners. A private limited company separates you from the business but costs more to run.", need: "" },
      { id: "s2", t: "Check what your buyers need", d: "Hotels, shops and exporters often ask for an invoice with a registration number. If your buyers ask for this, registering is worth it.", need: "" },
      { id: "s3", t: "Decide and write it down", d: "Most women selling handicraft at their own stall choose sole proprietorship. Note your choice so the registration form is quicker.", need: "" },
    ] },
  { id: "G-02", t: "Register a sole proprietorship", sub: "Step-by-step on business.gov.kh", owner: "MoWA program team", source: "business.gov.kh", validatedAt: NOW_MS - 11 * DAY, icon: "reg", action: "register",
    steps: [
      { id: "s1", t: "Prepare your documents", d: "You need your national ID card, proof of your business address, and a photo of where you work.", need: "ID card, address proof, business photo" },
      { id: "s2", t: "Choose and check your business name", d: "The name must not already be taken. Avoid words that suggest you are a bank, a ministry or a charity.", need: "" },
      { id: "s3", t: "Complete the registration form", d: "Neary fills in what it already knows about your business and guides you through the rest.", need: "" },
      { id: "s4", t: "Submit and keep your receipt", d: "Keep the confirmation number. You will need it for a Tax ID and for a business bank account.", need: "" },
    ] },
  { id: "G-03", t: "Apply for a Tax ID", sub: "Register with the General Department of Taxation", owner: "MoWA program team", source: "General Department of Taxation", validatedAt: NOW_MS - 74 * DAY, icon: "tax", caution: "This procedure is still being confirmed with the tax department. Check with your provincial officer before paying any fee.",
    steps: [
      { id: "s1", t: "Confirm your registration is approved", d: "You usually need your business registration certificate before you can apply for a Tax ID.", need: "Registration certificate" },
      { id: "s2", t: "Gather your documents", d: "Your ID card, registration certificate, proof of address, and a recent photo.", need: "ID card, certificate, address proof" },
      { id: "s3", t: "Complete the tax registration form", d: "Declare your business activity and your expected turnover honestly. Small traders usually fall in the smallest taxpayer category.", need: "" },
      { id: "s4", t: "Submit at your provincial tax branch", d: "Some provinces accept online submission. Your provincial officer can tell you which applies in Siem Reap.", need: "" },
      { id: "s5", t: "Keep your Tax ID safe", d: "Save a photo of it in Neary. Lenders and larger buyers ask for it.", need: "" },
    ] },
  { id: "G-04", t: "Open a business bank account", sub: "Separate your business money from your household", owner: "Financial partners", source: "Partner product sheets", validatedAt: NOW_MS - 23 * DAY, icon: "bank",
    steps: [
      { id: "s1", t: "Choose a bank", d: "Compare the monthly fee, the minimum balance, and whether KHQR settles into the account for free.", need: "" },
      { id: "s2", t: "Prepare your documents", d: "Your ID card and, for a business account, your registration certificate.", need: "ID card, certificate" },
      { id: "s3", t: "Route your KHQR into the account", d: "Once the account is open, point your Neary KHQR at it so sales land in the business account, not your personal one.", need: "" },
    ] },
  { id: "G-05", t: "Keep compliant records for 3 months", sub: "The record standard lenders and the tax office expect", owner: "LinkIT content team", source: "Platform records rule", validatedAt: NOW_MS - 30 * DAY, icon: "records",
    steps: [
      { id: "s1", t: "Record every sale and cost, every day", d: "KHQR payments record themselves. Cash sales need a quick entry the same day.", need: "", auto: "weeks" },
      { id: "s2", t: "Keep business and household money apart", d: "Do not pay for household shopping out of the business till. Take a set amount as your own wage instead.", need: "", auto: "module" },
      { id: "s3", t: "Reach three full months of records", d: "Three unbroken months is the point where lenders will look at your figures seriously.", need: "", auto: "months" },
    ] },
];
export const FORMAL_STEPS = ["Not started", "Compliant records", "Registration submitted", "Tax ID applied"];
