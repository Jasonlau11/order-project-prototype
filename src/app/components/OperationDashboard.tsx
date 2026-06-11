import { useState, useCallback, useEffect, lazy, Suspense, type ReactNode } from 'react';
import { Users, UserCheck, ShoppingCart, FileText, FileSignature, Settings, Search, Download, Filter, Eye, Edit2, Trash2, ArrowLeft, Award, Briefcase, Clock, X, CreditCard, RotateCcw, AlertCircle, CheckCircle, BadgeCheck, XCircle, ChevronRight, Plus, DollarSign, CheckSquare, FileCheck, List, Ban, ShieldCheck, RefreshCw, Loader2, MessageCircle } from 'lucide-react';
import { CertReviewModal } from './CertReviewModal';
import { ContactInfoModal } from './ContactInfoModal';

const OrderSquareDetail = lazy(() => import('./OrderSquareDetail').then(m => ({ default: m.OrderSquareDetail })));
// ─── Loading Skeleton ──────────────────────────────────────────────────────
function ModuleCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-[var(--border-subtle)] overflow-hidden animate-pulse">
      <div className="p-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-hover)]" />
          <div className="h-4 w-20 bg-[var(--bg-hover)] rounded" />
        </div>
        <div className="flex items-baseline gap-3">
          <div className="h-5 w-24 bg-[var(--bg-hover)] rounded" />
          <div className="h-4 w-16 bg-[var(--bg-hover)] rounded-full" />
        </div>
      </div>
      <div className="p-5 space-y-2">
        <div className="h-3 w-full bg-[var(--bg-hover)] rounded" />
        <div className="h-3 w-3/4 bg-[var(--bg-hover)] rounded" />
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-20 bg-[var(--bg-hover)] rounded-md" />
          <div className="h-6 w-24 bg-[var(--bg-hover)] rounded-md" />
        </div>
      </div>
    </div>
  );
}

// ─── Error Card ────────────────────────────────────────────────────────────
function ModuleCardError({ title, onRetry }: { title: string; onRetry: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
      <div className="p-5 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-[13px] text-red-600 font-medium mb-1">{title} 加载失败</p>
        <p className="text-[11px] text-[var(--text-tertiary)] mb-3">请检查网络后重试</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-[var(--brand)] border border-[var(--brand)] rounded-full hover:bg-[var(--brand-subtle)] transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          重试
        </button>
      </div>
    </div>
  );
}

// ─── Empty Card ────────────────────────────────────────────────────────────
function ModuleCardEmpty({ title, summary }: { title: string; summary: string }) {
  return (
    <div className="bg-white rounded-lg border border-[var(--border-subtle)] overflow-hidden">
      <div className="p-5 text-center">
        <FileText className="w-8 h-8 text-[var(--text-disabled)] mx-auto mb-2" />
        <p className="text-[13px] text-[var(--text-primary)] font-medium mb-1">{title}</p>
        <p className="text-[12px] text-[var(--text-tertiary)]">{summary}</p>
      </div>
    </div>
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────
function KPICard({ title, value, color, icon }: { title: string; value: number; color: string; icon?: string }) {
  return (
    <div
      className="rounded-lg p-4 cursor-pointer hover:-translate-y-px transition-all duration-150"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="text-[11px] mb-2" style={{ color: 'var(--text-tertiary)' }}>{title}</div>
      <div className="text-2xl font-semibold" style={{ color }}>{value}</div>
    </div>
  );
}

// ─── Dashboard Card ─────────────────────────────────────────────────────────
function DashboardCard({ title, count, children, onViewAll }: { title: string; count: number; children: ReactNode; onViewAll: () => void }) {
  return (
    <div
      className="rounded-lg p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}>{count}</span>
        </div>
        <button className="text-[12px]" style={{ color: 'var(--brand)' }} onClick={onViewAll}>查看全部</button>
      </div>
      {children}
    </div>
  );
}

export function OperationDashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  // ── Module modal state ──────────────────────────────────────────────────────
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<string | null>(null); // 'all' | 'pending' | 'pending_review' | 'appeal' | 'draft'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);

  // ── P0-01: Order status filter ────────────────────────────────────────────
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // ── P1-02: 30分钟自动刷新计时器 ──────────────────────────────────────────
  const REFRESH_INTERVAL = 30 * 60 * 1000;
  const [nextRefreshTime, setNextRefreshTime] = useState<Date>(new Date(Date.now() + REFRESH_INTERVAL));
  const [countdown, setCountdown] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatCountdown = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setNextRefreshTime(new Date(Date.now() + REFRESH_INTERVAL));
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = nextRefreshTime.getTime() - now;
      if (diff <= 0) {
        setNextRefreshTime(new Date(now + REFRESH_INTERVAL));
        setCountdown(formatCountdown(REFRESH_INTERVAL));
      } else {
        setCountdown(formatCountdown(diff));
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [nextRefreshTime]);

  // ── P0-05: Module loading / error states ──────────────────────────────────
  const [loadingModules, setLoadingModules] = useState<Set<string>>(new Set());
  const [errorModules, setErrorModules] = useState<Set<string>>(new Set());

  const handleRetryModule = useCallback((moduleId: string) => {
    setErrorModules(prev => {
      const next = new Set(prev);
      next.delete(moduleId);
      return next;
    });
    setLoadingModules(prev => {
      const next = new Set(prev);
      next.add(moduleId);
      return next;
    });
    // Simulate loading completion after a short delay
    setTimeout(() => {
      setLoadingModules(prev => {
        const next = new Set(prev);
        next.delete(moduleId);
        return next;
      });
    }, 800);
  }, []);

  // P0-05: Simulate async loading on mount
  useEffect(() => {
    const moduleIds = ['customers', 'users', 'orders', 'billing', 'contracts', 'settings', 'platform_accept'];
    setLoadingModules(new Set(moduleIds));
    const timers = moduleIds.map((id, i) =>
      setTimeout(() => {
        setLoadingModules(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 800 + i * 100)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // P0-03: Termination settlement review state ────────────────────────────
  const [terminationReviewModal, setTerminationReviewModal] = useState<{ orderId: number; action: 'review' | 'approve' | 'reject' } | null>(null);
  const [terminationRejectReason, setTerminationRejectReason] = useState('');

  // ── P1-04: 订单审核弹窗 ──────────────────────────────────────────────────
  const [orderAuditModal, setOrderAuditModal] = useState<{ orderId: number } | null>(null);
  const [orderAuditRejectMode, setOrderAuditRejectMode] = useState(false);
  const [orderAuditRejectReason, setOrderAuditRejectReason] = useState('');

  // ── 订单详情弹窗 ────────────────────────────────────────────────────────
  const [orderDetailId, setOrderDetailId] = useState<number | null>(null);

  // P0-03: Termination settlement handlers
  const handleTerminationApprove = (orderId: number) => {
    setOrdersData(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'terminated' } : o
    ));
    setTerminationReviewModal(null);
  };

  const handleTerminationReject = (orderId: number) => {
    setOrdersData(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'terminated' } : o
    ));
    setTerminationReviewModal(null);
    setTerminationRejectReason('');
  };

  // ── Certification review state ──────────────────────────────────────────────
  const [certReview, setCertReview] = useState<{ type: 'customer' | 'user'; id: number } | null>(null);

  // 模拟客户数据（useState 支持认证状态实时更新）
  const [customersData, setCustomersData] = useState([
    { id: 1, name: '北京科技有限公司',  contact: '张经理', phone: '138****8888', status: 'verified', rejectReason: '', orders: 12, createdAt: '2025-12-01' },
    { id: 2, name: '上海软件开发公司',  contact: '李总',   phone: '139****9999', status: 'pending',  rejectReason: '',  orders: 5,  createdAt: '2026-01-15' },
    { id: 3, name: '深圳创新科技',      contact: '王主管', phone: '136****6666', status: 'verified', rejectReason: '', orders: 8,  createdAt: '2025-11-20' },
    { id: 4, name: '广州互联网公司',    contact: '赵先生', phone: '137****7777', status: 'verified', rejectReason: '', orders: 15, createdAt: '2025-10-05' },
    { id: 5, name: '成都数字科技',      contact: '钱女士', phone: '135****5555', status: 'pending',  rejectReason: '',  orders: 3,  createdAt: '2026-02-10' },
  ]);

  // 企业资质提交数据
  const CUSTOMER_CERT_SUBMISSIONS: Record<number, any> = {
    2: {
      companyName: '上海软件开发有限公司', creditCode: '91310108MA1GBQ5678',
      address: '上海市徐汇区漕宝路 88 号 2 栋 1205 室', legalRepName: '李明华',
      contactName: '李总', contactTitle: '总经理',
      contactPhone: '139****9999', contactEmail: 'li@shanghaisoft.com',
      submittedAt: '2026-04-15 09:32',
    },
    5: {
      companyName: '成都数字科技有限公司', creditCode: '91510104MA6C5P3412',
      address: '四川省成都市高新区天府大道中段 1388 号', legalRepName: '钱雪梅',
      contactName: '钱女士', contactTitle: '运营总监',
      contactPhone: '135****5555', contactEmail: 'qian@cddigital.com',
      submittedAt: '2026-04-20 14:18',
    },
  };

  // 模拟客户订单数据（根据客户ID）
  const getCustomerOrders = (customerId: number) => {
    const ordersByCustomer: Record<number, any[]> = {
      1: [
        { id: 1001, title: '企业管理系统开发', taskType: '软件开发', budgetMin: 100000, budgetMax: 150000, status: 'inProgress', publishTime: '2026-02-15', contractor: '张工作室', bidCount: 15 },
        { id: 1002, title: '移动端APP开发', taskType: '软件开发', budgetMin: 80000, budgetMax: 120000, status: 'promoting', publishTime: '2026-03-01', bidCount: 8 },
        { id: 1003, title: '数据分析系统', taskType: '软件开发', budgetMin: 60000, budgetMax: 90000, status: 'settled', publishTime: '2026-01-10', contractor: '数据专家' },
      ],
      2: [
        { id: 2001, title: '品牌VI设计', taskType: '平面设计', budgetMin: 15000, budgetMax: 25000, status: 'promoting', publishTime: '2026-03-05', bidCount: 12 },
        { id: 2002, title: '网站UI重设计', taskType: '平面设计', budgetMin: 20000, budgetMax: 30000, status: 'signing', publishTime: '2026-02-20', contractor: '设计工作室' },
      ],
      3: [
        { id: 3001, title: '电商平台开发', taskType: '软件开发', budgetMin: 150000, budgetMax: 200000, status: 'inProgress', publishTime: '2026-01-15', contractor: '全栈团队', bidCount: 20 },
      ],
    };
    return ordersByCustomer[customerId] || [];
  };

  // 模拟用户数据（useState 支持认证状态实时更新）
  const [usersData, setUsersData] = useState([
    { id: 1, name: '开发者张三',   level: 'LV.5', skills: ['前端开发', 'UI设计', 'React', 'Vue'],       completedProjects: 28, rating: 4.9, status: 'verified', createdAt: '2024-06-15', experience: '5年前端开发经验，擅长React、Vue等主流框架，曾参与多个大型项目开发', introduction: '我是一名经验丰富的前端开发工程师，专注于Web应用开发和UI/UX设计。在过去的5年里，我参与并主导了多个大型互联网项目的开发，包括电商平台、企业管理系统、移动端应用等。我熟练掌握React、Vue、TypeScript等现代前端技术栈，注重代码质量和用户体验。同时，我也具备良好的沟通能力和团队协作精神，能够快速理解客户需求并提供专业的技术方案。' },
    { id: 2, name: '设计师李四',   level: 'LV.4', skills: ['平面设计', '视频剪辑', 'UI/UX', 'Adobe套件'], completedProjects: 15, rating: 4.7, status: 'verified', createdAt: '2024-08-20', experience: '4年设计经验，精通Photoshop、Illustrator、Premiere等设计软件',             introduction: '资深设计师，专注于品牌视觉设计和视频内容创作。拥有丰富的品牌设计、UI设计经验，为多家知名企业提供过设计服务。擅长将创意与商业需求完美结合，打造具有辨识度的视觉作品。' },
    { id: 3, name: '程序员王五',   level: 'LV.3', skills: ['后端开发', '数据库', 'Java', 'MySQL'],       completedProjects: 12, rating: 4.8, status: 'pending',  createdAt: '2025-01-10', experience: '3年后端开发经验，熟悉Java、Spring Boot、MySQL等技术',                     introduction: '专注于后端服务开发和数据库设计，有丰富的分布式系统开发经验。擅长高并发、高可用系统架构设计，注重代码规范和系统稳定性。' },
    { id: 4, name: '全栈工程师赵六', level: 'LV.6', skills: ['全栈开发', 'DevOps', 'Node.js', 'Docker'],  completedProjects: 35, rating: 5.0, status: 'verified', createdAt: '2024-03-05', experience: '7年全栈开发经验，精通前后端开发及DevOps实践',                           introduction: '资深全栈工程师，拥有完整的项目开发和部署经验。从需求分析到上线运维，能够独立完成整个项目生命周期。熟悉云计算、容器化技术，擅长性能优化和系统架构设计。' },
    { id: 5, name: '测试工程师钱七', level: 'LV.2', skills: ['软件测试', '自动化测试', 'Selenium', 'Jmeter'], completedProjects: 8, rating: 4.6, status: 'verified', createdAt: '2025-11-01', experience: '2年软件测试经验，熟悉功能测试和自动化测试',                           introduction: '专业的软件测试工程师，具备扎实的测试理论基础和实践经验。擅长测试用例设计、缺陷管理、自动化测试脚本编写，能够有效保障软件质量。' },
  ]);

  // 用户能力与资质提交数据
  const USER_CERT_SUBMISSIONS: Record<number, any> = {
    3: {
      isTeam: false,
      capabilityIntro: '专注于后端服务开发和数据库设计，有丰富的分布式系统开发经验。擅长高并发、高可用系统架构设计，注重代码规范和系统稳定性。拥有 3 年 Java 后端开发经验，参与多个金融类系统后端建设，熟悉 Spring Boot、MyBatis、Redis、Kafka 等技术栈，能够独立承接中型后端项目的全流程交付。',
      qualificationCerts: '阿里云 ACP 云计算认证（有效期至 2027 年）、Oracle Database 11g 认证',
      submittedAt: '2026-04-18 11:45',
    },
  };

  // ── Cert review handlers ────────────────────────────────────────────────────
  const handleCertApprove = () => {
    if (!certReview) return;
    if (certReview.type === 'customer') {
      setCustomersData(prev => prev.map(c => c.id === certReview.id ? { ...c, status: 'verified' } : c));
    } else {
      setUsersData(prev => prev.map(u => u.id === certReview.id ? { ...u, status: 'verified' } : u));
    }
    setCertReview(null);
  };

  const handleCertReject = (reason: string) => {
    if (!certReview) return;
    if (certReview.type === 'customer') {
      setCustomersData(prev => prev.map(c => c.id === certReview.id ? { ...c, status: 'rejected', rejectReason: reason } : c));
    } else {
      setUsersData(prev => prev.map(u => u.id === certReview.id ? { ...u, status: 'rejected' } : u));
    }
    setCertReview(null);
  };

  // 模拟订单数据 (P0-01: 覆盖全部9种状态)
  const [ordersData, setOrdersData] = useState([
    { id: 1001, title: '企业官网开发项目', customer: '北京科技有限公司', budget: 50000, status: 'in_progress', applicants: 8, createdAt: '2026-03-01' },
    { id: 1002, title: 'APP UI设计', customer: '上海软件开发公司', budget: 15000, status: 'pending_review', applicants: 12, createdAt: '2026-03-10' },
    { id: 1003, title: '电商系统后端开发', customer: '深圳创新科技', budget: 80000, status: 'promoting', applicants: 15, createdAt: '2026-03-05' },
    { id: 1004, title: '品牌宣传视频制作', customer: '广州互联网公司', budget: 25000, status: 'signing', applicants: 6, createdAt: '2026-03-08' },
    { id: 1005, title: '数据分析报告', customer: '成都数字科技', budget: 12000, status: 'accepted', applicants: 3, createdAt: '2026-02-15' },
    { id: 1006, title: '营销推广方案', customer: '北京科技有限公司', budget: 30000, status: 'pending_settlement', applicants: 10, createdAt: '2026-02-20' },
    { id: 1007, title: '小程序开发', customer: '深圳创新科技', budget: 45000, status: 'settled', applicants: 8, createdAt: '2026-01-10' },
    { id: 1008, title: '企业VI设计', customer: '上海软件开发公司', budget: 18000, status: 'cancelled', applicants: 5, createdAt: '2026-02-28' },
    { id: 1009, title: '数据仓库搭建', customer: '广州互联网公司', budget: 95000, status: 'terminated', applicants: 12, createdAt: '2026-01-20' },
    // P0-02: 私密订单 — 待运营方接单
    { id: 1010, title: '内部管理系统升级', customer: '某银行(私密)', budget: 120000, status: 'private_pending', applicants: 0, createdAt: '2026-04-01' },
    { id: 1011, title: '核心算法优化', customer: '某金融公司(私密)', budget: 85000, status: 'private_pending', applicants: 0, createdAt: '2026-04-05' },
    // P0-03: 终止结算待审核
    { id: 1012, title: '商城订单系统', customer: '北京科技有限公司', budget: 60000, status: 'terminated_pending_settlement', applicants: 7, createdAt: '2026-01-15' },
    { id: 1013, title: '数据报表平台', customer: '成都数字科技', budget: 35000, status: 'terminated_pending_settlement', applicants: 4, createdAt: '2026-02-01' },
  ]);

  // 模拟账单数据（对齐需求文档账单状态机）
  const [billingData, setBillingData] = useState([
    { id: 'BL-2026-0001', orderTitle: '企业管理系统开发', billType: '阶段账单', amount: 40000, status: 'paid',            customer: '北京科技有限公司', user: '张工作室',   date: '2026-03-20', hasAppeal: false, closing_coordination: false, both_confirmed: false, needs_resubmit: false, appealReason: '', paymentRef: 'PAY-20260320-001' },
    { id: 'BL-2026-0002', orderTitle: '企业管理系统开发', billType: '阶段账单', amount: 35000, status: 'pending_payment', customer: '北京科技有限公司', user: '张工作室',   date: '2026-03-25', hasAppeal: false, closing_coordination: false, both_confirmed: false, needs_resubmit: false, appealReason: '', paymentRef: '' },
    { id: 'BL-2026-0003', orderTitle: '企业管理系统开发', billType: '阶段账单', amount: null,  status: 'draft',           customer: '北京科技有限公司', user: '张工作室',   date: '2026-04-01', hasAppeal: false, closing_coordination: false, both_confirmed: false, needs_resubmit: false, appealReason: '', paymentRef: '' },
    { id: 'BL-2026-0004', orderTitle: '品牌VI全案设计',   billType: '整单账单', amount: 22000, status: 'pending_confirm', customer: '上海软件开发公司', user: '设计工作室', date: '2026-04-02', hasAppeal: false, closing_coordination: false, both_confirmed: false, needs_resubmit: false, appealReason: '', paymentRef: '' },
    { id: 'BL-2026-0005', orderTitle: '电商平台后端开发', billType: '阶段账单', amount: 60000, status: 'refund_pending',  customer: '深圳创新科技',    user: '全栈团队',   date: '2026-04-05', hasAppeal: true,  closing_coordination: false, both_confirmed: false, needs_resubmit: false, appealReason: '账单金额与实际交付工作量不符，要求重新核定。我方实际交付了额外的 API 接口开发，但账单未体现。', paymentRef: 'PAY-20260405-003' },
    { id: 'BL-2026-0006', orderTitle: '电商平台后端开发', billType: '尾款账单', amount: null,  status: 'draft',           customer: '深圳创新科技',    user: '全栈团队',   date: '2026-04-08', hasAppeal: false, closing_coordination: false, both_confirmed: false, needs_resubmit: false, appealReason: '', paymentRef: '' },
    { id: 'BL-2026-0007', orderTitle: '产品宣传视频制作', billType: '整单账单', amount: 28000, status: 'booked',          customer: '广州互联网公司',  user: '视频工作室', date: '2026-02-28', hasAppeal: false, closing_coordination: false, both_confirmed: false, needs_resubmit: false, appealReason: '', paymentRef: 'PAY-20260228-002' },
    { id: 'BL-2026-0008', orderTitle: '数据分析报告撰写', billType: '整单账单', amount: 12000, status: 'refund_confirm',  customer: '成都数字科技',    user: '分析师李四', date: '2026-04-07', hasAppeal: true,  closing_coordination: false, both_confirmed: false, needs_resubmit: false, appealReason: '交付报告质量未达验收标准，数据分析方法存在明显缺陷，结论偏差较大，要求退款或重做。', paymentRef: 'PAY-20260407-004' },
    { id: 'BL-2026-0009', orderTitle: '企业官网UI设计',   billType: '尾款账单', amount: 0,     status: 'closed',          customer: '北京科技有限公司', user: '设计工作室', date: '2026-03-15', hasAppeal: false, closing_coordination: false, both_confirmed: false, needs_resubmit: false, appealReason: '', paymentRef: '' },
  ]);
  const [billStatusFilter, setBillStatusFilter] = useState<string>('all');
  const [billSearchQuery, setBillSearchQuery] = useState('');

  // ── Billing coordination & appeal state ────────────────────────────────────
  const [coordinationModal, setCoordinationModal] = useState<{ billId: string } | null>(null);
  const [appealDetailModal, setAppealDetailModal] = useState<{ billId: string; reason: string } | null>(null);
  const [rejectAppealModal, setRejectAppealModal] = useState<{ billId: string } | null>(null);
  const [rejectAppealReason, setRejectAppealReason] = useState('');

  // ── P1#10: Create bill state ────────────────────────────────────────────────
  const [createBillModal, setCreateBillModal] = useState(false);
  const [newBillForm, setNewBillForm] = useState({ orderSelect: '', billType: '阶段账单', amount: '' });

  // ── P1#11: Booking confirmation state ───────────────────────────────────────
  const [bookingConfirmModal, setBookingConfirmModal] = useState<{ billId: string } | null>(null);
  const [batchBookingMode, setBatchBookingMode] = useState(false);
  const [selectedBillsForBooking, setSelectedBillsForBooking] = useState<string[]>([]);

  // ── P0#6: Bill action confirmation state ────────────────────────────────────
  const [billActionModal, setBillActionModal] = useState<{ billId: string; action: string; actionLabel: string } | null>(null);

  // ── Contract review state ──────────────────────────────────────────────────
  const [contractReviewModal, setContractReviewModal] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);
  const [contractRejectReason, setContractRejectReason] = useState('');
  const [contractPreviewModal, setContractPreviewModal] = useState<number | null>(null);

  // ── P0: 合同审核弹窗状态 ──────────────────────────────────────────────────
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewContract, setReviewContract] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  // 模拟合同数据
  const [contractsData, setContractsData] = useState([
    { id: 3001, orderTitle: 'AI智能问答系统开发合同', title: 'AI智能问答系统开发合同', parties: '某科技有限公司 / 张工作室', partyA: '某科技有限公司', partyB: '张工作室', amount: '¥120,000', status: 'active', signedDate: '2026-06-01', createdAt: '2026-05-20', auditor: '运营管理员A', auditTime: '2026-05-25 14:22', keyTerms: '项目总金额 ¥120,000，分3个阶段交付。NLP引擎、知识库搭建、前端对话界面。' },
    { id: 3002, orderTitle: '品牌VI设计服务合同', title: '品牌VI设计服务合同', parties: '某品牌公司 / 李设计师', partyA: '某品牌公司', partyB: '李设计师', amount: '¥15,000', status: 'pending_review', signedDate: '-', createdAt: '2026-06-05', auditor: '', auditTime: '', keyTerms: '项目总金额 ¥15,000。包含Logo、名片、海报等12项VI物料设计，交付周期20天。' },
    { id: 3003, orderTitle: '电商平台前端开发合同', title: '电商平台前端开发合同', parties: '深圳创新科技 / 全栈团队', partyA: '深圳创新科技', partyB: '全栈团队', amount: '¥80,000', status: 'pending_review', signedDate: '-', createdAt: '2026-06-03', auditor: '', auditTime: '', keyTerms: '项目总金额 ¥80,000，分4个阶段交付。React前端、商品展示、购物车、支付接入。' },
    { id: 3004, orderTitle: '品牌宣传视频制作合同', title: '品牌宣传视频制作合同', parties: '广州互联网公司 / 创意工作室', partyA: '广州互联网公司', partyB: '创意工作室', amount: '¥25,000', status: 'signed', signedDate: '2026-05-28', createdAt: '2026-05-15', auditor: '运营管理员B', auditTime: '2026-05-27 09:15', keyTerms: '项目总金额 ¥25,000。包含1条3分钟品牌宣传视频和2条30秒广告短视频，交付周期25天。' },
    { id: 3005, orderTitle: '小程序商城开发合同', title: '小程序商城开发合同', parties: '上海零售公司 / 移动开发组', partyA: '上海零售公司', partyB: '移动开发组', amount: '¥60,000', status: 'active', signedDate: '2026-06-02', createdAt: '2026-05-18', auditor: '运营管理员A', auditTime: '2026-05-30 11:00', keyTerms: '项目总金额 ¥60,000，微信小程序商城，含商品管理、会员系统、营销插件。' },
  ]);

  // ── 待平台承接订单（结算模式=平台承包转包）──────────────────────────────
  const [platformAcceptOrders, setPlatformAcceptOrders] = useState([
    { id: 5001, title: '政务数据平台开发', customer: '湖南数据产业集团', budget: 180000, taskTypes: ['软件开发', '政务系统'], description: '构建省级政务数据授权运营平台，含数据目录管理、授权审批、数据沙箱、使用审计等模块。要求具备政务系统开发经验。', submittedAt: '2026-06-08 10:30', contactName: '刘经理', contactPhone: '138****5678' },
    { id: 5002, title: '大型电商平台架构咨询', customer: '深圳创新科技', budget: 95000, taskTypes: ['软件开发', '技术咨询'], description: '现有电商平台日均订单量突破50万，需要架构升级方案：微服务拆分、数据库分库分表、缓存策略优化、全链路压测。', submittedAt: '2026-06-09 14:15', contactName: '王主管', contactPhone: '136****6666' },
    { id: 5003, title: 'AI训练数据标注项目', customer: '成都数字科技', budget: 42000, taskTypes: ['数据服务'], description: '医疗影像AI训练数据标注，总量约20万张，需专业标注团队。标注规范由我方提供，首次合作需试标200张。', submittedAt: '2026-06-10 09:00', contactName: '钱女士', contactPhone: '135****5555' },
  ]);
  const [platformAcceptModal, setPlatformAcceptModal] = useState<{ orderId: number; mode: 'accept' | 'reject' } | null>(null);
  const [platformRejectReason, setPlatformRejectReason] = useState('');

  const handlePlatformAccept = (orderId: number) => {
    setPlatformAcceptOrders(prev => prev.filter(o => o.id !== orderId));
    setPlatformAcceptModal(null);
  };

  const handlePlatformReject = (orderId: number) => {
    setPlatformAcceptOrders(prev => prev.filter(o => o.id !== orderId));
    setPlatformAcceptModal(null);
    setPlatformRejectReason('');
  };

  // ── 待平台承接 列表/详情 ─────────────────────────────────────────
  const [showPlatformOrderDetail, setShowPlatformOrderDetail] = useState(false);
  const [showPlatformContact, setShowPlatformContact] = useState(false);
  const [platformSelectedOrder, setPlatformSelectedOrder] = useState<any>(null);

  // ── P2: 分页状态 ──────────────────────────────────────────────────────────
  const [customerPage, setCustomerPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [billPage, setBillPage] = useState(1);
  const [contractPage, setContractPage] = useState(1);
  const PAGE_SIZE = 5;

  // ── P2: 排序状态 ──────────────────────────────────────────────────────────
  const [orderSortField, setOrderSortField] = useState<string | null>(null);
  const [orderSortDir, setOrderSortDir] = useState<'asc' | 'desc'>('asc');
  const [contractSortField, setContractSortField] = useState<string | null>(null);
  const [contractSortDir, setContractSortDir] = useState<'asc' | 'desc'>('asc');

  // ── P2: 筛选Popover状态 ──────────────────────────────────────────────────
  const [statusFilterPopover, setStatusFilterPopover] = useState<string | null>(null);
  const [customerStatusFilter, setCustomerStatusFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');

  // ── P2: 账单详情抽屉 ───────────────────────────────────────────────────────
  const [billDetailDrawer, setBillDetailDrawer] = useState<string | null>(null);

  // 处理跳转
  const handleNavigate = (module: string) => {
    if (onNavigate) {
      const pageMapping: Record<string, string> = {
        '开发工具配置': 'dev-tool-config',
        '协议模板配置': 'agreement-template-config',
        '认证标签管理': '认证标签管理',
      };
      const pageId = pageMapping[module] || module;
      onNavigate(pageId);
    } else {
      alert(`跳转到 ${module}`);
    }
  };

  // 状态映射
  const statusMap: Record<string, { label: string; color: string }> = {
    verified: { label: '已认证', color: 'bg-[var(--success-bg)] text-[var(--success)]' },
    pending:  { label: '认证中', color: 'bg-[#fff8e1] text-[#f57c00]' },
    rejected: { label: '已驳回', color: 'bg-red-50 text-red-700' },
    pending_review: { label: '待审核', color: 'bg-[#fff8e1] text-[#f57c00]' },
    promoting: { label: '推广中', color: 'bg-[#e7f5ff] text-[#0066cc]' },
    signing: { label: '协议签署中', color: 'bg-[var(--brand-subtle)] text-[var(--brand)]' },
    in_progress: { label: '交付中', color: 'bg-[#e3f2fd] text-[#1976d2]' },
    accepted: { label: '已验收', color: 'bg-[var(--success-bg)] text-[var(--success)]' },
    pending_settlement:   { label: '待结算',       color: 'bg-[var(--brand-subtle)] text-[var(--brand)]' },
    pending_reconciliation: { label: '待对账',     color: 'bg-[#fff8e1] text-[#f57c00]' },
    settled:              { label: '已结算',       color: 'bg-[var(--bg-hover)] text-[var(--text-secondary)]' },
    cancelled:            { label: '已取消',       color: 'bg-gray-100 text-gray-500' },
    terminated:           { label: '已终止',       color: 'bg-red-50 text-red-700' },
    // P0-02: 私密订单状态
    private_pending:      { label: '待运营方接单', color: 'bg-indigo-50 text-indigo-700' },
    // P0-03: 终止结算待审核
    terminated_pending_settlement: { label: '终止结算待审核', color: 'bg-red-100 text-red-800' },
    // Bill statuses
    draft:                { label: '草稿',         color: 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]' },
    pending_confirm:      { label: '待确认',       color: 'bg-amber-50 text-amber-700' },
    pending_payment:      { label: '待支付',       color: 'bg-[var(--brand-subtle)] text-[var(--brand)]' },
    paid:                 { label: '已支付',       color: 'bg-[#e4f5ec] text-[#1e8050]' },
    booked:               { label: '已入账',       color: 'bg-green-100 text-green-700' },
    refund_pending:       { label: '待退款',       color: 'bg-purple-50 text-purple-700' },
    refund_confirm:       { label: '退款待确认',   color: 'bg-orange-50 text-orange-700' },
    written_off:          { label: '已冲销',       color: 'bg-red-50 text-red-600' },
    closed:               { label: '已关闭',       color: 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]' },
    // Contract statuses
    signed:               { label: '已签署',       color: 'bg-[var(--success-bg)] text-[var(--success)]' },
  };

  // 合同状态映射
  const contractStatusMap: Record<string, { label: string; color: string }> = {
    pending_review: { label: '待审核', color: 'bg-[#fff8e1] text-[#f57c00]' },
    pending:  		{ label: '待签署', color: 'bg-blue-50 text-blue-700' },
    active:   		{ label: '生效中', color: 'bg-[var(--success-bg)] text-[var(--success)]' },
    signed:   		{ label: '已签署', color: 'bg-[var(--success-bg)] text-[var(--success)]' },
    rejected: 		{ label: '已驳回', color: 'bg-red-50 text-red-700' },
  };

  // ── Bill action handlers ────────────────────────────────────────────────────
  const handleBillAction = (id: string, action: string) => {
    setBillingData(prev => prev.map(b => {
      if (b.id !== id) return b;
      if (action === 'mark_booked') return { ...b, status: 'booked' };
      if (action === 'confirm_draft') return { ...b, status: 'pending_confirm' };
      if (action === 'confirm_payment') return { ...b, status: 'pending_payment' };
      if (action === 'confirm_booking') return { ...b, status: 'booked' };
      if (action === 'confirm_agent') return { ...b, status: 'paid', hasAppeal: false };
      if (action === 'dismiss_appeal') return { ...b, hasAppeal: false };
      if (action === 'write_off') return { ...b, status: 'written_off' };
      if (action === 'start_coordination') return { ...b, closing_coordination: true, both_confirmed: true };
      if (action === 'close_bill') return { ...b, status: 'closed' };
      if (action === 'reject_appeal') return { ...b, hasAppeal: false, needs_resubmit: true };
      if (action === 'approve_appeal') return { ...b, status: 'refund_pending', hasAppeal: false };
      return b;
    }));
  };

  const handleBatchBooking = () => {
    if (selectedBillsForBooking.length === 0) return;
    setBillingData(prev => prev.map(b =>
      selectedBillsForBooking.includes(b.id) ? { ...b, status: 'booked' } : b
    ));
    setBatchBookingMode(false);
    setSelectedBillsForBooking([]);
  };

  const handleCreateBill = () => {
    if (!newBillForm.orderSelect || !newBillForm.amount) return;
    const newId = `BL-2026-${String(billingData.length + 1).padStart(4, '0')}`;
    const selectedOrder = ordersData.find(o => String(o.id) === newBillForm.orderSelect);
    setBillingData(prev => [...prev, {
      id: newId,
      orderTitle: selectedOrder?.title || newBillForm.orderSelect,
      billType: newBillForm.billType,
      amount: parseFloat(newBillForm.amount),
      status: 'draft',
      customer: selectedOrder?.customer || '',
      user: '',
      date: new Date().toISOString().split('T')[0],
      hasAppeal: false,
      closing_coordination: false,
      both_confirmed: false,
      needs_resubmit: false,
      appealReason: '',
      paymentRef: '',
    }]);
    setCreateBillModal(false);
    setNewBillForm({ orderSelect: '', billType: '阶段账单', amount: '' });
  };

  const pendingOrders = ordersData.filter(o =>
    o.status === 'pending_review' || o.status === 'private_pending' || o.status === 'terminated_pending_settlement'
  );
  const pendingBills = billingData.filter(b =>
    b.status === 'pending_confirm' || b.status === 'pending_payment' || b.status === 'refund_pending' || b.status === 'refund_confirm'
  );
  const pendingContracts = contractsData.filter(c => c.status === 'pending' || c.status === 'pending_review');
  const pendingAppeals = billingData.filter(b => b.hasAppeal);

  // ── Render: Card Grid Layout ────────────────────────────────────────────────
  return (
    <div className="w-full h-full bg-[#ffffff] overflow-auto">
      <div className="p-8">
        <div className="max-w-[1400px] mx-auto">
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[var(--text-primary)] mb-1">运营看板</h1>
            <p className="text-[13px] text-[var(--text-tertiary)]">平台业务总览与管理 — 卡片视图</p>
          </div>

          {/* ── 快捷统计条 ── */}
          <div className="flex items-center gap-6 mb-6 p-4 bg-[var(--bg-hover)] rounded-lg border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span className="text-[12px] text-[var(--text-tertiary)]">客户</span>
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">256</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span className="text-[12px] text-[var(--text-tertiary)]">用户</span>
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">1,280</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span className="text-[12px] text-[var(--text-tertiary)]">订单</span>
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">386</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span className="text-[12px] text-[var(--text-tertiary)]">交易额</span>
              <span className="text-[14px] font-semibold text-[var(--brand)]">¥48.2万</span>
            </div>
            <div className="flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span className="text-[12px] text-[var(--text-tertiary)]">合同</span>
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">142</span>
            </div>
          </div>

          {/* ── P1-02: 30分钟自动刷新条 ── */}
          <div className="flex items-center justify-between mb-6 p-3 bg-[#e7f5ff] rounded-lg border border-[#b3d8ff]">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#0066cc]" />
              <span className="text-[13px] text-[var(--text-secondary)]">下次刷新：</span>
              <span className="text-[14px] font-semibold text-[#0066cc] tabular-nums">{countdown}</span>
              <span className="text-[12px] text-[var(--text-tertiary)]">（每30分钟自动刷新）</span>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-1.5 text-[12px] rounded-full bg-[var(--brand)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              手动刷新
            </button>
          </div>

          <div className="space-y-6">
            {/* ── KPI 卡片行 ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => { setActiveModule('orders'); setOrderStatusFilter('pending_review'); }}>
                <KPICard title="今日待审订单" value={pendingOrders.length} color="var(--warning)" icon="clock" />
              </div>
              <div onClick={() => { setActiveModule('billing'); setBillStatusFilter('all'); }}>
                <KPICard title="待处理账单" value={pendingBills.length} color="var(--info)" icon="file" />
              </div>
              <div onClick={() => { setActiveModule('contracts'); setQuickFilter('pending'); }}>
                <KPICard title="待审协议" value={pendingContracts.length} color="var(--brand)" icon="file-text" />
              </div>
              <div onClick={() => { setActiveModule('billing'); }}>
                <KPICard title="待处理申诉" value={pendingAppeals.length} color="var(--danger)" icon="alert" />
              </div>
            </div>

            {/* ── 模块卡片网格（替代 Tab 切换）── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* 客户管理卡片 */}
              {loadingModules.has('customers') ? (
                <ModuleCardSkeleton />
              ) : errorModules.has('customers') ? (
                <ModuleCardError title="客户管理" onRetry={() => handleRetryModule('customers')} />
              ) : (
                <DashboardCard title="客户管理" count={customersData.length} onViewAll={() => { setActiveModule('customers'); setQuickFilter('all'); }}>
                  <p className="text-[12px] text-[var(--text-tertiary)] mb-3 leading-relaxed">管理平台注册客户，审核企业认证资料，查看客户订单历史。</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setActiveModule('customers'); setQuickFilter('all'); }}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >查看客户列表</button>
                    <button
                      onClick={() => { setActiveModule('customers'); setQuickFilter('pending'); }}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >审核待认证客户</button>
                  </div>
                </DashboardCard>
              )}

              {/* 用户管理卡片 */}
              {loadingModules.has('users') ? (
                <ModuleCardSkeleton />
              ) : errorModules.has('users') ? (
                <ModuleCardError title="用户管理" onRetry={() => handleRetryModule('users')} />
              ) : (
                <DashboardCard title="用户管理" count={usersData.length} onViewAll={() => { setActiveModule('users'); setQuickFilter('all'); }}>
                  <p className="text-[12px] text-[var(--text-tertiary)] mb-3 leading-relaxed">管理平台接单用户，审核用户技能认证，查看项目经历。</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setActiveModule('users'); setQuickFilter('all'); }}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >查看用户列表</button>
                    <button
                      onClick={() => { setActiveModule('users'); setQuickFilter('pending'); }}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >审核待认证用户</button>
                  </div>
                </DashboardCard>
              )}

              {/* 订单管理卡片 */}
              {loadingModules.has('orders') ? (
                <ModuleCardSkeleton />
              ) : errorModules.has('orders') ? (
                <ModuleCardError title="订单管理" onRetry={() => handleRetryModule('orders')} />
              ) : (
                <DashboardCard title="订单管理" count={ordersData.length} onViewAll={() => { setActiveModule('orders'); setOrderStatusFilter('all'); }}>
                  <p className="text-[12px] text-[var(--text-tertiary)] mb-3 leading-relaxed">全局订单管理，审核订单发布、监控订单进行状态。</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setActiveModule('orders'); setOrderStatusFilter('all'); }}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >查看订单列表</button>
                    <button
                      onClick={() => { setActiveModule('orders'); setOrderStatusFilter('pending_review'); }}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >审核待发订单</button>
                  </div>
                </DashboardCard>
              )}

              {/* 账单管理卡片 */}
              {loadingModules.has('billing') ? (
                <ModuleCardSkeleton />
              ) : errorModules.has('billing') ? (
                <ModuleCardError title="账单管理" onRetry={() => handleRetryModule('billing')} />
              ) : (
                <DashboardCard title="账单管理" count={billingData.length} onViewAll={() => { setActiveModule('billing'); setBillStatusFilter('all'); }}>
                  <p className="text-[12px] text-[var(--text-tertiary)] mb-3 leading-relaxed">管理账单生成、支付确认、退款处理及结算对账。</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setActiveModule('billing'); setBillStatusFilter('all'); }}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >查看账单列表</button>
                    <button
                      onClick={() => setCreateBillModal(true)}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >创建账单</button>
                    <button
                      onClick={() => { setActiveModule('billing'); }}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >处理申诉</button>
                  </div>
                </DashboardCard>
              )}

              {/* 合同管理卡片 */}
              {loadingModules.has('contracts') ? (
                <ModuleCardSkeleton />
              ) : errorModules.has('contracts') ? (
                <ModuleCardError title="合同管理" onRetry={() => handleRetryModule('contracts')} />
              ) : (
                <DashboardCard title="合同管理" count={contractsData.length} onViewAll={() => { setActiveModule('contracts'); setQuickFilter('all'); }}>
                  <p className="text-[12px] text-[var(--text-tertiary)] mb-3 leading-relaxed">审核并管理合同签署流程，查看协议详情与签署状态。</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setActiveModule('contracts'); setQuickFilter('all'); }}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >查看合同列表</button>
                    <button
                      onClick={() => { setActiveModule('contracts'); setQuickFilter('pending'); }}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >审核待签合同</button>
                  </div>
                </DashboardCard>
              )}

              {/* 待平台承接卡片 */}
              {loadingModules.has('platform_accept') ? (
                <ModuleCardSkeleton />
              ) : errorModules.has('platform_accept') ? (
                <ModuleCardError title="待平台承接" onRetry={() => handleRetryModule('platform_accept')} />
              ) : (
                <DashboardCard title="待平台承接" count={platformAcceptOrders.length} onViewAll={() => { setActiveModule('platform_accept'); }}>
                  <p className="text-[12px] text-[var(--text-tertiary)] mb-3 leading-relaxed">客户选择「平台承包转包」模式提交的订单，需运营评估后决定是否承接，可与客户沟通后确认。</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveModule('platform_accept')}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >查看订单列表</button>
                  </div>
                </DashboardCard>
              )}

              {/* 后台设置卡片 */}
              {loadingModules.has('settings') ? (
                <ModuleCardSkeleton />
              ) : errorModules.has('settings') ? (
                <ModuleCardError title="后台设置" onRetry={() => handleRetryModule('settings')} />
              ) : (
                <DashboardCard title="后台设置" count={8} onViewAll={() => { setActiveModule('settings'); }}>
                  <p className="text-[12px] text-[var(--text-tertiary)] mb-3 leading-relaxed">配置任务类型、开发工具、协议模板、发布模板、骨架模板、认证标签等参数。</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleNavigate('任务类型管理')}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >任务类型管理</button>
                    <button
                      onClick={() => handleNavigate('开发工具配置')}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >开发工具配置</button>
                    <button
                      onClick={() => handleNavigate('协议模板配置')}
                      className="px-3 py-1.5 text-[11px] rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                    >协议模板配置</button>
                  </div>
                </DashboardCard>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
         MODULE MODALS (drawer-style full-screen overlays)
         ══════════════════════════════════════════════════════════════════════ */}

      {/* ── 客户管理 弹窗 ── */}
      {activeModule === 'customers' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] max-w-6xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}>
                  <Users className="w-4 h-4" />
                </div>
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">客户管理</h2>
              </div>
              <button onClick={() => { setActiveModule(null); setQuickFilter(null); setSelectedCustomerId(null); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索客户名称或联系人"
                      className="w-[300px] pl-10 pr-4 py-2 border border-[var(--border-subtle)] rounded-full text-[13px] focus:outline-none focus:border-[var(--brand)]"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border-subtle)] rounded-full text-[13px] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>筛选</span>
                  </button>
                </div>
              </div>

              {/* Customer List */}
              {selectedCustomerId === null && (
                <div className="bg-white rounded-lg border border-[var(--border-subtle)]">
                  {quickFilter === 'pending' && (
                    <div className="px-6 py-2 bg-amber-50 border-b border-[var(--border-subtle)] text-[12px] text-amber-700 flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5" />已筛选：仅显示待认证客户
                    </div>
                  )}
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)]">
                        <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">客户名称</th>
                        <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">联系人</th>
                        <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">联系电话</th>
                        <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">状态</th>
                        <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">订单数</th>
                        <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">创建时间</th>
                        <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(quickFilter === 'pending' ? customersData.filter(c => c.status === 'pending') : customersData).map((customer) => (
                        <tr key={customer.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                          <td className="px-6 py-4 text-[13px] text-[var(--text-primary)]">{customer.name}</td>
                          <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">{customer.contact}</td>
                          <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">{customer.phone}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-[12px] ${statusMap[customer.status].color}`}>
                              {statusMap[customer.status].label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">{customer.orders}</td>
                          <td className="px-6 py-4 text-[13px] text-[var(--text-tertiary)]">{customer.createdAt}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                className="text-[var(--brand)] text-[13px] hover:underline"
                                onClick={() => setSelectedCustomerId(customer.id)}
                              >查看</button>
                              <button
                                className={`text-[13px] hover:underline ${
                                  customer.status !== 'pending'
                                    ? 'text-[var(--text-disabled)] cursor-not-allowed'
                                    : 'text-[var(--brand)]'
                                }`}
                                disabled={customer.status !== 'pending'}
                                onClick={() => customer.status === 'pending' && setCertReview({ type: 'customer', id: customer.id })}
                              >
                                {customer.status === 'verified' ? '已认证' : customer.status === 'rejected' ? '已驳回' : '审核认证'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Customer Detail */}
              {selectedCustomerId !== null && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <button
                      className="flex items-center gap-2 text-[var(--brand)] text-[13px] hover:underline"
                      onClick={() => setSelectedCustomerId(null)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>返回客户列表</span>
                    </button>
                  </div>
                  <div className="mb-6">
                    <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-4">客户基本信息</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-[var(--bg-hover)] rounded-lg">
                        <div className="text-[12px] text-[var(--text-tertiary)] mb-1">客户名称</div>
                        <div className="text-[14px] text-[var(--text-primary)] font-medium">
                          {customersData.find(c => c.id === selectedCustomerId)?.name}
                        </div>
                      </div>
                      <div className="p-4 bg-[var(--bg-hover)] rounded-lg">
                        <div className="text-[12px] text-[var(--text-tertiary)] mb-1">联系人</div>
                        <div className="text-[14px] text-[var(--text-primary)] font-medium">
                          {customersData.find(c => c.id === selectedCustomerId)?.contact}
                        </div>
                      </div>
                      <div className="p-4 bg-[var(--bg-hover)] rounded-lg">
                        <div className="text-[12px] text-[var(--text-tertiary)] mb-1">联系电话</div>
                        <div className="text-[14px] text-[var(--text-primary)] font-medium">
                          {customersData.find(c => c.id === selectedCustomerId)?.phone}
                        </div>
                      </div>
                      <div className="p-4 bg-[var(--bg-hover)] rounded-lg">
                        <div className="text-[12px] text-[var(--text-tertiary)] mb-1">认证状态</div>
                        <span className={`inline-block px-3 py-1 rounded-full text-[12px] ${statusMap[customersData.find(c => c.id === selectedCustomerId)?.status || 'pending'].color}`}>
                          {statusMap[customersData.find(c => c.id === selectedCustomerId)?.status || 'pending'].label}
                        </span>
                      </div>
                      <div className="p-4 bg-[var(--bg-hover)] rounded-lg">
                        <div className="text-[12px] text-[var(--text-tertiary)] mb-1">订单总数</div>
                        <div className="text-[14px] text-[var(--text-primary)] font-medium">
                          {customersData.find(c => c.id === selectedCustomerId)?.orders}
                        </div>
                      </div>
                      <div className="p-4 bg-[var(--bg-hover)] rounded-lg">
                        <div className="text-[12px] text-[var(--text-tertiary)] mb-1">创建时间</div>
                        <div className="text-[14px] text-[var(--text-primary)] font-medium">
                          {customersData.find(c => c.id === selectedCustomerId)?.createdAt}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-4">客户订单列表</h2>
                    <div className="bg-white rounded-lg border border-[var(--border-subtle)]">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[var(--border-subtle)]">
                            <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">订单编号</th>
                            <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">订单标题</th>
                            <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">任务类型</th>
                            <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">预算范围</th>
                            <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">状态</th>
                            <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">承接方</th>
                            <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getCustomerOrders(selectedCustomerId).map((order) => (
                            <tr key={order.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                              <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">#{order.id}</td>
                              <td className="px-6 py-4 text-[13px] text-[var(--text-primary)]">{order.title}</td>
                              <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">{order.taskType}</td>
                              <td className="px-6 py-4 text-[13px] text-[var(--brand)] font-medium">
                                ¥{order.budgetMin.toLocaleString()} - ¥{order.budgetMax.toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-[12px] ${statusMap[order.status]?.color || 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'}`}>
                                  {statusMap[order.status]?.label || order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">{order.contractor || '-'}</td>
                              <td className="px-6 py-4">
                                <button className="text-[var(--brand)] text-[13px] hover:underline">查看详情</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 用户管理 弹窗 ── */}
      {activeModule === 'users' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                  <UserCheck className="w-4 h-4" />
                </div>
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">用户管理</h2>
              </div>
              <button onClick={() => { setActiveModule(null); setQuickFilter(null); setSelectedUserId(null); setShowUserDetailModal(false); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      placeholder="搜索用户名称或技能"
                      className="w-[300px] pl-10 pr-4 py-2 border border-[var(--border-subtle)] rounded-full text-[13px] focus:outline-none focus:border-[var(--brand)]"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border-subtle)] rounded-full text-[13px] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>筛选</span>
                  </button>
                </div>
              </div>
              {quickFilter === 'pending' && (
                <div className="px-6 py-2 bg-amber-50 border-b border-[var(--border-subtle)] text-[12px] text-amber-700 flex items-center gap-2" style={{ margin: '0 -24px' }}>
                  <Filter className="w-3.5 h-3.5" />已筛选：仅显示待认证用户
                </div>
              )}
              <div className="bg-white rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">用户名称</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">等级</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">技能标签</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">完成项目</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">评分</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">状态</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(quickFilter === 'pending' ? usersData.filter(u => u.status === 'pending') : usersData).map((user) => (
                      <tr key={user.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                        <td className="px-6 py-4 text-[13px] text-[var(--text-primary)]">{user.name}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-2 py-0.5 bg-[var(--bg-hover)] text-[var(--text-secondary)] text-[12px] rounded">{user.level}</span>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">{user.skills.slice(0, 2).join(', ')}</td>
                        <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">{user.completedProjects}</td>
                        <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">{user.rating}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-[12px] ${statusMap[user.status].color}`}>
                            {statusMap[user.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              className="text-[var(--brand)] text-[13px] hover:underline"
                              onClick={() => { setSelectedUserId(user.id); setShowUserDetailModal(true); }}
                            >查看</button>
                            <button
                              className={`text-[13px] hover:underline ${
                                user.status !== 'pending'
                                  ? 'text-[var(--text-disabled)] cursor-not-allowed'
                                  : 'text-[var(--brand)]'
                              }`}
                              disabled={user.status !== 'pending'}
                              onClick={() => user.status === 'pending' && setCertReview({ type: 'user', id: user.id })}
                            >
                              {user.status === 'verified' ? '已认证' : user.status === 'rejected' ? '已驳回' : '审核认证'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 订单管理 弹窗 (P0-01/02/03 enhanced) ── */}
      {activeModule === 'orders' && (() => {
        // P0-01: 计算各状态数量
        const orderStatuses = [
          { key: 'pending_review', label: '待审核', count: ordersData.filter(o => o.status === 'pending_review').length },
          { key: 'promoting', label: '推广中', count: ordersData.filter(o => o.status === 'promoting').length },
          { key: 'signing', label: '协议签署中', count: ordersData.filter(o => o.status === 'signing').length },
          { key: 'in_progress', label: '交付中', count: ordersData.filter(o => o.status === 'in_progress').length },
          { key: 'accepted', label: '已验收', count: ordersData.filter(o => o.status === 'accepted').length },
          { key: 'pending_settlement', label: '待结算', count: ordersData.filter(o => o.status === 'pending_settlement').length },
          { key: 'settled', label: '已结算', count: ordersData.filter(o => o.status === 'settled').length },
          { key: 'cancelled', label: '已取消', count: ordersData.filter(o => o.status === 'cancelled').length },
          { key: 'terminated', label: '已终止', count: ordersData.filter(o => o.status === 'terminated').length },
          { key: 'terminated_pending_settlement', label: '终止结算待审核', count: ordersData.filter(o => o.status === 'terminated_pending_settlement').length },
        ];

        const filteredOrders = orderStatusFilter === 'all'
          ? ordersData
          : ordersData.filter(o => o.status === orderStatusFilter);

        return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] max-w-7xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">订单管理</h2>
              </div>
              <button onClick={() => { setActiveModule(null); setQuickFilter(null); setOrderStatusFilter('all'); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* P0-01: 状态分布标签云 */}
              <div className="mb-4">
                <div className="text-[12px] text-[var(--text-tertiary)] mb-2">订单状态分布（共 {ordersData.length} 个）</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setOrderStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-[12px] transition-all ${
                      orderStatusFilter === 'all'
                        ? 'bg-[var(--brand)] text-white'
                        : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--brand-subtle)]'
                    }`}
                  >全部 ({ordersData.length})</button>
                  {orderStatuses.filter(s => s.count > 0).map(status => (
                    <button
                      key={status.key}
                      onClick={() => setOrderStatusFilter(status.key)}
                      className={`px-3 py-1.5 rounded-full text-[12px] transition-all ${
                        orderStatusFilter === status.key
                          ? `${statusMap[status.key]?.color || 'bg-gray-200 text-gray-700'} ring-2 ring-offset-1`
                          : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:opacity-80'
                      }`}
                    >{status.label} ({status.count})</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      placeholder="搜索订单标题或客户"
                      className="w-[300px] pl-10 pr-4 py-2 border border-[var(--border-subtle)] rounded-full text-[13px] focus:outline-none focus:border-[var(--brand)]"
                    />
                  </div>
                  {/* P0-02: 待接单私密订单 已移至待平台承接模块 */}
                  <button
                    onClick={() => setOrderStatusFilter('terminated_pending_settlement')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] transition-all ${
                      orderStatusFilter === 'terminated_pending_settlement'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-800 hover:bg-red-100'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    终止结算待审核 ({ordersData.filter(o => o.status === 'terminated_pending_settlement').length})
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border-subtle)] rounded-full text-[13px] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>筛选</span>
                  </button>
                </div>
                <button className="flex items-center gap-2 px-5 py-2 bg-[var(--brand)] text-white rounded-full text-[13px] hover:bg-[var(--brand-hover)] transition-colors">
                  <Download className="w-4 h-4" />
                  <span>导出订单</span>
                </button>
              </div>
              <div className="bg-white rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">订单编号</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">订单标题</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">客户</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">预算</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">状态</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">报名数</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">发布时间</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-12 text-center text-[13px] text-[#aaa]">暂无符合条件的订单</td></tr>
                    ) : filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                        <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">#{order.id}</td>
                        <td className="px-6 py-4 text-[13px] text-[var(--text-primary)]">{order.title}</td>
                        <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">{order.customer}</td>
                        <td className="px-6 py-4 text-[13px] text-[var(--brand)] font-medium">¥{order.budget.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-[12px] ${statusMap[order.status]?.color || 'bg-gray-100 text-gray-500'}`}>
                            {statusMap[order.status]?.label || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">{order.applicants}</td>
                        <td className="px-6 py-4 text-[13px] text-[var(--text-tertiary)]">{order.createdAt}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button onClick={() => setOrderDetailId(order.id)} className="text-[var(--brand)] text-[13px] hover:underline">查看</button>
                            {/* 待审核：审核通过 + 驳回 */}
                            {order.status === 'pending_review' && (
                              <>
                                <button
                                  onClick={() => {
                                    setOrdersData(prev => prev.map(o => o.id === order.id ? { ...o, status: 'promoting' } : o));
                                  }}
                                  className="text-[var(--success)] text-[13px] hover:underline font-medium"
                                >审核通过</button>
                                <button
                                  onClick={() => setOrderAuditModal({ orderId: order.id })}
                                  className="text-[var(--danger)] text-[13px] hover:underline"
                                >驳回</button>
                              </>
                            )}
                            {/* 终止结算待审核：审核 */}
                            {order.status === 'terminated_pending_settlement' && (
                              <button
                                onClick={() => setTerminationReviewModal({ orderId: order.id, action: 'review' })}
                                className="text-[var(--brand)] text-[13px] hover:underline font-medium"
                              >审核</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── 账单与结算 弹窗 (enhanced with P0#6, P1#10, P1#11) ── */}
      {activeModule === 'billing' && (() => {
        const metricsData = [
          { label: '草稿待填价', count: billingData.filter(b => b.status === 'draft').length,           color: 'var(--text-tertiary)',    bg: 'var(--bg-hover)',  Icon: FileText },
          { label: '待确认',     count: billingData.filter(b => b.status === 'pending_confirm').length, color: 'var(--warning)', bg: 'var(--warning-bg)',  Icon: Clock },
          { label: '待支付',     count: billingData.filter(b => b.status === 'pending_payment').length, color: 'var(--brand)', bg: 'var(--brand-subtle)',  Icon: CreditCard },
          { label: '退款处理中', count: billingData.filter(b => ['refund_pending','refund_confirm'].includes(b.status)).length, color: 'var(--brand)', bg: 'var(--brand-subtle)', Icon: RotateCcw },
          { label: '申诉待核验', count: billingData.filter(b => b.hasAppeal).length,                   color: 'var(--danger-text)', bg: 'var(--danger-bg)',  Icon: AlertCircle },
        ];
        const billStatusTabs = [
          { key: 'all', label: '全部' },
          { key: 'draft', label: '草稿' },
          { key: 'pending_confirm', label: '待确认' },
          { key: 'pending_payment', label: '待支付' },
          { key: 'paid', label: '已支付' },
          { key: 'booked', label: '已入账' },
          { key: 'refund_pending', label: '待退款' },
          { key: 'refund_confirm', label: '退款待确认' },
          { key: 'closed', label: '已关闭' },
        ];
        const filtered = billingData.filter(b => {
          const matchStatus = billStatusFilter === 'all' || b.status === billStatusFilter;
          const q = billSearchQuery.toLowerCase();
          const matchSearch = !q || b.orderTitle.toLowerCase().includes(q) || b.customer.toLowerCase().includes(q) || b.user.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
          return matchStatus && matchSearch;
        });

        const getBillActions = (bill: typeof billingData[0]) => {
          const actions: { label: string; action: string; className: string }[] = [];

          // P0-04: 修正代确认→入账两步流程
          // Status-based actions
          if (bill.status === 'draft' && !bill.hasAppeal) {
            actions.push({ label: '确认', action: 'confirm_draft', className: 'text-[var(--success)]' });
          }
          if (bill.status === 'pending_confirm' && !bill.hasAppeal) {
            actions.push({ label: '支付确认', action: 'confirm_payment', className: 'text-[var(--brand)]' });
          }
          // Step 1: pending_payment → 代确认收款 → paid
          if (bill.status === 'pending_payment' && !bill.hasAppeal) {
            actions.push({ label: '代确认收款', action: 'confirm_agent', className: 'text-[var(--success)]' });
          }
          // Step 2: paid → 入账确认 → booked
          if (bill.status === 'paid' && !bill.hasAppeal) {
            actions.push({ label: '入账确认', action: 'mark_booked', className: 'text-green-700' });
          }
          if (!['closed','written_off'].includes(bill.status) && !bill.hasAppeal) {
            actions.push({ label: '冲销', action: 'write_off', className: 'text-red-400' });
          }

          // P0#6: Appeal actions
          if (bill.hasAppeal) {
            actions.push({ label: '查看申诉', action: 'view_appeal', className: 'text-[var(--brand)]' });
          }

          // P0#6: Close coordination for pending_confirm
          if (bill.status === 'pending_confirm' && !bill.hasAppeal) {
            if (!bill.closing_coordination) {
              actions.push({ label: '双方关闭', action: 'start_coordination', className: 'text-[var(--brand)]' });
            } else {
              actions.push({ label: '确认关闭', action: 'close_bill', className: 'text-[var(--success)]' });
            }
          }

          // Close for all non-closed statuses
          if (!['closed','written_off'].includes(bill.status) && !actions.some(a => a.action === 'close_bill' || a.action === 'start_coordination')) {
            actions.push({ label: '关闭', action: 'close_bill', className: 'text-[var(--text-tertiary)]' });
          }

          return actions;
        };

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] max-w-7xl w-full max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">账单与结算</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCreateBillModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[var(--brand)] text-white rounded-full text-[13px] hover:bg-[var(--brand-hover)] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>创建账单</span>
                  </button>
                  {billingData.filter(b => b.status === 'paid').length > 0 && (
                    <button
                      onClick={() => setBatchBookingMode(true)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-[13px] hover:border-[var(--brand)] transition-colors"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>批量入账</span>
                    </button>
                  )}
                  <button onClick={() => { setActiveModule(null); setQuickFilter(null); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Batch booking bar */}
                {batchBookingMode && (
                  <div className="flex items-center justify-between mb-3 p-3 bg-[#e4f5ec] border border-green-200 rounded-md">
                    <span className="text-[13px] text-green-700">已选中 {selectedBillsForBooking.length} 笔已支付账单进行批量入账</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setBatchBookingMode(false); setSelectedBillsForBooking([]); }}
                        className="px-3 py-1.5 text-[12px] border border-[var(--border-subtle)] rounded-md text-[var(--text-secondary)] hover:bg-white"
                      >取消</button>
                      <button
                        onClick={handleBatchBooking}
                        disabled={selectedBillsForBooking.length === 0}
                        className="px-3 py-1.5 text-[12px] bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >确认全部入账</button>
                    </div>
                  </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-5 gap-3 mb-5">
                  {metricsData.map((m, i) => (
                    <div key={i} className="bg-white rounded-md p-4 border border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] text-[var(--text-secondary)]">{m.label}</span>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.bg }}>
                          <m.Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                        </div>
                      </div>
                      <div className="text-2xl" style={{ color: m.color }}>{m.count}</div>
                    </div>
                  ))}
                </div>

                {/* Search + tabs */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className="relative flex-shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      value={billSearchQuery}
                      onChange={e => setBillSearchQuery(e.target.value)}
                      placeholder="搜索订单、客户、用户或账单号"
                      className="w-[260px] pl-10 pr-4 py-2 border border-[var(--border-subtle)] rounded-full text-[13px] focus:outline-none focus:border-[var(--brand)]"
                    />
                  </div>
                  <div className="flex items-center gap-1 flex-wrap flex-1">
                    {billStatusTabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setBillStatusFilter(tab.key)}
                        className="flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] transition-all"
                        style={billStatusFilter === tab.key ? { backgroundColor: 'var(--brand)', color: '#fff' } : { backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                      >{tab.label}</button>
                    ))}
                  </div>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--brand)] text-white rounded-full text-[13px] hover:bg-[var(--brand-hover)] transition-colors flex-shrink-0">
                    <Download className="w-3.5 h-3.5" /><span>导出</span>
                  </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-hover)]">
                        {batchBookingMode && <th className="text-center px-2 py-3 w-10"></th>}
                        <th className="text-left px-4 py-3 text-[12px] text-[#888] font-normal">账单编号</th>
                        <th className="text-left px-4 py-3 text-[12px] text-[#888] font-normal">关联订单</th>
                        <th className="text-left px-4 py-3 text-[12px] text-[#888] font-normal">类型</th>
                        <th className="text-left px-4 py-3 text-[12px] text-[#888] font-normal">客户</th>
                        <th className="text-left px-4 py-3 text-[12px] text-[#888] font-normal">接单方</th>
                        <th className="text-left px-4 py-3 text-[12px] text-[#888] font-normal">金额</th>
                        <th className="text-left px-4 py-3 text-[12px] text-[#888] font-normal">状态</th>
                        <th className="text-left px-4 py-3 text-[12px] text-[#888] font-normal">更新时间</th>
                        <th className="text-left px-4 py-3 text-[12px] text-[#888] font-normal">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={batchBookingMode ? 10 : 9} className="px-4 py-12 text-center text-[13px] text-[#aaa]">暂无符合条件的账单</td></tr>
                      ) : filtered.map(bill => {
                        const actions = getBillActions(bill);
                        return (
                          <tr key={bill.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                            {batchBookingMode && (
                              <td className="text-center px-2 py-3">
                                {bill.status === 'paid' && (
                                  <input
                                    type="checkbox"
                                    checked={selectedBillsForBooking.includes(bill.id)}
                                    onChange={() => {
                                      setSelectedBillsForBooking(prev =>
                                        prev.includes(bill.id) ? prev.filter(id => id !== bill.id) : [...prev, bill.id]
                                      );
                                    }}
                                    className="w-4 h-4"
                                  />
                                )}
                              </td>
                            )}
                            <td className="px-4 py-3">
                              <div className="text-[12px] text-[var(--text-secondary)]">{bill.id}</div>
                              {bill.hasAppeal && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded mt-1">
                                  <AlertCircle className="w-2.5 h-2.5" />申诉中
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-[13px] text-[#222] max-w-[130px] truncate">{bill.orderTitle}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex px-2 py-0.5 rounded text-[11px]"
                                style={
                                  bill.billType === '整单账单' ? { color: 'var(--brand-hover)', backgroundColor: 'var(--brand-subtle)' } :
                                  bill.billType === '阶段账单' ? { color: 'var(--success)', backgroundColor: 'var(--success-bg)' } :
                                  { color: 'var(--warning)', backgroundColor: 'var(--warning-bg)' }
                                }
                              >{bill.billType}</span>
                            </td>
                            <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)] max-w-[100px] truncate">{bill.customer}</td>
                            <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{bill.user}</td>
                            <td className="px-4 py-3 text-[13px]" style={{ color: bill.amount ? 'var(--brand)' : 'var(--text-disabled)' }}>
                              {bill.amount !== null ? (bill.amount === 0 ? '¥0（无尾款）' : `¥${bill.amount.toLocaleString()}`) : '待填写'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] ${statusMap[bill.status]?.color || 'bg-gray-100 text-gray-500'}`}>
                                {statusMap[bill.status]?.label || bill.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[12px] text-[#aaa]">{bill.date}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* 查看关联订单 (P1#10) */}
                                <button className="text-[var(--brand)] text-[12px] hover:underline">查看关联订单</button>

                                {/* Status-based action buttons */}
                                {actions.filter(a => a.action !== 'view_appeal').map((act, i) => {
                                  if (['mark_booked','confirm_draft','confirm_payment','confirm_agent','confirm_booking','write_off','close_bill','start_coordination'].includes(act.action)) {
                                    return (
                                      <button
                                        key={i}
                                        onClick={() => {
                                          if (act.action === 'mark_booked') {
                                            setBookingConfirmModal({ billId: bill.id });
                                          } else if (act.action === 'confirm_agent') {
                                            setBillActionModal({ billId: bill.id, action: act.action, actionLabel: act.label });
                                          } else {
                                            setBillActionModal({ billId: bill.id, action: act.action, actionLabel: act.label });
                                          }
                                        }}
                                        className={`text-[12px] ${act.className} hover:underline`}
                                      >{act.label}</button>
                                    );
                                  }
                                  return null;
                                })}

                                {/* P0#6: Appeal view (for bills with hasAppeal) */}
                                {bill.hasAppeal && (
                                  <button
                                    onClick={() => setAppealDetailModal({ billId: bill.id, reason: bill.appealReason || '未提供申诉原因' })}
                                    className="text-[12px] text-[var(--brand)] hover:underline"
                                  >查看申诉</button>
                                )}

                                {bill.needs_resubmit && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                    <Clock className="w-2.5 h-2.5" />等待用户补充凭证
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-[11px] text-[#bbb]">
                  一期账单均为线下结算渠道；运营可创建账单、标记入账、代确认申诉或冲销账单。二期将接入在线支付并增加「支付中」状态。
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 合同管理 弹窗 (enhanced with P0#7) ── */}
      {activeModule === 'contracts' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                  <FileSignature className="w-4 h-4" />
                </div>
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">合同管理</h2>
              </div>
              <button onClick={() => { setActiveModule(null); setQuickFilter(null); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      placeholder="搜索合同或订单"
                      className="w-[300px] pl-10 pr-4 py-2 border border-[var(--border-subtle)] rounded-full text-[13px] focus:outline-none focus:border-[var(--brand)]"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border-subtle)] rounded-full text-[13px] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>筛选</span>
                  </button>
                </div>
                <button className="flex items-center gap-2 px-5 py-2 bg-[var(--brand)] text-white rounded-full text-[13px] hover:bg-[var(--brand-hover)] transition-colors">
                  <Download className="w-4 h-4" />
                  <span>导出合同</span>
                </button>
              </div>
              <div className="bg-white rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">合同编号</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">关联订单</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">签约方</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">状态</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">签署日期</th>
                      <th className="text-left px-6 py-4 text-[13px] text-[var(--text-primary)] font-normal">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractsData.map((contract) => (
                      <tr key={contract.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                        <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">#{contract.id}</td>
                        <td className="px-6 py-4 text-[13px] text-[var(--text-primary)]">{contract.orderTitle}</td>
                        <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">{contract.parties}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-[12px] ${contractStatusMap[contract.status].color}`}>
                            {contractStatusMap[contract.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[var(--text-tertiary)]">{contract.signedDate}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              className="text-[var(--brand)] text-[13px] hover:underline"
                              onClick={() => setContractPreviewModal(contract.id)}
                            >查看协议</button>
                            {contract.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => setContractReviewModal({ id: contract.id, action: 'approve' })}
                                  className="text-[var(--success)] text-[13px] hover:underline font-medium"
                                >审核</button>
                                <button
                                  onClick={() => setContractReviewModal({ id: contract.id, action: 'reject' })}
                                  className="text-[var(--danger)] text-[13px] hover:underline"
                                >驳回</button>
                              </>
                            )}
                            {contract.status === 'pending_review' && (
                              <button
                                onClick={() => { setReviewContract(contract); setShowReviewModal(true); }}
                                className="px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors"
                                style={{ color: 'var(--brand)', border: '1px solid var(--brand)' }}
                              >
                                审核
                              </button>
                            )}
                            {contract.status === 'signed' && (
                              <>
                                <button className="text-[var(--brand)] text-[13px] hover:underline">查看</button>
                                <button className="text-[var(--brand)] text-[13px] hover:underline">下载</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 后台设置 弹窗 ── */}
      {activeModule === 'settings' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-disabled)' }}>
                  <Settings className="w-4 h-4" />
                </div>
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">后台设置</h2>
              </div>
              <button onClick={() => { setActiveModule(null); setQuickFilter(null); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-[16px] font-medium text-[var(--text-primary)] mb-1">系统配置</h2>
                <p className="text-[13px] text-[var(--text-tertiary)]">管理任务类型、开发工具、协议模板等配置项</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleNavigate('任务类型管理')}
                  className="p-6 bg-white border border-[var(--border-subtle)] rounded-lg hover:border-[var(--brand)] hover:shadow-sm transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[var(--bg-hover)] rounded-lg flex items-center justify-center group-hover:bg-[var(--brand-subtle)] transition-colors">
                      <Settings className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--brand)] transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">任务类型管理</div>
                      <div className="text-[12px] text-[var(--text-tertiary)]">配置任务分类</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('开发工具配置')}
                  className="p-6 bg-white border border-[var(--border-subtle)] rounded-lg hover:border-[var(--brand)] hover:shadow-sm transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[var(--bg-hover)] rounded-lg flex items-center justify-center group-hover:bg-[var(--brand-subtle)] transition-colors">
                      <Settings className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--brand)] transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">开发工具配置</div>
                      <div className="text-[12px] text-[var(--text-tertiary)]">配置开发工具</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('协议模板配置')}
                  className="p-6 bg-white border border-[var(--border-subtle)] rounded-lg hover:border-[var(--brand)] hover:shadow-sm transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[var(--bg-hover)] rounded-lg flex items-center justify-center group-hover:bg-[var(--brand-subtle)] transition-colors">
                      <FileSignature className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--brand)] transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">协议模板配置</div>
                      <div className="text-[12px] text-[var(--text-tertiary)]">配置协议模板</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('认证标签管理')}
                  className="p-6 bg-white border border-[var(--border-subtle)] rounded-lg hover:border-[var(--brand)] hover:shadow-sm transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[var(--bg-hover)] rounded-lg flex items-center justify-center group-hover:bg-[var(--brand-subtle)] transition-colors">
                      <BadgeCheck className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--brand)] transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">认证标签管理</div>
                      <div className="text-[12px] text-[var(--text-tertiary)]">管理认证标签</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('其他运营配置')}
                  className="p-6 bg-white border border-[var(--border-subtle)] rounded-lg hover:border-[var(--brand)] hover:shadow-sm transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[var(--bg-hover)] rounded-lg flex items-center justify-center group-hover:bg-[var(--brand-subtle)] transition-colors">
                      <Settings className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--brand)] transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">其他配置</div>
                      <div className="text-[12px] text-[var(--text-tertiary)]">系统参数配置</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         SHARED MODALS (User Detail, Billing, Contract, Cert Review)
         ══════════════════════════════════════════════════════════════════════ */}

      {/* ── 用户详情弹窗 ── */}
      {showUserDetailModal && selectedUserId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] sticky top-0 bg-white">
              <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">用户详细信息</h2>
              <button
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                onClick={() => { setShowUserDetailModal(false); setSelectedUserId(null); }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {usersData.filter(u => u.id === selectedUserId).map((user) => (
                <div key={user.id} className="bg-white">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-[var(--brand)] text-white rounded-full flex items-center justify-center text-xl font-semibold flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{user.name}</h3>
                        <span className="px-2 py-0.5 bg-[var(--bg-hover)] text-[var(--text-secondary)] text-[12px] rounded">{user.level}</span>
                      </div>
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-[#0066cc]" />
                          <span className="text-sm font-medium text-[var(--text-primary)]">{user.completedProjects}</span>
                          <span className="text-sm text-[var(--text-tertiary)]">完成项目</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-[var(--text-tertiary)]">评分：</span>
                          <span className="text-sm font-medium text-[var(--brand)]">{user.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {user.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-[#e7f5ff] text-[#0066cc] text-xs rounded-full">{skill}</span>
                        ))}
                      </div>
                      <div className="flex items-start gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-[var(--text-secondary)] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-[var(--text-secondary)]">{user.experience}</span>
                      </div>
                      <div className="bg-[var(--bg-hover)] rounded-lg p-4 mb-3">
                        <div className="text-xs text-[var(--text-tertiary)] mb-1">个人简介</div>
                        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{user.introduction}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                        <Clock className="w-3 h-3" />
                        <span>注册时间：{user.createdAt}</span>
                      </div>
                      <div className="mt-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-[12px] ${statusMap[user.status].color}`}>
                          {statusMap[user.status].label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-subtle)]">
              <button
                className="px-5 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-[13px] hover:bg-[var(--bg-hover)] transition-colors"
                onClick={() => { setShowUserDetailModal(false); setSelectedUserId(null); }}
              >关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* ── P1#10: 创建账单弹窗 ── */}
      {createBillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-[var(--shadow-modal)] max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">创建账单</h3>
              <button onClick={() => { setCreateBillModal(false); setNewBillForm({ orderSelect: '', billType: '阶段账单', amount: '' }); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-[12px] text-[var(--text-tertiary)] mb-1.5">关联订单 <span className="text-[var(--danger)]">*</span></div>
                <select
                  value={newBillForm.orderSelect}
                  onChange={e => setNewBillForm(prev => ({ ...prev, orderSelect: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-md text-[13px] focus:outline-none focus:border-[var(--brand)] bg-white"
                >
                  <option value="">请选择订单</option>
                  {ordersData.map(o => (
                    <option key={o.id} value={o.id}>#{o.id} {o.title} ({o.customer})</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-[12px] text-[var(--text-tertiary)] mb-1.5">账单类型 <span className="text-[var(--danger)]">*</span></div>
                <div className="flex gap-2">
                  {['阶段账单', '尾款账单', '整单账单'].map(type => (
                    <button
                      key={type}
                      onClick={() => setNewBillForm(prev => ({ ...prev, billType: type }))}
                      className={`flex-1 px-3 py-2 rounded-md text-[13px] transition-colors ${
                        newBillForm.billType === type
                          ? 'bg-[var(--brand)] text-white'
                          : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand)]'
                      }`}
                    >{type}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[12px] text-[var(--text-tertiary)] mb-1.5">账单金额 <span className="text-[var(--danger)]">*</span></div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--text-tertiary)]">¥</span>
                  <input
                    type="number"
                    value={newBillForm.amount}
                    onChange={e => setNewBillForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="请输入金额"
                    className="w-full pl-8 pr-4 py-2 border border-[var(--border-subtle)] rounded-md text-[13px] focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => { setCreateBillModal(false); setNewBillForm({ orderSelect: '', billType: '阶段账单', amount: '' }); }}
                className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md text-[13px] hover:bg-[var(--bg-hover)] transition-colors"
              >取消</button>
              <button
                disabled={!newBillForm.orderSelect || !newBillForm.amount}
                onClick={handleCreateBill}
                className="px-4 py-2 bg-[var(--brand)] text-white rounded-md text-[13px] hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >确认创建</button>
            </div>
          </div>
        </div>
      )}

      {/* ── P1#11: 入账确认弹窗 ── */}
      {bookingConfirmModal && (() => {
        const bill = billingData.find(b => b.id === bookingConfirmModal.billId);
        if (!bill) return null;
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-md shadow-[var(--shadow-modal)] max-w-md w-full">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">入账确认</h3>
                <button onClick={() => setBookingConfirmModal(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-[12px] text-[var(--text-tertiary)]">账单编号</span>
                  <span className="text-[13px] text-[var(--text-primary)] font-medium">{bill.id}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[12px] text-[var(--text-tertiary)]">账单金额</span>
                  <span className="text-[14px] text-[var(--brand)] font-semibold">¥{bill.amount?.toLocaleString() || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[12px] text-[var(--text-tertiary)]">关联订单</span>
                  <span className="text-[13px] text-[var(--text-primary)]">{bill.orderTitle}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[12px] text-[var(--text-tertiary)]">签约方</span>
                  <span className="text-[13px] text-[var(--text-primary)]">{bill.customer} / {bill.user}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[12px] text-[var(--text-tertiary)]">支付凭证</span>
                  <span className="text-[13px] text-[var(--text-secondary)]">{bill.paymentRef || '未关联'}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#e4f5ec] rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-[12px] text-green-700">确认后该账单状态将从「已支付」变更为「已入账」。</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => setBookingConfirmModal(null)}
                  className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md text-[13px] hover:bg-[var(--bg-hover)] transition-colors"
                >取消</button>
                <button
                  onClick={() => {
                    handleBillAction(bookingConfirmModal.billId, 'mark_booked');
                    setBookingConfirmModal(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-[13px] hover:bg-green-700 transition-colors"
                >确认入账</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── P1#10: Bill action confirmation modal ── */}
      {billActionModal && (() => {
        const bill = billingData.find(b => b.id === billActionModal.billId);
        if (!bill) return null;
        const actionDescriptions: Record<string, string> = {
          confirm_draft: '确认后账单状态将从「草稿」变更为「待确认」。',
          confirm_payment: '确认后账单状态将从「待确认」变更为「待支付」。',
          confirm_agent: '确认后代收款，账单状态将从「待支付」变更为「已支付」。',
          confirm_booking: '确认后账单状态将从「已支付」变更为「已入账」。',
          write_off: '确认后账单将被冲销，状态变为「已冲销」。',
          close_bill: '确认后将关闭此账单，状态变为「已关闭」。',
          start_coordination: '将通知双方确认关闭此账单，双方均确认后账单关闭。',
        };
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-md shadow-[var(--shadow-modal)] max-w-md w-full">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">确认{billActionModal.actionLabel}</h3>
                <button onClick={() => setBillActionModal(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] text-[var(--text-tertiary)]">账单编号</span>
                  <span className="text-[13px] text-[var(--text-primary)] font-medium">{bill.id}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] text-[var(--text-tertiary)]">账单金额</span>
                  <span className="text-[14px] text-[var(--brand)] font-semibold">¥{bill.amount?.toLocaleString() || '-'}</span>
                </div>
                <p className="text-[13px] text-[var(--text-secondary)] bg-[var(--bg-hover)] rounded-md p-3">
                  {actionDescriptions[billActionModal.action] || `确认执行「${billActionModal.actionLabel}」操作？`}
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => setBillActionModal(null)}
                  className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md text-[13px] hover:bg-[var(--bg-hover)] transition-colors"
                >取消</button>
                <button
                  onClick={() => {
                    handleBillAction(billActionModal.billId, billActionModal.action);
                    setBillActionModal(null);
                  }}
                  className="px-4 py-2 bg-[var(--brand)] text-white rounded-md text-[13px] hover:bg-[var(--brand-hover)] transition-colors"
                >确认</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 申诉详情弹窗 (enhanced P0#6 with 同意申诉 button) ── */}
      {appealDetailModal && (() => {
        const bill = billingData.find(b => b.id === appealDetailModal.billId);
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-md shadow-[var(--shadow-modal)] max-w-lg w-full">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">申诉详情</h3>
                <button onClick={() => setAppealDetailModal(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="text-[12px] text-[var(--text-tertiary)] mb-1">账单编号</div>
                  <div className="text-[13px] text-[var(--text-primary)] font-medium">{appealDetailModal.billId}</div>
                </div>
                {bill && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">账单金额</div>
                        <div className="text-[13px] text-[var(--brand)] font-medium">¥{bill.amount?.toLocaleString() || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">当前状态</div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] ${statusMap[bill.status]?.color}`}>{statusMap[bill.status]?.label}</span>
                      </div>
                      <div>
                        <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">关联订单</div>
                        <div className="text-[13px] text-[var(--text-primary)]">{bill.orderTitle}</div>
                      </div>
                    </div>
                    <div className="border-t border-[var(--border-subtle)] pt-3">
                      <div className="text-[11px] text-[var(--text-tertiary)] mb-1.5">签约方</div>
                      <div className="text-[13px] text-[var(--text-primary)] mb-3">{bill.customer} / {bill.user}</div>
                    </div>
                  </>
                )}
                <div>
                  <div className="text-[12px] text-[var(--text-tertiary)] mb-1.5">申诉原因</div>
                  <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-hover)] rounded-md p-3">
                    {appealDetailModal.reason}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-5 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => setRejectAppealModal({ billId: appealDetailModal.billId })}
                  className="px-4 py-2 border border-[var(--danger)] text-[var(--danger)] rounded-md text-[13px] hover:bg-red-50 transition-colors"
                >驳回申诉</button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAppealDetailModal(null)}
                    className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md text-[13px] hover:bg-[var(--bg-hover)] transition-colors"
                  >关闭</button>
                  <button
                    onClick={() => {
                      handleBillAction(appealDetailModal.billId, 'approve_appeal');
                      setAppealDetailModal(null);
                    }}
                    className="px-4 py-2 bg-[var(--success)] text-white rounded-md text-[13px] hover:opacity-90 transition-colors"
                  >同意申诉</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 驳回申诉弹窗 ── */}
      {rejectAppealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-[var(--shadow-modal)] max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">驳回申诉</h3>
              <button onClick={() => { setRejectAppealModal(null); setRejectAppealReason(''); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-[13px] text-[var(--text-secondary)] mb-4">
                驳回此申诉后，用户需重新补充凭证后再次提交。
              </p>
              <div className="text-[12px] text-[var(--text-tertiary)] mb-1.5">驳回原因 <span className="text-[var(--danger)]">*</span></div>
              <textarea
                value={rejectAppealReason}
                onChange={e => setRejectAppealReason(e.target.value)}
                placeholder="请填写驳回原因"
                rows={3}
                className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-md text-[13px] focus:outline-none focus:border-[var(--brand)] resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => { setRejectAppealModal(null); setRejectAppealReason(''); }}
                className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md text-[13px] hover:bg-[var(--bg-hover)] transition-colors"
              >取消</button>
              <button
                disabled={!rejectAppealReason.trim()}
                onClick={() => {
                  if (!rejectAppealReason.trim()) return;
                  handleBillAction(rejectAppealModal.billId, 'reject_appeal');
                  setRejectAppealModal(null);
                  setRejectAppealReason('');
                }}
                className="px-4 py-2 bg-[var(--danger)] text-white rounded-md text-[13px] hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >确认驳回</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 合同审核弹窗 (enhanced P0#7 with contract details) ── */}
      {contractReviewModal && (() => {
        const contract = contractsData.find(c => c.id === contractReviewModal.id);
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-md shadow-[var(--shadow-modal)] max-w-lg w-full max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] sticky top-0 bg-white">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                  {contractReviewModal.action === 'approve' ? '审核合同 - 通过' : '审核合同 - 驳回'}
                </h3>
                <button onClick={() => { setContractReviewModal(null); setContractRejectReason(''); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* Contract details */}
                {contract && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[12px] text-[var(--text-tertiary)] mb-0.5">合同编号</div>
                        <div className="text-[13px] text-[var(--text-primary)] font-medium">#{contract.id}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-[var(--text-tertiary)] mb-0.5">当前状态</div>
                        <span className={`inline-block px-3 py-1 rounded-full text-[12px] ${contractStatusMap[contract.status].color}`}>
                          {contractStatusMap[contract.status].label}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] text-[var(--text-tertiary)] mb-0.5">关联订单</div>
                      <div className="text-[13px] text-[var(--text-primary)] font-medium">{contract.orderTitle}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-[var(--text-tertiary)] mb-0.5">签约方</div>
                      <div className="text-[13px] text-[var(--text-primary)]">{contract.parties}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-[var(--text-tertiary)] mb-0.5">关键条款摘要</div>
                      <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-hover)] rounded-md p-3">
                        {contract.keyTerms || '暂无摘要信息'}
                      </div>
                    </div>
                  </>
                )}

                {contractReviewModal.action === 'approve' ? (
                  <div className="flex items-center gap-2 p-3 bg-[#e4f5ec] rounded-md">
                    <CheckCircle className="w-4 h-4 text-[var(--success)] flex-shrink-0" />
                    <div>
                      <p className="text-[12px] text-green-700 font-medium">确认通过合同审核</p>
                      <p className="text-[11px] text-green-600">审核通过后合同状态将变为「已签署」。</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[13px] text-[var(--text-secondary)] mb-3">
                      请填写驳回原因，将通知签署方修改后重新提交。
                    </p>
                    <div className="text-[12px] text-[var(--text-tertiary)] mb-1.5">驳回原因 <span className="text-[var(--danger)]">*</span></div>
                    <textarea
                      value={contractRejectReason}
                      onChange={e => setContractRejectReason(e.target.value)}
                      placeholder="请填写驳回原因"
                      rows={3}
                      className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-md text-[13px] focus:outline-none focus:border-[var(--brand)] resize-none"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => { setContractReviewModal(null); setContractRejectReason(''); }}
                  className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md text-[13px] hover:bg-[var(--bg-hover)] transition-colors"
                >取消</button>
                <button
                  disabled={contractReviewModal.action === 'reject' && !contractRejectReason.trim()}
                  onClick={() => {
                    if (contractReviewModal.action === 'reject' && !contractRejectReason.trim()) return;
                    setContractsData(prev => prev.map(c => {
                      if (c.id !== contractReviewModal.id) return c;
                      return {
                        ...c,
                        status: contractReviewModal.action === 'approve' ? 'signed' : 'rejected',
                        signedDate: contractReviewModal.action === 'approve' ? '2026-06-01' : '-',
                      };
                    }));
                    setContractReviewModal(null);
                    setContractRejectReason('');
                  }}
                  className={`px-4 py-2 rounded-md text-[13px] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    contractReviewModal.action === 'approve'
                      ? 'bg-[var(--success)] hover:opacity-90'
                      : 'bg-[var(--danger)] hover:opacity-90'
                  }`}
                >
                  {contractReviewModal.action === 'approve' ? '确认通过' : '确认驳回'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 查看协议弹窗 ── */}
      {contractPreviewModal !== null && (() => {
        const contract = contractsData.find(c => c.id === contractPreviewModal);
        if (!contract) return null;
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-md shadow-[var(--shadow-modal)] max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] sticky top-0 bg-white">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">协议详情 - #{contract.id}</h3>
                <button onClick={() => setContractPreviewModal(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-[12px] text-[var(--text-tertiary)] mb-1">关联订单</div>
                    <div className="text-[14px] text-[var(--text-primary)] font-medium">{contract.orderTitle}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[var(--text-tertiary)] mb-1">当前状态</div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[12px] ${contractStatusMap[contract.status].color}`}>
                      {contractStatusMap[contract.status].label}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[12px] text-[var(--text-tertiary)] mb-1">签约方</div>
                    <div className="text-[14px] text-[var(--text-primary)] font-medium">{contract.parties}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[var(--text-tertiary)] mb-1">签署日期</div>
                    <div className="text-[14px] text-[var(--text-secondary)]">{contract.signedDate}</div>
                  </div>
                </div>
                <div className="border-t border-[var(--border-subtle)] pt-4">
                  <div className="text-[12px] text-[var(--text-tertiary)] mb-3">协议正文</div>
                  <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed space-y-3 bg-[var(--bg-hover)] rounded-md p-4">
                    <p><strong>第一条 项目内容</strong></p>
                    <p>甲方委托乙方完成「{contract.orderTitle}」项目的开发/设计工作，具体工作内容详见《项目需求说明书》。双方确认本协议作为项目执行的依据性文件。</p>
                    <p><strong>第二条 交付标准</strong></p>
                    <p>乙方应按照双方确认的《项目需求说明书》中约定的功能、性能、UI 设计等标准完成开发/设计工作。验收以甲方签字的验收报告为准。</p>
                    <p><strong>第三条 知识产权</strong></p>
                    <p>项目成果的知识产权归甲方所有，乙方不得将项目成果用于其他商业用途。乙方保留项目中使用到的通用技术及开源组件的所有权。</p>
                    <p><strong>第四条 保密条款</strong></p>
                    <p>双方应对合作过程中涉及的技术资料、商业信息等保密，未经对方书面同意不得向第三方披露。</p>
                    <p><strong>第五条 违约责任</strong></p>
                    <p>任何一方违反本协议约定的，应承担相应的违约责任。因不可抗力导致无法履行协议的，双方协商解决。</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => setContractPreviewModal(null)}
                  className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md text-[13px] hover:bg-[var(--bg-hover)] transition-colors"
                >关闭</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── P0-03: 终止结算审核弹窗 ──────────────────────────────────── */}
      {terminationReviewModal && (() => {
        const order = ordersData.find(o => o.id === terminationReviewModal.orderId);
        if (!order) return null;
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-md shadow-[var(--shadow-modal)] max-w-xl w-full">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">终止结算审核</h3>
                <button onClick={() => { setTerminationReviewModal(null); setTerminationRejectReason(''); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-md" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div><div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">订单编号</div><div className="text-[13px] text-[var(--text-primary)] font-medium">#{order.id}</div></div>
                  <div><div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">客户</div><div className="text-[13px] text-[var(--text-primary)]">{order.customer}</div></div>
                  <div><div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">订单标题</div><div className="text-[13px] text-[var(--text-primary)]">{order.title}</div></div>
                  <div><div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">预算金额</div><div className="text-[13px] text-[var(--brand)] font-semibold">¥{order.budget.toLocaleString()}</div></div>
                </div>
                <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }}>
                  <div className="text-[12px] font-medium" style={{ color: 'var(--warning)' }}>终止原因（客户提交）</div>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1 leading-relaxed">客户以「交付不符合预期」为由申请终止订单，已与接单方沟通确认。依据双方签署的协议条款，需运营方审核终止结算方案。双方约定按已完成工作量的 60% 进行结算，剩余部分作废。</p>
                </div>
                <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div className="text-[11px] text-[var(--text-tertiary)] mb-1">终止结算说明</div>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">审核通过后订单进入「已终止」状态，按终止结算方案执行。如需驳回，请填写驳回原因，订单也将进入已终止状态。</p>
                </div>
                <div>
                  <div className="text-[12px] text-[var(--text-tertiary)] mb-1.5">审核意见 <span className="text-[var(--text-tertiary)]">（驳回时必填）</span></div>
                  <textarea
                    value={terminationRejectReason}
                    onChange={e => setTerminationRejectReason(e.target.value)}
                    placeholder="输入审核意见或驳回原因..."
                    rows={3}
                    className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-md text-[13px] focus:outline-none focus:border-[var(--brand)] resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => { setTerminationReviewModal(null); setTerminationRejectReason(''); }}
                  className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md text-[13px] hover:bg-[var(--bg-hover)] transition-colors"
                >取消</button>
                <button
                  onClick={() => {
                    if (!terminationRejectReason.trim()) { setToastMsg('驳回需填写审核意见'); return; }
                    handleTerminationReject(terminationReviewModal.orderId);
                  }}
                  className="px-4 py-2 rounded-md text-[13px] text-white bg-[var(--danger)] hover:opacity-90 transition-colors"
                >驳回</button>
                <button
                  onClick={() => handleTerminationApprove(terminationReviewModal.orderId)}
                  className="px-4 py-2 rounded-md text-[13px] text-white bg-[var(--success)] hover:opacity-90 transition-colors"
                >审核通过</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── P1-04: 订单审核弹窗 ──────────────────────────────────── */}
      {orderAuditModal && (() => {
        const order = ordersData.find(o => o.id === orderAuditModal.orderId);
        if (!order) return null;
        const resetAuditModal = () => { setOrderAuditModal(null); setOrderAuditRejectMode(false); setOrderAuditRejectReason(''); };
        return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] max-w-[560px] w-full max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]"
              style={{ background: 'linear-gradient(135deg, #07091a 0%, #0d0b2e 60%, #0a0e28 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(82,96,240,0.25)', border: '1px solid rgba(82,96,240,0.35)' }}>
                  <ShoppingCart className="w-4.5 h-4.5" style={{ color: 'var(--brand)' }} />
                </div>
                <div>
                  <div className="text-[15px] text-white">订单审核</div>
                  <div className="text-[12px] text-white/45 mt-0.5">#{order.id} {order.title}</div>
                </div>
              </div>
              <button onClick={resetAuditModal}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden">
                <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, var(--brand), #7c3aed)' }} />
                <div className="px-5 py-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">订单编号</div>
                    <div className="text-[13px] text-[var(--text-primary)]">#{order.id}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">订单标题</div>
                    <div className="text-[13px] text-[var(--text-primary)]">{order.title}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">客户</div>
                    <div className="text-[13px] text-[var(--text-primary)]">{order.customer}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">预算</div>
                    <div className="text-[13px] text-[var(--brand)] font-medium">¥{order.budget.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">当前状态</div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[12px] ${statusMap[order.status]?.color || 'bg-gray-100 text-gray-500'}`}>
                      {statusMap[order.status]?.label || order.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">报名数</div>
                    <div className="text-[13px] text-[var(--text-primary)]">{order.applicants}</div>
                  </div>
                </div>
              </div>

              {/* Reject reason textarea */}
              {orderAuditRejectMode && (
                <div className="bg-red-50 border border-red-100 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-[13px] text-red-700">填写打回原因（将通知发布方修改后重新提交）</span>
                  </div>
                  <textarea
                    value={orderAuditRejectReason}
                    onChange={e => setOrderAuditRejectReason(e.target.value)}
                    rows={4}
                    placeholder="说明打回原因，例如：订单内容不合规、预算设置不合理、缺少必要的交付说明..."
                    className="w-full px-3 py-2.5 border border-red-200 rounded-lg text-[13px] text-[var(--text-primary)] bg-white resize-none outline-none focus:border-red-400 transition-colors"
                  />
                </div>
              )}

              {!orderAuditRejectMode && (
                <div className="bg-amber-50 border border-amber-100 rounded-md p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[12px] text-amber-700">此订单当前状态为「{statusMap[order.status]?.label || order.status}」，审核通过后可变更订单状态。</p>
                    <p className="text-[11px] text-amber-500 mt-0.5">打回将通知发布方修改后重新提交。</p>
                  </div>
                </div>
              )}

              {order.status === 'pending_review' && (
                <div className="bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-md p-4">
                  <div className="text-[13px] text-[var(--text-primary)] font-medium mb-2">审核清单</div>
                  <ul className="text-[12px] text-[var(--text-tertiary)] space-y-1.5 list-disc pl-4">
                    <li>确认订单内容合规，无违法违规信息</li>
                    <li>确认任务类型、预算范围设置合理</li>
                    <li>确认交付需求描述清晰，可被接单方理解</li>
                    <li>打回时将向发布方推送驳回原因，便于修改后重新提交</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-hover)]">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setOrdersData(prev => prev.map(o =>
                      o.id === order.id ? { ...o, status: 'promoting' } : o
                    ));
                    resetAuditModal();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[13px] text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #1e8c58 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}
                >
                  <CheckCircle className="w-4 h-4" />
                  审核通过
                </button>
                <button
                  onClick={() => {
                    if (!orderAuditRejectMode) {
                      setOrderAuditRejectMode(true);
                      return;
                    }
                    if (!orderAuditRejectReason.trim()) return;
                    setOrdersData(prev => prev.map(o =>
                      o.id === order.id ? { ...o, status: 'cancelled' } : o
                    ));
                    resetAuditModal();
                  }}
                  disabled={orderAuditRejectMode && !orderAuditRejectReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md border-2 text-[13px] transition-colors hover:bg-red-50 disabled:opacity-40"
                  style={{ borderColor: '#fca5a5', color: 'var(--danger)' }}
                >
                  <XCircle className="w-4 h-4" />
                  打回
                </button>
                <button onClick={resetAuditModal}
                  className="px-5 py-2.5 rounded-md border-2 border-gray-200 text-[13px] text-[var(--text-secondary)] hover:bg-white transition-colors">
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── 认证审核弹窗 ──────────────────────────────────────────── */}
      {certReview && (() => {
        if (certReview.type === 'customer') {
          const customer = customersData.find(c => c.id === certReview.id);
          const certData = CUSTOMER_CERT_SUBMISSIONS[certReview.id];
          if (!customer || !certData) return null;
          return (
            <CertReviewModal
              type="customer"
              entityName={customer.name}
              customerData={certData}
              onApprove={handleCertApprove}
              onReject={handleCertReject}
              onClose={() => setCertReview(null)}
            />
          );
        } else {
          const user = usersData.find(u => u.id === certReview.id);
          const certData = USER_CERT_SUBMISSIONS[certReview.id];
          if (!user || !certData) return null;
          return (
            <CertReviewModal
              type="user"
              entityName={user.name}
              userData={{
                userName: user.name,
                isTeam: certData.isTeam,
                teamName: certData.teamName,
                skills: user.skills,
                experience: user.experience,
                capabilityIntro: certData.capabilityIntro,
                qualificationCerts: certData.qualificationCerts,
                submittedAt: certData.submittedAt,
              }}
              onApprove={handleCertApprove}
              onReject={handleCertReject}
              onClose={() => setCertReview(null)}
            />
          );
        }
      })()}

      {/* ── P0: 合同审核弹窗 ─────────────────────────────────────────────────── */}
      {showReviewModal && reviewContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-xl p-6 w-full max-w-lg mx-4" style={{ backgroundColor: 'var(--bg-surface)', boxShadow: 'var(--shadow-modal)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>合同审核</h3>
              <button onClick={() => { setShowReviewModal(false); setReviewContract(null); setReviewAction(null); setReviewComment(''); }}
                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--bg-hover)] transition-colors"
                style={{ color: 'var(--text-tertiary)' }}>✕</button>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <div className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>合同名称</div>
                <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{reviewContract.title}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>甲方（客户）</div>
                  <div className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{reviewContract.partyA || reviewContract.customerName || '未知'}</div>
                </div>
                <div>
                  <div className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>乙方（接单方）</div>
                  <div className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{reviewContract.partyB || reviewContract.contractorName || '未知'}</div>
                </div>
              </div>
              <div>
                <div className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>合同金额</div>
                <div className="text-[15px] font-semibold" style={{ color: 'var(--brand)' }}>{reviewContract.amount || '待填写'}</div>
              </div>
              <div>
                <div className="text-[11px] mb-2" style={{ color: 'var(--text-tertiary)' }}>审核意见</div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="输入审核意见（驳回时必填）"
                  rows={3}
                  className="w-full px-3 py-2 rounded-md text-[13px] resize-none outline-none"
                  style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-root)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!reviewComment) return;
                  reviewContract.status = 'rejected';
                  setShowReviewModal(false);
                  setReviewContract(null);
                  setReviewAction(null);
                  setReviewComment('');
                }}
                className="flex-1 py-2 rounded-md text-[13px] font-medium transition-colors"
                style={{ backgroundColor: 'var(--danger)', color: '#fff' }}>
                驳回
              </button>
              <button
                onClick={() => {
                  reviewContract.status = 'active';
                  setShowReviewModal(false);
                  setReviewContract(null);
                  setReviewAction(null);
                  setReviewComment('');
                }}
                className="flex-1 py-2 rounded-md text-[13px] font-medium transition-colors"
                style={{ backgroundColor: 'var(--success)', color: '#fff' }}>
                通过
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 待平台承接订单弹窗 ── */}
      {platformAcceptModal && (() => {
        const order = platformAcceptOrders.find(o => o.id === platformAcceptModal.orderId);
        if (!order) return null;
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] max-w-lg w-full">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                  {platformAcceptModal.mode === 'accept' ? '确认承接订单' : '拒绝承接订单'}
                </h3>
                <button onClick={() => { setPlatformAcceptModal(null); setPlatformRejectReason(''); }} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div className="text-[14px] font-medium text-[var(--text-primary)] mb-2">{order.title}</div>
                  <div className="text-[12px] text-[var(--text-tertiary)] space-y-1">
                    <div>客户：{order.customer} · {order.contactName}</div>
                    <div>预算：¥{order.budget.toLocaleString()}</div>
                    <div>提交时间：{order.submittedAt}</div>
                    <div>联系：{order.contactPhone}</div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {order.taskTypes.map(t => <span key={t} className="px-2 py-0.5 text-[11px] rounded-full" style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}>{t}</span>)}
                  </div>
                </div>
                <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{order.description}</div>

                {platformAcceptModal.mode === 'reject' && (
                  <div>
                    <label className="text-[12px] font-medium text-[var(--text-primary)] mb-1.5 block">拒绝理由（将发送给客户）</label>
                    <textarea
                      value={platformRejectReason}
                      onChange={e => setPlatformRejectReason(e.target.value)}
                      placeholder="请输入拒绝原因，例如：暂无相关资源承接、预算与工作量不匹配..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-md text-[12px] resize-none outline-none"
                      style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-root)', color: 'var(--text-primary)' }}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 px-5 pb-5">
                <button
                  onClick={() => { setPlatformAcceptModal(null); setPlatformRejectReason(''); }}
                  className="flex-1 py-2 rounded-md text-[13px] font-medium transition-colors"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', backgroundColor: 'transparent' }}
                >取消</button>
                {platformAcceptModal.mode === 'accept' ? (
                  <button
                    onClick={() => handlePlatformAccept(order.id)}
                    className="flex-1 py-2 rounded-md text-[13px] font-medium text-white transition-colors hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))' }}
                  >确认承接</button>
                ) : (
                  <button
                    onClick={() => handlePlatformReject(order.id)}
                    disabled={!platformRejectReason.trim()}
                    className="flex-1 py-2 rounded-md text-[13px] font-medium text-white transition-colors disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, var(--danger), #c0392b)' }}
                  >确认拒绝</button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 订单详情弹窗 ── */}
      {orderDetailId !== null && (() => {
        const order = ordersData.find(o => o.id === orderDetailId);
        if (!order) return null;
        const statusInfo = statusMap[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] max-w-3xl w-full max-h-[85vh] overflow-auto">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">订单详情</h2>
                </div>
                <button onClick={() => setOrderDetailId(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">{order.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[12px] ${statusInfo.color}`}>{statusInfo.label}</span>
                      <span className="text-[13px] text-[var(--text-tertiary)]">{order.customer}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[var(--text-tertiary)] mb-1">订单预算</div>
                    <div className="text-[20px] font-semibold text-[var(--brand)]">¥{order.budget.toLocaleString()}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div><div className="text-[11px] text-[var(--text-tertiary)] mb-1">订单编号</div><div className="text-[13px] text-[var(--text-primary)]">#{order.id}</div></div>
                  <div><div className="text-[11px] text-[var(--text-tertiary)] mb-1">发布时间</div><div className="text-[13px] text-[var(--text-primary)]">{order.createdAt}</div></div>
                  <div><div className="text-[11px] text-[var(--text-tertiary)] mb-1">报名人数</div><div className="text-[13px] text-[var(--text-primary)]">{order.applicants}</div></div>
                </div>
                <div className="p-4 rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-[12px] font-medium text-[var(--text-primary)] mb-2">订单描述</div>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">此订单为客户通过 AI 智能发单创建，涵盖{order.title}相关的完整需求说明。详细内容可在订单发布后于订单广场和用户端查看完整骨架模块。</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 待平台承接 列表弹窗 ── */}
      {activeModule === 'platform_accept' && (() => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}>
                  <Briefcase className="w-4 h-4" />
                </div>
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">待平台承接</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}>{platformAcceptOrders.length} 个</span>
              </div>
              <button onClick={() => { setActiveModule(null); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {platformAcceptOrders.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-8 h-8 text-[var(--text-disabled)] mx-auto mb-2" />
                  <p className="text-[13px] text-[var(--text-tertiary)]">暂无待承接订单</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead><tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left px-4 py-3 text-[12px] text-[var(--text-tertiary)] font-normal">订单</th>
                    <th className="text-left px-4 py-3 text-[12px] text-[var(--text-tertiary)] font-normal">客户</th>
                    <th className="text-left px-4 py-3 text-[12px] text-[var(--text-tertiary)] font-normal">预算</th>
                    <th className="text-left px-4 py-3 text-[12px] text-[var(--text-tertiary)] font-normal">任务类型</th>
                    <th className="text-left px-4 py-3 text-[12px] text-[var(--text-tertiary)] font-normal">提交时间</th>
                    <th className="text-left px-4 py-3 text-[12px] text-[var(--text-tertiary)] font-normal">操作</th>
                  </tr></thead>
                  <tbody>
                    {platformAcceptOrders.map(order => (
                      <tr key={order.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
                        <td className="px-4 py-3 text-[13px] text-[var(--text-primary)]">{order.title}</td>
                        <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)]">{order.customer}</td>
                        <td className="px-4 py-3 text-[13px] text-[var(--brand)] font-medium">¥{order.budget.toLocaleString()}</td>
                        <td className="px-4 py-3"><div className="flex gap-1">{order.taskTypes.map(t => <span key={t} className="px-1.5 py-0.5 text-[10px] rounded" style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}>{t}</span>)}</div></td>
                        <td className="px-4 py-3 text-[12px] text-[var(--text-tertiary)]">{order.submittedAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setPlatformSelectedOrder(order);
                                setShowPlatformOrderDetail(true);
                              }}
                              className="text-[var(--brand)] text-[12px] hover:underline">查看</button>
                            <button
                              onClick={() => {
                                setPlatformSelectedOrder(order);
                                setShowPlatformContact(true);
                              }}
                              className="text-[var(--text-secondary)] text-[12px] hover:text-[var(--brand)] transition-colors flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />沟通</button>
                            <button
                              onClick={() => handlePlatformAccept(order.id)}
                              className="px-2.5 py-1 text-[11px] text-white rounded-md hover:opacity-90 transition-opacity"
                              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))' }}>接单</button>
                            <button
                              onClick={() => setPlatformAcceptModal({ orderId: order.id, mode: 'reject' })}
                              className="px-2.5 py-1 text-[11px] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-md hover:border-red-300 hover:text-red-500 transition-colors">拒绝</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ))()}

      {/* ── 待平台承接 OrderSquareDetail 弹窗（lazy）── */}
      {showPlatformOrderDetail && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-8 text-[var(--text-tertiary)]">加载中...</div></div>}>
          <OrderSquareDetail
            isOpen={showPlatformOrderDetail}
            onClose={() => { setShowPlatformOrderDetail(false); setPlatformSelectedOrder(null); }}
            userRole="browse-only"
            orderData={platformSelectedOrder ? {
              id: platformSelectedOrder.id,
              title: platformSelectedOrder.title,
              taskType: platformSelectedOrder.taskTypes[0] || '未分类',
              budgetMin: Math.round(platformSelectedOrder.budget * 0.8),
              budgetMax: platformSelectedOrder.budget,
              bidCount: 0,
              publishTime: platformSelectedOrder.submittedAt,
              description: platformSelectedOrder.description,
              aiTags: platformSelectedOrder.taskTypes,
              status: 'private_pending',
              publisher: platformSelectedOrder.customer,
              scheduleInfo: { totalDuration: '待确认', settlementMode: '平台承包转包', priceRange: `¥${platformSelectedOrder.budget.toLocaleString()}` },
              contractorReq: { skills: [], experience: [], qualification: [] },
            } : null}
          />
        </Suspense>
      )}

      {/* ── 待平台承接 ContactInfoModal ── */}
      <ContactInfoModal
        isOpen={showPlatformContact}
        onClose={() => { setShowPlatformContact(false); setPlatformSelectedOrder(null); }}
        orderId={platformSelectedOrder?.id || 0}
        orderTitle={platformSelectedOrder?.title || ''}
        customerName={platformSelectedOrder?.customer || ''}
      />

    </div>
  );
}
