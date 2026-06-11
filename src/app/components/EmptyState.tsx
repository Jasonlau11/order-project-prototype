import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, primaryAction, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 opacity-40">{icon}</div>}
      {!icon && (
        <div className="mb-4 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-hover)' }}>
          <svg className="w-6 h-6" style={{ color: 'var(--text-tertiary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      )}
      <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && <p className="text-[13px] max-w-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>{description}</p>}
      <div className="flex items-center gap-3">
        {primaryAction && (
          <button onClick={primaryAction.onClick} className="px-4 py-2 rounded-md text-[13px] font-medium transition-colors" style={{ backgroundColor: 'var(--brand)', color: '#fff' }}>
            {primaryAction.label}
          </button>
        )}
        {secondaryAction && (
          <button onClick={secondaryAction.onClick} className="px-4 py-2 rounded-md text-[13px] font-medium transition-colors" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

/** 搜索无结果的空状态 */
export function EmptySearch({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      title={`未找到"${query}"相关结果`}
      description="尝试其他关键词或清除筛选条件"
      primaryAction={{ label: '清除筛选', onClick: onClear }}
    />
  );
}

/** 首次使用引导空状态 */
export function EmptyFirstUse({ title, description, actionLabel, onAction }: {
  title: string; description: string; actionLabel: string; onAction: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      primaryAction={{ label: actionLabel, onClick: onAction }}
    />
  );
}
