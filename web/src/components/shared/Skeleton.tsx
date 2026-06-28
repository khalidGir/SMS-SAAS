'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  circle?: boolean;
  /** Use shimmer sweep instead of pulse. True by default. */
  shimmer?: boolean;
}

export default function Skeleton({ className, circle, shimmer = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        shimmer ? 'animate-shimmer rounded' : 'animate-pulse bg-gray-200',
        circle && 'rounded-full',
        className,
      )}
    />
  );
}
