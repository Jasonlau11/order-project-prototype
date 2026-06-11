import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** @deprecated 使用 defaultOpen 代替 */
  defaultExpanded?: boolean;
  id?: string;
  icon?: React.ReactNode;
  badge?: string;
  actions?: React.ReactNode;
  onToggle?: (id: string, expanded: boolean) => void;
}

export function CollapsibleCard({
  title,
  children,
  defaultOpen,
  defaultExpanded,
  id,
  icon,
  badge,
  actions,
  onToggle,
}: CollapsibleCardProps) {
  const initialOpen = defaultOpen !== undefined ? defaultOpen : (defaultExpanded !== undefined ? defaultExpanded : true);
  const [collapsed, setCollapsed] = useState(!initialOpen);

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onToggle && id) {
      onToggle(id, !newCollapsed);
    }
  };

  return (
    <div
      id={id}
      className="rounded-lg"
      style={{
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        transition: 'all var(--transition-fast)',
      }}
    >
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[var(--bg-hover)] rounded-t-lg transition-colors"
        style={{ transition: 'background-color var(--transition-fast)' }}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </span>
          {badge && (
            <span className="px-1.5 py-0.5 bg-[#f0f0ff] text-[#888] text-[10px] rounded">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <ChevronDown
            className="w-4 h-4 transition-transform"
            style={{
              color: 'var(--text-tertiary)',
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform var(--transition-fast)',
            }}
          />
        </div>
      </button>
      {!collapsed && (
        <div className="px-5 pb-4" style={{ color: 'var(--text-secondary)' }}>
          {children}
        </div>
      )}
    </div>
  );
}
