const BrandLogo = ({ className = "w-10 h-10" }) => (
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
    <circle cx="12" cy="12" r="10" className="opacity-20" fill="currentColor" stroke="none" />
    <path d="M8 15h.01M16 15h.01" />
    <path d="M9 9c0-3.5 2-4 3-4s3 .5 3 4c0 2.5-2 4-3 4s-3-1.5-3-4z" />
    <path d="M15 16a3 3 0 0 1-6 0" />
  </svg>
);

export default BrandLogo;
