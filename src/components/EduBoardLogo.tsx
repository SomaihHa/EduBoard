const EduBoardLogo = ({ className = "", size = "default" }: { className?: string; size?: "default" | "large" }) => {
  const isLarge = size === "large";
  const iconSize = isLarge ? "w-11 h-11" : "w-8 h-8";
  const textSize = isLarge ? "text-[24px]" : "text-[16px]";
  const gap = isLarge ? "gap-3" : "gap-2";

  return (
    <div className={`flex items-center ${gap} select-none ${className}`}>
      {/* Stacked bars E icon — inspired by EduCore style */}
      <svg viewBox="0 0 40 40" fill="none" className={iconSize}>
        {/* Top bar — full width */}
        <rect x="4" y="5" width="32" height="7" rx="1.5" fill="white" />
        {/* Middle bar — indented left, with gradient accent */}
        <rect x="10" y="16.5" width="26" height="7" rx="1.5" fill="url(#eduGrad)" />
        {/* Bottom bar — full width */}
        <rect x="4" y="28" width="32" height="7" rx="1.5" fill="white" />
        <defs>
          <linearGradient id="eduGrad" x1="10" y1="16.5" x2="36" y2="23.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
      </svg>

      <span
        className={`font-semibold text-white ${textSize}`}
        style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.01em' }}
      >
        EduBoard
      </span>
    </div>
  );
};

export default EduBoardLogo;
