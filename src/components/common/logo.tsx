type GravityMarkProps = {
  size?: number;
  className?: string;
};

const GravityMark = ({ size = 22, className = "" }: GravityMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
    className={`shrink-0 ${className}`}
  >
    <rect width="32" height="32" rx="8" fill="#0F2D29" />
    <path
      d="M7 22.5 L13.5 14.5 L19 18 L25 8.5"
      stroke="#8FE3C4"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="7"
      cy="22.5"
      r="1.9"
      fill="#0F2D29"
      stroke="#8FE3C4"
      strokeWidth="1.6"
    />
    <circle
      cx="13.5"
      cy="14.5"
      r="1.9"
      fill="#0F2D29"
      stroke="#8FE3C4"
      strokeWidth="1.6"
    />
    <circle
      cx="19"
      cy="18"
      r="1.9"
      fill="#0F2D29"
      stroke="#8FE3C4"
      strokeWidth="1.6"
    />
    <circle cx="25" cy="8.5" r="2.6" fill="#8FE3C4" />
  </svg>
);

export default GravityMark;
