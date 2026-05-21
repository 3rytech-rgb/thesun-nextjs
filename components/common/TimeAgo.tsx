'use client';

import { useState, useEffect } from 'react';

interface TimeAgoProps {
  dateString: string;
  format?: 'relative' | 'full';
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }
}

function getFullDate(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const timeAgo = getRelativeTime(dateString);
  return `${dayName}, ${day} ${month} ${year}, ${timeAgo}`;
}

function getShortDate(dateString: string): string {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function TimeAgo({ dateString, format = 'relative' }: TimeAgoProps) {
  const [mounted, setMounted] = useState(false);
  const [display, setDisplay] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    if (format === 'full') {
      setDisplay(getFullDate(dateString));
    } else {
      setDisplay(getRelativeTime(dateString));
    }
  }, [dateString, format]);

  if (!mounted) {
    return <span>{getShortDate(dateString)}</span>;
  }

  return <span suppressHydrationWarning>{display}</span>;
}
