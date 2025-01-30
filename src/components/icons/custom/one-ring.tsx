import * as React from 'react';

import { IconProps } from '../types';

export const OneRing = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24, strokeWidth = 1.5, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns='http://www.w3.org/2000/svg'
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
        className={className}
        {...props}>
        <circle cx='12' cy='12' r='3' />
      </svg>
    );
  }
);

OneRing.displayName = 'OneRing';
