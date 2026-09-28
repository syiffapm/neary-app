const AV_SKIN = ["#C98F6B", "#B97A58", "#D9A27E", "#A86B4C"];
const AV_HAIR = ["#1F1A2E", "#2B2233", "#3A2A2A"];
const AV_TOP = ["#F20070", "#3FB8AE", "#001E6C", "#F59BC6"];
const AV_BG = ["#FCEAF3", "#E3F8F6"];
const AV_CAP = "M13.6 17 C 13 10, 17 8.6, 20 8.6 C 24 8.6, 27 10.5, 26.4 17 C 25.5 13, 23 11.5, 20 11.8 C 17 11.5, 14.5 13, 13.6 17 Z";
const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
export function WomanAvatar({ seed = "", size = 32 }) {
  const h = hashStr(seed), r = h % 100;
  const style = r < 28 ? "bun" : r < 54 ? "long" : r < 74 ? "pony" : r < 94 ? "bob" : "scarf";
  const skin = AV_SKIN[(h >>> 7) % 4], hair = AV_HAIR[(h >>> 11) % 3], top = AV_TOP[(h >>> 13) % 4], bg = AV_BG[(h >>> 17) % 2];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0" style={{ borderRadius: "50%" }}>
      <circle cx="20" cy="20" r="20" fill={bg} />
      {style === "long" && <path d="M12.5 17 C 12 9, 16 7.8, 20 7.8 C 24 7.8, 28 9, 27.5 17 L 28.2 31 C 25 32, 23 30, 23 27 L 17 27 C 17 30, 15 32, 11.8 31 Z" fill={hair} />}
      {style === "bob" && <path d="M12.6 18 C 12.4 10, 16 8, 20 8 C 24 8, 27.6 10, 27.4 18 C 27.4 22, 26.4 24.5, 25 25 L 15 25 C 13.6 24.5, 12.6 22, 12.6 18 Z" fill={hair} />}
      <path d="M6 40 C 7 31, 13 28, 20 28 C 27 28, 33 31, 34 40 Z" fill={top} />
      <rect x="17.5" y="21" width="5" height="8" rx="2.2" fill={skin} opacity="0.85" />
      <ellipse cx="20" cy="17" rx="6.2" ry="7" fill={skin} />
      {style === "scarf"
        ? <path fillRule="evenodd" fill={top === "#001E6C" ? "#6E7BB8" : top} d="M11.3 18 C 11.3 9, 16 6.8, 20 6.8 C 24 6.8, 28.7 9, 28.7 18 C 28.7 24.5, 26 29, 20 30.5 C 14 29, 11.3 24.5, 11.3 18 Z M14.7 17.4 a5.3 6.1 0 1 0 10.6 0 a5.3 6.1 0 1 0 -10.6 0 Z" />
        : <><path d={AV_CAP} fill={hair} />{style === "bun" && <circle cx="20" cy="7.3" r="3.4" fill={hair} />}{style === "pony" && <path d="M25.8 12 C 31 13, 31.5 21, 28.6 25.5 C 28.2 20, 27.6 16, 25.4 14 Z" fill={hair} />}</>}
    </svg>
  );
}
export function WomanReading({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true" className="shrink-0">
      <circle cx="40" cy="40" r="34" fill="#FFFFFF" opacity="0.75" />
      <path d="M28 34 C 27 20, 34 15, 40 15 C 47 15, 54 20, 52 34 C 53 41, 51 45, 49 47 L 32 47 C 30 45, 27.5 41, 28 34 Z" fill="#1F1A2E" />
      <circle cx="40" cy="12.5" r="5.4" fill="#1F1A2E" />
      <path d="M18 80 C 19 62, 29 54, 40 54 C 51 54, 61 62, 62 80 Z" fill="#F20070" />
      <rect x="35" y="44" width="10" height="12" rx="4" fill="#C98F6B" opacity="0.9" />
      <ellipse cx="40" cy="33" rx="9.4" ry="11" fill="#C98F6B" />
      <path d="M30.5 32 C 30 21, 35 18, 40 18 C 46 18, 51 21, 50 32 C 48 25, 44.5 23, 40 23.5 C 35.5 23, 32.5 25.5, 30.5 32 Z" fill="#1F1A2E" />
      <path d="M35 33 q1.8 -1.8 3.6 0 M41.4 33 q1.8 -1.8 3.6 0" stroke="#3A2A2A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M37 39 q3 2.4 6 0" stroke="#8C3A4A" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <circle cx="31.5" cy="37" r="2" fill="#F59BC6" opacity="0.6" /><circle cx="48.5" cy="37" r="2" fill="#F59BC6" opacity="0.6" />
      <g transform="rotate(-8 40 64)"><rect x="26" y="56" width="28" height="19" rx="3" fill="#001E6C" /><rect x="28.5" y="58.5" width="23" height="14" rx="2" fill="#fff" />
        <rect x="31" y="66" width="3.4" height="4" rx="1" fill="#F9BCDB" /><rect x="36" y="63.5" width="3.4" height="6.5" rx="1" fill="#F59BC6" /><rect x="41" y="61" width="3.4" height="9" rx="1" fill="#3FB8AE" /><rect x="46" y="59" width="3.4" height="11" rx="1" fill="#F20070" /></g>
      <ellipse cx="25" cy="66" rx="4" ry="4.6" fill="#C98F6B" /><ellipse cx="55" cy="62" rx="4" ry="4.6" fill="#C98F6B" />
    </svg>
  );
}
