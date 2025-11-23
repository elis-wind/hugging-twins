const HarmonyLogo = ({ className = "w-12 h-12" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

export default HarmonyLogo;
