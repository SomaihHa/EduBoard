import { ReactNode, forwardRef } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  colorClass?: string;
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ icon, label, value, sub, colorClass = "bg-gradient-primary" }, ref) => (
    <div ref={ref} className="bg-card rounded-xl shadow-card p-5 flex items-start gap-4 animate-slide-in">
      <div className={`w-11 h-11 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
);

StatCard.displayName = "StatCard";

interface ProgressRingProps {
  value: number;
  size?: number;
  label?: string;
}

export const ProgressRing = ({ value, size = 80, label }: ProgressRingProps) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="hsl(var(--primary))" strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000"
        />
      </svg>
      <span className="text-lg font-bold text-card-foreground">{value}%</span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
};

interface BadgeItemProps {
  emoji: string;
  label: string;
  earned?: boolean;
}

export const BadgeItem = ({ emoji, label, earned = true }: BadgeItemProps) => (
  <div className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
    earned ? "bg-mint" : "bg-muted opacity-40"
  }`}>
    <span className="text-2xl">{emoji}</span>
    <span className="text-xs font-medium text-foreground text-center">{label}</span>
  </div>
);
