import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Calendar, DollarSign, Users, Clock, Heart, FileText, AlertCircle, ChevronDown, ChevronRight, List, Printer, Download, ShieldCheck, CheckCircle, Tag, Info, BarChart3, User, ListChecks, Package } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BidApplicationModal } from './BidApplicationModal';
import { BidSelectionModal, getMockBidUsers } from './BidSelectionModal';
import { UserQualification } from './UserQualification';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';

type UserRole = 'customer' | 'user' | 'browse-only';

// 订单状态配置（11种状态）
const orderStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  'new':              { label: '新建',       color: 'var(--info)', bg: 'var(--info-bg)' },
  'pending_review':   { label: '待审核',     color: 'var(--warning)', bg: 'var(--warning-bg)' },
  'promoting':        { label: '推广中',     color: 'var(--info)', bg: 'var(--info-bg)' },
  'agreement_pending':{ label: '协议签署中', color: 'var(--info)', bg: 'var(--info-bg)' },
  'in_delivery':      { label: '交付中',     color: 'var(--info)', bg: 'var(--info-bg)' },
  'accepted':         { label: '已验收',     color: 'var(--success)', bg: 'var(--success-bg)' },
  'pending_settlement':{ label:'待结算',     color: 'var(--brand)', bg: 'var(--brand-subtle)' },
  'settled':          { label: '已结算',     color: 'var(--success)', bg: 'var(--success-bg)' },
  'cancelled':        { label: '已取消',     color: 'var(--danger)', bg: 'var(--danger-bg)' },
  'terminated':       { label: '已终止',     color: 'var(--danger)', bg: 'var(--danger-bg)' },
  'closed':           { label: '已关闭',     color: 'var(--text-disabled)', bg: 'var(--bg-subtle)' },
};

interface OrderDetailData {
  id: number;
  title: string;
  taskType: string;
  budgetMin: number;
  budgetMax: number;
  bidCount: number;
  publishTime: string;
  description: string;
  creditScore?: number;
  deliveryRate?: string;
  aiTags?: string[];
  bidDeadline?: string;
  status?: string;
  publisher?: string;
  deadline?: string;
  requirements?: string[];
  deliverables?: string[];
  scheduleInfo?: {
    totalDuration: string;
    settlementMode: string;
    priceRange: string;
  };
  contractorReq?: {
    skills: string[];
    experience: string[];
    qualification: string[];
  };
  additionalInfo?: {
    remarks: string[];
    references: { title: string; url: string }[];
  };
}

interface OrderSquareDetailProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  orderData: OrderDetailData | null;
}

// Applicant data for customer selection view
interface Applicant {
  id: number;
  name: string;
  creditScore: number;
  skillMatch: number;
  deliveryRate: string;
  bidPriceMin?: number;
  bidPriceMax?: number;
  bidRemark?: string;
}

const mockApplicants: Applicant[] = [
  { id: 1, name: '张开发工作室', creditScore: 95, skillMatch: 98, deliveryRate: '99%', bidPriceMin: 55000, bidPriceMax: 75000, bidRemark: '团队有5年以上AI项目经验，已完成类似智能客服系统3个' },
  { id: 2, name: 'AI技术团队', creditScore: 91, skillMatch: 95, deliveryRate: '97%', bidPriceMin: 60000, bidPriceMax: 80000, bidRemark: '专注于NLP和对话系统开发，可提供完整技术方案' },
  { id: 3, name: '智慧科技工作室', creditScore: 88, skillMatch: 92, deliveryRate: '94%', bidPriceMin: 48000, bidPriceMax: 70000, bidRemark: '有丰富的GPT API集成经验，可快速交付' },
  { id: 4, name: '全栈开发者_李四', creditScore: 85, skillMatch: 89, deliveryRate: '91%', bidPriceMin: 52000, bidPriceMax: 78000, bidRemark: '个人全栈开发者，React+Node.js技术栈熟练' },
  { id: 5, name: '创新软件团队', creditScore: 82, skillMatch: 86, deliveryRate: '88%', bidPriceMin: 50000, bidPriceMax: 72000, bidRemark: '团队多人协作，可并行推进多个模块' },
  { id: 6, name: '数据智能工作室', creditScore: 90, skillMatch: 93, deliveryRate: '96%', bidPriceMin: 58000, bidPriceMax: 82000, bidRemark: '同时具备前后端和算法能力，综合实力强' },
  { id: 7, name: '前端专家_王五', creditScore: 79, skillMatch: 84, deliveryRate: '85%', bidPriceMin: 45000, bidPriceMax: 65000, bidRemark: '擅长React生态，有多款AI产品前端经验' },
  { id: 8, name: '技术咨询公司', creditScore: 93, skillMatch: 96, deliveryRate: '98%', bidPriceMin: 65000, bidPriceMax: 85000, bidRemark: '提供完整的项目管理和交付流程，质量有保障' },
  { id: 9, name: '创业技术团队', creditScore: 76, skillMatch: 82, deliveryRate: '83%', bidPriceMin: 42000, bidPriceMax: 60000, bidRemark: '团队处于成长期，报价优惠，执行力强' },
  { id: 10, name: '架构师_赵六', creditScore: 87, skillMatch: 90, deliveryRate: '93%', bidPriceMin: 53000, bidPriceMax: 76000, bidRemark: '10年+开发经验，架构设计能力突出' },
  { id: 11, name: '智能系统工作室', creditScore: 84, skillMatch: 88, deliveryRate: '90%', bidPriceMin: 49000, bidPriceMax: 71000, bidRemark: '有政府和企业AI项目实施经验' },
  { id: 12, name: '全栈工作室_陈七', creditScore: 80, skillMatch: 85, deliveryRate: '87%', bidPriceMin: 46000, bidPriceMax: 68000, bidRemark: '注重代码质量和文档规范' },
];

// Credit tier helper for applicant cards
function getCreditTier(score: number) {
  if (score >= 90) return { label: '精英', color: 'var(--trust)', bg: 'var(--warning-bg)' };
  if (score >= 70) return { label: '良好', color: 'var(--success)', bg: 'var(--success-bg)' };
  if (score >= 50) return { label: '一般', color: 'var(--credit-fair)', bg: 'var(--credit-fair-bg)' };
  return { label: '风险', color: 'var(--danger)', bg: 'var(--danger-bg)' };
}

// 模块配置
const MODULES: { id: string; label: string }[] = [
  { id: 'module-overview', label: '项目概述' },
  { id: 'module-requirements', label: '需求说明' },
  { id: 'module-deliverables', label: '交付物要求' },
  { id: 'module-schedule', label: '排期与预算' },
  { id: 'module-contractor', label: '接单要求' },
  { id: 'module-additional', label: '附加信息' },
];

export function OrderSquareDetail({ isOpen, onClose, userRole, orderData }: OrderSquareDetailProps) {
  const [isFollowed, setIsFollowed] = useState(false);
  const [isBidApplied, setIsBidApplied] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showQualification, setShowQualification] = useState(false);
  const [hasUserQualification, setHasUserQualification] = useState(true);
  const [showBidList, setShowBidList] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showSelectConfirm, setShowSelectConfirm] = useState(false);

  // 目录导航展开/折叠
  const [dirExpanded, setDirExpanded] = useState(true);

  // 骨架屏加载态（P1-04）
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(true);

  // 模块折叠状态（默认全部展开）
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  // 模块 refs 用于滚动定位
  const moduleRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentScrollRef = useRef<HTMLDivElement | null>(null);

  // 当前可视模块高亮
  const [activeModule, setActiveModule] = useState<string>('module-overview');

  const toggleModule = (id: string) => {
    setCollapsedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToModule = (id: string) => {
    moduleRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // IntersectionObserver 监听模块可见性实现目录高亮
  useEffect(() => {
    const currentRefs = moduleRefs.current;
    const scrollEl = contentScrollRef.current;
    if (!scrollEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const targetId = entry.target.getAttribute('data-module-id');
            if (targetId) setActiveModule(targetId);
            break;
          }
        }
      },
      { root: scrollEl, rootMargin: '-60px 0px -60% 0px', threshold: 0.1 }
    );

    const ids = MODULES.map(m => m.id);
    ids.forEach(id => {
      const el = currentRefs[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // P1-04: 打开弹窗时骨架屏加载 300ms
  useEffect(() => {
    if (isOpen) {
      setIsSkeletonLoading(true);
      const timer = setTimeout(() => setIsSkeletonLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 根据 orderData 派生默认值（处理部分字段缺失的情况）
  const order = useMemo(() => {
    if (!orderData) return null;
    return {
      ...orderData,
      description: orderData.description || '暂无描述',
      publisher: orderData.publisher || '未知发布方',
      deadline: orderData.deadline || '未设置',
      requirements: orderData.requirements || [orderData.description || '暂无详细需求说明'],
      deliverables: orderData.deliverables || ['详见项目需求说明'],
      scheduleInfo: orderData.scheduleInfo || {
        totalDuration: '待确认',
        settlementMode: '整单结算',
        priceRange: `¥${orderData.budgetMax.toLocaleString()}`,
      },
      contractorReq: orderData.contractorReq || {
        skills: orderData.aiTags || ['暂无特定技能要求'],
        experience: ['详见项目需求说明'],
        qualification: ['需完成平台实名认证'],
      },
      additionalInfo: orderData.additionalInfo || {
        remarks: [],
        references: [],
      },
    };
  }, [orderData]);

  if (!isOpen) return null;

  // 数据缺失情况
  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">订单数据加载失败</h3>
          <p className="text-sm text-[var(--text-tertiary)] mb-6">无法找到该订单的详细信息，请返回订单广场重新选择。</p>
          <button onClick={onClose} className="px-6 py-2 bg-[var(--brand)] text-white rounded-md text-sm font-medium">
            返回订单广场
          </button>
        </div>
      </div>
    );
  }

  // 格式化预算（精准单值）
  const formatBudget = (value: number) => {
    if (value >= 10000) return '¥' + (value / 10000).toFixed(1) + '万';
    return '¥' + value.toLocaleString();
  };

  // 获取状态标签
  const statusConfig = order.status ? orderStatusConfig[order.status] : null;

  // 计算招标截止倒计时
  const bidDeadlineInfo = useMemo(() => {
    if (order.bidDeadline) {
      const now = Date.now();
      const deadline = new Date(order.bidDeadline).getTime();
      const daysRemaining = Math.ceil((deadline - now) / (24 * 60 * 60 * 1000));
      if (daysRemaining > 0) {
        return `剩余 ${daysRemaining} 天 (${new Date(order.bidDeadline).toLocaleDateString('zh-CN')})`;
      }
      return '已截止';
    }
    return '未设置';
  }, [order.bidDeadline]);

  const handleToggleFollow = () => {
    setIsFollowed(!isFollowed);
    if (!isFollowed) {
      toast.success('关注成功', {
        description: '您可以在【我的订单】-「已关注的订单」中查看',
        duration: 3000,
      });
    } else {
      toast('已取消关注', { duration: 2000 });
    }
  };

  const handleApply = () => {
    if (!hasUserQualification) {
      setShowQualification(true);
      return;
    }
    if (isBidApplied) {
      toast.warning('您已报名该订单', { duration: 2500 });
      return;
    }
    setShowBidModal(true);
  };

  const handleSubmitBid = (orderId: number, bidRemark: string) => {
    setIsBidApplied(true);
    setShowBidModal(false);
    toast.success('报名成功', {
      description: `订单 #${orderId}\n${bidRemark.substring(0, 50)}...\n客户将看到您的报名信息`,
      duration: 3000,
    });
  };

  const handleQualificationComplete = () => {
    setHasUserQualification(true);
    setShowQualification(false);
    toast.success('资质认证完成', { description: '您现在可以报名订单了', duration: 3000 });
  };

  const handleSelectBidder = (bidderId: number) => {
    setShowBidList(false);
    toast.success('选标成功', { description: `订单 #${order.id} 将进入协议签署阶段`, duration: 3000 });
  };

  const handleSelectApplicant = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowSelectConfirm(true);
  };

  const handleConfirmSelect = () => {
    if (selectedApplicant) {
      toast.success('选标成功', {
        description: `已将「${selectedApplicant.name}」选为接单方\n订单 #${order.id} 将进入协议签署阶段`,
        duration: 3500,
      });
      setShowSelectConfirm(false);
      setSelectedApplicant(null);
    }
  };

  const handleExportMarkdown = () => {
    setShowExportMenu(false);
    const md = [
      `# ${order.title}`,
      '',
      `- **任务类型**: ${order.taskType}`,
      `- **预算**: ${formatBudget(order.budgetMax)}`,
      `- **发布者**: ${order.publisher}`,
      `- **发布时间**: ${order.publishTime}`,
      `- **截止时间**: ${order.deadline}`,
      '',
      '---',
      '',
      '## 项目概述',
      '',
      order.description,
      '',
      '## 需求说明',
      '',
      ...order.requirements.map((r: string) => `- ${r}`),
      '',
      '## 交付物要求',
      '',
      ...order.deliverables.map((d: string) => `- ${d}`),
      '',
      '## 排期与预算',
      '',
      `- **总工期**: ${order.scheduleInfo.totalDuration}`,
      `- **报价区间**: ${order.scheduleInfo.priceRange}`,
      `- **结算模式**: ${order.scheduleInfo.settlementMode}`,
      '',
      '## 接单要求',
      '',
      '### 技能要求',
      ...order.contractorReq.skills.map((s: string) => `- ${s}`),
      '',
      '### 经验要求',
      ...order.contractorReq.experience.map((e: string) => `- ${e}`),
      '',
      '### 资质要求',
      ...order.contractorReq.qualification.map((q: string) => `- ${q}`),
      '',
      '## 附加信息',
      '',
      '### 备注',
      ...order.additionalInfo.remarks.map((r: string) => `- ${r}`),
      '',
      '### 参考资料',
      ...order.additionalInfo.references.map((r: { title: string; url: string }) => `- [${r.title}](${r.url})`),
      '',
    ].join('\n');

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.title}-订单详情.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    setShowExportMenu(false);
    window.print();
  };

  const handleExportPdf = () => {
    setShowExportMenu(false);
    window.print();
  };

  // 渲染模块标题栏
  const renderModuleHeader = (icon: React.ReactNode, title: string, moduleId: string) => {
    const isCollapsed = collapsedModules[moduleId];
    return (
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => toggleModule(moduleId)}
        style={{ backgroundColor: 'var(--bg-subtle)', margin: '-20px', padding: '12px 20px', marginBottom: isCollapsed ? '-20px' : '12px', borderRadius: '16px 16px 0 0' }}
      >
        {icon}
        <h3 className="text-sm font-medium text-[var(--text-primary)] flex-1">{title}</h3>
        <span className="px-1.5 py-0.5 bg-[var(--brand-subtle)] text-[var(--text-disabled)] text-[10px] rounded">AI生成</span>
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] transition-transform" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] transition-transform" />
        )}
      </div>
    );
  };

  // 获取结算模式简写
  const getSettlementLabel = () => {
    const mode = order.scheduleInfo.settlementMode || '';
    if (mode.includes('按里程碑') || mode.includes('分期')) return '阶段结算';
    return '整单结算';
  };

  return (
    <>
      <Toaster />
      <style>{`
        @media print {
          .print-area {
            position: static !important;
            background: white !important;
            max-height: none !important;
          }
          .print-area > div {
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .print-hide { display: none !important; }
        }

        /* P2-07: 移动端响应式适配 — 小屏单栏布局 */
        @media (max-width: 768px) {
          .ods-mobile-stack {
            flex-direction: column !important;
          }
          .ods-mobile-stack > .print-hide:first-child,
          .ods-mobile-stack > .print-hide:last-child {
            display: none !important;
          }
          .ods-mobile-stack > div:not(.print-hide) {
            flex: none !important;
            width: 100% !important;
          }
          .ods-mobile-stack .print-hide {
            display: none !important;
          }
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print-area">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">

          {/* 标题栏（含状态展示 — P0-06） */}
          <div
            className="relative overflow-hidden shrink-0"
            style={{ background: 'linear-gradient(135deg, #07091a 0%, #0d0b2e 55%, #12103d 100%)' }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(82,96,240,0.50) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full blur-2xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.40) 0%, transparent 70%)' }} />
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
            }} />

            <div className="relative flex items-start justify-between px-8 py-6">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
                  >
                    {order.taskType}
                  </span>
                  <span className="text-xs text-white/40">#{order.id}</span>
                  {/* P0-06: 订单状态展示 */}
                  {statusConfig && (
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </span>
                  )}
                </div>
                <h2 className="text-xl text-white mb-1">{order.title}</h2>
                <p className="text-sm text-white/45">由 {order.publisher} 发布</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 print-hide">
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white"
                    title="打印/导出"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  {showExportMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-md shadow-lg z-20 overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                        <button
                          onClick={handlePrint}
                          className="w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--bg-hover)] transition-all flex items-center gap-2"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <Printer className="w-3.5 h-3.5" /> 打印订单
                        </button>
                        <button
                          onClick={handleExportPdf}
                          className="w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--bg-hover)] transition-all flex items-center gap-2"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <FileText className="w-3.5 h-3.5" /> 导出PDF
                        </button>
                        <button
                          onClick={handleExportMarkdown}
                          className="w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--bg-hover)] transition-all flex items-center gap-2"
                          style={{ color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)' }}
                        >
                          <Download className="w-3.5 h-3.5" /> 导出Markdown
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 内容区域：左侧目录 + 中间详情 + 右侧侧边栏（P0-07） */}
          {isSkeletonLoading ? (
            /* P1-04: 骨架屏加载态 */
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* 左侧目录骨架 */}
              <div
                className="shrink-0 border-r flex flex-col"
                style={{
                  width: dirExpanded ? '200px' : '40px',
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)',
                }}
              >
                <div style={{ padding: dirExpanded ? '16px 16px 12px' : '12px 10px' }}>
                  <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
                </div>
                {dirExpanded && (
                  <div className="px-3 pb-4 space-y-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-9 rounded-md bg-gray-200 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                )}
              </div>

              {/* 中间内容骨架 */}
              <div className="flex-1 overflow-auto px-8 py-6">
                <div className="max-w-3xl space-y-5">
                  {/* 概览卡片骨架 */}
                  <div className="rounded-lg p-5 bg-gray-100 animate-pulse" style={{ height: '80px' }} />
                  {/* 标签区域骨架 */}
                  <div className="flex gap-4">
                    <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
                    <div className="h-6 w-32 rounded bg-gray-200 animate-pulse" />
                  </div>
                  {/* 各模块骨架 */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
                        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" style={{ animationDelay: '0.1s' }} />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full rounded bg-gray-100 animate-pulse" style={{ animationDelay: '0.15s' }} />
                        <div className="h-3 w-5/6 rounded bg-gray-100 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="h-3 w-4/6 rounded bg-gray-100 animate-pulse" style={{ animationDelay: '0.25s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 右侧侧边栏骨架 */}
              <div
                className="shrink-0 border-l"
                style={{
                  width: '260px',
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)',
                }}
              >
                <div className="p-4 space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                  </div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-2.5 w-20 rounded bg-gray-200 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                      <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" style={{ animationDelay: `${i * 0.1 + 0.05}s` }} />
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
                  <div>
                    <div className="h-2 w-16 rounded bg-gray-200 animate-pulse" />
                    <div className="h-2 w-24 rounded bg-gray-200 animate-pulse mt-1" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* 左侧模块目录（sticky） */}
            <div
              className="shrink-0 border-r transition-all duration-200 overflow-hidden flex flex-col print-hide"
              style={{
                width: dirExpanded ? '200px' : '40px',
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
              }}
            >
              <div
                className="flex items-center gap-2 cursor-pointer select-none shrink-0"
                style={{ padding: dirExpanded ? '16px 16px 12px' : '12px 10px' }}
                onClick={() => setDirExpanded(!dirExpanded)}
              >
                <List className="w-4 h-4 shrink-0" style={{ color: 'var(--brand)' }} />
                {dirExpanded && (
                  <span className="text-xs font-medium text-[var(--text-secondary)] flex-1">模块目录</span>
                )}
                {dirExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                )}
              </div>

              {dirExpanded && (
                <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
                  {MODULES.map(mod => (
                    <button
                      key={mod.id}
                      onClick={() => scrollToModule(mod.id)}
                      className="w-full text-left px-3 py-2 rounded-md text-xs transition-all"
                      style={{
                        color: activeModule === mod.id ? 'var(--brand)' : 'var(--text-secondary)',
                        backgroundColor: activeModule === mod.id ? 'var(--brand-subtle)' : 'transparent',
                        fontWeight: activeModule === mod.id ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                      }}
                    >
                      {mod.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 中间详情内容 */}
            <div ref={contentScrollRef} className="flex-1 overflow-auto px-8 py-6">
              <div className="max-w-3xl space-y-5">

                {/* 订单概览 */}
                <div
                  className="rounded-lg p-5 grid grid-cols-2 md:grid-cols-4 gap-4"
                  style={{ background: 'linear-gradient(135deg, var(--info-bg) 0%, var(--info-bg) 100%)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--brand-subtle)' }}>
                      <DollarSign className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] mb-0.5">项目预算</div>
                      <div className="text-sm" style={{ color: 'var(--brand)' }}>
                        {formatBudget(order.budgetMin, order.budgetMax)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-blue-50">
                      <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] mb-0.5">截止时间</div>
                      <div className="text-sm text-[var(--text-primary)]">{order.deadline}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-green-50">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] mb-0.5">报名人数</div>
                      <div className="text-sm text-[var(--text-primary)]">{order.bidCount} 人</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-amber-50">
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] mb-0.5">发布时间</div>
                      <div className="text-sm text-[var(--text-primary)]">{order.publishTime}</div>
                    </div>
                  </div>
                </div>

                {/* AI 订单标签 + 发布方信用 */}
                <div className="flex items-center gap-4 flex-wrap">
                  {order.aiTags && order.aiTags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-tertiary)]">AI标签:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {order.aiTags.map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 bg-[var(--brand-subtle)] text-[var(--brand)] text-xs rounded-full">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[var(--text-tertiary)]">发布方信用:</span>
                    <span className="font-semibold text-[var(--brand)]">{order.creditScore ?? '-'}</span>
                    <span className="text-[var(--text-tertiary)]">分</span>
                    {order.creditScore && order.creditScore >= 85 && (
                      <span className="px-1.5 py-0.5 bg-[var(--success-bg)] text-[var(--success)] text-[10px] rounded">优质付款方</span>
                    )}
                  </div>
                </div>

                {/* ===== 模块 1: 项目概述 ===== */}
                <div
                  ref={(el) => { moduleRefs.current['module-overview'] = el; }}
                  data-module-id="module-overview"
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 transition-all hover:border-[var(--border-default)] transition-colors duration-150"
                  style={{ boxShadow: 'var(--shadow-card)' }}                >
                  {renderModuleHeader(
                    <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--brand)' }} />,
                    '项目概述',
                    'module-overview'
                  )}
                  {!collapsedModules['module-overview'] && (
                    <div className="prose prose-sm max-w-none text-[var(--text-secondary)] leading-relaxed">
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--brand)] underline underline-offset-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                              {children}
                            </a>
                          ),
                          strong: ({ children }) => (
                            <strong className="text-[var(--text-primary)]" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{children}</strong>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-3 mb-2">{children}</h3>
                          ),
                          ul: ({ children }) => (
                            <ul className="space-y-1 list-disc pl-5">{children}</ul>
                          ),
                          li: ({ children }) => (
                            <li className="text-sm text-[var(--text-secondary)]">{children}</li>
                          ),
                        }}
                      >
                        {order.description}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* ===== 模块 2: 需求说明 ===== */}
                <div
                  ref={(el) => { moduleRefs.current['module-requirements'] = el; }}
                  data-module-id="module-requirements"
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 transition-all hover:border-[var(--border-default)] transition-colors duration-150"
                  style={{ boxShadow: 'var(--shadow-card)' }}                >
                  {renderModuleHeader(
                    <ListChecks className="w-4 h-4 shrink-0" style={{ color: 'var(--brand)' }} />,
                    '需求说明',
                    'module-requirements'
                  )}
                  {!collapsedModules['module-requirements'] && (
                    <ul className="space-y-2">
                      {order.requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                          <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--brand)' }} />
                          {req}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ===== 模块 3: 交付物要求 ===== */}
                <div
                  ref={(el) => { moduleRefs.current['module-deliverables'] = el; }}
                  data-module-id="module-deliverables"
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 transition-all hover:border-[var(--border-default)] transition-colors duration-150"
                  style={{ boxShadow: 'var(--shadow-card)' }}                >
                  {renderModuleHeader(
                    <Package className="w-4 h-4 shrink-0" style={{ color: 'var(--brand)' }} />,
                    '交付物要求',
                    'module-deliverables'
                  )}
                  {!collapsedModules['module-deliverables'] && (
                    <ul className="space-y-2">
                      {order.deliverables.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                          <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--brand)' }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 客户视角：报名用户 — 已移至专门的查看报名入口 */}
                {false && (
                  <div
                    className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 transition-all mt-5"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                      <h3 className="text-sm font-medium text-[var(--text-primary)]">报名用户</h3>
                      <span className="px-1.5 py-0.5 bg-[var(--brand-subtle)] text-[var(--brand)] text-[10px] rounded">
                        {mockApplicants.length} 人报名
                      </span>
                    </div>

                    <div className="space-y-3">
                      {mockApplicants.map(applicant => {
                        const tier = getCreditTier(applicant.creditScore);
                        const isHighMatch = applicant.skillMatch >= 90;
                        return (
                          <div
                            key={applicant.id}
                            className="bg-white border border-[var(--border-subtle)] rounded-lg p-4 hover:border-[var(--brand-ring)] transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-semibold text-[var(--text-primary)]">
                                  {applicant.name}
                                </span>
                                <div className="flex items-center gap-1" title={`信用分：${applicant.creditScore}`}>
                                  <ShieldCheck className="w-[13px] h-[13px]" style={{ color: 'var(--trust)' }} />
                                  <span className="text-[12px] font-semibold" style={{ color: 'var(--trust)' }}>
                                    {applicant.creditScore}
                                  </span>
                                  <span
                                    className="inline-flex items-center px-1 py-0.5 rounded-sm text-[10px] font-semibold leading-none"
                                    style={{ color: tier.color, backgroundColor: tier.bg }}
                                  >
                                    {tier.label}
                                  </span>
                                </div>
                                <span
                                  className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium"
                                  style={isHighMatch
                                    ? { color: 'var(--success)', backgroundColor: 'var(--success-bg)' }
                                    : { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-hover)' }
                                  }
                                >
                                  匹配 {applicant.skillMatch}%
                                </span>
                              </div>
                              <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                                按时交付率 {applicant.deliveryRate}
                              </span>
                            </div>

                            {applicant.bidPriceMin !== undefined && applicant.bidPriceMax !== undefined && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>报价：</span>
                                <span className="text-[13px] font-semibold" style={{ color: 'var(--brand)', fontVariantNumeric: 'tabular-nums' }}>
                                  ¥{applicant.bidPriceMin.toLocaleString()} - ¥{applicant.bidPriceMax.toLocaleString()}
                                </span>
                              </div>
                            )}

                            {applicant.bidRemark && (
                              <p className="text-[12px] text-[var(--text-tertiary)] mb-3 line-clamp-1" title={applicant.bidRemark}>
                                "{applicant.bidRemark}"
                              </p>
                            )}

                            <div className="flex justify-end">
                              <button
                                onClick={() => handleSelectApplicant(applicant)}
                                className="px-4 py-1.5 bg-[var(--brand)] text-white rounded-md text-[12px] font-medium hover:bg-[var(--brand-hover)] transition-colors"
                              >
                                选为接单方
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 确认选标弹窗 */}
                {showSelectConfirm && selectedApplicant && (
                  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] w-full max-w-sm mx-4 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)' }}>
                          <CheckCircle className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                        </div>
                        <div>
                          <div className="text-[15px] font-semibold text-[var(--text-primary)]">确认选为接单方</div>
                        </div>
                      </div>
                      <div className="text-[13px] text-[var(--text-secondary)] mb-1">
                        确认将选为接单方吗？
                      </div>
                      <div className="bg-[var(--bg-root)] rounded-md p-3 mb-5 space-y-1.5">
                        <div className="flex justify-between text-[13px]">
                          <span style={{ color: 'var(--text-tertiary)' }}>接单方</span>
                          <span className="font-medium text-[var(--text-primary)]">{selectedApplicant.name}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span style={{ color: 'var(--text-tertiary)' }}>信用评分</span>
                          <span className="font-medium" style={{ color: 'var(--trust)' }}>{selectedApplicant.creditScore}</span>
                        </div>
                        {selectedApplicant.bidPriceMin !== undefined && (
                          <div className="flex justify-between text-[13px]">
                            <span style={{ color: 'var(--text-tertiary)' }}>报价</span>
                            <span className="font-medium" style={{ color: 'var(--brand)' }}>
                              ¥{selectedApplicant.bidPriceMin.toLocaleString()} - ¥{selectedApplicant.bidPriceMax?.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--text-tertiary)] mb-4">
                        确认后订单将进入协议签署阶段，请谨慎操作。
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setShowSelectConfirm(false); setSelectedApplicant(null); }}
                          className="flex-1 py-2.5 rounded-md border border-[var(--border-default)] text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-root)] transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleConfirmSelect}
                          className="flex-1 py-2.5 rounded-md text-white text-[13px]"
                          style={{ backgroundColor: 'var(--brand)' }}
                        >
                          确认选标
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== 模块 4: 排期与预算 ===== */}
                <div
                  ref={(el) => { moduleRefs.current['module-schedule'] = el; }}
                  data-module-id="module-schedule"
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 transition-all hover:border-[var(--border-default)] transition-colors duration-150"
                  style={{ boxShadow: 'var(--shadow-card)' }}                >
                  {renderModuleHeader(
                    <Clock className="w-4 h-4 shrink-0" style={{ color: 'var(--brand)' }} />,
                    '排期与预算',
                    'module-schedule'
                  )}
                  {!collapsedModules['module-schedule'] && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-[var(--text-tertiary)] mb-1">总工期</div>
                        <div className="text-sm text-[var(--text-primary)]" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                          {order.scheduleInfo.totalDuration}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-tertiary)] mb-1">报价区间</div>
                        <div className="text-sm" style={{ color: 'var(--brand)', fontWeight: 'var(--font-weight-semibold)' }}>
                          {order.scheduleInfo.priceRange}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-tertiary)] mb-1">结算模式</div>
                        <div className="prose prose-sm max-w-none text-[var(--text-secondary)] leading-relaxed">
                          <ReactMarkdown
                            components={{
                              strong: ({ children }) => (
                                <strong className="text-[var(--text-primary)]" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{children}</strong>
                              ),
                            }}
                          >
                            {order.scheduleInfo.settlementMode}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== 模块 5: 接单要求 ===== */}
                <div
                  ref={(el) => { moduleRefs.current['module-contractor'] = el; }}
                  data-module-id="module-contractor"
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 transition-all hover:border-[var(--border-default)] transition-colors duration-150"
                  style={{ boxShadow: 'var(--shadow-card)' }}                >
                  {renderModuleHeader(
                    <Users className="w-4 h-4 shrink-0" style={{ color: 'var(--brand)' }} />,
                    '接单要求',
                    'module-contractor'
                  )}
                  {!collapsedModules['module-contractor'] && (
                    <div className="space-y-5">
                      <div>
                        <div className="text-xs text-[var(--text-tertiary)] mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>技能要求</div>
                        <ul className="space-y-1.5">
                          {order.contractorReq.skills.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--brand)' }} />
                              <span>
                                <ReactMarkdown
                                  components={{
                                    strong: ({ children }) => (
                                      <strong className="text-[var(--text-primary)]" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{children}</strong>
                                    ),
                                  }}
                                >
                                  {item}
                                </ReactMarkdown>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-xs text-[var(--text-tertiary)] mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>经验要求</div>
                        <ul className="space-y-1.5">
                          {order.contractorReq.experience.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--brand)' }} />
                              <span>
                                <ReactMarkdown
                                  components={{
                                    strong: ({ children }) => (
                                      <strong className="text-[var(--text-primary)]" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{children}</strong>
                                    ),
                                  }}
                                >
                                  {item}
                                </ReactMarkdown>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-xs text-[var(--text-tertiary)] mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>资质要求</div>
                        <ul className="space-y-1.5">
                          {order.contractorReq.qualification.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--brand)' }} />
                              <span>
                                <ReactMarkdown
                                  components={{
                                    strong: ({ children }) => (
                                      <strong className="text-[var(--text-primary)]" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{children}</strong>
                                    ),
                                  }}
                                >
                                  {item}
                                </ReactMarkdown>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== 模块 6: 附加信息 ===== */}
                <div
                  ref={(el) => { moduleRefs.current['module-additional'] = el; }}
                  data-module-id="module-additional"
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 transition-all hover:border-[var(--border-default)] transition-colors duration-150"
                  style={{ boxShadow: 'var(--shadow-card)' }}                >
                  {renderModuleHeader(
                    <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--brand)' }} />,
                    '附加信息',
                    'module-additional'
                  )}
                  {!collapsedModules['module-additional'] && (
                    <div className="space-y-5">
                      {order.additionalInfo.remarks.length > 0 && (
                        <div>
                          <div className="text-xs text-[var(--text-tertiary)] mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>备注</div>
                          <ul className="space-y-1.5">
                            {order.additionalInfo.remarks.map((item: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--trust)' }} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {order.additionalInfo.references.length > 0 && (
                        <div>
                          <div className="text-xs text-[var(--text-tertiary)] mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>参考资料</div>
                          <div className="space-y-1.5">
                            {order.additionalInfo.references.map((ref: { title: string; url: string }, idx: number) => (
                              <a
                                key={idx}
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm transition-colors"
                                style={{ color: 'var(--brand)' }}
                              >
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                {ref.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 仅浏览状态提示 */}
                {userRole === 'browse-only' && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 rounded-md p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <div className="text-sm text-amber-700 mb-1">仅浏览模式</div>
                        <div className="text-sm text-amber-600/80">
                          您当前为仅浏览模式，无法报名或关注订单。如需参与订单，请完成身份认证。
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 客户视角提示 */}
                {userRole === 'customer' && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 rounded-md p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <div className="text-sm text-blue-700 mb-1">客户视角</div>
                        <div className="text-sm text-blue-600/80">
                          您当前为客户身份，可以查看订单详情，但无法报名承接订单。
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* P0-07: 右侧结构化信息侧边栏 */}
            <div
              className="shrink-0 border-l overflow-y-auto print-hide"
              style={{
                width: '260px',
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
              }}
            >
              <div className="p-4 space-y-5">
                {/* 侧边栏标题 */}
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">订单概览</span>
                </div>

                {/* 订单状态 */}
                <div>
                  <div className="text-[11px] font-medium text-[var(--text-tertiary)] mb-1.5">订单状态</div>
                  {statusConfig ? (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold"
                      style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusConfig.color }} />
                      {statusConfig.label}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--text-tertiary)]">未知</span>
                  )}
                </div>

                {/* 报价/预算范围 */}
                <div>
                  <div className="text-[11px] font-medium text-[var(--text-tertiary)] mb-1.5">预算范围</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
                    {formatBudget(order.budgetMin, order.budgetMax)}
                  </div>
                </div>

                {/* 时限 */}
                <div>
                  <div className="text-[11px] font-medium text-[var(--text-tertiary)] mb-1.5">时限</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <span>招标截止：{bidDeadlineInfo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <span>项目截止：{order.deadline}</span>
                    </div>
                  </div>
                </div>

                {/* 结算模式 */}
                <div>
                  <div className="text-[11px] font-medium text-[var(--text-tertiary)] mb-1.5">结算模式</div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                    <span className="text-xs font-medium text-[var(--text-primary)]">{getSettlementLabel()}</span>
                  </div>
                  {order.scheduleInfo.settlementMode.includes('期') && (
                    <div className="mt-1 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                      按里程碑分期结算
                    </div>
                  )}
                </div>

                {/* 分隔线 */}
                <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

                {/* 客户基本信息 */}
                <div>
                  <div className="text-[11px] font-medium text-[var(--text-tertiary)] mb-2">客户信息</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <span className="text-xs text-[var(--text-primary)]">{order.publisher}</span>
                    </div>
                    {order.creditScore !== undefined && (
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--trust)' }} />
                        <span className="text-xs text-[var(--text-secondary)]">
                          信用分 <span className="font-semibold" style={{ color: 'var(--trust)' }}>{order.creditScore}</span>
                        </span>
                        {order.creditScore >= 85 && (
                          <span className="px-1.5 py-0.5 bg-[var(--success-bg)] text-[var(--success)] text-[10px] rounded font-medium">
                            优质付款方
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <span className="text-xs text-[var(--text-tertiary)]">{order.taskType}</span>
                    </div>
                  </div>
                </div>

                {/* 订单ID */}
                <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
                <div>
                  <div className="text-[10px] text-[var(--text-disabled)]">
                    订单 #{order.id}
                  </div>
                  <div className="text-[10px] text-[var(--text-disabled)] mt-0.5">
                    发布于 {order.publishTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* 底部按钮 */}
          <div className="border-t border-[var(--border-subtle)] px-8 py-4 bg-[var(--bg-subtle)] shrink-0 print-hide">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-5 py-2 border border-[var(--border-default)] text-[var(--text-secondary)] rounded-md text-sm hover:bg-white transition-colors"
              >
                关闭
              </button>

              {/* 用户视角操作按钮 */}
              {userRole === 'user' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleFollow}
                    className="flex items-center gap-2 px-5 py-2 rounded-md text-sm transition-all border"
                    style={isFollowed
                      ? { borderColor: 'var(--brand)', color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)' }
                      : { borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }
                    }
                  >
                    <Heart className={`w-4 h-4 ${isFollowed ? 'fill-[var(--brand)]' : ''}`} />
                    {isFollowed ? '已关注' : '关注'}
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={isBidApplied}
                    className="px-5 py-2 rounded-md text-sm transition-opacity text-white"
                    style={isBidApplied
                      ? { backgroundColor: 'var(--text-disabled)', cursor: 'not-allowed' }
                      : { background: 'linear-gradient(135deg, var(--brand), var(--info))', boxShadow: '0 4px 14px rgba(82,96,240,0.35)' }
                    }
                  >
                    {isBidApplied ? '已报名' : '立即报名'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 报名弹窗 */}
      <BidApplicationModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        orderId={order.id}
        orderTitle={order.title}
        onSubmit={handleSubmitBid}
      />

      {/* 用户资质认证弹窗 */}
      {showQualification && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4">
            <UserQualification
              onComplete={handleQualificationComplete}
              onCancel={() => setShowQualification(false)}
            />
          </div>
        </div>
      )}

      {/* 报名列表弹窗（客户视角） */}
      <BidSelectionModal
        isOpen={showBidList}
        onClose={() => setShowBidList(false)}
        orderId={order.id}
        orderTitle={order.title}
        bidUsers={getMockBidUsers(order.id)}
        onSelectBidder={handleSelectBidder}
      />
    </>
  );
}
