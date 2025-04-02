import * as React from 'react';

import { IconProps } from '../types';

export const TwoRing = React.forwardRef<SVGSVGElement, IconProps>(
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
          d='M308 100.424L446.361 180.307C457.19 186.559 463.861 198.113 463.861 210.618V370.383C463.861 382.887 457.19 394.441 446.361 400.693L308 480.576C297.171 486.828 283.829 486.828 273 480.576L134.639 400.693C123.81 394.441 117.139 382.887 117.139 370.382V210.618C117.139 198.113 123.81 186.559 134.639 180.307L273 100.424C283.829 94.172 297.171 94.172 308 100.424Z'
          stroke={color}
          strokeWidth={strokeWidth}
        />
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

TwoRing.displayName = 'TwoRing';
