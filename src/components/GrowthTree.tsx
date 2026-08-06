const GROUND = (
  <line x1="10" y1="40" x2="38" y2="40" stroke="#edc3a5" strokeWidth="2" strokeLinecap="round" />
);

export function GrowthTree({ stage, className }: { stage: 1 | 2 | 3 | 4; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {GROUND}

      {stage === 1 ? (
        <>
          <line x1="24" y1="40" x2="24" y2="32" stroke="#3a4e3a" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="21" cy="31" rx="2.5" ry="1.6" fill="#7c9f7b" transform="rotate(-30 21 31)" />
          <ellipse cx="27" cy="31" rx="2.5" ry="1.6" fill="#5b7a5c" transform="rotate(30 27 31)" />
        </>
      ) : null}

      {stage === 2 ? (
        <>
          <line x1="24" y1="40" x2="24" y2="24" stroke="#3a4e3a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="20" r="7" fill="#7c9f7b" />
        </>
      ) : null}

      {stage === 3 ? (
        <>
          <line x1="24" y1="40" x2="24" y2="18" stroke="#3a4e3a" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="18" cy="16" r="7" fill="#7c9f7b" />
          <circle cx="30" cy="16" r="7" fill="#7c9f7b" />
          <circle cx="24" cy="11" r="8" fill="#5b7a5c" />
        </>
      ) : null}

      {stage === 4 ? (
        <>
          <line x1="24" y1="41" x2="24" y2="14" stroke="#3a4e3a" strokeWidth="4" strokeLinecap="round" />
          <circle cx="15" cy="16" r="8" fill="#7c9f7b" />
          <circle cx="33" cy="16" r="8" fill="#7c9f7b" />
          <circle cx="24" cy="10" r="11" fill="#5b7a5c" />
          <circle cx="18" cy="9" r="1.3" fill="#d37f4e" />
          <circle cx="29" cy="13" r="1.3" fill="#e2a176" />
          <circle cx="24" cy="6" r="1.3" fill="#c1622e" />
        </>
      ) : null}
    </svg>
  );
}
