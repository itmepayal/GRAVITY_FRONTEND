import React from "react";


const AtlasIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M3 12h18M12 3c2.8 2.4 4.2 5.6 4.2 9s-1.4 6.6-4.2 9c-2.8-2.4-4.2-5.6-4.2-9s1.4-6.6 4.2-9Z"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);



const HarborIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="5" r="1.8" fill="currentColor" />
    <path
      d="M12 7v10M7 12h10M8 17c0 2.2 1.8 4 4 4s4-1.8 4-4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const BeaconIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3l3 6h-6l3-6Z" fill="currentColor" />
    <path d="M9 9h6l1.5 12h-9L9 9Z" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M4 8l2.2 1.2M20 8l-2.2 1.2M4 4l2.6 2M20 4l-2.6 2"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const NorthwindIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 6l2.5 6-2.5 6-2.5-6L12 6Z" fill="currentColor" />
  </svg>
);

const FathomIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 9c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M3 14c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

const LoopIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 12a8 8 0 0 1 8-8c3 0 5.6 1.7 7 4.2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M20 12a8 8 0 0 1-8 8c-3 0-5.6-1.7-7-4.2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M19 8.2 19 4.2 15 4.2M5 15.8 5 19.8 9 19.8"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CascadeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="4" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="9" y="11" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
  </svg>
);

const MarlinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 12c4-4 9-5 12-5-1 2-1 3 0 5-3 0-8-1-12-5Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M2 12c5 1.5 12 1.5 17 0-1.5 3-3.5 5-8.5 5S3.5 15 2 12Z"
      fill="currentColor"
      opacity="0.85"
    />
    <path d="M19 12l3-2.5v5L19 12Z" fill="currentColor" />
  </svg>
);

export interface CompanyLogo {
  name: string;
  Icon: React.ElementType;
}

export const COMPANY_LOGOS: CompanyLogo[] = [
  { name: "Atlas", Icon: AtlasIcon },
  { name: "Harbor", Icon: HarborIcon },
  { name: "Beacon", Icon: BeaconIcon },
  { name: "Northwind", Icon: NorthwindIcon },
  { name: "Fathom", Icon: FathomIcon },
  { name: "Loop", Icon: LoopIcon },
  { name: "Cascade", Icon: CascadeIcon },
  { name: "Marlin", Icon: MarlinIcon },
];