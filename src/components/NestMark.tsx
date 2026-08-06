export function NestMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="13" cy="17" rx="3.2" ry="3.8" fill="#C1622E" />
      <ellipse cx="19" cy="16.5" rx="3" ry="3.6" fill="#E2A176" />
      <ellipse cx="16" cy="19.5" rx="3.4" ry="4" fill="#A84F22" />
      <path
        d="M4 19c2-2 5-3 12-3s10 1 12 3"
        stroke="#5B7A5C"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M5 22c2.5-1.5 6-2.2 11-2.2s8.5.7 11 2.2"
        stroke="#5B7A5C"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M6.5 25c3-1.3 6-1.8 9.5-1.8s6.5.5 9.5 1.8"
        stroke="#4A6449"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
