'use client';

import { useEffect, useState } from 'react';

interface TypingTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export function TypingText({ text, delay = 50, className = '' }: TypingTextProps) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let currentIndex = 0;
    // Reset display text when text prop changes
    setDisplayText('');

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay]);

  return <div className={className}>{displayText}</div>;
}
