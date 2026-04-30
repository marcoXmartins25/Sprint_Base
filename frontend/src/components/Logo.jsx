export default function Logo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* Background rounded square */}
      <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />

      {/* Letter S */}
      <path
        d="M11 11.5C11 10.1 12.1 9 13.5 9H18C19.7 9 21 10.3 21 12C21 13.7 19.7 15 18 15H14C12.3 15 11 16.3 11 18C11 19.7 12.3 21 14 21H18.5C19.9 21 21 19.9 21 18.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Checkmark */}
      <path
        d="M17 17.5L19.5 20L24 14.5"
        stroke="#a5f3fc"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
