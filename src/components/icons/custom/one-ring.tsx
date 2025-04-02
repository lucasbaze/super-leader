import * as React from 'react';

import { IconProps } from '../types';

export const OneRing = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24, strokeWidth = 30, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox='0 0 581 581'
        className={className}
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        {...props}>
        <path
          d='M293 172.764L391.212 229.467C392.759 230.36 393.712 232.011 393.712 233.797V347.203C393.712 348.989 392.759 350.64 391.212 351.533L293 408.236C291.453 409.129 289.547 409.129 288 408.236L189.788 351.533C188.241 350.64 187.288 348.989 187.288 347.203V233.797C187.288 232.011 188.241 230.36 189.788 229.467L288 172.764C289.547 171.871 291.453 171.871 293 172.764Z'
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <defs>
          <clipPath id='clip0_161_5628'>
            <rect width='581' height='581' fill='white' />
          </clipPath>
        </defs>
      </svg>
    );
  }
);

OneRing.displayName = 'OneRing';
