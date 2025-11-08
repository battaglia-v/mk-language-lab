interface AjvarLogoProps {
  className?: string;
  size?: number;
}

export function AjvarLogo({ className, size = 40 }: AjvarLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        flexShrink: 0,
        display: 'block',
        minWidth: `${size}px`,
        minHeight: `${size}px`
      }}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Ajvar Logo"
    >
      {/* Jar Lid - Minimal and sleek */}
      <path
        d="M12 8h16c.5 0 1 .3 1.2.7l.8 2c.2.5-.1 1-.8 1H11.8c-.7 0-1-.5-.8-1l.8-2C12 8.3 12.5 8 13 8z"
        fill="url(#lid-gradient)"
        fillOpacity="0.95"
      />

      {/* Lid Shine - Subtle highlight */}
      <ellipse
        cx="20"
        cy="9.5"
        rx="6"
        ry="1.2"
        fill="white"
        fillOpacity="0.25"
      />

      {/* Jar Body - Clean, modern shape */}
      <path
        d="M13 12.5h14c1.5 0 2.5 1 2.5 2.5v16c0 2-1.5 3.5-3.5 3.5h-12c-2 0-3.5-1.5-3.5-3.5v-16c0-1.5 1-2.5 2.5-2.5z"
        fill="url(#jar-gradient)"
      />

      {/* Jar Label - Minimal, modern */}
      <rect
        x="14"
        y="19"
        width="12"
        height="10"
        rx="1.5"
        fill="url(#label-gradient)"
        fillOpacity="0.92"
      />

      {/* Label Text Lines - Subtle */}
      <rect x="16" y="21.5" width="8" height="1.2" rx="0.6" fill="#0D111F" fillOpacity="0.75" />
      <rect x="16.5" y="24" width="7" height="0.9" rx="0.45" fill="#0D111F" fillOpacity="0.5" />
      <rect x="17" y="26" width="6" height="0.9" rx="0.45" fill="#0D111F" fillOpacity="0.45" />

      {/* Glass Shine - Apple-style subtle reflection */}
      <path
        d="M13.5 15c0-1 .5-2 1.5-2h10c1 0 1.5 1 1.5 2v8c0 .5-.3 1-.8 1H14.3c-.5 0-.8-.5-.8-1v-8z"
        fill="url(#shine-gradient)"
        fillOpacity="0.15"
      />

      {/* Top Rim Highlight */}
      <ellipse
        cx="20"
        cy="12.8"
        rx="6.5"
        ry="0.8"
        fill="white"
        fillOpacity="0.2"
      />

      {/* Gradients */}
      <defs>
        {/* Lid - Premium metallic */}
        <linearGradient id="lid-gradient" x1="20" y1="8" x2="20" y2="11.7" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8EBF0" />
          <stop offset="0.5" stopColor="#CDD2DB" />
          <stop offset="1" stopColor="#B4BAC7" />
        </linearGradient>

        {/* Jar - Rich red Ajvar color */}
        <linearGradient id="jar-gradient" x1="20" y1="12" x2="20" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6B47" />
          <stop offset="0.4" stopColor="#F04122" />
          <stop offset="1" stopColor="#D63616" />
        </linearGradient>

        {/* Label - Clean, modern */}
        <linearGradient id="label-gradient" x1="20" y1="19" x2="20" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FAFBFC" />
          <stop offset="1" stopColor="#E8EBF0" />
        </linearGradient>

        {/* Glass shine - Subtle Apple-style reflection */}
        <linearGradient id="shine-gradient" x1="20" y1="13" x2="20" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.4" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
