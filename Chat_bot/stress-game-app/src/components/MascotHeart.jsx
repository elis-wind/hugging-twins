const MascotHeart = ({ className = "w-24 h-24" }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient for heart body */}
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>

      {/* Heart shape */}
      <path
        d="M 60 75 C 60 75 35 55 35 40 C 35 30 42 25 50 25 C 55 25 60 28 60 28 C 60 28 65 25 70 25 C 78 25 85 30 85 40 C 85 55 60 75 60 75 Z"
        fill="url(#heartGradient)"
        stroke="#dc2626"
        strokeWidth="2"
      />

      {/* Heart shine/highlight */}
      <ellipse
        cx="50"
        cy="38"
        rx="8"
        ry="12"
        fill="white"
        opacity="0.3"
      />

      {/* Happy eyes */}
      <circle cx="48" cy="45" r="4" fill="#7c2d12" />
      <circle cx="72" cy="45" r="4" fill="#7c2d12" />
      
      {/* Eye highlights */}
      <circle cx="49" cy="44" r="2" fill="white" />
      <circle cx="73" cy="44" r="2" fill="white" />

      {/* Big happy smile */}
      <path
        d="M 48 55 Q 60 62 72 55"
        fill="none"
        stroke="#7c2d12"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Rosy cheeks */}
      <circle cx="38" cy="50" r="5" fill="#fca5a5" opacity="0.6" />
      <circle cx="82" cy="50" r="5" fill="#fca5a5" opacity="0.6" />

      {/* Energy/motion lines */}
      <path
        d="M 20 35 L 25 35"
        stroke="#fb923c"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M 18 45 L 23 45"
        stroke="#fb923c"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M 95 35 L 100 35"
        stroke="#fb923c"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M 97 45 L 102 45"
        stroke="#fb923c"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Sparkle */}
      <path
        d="M 90 25 L 92 25 M 91 24 L 91 26"
        stroke="#fbbf24"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default MascotHeart;
