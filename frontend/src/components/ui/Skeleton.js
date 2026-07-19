import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`}>&nbsp;</div>
);

export const SkeletonCard = () => (
  <div className="glass-card p-6 space-y-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-8 w-16" />
  </div>
);

export const SkeletonTable = ({ rows = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="glass-card p-4 flex justify-between items-center">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    ))}
  </div>
);

export const SkeletonChat = () => (
  <div className="space-y-6 p-4">
    <div className="flex gap-3">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <div className="flex gap-3 justify-end">
      <div className="space-y-2 flex-1 max-w-[70%]">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
    </div>
  </div>
);

export default Skeleton;
