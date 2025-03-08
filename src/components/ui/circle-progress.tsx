'use client';

import React from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CircleProgressProps {
  value: number; // 0-100
  size?: number; // Size in pixels
  className?: string; // Additional classes
  tooltipText?: string; // Optional tooltip text
  strokeWidth?: number; // Optional stroke width
}

export function CircleProgress({
  value,
  size = 40,
  className = '',
  tooltipText,
  strokeWidth = 10
}: CircleProgressProps) {
  // Ensure value is between 0-100
  const normalizedValue = Math.min(100, Math.max(0, value));

  // Calculate circle properties
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  // Calculate color based on percentage
  const getColor = (value: number) => {
    if (value >= 66) return 'text-green-500';
    if (value >= 33) return 'text-amber-500';
    return 'text-yellow-500';
  };

  // Calculate stroke color for the circle
  const getStrokeColor = (value: number) => {
    if (value >= 50) return 'stroke-green-500';
    if (value >= 25) return 'stroke-amber-500';
    return 'stroke-yellow-500';
  };

  const circleContent = (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: `${size}px`, height: `${size}px` }}>
      {/* Background circle */}
      <svg className='absolute size-full' viewBox='0 0 100 100'>
        <circle
          cx='50'
          cy='50'
          r={radius}
          fill='transparent'
          stroke='currentColor'
          strokeWidth={strokeWidth}
          className='text-gray-200'
        />
      </svg>

      {/* Foreground circle */}
      <svg className='absolute size-full -rotate-90' viewBox='0 0 100 100'>
        <circle
          cx='50'
          cy='50'
          r={radius}
          fill='transparent'
          stroke='currentColor'
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
          className={getStrokeColor(normalizedValue)}
        />
      </svg>

      {/* Percentage text */}
      {/* <div className={cn('text-sm font-bold', getColor(normalizedValue))}>{normalizedValue}%</div> */}
    </div>
  );

  if (!tooltipText) {
    return circleContent;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className='cursor-pointer'>{circleContent}</div>
        </TooltipTrigger>
        <TooltipContent side='bottom' sideOffset={-5}>
          <p>{tooltipText || `${normalizedValue}% complete`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
