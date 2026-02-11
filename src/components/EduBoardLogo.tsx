const EduBoardLogo = ({ className = "", size = "default" }: { className?: string; size?: "default" | "large" }) => {
  const isLarge = size === "large";
  const iconSize = isLarge ? "w-10 h-10" : "w-7 h-7";
  const textSize = isLarge ? "text-[22px]" : "text-[15px]";
  const gap = isLarge ? "gap-2" : "gap-1.5";

  return (
    <div className={`flex items-center ${gap} select-none ${className}`}>
      {/* Geometric E mark */}
      <svg viewBox="0 0 36 36" fill="none" className={iconSize}>
        <rect x="4" y="3" width="5.5" height="30" rx="2" fill="white" />
        <rect x="9.5" y="3" width="20" height="5.5" rx="2" fill="white" />
        <rect x="9.5" y="15.25" width="15" height="5.5" rx="2" fill="url(#eduGrad)" />
        <rect x="9.5" y="27.5" width="20" height="5.5" rx="2" fill="white" />
        <defs>
          <linearGradient id="eduGrad" x1="9.5" y1="15.25" x2="24.5" y2="20.75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
      </svg>

      <span
        className={`font-bold tracking-[0.06em] text-white uppercase ${textSize}`}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        duBoard
      </span>
    </div>
  );
};

export default EduBoardLogo;
