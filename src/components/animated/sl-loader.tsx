import React from 'react';

const RingsFadeLoader = () => (
  <svg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
    <g fill='none' strokeLinecap='round' strokeWidth='4'>
      <rect width='20' height='20' x='40' y='40' stroke='#555' opacity='1'>
        <animate attributeName='opacity' values='1;1;0.2;1' dur='2.4s' repeatCount='indefinite' />
      </rect>
      <rect width='40' height='40' x='30' y='30' stroke='#555' opacity='0.2'>
        <animate
          attributeName='opacity'
          values='0.2;1;0.2'
          dur='2.4s'
          repeatCount='indefinite'
          begin='0.4s'
        />
      </rect>
      <rect width='60' height='60' x='20' y='20' stroke='#555' opacity='0.2'>
        <animate
          attributeName='opacity'
          values='0.2;1;0.2'
          dur='2.4s'
          repeatCount='indefinite'
          begin='0.8s'
        />
      </rect>
    </g>
  </svg>
);

export default RingsFadeLoader;
