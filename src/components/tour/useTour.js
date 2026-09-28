import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { TOUR_ORDER, tourSteps, fullTourSteps } from "../../tour/steps.js";

export const TourContext = createContext({ start: () => {}, startFull: () => {}, running: false });
export const useTour = () => useContext(TourContext);

/* State machine for the tours. run = { steps, i, mode: "menu" | "full", menu, auto }.
   tab = tab the current screen belongs to; screen = current route name. */
export function useTourController({ db, setDb, screen, tab, goTab, blocked }) {
  const [run, setRun] = useState(null);
  const seen = (db && db.settings && db.settings.toursSeen) || {};
  const tabRef = useRef(tab); tabRef.current = tab;
  const enabled = !!db && !!db.seenOnboarding;

  const markSeen = useCallback((ids) => setDb((p) => (p ? { ...p, settings: { ...p.settings, toursSeen: { ...((p.settings && p.settings.toursSeen) || {}), ...Object.fromEntries(ids.map((k) => [k, true])) } } } : p)), [setDb]);
  const start = useCallback((menu, opts) => setRun({ steps: tourSteps(menu), i: 0, mode: "menu", menu, auto: !!(opts && opts.auto) }), []);
  const startFull = useCallback(() => setRun({ steps: fullTourSteps(), i: 0, mode: "full", menu: "home", auto: false }), []);
  const finish = useCallback(() => { if (run) markSeen(run.mode === "full" ? TOUR_ORDER : [run.menu]); setRun(null); }, [run, markSeen]);
  const skipAll = useCallback(() => { markSeen(TOUR_ORDER); setRun(null); }, [markSeen]);
  const next = useCallback(() => { if (!run) return; if (run.i + 1 >= run.steps.length) finish(); else setRun({ ...run, i: run.i + 1 }); }, [run, finish]);
  const back = useCallback(() => { if (run && run.i > 0) setRun({ ...run, i: run.i - 1 }); }, [run]);
  // Keeps the tab you are on marked as seen so it does not restart at once.
  const resetTours = useCallback(() => setDb((p) => ({ ...p, settings: { ...p.settings, toursSeen: { [tabRef.current]: true } } })), [setDb]);

  // Entering a step that belongs to another menu switches tab (full tour, back).
  const stepMenu = run ? run.steps[run.i].menu : null;
  useEffect(() => { if (stepMenu && stepMenu !== tabRef.current) goTab(stepMenu); }, [stepMenu, run && run.i]); // eslint-disable-line

  // First visit to a tab root starts that tab's tour, never during onboarding or a sheet.
  useEffect(() => {
    if (!enabled || run || blocked || !TOUR_ORDER.includes(screen) || seen[screen]) return;
    const id = setTimeout(() => start(screen, { auto: true }), 450);
    return () => clearTimeout(id);
  }, [enabled, run, blocked, screen, seen[screen]]); // eslint-disable-line

  useEffect(() => { if (run && !enabled) setRun(null); }, [run, enabled]);

  return { run, next, back, close: finish, skipAll, resetTours, api: { start, startFull, running: !!run } };
}
