import { useState, useRef, useEffect } from 'react';
import { BarChart3, Wrench, FileText, ChevronUp, X, Shield } from 'lucide-react';

interface AdminEntranceProps {
  userRole?: string;
  onNavigate: (page: string) => void;
  currentPage?: string;
}

const entries = [
  {
    key: 'operation-dashboard',
    label: '运营看板',
    desc: '客户/用户/订单管理',
    icon: BarChart3,
    color: 'var(--brand)',
    bg: 'var(--brand-subtle)',
  },
  {
    key: 'dev-tool-config',
    label: '工具配置',
    desc: '交付工具与资源管理',
    icon: Wrench,
    color: 'var(--success)',
    bg: 'var(--success-bg)',
  },
  {
    key: 'agreement-template-config',
    label: '协议模板',
    desc: '合同模板上传与启用',
    icon: FileText,
    color: 'var(--warning)',
    bg: '#fef3c7',
  },
];

export function AdminEntrance({ userRole, onNavigate, currentPage }: AdminEntranceProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOperationPage = ['operation-dashboard', 'dev-tool-config', 'agreement-template-config'].includes(
    currentPage ?? ''
  );

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* 展开面板 */}
      {open && (
        <div className="mb-1 w-56 bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* 面板头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
              <span className="text-xs text-[#555]" style={{ letterSpacing: '0.02em' }}>
                运营端入口
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-0.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[#aaa]" />
            </button>
          </div>

          {/* 入口列表 */}
          <div className="py-1.5">
            {entries.map((entry) => {
              const Icon = entry.icon;
              const isActive = currentPage === entry.key;
              return (
                <button
                  key={entry.key}
                  onClick={() => {
                    onNavigate(entry.key);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 text-left"
                  style={isActive ? { backgroundColor: entry.bg } : {}}
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: isActive ? entry.bg : '#f5f5f7' }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: isActive ? entry.color : 'var(--text-tertiary)' }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-sm leading-tight"
                      style={{ color: isActive ? entry.color : '#222' }}
                    >
                      {entry.label}
                    </div>
                    <div className="text-[11px] text-[#999] mt-0.5 truncate">{entry.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 底部标注 */}
          <div className="px-4 py-2 border-t border-gray-50">
            <span className="text-[10px] text-[#bbb]">仅限内部使用 · 临时入口</span>
          </div>
        </div>
      )}

      {/* 触发按钮 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95"
        style={{
          backgroundColor: isOperationPage ? 'var(--brand)' : '#1a1a2e',
          color: '#fff',
        }}
        title="运营端入口"
      >
        <Shield className="w-4 h-4" />
        <span className="text-sm">运营端</span>
        <ChevronUp
          className="w-3.5 h-3.5 transition-transform duration-200"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(180deg)' }}
        />
      </button>
    </div>
  );
}
