import { Landmark, Ban, Wallet, FileCheck, Bot, Building2, Check } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C } from "../theme.js";
import { Card, IconDot } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";

const DOES = ["Keeps your sales and cost records in one place", "Shows how ready your records are for a loan, and how to improve", "Short lessons and an AI coach that gives advice", "Guides you through registering your business and asks lenders for an introduction only when you say so"];
const NOT = [
  [Landmark, "Neary is not a bank or a lender", "Lenders decide on credit. A referral is an introduction, never a loan offer."],
  [Wallet, "Neary does not hold your money", "KHQR payments go through the acquiring bank partner straight to your account. Neary only records them."],
  [FileCheck, "Neary does not replace government services", "business.gov.kh and the General Department of Taxation stay the official places to register and pay tax. Neary only guides you there. Your registration status here is what you tell us, until official access exists."],
  [Bot, "The AI coach gives advice only", "It never makes credit, legal or tax decisions, and it can be wrong. Ask an officer for anything important."],
];
export function AboutScreen({ back }) {
  return (
    <div className="pb-4">
      <AppBar title="About Neary" onBack={back} />
      <div className="p-4 space-y-5">
        <Card className="p-4" style={{ background: "linear-gradient(135deg, #FEF0F7 0%, #EEFAF9 100%)" }}>
          <div className="flex items-center gap-3"><IconDot icon={Building2} size={46} bg="#fff" /><div><div className="text-sm font-extrabold" style={{ color: C.navy }}>{t("Neary Smart Business")}</div><div className="text-xs" style={{ color: C.mute }}>{t("Run by the Ministry of Women's Affairs. Operated by LinkIT.")}</div></div></div>
        </Card>
        <div>
          <SectionHead>What Neary does</SectionHead>
          <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
            {DOES.map((x) => <div key={x} className="flex items-start gap-2.5 py-3 text-sm" style={{ color: C.ink }}><span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: C.greenSoft, color: C.green }}><Check size={12} /></span>{t(x)}</div>)}
          </Card>
        </div>
        <div>
          <SectionHead>What Neary does not do</SectionHead>
          <div className="space-y-2.5">
            {NOT.map(([I, h, b]) => (
              <Card key={h} className="p-4"><div className="flex gap-3"><IconDot icon={I} size={40} bg={C.redSoft} color={C.red} /><div className="flex-1 min-w-0"><div className="text-sm font-extrabold" style={{ color: C.navy }}>{t(h)}</div><div className="text-xs mt-1" style={{ color: C.mute }}>{t(b)}</div></div></div></Card>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-center" style={{ color: C.soft }}><Ban size={11} className="inline mr-1" />{t("Neary never asks for a fee to arrange a loan.")}</p>
      </div>
    </div>
  );
}
