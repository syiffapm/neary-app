import { useEffect, useRef, useState } from "react";
import { HelpCircle, ChevronRight } from "lucide-react";
import { t, tp } from "../../i18n/dict.js";
import { C, HEAD, GRAD } from "../../theme.js";
import { useTour } from "./useTour.js";

/* "?" button that replays one menu's tour. */
export function TourHelp({ menu }) {
  const tour = useTour();
  return (
    <button onClick={() => tour.start(menu)} aria-label={t("Replay this screen's tour")} title={t("Replay this screen's tour")} data-role="tour-help"
      className="p-2.5 rounded-full bg-white active:opacity-60" style={{ border: `1px solid ${C.line}`, minWidth: 44, minHeight: 44 }}>
      <HelpCircle size={17} style={{ color: C.navy }} aria-hidden="true" />
    </button>
  );
}

const PAD = 6, EDGE = 4, GAP = 14, MARGIN = 12;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Spotlight + coachmark card.  Rendered INSIDE the (possibly scaled) phone
   wrapper as an absolute inset-0 overlay, so it is scoped to the phone column.
   Target rectangles come from getBoundingClientRect (visual pixels); we convert
   them to the overlay's own coordinate space by subtracting the overlay origin
   and dividing by scale = overlayRect.width / overlay.offsetWidth, which is
   exactly the text-size zoom (1, 1.15, 1.3). */
export function Tour({ run, onNext, onBack, onClose, onSkipAll, reduce }) {
  const step = run.steps[run.i];
  const total = run.steps.length;
  const last = run.i === total - 1;
  const ovRef = useRef(null), cardRef = useRef(null);
  const [geo, setGeo] = useState(null);
  const cb = useRef({}); cb.current = { onNext, onBack, onClose };

  // Measure the target every frame (cheap) so resize, scroll, route change,
  // text-size change and late-rendering charts all keep the spotlight aligned.
  useEffect(() => {
    let raf = 0, scrolled = false, lastKey = "";
    const t0 = performance.now();
    if (step.before) step.before();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const ov = ovRef.current;
      if (!ov) return;
      const ids = [].concat(step.target);
      const els = ids.map((id) => document.querySelector(`[data-tour="${id}"]`)).filter(Boolean);
      if (!els.length) { if (performance.now() - t0 > 1500) { cancelAnimationFrame(raf); cb.current.onNext(); } return; }
      const or = ov.getBoundingClientRect();
      const sc = or.width / ov.offsetWidth || 1;
      const rs = els.map((e) => e.getBoundingClientRect());
      const u = { left: Math.min(...rs.map((r) => r.left)), top: Math.min(...rs.map((r) => r.top)), right: Math.max(...rs.map((r) => r.right)), bottom: Math.max(...rs.map((r) => r.bottom)) };
      const main = document.getElementById("app-main");
      if (!scrolled && main && main.contains(els[0]) && !step.noScroll) {
        scrolled = true;
        const mr = main.getBoundingClientRect();
        const top = (step.offset || 64) * sc;
        const off = u.top < mr.top + top - 8 * sc || u.bottom > mr.bottom - 8 * sc || Math.max(or.bottom - u.bottom, u.top - or.top) - 24 * sc < 200 * sc;
        if (off) { main.scrollTop += (u.top - (mr.top + top)) / sc; return; }
      }
      const x = (u.left - or.left) / sc, y = (u.top - or.top) / sc, w = (u.right - u.left) / sc, h = (u.bottom - u.top) / sc;
      let radius = 14;
      if (els.length === 1) { const br = parseFloat(getComputedStyle(els[0]).borderTopLeftRadius); if (!Number.isNaN(br)) radius = br + PAD; }
      else radius = 18;
      const ch = cardRef.current ? cardRef.current.offsetHeight : 0;
      const g = { x, y, w, h, radius, W: ov.offsetWidth, H: ov.offsetHeight, ch };
      const key = [x, y, w, h, radius, g.W, g.H, ch].map((n) => Math.round(n * 2)).join("|");
      if (key !== lastKey) { lastKey = key; setGeo(g); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  // Focus moves to the card on every step and goes back afterwards.
  useEffect(() => {
    const prev = document.activeElement;
    return () => { if (prev && prev !== document.body && document.contains(prev)) prev.focus?.({ preventScroll: true }); };
  }, []);
  const hasCard = !!geo;
  useEffect(() => { cardRef.current && cardRef.current.focus({ preventScroll: true }); }, [step, hasCard]);

  useEffect(() => {
    const onKey = (e) => {
      const card = cardRef.current;
      const inButton = card && e.target && e.target.closest && card.contains(e.target) && e.target.closest("button");
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); cb.current.onClose(); }
      else if (e.key === "ArrowRight" || (e.key === "Enter" && !inButton)) { e.preventDefault(); e.stopPropagation(); cb.current.onNext(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); cb.current.onBack(); }
      else if (e.key === "Tab" && card) {
        const f = [...card.querySelectorAll("button")];
        e.preventDefault();
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        f[e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i >= f.length - 1 ? 0 : i + 1)].focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, []);

  const tr = reduce ? "none" : "left .28s ease, top .28s ease, width .28s ease, height .28s ease, border-radius .28s ease";
  const hc = C.ink === "#000000";
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
  let spot = null, card = null;
  if (geo) {
    const { W, H } = geo;
    const left = Math.max(geo.x - PAD, EDGE), top = Math.max(geo.y - PAD, EDGE);
    const right = Math.min(geo.x + geo.w + PAD, W - EDGE), bottom = Math.min(geo.y + geo.h + PAD, H - EDGE);
    const sw = Math.max(right - left, 8), sh = Math.max(bottom - top, 8);
    spot = { left, top, width: sw, height: sh, borderRadius: Math.min(geo.radius, sw / 2, sh / 2) };
    const cw = Math.min(320, W - 2 * MARGIN), ch = geo.ch || 190;
    const cx = left + sw / 2;
    const cl = clamp(cx - cw / 2, MARGIN, W - MARGIN - cw);
    const below = H - bottom - MARGIN, above = top - MARGIN;
    const place = below >= ch + GAP ? "below" : above >= ch + GAP ? "above" : below >= above ? "below" : "above";
    const fits = (place === "below" ? below : above) >= ch + GAP;
    let ct = place === "below" ? bottom + GAP : top - GAP - ch;
    ct = clamp(ct, MARGIN, Math.max(MARGIN, H - MARGIN - ch));
    card = { left: cl, top: ct, width: cw, place, fits, nub: clamp(cx - cl, 24, cw - 24) };
  }
  const counter = `${run.i + 1}/${total}`;
  return (
    <div ref={ovRef} className="absolute inset-0 z-[80] overflow-hidden" style={{ animation: "tourFade .2s ease-out" }} onMouseDown={stop} onClick={stop} onTouchStart={(e) => e.stopPropagation()} onWheel={stop} data-tour-overlay="1">
      {!geo && <div className="absolute inset-0" style={{ background: hc ? "rgba(0,0,0,0.78)" : "rgba(0,15,69,0.62)" }} />}
      {spot && <div data-tour-spot="1" aria-hidden="true" className="absolute pointer-events-none" style={{ ...spot, transition: tr, boxShadow: `0 0 0 2px #fff, 0 0 0 9999px ${hc ? "rgba(0,0,0,0.78)" : "rgba(0,15,69,0.62)"}` }} />}
      {card && (
        <div ref={cardRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-body" aria-label={undefined} data-tour-card="1"
          className="absolute bg-white rounded-2xl outline-none" style={{ left: card.left, top: card.top, width: card.width, transition: reduce ? "none" : "left .28s ease, top .28s ease", boxShadow: "0 14px 36px rgba(0,30,108,0.28)", border: hc ? `2px solid ${C.navy}` : `1px solid ${C.line}`, color: C.ink }}>
          {card.fits && <span aria-hidden="true" className="absolute block" style={{ width: 14, height: 14, background: "#fff", transform: "rotate(45deg)", left: card.nub - 7, [card.place === "below" ? "top" : "bottom"]: -7, borderTop: card.place === "below" ? (hc ? `2px solid ${C.navy}` : `1px solid ${C.line}`) : "none", borderLeft: card.place === "below" ? (hc ? `2px solid ${C.navy}` : `1px solid ${C.line}`) : "none", borderBottom: card.place === "above" ? (hc ? `2px solid ${C.navy}` : `1px solid ${C.line}`) : "none", borderRight: card.place === "above" ? (hc ? `2px solid ${C.navy}` : `1px solid ${C.line}`) : "none" }} />}
          <div className="relative p-4 pb-3 rounded-2xl bg-white" aria-live="polite">
            <div className="flex items-start justify-between gap-3">
              <div className="w-7 h-1 rounded-full mb-2" style={{ background: GRAD }} aria-hidden="true" />
              <span className="text-xs font-bold shrink-0" style={{ color: C.soft }} aria-label={tp("Step {n} of {m}", { n: run.i + 1, m: total })}>{counter}</span>
            </div>
            <h2 id="tour-title" className="text-[13px] font-extrabold uppercase" style={{ color: C.pink, fontFamily: HEAD, letterSpacing: "0.05em", marginTop: -6 }}>{t(step.title)}</h2>
            <p id="tour-body" className="text-[13px] leading-snug mt-1.5" style={{ color: C.ink }}>{t(step.body)}</p>
            {run.auto && run.i === 0 && <button onClick={onSkipAll} className="mt-2 text-xs font-bold underline" style={{ color: C.mute, minHeight: 32 }}>{t("Skip all tours")}</button>}
            <div className="flex items-center justify-between mt-3 gap-2">
              <button onClick={onClose} className="text-[13px] font-bold px-1 active:opacity-60" style={{ color: C.soft, minHeight: 40 }}>{t("Close")}</button>
              <div className="flex items-center gap-2">
                {run.i > 0 && <button onClick={onBack} className="text-[13px] font-bold px-2 active:opacity-60" style={{ color: C.navy, minHeight: 40 }}>{t("Back")}</button>}
                <button onClick={onNext} className="inline-flex items-center gap-0.5 rounded-full text-[13px] font-bold text-white pl-4 pr-3 active:scale-[0.98]" style={{ background: C.pink, minHeight: 40 }}>{last ? t("Done") : <>{t("Next")}<ChevronRight size={15} aria-hidden="true" /></>}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
