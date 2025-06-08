import type { SVGProps } from 'react';

export function MotorcycleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
      <path d="M12 18h.5" />
      <path d="M14.5 10.5H9.5l-.6 2.1c-.2.7.2 1.4.9 1.4h4.4c.7 0 1.1-.7.9-1.4L14.5 10.5Z" />
      <path d="M12 14V6.5" />
      <path d="m15 6.5-3.5-2-3.5 2" />
    </svg>
  );
}
