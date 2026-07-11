import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown, LayoutGrid, ClipboardList, BarChart3, Zap, Bell, ReceiptText, Plus, Menu, X } from 'lucide-react';

interface GlobalNavProps {
  userRole?: string;
  isLoggedIn: boolean;
  userInfo?: {
    nickname: string;
    avatar: string;
  };
  currentPage?: string;
  onLogin: () => void;
  onLogout: () => void;
  onNavigateToProfile: () => void;
  onNavigateTo?: (page: string) => void;
  onNavigateToMyOrders?: () => void;
  onNavigateToMyBills?: () => void;
  onNavigateToMessages?: () => void;
  unreadMessageCount?: number;
  onPublishOrder?: () => void;
}

export function GlobalNav({
  userRole,
  isLoggedIn,
  userInfo,
  currentPage = 'order',
  onLogin,
  onLogout,
  onNavigateToProfile,
  onNavigateTo,
  onNavigateToMyOrders,
  onNavigateToMyBills,
  onNavigateToMessages,
  unreadMessageCount = 0,
  onPublishOrder,
}: GlobalNavProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showFullNav = isLoggedIn && ['customer', 'user', 'admin'].includes(userRole ?? '');
  const showPublishButton = isLoggedIn && userRole === 'customer';

  const navItems = [
    { key: 'order', label: '订单广场', icon: LayoutGrid, action: () => onNavigateTo?.(userRole === 'customer' ? 'order-square' : 'order') },
    ...(showFullNav ? [
      { key: 'myOrders', label: '我的订单', icon: ClipboardList, action: () => onNavigateToMyOrders?.() },
      { key: 'myBills', label: '我的账单', icon: ReceiptText, action: () => onNavigateToMyBills?.() },
    ] : []),
  ];

  return (
    <>
    <header
      className="sticky top-0 z-40"
      style={{
        height: '56px',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <button
            onClick={() => onNavigateTo?.('order')}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center transition-colors shadow-[var(--market-shadow-card)]"
              style={{ backgroundColor: 'var(--market-brand)', transition: 'background-color var(--transition-fast)' }}
            >
              <Zap className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[14px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>
                CSDN Order
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                技术服务市场
              </span>
            </div>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
            className="md:hidden p-2 rounded-md transition-all hover:text-[var(--text-primary)]"
            style={{ color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => {
              const isActive = currentPage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={item.action}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${!isActive ? 'hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]' : ''}`}
                  style={{
                    backgroundColor: isActive ? 'var(--market-brand-subtle)' : 'transparent',
                    color: isActive ? 'var(--market-brand)' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <item.icon className="w-[15px] h-[15px]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right area */}
        <div className="flex items-center gap-2">
          {/* Stats badge */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium"
            style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}
          >
            <BarChart3 className="w-3 h-3" />
            <span>22 个活跃订单</span>
          </div>

          {isLoggedIn && userInfo ? (
            <>
              {/* Bell icon */}
              <button
                onClick={onNavigateToMessages}
                aria-label="消息中心"
                className={`relative p-2 rounded-md transition-all ${currentPage !== 'messageCenter' ? 'hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]' : ''}`}
                style={{
                  backgroundColor: currentPage === 'messageCenter' ? 'var(--bg-selected)' : 'transparent',
                  color: currentPage === 'messageCenter' ? 'var(--brand)' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadMessageCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-white flex items-center justify-center leading-none font-semibold"
                    style={{ backgroundColor: 'var(--danger)', fontSize: '10px' }}
                  >
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                  </span>
                )}
              </button>

              {showPublishButton && (
                <button
                  onClick={() => onNavigateTo?.('order')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-white text-[13px] font-semibold rounded-full transition-all hover:-translate-y-px hover:bg-[var(--market-brand-hover)]"
                  style={{ backgroundColor: 'var(--market-brand)', transition: 'all var(--transition-fast)' }}
                >
                  <LayoutGrid className="w-[15px] h-[15px]" />
                  <span>我的工作台</span>
                </button>
              )}

              {/* Avatar dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-all hover:bg-[var(--bg-hover)]"
                  style={{ color: 'var(--text-primary)', transition: 'all var(--transition-fast)' }}
                >
                  <div
                    className="w-[28px] h-[28px] rounded-full flex items-center justify-center overflow-hidden text-white text-[11px] font-semibold"
                    style={{ backgroundColor: 'var(--brand)' }}
                  >
                    {userInfo.avatar ? (
                      <img src={userInfo.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{userInfo.nickname?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <span className="text-[13px] max-w-[80px] truncate hidden sm:block">{userInfo.nickname}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} style={{ color: 'var(--text-tertiary)', transition: 'transform var(--transition-fast)' }} />
                </button>

                {showMenu && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-lg border py-1.5 z-50"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      boxShadow: 'var(--shadow-dropdown)',
                      animation: 'navFadeIn 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {/* User info header */}
                    <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{userInfo.nickname}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>OPC Order 会员</div>
                    </div>
                    {/* Menu items */}
                    <div className="py-0.5">
                      {[
                        { icon: Settings, label: '个人设置', action: () => { onNavigateToProfile(); setShowMenu(false); } },
                        { icon: ReceiptText, label: '我的账单', action: () => { onNavigateToMyBills?.(); setShowMenu(false); } },
                        ...(userRole === 'admin' ? [
                          { icon: BarChart3, label: '运营看板', action: () => { onNavigateTo?.('operation-dashboard'); setShowMenu(false); } },
                        ] : []),
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={item.action}
                          className="w-full px-4 py-2 text-[13px] flex items-center gap-3 transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                          style={{ color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
                        >
                          <item.icon className="w-[15px] h-[15px]" style={{ color: 'var(--text-tertiary)' }} />
                          {item.label}
                        </button>
                      ))}
                    </div>
                    {/* Logout */}
                    <div className="pt-0.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        onClick={() => { onLogout(); setShowMenu(false); }}
                        className="w-full px-4 py-2 text-[13px] flex items-center gap-3 transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                        style={{ color: 'var(--text-tertiary)', transition: 'all var(--transition-fast)' }}
                      >
                        <LogOut className="w-[15px] h-[15px]" />
                        退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLogin}
                className="px-4 py-1.5 text-[13px] font-medium transition-all rounded-md hover:text-[var(--text-primary)]"
                style={{ color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
              >
                登录
              </button>
              <button
                onClick={onLogin}
                className="px-4 py-1.5 text-white text-[13px] font-semibold rounded-full transition-all hover:-translate-y-px hover:bg-[var(--market-brand-hover)]"
                style={{ backgroundColor: 'var(--market-brand)', transition: 'all var(--transition-fast)' }}
              >
                免费注册
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* ── Mobile drawer menu ────────────────────────────────────────────────── */}
    {mobileMenuOpen && (
      <>
        {/* Overlay */}
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Slide-in drawer */}
        <div
          className="md:hidden fixed top-0 left-0 bottom-0 w-72 z-50 bg-white shadow-2xl flex flex-col"
          style={{ animation: 'slideInLeft 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-[30px] h-[30px] rounded-md flex items-center justify-center"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                <Zap className="w-[15px] h-[15px] text-white" />
              </div>
              <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                OPC Order
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="关闭菜单"
              className="p-1.5 rounded-md transition-all hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User profile / login section */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {isLoggedIn && userInfo ? (
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-[40px] h-[40px] rounded-full flex items-center justify-center overflow-hidden text-white text-[14px] font-semibold shrink-0"
                    style={{ backgroundColor: 'var(--brand)' }}
                  >
                    {userInfo.avatar ? (
                      <img src={userInfo.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{userInfo.nickname?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{userInfo.nickname}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>OPC Order 会员</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-0.5">
                  {[
                    { icon: Settings, label: '个人设置', action: () => { onNavigateToProfile(); setMobileMenuOpen(false); } },
                    { icon: ReceiptText, label: '我的账单', action: () => { onNavigateToMyBills?.(); setMobileMenuOpen(false); } },
                    ...(userRole === 'admin' ? [
                      { icon: BarChart3, label: '运营看板', action: () => { onNavigateTo?.('operation-dashboard'); setMobileMenuOpen(false); } },
                    ] : []),
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-[13px] transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                      style={{ color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
                    >
                      <item.icon className="w-[15px] h-[15px]" style={{ color: 'var(--text-tertiary)' }} />
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-[13px] transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    style={{ color: 'var(--text-tertiary)', transition: 'all var(--transition-fast)' }}
                  >
                    <LogOut className="w-[15px] h-[15px]" />
                    退出登录
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { onLogin(); setMobileMenuOpen(false); }}
                  className="flex-1 px-4 py-2 text-[13px] font-medium transition-all rounded-md border"
                  style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)', transition: 'all var(--transition-fast)' }}
                >
                  登录
                </button>
                <button
                  onClick={() => { onLogin(); setMobileMenuOpen(false); }}
                  className="flex-1 px-4 py-2 text-white text-[13px] font-semibold rounded-md transition-all"
                  style={{ backgroundColor: 'var(--brand)', transition: 'all var(--transition-fast)' }}
                >
                  免费注册
                </button>
              </div>
            )}
          </div>

          {/* Navigation items */}
          <nav className="flex-1 py-3 px-3 overflow-y-auto">
            {navItems.map(item => {
              const isActive = currentPage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { item.action(); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-all mb-1 ${!isActive ? 'hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]' : ''}`}
                  style={{
                    backgroundColor: isActive ? 'var(--market-brand-subtle)' : 'transparent',
                    color: isActive ? 'var(--market-brand)' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Drawer footer with quick actions */}
          <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {showPublishButton && (
              <button
                onClick={() => { onPublishOrder?.(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white text-[14px] font-semibold rounded-md transition-all mb-2"
                style={{ backgroundColor: 'var(--brand)', transition: 'all var(--transition-fast)' }}
              >
                <Plus className="w-[16px] h-[16px]" />
                发布订单
              </button>
            )}
            <button
              onClick={() => { onNavigateToMessages?.(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-all"
              style={{
                backgroundColor: currentPage === 'messageCenter' ? 'var(--bg-selected)' : 'transparent',
                color: currentPage === 'messageCenter' ? 'var(--brand)' : 'var(--text-secondary)',
              }}
            >
              <Bell className="w-[18px] h-[18px]" />
              <span>消息中心</span>
              {unreadMessageCount > 0 && (
                <span
                  className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-white flex items-center justify-center text-[11px] font-semibold"
                  style={{ backgroundColor: 'var(--danger)' }}
                >
                  {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </>
    )}
    </>
  );
}
