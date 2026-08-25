"use client";

// Real FIDE monthly rating chart — same SVG treatment as the dashboard, with an
// optional second series for player-vs-player comparison.
function pathFor(data: (number | null)[], scale: { x: (i: number) => number; y: (v: number) => number }, smooth = true) {
  let d = "";
  let pen = false;
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v == null) {
      pen = false;
      continue;
    }
    const x1 = scale.x(i), y1 = scale.y(v);
    if (!pen) {
      d += `${d ? " L" : "M"} ${x1} ${y1}`;
      pen = true;
      continue;
    }
    if (smooth) {
      const prev = data[i - 1];
      const x0 = scale.x(i - 1), y0 = prev != null ? scale.y(prev) : y1;
      const mx = (x0 + x1) / 2;
      d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
    } else {
      d += ` L ${x1} ${y1}`;
    }
  }
  return d;
}

export default function RatingChart({
  months,
  ratings,
  height = 220,
  color = "var(--green)",
  series2,
}: {
  months: string[];
  ratings: (number | null)[];
  height?: number;
  color?: string;
  series2?: { months: string[]; ratings: (number | null)[]; color?: string };
}) {
  const W = 680, H = 260, PAD = 14;
  const all = [
    ...ratings.filter((v): v is number => v != null),
    ...(series2 ? series2.ratings.filter((v): v is number => v != null) : []),
  ];
  const min = Math.min(...all), max = Math.max(...all), span = Math.max(max - min, 1);
  const scale = {
    x: (i: number) => PAD + ((W - 2 * PAD) * i) / (Math.max(months.length, 1) - 1),
    y: (v: number) => H - PAD - ((v - min) / span) * (H - 2 * PAD),
  };
  const pts = ratings.map((v, i) => (v == null ? null : ([scale.x(i), scale.y(v)] as const)));
  const nonNull = pts.map((p, i) => (p ? i : -1)).filter((i) => i >= 0);
  const first = nonNull[0], last = nonNull[nonNull.length - 1];
  const d1 = pathFor(ratings, scale, true);
  const d2 = series2 ? pathFor(series2.ratings, scale, false) : "";

  return (
    <svg viewBox="0 0 680 260" preserveAspectRatio="none" style={{ width: "100%", height }}>
      {[0, 1, 2, 3].map((g) => (
        <line key={g} x1={14} y1={30 + g * 70} x2={666} y2={30 + g * 70} stroke="rgba(148,180,255,.07)" strokeWidth={1} />
      ))}
      {first != null && last != null ? (
        <path
          d={`${d1} L ${scale.x(last)} 246 L ${scale.x(first)} 246 Z`}
          fill="url(#areagrad)" opacity={0.5}
        />
      ) : null}
      <path d={d1} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {pts.map((p, i) =>
        p ? (
          <circle key={i} cx={p[0]} cy={p[1]} r={3.2} fill={color}>
            <title>{months[i]}: {ratings[i]}</title>
          </circle>
        ) : null
      )}
      {series2 ? (
        <>
          <path d={d2} fill="none" stroke={series2.color} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="6 4" />
          {series2.ratings.map((v, i) =>
            v == null ? null : (
              <circle key={i} cx={scale.x(i)} cy={scale.y(v)} r={3.2} fill={series2.color}>
                <title>{series2.months[i]}: {v}</title>
              </circle>
            )
          )}
        </>
      ) : null}
      {months.map((m, i) => (
        <text key={m} x={scale.x(i)} y={252} textAnchor="middle" fontSize={10} fill="var(--muted)">{m}</text>
      ))}
      <defs>
        <linearGradient id="areagrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(34,197,94,.28)" />
          <stop offset="1" stopColor="rgba(34,197,94,0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
