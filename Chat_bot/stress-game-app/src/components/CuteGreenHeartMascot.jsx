const CuteGreenHeartMascot = ({ className = "w-28 h-28" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 120 120" 
    fill="none"
    className={className}
  >
    {/* Main heart body - plump and cute */}
    <path
      d="M60 100 C 60 100, 25 75, 25 50 C 25 35, 35 25, 45 25 C 52 25, 57 30, 60 35 C 63 30, 68 25, 75 25 C 85 25, 95 35, 95 50 C 95 75, 60 100, 60 100 Z"
      fill="#82ca9d"
      stroke="none"
    />
    
    {/* Left eye - simple black oval */}
    <ellipse
      cx="45"
      cy="50"
      rx="3.5"
      ry="5"
      fill="#2C2420"
    />
    
    {/* Right eye - simple black oval */}
    <ellipse
      cx="75"
      cy="50"
      rx="3.5"
      ry="5"
      fill="#2C2420"
    />
    
    {/* Left blush - pink circle */}
    <circle
      cx="35"
      cy="58"
      r="6"
      fill="#FFB6C1"
      opacity="0.6"
    />
    
    {/* Right blush - pink circle */}
    <circle
      cx="85"
      cy="58"
      r="6"
      fill="#FFB6C1"
      opacity="0.6"
    />
    
    {/* Cute smile - optional */}
    <path
      d="M 50 62 Q 60 68, 70 62"
      stroke="#2C2420"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      opacity="0.7"
    />
  </svg>
);

export default CuteGreenHeartMascot;
