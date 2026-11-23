import { useId } from "react";

/*
Pseudocode:
Objective: render the InstaMall brand mark using the exact SVG provided in the design system.
Input: className (default "size-9").
Process: embed the brand SVG with its navy gradient, red cart icon, and laser glow.
Output: an inline React SVG component.
*/
export const BrandLogo = ({ className = "size-9" }: { className?: string }) => {
  const idPrefix = useId().replace(/:/g, "");
  const navyBaseId = `${idPrefix}-navy-base`;
  const platinumStrokeId = `${idPrefix}-platinum-stroke`;
  const cartFillId = `${idPrefix}-cart-fill`;
  const laserGlowId = `${idPrefix}-laser-glow`;

  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={navyBaseId}
          x1="10"
          y1="6"
          x2="110"
          y2="114"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1A2642" />
          <stop offset="55%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#060A14" />
        </linearGradient>
        <linearGradient
          id={platinumStrokeId}
          x1="20"
          y1="20"
          x2="100"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient
          id={cartFillId}
          x1="42"
          y1="47"
          x2="84"
          y2="72"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FF1A4B" />
          <stop offset="100%" stopColor="#B80024" />
        </linearGradient>
        <radialGradient id={laserGlowId} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FF0033" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FF0033" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect
        x="4"
        y="4"
        width="112"
        height="112"
        rx="30"
        fill={`url(#${navyBaseId})`}
        stroke="#FF0033"
        strokeOpacity="0.55"
        strokeWidth="2.5"
      />
      <circle cx="60" cy="60" r="36" fill={`url(#${laserGlowId})`} />
      <rect
        x="18"
        y="18"
        width="84"
        height="84"
        rx="23"
        fill="#0B1120"
        fillOpacity="0.72"
        stroke={`url(#${platinumStrokeId})`}
        strokeWidth="3.6"
      />
      <circle cx="84.5" cy="34.5" r="4.2" fill="#FF0033" />
      <circle cx="84.5" cy="34.5" r="7.2" fill="#FF0033" fillOpacity="0.22" />
      <path
        d="M41.5 48.5H84.5C86.2 48.5 87.3 50.1 86.7 51.7L80.2 68.5C79.7 69.8 78.4 70.6 77 70.6H47L41.5 48.5Z"
        fill={`url(#${cartFillId})`}
      />
      <path
        d="M51 55.8H77.5"
        stroke="#0B1120"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M53 62.6H74.5"
        stroke="#0B1120"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M29 41.5H37.2C38.8 41.5 40.2 42.6 40.6 44.1L47.8 73.5C48.2 75 49.5 76 51 76H77"
        stroke={`url(#${platinumStrokeId})`}
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="51.5" cy="84" r="4.8" fill="#F8FAFC" />
      <circle cx="51.5" cy="84" r="2.1" fill="#FF0033" />
      <circle cx="74" cy="84" r="4.8" fill="#F8FAFC" />
      <circle cx="74" cy="84" r="2.1" fill="#FF0033" />
    </svg>
  );
};
