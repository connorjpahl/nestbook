export function SproutMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 18 C16 14 8 15 5 19 L5 33 C8 29 16 28 24 32 Z"
        fill="#ffffff"
        stroke="#c1622e"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 18 C32 14 40 15 43 19 L43 33 C40 29 32 28 24 32 Z"
        fill="#ffffff"
        stroke="#c1622e"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="24" y1="18" x2="24" y2="8" stroke="#4a6449" strokeWidth="3" strokeLinecap="round" />
      <ellipse
        cx="19"
        cy="11"
        rx="5.5"
        ry="3.5"
        fill="#5b7a5c"
        transform="rotate(-30 19 11)"
      />
      <ellipse
        cx="29"
        cy="11"
        rx="5.5"
        ry="3.5"
        fill="#7c9f7b"
        transform="rotate(30 29 11)"
      />
    </svg>
  );
}
