import { Type, Contrast, Wind } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C } from "../theme.js";
import { Card, Segmented, Switch, Row } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";

export function AccessibilityScreen({ db, back, act }) {
  const s = db.settings;
  return (
    <div className="pb-4">
      <AppBar title="Accessibility" onBack={back} />
      <div className="p-4 space-y-4">
        <Card className="p-4">
          <Row icon={Type} title="Text size" sub="Makes everything in the app bigger" right={null} />
          <Segmented options={[["normal", "Normal"], ["large", "Large"], ["xl", "Extra large"]]} value={s.textSize || "normal"} onChange={(v) => act.setSetting("textSize", v)} />
          <p className="text-sm mt-3 rounded-2xl p-3" style={{ background: C.blush2, color: C.ink }}>{t("This is how text looks with your choice. Neary keeps your business records safe and simple.")}</p>
        </Card>
        <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
          <Row icon={Contrast} title="High contrast" sub="Darker text and stronger lines" right={<Switch on={s.highContrast} onChange={(v) => act.setSetting("highContrast", v)} label="High contrast" />} />
          <Row icon={Wind} title="Reduce motion" sub="Turns off sliding and fading. Also follows your phone setting." right={<Switch on={s.reduceMotion} onChange={(v) => act.setSetting("reduceMotion", v)} label="Reduce motion" />} />
        </Card>
        <p className="text-xs" style={{ color: C.soft }}>{t("Your choices are saved on this phone and stay when you come back.")}</p>
      </div>
    </div>
  );
}
