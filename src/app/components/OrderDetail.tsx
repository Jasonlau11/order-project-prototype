import { useState, useEffect, useRef } from 'react';
import {
  X, Calendar, DollarSign, User, Clock, CheckCircle, AlertCircle,
  Upload, Download, FileText, Wrench, Key,
  Sparkles, Edit2, ChevronDown, ChevronRight, ChevronUp, BookOpen, Tag, Building2, Clock4, ShieldCheck,
} from 'lucide-react';
import { DeliveryToolConfigModal } from './DeliveryToolConfigModal';
import { DeliveryToolResourceModal } from './DeliveryToolResourceModal';
import { CollapsibleCard } from './CollapsibleCard';

type UserRole = 'customer' | 'user';
type OrderStatus = 'promoting' | 'signing' | 'inProgress' | 'accepted' | 'waitingSettlement' | 'settled' | 'terminated';
type MilestoneStatus = 'pending_confirm' | 'confirmed' | 'pending_submit' | 'submitted' | 'passed' | 'rejected';

interface Milestone {
  id: number;
  seq: number;
  name: string;
  description: string;
  targetDate: string;
  latestDueDate: string;
  configStatus: 'pending_confirm' | 'confirmed';
  status: MilestoneStatus;
  deliverable?: {
    type: 'file' | 'link' | 'text';
    content: string;
    fileName?: string;
    fileSize?: number;
    submitTime?: string;
  };
  rejectReason?: string;
}

interface OrderDetailProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  orderId: number;
  onTerminateOrder?: (orderId: number) => void;
}

// 模块定义
interface OrderModule {
  id: string;
  title: string;
  content: string;
  icon?: React.ReactNode;
  badge?: string;
}

// AI 标签定义
interface AITag {
  category: 'skill' | 'industry' | 'delivery';
  label: string;
}

export function OrderDetail({ isOpen, onClose, userRole, orderId, onTerminateOrder }: OrderDetailProps) {
  // 模拟订单数据
  const [orderData, setOrderData] = useState({
    id: orderId,
    title: '企业管理系统开发',
    taskType: '软件开发',
    budgetMin: 100000,
    budgetMax: 150000,
    status: 'inProgress' as OrderStatus,
    publishTime: '2026-02-15 10:00',
    acceptMode: '推荐推送',
    contractor: '张工作室',
    publisher: '某某科技有限公司',
    totalDuration: '3个月',
    settlementMode: 'platform_commission' as string,
    deadline: '2026-05-15',
    // 弱结构化字段
    description: '本项目旨在开发一套完整的企业内部管理系统，满足公司日常运营管理需求。系统将覆盖人事管理、财务管理、项目管理三大核心业务模块。',
    requirements: [
      '人事管理: 员工档案管理、考勤打卡、绩效评估系统',
      '财务管理: 费用报销流程、预算管理、多格式报表导出(PDF/Excel)',
      '项目管理: 任务分配、甘特图展示、工时统计',
      '系统集成: 对接企业微信、飞书等IM平台',
    ],
    deliverables: [
      '完整源代码（含注释）托管至代码仓库',
      '部署文档与技术白皮书',
      '系统运维手册（不少于30页）',
      '系统架构图（附在附加信息中）',
    ],
    scheduleInfo: {
      totalDuration: '3个月',
      settlementMode: '平台抽佣',
      priceRange: '¥10.0万 - ¥15.0万',
    },
    contractorReq: {
      skills: ['React 18', 'TypeScript', 'NestJS', 'PostgreSQL', 'Ant Design'],
      experience: [
        '有企业级管理系统开发经验',
        '熟悉 React 18 + TypeScript 技术栈',
        '有 NestJS/Node.js 后端开发经验',
        '能够提供完整的技术方案和技术支持',
      ],
    },
    additionalInfo: {
      remarks: [
        '系统架构图见附件 arch-diagram.png',
        '代码规范遵循 CSDN 代码标准',
        '相关参考资料及设计稿已上传至项目文档库',
      ],
      references: [
        { title: '技术规格书', url: 'https://example.com/tech-spec' },
        { title: 'CSDN 代码标准', url: 'https://spec.csdn.net' },
      ],
    },
    milestoneProgress: {
      current: 1,
      total: 3,
    },
    // 信任信号
    creditScore: 96,
    completedOrders: 47,
    creditDimensions: {
      onTimeDeliveryRate: '98%',
      oneTimePassRate: '92%',
      repurchaseRate: '35%',
    },
  });

  // 模块数据（从描述中拆分）
  const modules: OrderModule[] = [
    {
      id: 'module-overview',
      title: '项目概述',
      badge: 'AI生成',
      icon: <BookOpen className="w-5 h-5 text-[var(--brand)]" />,
      content: '本项目旨在开发一套完整的企业内部管理系统，满足公司日常运营管理需求。\n\n系统将覆盖**人事管理**、**财务管理**、**项目管理**三大核心业务模块，支持多部门协作，实现企业运营的全面数字化管理。\n\n目标是为公司打造一个统一、高效、可扩展的内部管理平台。',
    },
    {
      id: 'module-requirements',
      title: '需求说明',
      badge: 'AI生成',
      icon: <FileText className="w-5 h-5 text-[#0066cc]" />,
      content: '## 技术方案\n\n计划采用以下技术栈进行开发：\n- **前端:** React 18 + TypeScript + Ant Design 5\n- **后端:** Node.js + NestJS + PostgreSQL\n- **云服务:** 腾讯云 Serverless + COS 对象存储\n- **架构参考:** 详见 [技术规格书](https://example.com/tech-spec)\n- **原型设计:** 参考附件 `原型设计稿.fig`\n\n## 功能需求\n\n需要实现以下核心功能：\n1. 人事管理: 员工档案管理、考勤打卡、绩效评估系统\n2. 财务管理: 费用报销流程、预算管理、多格式报表导出(PDF/Excel)\n3. 项目管理: 任务分配、甘特图展示、工时统计\n4. 系统集成: 对接企业微信、飞书等IM平台',
    },
    {
      id: 'module-deliverables',
      title: '交付物要求',
      badge: 'AI生成',
      icon: <FileText className="w-5 h-5 text-[#52c41a]" />,
      content: '- 完整源代码（含注释）托管至 `代码仓库`\n- 部署文档与技术白皮书\n- 系统运维手册（不少于 30 页）\n- 系统架构图（附在附加信息中）\n- 代码规范文档（遵循 [CSDN 代码标准](https://spec.csdn.net)）',
    },
    {
      id: 'module-schedule',
      title: '排期与预算',
      icon: <Calendar className="w-5 h-5 text-[#faad14]" />,
      content: `## 排期计划\n\n| 阶段 | 内容 | 目标时间 |\n|------|------|----------|\n| 第一阶段 | 需求分析与设计 | 2026-03-15 |\n| 第二阶段 | 前端开发 | 2026-04-15 |\n| 第三阶段 | 后端开发与联调 | 2026-05-15 |\n\n## 预算说明\n\n预算区间为 **¥10.0万 - ¥15.0万**，按阶段结算。`,
    },
    {
      id: 'module-requirements-accept',
      title: '接单要求',
      icon: <ShieldCheck className="w-5 h-5 text-[#722ed1]" />,
      content: '- 有企业级管理系统开发经验\n- 熟悉 React 18 + TypeScript 技术栈\n- 有 NestJS/Node.js 后端开发经验\n- 能够提供完整的技术方案和技术支持\n- 具备良好的沟通协调能力',
    },
    {
      id: 'module-additional',
      title: '附加信息',
      icon: <FileText className="w-5 h-5 text-[var(--text-tertiary)]" />,
      content: '- 系统架构图: 见附件 `arch-diagram.png`\n- 代码规范: 遵循 [CSDN 代码标准](https://spec.csdn.net)\n- 相关参考资料及设计稿已上传至项目文档库',
    },
  ];

  // AI 标签数据
  const aiTags: AITag[] = [
    { category: 'skill', label: 'React 18' },
    { category: 'skill', label: 'TypeScript' },
    { category: 'skill', label: 'NestJS' },
    { category: 'skill', label: 'PostgreSQL' },
    { category: 'skill', label: 'Ant Design' },
    { category: 'industry', label: '企业管理系统' },
    { category: 'industry', label: '办公自动化' },
    { category: 'delivery', label: '远程优先' },
    { category: 'delivery', label: '中等规模' },
  ];

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 1, seq: 1,
      name: '第一阶段：需求分析与设计',
      description: '完成需求文档、原型设计、数据库设计',
      targetDate: '2026-03-15', latestDueDate: '2026-03-20',
      configStatus: 'confirmed', status: 'passed',
      deliverable: { type: 'file', content: 'deliverable_phase1.zip', fileName: '第一阶段交付物.zip', fileSize: 15728640, submitTime: '2026-03-14 18:30' }
    },
    {
      id: 2, seq: 2,
      name: '第二阶段：前端开发',
      description: '完成前端页面开发、交互功能实现',
      targetDate: '2026-04-15', latestDueDate: '2026-04-20',
      configStatus: 'confirmed', status: 'submitted',
      deliverable: { type: 'file', content: 'deliverable_phase2.zip', fileName: '第二阶段交付物.zip', fileSize: 25165824, submitTime: '2026-04-14 16:20' }
    },
    {
      id: 3, seq: 3,
      name: '第三阶段：后端开发',
      description: '完成后端API开发、数据库实现',
      targetDate: '2026-05-15', latestDueDate: '2026-05-20',
      configStatus: 'confirmed', status: 'pending_submit'
    }
  ]);

  const [showMilestoneConfig, setShowMilestoneConfig] = useState(false);
  const [showMilestoneEdit, setShowMilestoneEdit] = useState(false);
  const [showMilestoneSubmit, setShowMilestoneSubmit] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showDeliveryToolConfig, setShowDeliveryToolConfig] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>(['trae', 'cursor']);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminateReason, setTerminateReason] = useState('');
  const [terminatedReason, setTerminatedReason] = useState('');

  // 目录导航状态
  const [activeSection, setActiveSection] = useState('module-overview');
  const [showDirectory, setShowDirectory] = useState(true);
  const moduleRefs = useRef<Record<string, HTMLElement | null>>({});

  // 全局折叠状态（false=展开, true=折叠）
  const [allCollapsed, setAllCollapsed] = useState(false);

  // IntersectionObserver 目录导航
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    // 观察所有模块
    const allIds = [...modules.map((m) => m.id), 'module-milestones-progress', 'module-milestones', 'module-delivery-tools'];
    for (const id of allIds) {
      const el = document.getElementById(id);
      if (el) {
        moduleRefs.current[id] = el;
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, [modules, showMilestoneConfig]);

  // 检查是否有里程碑超期
  const hasOverdueMilestone = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return milestones.some(m => {
      if (m.status === 'passed') return false;
      const latestDate = new Date(m.latestDueDate);
      latestDate.setHours(0, 0, 0, 0);
      return latestDate < today;
    });
  };

  const showTerminateButton = userRole === 'customer' && orderData.status === 'inProgress' && hasOverdueMilestone();

  const handleTerminateOrder = () => {
    if (!terminateReason.trim()) {
      alert('请输入终止原因');
      return;
    }
    setTerminatedReason(terminateReason);
    setOrderData(prev => ({ ...prev, status: 'terminated' }));
    if (onTerminateOrder) onTerminateOrder(orderData.id);
    setShowTerminateModal(false);
    setTerminateReason('');
    alert('订单已终止');
  };

  if (!isOpen) return null;

  // 格式化预算
  const formatBudget = (value: number) => {
    if (value >= 10000) return '¥' + (value / 10000).toFixed(1) + '万';
    return '¥' + value.toLocaleString();
  };

  // 获取状态标签
  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig: Record<OrderStatus, { text: string; color: string }> = {
      promoting: { text: '推广中', color: 'bg-[#e7f5ff] text-[#0066cc]' },
      signing: { text: '协议签署中', color: 'bg-[#fff8e1] text-[#f57c00]' },
      inProgress: { text: '交付中', color: 'bg-[#e3f2fd] text-[#1976d2]' },
      accepted: { text: '已验收', color: 'bg-[var(--success-bg)] text-[var(--success-text)]' },
      waitingSettlement: { text: '待结算', color: 'bg-[var(--brand-bg)] text-[var(--brand)]' },
      settled: { text: '已结算', color: 'bg-[var(--success-bg)] text-[var(--success-text)]' },
      terminated: { text: '已终止', color: 'bg-[#ffebee] text-[var(--danger)]' }
    };
    const config = statusConfig[status];
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>;
  };

  // 获取里程碑状态标签
  const getMilestoneStatusBadge = (status: MilestoneStatus) => {
    const statusConfig: Record<MilestoneStatus, { text: string; color: string }> = {
      pending_confirm: { text: '待确认', color: 'bg-[var(--brand-bg)] text-[var(--brand)]' },
      confirmed: { text: '已确认', color: 'bg-[var(--success-bg)] text-[var(--success-text)]' },
      pending_submit: { text: '待提交', color: 'bg-[var(--bg-hover)] text-[var(--text-secondary)]' },
      submitted: { text: '待验收', color: 'bg-[#fff8e1] text-[#f57c00]' },
      passed: { text: '已通过', color: 'bg-[var(--success-bg)] text-[var(--success-text)]' },
      rejected: { text: '未通过', color: 'bg-[#ffebee] text-[var(--danger)]' }
    };
    const config = statusConfig[status];
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // 里程碑时间线渲染（弱结构化）
  function renderMilestoneTimeline(
    order: typeof orderData,
    markdownContent?: string
  ) {
    if (!order.milestoneProgress) return null;
    const { current, total } = order.milestoneProgress;
    return (
      <CollapsibleCard
        title="里程碑进度"
        defaultOpen={!allCollapsed}
        id="module-milestones-progress"
        icon={<CheckCircle className="w-5 h-5 text-[#52c41a]" />}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${(current / total) * 100}%`,
                backgroundColor: 'var(--brand)',
                transition: 'width var(--transition-fast)',
              }}
            />
          </div>
          <span className="text-[12px] font-medium" style={{ color: 'var(--brand)' }}>
            {current}/{total} · {Math.round((current / total) * 100)}%
          </span>
        </div>
        {markdownContent && (
          <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {renderMarkdown(markdownContent)}
          </div>
        )}
      </CollapsibleCard>
    );
  }

  // Markdown 渲染器
  function renderMarkdown(text: string): JSX.Element[] {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: JSX.Element[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let key = 0;
    let inTable = false;
    const tableRows: string[][] = [];

    function parseInline(content: string): (string | JSX.Element)[] {
      const parts: (string | JSX.Element)[] = [];
      const regex = /(\*\*(.+?)\*\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) parts.push(content.slice(lastIndex, match.index));
        if (match[1]) { parts.push(<strong key={key++}>{match[2]}</strong>); }
        else if (match[3]) { parts.push(<code key={key++} className="bg-[var(--bg-hover)] rounded px-1 text-[0.9em]">{match[4]}</code>); }
        else if (match[5]) { parts.push(<a key={key++} href={match[7]} className="text-[var(--brand)] hover:underline" target="_blank" rel="noopener noreferrer">{match[6]}</a>); }
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < content.length) parts.push(content.slice(lastIndex));
      if (parts.length === 0) parts.push('');
      return parts;
    }

    function flushList() {
      if (listItems.length > 0 && listType) {
        const Tag = listType === 'ul' ? 'ul' : 'ol';
        const listClass = listType === 'ul' ? 'list-disc' : 'list-decimal';
        elements.push(<Tag key={key++} className={`${listClass} pl-5 space-y-1 mb-2`}>{listItems}</Tag>);
        listItems = [];
        listType = null;
      }
    }

    function flushTable() {
      if (inTable && tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(1);
        elements.push(
          <div key={key++} className="overflow-x-auto mb-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  {headerRow.map((cell, ci) => (
                    <th key={ci} className="px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-hover)]">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => {
                  const isLast = ri === bodyRows.length - 1;
                  return (
                    <tr key={ri} className={`${!isLast ? 'border-b border-[var(--border-subtle)]' : ''}`}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 text-[var(--text-primary)]">{cell.trim()}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        tableRows.length = 0;
        inTable = false;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 表格行
      if (/^\|.*\|$/.test(line) && line.includes('|')) {
        if (!inTable) { flushList(); inTable = true; }
        const separator = /^\|(\s*:?-{3,}:?\s*\|)+$/.test(line);
        if (!separator) {
          tableRows.push(line.split('|').slice(1, -1));
        }
        continue;
      } else if (inTable) {
        flushTable();
      }

      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={key++} className="text-[var(--text-primary)] font-semibold mb-2 mt-3">{line.slice(3)}</h3>
        );
        continue;
      }

      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={key++} className="text-[var(--text-primary)] font-medium mb-1 mt-2">{line.slice(4)}</h4>
        );
        continue;
      }

      if (/^- /.test(line)) {
        if (listType !== 'ul') { flushList(); listType = 'ul'; }
        listItems.push(<li key={key++} className="text-sm text-[var(--text-primary)]">{parseInline(line.replace(/^- /, ''))}</li>);
        continue;
      }

      if (/^\d+\. /.test(line)) {
        if (listType !== 'ol') { flushList(); listType = 'ol'; }
        listItems.push(<li key={key++} className="text-sm text-[var(--text-primary)]">{parseInline(line.replace(/^\d+\. /, ''))}</li>);
        continue;
      }

      flushList();

      if (line.trim() === '') continue;

      elements.push(<p key={key++} className="text-sm text-[var(--text-primary)] mb-2">{parseInline(line)}</p>);
    }

    flushList();
    flushTable();
    return elements;
  }

  // 处理标签点击 -> 跳转订单广场并预筛选
  const handleTagClick = (tag: AITag) => {
    alert(`标签 "${tag.label}" (${tag.category === 'skill' ? '技能标签' : tag.category === 'industry' ? '行业标签' : '交付特征'}) 已选中，将跳转到订单广场并预筛选该标签的所有订单。\n\n（功能说明：生产环境下应跳转到 /order 页面并添加筛选参数）`);
  };

  // 获取标签颜色
  const getTagColor = (category: string) => {
    switch (category) {
      case 'skill': return 'bg-[#e6f0ff] text-[#0066cc] border-[#91caff]';
      case 'industry': return 'bg-[#e6ffe6] text-[#389e0d] border-[#b7eb8f]';
      case 'delivery': return 'bg-[#fff3e0] text-[#e65100] border-[#ffd591]';
      default: return 'bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border-subtle)]';
    }
  };

  const getTagCategoryLabel = (category: string) => {
    switch (category) {
      case 'skill': return '技能标签';
      case 'industry': return '行业标签';
      case 'delivery': return '交付特征';
      default: return '';
    }
  };

  const getTagCategoryColor = (category: string) => {
    switch (category) {
      case 'skill': return 'text-[#0066cc]';
      case 'industry': return 'text-[#389e0d]';
      case 'delivery': return 'text-[#e65100]';
      default: return 'text-[var(--text-tertiary)]';
    }
  };

  // 滚动到指定模块
  const scrollToModule = (moduleId: string) => {
    const el = moduleRefs.current[moduleId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 客户：配置里程碑
  const handleConfigMilestone = () => setShowMilestoneConfig(true);
  const handleEditMilestone = () => setShowMilestoneEdit(true);

  // 用户：确认里程碑配置
  const handleConfirmMilestoneConfig = (milestoneId: number) => {
    setMilestones(milestones.map(m =>
      m.id === milestoneId ? { ...m, configStatus: 'confirmed', status: 'pending_submit' } : m
    ));
    alert(`里程碑 #${milestoneId} 配置已确认`);
  };

  // 用户：提交里程碑交付物
  const handleSubmitMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setShowMilestoneSubmit(true);
  };

  // 客户：验收里程碑
  const handleApproveMilestone = (milestoneId: number) => {
    setMilestones(milestones.map(m =>
      m.id === milestoneId ? { ...m, status: 'passed' } : m
    ));
    alert(`里程碑 #${milestoneId} 验收通过`);
  };

  // 客户：拒绝里程碑
  const handleRejectMilestone = (milestoneId: number) => {
    const reason = prompt('请输入拒绝原因：');
    if (reason) {
      setMilestones(milestones.map(m =>
        m.id === milestoneId ? { ...m, status: 'rejected', rejectReason: reason } : m
      ));
      alert(`里程碑 #${milestoneId} 已拒绝，原因：${reason}`);
    }
  };

  // 下载交付物
  const handleDownloadDeliverable = (milestone: Milestone) => {
    alert(`下载交付物：${milestone.deliverable?.fileName || milestone.deliverable?.content}`);
  };

  // 全部折叠/展开
  const handleCollapseAll = () => setAllCollapsed(true);
  const handleExpandAll = () => setAllCollapsed(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[var(--surface-page)] rounded-lg shadow-2xl w-full max-w-[90vw] max-h-[90vh] flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--border-subtle)] bg-white rounded-t-lg flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] truncate">{orderData.title}</h2>
              {getStatusBadge(orderData.status)}
              <span className="text-xs text-[var(--text-tertiary)] px-2 py-0.5 bg-[var(--bg-hover)] rounded">{orderData.taskType}</span>
              {showTerminateButton && (
                <button
                  onClick={() => { setShowTerminateModal(true); setTerminateReason(''); }}
                  className="px-4 py-1.5 bg-[var(--danger)] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4" />
                  终止订单
                </button>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">订单编号：#{orderData.id} · {orderData.publishTime}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors ml-3 flex-shrink-0">
            <X className="w-6 h-6 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* 主体内容 */}
        <div className="flex-1 overflow-hidden flex">
          {/* 左侧模块卡片区 70% */}
          <div className="w-[70%] overflow-auto px-6 py-5 space-y-4" style={{ scrollBehavior: 'smooth' }}>
            {/* 终止状态横幅 */}
            {orderData.status === 'terminated' && (
              <div className="bg-[var(--danger)] bg-opacity-10 border border-[var(--danger)] border-opacity-30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[var(--danger)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--danger)]">此订单已被终止</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">该订单已终止，所有操作按钮已禁用</p>
                  </div>
                </div>
              </div>
            )}

            {/* 终止详情卡片 */}
            {orderData.status === 'terminated' && terminatedReason && (
              <div className="bg-white border border-[var(--border-subtle)] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">终止详情</h3>
                <div className="bg-[var(--bg-hover)] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--danger)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-[var(--danger)]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">订单已终止</div>
                      <div className="text-sm text-[var(--text-secondary)] mt-1">
                        <div className="flex items-start gap-1"><span className="text-[var(--text-tertiary)] shrink-0">终止原因：</span><span>{terminatedReason}</span></div>
                        <div className="flex items-start gap-1 mt-0.5"><span className="text-[var(--text-tertiary)] shrink-0">终止时间：</span><span>{new Date().toLocaleString('zh-CN')}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 模块卡片 */}
            {/* 模块1：项目概述 */}
            <CollapsibleCard
              id="module-overview"
              title="项目概述"
              icon={<BookOpen className="w-5 h-5 text-[var(--brand)]" />}
              badge="AI生成"
              defaultOpen={!allCollapsed}
            >
              <div className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {orderData.description}
              </div>
              {modules[0] && (
                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {renderMarkdown(modules[0].content)}
                </div>
              )}
            </CollapsibleCard>

            {/* 模块2：需求说明 */}
            <CollapsibleCard
              id="module-requirements"
              title="需求说明"
              icon={<FileText className="w-5 h-5 text-[#0066cc]" />}
              badge="AI生成"
              defaultOpen={!allCollapsed}
            >
              <div className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {orderData.requirements?.join('\n') || orderData.description}
              </div>
              {modules[1] && (
                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {renderMarkdown(modules[1].content)}
                </div>
              )}
            </CollapsibleCard>

            {/* 模块3：交付物要求 */}
            <CollapsibleCard
              id="module-deliverables"
              title="交付物要求"
              icon={<FileText className="w-5 h-5 text-[#52c41a]" />}
              badge="AI生成"
              defaultOpen={!allCollapsed}
            >
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                {orderData.deliverables?.map((d, i) => <li key={i}>{d}</li>) || <li>详见需求说明</li>}
              </ul>
            </CollapsibleCard>

            {/* 模块4：排期与预算 */}
            <CollapsibleCard
              id="module-schedule"
              title="排期与预算"
              icon={<Calendar className="w-5 h-5 text-[#faad14]" />}
              defaultOpen={!allCollapsed}
            >
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>总工期</span>
                  <div style={{ color: 'var(--text-primary)' }}>{orderData.scheduleInfo?.totalDuration || '未指定'}</div>
                </div>
                <div>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>结算方式</span>
                  <div style={{ color: 'var(--text-primary)' }}>{orderData.scheduleInfo?.settlementMode || '里程碑结算'}</div>
                </div>
                <div>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>预算区间</span>
                  <div className="font-semibold" style={{ color: 'var(--brand)' }}>{orderData.scheduleInfo?.priceRange || `¥${(orderData.budgetMax/10000).toFixed(1)}万`}</div>
                </div>
              </div>
              {modules[3] && (
                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {renderMarkdown(modules[3].content)}
                </div>
              )}
            </CollapsibleCard>

            {/* 模块5：接单要求 */}
            <CollapsibleCard
              id="module-requirements-accept"
              title="接单要求"
              icon={<ShieldCheck className="w-5 h-5 text-[#722ed1]" />}
              defaultOpen={!allCollapsed}
            >
              {orderData.contractorReq ? (
                <div className="space-y-3 text-[13px]">
                  <div>
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>技能要求</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {orderData.contractorReq.skills?.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-[11px]" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>经验要求</span>
                    <ul className="list-disc pl-5 mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {orderData.contractorReq.experience?.map((e, i) => <li key={i} className="text-[12px]">{e}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>暂无特殊要求</p>
              )}
            </CollapsibleCard>

            {/* 模块6：附加信息 */}
            <CollapsibleCard
              id="module-additional"
              title="附加信息"
              icon={<FileText className="w-5 h-5 text-[var(--text-tertiary)]" />}
              defaultOpen={false}
            >
              <div className="space-y-3 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                {orderData.additionalInfo?.remarks?.map((r, i) => <p key={i} className="text-[12px] leading-relaxed">{r}</p>)}
                {orderData.additionalInfo?.references && orderData.additionalInfo.references.length > 0 && (
                  <div>
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>参考资料</span>
                    {orderData.additionalInfo.references.map((ref, i) => (
                      <a key={i} href={ref.url} className="block text-[12px]" style={{ color: 'var(--brand)' }} target="_blank" rel="noopener noreferrer">{ref.title}</a>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleCard>

            {/* 里程碑时间线 */}
            {renderMilestoneTimeline(orderData)}

            {/* 交付工具配置模块 - 仅用户在交付中时可见 */}
            {userRole === 'user' && orderData.status === 'inProgress' && (
              <CollapsibleCard
                id="module-delivery-tools"
                title="交付工具配置"
                icon={<Wrench className="w-5 h-5 text-[var(--brand)]" />}
                defaultOpen={!allCollapsed}
              >
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[var(--text-secondary)]">已配置的交付工具：</span>
                    <div className="flex items-center gap-2">
                      {selectedTools.length > 0 && (
                        <button
                          onClick={() => setShowResourceModal(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0066cc] text-white rounded-full text-xs hover:bg-[#004499] transition-colors"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>获取资源</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedTools.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedTools.map((toolId) => {
                        const toolNames: Record<string, string> = {
                          cursor: 'Cursor', trae: 'Trae', vscode: 'VS Code',
                          'github-copilot': 'GitHub Copilot', notion: 'Notion'
                        };
                        return (
                          <span key={toolId} className="px-3 py-1.5 bg-white border border-[var(--border-subtle)] rounded-full text-sm text-[var(--text-primary)] flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[#52c41a]" />
                            {toolNames[toolId] || toolId}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#fff8e1] border-l-4 border-[#f57c00] rounded">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-[#f57c00] mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)] mb-1">请配置交付工具</div>
                          <div className="text-xs text-[var(--text-secondary)]">在开始交付前，请从可选工具列表中选择本订单采用的交付工具</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleCard>
            )}

            {/* 里程碑模块 */}
            {orderData.status === 'inProgress' && (
              <CollapsibleCard
                id="module-milestones"
                title="里程碑进度"
                icon={<CheckCircle className="w-5 h-5 text-[#52c41a]" />}
                defaultOpen={!allCollapsed}
              >
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[var(--text-secondary)]">
                      进度：{milestones.filter((m) => m.status === 'passed').length}/{milestones.length} 已完成
                    </span>
                    {userRole === 'customer' && (
                      <div className="flex items-center gap-2">
                        <button onClick={handleConfigMilestone} className="px-3 py-1.5 bg-[var(--brand)] text-white rounded-full text-xs hover:bg-[var(--brand-hover)] transition-colors">
                          配置里程碑
                        </button>
                        <button onClick={handleEditMilestone} className="px-3 py-1.5 border border-[var(--border-default)] text-[var(--text-secondary)] rounded-full text-xs hover:bg-white transition-colors flex items-center gap-1.5">
                          <Edit2 className="w-3.5 h-3.5" />
                          调整里程碑
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="border border-[var(--border-subtle)] rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm font-semibold text-[var(--text-primary)]">{milestone.seq}. {milestone.name}</span>
                              {getMilestoneStatusBadge(milestone.status)}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mb-2">{milestone.description}</p>
                            <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                              <span>目标：{milestone.targetDate}</span>
                              <span>最晚：{milestone.latestDueDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* 交付物信息 */}
                        {milestone.deliverable && (
                          <div className="mt-3 p-3 bg-[var(--bg-hover)] rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#0066cc]" />
                                <div>
                                  <div className="text-sm font-medium text-[var(--text-primary)]">{milestone.deliverable.fileName || milestone.deliverable.content}</div>
                                  {milestone.deliverable.fileSize && (
                                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                                      大小：{formatFileSize(milestone.deliverable.fileSize)} | 提交：{milestone.deliverable.submitTime}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDownloadDeliverable(milestone)}
                                className="px-3 py-1.5 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-xs hover:bg-white transition-colors flex items-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5" />
                                下载
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 拒绝原因 */}
                        {milestone.status === 'rejected' && milestone.rejectReason && (
                          <div className="mt-3 p-3 bg-[#ffebee] border-l-4 border-[var(--danger)] rounded">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-[var(--danger)] mt-0.5" />
                              <div>
                                <div className="text-xs font-medium text-[var(--danger)] mb-0.5">未通过原因</div>
                                <div className="text-xs text-[var(--text-secondary)]">{milestone.rejectReason}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 操作按钮 */}
                        <div className="mt-3 flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                          {userRole === 'user' && milestone.configStatus === 'pending_confirm' && (
                            <button onClick={() => handleConfirmMilestoneConfig(milestone.id)} className="px-3 py-1.5 bg-[var(--brand)] text-white rounded-full text-xs hover:bg-[var(--brand-hover)] transition-colors">
                              确认配置
                            </button>
                          )}
                          {userRole === 'user' && milestone.configStatus === 'confirmed' && (milestone.status === 'pending_submit' || milestone.status === 'rejected') && (
                            <button onClick={() => handleSubmitMilestone(milestone)} className="px-3 py-1.5 bg-[var(--brand)] text-white rounded-full text-xs hover:bg-[var(--brand-hover)] transition-colors flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" />
                              {milestone.status === 'rejected' ? '重新提交' : '提交交付物'}
                            </button>
                          )}
                          {userRole === 'customer' && milestone.status === 'submitted' && (
                            <>
                              <button onClick={() => handleRejectMilestone(milestone.id)} className="px-3 py-1.5 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-xs hover:bg-[var(--bg-hover)] transition-colors">
                                不通过
                              </button>
                              <button onClick={() => handleApproveMilestone(milestone.id)} className="px-3 py-1.5 bg-[#52c41a] text-white rounded-full text-xs hover:bg-[#3da825] transition-colors flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                                通过
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleCard>
            )}

            {/* 底部操作按钮 */}
            <div className="flex items-center justify-between pt-2 pb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCollapseAll}
                  className="px-3 py-1.5 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-xs hover:bg-white transition-colors flex items-center gap-1.5"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  折叠全部
                </button>
                <button
                  onClick={handleExpandAll}
                  className="px-3 py-1.5 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-xs hover:bg-white transition-colors flex items-center gap-1.5"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  展开全部
                </button>
              </div>
              <div className="flex items-center gap-2">
              </div>
            </div>
          </div>

          {/* 右侧结构��侧边栏 30% */}
          <div className="w-[30%] border-l border-[var(--border-subtle)] bg-white overflow-auto">
            <div className="sticky top-0 p-5 space-y-5">
              {/* 目录导航 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">目录导航</h4>
                  <button
                    onClick={() => setShowDirectory(!showDirectory)}
                    className="text-xs text-[var(--brand)] hover:underline"
                  >
                    {showDirectory ? '收起' : '展开'}
                  </button>
                </div>
                {showDirectory && (
                  <nav className="space-y-0.5">
                    {modules.map((mod) => (
                      <button
                        key={mod.id}
                        onClick={() => scrollToModule(mod.id)}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                          activeSection === mod.id
                            ? 'bg-[var(--brand-bg)] text-[var(--brand)] font-medium'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {mod.title}
                      </button>
                    ))}
                    {orderData.status === 'inProgress' && (
                      <>
                        <button
                          onClick={() => scrollToModule('module-milestones-progress')}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                            activeSection === 'module-milestones-progress'
                              ? 'bg-[var(--brand-bg)] text-[var(--brand)] font-medium'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          里程碑时间线
                        </button>
                        <button
                          onClick={() => scrollToModule('module-milestones')}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                            activeSection === 'module-milestones'
                              ? 'bg-[var(--brand-bg)] text-[var(--brand)] font-medium'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          里程碑进度
                        </button>
                        {userRole === 'user' && (
                          <button
                            onClick={() => scrollToModule('module-delivery-tools')}
                            className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                              activeSection === 'module-delivery-tools'
                                ? 'bg-[var(--brand-bg)] text-[var(--brand)] font-medium'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            交付工具配置
                          </button>
                        )}
                      </>
                    )}
                  </nav>
                )}
              </div>

              {/* 分隔线 */}
              <div className="border-t border-[var(--border-subtle)]" />

              {/* 信任信号 */}
              {orderData.creditScore && (
                <div
                  className="rounded-md p-4"
                  style={{ backgroundColor: 'var(--trust-bg)', border: '1px solid var(--trust-border)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-semibold" style={{ color: 'var(--trust)' }}>
                      {orderData.creditScore}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: 'var(--trust-bg)', color: 'var(--trust)' }}>
                      精英
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>基于 {orderData.completedOrders || 'N'} 单</span>
                  </div>
                  <div className="space-y-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex justify-between">
                      <span>按时交付</span>
                      <span className="font-medium">{orderData.creditDimensions?.onTimeDeliveryRate || '98%'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>一次通过</span>
                      <span className="font-medium">{orderData.creditDimensions?.oneTimePassRate || '92%'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>复购率</span>
                      <span className="font-medium">{orderData.creditDimensions?.repurchaseRate || '35%'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 分隔线 */}
              <div className="border-t border-[var(--border-subtle)]" />

              {/* 订单状态 */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">订单状态</h4>
                <div className="flex items-center gap-2">
                  {getStatusBadge(orderData.status)}
                  {orderData.status === 'inProgress' && (
                    <span className="text-xs text-[var(--text-tertiary)]">
                      已通过 {milestones.filter((m) => m.status === 'passed').length}/{milestones.length} 个里程碑
                    </span>
                  )}
                </div>
              </div>

              {/* 分隔线 */}
              <div className="border-t border-[var(--border-subtle)]" />

              {/* 订单报价 */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">订单报价</h4>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[var(--brand)]" />
                  <span className="text-base font-medium text-[var(--text-primary)]">
                    {formatBudget(orderData.budgetMax)}
                  </span>
                </div>
              </div>

              {/* 分隔线 */}
              <div className="border-t border-[var(--border-subtle)]" />

              {/* 时限信息 */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">时限与工期</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock4 className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <div className="flex-1">
                      <div className="text-xs text-[var(--text-tertiary)]">总工期</div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">{orderData.totalDuration}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <div className="flex-1">
                      <div className="text-xs text-[var(--text-tertiary)]">截止时间</div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">{orderData.deadline}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 分隔线 */}
              <div className="border-t border-[var(--border-subtle)]" />

              {/* 接单方式 */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">接单方式</h4>
                <span className="text-sm text-[var(--text-primary)]">{orderData.acceptMode}</span>
              </div>

              {/* 分隔线 */}
              <div className="border-t border-[var(--border-subtle)]" />

              {/* 客户/接单方信息 */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                  {userRole === 'customer' ? '接单方信息' : '客户信息'}
                </h4>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-sm text-[var(--text-primary)]">
                    {userRole === 'customer' ? orderData.contractor : orderData.publisher}
                  </span>
                </div>
              </div>

              {/* 分隔线 */}
              <div className="border-t border-[var(--border-subtle)]" />

              {/* AI 标签模块 */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  AI 订单标签
                </h4>

                {/* 按类别分组 */}
                <div className="space-y-3">
                  {(['skill', 'industry', 'delivery'] as const).map((category) => {
                    const categoryTags = aiTags.filter((t) => t.category === category);
                    if (categoryTags.length === 0) return null;
                    return (
                      <div key={category}>
                        <div className={`text-[10px] font-medium ${getTagCategoryColor(category)} uppercase mb-1.5`}>
                          {getTagCategoryLabel(category)}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {categoryTags.map((tag) => (
                            <button
                              key={tag.label}
                              onClick={() => handleTagClick(tag)}
                              className={`px-2 py-0.5 rounded-full text-xs border cursor-pointer hover:opacity-80 transition-opacity ${getTagColor(tag.category)}`}
                              title={`点击筛选标签：${tag.label}`}
                            >
                              {tag.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="border-t border-[var(--border-subtle)] px-8 py-3 bg-white rounded-b-lg flex items-center justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-1.5 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-sm hover:bg-[var(--bg-hover)] transition-colors"
          >
            关闭
          </button>
        </div>
      </div>

      {/* 里程碑配置弹窗 */}
      {showMilestoneConfig && (
        <MilestoneConfigModal
          isOpen={showMilestoneConfig}
          onClose={() => setShowMilestoneConfig(false)}
          orderId={orderData.id}
          onSave={(newMilestones) => {
            setMilestones(newMilestones);
            setShowMilestoneConfig(false);
          }}
        />
      )}

      {/* 里程碑调整弹窗 */}
      {showMilestoneEdit && (
        <MilestoneConfigModal
          isOpen={showMilestoneEdit}
          onClose={() => setShowMilestoneEdit(false)}
          orderId={orderData.id}
          initialMilestones={milestones}
          onSave={(adjustedMilestones) => {
            setMilestones(adjustedMilestones.map(m => ({
              ...m, configStatus: 'pending_confirm', status: 'pending_submit', deliverable: undefined,
            })));
            setShowMilestoneEdit(false);
          }}
        />
      )}

      {/* 提交交付物弹窗 */}
      {showMilestoneSubmit && selectedMilestone && (
        <MilestoneSubmitModal
          isOpen={showMilestoneSubmit}
          onClose={() => { setShowMilestoneSubmit(false); setSelectedMilestone(null); }}
          milestone={selectedMilestone}
          onSubmit={(deliverable) => {
            setMilestones(milestones.map(m =>
              m.id === selectedMilestone.id ? { ...m, status: 'submitted', deliverable } : m
            ));
            setShowMilestoneSubmit(false);
            setSelectedMilestone(null);
          }}
        />
      )}

      {/* 交付工具配置弹窗 */}
      {showDeliveryToolConfig && (
        <DeliveryToolConfigModal
          isOpen={showDeliveryToolConfig}
          onClose={() => setShowDeliveryToolConfig(false)}
          orderId={orderData.id}
          selectedTools={selectedTools}
          onSave={(newTools) => {
            setSelectedTools(newTools);
            setShowDeliveryToolConfig(false);
          }}
        />
      )}

      {/* 交付工具资源弹窗 */}
      {showResourceModal && (
        <DeliveryToolResourceModal
          isOpen={showResourceModal}
          onClose={() => setShowResourceModal(false)}
          orderId={orderData.id}
          orderTitle={orderData.title}
          selectedTools={selectedTools}
        />
      )}

      {/* 终止订单确认弹窗 */}
      {showTerminateModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">确认终止订单</h3>
              <button onClick={() => setShowTerminateModal(false)} className="p-1.5 hover:bg-[var(--bg-hover)] rounded-full transition-colors">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="bg-[#ffebee] border-l-4 border-[var(--danger)] rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-[var(--danger)] mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-[var(--text-primary)]">
                    <p className="font-medium mb-2">终止订单的后果：</p>
                    <ul className="space-y-1 text-[var(--text-secondary)]">
                      <li>订单将立即变更为"已终止"状态</li>
                      <li>双方协议自动失效</li>
                      <li>已完成的里程碑按约定结算</li>
                      <li>未完成的里程碑不予付款</li>
                      <li>该操作不可撤销</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  终止原因 <span className="text-[var(--danger)]">*</span>
                </label>
                <textarea
                  value={terminateReason}
                  onChange={(e) => setTerminateReason(e.target.value)}
                  placeholder="请填写终止订单的具体原因..."
                  rows={3}
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--danger)] resize-none"
                />
              </div>
            </div>
            <div className="border-t border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-hover)] flex items-center justify-end gap-3">
              <button onClick={() => setShowTerminateModal(false)} className="px-5 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-sm hover:bg-white transition-colors">
                取消
              </button>
              <button onClick={handleTerminateOrder} className="px-5 py-2 bg-[var(--danger)] text-white rounded-full text-sm hover:opacity-90 transition-opacity">
                确认终止
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 里程碑配置弹窗
function MilestoneConfigModal({
  isOpen, onClose, orderId, onSave, initialMilestones
}: {
  isOpen: boolean; onClose: () => void; orderId: number;
  onSave: (milestones: Milestone[]) => void; initialMilestones?: Milestone[];
}) {
  const isEdit = initialMilestones && initialMilestones.length > 0;

  const [milestones, setMilestones] = useState<Milestone[]>(
    isEdit
      ? initialMilestones!.map(m => ({ ...m, configStatus: 'pending_confirm' as const, status: 'pending_submit' as const, deliverable: undefined }))
      : [{
          id: Date.now(), seq: 1, name: '', description: '',
          targetDate: '', latestDueDate: '',
          configStatus: 'pending_confirm' as const, status: 'pending_submit' as const
        }]
  );

  if (!isOpen) return null;

  const addMilestone = () => {
    setMilestones([...milestones, {
      id: Date.now(), seq: milestones.length + 1, name: '', description: '',
      targetDate: '', latestDueDate: '',
      configStatus: 'pending_confirm' as const, status: 'pending_submit' as const
    }]);
  };

  const removeMilestone = (id: number) => {
    const newMilestones = milestones.filter(m => m.id !== id);
    newMilestones.forEach((m, index) => { m.seq = index + 1; });
    setMilestones(newMilestones);
  };

  const updateMilestone = (id: number, field: string, value: string) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSave = () => {
    for (const milestone of milestones) {
      if (!milestone.name || !milestone.targetDate || !milestone.latestDueDate) {
        alert('请填写所有必填项');
        return;
      }
    }
    onSave(milestones);
    alert(isEdit ? '里程碑已调整，等待接单方重新确认' : '里程碑配置已保存，等待接单方确认');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-subtle)]">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{isEdit ? '调整里程碑' : '配置里程碑'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors">
            <X className="w-6 h-6 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="space-y-6">
            {/* AI 生成里程碑建议按钮 */}
            <div className="bg-[#f0f9ff] border border-[#91d5ff] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-[#1890ff] mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0050b3] mb-1">AI 智能生成里程碑建议</p>
                    <p className="text-xs text-[#0050b3]">系统将基于订单信息（任务类型、预算、周期等）自动生成里程碑方案，您可以在此基础上修改</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const confirmed = confirm('AI 将基于当前订单信息生成里程碑建议，是否继续？\n\n生成的建议仅供参考，请结合实际业务进行调整。');
                    if (confirmed) {
                      alert('AI 生成中，请稍候...');
                      setTimeout(() => {
                        alert('AI 建议已生成并填充到表单中，请仔细审阅并根据实际需求调整后保存。');
                      }, 1500);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1890ff] text-white rounded-lg text-sm hover:bg-[#096dd9] transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI 生成建议</span>
                </button>
              </div>
            </div>

            {milestones.map((milestone) => (
              <div key={milestone.id} className="border border-[var(--border-subtle)] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">里程碑 {milestone.seq}</h3>
                  {milestones.length > 1 && (
                    <button onClick={() => removeMilestone(milestone.id)} className="text-sm text-[var(--brand)] hover:underline">删除</button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      里程碑名称 <span className="text-[var(--brand)]">*</span>
                    </label>
                    <input type="text" value={milestone.name} onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                      placeholder="例如：第一阶段 - 需求分析与设计"
                      className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">交付说明</label>
                    <textarea value={milestone.description} onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                      placeholder="描述该里程碑的交付物要求..." rows={3}
                      className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      目标时间 <span className="text-[var(--brand)]">*</span>
                    </label>
                    <input type="date" value={milestone.targetDate} onChange={(e) => updateMilestone(milestone.id, 'targetDate', e.target.value)}
                      className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">系统将在前1天提醒用户提交</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      最晚达成时间 <span className="text-[var(--brand)]">*</span>
                    </label>
                    <input type="date" value={milestone.latestDueDate} onChange={(e) => updateMilestone(milestone.id, 'latestDueDate', e.target.value)}
                      className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">超期未达成可能触发终止权</p>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addMilestone}
              className="w-full py-3 border-2 border-dashed border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors">
              + 添加里程碑
            </button>

            <div className="bg-[#fffbe6] border-l-4 border-[#faad14] rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-[#faad14] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-[#ad8b00]">
                  <p className="font-medium mb-1">温馨提示：</p>
                  <ul className="space-y-1 text-xs">
                    <li>您可以使用 AI 生成功能快速创建里程碑方案，然后根据实际需求调整</li>
                    <li>保存后需等待接单方确认，确认后里程碑才会生效</li>
                    <li>交付过程中，系统会在目标时间前1天向用户发送提醒</li>
                    <li>用户提交交付物（建议 zip 格式）后，您可在该里程碑下获取压缩包</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] px-8 py-4 bg-[var(--bg-hover)]">
          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-sm hover:bg-white transition-colors">取消</button>
            <button onClick={handleSave} className="px-6 py-2 bg-[var(--brand)] text-white rounded-full text-sm hover:bg-[var(--brand-hover)] transition-colors">
              {isEdit ? '保存调整' : '保存配置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 提交交付物弹窗
function MilestoneSubmitModal({
  isOpen, onClose, milestone, onSubmit
}: {
  isOpen: boolean; onClose: () => void; milestone: Milestone;
  onSubmit: (deliverable: Milestone['deliverable']) => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!file) { alert('请选择要上传的文件'); return; }

    const submitTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    }).replace(/\//g, '-');

    const deliverable: Milestone['deliverable'] = {
      type: 'file', content: file.name, fileName: file.name, fileSize: file.size, submitTime
    };

    onSubmit(deliverable);
    alert('交付物提交成功，等待客户验收');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">提交交付物</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{milestone.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors">
            <X className="w-6 h-6 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                  上传文件 <span className="text-[var(--brand)]">*</span>
                </label>
                <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-lg p-6 text-center">
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="file-upload" accept=".zip,.rar,.7z,.pdf,.doc,.docx" />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-[#52c41a]" />
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)]">{file.name}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <button onClick={() => setFile(null)} className="ml-4 text-sm text-[var(--brand)] hover:underline">重新选择</button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-[var(--text-disabled)] mx-auto mb-3" />
                      <label htmlFor="file-upload" className="text-sm text-[var(--text-secondary)] cursor-pointer hover:text-[var(--brand)]">点击选择文件</label>
                      <p className="text-xs text-[var(--text-tertiary)] mt-2">推荐上传zip压缩包，支持rar、7z、pdf、doc、docx等格式</p>
                    </>
                  )}
                </div>
              </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] px-8 py-4 bg-[var(--bg-hover)]">
          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-sm hover:bg-white transition-colors">取消</button>
            <button onClick={handleSubmit} className="px-6 py-2 bg-[var(--brand)] text-white rounded-full text-sm hover:bg-[var(--brand-hover)] transition-colors">提交</button>
          </div>
        </div>
      </div>
    </div>
  );
}
