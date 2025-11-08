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
      {/* Jar Lid - Solid metallic silver */}
      <path
        d="M12 8h16c.5 0 1 .3 1.2.7l.8 2c.2.5-.1 1-.8 1H11.8c-.7 0-1-.5-.8-1l.8-2C12 8.3 12.5 8 13 8z"
        fill="#CDD2DB"
      />

      {/* Lid Shine - Subtle highlight */}
      <ellipse
        cx="20"
        cy="9.5"
        rx="6"
        ry="1.2"
        fill="white"
        fillOpacity="0.3"
      />

      {/* Jar Body - Bright red Ajvar color (SOLID) */}
      <path
        d="M13 12.5h14c1.5 0 2.5 1 2.5 2.5v16c0 2-1.5 3.5-3.5 3.5h-12c-2 0-3.5-1.5-3.5-3.5v-16c0-1.5 1-2.5 2.5-2.5z"
        fill="#E63E2A"
      />

      {/* Jar Label - Clean white label */}
      <rect
        x="14"
        y="19"
        width="12"
        height="10"
        rx="1.5"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />

      {/* Label Text Lines - Dark text on label */}
      <rect x="16" y="21.5" width="8" height="1.2" rx="0.6" fill="#2C3E50" fillOpacity="0.8" />
      <rect x="16.5" y="24" width="7" height="0.9" rx="0.45" fill="#2C3E50" fillOpacity="0.6" />
      <rect x="17" y="26" width="6" height="0.9" rx="0.45" fill="#2C3E50" fillOpacity="0.5" />

      {/* Glass Shine - White highlight */}
      <ellipse
        cx="18"
        cy="18"
        rx="4"
        ry="6"
        fill="white"
        fillOpacity="0.2"
      />

      {/* Top Rim Highlight */}
      <ellipse
        cx="20"
        cy="12.8"
        rx="6.5"
        ry="0.8"
        fill="white"
        fillOpacity="0.25"
      />
    </svg>
  );
}
