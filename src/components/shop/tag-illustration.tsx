const PALETTES = {
  steel: { light: "#EDEAE2", mid: "#F6F3EC", dark: "#DED7C7", edgeTop: "#C4BCA8", edgeBottom: "#A9A08A" },
  brass: { light: "#F0DCB4", mid: "#E8CE97", dark: "#C98A3B", edgeTop: "#B8863F", edgeBottom: "#8F6428" },
  black: { light: "#3A4552", mid: "#28313D", dark: "#132A3E", edgeTop: "#0D1D2B", edgeBottom: "#08131D" },
} as const;

export function TagIllustration({
  className,
  variant = "steel",
}: {
  className?: string;
  variant?: keyof typeof PALETTES;
}) {
  const p = PALETTES[variant];
  const textColor = variant === "black" ? "#F6F3EC" : "#132A3E";
  const gradId = `steel-${variant}`;
  const edgeId = `edge-${variant}`;

  return (
    <svg
      viewBox="0 0 320 320"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a steel PetLink tag with a QR code"
    >
      {/* Keyring loop */}
      <circle cx="160" cy="46" r="22" fill="none" stroke="#132A3E" strokeWidth="7" />
      <circle cx="160" cy="46" r="22" fill="none" stroke="#C98A3B" strokeWidth="2.5" strokeDasharray="4 5" />

      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.light} />
          <stop offset="45%" stopColor={p.mid} />
          <stop offset="100%" stopColor={p.dark} />
        </linearGradient>
        <linearGradient id={edgeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.edgeTop} />
          <stop offset="100%" stopColor={p.edgeBottom} />
        </linearGradient>
      </defs>

      <rect x="50" y="66" width="220" height="220" rx="28" fill={`url(#${edgeId})`} />
      <rect x="50" y="60" width="220" height="220" rx="28" fill={`url(#${gradId})`} stroke="#132A3E" strokeWidth="3" />
      <circle cx="160" cy="90" r="9" fill={p.mid} stroke="#132A3E" strokeWidth="3" />

      {/* QR code (stylized, not a scannable real code — decorative) */}
      <g transform="translate(98, 118)">
        <rect width="124" height="124" rx="6" fill={variant === "black" ? "#F6F3EC" : "#132A3E"} />
        {(() => {
          const fg = variant === "black" ? "#132A3E" : "#F6F3EC";
          return (
            <>
              <rect x="8" y="8" width="30" height="30" fill={fg} />
              <rect x="14" y="14" width="18" height="18" fill={variant === "black" ? "#F6F3EC" : "#132A3E"} />
              <rect x="86" y="8" width="30" height="30" fill={fg} />
              <rect x="92" y="14" width="18" height="18" fill={variant === "black" ? "#F6F3EC" : "#132A3E"} />
              <rect x="8" y="86" width="30" height="30" fill={fg} />
              <rect x="14" y="92" width="18" height="18" fill={variant === "black" ? "#F6F3EC" : "#132A3E"} />
              <rect x="48" y="8" width="8" height="8" fill={fg} />
              <rect x="64" y="8" width="8" height="8" fill={fg} />
              <rect x="48" y="24" width="8" height="8" fill={fg} />
              <rect x="48" y="48" width="8" height="8" fill={fg} />
              <rect x="64" y="48" width="8" height="8" fill={fg} />
              <rect x="80" y="48" width="8" height="8" fill={fg} />
              <rect x="48" y="64" width="8" height="8" fill={fg} />
              <rect x="64" y="64" width="8" height="8" fill={fg} />
              <rect x="48" y="80" width="8" height="8" fill={fg} />
              <rect x="64" y="80" width="8" height="8" fill={fg} />
              <rect x="80" y="80" width="8" height="8" fill={fg} />
              <rect x="96" y="48" width="8" height="8" fill={fg} />
              <rect x="96" y="64" width="8" height="8" fill={fg} />
              <rect x="96" y="96" width="8" height="8" fill={fg} />
              <rect x="64" y="96" width="8" height="8" fill={fg} />
              <rect x="48" y="96" width="8" height="8" fill={fg} />
            </>
          );
        })()}
      </g>

      <text
        x="160"
        y="264"
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
        fontSize="13"
        letterSpacing="2"
        fill={textColor}
        opacity="0.55"
      >
        PETLINK.APP
      </text>
    </svg>
  );
}
