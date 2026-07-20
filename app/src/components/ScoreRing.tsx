export function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  const hue = 260 - (score / 100) * 60; // violet → pink as score rises

  return (
    <div className="score-ring" style={{ width: size, height: size }} title={`AI match score: ${score}/100`}>
      <svg width={size} height={size} role="img" aria-label={`Match score ${score} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`hsl(${hue} 80% 62%)`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="val">{score}</span>
    </div>
  );
}
