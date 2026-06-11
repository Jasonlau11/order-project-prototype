import React, { useState, useRef, useEffect } from 'react';
import { Plus, Clock, Users, CheckCircle, AlertCircle, ArrowRight, ChevronDown, LayoutGrid } from 'lucide-react';

interface CustomerWorkbenchProps {
  userRole: string;
  setUserRole: (role: string) => void;
  setCurrentPage: (page: string) => void;
  onNavigateToMyOrders: () => void;
  isLoggedIn?: boolean;
  requireLogin?: (action: () => void) => void;
}

export function CustomerWorkbench({ userRole, setUserRole, setCurrentPage, onNavigateToMyOrders, isLoggedIn, requireLogin }: CustomerWorkbenchProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const statusFilterMap: Record<string, string[]> = {
    '待审核': ['pending', 'rejected'],
    '推广中': ['promoting'],
    '处理中': ['signing', 'inProgress'],
    '待验收': ['accepted', 'waitingSettlement'],
  };
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const roleSwitcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleSwitcherRef.current && !roleSwitcherRef.current.contains(e.target as Node)) {
        setShowRoleSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock data
  const orderStats = { pending: 1, promoting: 3, active: 2, toVerify: 1 };
  const recentOrders = [
    { id: 1, title: 'AI智能问答系统开发', status: 'promoting', bidCount: 5, milestoneProgress: { current: 1, total: 3 } },
    { id: 2, title: '品牌VI设计', status: 'promoting', bidCount: 2, milestoneProgress: null },
    { id: 3, title: '企业管理系统开发', status: 'inProgress', bidCount: 1, milestoneProgress: { current: 3, total: 5 } },
    { id: 4, title: '官网界面改版', status: 'signing', bidCount: 1, milestoneProgress: null },
    { id: 5, title: '数据分析平台', status: 'accepted', bidCount: 1, milestoneProgress: null },
    { id: 6, title: '电商小程序开发', status: 'pending', bidCount: 0, milestoneProgress: null },
  ];
  const recentActivities = [
    { type: 'bid', text: '订单「AI智能问答系统开发」收到新报名', time: '10分钟前', from: '张工作室' },
    { type: 'milestone', text: '订单「企业管理系统开发」里程碑3已验收', time: '2小时前' },
    { type: 'deadline', text: '订单「品牌VI设计」报名截止还剩3天', time: '1天前' },
  ];

  const statusConfig: Record<string, { label: string; textVar: string; bgVar: string }> = {
    pending: { label: '待审核', textVar: 'var(--warning)', bgVar: 'var(--warning-bg)' },
    rejected: { label: '已打回', textVar: 'var(--danger)', bgVar: 'var(--danger-bg)' },
    promoting: { label: '推广中', textVar: 'var(--info)', bgVar: 'var(--info-bg)' },
    signing: { label: '协议签署中', textVar: 'var(--warning)', bgVar: 'var(--warning-bg)' },
    inProgress: { label: '交付中', textVar: 'var(--info)', bgVar: 'var(--info-bg)' },
    accepted: { label: '已验收', textVar: 'var(--success)', bgVar: 'var(--success-bg)' },
    waitingSettlement: { label: '待结算', textVar: 'var(--brand)', bgVar: 'var(--brand-subtle)' },
    settled: { label: '已结算', textVar: 'var(--success)', bgVar: 'var(--success-bg)' },
    terminated: { label: '已终止', textVar: 'var(--danger)', bgVar: 'var(--danger-bg)' },
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[20px] font-semibold" style={{ color: 'var(--text-primary)' }}>我的工作台</h1>
            <button
              onClick={() => setCurrentPage('order-square')}
              className="px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors flex items-center gap-1.5"
              style={{ color: 'var(--brand)', border: '1px solid var(--brand)' }}>
              <LayoutGrid className="w-3.5 h-3.5" />
              浏览订单广场
            </button>
            <div className="relative" ref={roleSwitcherRef}>
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors flex items-center gap-1.5"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)' }}
              >
                <span>当前：客户</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showRoleSwitcher && (
                <div
                  className="absolute top-full left-0 mt-1 rounded-lg py-1 z-50 min-w-[160px]"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-dropdown)' }}
                >
                  {[
                    { role: 'first-visit', label: '首次访问（首页）' },
                    { role: 'user', label: '切换为接单方' },
                    { role: 'browse-only', label: '切换为仅浏览' },
                  ].map(item => (
                    <button
                      key={item.role}
                      onClick={() => { setUserRole(item.role); setShowRoleSwitcher(false); }}
                      className="w-full text-left px-4 py-2 text-[13px] hover:bg-[var(--bg-hover)] transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            您有 {orderStats.pending + orderStats.promoting + orderStats.active + orderStats.toVerify} 个活跃订单
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { key: '待审核', label: '待审核', count: orderStats.pending, color: 'var(--warning)', bg: 'var(--warning-bg)' },
            { key: '推广中', label: '推广中', count: orderStats.promoting, color: 'var(--info)', bg: 'var(--info-bg)' },
            { key: '处理中', label: '处理中', count: orderStats.active, color: 'var(--brand)', bg: 'var(--brand-subtle)' },
            { key: '待验收', label: '待验收', count: orderStats.toVerify, color: 'var(--success)', bg: 'var(--success-bg)' },
          ].map(stat => (
            <div key={stat.key}
              onClick={() => setStatusFilter(statusFilter === stat.key ? null : stat.key)}
              className="rounded-lg p-4 cursor-pointer hover:-translate-y-px transition-all duration-150"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: statusFilter === stat.key ? '2px solid var(--brand)' : '1px solid var(--border-subtle)',
                boxShadow: statusFilter === stat.key ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
              }}>
              <div className="text-[24px] font-semibold mb-1" style={{ color: stat.color }}>{stat.count}</div>
              <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Quick actions + Recent orders */}
          <div className="col-span-2 space-y-6">
            {/* Quick actions */}
            <div className="rounded-lg p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>快捷发单</h3>
              <button
                onClick={() => setCurrentPage('order-publish')}
                className="w-full rounded-lg p-4 text-left transition-all duration-150 hover:-translate-y-px flex items-center gap-4"
                style={{ backgroundColor: 'var(--brand-subtle)', border: '1px solid var(--brand-ring)', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))' }}>
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>AI 智能发单</div>
                  <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>描述需求或上传文档，AI 帮您整理成完整的订单</div>
                </div>
              </button>
            </div>

            {/* Recent orders */}
            <div className="rounded-lg" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {statusFilter ? `我的订单 · ${statusFilter}` : '我的订单'}
                </h3>
                <button onClick={onNavigateToMyOrders} className="text-[12px] font-medium hover:underline" style={{ color: 'var(--brand)' }}>查看全部 →</button>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {(statusFilter
                  ? recentOrders.filter(o => statusFilterMap[statusFilter]?.includes(o.status))
                  : recentOrders
                ).map(order => {
                  const cfg = statusConfig[order.status] || { label: order.status, textVar: 'var(--text-secondary)', bgVar: 'var(--bg-subtle)' };
                  return (
                    <div key={order.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{order.title}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ color: cfg.textVar, backgroundColor: cfg.bgVar }}>{cfg.label}</span>
                          {order.bidCount > 1 && (
                            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{order.bidCount}人报名</span>
                          )}
                        </div>
                      </div>
                      {order.milestoneProgress && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${(order.milestoneProgress.current / order.milestoneProgress.total) * 100}%`, backgroundColor: 'var(--brand)' }} />
                          </div>
                          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{order.milestoneProgress.current}/{order.milestoneProgress.total}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Recent activity */}
          <div className="rounded-lg" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>近期动态</h3>
            </div>
            <div className="px-5 py-3 space-y-3">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {activity.type === 'bid' && <Users className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--info)' }} />}
                  {activity.type === 'milestone' && <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--success)' }} />}
                  {activity.type === 'deadline' && <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} />}
                  <div>
                    <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{activity.text}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
