
interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number; // 0 to 100
  colorClass?: string;
  backgroundColorClass?: string;
  size?: number;
}

export default function ProgressRing({
  radius,
  stroke,
  progress,
  colorClass = "stroke-brand",
  backgroundColorClass = "stroke-slate-800",
  size
}: ProgressRingProps) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;
  
  const finalSize = size || radius * 2;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={finalSize}
        width={finalSize}
        className="transform -rotate-90"
      >
        <circle
          className={`${backgroundColorClass} fill-transparent transition-all duration-300`}
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={finalSize / 2}
          cy={finalSize / 2}
        />
        <circle
          className={`${colorClass} fill-transparent transition-all duration-500 ease-out`}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={finalSize / 2}
          cy={finalSize / 2}
        />
      </svg>
      <div className="absolute font-extrabold text-white text-center font-sans">
        <span className="text-base">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
