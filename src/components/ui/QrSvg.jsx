export function QrSvg({ matrix, size = 200 }) {
  const n = matrix.length, q = 2, total = n + q * 2, cell = size / total;
  const d = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (matrix[r][c]) d.push(`M${((c + q) * cell).toFixed(2)} ${((r + q) * cell).toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}z`);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="KHQR payment code">
      <rect width={size} height={size} fill="#fff" />
      <path d={d.join("")} fill="#001E6C" shapeRendering="crispEdges" />
    </svg>
  );
}
