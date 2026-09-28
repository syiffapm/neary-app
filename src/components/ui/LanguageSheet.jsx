import { Check } from "lucide-react";
import { LANGS, SCRIPT_FONT } from "../../i18n/dict.js";
import { C, BODY } from "../../theme.js";
import { Sheet } from "./Sheet.jsx";

/* Language picker, reachable from an action button on every main screen. */
export function LanguageSheet({ current, onPick, onClose }) {
  return (
    <Sheet title="Choose your language" sub="Choose the language you are most comfortable with" onClose={onClose}>
      <div className="space-y-2">
        {LANGS.map((l) => {
          const on = l.code === current;
          return (
            <button key={l.code} onClick={() => { onPick(l.code); onClose(); }} aria-pressed={on} aria-label={l.native}
              className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left active:opacity-70"
              style={on ? { border: `1.5px solid ${C.pink}`, background: C.blush2 } : { border: `1.5px solid ${C.line}`, background: "#fff" }}>
              <span className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                style={on ? { background: C.pink, color: "#fff" } : { background: C.blush, color: C.pinkDeep }}>{l.code.toUpperCase()}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold" style={{ color: C.navy, fontFamily: SCRIPT_FONT[l.code] || BODY }}>{l.native}</span>
                <span className="block text-xs" style={{ color: C.soft }}>{l.en}</span>
              </span>
              {on && <Check size={17} style={{ color: C.pink }} />}
            </button>
          );
        })}
      </div>
      <p className="text-[11px]" style={{ color: C.soft }}>Khmer is the operating language in Cambodia. Burmese, Lao and Bahasa Indonesia are included for regional expansion and are still draft translations.</p>
    </Sheet>
  );
}
