const EduBoardLogo = ({ className = "", size = "default" }: { className?: string; size?: "default" | "large" }) => {
  const isLarge = size === "large";
  
  return (
    <div className={`flex items-center gap-0 select-none ${className}`}>
      {/* Stylized "E" mark */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className={isLarge ? "w-11 h-11" : "w-8 h-8"}
      >
        {/* Geometric E with horizontal bars */}
        <rect x="6" y="4" width="6" height="32" rx="1.5" fill="white" />
        <rect x="12" y="4" width="18" height="6" rx="1.5" fill="white" />
        <rect x="12" y="17" width="14" height="5.5" rx="1.5" fill="url(#eduGrad)" />
        <rect x="12" y="30" width="18" height="6" rx="1.5" fill="white" />
        <defs>
          <linearGradient id="eduGrad" x1="12" y1="17" x2="26" y2="22.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Text */}
      <span
        className={`font-extrabold tracking-[0.04em] text-white uppercase ${
          isLarge ? "text-2xl" : "text-base"
        }`}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        duBoard
      </span>
    </div>
  );
};

export default EduBoardLogo;
