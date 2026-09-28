import { useState } from "react";
import { Check, ShieldCheck, Bot, Sparkles, Phone, KeyRound, Store, Rocket, PartyPopper, ChevronLeft, Globe } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C, HEAD, inputCls } from "../theme.js";
import { Card, Btn, Field, IconDot } from "../components/ui/Primitives.jsx";

const SECTORS = ["Tailoring & handicraft", "Food & beverage", "Retail & grocery", "Farming & produce", "Beauty & personal services", "Other services"];
const PROVINCES = ["Phnom Penh", "Siem Reap", "Battambang", "Kampong Cham", "Kampot", "Kandal", "Preah Sihanouk", "Takeo", "Banteay Meanchey", "Prey Veng", "Other province"];
const STEPS = ["welcome", "phone", "otp", "consent", "business", "done"];

/* Full-screen first-run flow: account, one required consent, business
   basics. Language switches from the header icon, not a dedicated step.
   The two optional consents (sharing with lenders, AI coach) are asked
   in context later — right before a referral, and on first opening chat —
   rather than up front, so this stays short. Demo only: any 6-digit code
   is accepted. */
export function OnboardingScreen({ db, act }) {
  const [i, setI] = useState(0);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [bizStage, setBizStage] = useState("");
  const [biz, setBiz] = useState({ biz: "", sector: "", province: "" });
  const step = STEPS[i];
  const next = () => setI((x) => Math.min(STEPS.length - 1, x + 1));
  const prev = () => setI((x) => Math.max(0, x - 1));
  const phoneOk = phone.replace(/\D/g, "").length >= 8;
  const bizOk = bizStage && biz.sector && biz.province && (bizStage === "starting" || biz.biz.trim());

  let main = null, footer = null;
  if (step === "welcome") {
    main = (
      <div className="text-center pt-6">
        <div className="flex justify-center"><IconDot icon={Store} size={84} /></div>
        <h1 className="text-2xl font-extrabold mt-5" style={{ color: C.navy, fontFamily: HEAD }}>{t("Welcome to Neary")}</h1>
        <p className="text-sm mt-2 px-2" style={{ color: C.mute }}>{t("Keep your business records, learn, get ready for finance and grow. Made for women entrepreneurs by the Ministry of Women's Affairs, operated by LinkIT.")}</p>
        <div className="mt-5 text-left space-y-2">
          {["Record sales and costs in seconds", "See how ready you are for a loan", "You choose what is shared, and with whom"].map((x) => (
            <div key={x} className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: C.navy }}><span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: C.greenSoft, color: C.green }}><Check size={12} /></span>{t(x)}</div>
          ))}
        </div>
      </div>
    );
    footer = <Btn full onClick={next}>{t("Get started")}</Btn>;
  } else if (step === "phone") {
    main = (
      <>
        <Head icon={Phone} title="Your phone number" sub="We send a 6-digit code to confirm it is you" />
        <Field label="Phone number" hint={t("Demo: no real message is sent")}>
          <div className="flex gap-2"><span className={`${inputCls} !w-auto font-bold`} style={{ borderColor: C.line, color: C.navy }}>+855</span>
            <input className={inputCls} style={{ borderColor: C.line }} inputMode="tel" autoComplete="tel-national" placeholder="12 345 678" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))} /></div>
        </Field>
      </>
    );
    footer = <Btn full disabled={!phoneOk} onClick={next}>{t("Send code")}</Btn>;
  } else if (step === "otp") {
    main = (
      <>
        <Head icon={KeyRound} title="Enter the 6-digit code" sub={`+855 ${phone.trim()}`} />
        <Field label="6-digit code">
          <input className={`${inputCls} text-center font-extrabold`} style={{ borderColor: C.line, letterSpacing: "0.5em", fontSize: 22 }} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="------" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
        </Field>
        <Card className="p-3" style={{ background: C.amberSoft, borderColor: C.amberSoft }}><div className="text-xs font-bold" style={{ color: C.amber }}>{t("Demo: enter any code")}</div></Card>
      </>
    );
    footer = <Btn full disabled={code.length !== 6} onClick={next}>Verify</Btn>;
  } else if (step === "consent") {
    main = (
      <>
        <Head icon={ShieldCheck} title="One quick thing" sub="This is the only permission we need up front." />
        <button role="checkbox" aria-checked={agreed} onClick={() => setAgreed((v) => !v)} className="w-full text-left rounded-2xl p-3.5 border active:opacity-70" style={{ borderColor: agreed ? C.pink : C.line, background: agreed ? C.blush2 : "#fff" }}>
          <span className="flex gap-3">
            <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={agreed ? { background: C.pink, color: "#fff" } : { border: `2px solid ${C.soft}` }}>{agreed && <Check size={14} />}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold" style={{ color: C.navy }}>{t("Use my records to compute my readiness score")}</span>
              <span className="block text-xs mt-1" style={{ color: C.mute }}>{t("Neary reads your sales, costs, profile and documents to work out your finance-readiness score. Without this the score cannot be calculated.")}</span>
            </span>
          </span>
        </button>
        <p className="text-xs px-1" style={{ color: C.soft }}>{t("We'll ask separately, only when it matters — before anything is ever shared with a lender, and when you first open the AI coach.")}</p>
      </>
    );
    footer = <Btn full disabled={!agreed} onClick={next}>Continue</Btn>;
  } else if (step === "business") {
    main = (
      <>
        <Head icon={Store} title="About your business" sub={bizStage ? "Just the basics. You can add more later." : "One thing first"} />
        {!bizStage ? (
          <div className="space-y-2.5">
            <button onClick={() => setBizStage("existing")} className="w-full text-left rounded-2xl p-3.5 border active:opacity-70 flex items-center gap-3" style={{ borderColor: C.line, background: "#fff" }}>
              <IconDot icon={Store} size={40} />
              <span className="flex-1"><span className="block text-sm font-bold" style={{ color: C.navy }}>{t("I already run a business")}</span><span className="block text-xs mt-0.5" style={{ color: C.mute }}>{t("I'm already selling, even informally")}</span></span>
            </button>
            <button onClick={() => setBizStage("starting")} className="w-full text-left rounded-2xl p-3.5 border active:opacity-70 flex items-center gap-3" style={{ borderColor: C.line, background: "#fff" }}>
              <IconDot icon={Rocket} size={40} />
              <span className="flex-1"><span className="block text-sm font-bold" style={{ color: C.navy }}>{t("I'm just getting started")}</span><span className="block text-xs mt-0.5" style={{ color: C.mute }}>{t("I don't have a business yet")}</span></span>
            </button>
          </div>
        ) : (
          <>
            <Field label={bizStage === "starting" ? "What kind of business are you planning?" : "Sector"}>
              <select className={inputCls} style={{ borderColor: C.line }} value={biz.sector} onChange={(e) => setBiz({ ...biz, sector: e.target.value })}><option value="">{t("Choose one")}</option>{SECTORS.map((s) => <option key={s} value={s}>{t(s)}</option>)}</select>
            </Field>
            <Field label="Province"><select className={inputCls} style={{ borderColor: C.line }} value={biz.province} onChange={(e) => setBiz({ ...biz, province: e.target.value })}><option value="">{t("Choose one")}</option>{PROVINCES.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
            <Field label={bizStage === "starting" ? "What will you call it? (optional)" : "Business name"}>
              <input className={inputCls} style={{ borderColor: C.line }} value={biz.biz} onChange={(e) => setBiz({ ...biz, biz: e.target.value })} placeholder={t("For example, Sokha's Crafts")} />
            </Field>
            <button onClick={() => setBizStage("")} className="text-xs font-bold underline" style={{ color: C.soft }}>{t("Back")}</button>
          </>
        )}
      </>
    );
    footer = bizStage ? <Btn full disabled={!bizOk} onClick={next}>Continue</Btn> : null;
  } else {
    main = (
      <div className="text-center pt-8">
        <div className="flex justify-center"><IconDot icon={PartyPopper} size={84} bg={C.greenSoft} color={C.green} /></div>
        <h1 className="text-2xl font-extrabold mt-5" style={{ color: C.navy, fontFamily: HEAD }}>{t("You're all set")}</h1>
        <p className="text-sm mt-2 px-4" style={{ color: C.mute }}>{t("Your account is ready. Your first step is to add a few records so Neary can show your readiness.")}</p>
      </div>
    );
    footer = (
      <Btn full onClick={() => act.completeOnboarding({ phone: `+855 ${phone.trim()}`, consents: { scoring: agreed, lenders: false, aiCoach: true }, businessStage: bizStage, ...biz })}>
        {t("Start using Neary")}
      </Btn>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "linear-gradient(160deg, #FEF0F7 0%, #FFFFFF 60%, #EEFAF9 100%)" }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0" style={{ minHeight: 48 }}>
        {i > 0 && step !== "done" ? <button onClick={prev} className="p-1.5 -ml-1.5 rounded-full" aria-label={t("Back")} style={{ minWidth: 44, minHeight: 44 }}><ChevronLeft size={22} style={{ color: C.navy }} aria-hidden="true" /></button> : <span />}
        <div className="flex items-center gap-3">
          <button onClick={act.openLang} aria-label={t("Language")} className="p-2 rounded-full" style={{ minWidth: 40, minHeight: 40, color: C.navy }}><Globe size={18} /></button>
          {step !== "done" && <button onClick={act.skipOnboarding} className="text-xs font-bold underline px-2" style={{ color: C.soft, minHeight: 44 }}>{t("Skip for demo")}</button>}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 pb-2 shrink-0" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={i + 1} aria-label={t("Progress")}>
        {STEPS.map((s, k) => <span key={s} className="rounded-full" style={{ width: k === i ? 22 : 7, height: 7, background: k <= i ? C.pink : C.line }} />)}
      </div>
      <div className="flex-1 overflow-y-auto px-5 pt-3 space-y-4">{main}</div>
      <div className="px-5 py-4 shrink-0">{footer}</div>
    </div>
  );
}
function Head({ icon, title, sub }) {
  return (
    <div className="text-center mb-1">
      <div className="flex justify-center"><IconDot icon={icon} size={56} /></div>
      <h1 className="text-xl font-extrabold mt-3" style={{ color: C.navy, fontFamily: HEAD }}>{t(title)}</h1>
      {sub && <p className="text-sm mt-1" style={{ color: C.mute }}>{t(sub)}</p>}
    </div>
  );
}
