
'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';

interface RelativeTimeProps {
  date: Date | string;
  className?: string;
}

export default function RelativeTime({ date, className }: RelativeTimeProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <span className={cn('text-xs text-muted-foreground', className)}>...</span>;
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return (
    <span className={className}>
      {formatDistanceToNowStrict(dateObj, { addSuffix: true })}
    </span>
  );
}

    