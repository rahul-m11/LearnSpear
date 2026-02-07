export const LogoIcon = ({ className = "w-12 h-12" }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Left Page - Purple */}
    <path
      d="M 50 50 L 100 50 L 100 150 L 50 150 C 40 150 35 145 35 135 L 35 65 C 35 55 40 50 50 50 Z"
      fill="#6B3B8E"
      stroke="#5A2E6F"
      strokeWidth="1.5"
    />
    
    {/* Right Page - Gray */}
    <path
      d="M 100 50 L 150 50 C 160 50 165 55 165 65 L 165 135 C 165 145 160 150 150 150 L 100 150 Z"
      fill="#9B9B9B"
      stroke="#888888"
      strokeWidth="1.5"
    />

    {/* Center Spine */}
    <line x1="100" y1="50" x2="100" y2="150" stroke="#4A2970" strokeWidth="2" />

    {/* Left Page - Decorative lines */}
    <path
      d="M 60 70 Q 70 80 65 95"
      stroke="white"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="70" cy="75" r="1.5" fill="white" />
    
    <path
      d="M 55 110 Q 75 105 70 125"
      stroke="white"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="60" cy="120" r="1.5" fill="white" />

    {/* Right Page - Decorative lines */}
    <path
      d="M 140 70 Q 130 80 135 95"
      stroke="white"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="130" cy="75" r="1.5" fill="white" />
    
    <path
      d="M 145 110 Q 125 105 130 125"
      stroke="white"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="140" cy="120" r="1.5" fill="white" />
  </svg>
);
