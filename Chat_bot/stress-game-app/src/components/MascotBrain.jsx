const MascotBrain = ({ className = "w-24 h-24" }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient for brain body */}
        <linearGradient id="brainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Brain cloud shape */}
      <path
        d="M 30 50 Q 25 35 35 30 Q 45 25 55 30 Q 65 25 75 30 Q 85 35 80 50 Q 85 65 75 70 Q 65 75 55 70 Q 45 75 35 70 Q 25 65 30 50 Z"
        fill="url(#brainGradient)"
        stroke="#0891b2"
        strokeWidth="2"
      />

      {/* Brain wrinkles/details */}
      <path
        d="M 40 45 Q 45 40 50 45"
        fill="none"
        stroke="#0891b2"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <path
        d="M 60 45 Q 65 40 70 45"
        fill="none"
        stroke="#0891b2"
        strokeWidth="1.5"
        opacity="0.5"
      />

      {/* Glasses frame */}
      <circle
        cx="42"
        cy="52"
        r="8"
        fill="none"
        stroke="#1e40af"
        strokeWidth="2"
      />
      <circle
        cx="68"
        cy="52"
        r="8"
        fill="none"
        stroke="#1e40af"
        strokeWidth="2"
      />
      <line
        x1="50"
        y1="52"
        x2="60"
        y2="52"
        stroke="#1e40af"
        strokeWidth="2"
      />

      {/* Eyes behind glasses */}
      <circle cx="42" cy="52" r="3" fill="#1e293b" />
      <circle cx="68" cy="52" r="3" fill="#1e293b" />
      
      {/* Eye highlights */}
      <circle cx="43" cy="51" r="1.5" fill="white" />
      <circle cx="69" cy="51" r="1.5" fill="white" />

      {/* Calm smile */}
      <path
        d="M 45 62 Q 55 66 65 62"
        fill="none"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Thought bubble */}
      <circle cx="85" cy="35" r="4" fill="#e0f2fe" opacity="0.8" />
      <circle cx="92" cy="28" r="3" fill="#e0f2fe" opacity="0.8" />
      <circle cx="98" cy="23" r="2" fill="#e0f2fe" opacity="0.8" />
    </svg>
  );
};

export default MascotBrain;
