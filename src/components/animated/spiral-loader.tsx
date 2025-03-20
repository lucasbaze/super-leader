import React from 'react';

const SpiralLoader = () => (
  <svg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
    <g fill='none' stroke='#555' strokeWidth='4'>
      <rect width='20' height='20' x='40' y='40' rx='4' strokeDasharray='80' strokeDashoffset='80'>
        <animate
          attributeName='stroke-dashoffset'
          values='80;0;0;0;0;80'
          dur='4s'
          repeatCount='indefinite'
        />
      </rect>
      <rect
        width='40'
        height='40'
        x='30'
        y='30'
        rx='6'
        strokeDasharray='160'
        strokeDashoffset='160'>
        <animate
          attributeName='stroke-dashoffset'
          values='160;0;0;160'
          dur='4s'
          repeatCount='indefinite'
        />
      </rect>
      <rect
        width='60'
        height='60'
        x='20'
        y='20'
        rx='6'
        strokeDasharray='240'
        strokeDashoffset='240'>
        <animate
          attributeName='stroke-dashoffset'
          values='240;0;240'
          dur='4s'
          repeatCount='indefinite'
        />
      </rect>
    </g>
  </svg>
);

export default SpiralLoader;
