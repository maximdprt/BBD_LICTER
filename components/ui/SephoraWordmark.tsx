type Props = Readonly<{
  /** Height in pixels */
  height?: number;
  /** Optional className for styling */
  className?: string;
  /** Color for the mark/text (defaults to currentColor) */
  color?: string;
}>;

/**
 * Sephora wordmark (flame + SEPHORA).
 * Vector-only so it works reliably on Vercel without asset copying.
 */
export function SephoraWordmark({ height = 26, className, color = "currentColor" }: Props) {
  // Keep original logo proportions close to the reference image.
  // 300×90 viewBox gives enough room for flame + wordmark.
  return (
    <svg
      height={height}
      viewBox="0 0 300 90"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Sephora"
      className={className}
      style={{ display: "block" }}
    >
      {/* Flame (stylized) */}
      <path
        d="M92 6
           C77 28, 76 44, 82 58
           C87 70, 86 78, 77 85
           C94 76, 104 62, 106 48
           C109 30, 101 20, 92 6 Z"
        fill={color}
      />
      {/* Inner cut to mimic the tapered negative space */}
      <path
        d="M94 16
           C86 30, 85 42, 89 54
           C92 62, 91 68, 86 73
           C97 67, 103 56, 104 45
           C105 33, 100 24, 94 16 Z"
        fill="white"
        opacity="0.15"
      />

      {/* Wordmark */}
      <text
        x="20"
        y="84"
        fill={color}
        fontSize="34"
        fontFamily="DM Sans, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
        letterSpacing="10"
        fontWeight="600"
      >
        SEPHORA
      </text>
    </svg>
  );
}

