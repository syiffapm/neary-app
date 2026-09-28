import { Sparkles, Check } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { Btn, IconDot } from "../components/ui/Primitives.jsx";

/* The very first thing anyone sees when they open the app without an
   active session — a real choice between creating an account and logging
   into one that already exists, instead of dropping straight into demo
   data. "Skip for demo" stays available so reviewers are never blocked. */
export function WelcomeGateScreen({ act, onRegister, onLogin }) {
  return (
    <div className="flex flex-col h-full" style={{ background: "linear-gradient(160deg, #FEF0F7 0%, #FFFFFF 60%, #EEFAF9 100%)" }}>
      <div className="flex-1 overflow-y-auto px-6 pt-12 pb-4 flex flex-col items-center text-center">
        <IconDot icon={Sparkles} size={84} />
        <h1 className="text-2xl font-extrabold mt-5" style={{ color: C.navy, fontFamily: HEAD }}>{t("Neary Smart Business")}</h1>
        <p className="text-sm mt-2 px-2" style={{ color: C.mute }}>{t("Keep your business records, learn, get ready for finance and grow. Made for women entrepreneurs by the Ministry of Women's Affairs, operated by LinkIT.")}</p>
        <div className="mt-6 text-left w-full max-w-xs space-y-2">
          {["Record sales and costs in seconds", "See how ready you are for a loan", "You choose what is shared, and with whom"].map((x) => (
            <div key={x} className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: C.navy }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: C.greenSoft, color: C.green }}><Check size={12} /></span>
              {t(x)}
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5 pt-3 shrink-0 space-y-2.5">
        <Btn full onClick={onRegister}>{t("Create account")}</Btn>
        <Btn full variant="quiet" onClick={onLogin}>{t("I already have an account")}</Btn>
        <button onClick={act.skipOnboarding} className="w-full text-center text-xs font-bold underline pt-1" style={{ color: C.soft, minHeight: 44 }}>
          {t("Skip for demo")}
        </button>
      </div>
    </div>
  );
}
