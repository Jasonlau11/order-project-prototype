import { useState } from 'react';
import { ArrowLeft, Camera, ChevronRight, Shield, Building2, Award, User, AlertTriangle, Clock, BadgeCheck } from 'lucide-react';

const BRAND = 'var(--brand)';
const orderCount = 12; // mock: actual would come from backend

type CertStatus = 'draft' | 'pending' | 'approved' | 'rejected';

interface PersonalInfoProps {
  userInfo: {
    userId: string;
    nickname: string;
    avatar: string;
    phone: string;
    email?: string;
  };
  userRole: 'customer' | 'user' | null;
  onBack: () => void;
  onUpdate: (updates: { nickname?: string; avatar?: string }) => void;
  onNavigateToSecurity: () => void;
  onNavigateToCustomerProfile: () => void;
  onNavigateToUserProfile: (mode?: 'personal' | 'company') => void;
  /** 当前客户认证状态 */
  customerCertStatus?: CertStatus;
  /** 当前用户认证状态 */
  userCertStatus?: CertStatus;
}

// 认证状态 → 徽标配置
function CertBadge({ status }: { status: CertStatus }) {
  if (status === 'approved') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--success-bg)] text-[var(--success)]">
      <BadgeCheck className="w-3 h-3" /> 已认证
    </span>
  );
  if (status === 'pending') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--warning-bg)] text-[var(--warning)]">
      <Clock className="w-3 h-3" /> 审核中
    </span>
  );
  if (status === 'rejected') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--danger-bg)] text-[var(--danger)]">
      <AlertTriangle className="w-3 h-3" /> 审核未通过
    </span>
  );
  return null;
}

export function PersonalInfo({
  userInfo,
  userRole,
  onBack,
  onUpdate,
  onNavigateToSecurity,
  onNavigateToCustomerProfile,
  onNavigateToUserProfile,
  customerCertStatus,
  userCertStatus,
}: PersonalInfoProps) {
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(userInfo.nickname);
  const [showTagRequest, setShowTagRequest] = useState(false);
  const [selectedTagRequest, setSelectedTagRequest] = useState('');
  const [tagRequestReason, setTagRequestReason] = useState('');
  const [tagRequestSubmitted, setTagRequestSubmitted] = useState(false);

  const availableTags = ['平台建设方', '官方推荐服务商', '金牌合作伙伴', '行业专家'];

  const handleSave = () => {
    onUpdate({ nickname });
    setEditing(false);
  };

  const roleLabel = userRole === 'customer' ? '客户' : userRole === 'user' ? '用户' : '访客';
  const roleBg = userRole === 'customer' ? { bg: 'var(--brand-subtle)', text: 'var(--brand)' } : { bg: 'var(--success-bg)', text: 'var(--success)' };

  return (
    <div className="min-h-full bg-[var(--bg-root)] flex flex-col">

      {/* ── Hero — v4.0: clean dark, no decorations ──────────────────────── */}
      <div className="relative" style={{ background: 'var(--bg-hero)' }}>
        <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-10">
          <button onClick={onBack} className="flex items-center gap-1.5 mb-5 text-[13px] transition-all" style={{ color: 'var(--text-inverse-muted)', transition: 'all var(--transition-fast)' }}>
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20"
                style={{ backgroundColor: 'var(--brand-subtle)' }}>
                {userInfo.avatar
                  ? <img src={userInfo.avatar} alt="" className="w-full h-full object-cover" />
                  : <span className="text-xl text-white">{userInfo.nickname.charAt(0)}</span>}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                <Camera className="w-3 h-3 text-[var(--text-secondary)]" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg text-white">{userInfo.nickname}</span>
                {userRole && (
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                    {roleLabel}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/45">ID: {userInfo.userId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto w-full px-6 py-6 space-y-4">

        {/* Basic info card */}
        <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
          <div className="h-[3px]" style={{ backgroundColor: BRAND }} />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)' }}>
                <User className="w-4 h-4" style={{ color: BRAND }} />
              </div>
              <span className="text-sm text-[var(--text-secondary)]">基本信息</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)]">
              <span className="text-sm text-[var(--text-secondary)]">昵称</span>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input value={nickname} onChange={e => setNickname(e.target.value)}
                    className="px-3 py-1.5 border border-[var(--border-default)] rounded-lg text-sm outline-none focus:border-[var(--brand)] transition-colors" />
                  <button onClick={handleSave} className="px-3 py-1.5 text-white text-xs rounded-lg" style={{ backgroundColor: BRAND }}>保存</button>
                  <button onClick={() => { setEditing(false); setNickname(userInfo.nickname); }}
                    className="px-3 py-1.5 text-[var(--text-secondary)] text-xs hover:text-[var(--text-secondary)] transition-colors">取消</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--text-primary)]">{userInfo.nickname}</span>
                  <button onClick={() => setEditing(true)} className="text-xs hover:underline" style={{ color: BRAND }}>编辑</button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)]">
              <span className="text-sm text-[var(--text-secondary)]">手机号</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">{userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>
                <button onClick={onNavigateToSecurity} className="text-xs hover:underline" style={{ color: BRAND }}>修改</button>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-[var(--text-secondary)]">邮箱</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">{userInfo.email || '未绑定'}</span>
                {userInfo.email ? (
                  <button onClick={onNavigateToSecurity} className="text-xs hover:underline" style={{ color: BRAND }}>更换</button>
                ) : (
                  <button onClick={onNavigateToSecurity} className="text-xs hover:underline" style={{ color: BRAND }}>去绑定</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feature entries card */}
        <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
          <div className="h-[3px]" style={{ backgroundColor: 'var(--success)' }} />

          {/* 账号与安全 */}
          <button onClick={onNavigateToSecurity}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-root)] transition-colors border-b border-[var(--border-subtle)] group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--success-bg)' }}>
                <Shield className="w-4 h-4" style={{ color: 'var(--success)' }} />
              </div>
              <div className="text-left">
                <div className="text-sm text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">账号与安全</div>
                <div className="text-xs text-[#bbb] mt-0.5">管理您的登录密码和安全设置</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-disabled)] group-hover:text-[var(--brand)] transition-colors group-hover:translate-x-0.5 transform" />
          </button>

          {/* 企业资质认证（客户） */}
          {userRole === 'customer' && (
            <>
              {customerCertStatus === 'rejected' && (
                <div className="mx-5 mt-4 mb-1 px-4 py-3 bg-[var(--danger-bg)] border-[var(--danger-border)] rounded-md flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[var(--danger)] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm text-[var(--danger)]">企业资质认证未通过审核</div>
                    <div className="text-xs text-[var(--danger)]/80 mt-0.5">请点击下方入口，根据审核意见补充信息并重新提交</div>
                  </div>
                </div>
              )}
              <button onClick={onNavigateToCustomerProfile}
                className={`w-full px-5 py-4 flex items-center justify-between transition-colors border-b border-[var(--border-subtle)] group ${
                  customerCertStatus === 'rejected' ? 'hover:bg-[var(--danger-bg)]/50' : 'hover:bg-[var(--bg-root)]'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: customerCertStatus === 'rejected' ? 'var(--danger-bg)' : 'var(--brand-subtle)' }}>
                    <Building2 className="w-4 h-4" style={{ color: customerCertStatus === 'rejected' ? 'var(--danger)' : BRAND }} />
                  </div>
                  <div className="text-left">
                    <div className={`text-sm transition-colors group-hover:text-[var(--brand)] ${customerCertStatus === 'rejected' ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>
                      企业资质认证
                    </div>
                    <div className="text-xs text-[#bbb] mt-0.5">
                      {customerCertStatus === 'rejected' ? '审核未通过，点击补充信息重新提交' :
                       customerCertStatus === 'pending' ? '审核中 · 预计1-3个工作日' :
                       customerCertStatus === 'approved' ? '北京示例科技有限公司 · 已认证' :
                       '完善企业信息，提升发单可信度'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {customerCertStatus && customerCertStatus !== 'draft' && <CertBadge status={customerCertStatus} />}
                  <ChevronRight className="w-4 h-4 text-[var(--text-disabled)] group-hover:text-[var(--brand)] transition-colors group-hover:translate-x-0.5 transform" />
                </div>
              </button>
            </>
          )}

          {/* 能力与资质（用户） */}
          {userRole === 'user' && (
            <>
              {userCertStatus === 'rejected' && (
                <div className="mx-5 mt-4 mb-1 px-4 py-3 bg-[var(--danger-bg)] border-[var(--danger-border)] rounded-md flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[var(--danger)] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm text-[var(--danger)]">个人能力与资质认证未通过审核</div>
                    <div className="text-xs text-[var(--danger)]/80 mt-0.5">请点击下方入口，根据审核意见补充信息并重新提交</div>
                  </div>
                </div>
              )}
              <button onClick={onNavigateToUserProfile}
                className={`w-full px-5 py-4 flex items-center justify-between transition-colors group ${
                  userCertStatus === 'rejected' ? 'hover:bg-[var(--danger-bg)]/50' : 'hover:bg-[var(--bg-root)]'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: userCertStatus === 'rejected' ? 'var(--danger-bg)' : '#fdf2e3' }}>
                    <Award className="w-4 h-4" style={{ color: userCertStatus === 'rejected' ? 'var(--danger)' : 'var(--warning)' }} />
                  </div>
                  <div className="text-left">
                    <div className={`text-sm transition-colors group-hover:text-[var(--brand)] ${userCertStatus === 'rejected' ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>
                      能力与资质
                    </div>
                    <div className="text-xs text-[#bbb] mt-0.5">
                      {userCertStatus === 'rejected' ? '审核未通过，点击补充信息重新提交' :
                       userCertStatus === 'pending' ? '审核中 · 预计1-3个工作日' :
                       userCertStatus === 'approved' ? '熟悉前端开发，掌握 React 和 Vue 等主流框架...' :
                       '展示技能，吸引更多优质订单'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {userCertStatus && userCertStatus !== 'draft' && <CertBadge status={userCertStatus} />}
                  <ChevronRight className="w-4 h-4 text-[var(--text-disabled)] group-hover:text-[var(--brand)] transition-colors group-hover:translate-x-0.5 transform" />
                </div>
              </button>
            </>
          )}
        </div>

        {/* 信用评分卡（用户角色） */}
        {userRole === 'user' && (
          <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
            <div className="h-[3px]" style={{ backgroundColor: 'var(--trust)' }} />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)' }}>
                  <Shield className="w-4 h-4" style={{ color: 'var(--trust)' }} />
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">信用评分</span>
                <span className="text-xs text-[var(--text-secondary)]">基于系统数据自动计算</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] font-semibold" style={{ color: 'var(--trust)' }}>92</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>基于 {orderCount} 单</span>
                  <span className="ml-2 px-2 py-0.5 rounded-sm text-xs font-semibold" style={{ color: 'var(--trust)', backgroundColor: 'var(--credit-elite-bg)' }}>精英</span>
                </div>
              </div>
              {/* 样本量信息 */}
              <div className="text-[11px] mt-1 mb-3" style={{ color: 'var(--text-tertiary)' }}>
                高可信 · 基于 22 单 48 个里程碑
              </div>
              {/* 平台均值比较 */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>平台均值</span>
                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>超过 94% 的用户</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div className="h-1.5 rounded-full" style={{ width: '94%', backgroundColor: 'var(--trust)' }} />
                </div>
                <div className="flex justify-between text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  <span>0</span>
                  <span>平台均值 78</span>
                  <span>100</span>
                </div>
              </div>
              {/* 冷启动说明 */}
              {orderCount < 5 && (
                <div className="mt-3 rounded-md p-2.5 flex items-start gap-2" style={{ backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
                  <span className="text-[11px]" style={{ color: 'var(--info)' }}>
                    信用分基于少于 5 单数据，可能不完全准确。完成更多订单后分数会更稳定。
                  </span>
                </div>
              )}
              {/* 5 维度网格 */}
              <div className="grid grid-cols-5 gap-2 text-xs">
                {([
                  { label: '按时交付率', value: '96%', trend: 2 },
                  { label: '一次通过率', value: '92%', trend: -1 },
                  { label: '协议履约率', value: '100%', trend: 0 },
                  { label: '响应速度', value: '<2小时', trend: 5 },
                  { label: '复购率', value: '35%', trend: 3 },
                ] as const).map(dim => (
                  <div key={dim.label} className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <div className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>{dim.label}</div>
                    <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{dim.value}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px]" style={{ color: dim.trend > 0 ? 'var(--success)' : dim.trend < 0 ? 'var(--danger)' : 'var(--text-tertiary)' }}>
                        {dim.trend > 0 ? '↑' : dim.trend < 0 ? '↓' : '→'} {Math.abs(dim.trend)}%
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>vs 上月</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 客户信用评分卡（客户角色） */}
        {userRole === 'customer' && (
          <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
            <div className="h-[3px]" style={{ backgroundColor: 'var(--trust)' }} />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)' }}>
                  <Shield className="w-4 h-4" style={{ color: 'var(--trust)' }} />
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">客户信用评分</span>
                <span className="text-xs text-[var(--text-secondary)]">基于系统数据自动计算</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] font-semibold" style={{ color: 'var(--trust)' }}>94</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>基于 {orderCount} 单</span>
                  <span className="ml-2 px-2 py-0.5 rounded-sm text-xs font-semibold" style={{ color: 'var(--trust)', backgroundColor: 'var(--credit-elite-bg)' }}>精英</span>
                </div>
              </div>
              {/* 样本量信息 */}
              <div className="text-[11px] mt-1 mb-3" style={{ color: 'var(--text-tertiary)' }}>
                高可信 · 基于 18 单 32 个里程碑
              </div>
              {/* 平台均值比较 */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>平台均值</span>
                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>超过 94% 的用户</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div className="h-1.5 rounded-full" style={{ width: '94%', backgroundColor: 'var(--trust)' }} />
                </div>
                <div className="flex justify-between text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  <span>0</span>
                  <span>平台均值 78</span>
                  <span>100</span>
                </div>
              </div>
              {/* 冷启动说明 */}
              {orderCount < 5 && (
                <div className="mt-3 rounded-md p-2.5 flex items-start gap-2" style={{ backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
                  <span className="text-[11px]" style={{ color: 'var(--info)' }}>
                    信用分基于少于 5 单数据，可能不完全准确。完成更多订单后分数会更稳定。
                  </span>
                </div>
              )}
              {/* 5 维度网格 */}
              <div className="grid grid-cols-5 gap-2 text-xs mb-4">
                {([
                  { label: '按时付款率', value: '96%', trend: 2 },
                  { label: '订单完成率', value: '100%', trend: 0 },
                  { label: '里程碑确认时效', value: '92%', trend: 3 },
                  { label: '纠纷率', value: '0%', trend: -5 },
                  { label: '复投率', value: '85%', trend: 4 },
                ] as const).map(dim => (
                  <div key={dim.label} className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <div className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>{dim.label}</div>
                    <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{dim.value}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px]" style={{ color: dim.trend > 0 ? 'var(--success)' : dim.trend < 0 ? 'var(--danger)' : 'var(--text-tertiary)' }}>
                        {dim.trend > 0 ? '↑' : dim.trend < 0 ? '↓' : '→'} {Math.abs(dim.trend)}%
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>vs 上月</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 认证标签 */}
        <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
          <div className="h-[3px]" style={{ backgroundColor: 'var(--warning)' }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--warning-bg)' }}>
                  <BadgeCheck className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">认证标签</span>
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>由平台统一管理</span>
              </div>
              <button
                onClick={() => setShowTagRequest(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all hover:bg-[var(--brand-subtle)]"
                style={{ color: 'var(--brand)', border: '1px solid var(--brand)' }}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                申请标签
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {userRole === 'customer' && (
                <>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: 'var(--trust)', color: 'var(--warning)', backgroundColor: 'var(--warning-bg)' }}>
                    <BadgeCheck className="w-3 h-3" /> 优质付款方
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: 'var(--trust)', color: 'var(--warning)', backgroundColor: 'var(--warning-bg)' }}>
                    <BadgeCheck className="w-3 h-3" /> 高频发单方
                  </span>
                </>
              )}
              {userRole === 'user' && (
                <>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: 'var(--warning-border)', color: 'var(--warning)', backgroundColor: 'var(--warning-bg)' }}>
                    <BadgeCheck className="w-3 h-3" /> 平台建设方
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: 'var(--info-border)', color: 'var(--info)', backgroundColor: 'var(--info-bg)' }}>
                    <BadgeCheck className="w-3 h-3" /> 官方推荐服务商
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: 'var(--success-border)', color: 'var(--success)', backgroundColor: 'var(--success-bg)' }}>
                    <BadgeCheck className="w-3 h-3" /> 行业专家
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: 'var(--brand-border)', color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)' }}>
                    <BadgeCheck className="w-3 h-3" /> 金牌合作伙伴
                  </span>
                </>
              )}
              {userRole === 'customer' && <span className="px-3 py-1.5 rounded-full text-xs bg-[var(--border-subtle)] text-[var(--text-tertiary)]">企业认证</span>}
              {userRole === 'user' && <span className="px-3 py-1.5 rounded-full text-xs bg-[var(--border-subtle)] text-[var(--text-tertiary)]">个人认证</span>}
              {userRole === 'user' && <span className="px-3 py-1.5 rounded-full text-xs bg-[var(--brand-subtle)] text-[var(--brand)]">平台优选</span>}
            </div>
          </div>
        </div>

        {/* 公司主体认证入口（用户角色） */}
        {userRole === 'user' && (
          <button onClick={() => onNavigateToUserProfile('company')}
            className="w-full bg-white rounded-md border border-[var(--border-subtle)] px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-root)] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)' }}>
                <Building2 className="w-4 h-4" style={{ color: 'var(--brand)' }} />
              </div>
              <div className="text-left">
                <div className="text-sm text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">升级为公司认证</div>
                <div className="text-xs text-[#bbb] mt-0.5">以企业主体接单，提升竞争力</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-disabled)]" />
          </button>
        )}

        {/* Role badge */}
        {userRole && (
          <div className="bg-white rounded-md border border-[var(--border-subtle)] px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">当前身份</span>
            <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: roleBg.bg, color: roleBg.text }}>
              {roleLabel}
            </span>
          </div>
        )}
      </div>

      {/* Tag Request Modal */}
      {showTagRequest && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" style={{ background: 'rgba(13,17,23,0.25)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-md w-full max-w-md mx-4" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-modal)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="text-[17px] font-semibold" style={{ color: 'var(--text-primary)' }}>申请认证标签</h2>
              <button onClick={() => { setShowTagRequest(false); setSelectedTagRequest(''); setTagRequestReason(''); }}
                className="p-1 rounded-md hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  选择标签<span className="text-[10px] ml-1" style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTagRequest(selectedTagRequest === tag ? '' : tag)}
                      className="text-left px-3 py-2.5 rounded-md text-[13px] font-medium transition-all"
                      style={{
                        border: selectedTagRequest === tag ? '2px solid var(--brand)' : '1px solid var(--border-default)',
                        backgroundColor: selectedTagRequest === tag ? 'var(--brand-subtle)' : 'var(--bg-surface)',
                        color: selectedTagRequest === tag ? 'var(--brand)' : 'var(--text-primary)',
                      }}>
                      <BadgeCheck className="w-3.5 h-3.5 inline mr-1.5" style={{ color: selectedTagRequest === tag ? 'var(--brand)' : 'var(--text-tertiary)' }} />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  申请理由<span className="text-[10px] ml-1" style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  value={tagRequestReason}
                  onChange={e => setTagRequestReason(e.target.value)}
                  placeholder="请说明您申请该标签的理由，例如：已完成15个订单，按时交付率96%..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-md text-[13px] outline-none resize-none bg-white"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
              </div>
              <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
                <div className="text-[12px]" style={{ color: 'var(--info)' }}>
                  提交后，运营团队将在 3 个工作日内审核。审核通过后标签将自动发放到您的账户。
                </div>
              </div>
              {tagRequestSubmitted && (
                <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
                  <div className="text-[13px] flex items-center gap-2" style={{ color: 'var(--success)' }}>
                    <BadgeCheck className="w-4 h-4" />
                    申请已提交，请耐心等待运营审核。
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowTagRequest(false); setSelectedTagRequest(''); setTagRequestReason(''); }}
                  className="flex-1 px-4 py-2 rounded-md text-[13px] font-medium" style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>取消</button>
                <button
                  onClick={() => {
                    if (!selectedTagRequest || !tagRequestReason.trim()) return;
                    setTagRequestSubmitted(true);
                    setTimeout(() => { setShowTagRequest(false); setSelectedTagRequest(''); setTagRequestReason(''); setTagRequestSubmitted(false); }, 2000);
                  }}
                  disabled={!selectedTagRequest || !tagRequestReason.trim()}
                  className="flex-1 px-4 py-2 rounded-md text-[13px] font-semibold text-white transition-opacity"
                  style={{ backgroundColor: selectedTagRequest && tagRequestReason.trim() ? 'var(--brand)' : 'var(--bg-subtle)', opacity: selectedTagRequest && tagRequestReason.trim() ? 1 : 0.5 }}>
                  提交申请
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}