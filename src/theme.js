/* Brand tokens and mobile primitives. */
export const C = {
  navy: "#001E6C", pink: "#F20070", pinkDeep: "#C8005F", blush: "#FCEAF3", blush2: "#FEF5FA", line: "#F1DCE7",
  ink: "#1D2347", mute: "#4F566B", soft: "#858BA0", aqua: "#3FB8AE", aquaSoft: "#E3F8F6",
  green: "#1E9E6A", greenSoft: "#E2F5EC", amber: "#C27400", amberSoft: "#FFF1DA", red: "#C0263A", redSoft: "#FCE4E7", bg: "#FFFFFF",
};
export const HEAD = "'Montserrat', system-ui, sans-serif";
export const BODY = "'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif";
export const GRAD = "linear-gradient(90deg, #F2338A 0%, #F98CBC 100%)";
export const inputCls = "w-full text-sm rounded-2xl border px-3.5 py-3 bg-white";

/* High-contrast mode. Screens read colours from C at render time, so
   swapping the values in place (as setLocale does for language) restyles
   the whole app on the next render without touching any component. */
const BASE_C = { ...C };
const HC_C = { pink: "#B0004F", pinkDeep: "#8E0040", navy: "#000F45", ink: "#000000", mute: "#1F2540", soft: "#3A415C", line: "#6B7392", aqua: "#0F6F68", green: "#0F6B45", amber: "#8A4F00", red: "#A0182B" };
export const setContrast = (on) => Object.assign(C, BASE_C, on ? HC_C : {});
