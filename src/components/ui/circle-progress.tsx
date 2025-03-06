'use client';

import React from 'react';

interface CircleProgressProps {
  value: number; // 0-100
  size?: number; // Size in pixels
  className?: string; // Additional classes
}

export function CircleProgress({ value, size = 40, className = '' }: CircleProgressProps) {
  // Ensure value is between 0-100
  const normalizedValue = Math.min(100, Math.max(0, value));

  // Calculate the height of the filled portion
  const fillHeight = `${normalizedValue}%`;

  return (
    <div
      className={`relative overflow-hidden rounded-full ${className} bg-slate-300`}
      style={{
        width: `${size}px`,
        height: `${size}px`
      }}>
      <div
        className='absolute inset-x-0 bottom-0 bg-gradient-to-r from-primary to-blue-500 transition-height duration-300 ease-in-out'
        style={{
          height: fillHeight
        }}
      />
    </div>
  );
}
