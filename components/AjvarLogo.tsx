interface AjvarLogoProps {
  className?: string;
  size?: number;
  /** Use simplified version for very small sizes (< 48px) */
  simplified?: boolean;
}

/**
 * Ajvar Jar Logo - Brand icon for MK Language Lab
 *
 * Design: Traditional Macedonian ajvar jar with "М" on the label
 * Colors: Vibrant red (#E63E2A) jar, silver lid, white label
 *
 * The jar represents Macedonian culture and home cooking tradition.
 * The "М" on the label connects it to Macedonian language learning.
 */
export function AjvarLogo({ className, size = 40, simplified }: AjvarLogoProps) {
  // Auto-detect if we should use simplified version
  const useSimplified = simplified ?? size < 48;

  if (useSimplified) {
    return <AjvarLogoSimplified className={className} size={size} />;
  }

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
        minHeight: `${size}px`,
      }}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="MK Language Lab Logo"
    >
      {/* Jar Lid - Metallic silver with highlight */}
      <rect x="10" y="6" width="20" height="5" rx="1.5" fill="#B8BDC6" />
      <rect x="12" y="7" width="12" height="2" rx="1" fill="#E8EAED" fillOpacity="0.6" />

      {/* Jar Body - Vibrant ajvar red */}
      <rect x="8" y="11" width="24" height="24" rx="4" fill="#E63E2A" />

      {/* Glass Shine - Subtle highlight on left */}
      <ellipse cx="14" cy="20" rx="3" ry="8" fill="white" fillOpacity="0.2" />

      {/* Label - White rectangle with М */}
      <rect x="12" y="16" width="16" height="14" rx="2" fill="white" fillOpacity="0.95" />

      {/* Cyrillic М on label - Bold and clear */}
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="11"
        fontWeight="700"
        fill="#2C3E50"
      >
        М
      </text>
    </svg>
  );
}

/**
 * Simplified version for small sizes (favicons, etc.)
 * Removes fine details, keeps essential shapes bold and clear
 */
function AjvarLogoSimplified({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        flexShrink: 0,
        display: 'block',
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="MK Language Lab Logo"
    >
      {/* Simplified Lid */}
      <rect x="8" y="4" width="16" height="4" rx="1" fill="#B8BDC6" />

      {/* Simplified Jar Body */}
      <rect x="6" y="8" width="20" height="20" rx="3" fill="#E63E2A" />

      {/* Simplified Label with М */}
      <rect x="10" y="12" width="12" height="12" rx="1.5" fill="white" fillOpacity="0.95" />

      {/* Bold М */}
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="9"
        fontWeight="800"
        fill="#2C3E50"
      >
        М
      </text>
    </svg>
  );
}

export default AjvarLogo;
