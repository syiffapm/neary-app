import { useState } from "react";
import { Phone, KeyRound, ChevronLeft } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C, HEAD, inputCls } from "../theme.js";
import { Card, Btn, Field } from "../components/ui/Primitives.jsx";

const STEPS = ["phone", "otp"];

/* A lighter path back in for someone who has already registered — just a
   phone number and a demo code, none of the onboarding content again. */
export function LoginScreen({ db, act, onBack, onRegister }) {
  const [i, setI] = useState(0);
  const [phone, setPhone] = useState((db.account && db.account.phone || "").replace("+855", "").trim());
  const [code, setCode] = useState("");
  const step = STEPS[i];
  const phoneOk = phone.replace(/\D/g, "").length >= 8;
  const name = (db.me && db.me.name) || "";

  return (
    <div className="flex flex-col h-full" style={{ background: "linear-gradient(160deg, #FEF0F7 0%, #FFFFFF 60%, #EEFAF9 100%)" }}>
      <div className="flex items-center px-4 pt-3 pb-1 shrink-0" style={{ minHeight: 48 }}>
        {(i > 0 || onBack) ? (
          <button onClick={() => (i > 0 ? setI(0) : onBack())} className="p-1.5 -ml-1.5 rounded-full" aria-label={t("Back")} style={{ minWidth: 44, minHeight: 44 }}>
            <ChevronLeft size={22} style={{ color: C.navy }} aria-hidden="true" />
          </button>
        ) : <span />}
      </div>
      <div className="flex-1 overflow-y-auto px-5 pt-4 space-y-4">
        {step === "phone" ? (
          <>
            <Head icon={Phone} title="Log in" sub={name ? `Welcome back, ${name}` : "Enter the phone number on your account"} />
            <Field label="Phone number" hint={t("Demo: any phone number works")}>
              <div className="flex gap-2">
                <span className={`${inputCls} !w-auto font-bold`} style={{ borderColor: C.line, color: C.navy }}>+855</span>
                <input className={inputCls} style={{ borderColor: C.line }} inputMode="tel" autoComplete="tel-national" placeholder="12 345 678" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))} />
              </div>
            </Field>
          </>
        ) : (
          <>
            <Head icon={KeyRound} title="Enter the 6-digit code" sub={`+855 ${phone.trim()}`} />
            <Field label="6-digit code">
              <input className={`${inputCls} text-center font-extrabold`} style={{ borderColor: C.line, letterSpacing: "0.5em", fontSize: 22 }} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="------" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
            </Field>
            <Card className="p-3" style={{ background: C.amberSoft, borderColor: C.amberSoft }}>
              <div className="text-xs font-bold" style={{ color: C.amber }}>{t("Demo: enter any code")}</div>
            </Card>
          </>
        )}
      </div>
      <div className="px-5 py-4 shrink-0 space-y-2.5">
        {step === "phone" ? (
          <Btn full disabled={!phoneOk} onClick={() => setI(1)}>{t("Send code")}</Btn>
        ) : (
          <Btn full disabled={code.length !== 6} onClick={() => act.login(`+855 ${phone.trim()}`)}>{t("Log in")}</Btn>
        )}
        {onRegister && (
          <button onClick={onRegister} className="w-full text-center text-xs font-bold underline" style={{ color: C.soft, minHeight: 44 }}>
            {t("New here? Create an account")}
          </button>
        )}
      </div>
    </div>
  );
}
function Head({ icon: Icon, title, sub }) {
  return (
    <div className="text-center mb-1">
      <div className="flex justify-center"><span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: C.blush, color: C.pink }}><Icon size={24} /></span></div>
      <h1 className="text-xl font-extrabold mt-3" style={{ color: C.navy, fontFamily: HEAD }}>{t(title)}</h1>
      {sub && <p className="text-sm mt-1" style={{ color: C.mute }}>{sub}</p>}
    </div>
  );
}
