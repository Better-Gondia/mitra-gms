import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={40}
      height={40}
      {...props}
    >
      <circle cx="50" cy="50" r="48" fill="white" stroke="#E0E0E0" strokeWidth="2" />
      <path
        d="M35 70V55C35 45 40 40 45 40C50 40 55 45 55 55V70"
        stroke="#FF5722"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M65 70V55C65 45 60 40 55 40C50 40 45 45 45 55V70"
        stroke="#29B6F6"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M45 55C45 45 50 30 55 30C60 30 65 45 65 55"
        stroke="#0D47A1"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="38" cy="45" r="5" fill="#FF5722" />
      <circle cx="72" cy="45" r="5" fill="#29B6F6" />
    </svg>
  );
}
