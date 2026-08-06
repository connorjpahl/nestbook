export function HatchMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* cracked-open egg shell */}
      <path
        d="M6 18c0 6 4.5 10 10 10s10-4 10-10l-4-1-3 2-3-3-3 3-3-2-4 1Z"
        fill="#FBF6EE"
        stroke="#C1622E"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* chick head peeking out of the crack */}
      <circle cx="16" cy="10" r="5.5" fill="#D37F4E" />
      <path d="M13.5 12.5 16 16.5 18.5 12.5Z" fill="#4A6449" />
      <circle cx="14.2" cy="8.8" r="1.1" fill="#472312" />
    </svg>
  );
}
