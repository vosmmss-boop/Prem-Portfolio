import React from 'react';

export const HeroSliderSkeleton: React.FC = () => (
  <div className="relative w-full h-[520px] md:h-[620px] bg-neutral-200 skeleton-shimmer overflow-hidden">
    <div className="max-w-7xl mx-auto h-full px-6 flex flex-col justify-end pb-20">
      <div className="h-4 w-32 bg-neutral-300 rounded mb-4" />
      <div className="h-10 md:h-14 w-3/4 max-w-2xl bg-neutral-300 rounded mb-4" />
      <div className="h-5 w-2/3 max-w-xl bg-neutral-300 rounded mb-6" />
      <div className="flex gap-4">
        <div className="h-12 w-44 bg-neutral-300 rounded-lg" />
        <div className="h-12 w-36 bg-neutral-300 rounded-lg" />
      </div>
    </div>
  </div>
);

export const BioSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
    <div className="lg:col-span-5">
      <div className="w-full aspect-square max-w-md mx-auto rounded-2xl bg-neutral-200 skeleton-shimmer" />
    </div>
    <div className="lg:col-span-7 space-y-4">
      <div className="h-4 w-28 bg-neutral-200 skeleton-shimmer rounded" />
      <div className="h-8 w-3/4 bg-neutral-200 skeleton-shimmer rounded" />
      <div className="h-4 w-full bg-neutral-200 skeleton-shimmer rounded" />
      <div className="h-4 w-full bg-neutral-200 skeleton-shimmer rounded" />
      <div className="h-4 w-5/6 bg-neutral-200 skeleton-shimmer rounded" />
      <div className="pt-4 grid grid-cols-2 gap-3">
        <div className="h-14 bg-neutral-200 skeleton-shimmer rounded-lg" />
        <div className="h-14 bg-neutral-200 skeleton-shimmer rounded-lg" />
      </div>
    </div>
  </div>
);

export const CardsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="h-52 bg-neutral-200 skeleton-shimmer w-full" />
        <div className="p-6 space-y-3">
          <div className="h-3 w-24 bg-neutral-200 skeleton-shimmer rounded" />
          <div className="h-6 w-5/6 bg-neutral-200 skeleton-shimmer rounded" />
          <div className="h-4 w-full bg-neutral-200 skeleton-shimmer rounded" />
          <div className="h-4 w-4/5 bg-neutral-200 skeleton-shimmer rounded" />
        </div>
      </div>
    ))}
  </div>
);

export const TimelineSkeleton: React.FC = () => (
  <div className="space-y-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex gap-6 items-start">
        <div className="w-12 h-12 rounded-full bg-neutral-200 skeleton-shimmer shrink-0" />
        <div className="flex-1 bg-white border border-neutral-200 rounded-xl p-6 space-y-3">
          <div className="h-5 w-48 bg-neutral-200 skeleton-shimmer rounded" />
          <div className="h-4 w-64 bg-neutral-200 skeleton-shimmer rounded" />
          <div className="h-4 w-full bg-neutral-200 skeleton-shimmer rounded" />
        </div>
      </div>
    ))}
  </div>
);
