type Props = Readonly<{
  size?: number;
  className?: string;
}>;

export function SephoraLogo({ size = 32, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sephora"
    >
      <path
        d="M20 3C20 3 28 11.5 28 20C28 24.42 24.42 28 20 28C15.58 28 12 24.42 12 20C12 11.5 20 3 20 3Z"
        fill="currentColor"
      />
      <path
        d="M20 13C20 13 24 17.5 24 22C24 24.21 22.21 26 20 26C17.79 26 16 24.21 16 22C16 17.5 20 13 20 13Z"
        fill="white"
        fillOpacity="0.2"
      />
      <circle cx="20" cy="34" r="3.5" fill="currentColor" />
    </svg>
  );
}
