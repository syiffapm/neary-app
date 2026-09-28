/* Compact QR encoder: byte mode, EC level M, versions 1-10.
   Used to render the merchant's real KHQR payload so the code scans. */
const EXP = [], LOG = [];
(function () { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
const gmul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);
function rsGen(n) { let g = [1]; for (let i = 0; i < n; i++) { const ng = new Array(g.length + 1).fill(0); for (let j = 0; j < g.length; j++) { ng[j] ^= g[j]; ng[j + 1] ^= gmul(g[j], EXP[i]); } g = ng; } return g; }
function rsEnc(data, n) { const g = rsGen(n); const res = data.concat(new Array(n).fill(0)); for (let i = 0; i < data.length; i++) { const c = res[i]; if (!c) continue; for (let j = 0; j < g.length; j++) res[i + j] ^= gmul(g[j], c); } return res.slice(data.length); }
// [totalCodewords, ecPerBlock, g1Blocks, g1Data, g2Blocks, g2Data] for EC level M
const VER = { 1: [26, 10, 1, 16, 0, 0], 2: [44, 16, 1, 28, 0, 0], 3: [70, 26, 1, 44, 0, 0], 4: [100, 18, 2, 32, 0, 0], 5: [134, 24, 2, 43, 0, 0], 6: [172, 16, 4, 27, 0, 0], 7: [196, 18, 4, 31, 0, 0], 8: [242, 22, 2, 38, 2, 39], 9: [292, 22, 3, 36, 2, 37], 10: [346, 26, 4, 43, 1, 44] };
const ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50] };
function bchFormat(v) { let d = v << 10; for (let i = 4; i >= 0; i--) if (d & (1 << (i + 10))) d ^= 0x537 << i; return ((v << 10) | d) ^ 0x5412; }
function bchVersion(v) { let d = v << 12; for (let i = 5; i >= 0; i--) if (d & (1 << (i + 12))) d ^= 0x1f25 << i; return (v << 12) | d; }

export function qrMatrix(text) {
  const bytes = []; for (const ch of unescape(encodeURIComponent(text))) bytes.push(ch.charCodeAt(0));
  let ver = 0;
  for (let v = 1; v <= 10; v++) { const [, ec, b1, d1, b2, d2] = VER[v]; const cap = b1 * d1 + b2 * d2; const cci = v < 10 ? 8 : 16; if (bytes.length * 8 + 4 + cci <= cap * 8) { ver = v; break; } }
  if (!ver) throw new Error("payload too long");
  const [, ecLen, b1, d1, b2, d2] = VER[ver], totalData = b1 * d1 + b2 * d2;
  const bits = []; const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
  push(4, 4); push(bytes.length, ver < 10 ? 8 : 16); bytes.forEach((b) => push(b, 8));
  for (let i = 0; i < 4 && bits.length < totalData * 8; i++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const cw = []; for (let i = 0; i < bits.length; i += 8) cw.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  const pad = [0xec, 0x11]; let pi = 0; while (cw.length < totalData) cw.push(pad[pi++ % 2]);
  const blocks = [], ecBlocks = []; let off = 0;
  for (let i = 0; i < b1 + b2; i++) { const len = i < b1 ? d1 : d2; const blk = cw.slice(off, off + len); off += len; blocks.push(blk); ecBlocks.push(rsEnc(blk, ecLen)); }
  const out = []; const maxD = Math.max(d1, d2);
  for (let i = 0; i < maxD; i++) blocks.forEach((b) => { if (i < b.length) out.push(b[i]); });
  for (let i = 0; i < ecLen; i++) ecBlocks.forEach((b) => out.push(b[i]));

  const n = ver * 4 + 17;
  const m = Array.from({ length: n }, () => new Array(n).fill(null));
  const fn = Array.from({ length: n }, () => new Array(n).fill(false));
  const setF = (r, c, v) => { m[r][c] = v; fn[r][c] = true; };
  const finder = (r, c) => { for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) { const rr = r + i, cc = c + j; if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue; const inb = i >= 0 && i <= 6 && j >= 0 && j <= 6; const v = inb && (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)); setF(rr, cc, v ? 1 : 0); } };
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
  for (let i = 8; i < n - 8; i++) { const v = i % 2 === 0 ? 1 : 0; setF(6, i, v); setF(i, 6, v); }
  const ac = ALIGN[ver];
  ac.forEach((r) => ac.forEach((c) => { if ((r === 6 && c === 6) || (r === 6 && c === n - 7) || (r === n - 7 && c === 6)) return; for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) setF(r + i, c + j, Math.max(Math.abs(i), Math.abs(j)) !== 1 ? 1 : 0); }));
  setF(n - 8, 8, 1);
  const fmtCells = (i) => { const a = i < 6 ? [8, i] : i === 6 ? [8, 7] : i === 7 ? [8, 8] : i === 8 ? [7, 8] : [14 - i, 8]; const b = i < 7 ? [n - 1 - i, 8] : [8, n - 15 + i]; return [a, b]; };
  for (let i = 0; i < 15; i++) fmtCells(i).forEach(([r, c]) => setF(r, c, 0));
  if (ver >= 7) { const vb = bchVersion(ver); for (let i = 0; i < 18; i++) { const b = (vb >> i) & 1; setF(Math.floor(i / 3), n - 11 + (i % 3), b); setF(n - 11 + (i % 3), Math.floor(i / 3), b); } }

  const place = (mask) => {
    const g = m.map((r) => r.slice());
    let bi = 0, up = true;
    for (let c = n - 1; c > 0; c -= 2) {
      if (c === 6) c--;
      for (let k = 0; k < n; k++) {
        const r = up ? n - 1 - k : k;
        for (let d = 0; d < 2; d++) {
          const cc = c - d;
          if (fn[r][cc]) continue;
          let v = bi < out.length * 8 ? (out[bi >> 3] >> (7 - (bi & 7))) & 1 : 0; bi++;
          const i = r, j = cc;
          const cond = [(i + j) % 2 === 0, i % 2 === 0, j % 3 === 0, (i + j) % 3 === 0, (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0, ((i * j) % 2) + ((i * j) % 3) === 0, (((i * j) % 2) + ((i * j) % 3)) % 2 === 0, (((i + j) % 2) + ((i * j) % 3)) % 2 === 0][mask];
          g[r][cc] = cond ? v ^ 1 : v;
        }
      }
      up = !up;
    }
    const fmt = bchFormat((0 << 3) | mask);
    for (let i = 0; i < 15; i++) { const bit = (fmt >> (14 - i)) & 1; fmtCells(i).forEach(([r, c]) => (g[r][c] = bit)); }
    return g;
  };
  const P3A = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], P3B = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  const penalty = (g) => {
    let p = 0, dark = 0;
    const scan = (get) => {
      let run = 1;
      for (let i = 1; i <= n; i++) {
        if (i < n && get(i) === get(i - 1)) run++;
        else { if (run >= 5) p += 3 + (run - 5); run = 1; }
      }
      for (let i = 0; i + 11 <= n; i++) {
        let a = true, b = true;
        for (let k = 0; k < 11; k++) { const v = get(i + k); if (v !== P3A[k]) a = false; if (v !== P3B[k]) b = false; }
        if (a) p += 40;
        if (b) p += 40;
      }
    };
    for (let r = 0; r < n; r++) scan((i) => g[r][i]);
    for (let c = 0; c < n; c++) scan((i) => g[i][c]);
    for (let r = 0; r < n - 1; r++) for (let c = 0; c < n - 1; c++) { const v = g[r][c]; if (v === g[r][c + 1] && v === g[r + 1][c] && v === g[r + 1][c + 1]) p += 3; }
    g.forEach((r) => r.forEach((v) => (dark += v)));
    p += Math.floor(Math.abs((dark * 100) / (n * n) - 50) / 5) * 10;
    return p;
  };
  let best = null, bestP = Infinity, bestM = 0;
  for (let mask = 0; mask < 8; mask++) { const g = place(mask); const p = penalty(g); if (p < bestP) { bestP = p; best = g; bestM = mask; } }
  if (typeof QRDEBUG !== "undefined") QRDEBUG.mask = bestM;
  return best;
}
function crc16(s) { let c = 0xffff; for (let i = 0; i < s.length; i++) { c ^= s.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xffff : (c << 1) & 0xffff; } return c.toString(16).toUpperCase().padStart(4, "0"); }
function tlv(id, v) { return id + String(v.length).padStart(2, "0") + v; }
export function khqrPayload({ merchantId, name, city, amount, currency = "840" }) {
  let s = tlv("00", "01") + tlv("01", amount ? "12" : "11");
  s += tlv("29", tlv("00", "neary.com.kh") + tlv("01", merchantId));
  s += tlv("52", "5699") + tlv("53", currency);
  if (amount) s += tlv("54", amount.toFixed(2));
  s += tlv("58", "KH") + tlv("59", name.slice(0, 25)) + tlv("60", city.slice(0, 15));
  s += tlv("62", tlv("01", merchantId));
  s += "6304";
  return s + crc16(s);
}

