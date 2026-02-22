import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]", className)}
    >
      <defs>
        <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path 
        d="M50 0C51 30 60 40 100 50C60 60 51 70 50 100C49 70 40 60 0 50C40 40 49 30 50 0Z" 
        fill="url(#star-gradient)"
      />
      <path 
        d="M50 20C51 40 55 45 80 50C55 55 51 60 50 80C49 60 45 55 20 50C45 45 49 40 50 20Z" 
        fill="white"
        fillOpacity="0.3"
      />
      <circle cx="50" cy="50" r="2" fill="white" />
    </svg>
  );
};
