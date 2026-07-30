'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2.5 shadow-sm">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-1/3 mt-3" />
    </div>
  );
}

export function ExpenseItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-16 ml-4" />
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2 shadow-sm">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}
