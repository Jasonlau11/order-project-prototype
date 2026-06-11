import { Home, BookOpen, FileDown, GraduationCap, MessageSquare, Folder, Users, History, Settings, HelpCircle, Video, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

interface SidebarProps {
  onNavigate: (pageId: string) => void;
  currentPage: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: '首页', icon: <Home className="w-4 h-4" /> },
  { id: 'blog', label: '博客', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'download', label: '下载', icon: <FileDown className="w-4 h-4" /> },
  { id: 'learn', label: '学习', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'community', label: '社区', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'meeting', label: '会议', icon: <Video className="w-4 h-4" /> },
  { id: 'order', label: '订单广场', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'operation-dashboard', label: '运营看板', icon: <LayoutDashboard className="w-4 h-4" /> },
];

export function Sidebar({ onNavigate, currentPage }: SidebarProps) {
  return (
    <aside
      className="w-[200px] h-screen bg-white flex-shrink-0"
      style={{ borderRight: '1px solid var(--border-subtle)' }}
    >
      <nav className="pt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="w-full flex items-center gap-3 px-5 py-2.5 relative text-[13px] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--surface-hover)]"
            aria-label={`导航到${item.label}`}
            style={{
              backgroundColor: currentPage === item.id ? 'var(--surface-selected)' : 'transparent',
              fontWeight: currentPage === item.id ? '500' : '400',
              color: currentPage === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
                      >
            {/* Active state left bar */}
            {currentPage === item.id && (
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ backgroundColor: 'var(--brand)' }}
              />
            )}
            <div style={{ color: currentPage === item.id ? 'var(--brand)' : 'var(--text-tertiary)' }}>
              {item.icon}
            </div>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
