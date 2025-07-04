
import React from 'react';

interface TimerDisplayProps {
  timeInMs: number;
  className?: string;
}

const formatTime = (timeInMs: number): string => {
  const totalSeconds = Math.floor(timeInMs / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const milliseconds = Math.floor((timeInMs % 1000) / 10).toString().padStart(2, '0');
  return `${minutes}:${seconds}.${milliseconds}`;
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeInMs, className = '' }) => {
  return (
    <span className={`font-mono text-2xl ${className}`}>
      {formatTime(timeInMs)}
    </span>
  );
};

export default TimerDisplay;
