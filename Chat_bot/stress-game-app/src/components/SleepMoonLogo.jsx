const SleepMoonLogo = ({ className = "w-12 h-12" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-indigo-500 ${className}`}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fillOpacity="0.2" />
    <path d="M19 3v4" />
    <path d="M21 5h-4" />
    {/* Little sparkle star */}
    <path d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="currentColor" stroke="none" className="text-indigo-300" />
  </svg>
);

export default SleepMoonLogo;
