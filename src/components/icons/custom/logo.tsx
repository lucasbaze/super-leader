import * as React from 'react';

import { IconProps } from '../types';

export const Logo = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 48, strokeWidth = 30, className, ...props }, ref) => {
    return (
      <>
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox='0 0 581 581'
          className={className}
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          {...props}>
          <g clipPath='url(#clip0_161_5628)'>
            <path
              d='M328 38.9711L489.58 132.26C512.785 145.657 527.08 170.417 527.08 197.212V383.788C527.08 410.583 512.785 435.343 489.58 448.74L328 542.029C304.795 555.426 276.205 555.426 253 542.029L91.4196 448.74C68.2145 435.343 53.9196 410.583 53.9196 383.788V197.212C53.9196 170.417 68.2145 145.657 91.4196 132.26L253 38.9711C276.205 25.5737 304.795 25.5737 328 38.9711Z'
              stroke={color}
              strokeWidth={strokeWidth}
            />
          </g>
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
      </>
    );
  }
);

Logo.displayName = 'OneRing';
