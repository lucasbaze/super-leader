'use client';

import React from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PieProgressProps {
  value: number; // 0-100
  size?: number; // Size in pixels
  className?: string; // Additional classes
  tooltipText?: string; // Optional tooltip text
}

export function PieProgress({ value, size = 40, className = '', tooltipText }: PieProgressProps) {
  // Ensure value is between 0-100
  const normalizedValue = Math.min(100, Math.max(0, value));

  // Calculate color based on percentage
  const getColor = (value: number) => {
    if (value >= 50) return 'fill-green-500';
    if (value >= 33) return 'fill-amber-500';
    return 'fill-yellow-500';
  };

  // Calculate the SVG path for the pie slice
  const calculatePieSlice = (percentage: number) => {
    // Special case for 100% to create a complete circle
    if (percentage === 100) {
      return `M 50,50 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0`;
    }

    // Special case for 0% to return empty path
    if (percentage === 0) {
      return '';
    }

    const radius = 50; // Using viewBox 100x100, so radius is 50
    const center = { x: 50, y: 50 };

    // Convert percentage to angle (360 degrees)
    const angle = (percentage / 100) * 360;

    // Convert angle to radians
    const angleRad = ((angle - 90) * Math.PI) / 180;

    // Calculate end point
    const endX = center.x + radius * Math.cos(angleRad);
    const endY = center.y + radius * Math.sin(angleRad);

    // Create arc flag (0 for angles ≤ 180°, 1 for angles > 180°)
    const largeArcFlag = angle <= 180 ? '0' : '1';

    // Create SVG path
    return [
      'M',
      center.x,
      center.y,
      'L',
      center.x,
      center.y - radius,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      1,
      endX,
      endY,
      'Z'
    ].join(' ');
  };

  const pieContent = (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: `${size}px`, height: `${size}px` }}>
      <svg className='size-full' viewBox='0 0 100 100'>
        {/* Background circle */}
        <circle cx='50' cy='50' r='50' className='fill-gray-200' />

        {/* Pie slice */}
        <path d={calculatePieSlice(normalizedValue)} className={getColor(normalizedValue)} />
      </svg>
    </div>
  );

  if (!tooltipText) {
    return pieContent;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className='cursor-pointer'>{pieContent}</div>
        </TooltipTrigger>
        <TooltipContent side='bottom' sideOffset={-5}>
          <p>{tooltipText || `${normalizedValue}% complete`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
