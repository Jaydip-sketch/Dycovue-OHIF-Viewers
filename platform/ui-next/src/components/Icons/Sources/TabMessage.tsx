import React from 'react';
import type { IconProps } from '../types';

export const TabMessage = (props: IconProps) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g
      fill="none"
      fillRule="evenodd"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Main message bubble */}
      <path d="M4 4.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H7l-4 3v-3H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 4.5z" />
      {/* Three dots inside bubble */}
      <path d="M8 10.5h.01M11 10.5h.01M14 10.5h.01" />
    </g>
  </svg>
);

export default TabMessage;
