import React from 'react';

/** 基础闪烁骨架块 */
export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        backgroundColor: 'var(--bg-subtle)',
        backgroundImage: 'linear-gradient(90deg, var(--bg-subtle) 0%, var(--bg-hover) 50%, var(--bg-subtle) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

/** 订单卡片骨架 */
export function SkeletonCard() {
  return (
    <div className="rounded-lg p-5" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
      <div className="flex items-start gap-3">
        <SkeletonBlock className="w-1 h-20 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="w-16 h-5 rounded-full" />
            <SkeletonBlock className="w-12 h-5 rounded-full" />
          </div>
          <SkeletonBlock className="w-3/4 h-4" />
          <SkeletonBlock className="w-full h-3" />
          <SkeletonBlock className="w-1/2 h-3" />
          <div className="flex items-center gap-3 pt-2">
            <SkeletonBlock className="w-20 h-4" />
            <SkeletonBlock className="w-16 h-4" />
            <SkeletonBlock className="w-24 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** 骨架卡片网格 */
export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** 表格骨架 */
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="px-5 py-3" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <div className="flex gap-8">
          {Array.from({ length: cols }).map((_, i) => (
            <SkeletonBlock key={i} className="w-20 h-3" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-3 flex gap-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonBlock key={j} className="w-24 h-3" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** 筛选栏骨架 */
export function SkeletonFilterBar() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <SkeletonBlock className="w-24 h-8" />
      <SkeletonBlock className="w-20 h-8" />
      <SkeletonBlock className="w-16 h-8" />
    </div>
  );
}
