/* Coachmark tour definitions. One short tour per menu; "Take the full tour"
   chains them in TOUR_ORDER. Targets are found with data-tour="<id>".
   Every title/body is an English i18n key (see DICT in i18n/dict.js).
   `offset` = px below the top of the scroll area where a scrolled target lands (sticky headers);
   `before` runs each time a step is entered (used to switch Grow segments);
   `noScroll` is for sticky targets that must not be scrolled into view. */
const seg = (k) => () => document.querySelector(`[data-tour="grow-seg-${k}"]`)?.click();

export const TOURS = {
  home: [
    { id: "tabs", target: "tabbar", title: "Your five tabs", body: "Home shows your progress. Records keeps your sales and costs. Learn has short lessons. Grow has opportunities and goals. Profile holds your documents and settings.", noScroll: true },
    { id: "ask", target: "ask", title: "Ask Neary", body: "Tap the pink robot any time to ask the AI coach about your money, your records or what to do next. Type in plain words.", noScroll: true },
    { id: "ring", target: "home-ring", title: "Finance readiness", body: "This ring is your readiness score out of 100. It grows when you complete your profile, keep weekly records, finish tasks and add documents." },
    { id: "actions", target: "home-actions", title: "Get paid or add a record", body: "Get paid shows your KHQR code so a customer can pay and the sale is recorded for you. Add record saves a sale or a cost in a few taps." },
    { id: "journey", target: "home-journey", title: "Your journey", body: "Eight steps from registering to connecting with a bank. Formalizing your business comes before finance. Tap a step to open it." },
  ],
  records: [
    { id: "summary", target: "rec-summary", title: "Cash flow", body: "See what came in, what went out and what is left this month. Keep recording every day so these numbers stay true." },
    { id: "chart", target: "rec-chart", title: "Sales trend", body: "The pink line is your sales and the green line is your net profit for recent months. Touch a point to see the exact amount." },
    { id: "add", target: "rec-add", title: "Add a record", body: "Tap + to save a sale or a cost, or scan a receipt. With no signal, records are kept on your phone and sent later.", noScroll: true },
    { id: "txns", target: "rec-txns", title: "Recent transactions", body: "Your latest records are listed here. Tap See all to go through every sale and cost." },
  ],
  learn: [
    { id: "today", target: "learn-today", title: "Today's learning", body: "A short tip chosen from your own records. Tap the button to start or to continue where you stopped." },
    { id: "progress", target: "learn-progress", title: "Your progress", body: "This bar counts the lessons you have completed. Finishing three lessons completes the Learn step of your journey." },
    { id: "guides", target: "learn-guides", title: "Formalization guides", body: "Step-by-step help to register your business, get a tax ID and open a business account." },
    { id: "list", target: "learn-list", title: "More for you", body: "Every lesson with its length, in order. Filter by topic with the chips above. Tap one to open it." },
  ],
  grow: [
    { id: "seg", target: "grow-seg", title: "Three views", body: "Opportunities are programs and markets you can apply to. My Journey tracks your goals and progress. Support lists verified helpers.", before: seg("opps"), noScroll: true },
    { id: "opp", target: "grow-opp", title: "Opportunities", body: "Each card shows what it is, who runs it, when it closes and how many places are left. Tap a card to read more and apply.", before: seg("opps"), offset: 116 },
    { id: "goals", target: "grow-goals", title: "My goals", body: "Write your own goals and tick them off as you go. Tap Add goal to make a new one.", before: seg("journey"), offset: 116 },
    { id: "support", target: "grow-support", title: "Verified support", body: "Accountants, legal and marketing helpers checked by the Ministry and LinkIT. Request a callback and they will phone you.", before: seg("support"), offset: 116 },
  ],
  profile: [
    { id: "tiles", target: "prof-tiles", title: "Your numbers", body: "Your readiness score, the number of records you made and your net profit since you joined." },
    { id: "docs", target: "prof-docs", title: "My documents", body: "Add the papers lenders ask for. Each verified document adds 5 points to your readiness score." },
    { id: "privacy", target: "prof-privacy", title: "Privacy and consent", body: "You decide who sees your records. Data goes to a lender only if you agree, and you can withdraw at any time." },
    { id: "lang", target: "prof-lang", title: "Language", body: "Switch the whole app between English, Khmer, Burmese, Lao and Bahasa Indonesia." },
  ],
};
export const TOUR_ORDER = ["home", "records", "learn", "grow", "profile"];
export const tourSteps = (menu) => TOURS[menu].map((s) => ({ ...s, menu }));
export const fullTourSteps = () => TOUR_ORDER.flatMap(tourSteps);
