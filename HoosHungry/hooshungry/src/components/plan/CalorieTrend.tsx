import { useState, useMemo } from "react";
import { useCalorieTrend } from "../../hooks/useCalorieTrend";

interface CalorieTrendProps {
  calorieGoal: number | null;
}

function getBarColor(actual: number, goal: number): string {
  const pct = goal > 0 ? actual / goal : 0;
  if (pct >= 0.9) return "var(--amber)";
  if (pct >= 0.6) return "var(--orange)";
  return "var(--terracotta)";
}

export default function CalorieTrend({ calorieGoal }: CalorieTrendProps) {
  const [days, setDays] = useState<7 | 30>(30);
  const { history, loading } = useCalorieTrend(days);
  const goal = calorieGoal || 2000;

  // 7-day rolling average
  const rollingAvg = useMemo(() => {
    return history.map((_, i) => {
      const window = history.slice(Math.max(0, i - 6), i + 1);
      return window.reduce((s, e) => s + e.total_calories, 0) / window.length;
    });
  }, [history]);

  const barWidth = days === 7 ? 28 : 10;
  const gap = 2;
  const svgHeight = 80;
  const svgWidth = history.length * (barWidth + gap);
  const maxVal = Math.max(goal * 1.2, ...history.map(e => e.total_calories), 1);

  return (
    <div className="card-editorial p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
        >
          Calorie Trend
        </p>
        <div className="flex gap-1">
          {([7, 30] as const).map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="px-2 py-0.5 rounded text-xs font-mono-data transition-colors"
              style={{
                backgroundColor: days === d ? "var(--orange)" : "transparent",
                color: days === d ? "white" : "var(--ink-muted)",
                border: "1px solid var(--rule)",
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-20 flex items-center justify-center">
          <span className="text-xs animate-pulse" style={{ color: "var(--ink-muted)" }}>
            Loading…
          </span>
        </div>
      ) : history.length === 0 ? (
        <div className="h-20 flex items-center justify-center">
          <span className="text-xs" style={{ color: "var(--ink-muted)" }}>
            No data yet. Start logging meals!
          </span>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <svg
            width={Math.max(svgWidth, 300)}
            height={svgHeight + 16}
            style={{ display: "block" }}
          >
            {/* Goal line */}
            <line
              x1={0}
              y1={svgHeight - (goal / maxVal) * svgHeight}
              x2={Math.max(svgWidth, 300)}
              y2={svgHeight - (goal / maxVal) * svgHeight}
              stroke="var(--orange)"
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.5}
            />

            {/* Bars */}
            {history.map((entry, i) => {
              const barH = Math.max(2, (entry.total_calories / maxVal) * svgHeight);
              const x = i * (barWidth + gap);
              return (
                <rect
                  key={entry.date}
                  x={x}
                  y={svgHeight - barH}
                  width={barWidth}
                  height={barH}
                  fill={getBarColor(entry.total_calories, goal)}
                  rx={2}
                  opacity={0.8}
                />
              );
            })}

            {/* Rolling average line */}
            {rollingAvg.length > 1 && (
              <polyline
                points={rollingAvg
                  .map((avg, i) => {
                    const x = i * (barWidth + gap) + barWidth / 2;
                    const y = svgHeight - (avg / maxVal) * svgHeight;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="var(--ink)"
                strokeWidth={1.5}
                opacity={0.6}
              />
            )}

            {/* Date labels — first and last only */}
            {history.length > 0 && (
              <>
                <text
                  x={0}
                  y={svgHeight + 14}
                  fontSize={9}
                  fill="var(--ink-muted)"
                  fontFamily="monospace"
                >
                  {history[0].date.slice(5)}
                </text>
                <text
                  x={(history.length - 1) * (barWidth + gap)}
                  y={svgHeight + 14}
                  fontSize={9}
                  fill="var(--ink-muted)"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {history[history.length - 1].date.slice(5)}
                </text>
              </>
            )}
          </svg>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <svg width={20} height={8}>
            <line x1={0} y1={4} x2={20} y2={4} stroke="var(--orange)" strokeWidth={1} strokeDasharray="3 2" />
          </svg>
          <span className="text-xs" style={{ color: "var(--ink-muted)" }}>Goal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width={20} height={8}>
            <line x1={0} y1={4} x2={20} y2={4} stroke="var(--ink)" strokeWidth={1.5} opacity={0.6} />
          </svg>
          <span className="text-xs" style={{ color: "var(--ink-muted)" }}>7d avg</span>
        </div>
      </div>
    </div>
  );
}
