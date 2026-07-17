import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Send, Paperclip, Sparkles, RefreshCw, ChevronDown, ChevronRight,
  CheckCircle, Clock, FileText, MessageSquare, LayoutGrid, X, Edit3,
  AlertCircle, Info, Trash2, ArrowRight, Tag, Code2, Palette, Video,
  PenLine, FlaskConical, Megaphone, Cpu, CircleHelp, Image, Download,
  Copy, Check, LoaderCircle, BrainCircuit,
} from 'lucide-react';

interface DialogueWorkbenchProps {
  userRole: string;
  setUserRole: (role: string) => void;
  setCurrentPage: (page: string) => void;
  onNavigateToMyOrders: () => void;
  isLoggedIn?: boolean;
  requireLogin?: (action: () => void) => void;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  size: string;
  previewUrl?: string;
  status: 'ready' | 'analyzing' | 'completed' | 'failed';
}

interface GeneratedFile {
  name: string;
  format: 'md' | 'txt' | 'csv' | 'docx' | 'xlsx';
  size: string;
  description: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  attachments?: ChatAttachment[];
  generatedFile?: GeneratedFile;
  generatedFiles?: GeneratedFile[];
}

interface SkeletonModule {
  id: string;
  name: string;
  content: string;
  filled: boolean;
  type: 'markdown' | 'structured';
}

interface DraftSession {
  id: string;
  title: string;
  lastEditTime: number;
  status: 'in_progress' | 'rejected_back';
  completeness: number;
  messages: ChatMessage[];
  modules: SkeletonModule[];
  rejectReason?: string;
  tags: string[];
  taskTypes: string[];
  primaryCategory?: string;
  secondaryCategory?: string;
}

interface HistoryOrder {
  id: string;
  title: string;
  status: string;
  submitTime: number;
  sourceDialogueId?: string;
  sourceDialogueTitle?: string;
  // 只读展开所需的快照数据
  messages?: ChatMessage[];
  modules?: SkeletonModule[];
  tags?: string[];
  taskTypes?: string[];
  completeness?: number;
}

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_DRAFTS: DraftSession[] = [
  {
    id: 'd1',
    title: '品牌VI设计需求',
    lastEditTime: Date.now() - 10 * 60 * 1000,
    status: 'in_progress',
    completeness: 60,
    tags: ['平面设计', '品牌设计', 'VI'],
    taskTypes: ['平面设计'],
    messages: [
      { id: 'm1', role: 'user', content: '我需要一套品牌VI设计，包括logo、名片、信纸', timestamp: Date.now() - 12 * 60 * 1000 },
      { id: 'm2', role: 'ai', content: '好的，我来帮您梳理品牌VI设计需求。请问您的品牌所属行业是什么？有没有偏好的设计风格（如简约、科技感、国风等）？', timestamp: Date.now() - 11 * 60 * 1000 },
      { id: 'm3', role: 'user', content: '科技公司，偏简约现代风格', timestamp: Date.now() - 10 * 60 * 1000 },
    ],
    modules: [
      { id: 'mod1', name: '项目概述', content: '为一家科技公司设计品牌VI系统，包含logo、名片、信纸等基础视觉物料。', filled: true, type: 'markdown' },
      { id: 'mod2', name: '需求说明', content: '设计风格偏简约现代，需体现科技感。包含：1) 企业logo设计 2) 名片设计 3) 信纸设计', filled: true, type: 'markdown' },
      { id: 'mod3', name: '交付物要求', content: '', filled: false, type: 'markdown' },
      { id: 'mod4', name: '排期与预算', content: '', filled: false, type: 'structured' },
      { id: 'mod5', name: '接单要求', content: '', filled: false, type: 'structured' },
    ],
  },
  {
    id: 'd2',
    title: '企业管理系统开发（已打回）',
    lastEditTime: Date.now() - 2 * 60 * 60 * 1000,
    status: 'rejected_back',
    completeness: 85,
    tags: ['软件开发', 'React', '企业管理'],
    taskTypes: ['软件开发'],
    rejectReason: '需求说明中技术栈描述不够明确，请补充前后端具体技术方案及数据库选型。',
    messages: [
      { id: 'm1', role: 'user', content: '我需要一个企业管理系统，包含员工管理、考勤、薪资模块', timestamp: Date.now() - 3 * 60 * 60 * 1000 },
      { id: 'm2', role: 'ai', content: '了解。请问系统预计服务多少用户量？需要支持哪些终端（Web/移动端）？', timestamp: Date.now() - 2.8 * 60 * 60 * 1000 },
    ],
    modules: [
      { id: 'mod1', name: '项目概述', content: '开发一套企业管理系统，覆盖员工管理、考勤打卡、薪资计算三大核心模块。', filled: true, type: 'markdown' },
      { id: 'mod2', name: '需求说明', content: '功能模块：\n1. 员工管理：增删改查、部门架构\n2. 考勤：打卡记录、请假审批\n3. 薪资：计算规则配置、工资单生成', filled: true, type: 'markdown' },
      { id: 'mod3', name: '交付物要求', content: '源代码 + 部署文档 + 操作手册', filled: true, type: 'markdown' },
      { id: 'mod4', name: '排期与预算', content: '预算8-12万，工期3个月', filled: true, type: 'structured' },
      { id: 'mod5', name: '接单要求', content: '3年以上全栈经验，熟悉企业管理系统', filled: true, type: 'structured' },
    ],
  },
];

const MOCK_HISTORY_ORDERS: HistoryOrder[] = [
  {
    id: 'o1', title: 'AI智能问答系统开发', status: '推广中', submitTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
    sourceDialogueId: 'd_old1', sourceDialogueTitle: 'AI问答系统对话',
    tags: ['软件开发', 'AI', '问答系统'], taskTypes: ['软件开发'], completeness: 95,
    messages: [
      { id: 'hm1', role: 'user', content: '我需要一个AI智能问答系统，基于企业知识库自动回答员工问题', timestamp: Date.now() - 3.2 * 24 * 60 * 60 * 1000 },
      { id: 'hm2', role: 'ai', content: '收到。请问您的企业知识库目前是什么形式（文档/Wiki/数据库）？预计服务多少用户？', timestamp: Date.now() - 3.1 * 24 * 60 * 60 * 1000 },
      { id: 'hm3', role: 'user', content: '主要是Confluence文档，约500人使用，预算10-15万', timestamp: Date.now() - 3.05 * 24 * 60 * 60 * 1000 },
      { id: 'hm4', role: 'ai', content: '我已了解足够信息，为您生成订单预览 →', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    ],
    modules: [
      { id: 'hmod1', name: '项目概述', content: '开发一套基于企业知识库的AI智能问答系统，接入Confluence文档，为约500名员工提供智能问答服务。', filled: true, type: 'markdown' },
      { id: 'hmod2', name: '需求说明', content: '1. 对接Confluence知识库，自动同步文档\n2. 基于大模型实现自然语言问答\n3. 支持多轮对话上下文\n4. 管理后台：知识库管理、问答日志、用户管理', filled: true, type: 'markdown' },
      { id: 'hmod3', name: '交付物要求', content: '源代码 + 部署文档 + API文档 + 管理后台', filled: true, type: 'markdown' },
      { id: 'hmod4', name: '排期与预算', content: '预算: 10-15万 | 工期: 2个月', filled: true, type: 'structured' },
      { id: 'hmod5', name: '接单要求', content: '熟悉NLP和大模型应用开发，有问答系统经验', filled: true, type: 'structured' },
      { id: 'hmod6', name: '订单标签', content: '软件开发, AI, 问答系统, Confluence', filled: true, type: 'structured' },
      { id: 'hmod7', name: '结算模式', content: '平台抽佣', filled: true, type: 'structured' },
      { id: 'hmod8', name: '订单属性', content: '公开订单', filled: true, type: 'structured' },
      { id: 'hmod9', name: '接单方式', content: '公开抢单 | 招标时限: 15天', filled: true, type: 'structured' },
    ],
  },
  {
    id: 'o2', title: '官网界面改版', status: '交付中', submitTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
    sourceDialogueId: 'd_old2', sourceDialogueTitle: '官网改版需求',
    tags: ['平面设计', '网页设计'], taskTypes: ['平面设计'], completeness: 90,
    messages: [
      { id: 'hm1', role: 'user', content: '公司官网需要改版，现有页面太老旧了', timestamp: Date.now() - 7.2 * 24 * 60 * 60 * 1000 },
      { id: 'hm2', role: 'ai', content: '了解。请问官网大约多少个页面？有没有参考的设计风格？预算范围？', timestamp: Date.now() - 7.1 * 24 * 60 * 60 * 1000 },
      { id: 'hm3', role: 'user', content: '约8个页面，偏科技简约风，预算3-5万', timestamp: Date.now() - 7.05 * 24 * 60 * 60 * 1000 },
    ],
    modules: [
      { id: 'hmod1', name: '项目概述', content: '公司官网整体界面改版，从老旧风格升级为科技简约风格，共约8个页面。', filled: true, type: 'markdown' },
      { id: 'hmod2', name: '需求说明', content: '设计风格：科技简约，蓝色主色调\n页面清单：首页、产品介绍、解决方案、关于我们、联系我们等8个页面', filled: true, type: 'markdown' },
      { id: 'hmod3', name: '交付物要求', content: 'Figma设计稿 + 切图素材 + 设计规范文档', filled: true, type: 'markdown' },
      { id: 'hmod4', name: '排期与预算', content: '预算: 3-5万 | 工期: 1个月', filled: true, type: 'structured' },
    ],
  },
  {
    id: 'o3', title: '数据分析平台', status: '已验收', submitTime: Date.now() - 15 * 24 * 60 * 60 * 1000,
    sourceDialogueId: 'd_old3', sourceDialogueTitle: '数据平台对话',
    tags: ['软件开发', '数据分析', '可视化'], taskTypes: ['软件开发'], completeness: 100,
    messages: [
      { id: 'hm1', role: 'user', content: '需要一个数据分析平台，能对接多个数据源做可视化展示', timestamp: Date.now() - 15.2 * 24 * 60 * 60 * 1000 },
      { id: 'hm2', role: 'ai', content: '请问需要对接哪些数据源？预期的数据量级？需要哪些图表类型？', timestamp: Date.now() - 15.1 * 24 * 60 * 60 * 1000 },
    ],
    modules: [
      { id: 'hmod1', name: '项目概述', content: '开发数据分析平台，支持多数据源接入和可视化展示。', filled: true, type: 'markdown' },
      { id: 'hmod2', name: '需求说明', content: '数据源：MySQL、API接口、Excel上传\n图表：柱状图、折线图、饼图、地图\n支持自定义看板', filled: true, type: 'markdown' },
    ],
  },
  {
    id: 'o4', title: '电商小程序开发', status: '待审核', submitTime: Date.now() - 0.5 * 24 * 60 * 60 * 1000,
    sourceDialogueId: 'd_old4', sourceDialogueTitle: '电商小程序需求',
    tags: ['软件开发', '小程序', '电商'], taskTypes: ['软件开发'], completeness: 88,
    messages: [
      { id: 'hm1', role: 'user', content: '我需要一个电商小程序，React技术栈，包含商品展示、购物车、支付对接，预算5-8万，2个月交付', timestamp: Date.now() - 0.6 * 24 * 60 * 60 * 1000 },
      { id: 'hm2', role: 'ai', content: '我已了解足够信息，为您生成订单预览 →', timestamp: Date.now() - 0.5 * 24 * 60 * 60 * 1000 },
    ],
    modules: [
      { id: 'hmod1', name: '项目概述', content: '开发电商微信小程序，基于React技术栈，包含商品展示、购物车、支付对接等核心功能。', filled: true, type: 'markdown' },
      { id: 'hmod2', name: '需求说明', content: '技术栈：Taro + React\n功能：商品列表、商品详情、购物车、微信支付、订单管理', filled: true, type: 'markdown' },
      { id: 'hmod3', name: '交付物要求', content: '源代码 + 部署文档 + 小程序发布包', filled: true, type: 'markdown' },
      { id: 'hmod4', name: '排期与预算', content: '预算: 5-8万 | 工期: 2个月', filled: true, type: 'structured' },
    ],
  },
];

const TASK_CATEGORIES = [
  { id: 'software', label: '软件开发', icon: Code2, children: ['前端开发', '后端开发', '移动端开发', '小程序开发', 'AI应用', '数据开发'] },
  { id: 'design', label: '平面设计', icon: Palette, children: ['品牌设计', 'UI设计', '海报设计', '包装设计', '插画设计'] },
  { id: 'video', label: '视频创作', icon: Video, children: ['短视频', '宣传片', '动画制作', '视频剪辑', '直播服务'] },
  { id: 'writing', label: '文本创作', icon: PenLine, children: ['技术文章', '行业报告', '营销文案', '内容运营', '翻译服务'] },
  { id: 'review', label: '产品评测', icon: FlaskConical, children: ['软件评测', '硬件评测', '内容测评', '体验报告'] },
  { id: 'marketing', label: '营销推广', icon: Megaphone, children: ['活动策划', '渠道推广', '品牌传播', '用户增长'] },
  { id: 'hardware', label: '硬件订单', icon: Cpu, children: ['硬件设计', '嵌入式开发', '设备采购', '安装调试'] },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  '待审核': { color: 'var(--warning)', bg: 'var(--warning-bg)' },
  '推广中': { color: 'var(--info)', bg: 'var(--info-bg)' },
  '交付中': { color: 'var(--brand)', bg: 'var(--brand-subtle)' },
  '已验收': { color: 'var(--success)', bg: 'var(--success-bg)' },
  '已结算': { color: 'var(--success)', bg: 'var(--success-bg)' },
};

// ── Helper ───────────────────────────────────────────────────────────────────
const formatTime = (ts: number) => {
  const diff = Date.now() - ts;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return `${Math.floor(diff / 86400000)}天前`;
};

const newId = () => Math.random().toString(36).slice(2, 11);

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const ACCEPTED_ATTACHMENT_TYPES = '.pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp';

// ── AI 模拟回复 ──────────────────────────────────────────────────────────────
const generateAIResponse = (userInput: string, draft: DraftSession | null, attachments: ChatAttachment[] = []): { reply: string; shouldShowPreview: boolean; generatedFile?: GeneratedFile; generatedFiles?: GeneratedFile[] } => {
  if (attachments.length > 0) {
    const imageCount = attachments.filter(file => file.type === 'image').length;
    const documentCount = attachments.length - imageCount;
    const sourceLabel = [imageCount ? `${imageCount} 张图片` : '', documentCount ? `${documentCount} 份文档` : ''].filter(Boolean).join('和');
    return {
      reply: `已完成对${sourceLabel}的识别与解析。我从材料中提取到以下关键信息：\n\n1. 项目目标：建设一套可用于实际业务的数字化能力\n2. 核心范围：需求梳理、方案设计、开发实施与交付文档\n3. 交付要求：需提供可验收成果及配套说明\n4. 待确认信息：具体预算、最终工期和接单方要求\n\n我已将已识别内容同步到右侧订单草稿。您可以继续补充信息，也可以下载我整理的需求摘要。`,
      shouldShowPreview: true,
      generatedFile: {
        name: 'AI解析需求摘要.md',
        format: 'md',
        size: '3 KB',
        description: '根据本轮上传材料自动整理',
      },
      generatedFiles: [
        { name: 'AI解析需求摘要.md', format: 'md', size: '3 KB', description: 'Markdown需求摘要' },
        { name: '订单需求说明书.docx', format: 'docx', size: '12 KB', description: '可编辑Word文档' },
        { name: '订单信息清单.xlsx', format: 'xlsx', size: '9 KB', description: '结构化Excel清单' },
        { name: '需求原文整理.txt', format: 'txt', size: '2 KB', description: '纯文本备份' },
      ],
    };
  }

  const input = userInput.toLowerCase();

  if (input.includes('代码') || input.includes('示例程序') || input.includes('接口示例')) {
    return {
      reply: `可以。下面是一个将对话内容整理为订单草稿的 TypeScript 示例：\n\n\`\`\`typescript\ntype OrderDraft = {\n  title: string;\n  requirements: string[];\n  budget?: number;\n};\n\nexport function buildOrderDraft(input: string): OrderDraft {\n  return {\n    title: input.slice(0, 20) || '新订单',\n    requirements: input.split('，').filter(Boolean),\n  };\n}\n\`\`\`\n\n这段代码只是演示生成能力。实际接入时，模型返回的结构化结果仍需经过后端业务校验后再写入订单。`,
      shouldShowPreview: false,
    };
  }

  // 检测修改指令
  if (input.includes('预算') || input.includes('改')) {
    return {
      reply: '好的，我已更新排期与预算模块的内容。您可以在右侧预览区查看更新后的草稿。还有其他需要调整的吗？',
      shouldShowPreview: true,
    };
  }

  // 检测生成订单指令
  if (input.includes('生成订单') || input.includes('帮我生成')) {
    return {
      reply: '我已了解足够信息，为您生成订单预览。您可以在右侧查看订单草稿，点击任意模块可让我重新生成，或继续在对话中告诉我需要调整的内容。',
      shouldShowPreview: true,
    };
  }

  // 首条消息后的追问
  if (!draft || draft.messages.length <= 1) {
    return {
      reply: '收到您的需求描述。为了帮您生成更精准的订单，我需要了解几个关键信息：\n\n1. 这个项目的预期交付时间是什么时候？\n2. 预算范围大概多少？\n3. 对接单方有什么资质或经验要求？',
      shouldShowPreview: false,
    };
  }

  // 多轮后的追问
  const completeness = draft?.completeness || 0;
  if (completeness < 60) {
    return {
      reply: '了解了。还有几个信息需要确认：\n\n1. 交付物具体包含哪些？（如源代码、设计稿、文档等）\n2. 这个订单您希望公开抢单还是指定给某位接单方？',
      shouldShowPreview: false,
    };
  }

  // 信息充分
  return {
    reply: '我已了解足够信息，为您生成订单预览 →\n\n您可以在右侧查看完整的订单草稿。如果某个模块需要调整，直接点击"重新生成"或告诉我"把XX改成YY"即可。',
    shouldShowPreview: true,
  };
};

// ── 主组件 ───────────────────────────────────────────────────────────────────
export function DialogueWorkbench({ userRole, setUserRole, setCurrentPage, onNavigateToMyOrders }: DialogueWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<'dialogue' | 'workbench'>('dialogue');
  const [drafts, setDrafts] = useState<DraftSession[]>(MOCK_DRAFTS);
  const [historyOrders] = useState<HistoryOrder[]>(MOCK_HISTORY_ORDERS);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [readonlyOrder, setReadonlyOrder] = useState<HistoryOrder | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<string | null>(null);
  const [selectedSecondaryCategory, setSelectedSecondaryCategory] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiThinkingStage, setAIThinkingStage] = useState(0);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const roleSwitcherRef = useRef<HTMLDivElement>(null);

  const activeDraft = drafts.find(d => d.id === activeDraftId) || null;
  const selectedPrimary = TASK_CATEGORIES.find(category => category.id === selectedPrimaryCategory) || null;
  const isNewDialogueState = !readonlyOrder && (!activeDraft || activeDraft.messages.length === 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeDraft?.messages]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleSwitcherRef.current && !roleSwitcherRef.current.contains(e.target as Node)) {
        setShowRoleSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!isAIProcessing) {
      setAIThinkingStage(0);
      return;
    }
    const timer = window.setInterval(() => {
      setAIThinkingStage(stage => Math.min(stage + 1, 2));
    }, 700);
    return () => window.clearInterval(timer);
  }, [isAIProcessing]);

  // ── 新建草稿 ───────────────────────────────────────────────────────────────
  const handleNewDraft = () => {
    const newDraft: DraftSession = {
      id: newId(),
      title: '新对话',
      lastEditTime: Date.now(),
      status: 'in_progress',
      completeness: 0,
      messages: [],
      modules: [],
      tags: [],
      taskTypes: [],
    };
    setDrafts(prev => [newDraft, ...prev]);
    setActiveDraftId(newDraft.id);
    setReadonlyOrder(null);
    setShowPreview(false);
    setInputValue('');
    setPendingAttachments([]);
    setIsAIProcessing(false);
    setSelectedPrimaryCategory(null);
    setSelectedSecondaryCategory(null);
    inputRef.current?.focus();
  };

  const handleSelectAttachments = (files: FileList | null) => {
    if (!files) return;
    const nextFiles = Array.from(files).slice(0, 3 - pendingAttachments.length).map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        id: newId(),
        name: file.name,
        type: isImage ? 'image' as const : 'document' as const,
        size: formatFileSize(file.size),
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        status: 'ready' as const,
      };
    });
    setPendingAttachments(prev => [...prev, ...nextFiles].slice(0, 3));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingAttachment = (attachmentId: string) => {
    setPendingAttachments(prev => {
      const target = prev.find(file => file.id === attachmentId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(file => file.id !== attachmentId);
    });
  };

  const handleCopyMessage = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 1600);
    } catch {
      setCopiedMessageId(null);
    }
  };

  const triggerBlobDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadGeneratedFile = async (message: ChatMessage, file = message.generatedFile) => {
    if (!file) return;
    const draftTitle = activeDraft?.title || '订单需求';
    const summary = message.content.replace(/```[\s\S]*?```/g, '').trim();

    if (file.format === 'docx') {
      const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx');
      const document = new Document({
        sections: [{
          children: [
            new Paragraph({ text: draftTitle, heading: HeadingLevel.TITLE }),
            new Paragraph({ text: 'AI解析需求说明书', heading: HeadingLevel.HEADING_1 }),
            ...summary.split('\n').filter(Boolean).map(line => new Paragraph({ children: [new TextRun(line.replace(/^\d+\.\s*/, ''))], bullet: /^\d+\./.test(line) ? { level: 0 } : undefined })),
            new Paragraph({ text: '本文件由多模态模型根据用户上传材料和对话内容自动整理，提交订单前请人工确认。', heading: HeadingLevel.HEADING_2 }),
          ],
        }],
      });
      triggerBlobDownload(await Packer.toBlob(document), file.name);
      return;
    }

    if (file.format === 'xlsx') {
      const { default: JSZip } = await import('jszip');
      const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const rows = [
        ['字段', 'AI提取结果'],
        ['订单标题', draftTitle],
        ['项目目标', '建设一套可用于实际业务的数字化能力'],
        ['核心范围', '需求梳理、方案设计、开发实施与交付文档'],
        ['交付要求', '提供可验收成果及配套说明'],
        ['待确认项', '预算、工期、接单方要求'],
      ];
      const rowXml = rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => `<c r="${columnIndex === 0 ? 'A' : 'B'}${rowIndex + 1}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`).join('')}</row>`).join('');
      const zip = new JSZip();
      zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
      zip.folder('_rels')?.file('.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
      zip.folder('xl')?.file('workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="订单需求" sheetId="1" r:id="rId1"/></sheets></workbook>');
      zip.folder('xl')?.folder('_rels')?.file('workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
      zip.folder('xl')?.folder('worksheets')?.file('sheet1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="18" customWidth="1"/><col min="2" max="2" width="58" customWidth="1"/></cols><sheetData>${rowXml}</sheetData></worksheet>`);
      triggerBlobDownload(await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), file.name);
      return;
    }

    const plainContent = file.format === 'csv'
      ? `字段,AI提取结果\n订单标题,"${draftTitle}"\n项目目标,建设一套可用于实际业务的数字化能力\n核心范围,"需求梳理、方案设计、开发实施与交付文档"\n`
      : file.format === 'md'
        ? `# ${draftTitle}\n\n## AI 解析摘要\n\n${message.content}\n\n> 提交订单前请人工确认。\n`
        : `${draftTitle}\n\nAI解析摘要\n\n${summary}\n\n提交订单前请人工确认。\n`;
    const mime = file.format === 'csv' ? 'text/csv;charset=utf-8' : file.format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';
    triggerBlobDownload(new Blob([plainContent], { type: mime }), file.name);
  };

  // ── 发送消息 ───────────────────────────────────────────────────────────────
  const handleSend = () => {
    const text = inputValue.trim();
    if ((!text && pendingAttachments.length === 0) || isAIProcessing) return;

    let targetDraft = activeDraft;
    const attachments = pendingAttachments.map(file => ({ ...file, status: 'analyzing' as const }));
    const fallbackTitle = attachments.length > 0 ? `解析${attachments[0].name}` : text.slice(0, 20);

    if (!targetDraft) {
      targetDraft = {
        id: newId(),
        title: fallbackTitle,
        lastEditTime: Date.now(),
        status: 'in_progress',
        completeness: 0,
        messages: [],
        modules: [],
        tags: selectedSecondaryCategory ? [selectedSecondaryCategory] : [],
        taskTypes: selectedPrimary ? [selectedPrimary.label] : [],
        primaryCategory: selectedPrimary?.label,
        secondaryCategory: selectedSecondaryCategory || undefined,
      };
      setDrafts(prev => [targetDraft!, ...prev]);
      setActiveDraftId(targetDraft.id);
    }

    const draftId = targetDraft.id;
    const userMsg: ChatMessage = {
      id: newId(),
      role: 'user',
      content: text || '请分析这些材料并帮我整理成订单需求。',
      timestamp: Date.now(),
      attachments,
    };

    setDrafts(prev => prev.map(d => d.id === draftId ? {
      ...d,
      title: d.messages.length === 0 ? fallbackTitle : d.title,
      messages: [...d.messages, userMsg],
      lastEditTime: Date.now(),
    } : d));
    setInputValue('');
    setPendingAttachments([]);
    setIsAIProcessing(true);

    setTimeout(() => {
      const { reply, shouldShowPreview, generatedFile, generatedFiles } = generateAIResponse(text, targetDraft, attachments);
      const categoryPath = [selectedPrimary?.label, selectedSecondaryCategory].filter(Boolean).join(' / ');
      const isFirstMessage = targetDraft!.messages.length === 0;
      const aiReply = isFirstMessage && categoryPath
        ? `已按「${categoryPath}」方向开始梳理。如果后续材料涉及其他任务类型，我会为您调整分类。\n\n${reply}`
        : reply;
      const aiMsg: ChatMessage = { id: newId(), role: 'ai', content: aiReply, timestamp: Date.now(), generatedFile, generatedFiles };

      setDrafts(prev => prev.map(d => {
        if (d.id !== draftId) return d;
        const completedMessages = d.messages.map(message => message.id === userMsg.id ? {
          ...message,
          attachments: message.attachments?.map(file => ({ ...file, status: 'completed' as const })),
        } : message);
        const increment = attachments.length > 0 ? 45 : text.length > 50 ? 25 : 15;
        return {
          ...d,
          messages: [...completedMessages, aiMsg],
          lastEditTime: Date.now(),
          completeness: Math.min(100, d.completeness + increment),
          modules: d.modules.length === 0 && shouldShowPreview ? generateMockModules() : d.modules,
          taskTypes: d.taskTypes.length > 0 ? d.taskTypes : selectedPrimary ? [selectedPrimary.label] : [],
          tags: d.tags.length > 0 ? d.tags : selectedSecondaryCategory ? [selectedSecondaryCategory] : [],
          primaryCategory: d.primaryCategory || selectedPrimary?.label,
          secondaryCategory: d.secondaryCategory || selectedSecondaryCategory || undefined,
        };
      }));
      if (shouldShowPreview) setShowPreview(true);
      setIsAIProcessing(false);
    }, attachments.length > 0 ? 2600 : 2100);
  };

  // ── 生成模拟骨架模块 ─────────────────────────────────────────────────────────
  const generateMockModules = (): SkeletonModule[] => [
    { id: newId(), name: '项目概述', content: '基于对话内容生成的项目概述。AI已从您的描述中提炼了项目背景、目标和核心需求。', filled: true, type: 'markdown' },
    { id: newId(), name: '需求说明', content: '详细需求说明，包含功能清单、技术要求等。支持Markdown格式渲染。', filled: true, type: 'markdown' },
    { id: newId(), name: '交付物要求', content: '源代码 + 部署文档 + 操作手册', filled: true, type: 'markdown' },
    { id: newId(), name: '排期与预算', content: '预算: 5-8万 | 工期: 2个月', filled: true, type: 'structured' },
    { id: newId(), name: '接单要求', content: '3年以上相关经验，熟悉对应技术栈', filled: true, type: 'structured' },
    { id: newId(), name: '订单标签', content: 'React, TypeScript, 电商', filled: true, type: 'structured' },
    { id: newId(), name: '结算模式', content: '平台抽佣', filled: true, type: 'structured' },
    { id: newId(), name: '订单属性', content: '公开订单', filled: true, type: 'structured' },
    { id: newId(), name: '接单方式', content: '公开抢单 | 招标时限: 7天', filled: true, type: 'structured' },
  ];

  // ── 重新生成模块 ─────────────────────────────────────────────────────────────
  const handleRegenerateModule = (moduleId: string) => {
    if (!activeDraft) return;
    setDrafts(prev => prev.map(d => {
      if (d.id !== activeDraft.id) return d;
      return {
        ...d,
        modules: d.modules.map(m => m.id === moduleId ? { ...m, content: m.content + ' [已重新生成]' } : m),
      };
    }));
  };

  // ── 删除草稿 ───────────────────────────────────────────────────────────────
  const handleDeleteDraft = (draftId: string) => {
    setDrafts(prev => prev.filter(d => d.id !== draftId));
    if (activeDraftId === draftId) {
      setActiveDraftId(null);
      setShowPreview(false);
    }
  };

  // ── 提交审核 ───────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!activeDraft) return;
    // 从草稿列表移除，加入历史订单
    setDrafts(prev => prev.filter(d => d.id !== activeDraft.id));
    setActiveDraftId(null);
    setShowPreview(false);
    setShowSubmitConfirm(false);
    // 模拟加入历史订单（实际由后端处理）
    alert('订单已提交审核，您可以在下方历史订单中查看');
  };

  // ── 渲染 ───────────────────────────────────────────────────────────────────
  if (activeTab === 'workbench') {
    // 复用现有 CustomerWorkbench 的卡片式布局（简化版）
    return (
      <div className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--bg-root)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Tab 切换 */}
          <div className="flex items-center gap-1 mb-6 p-1 rounded-lg inline-flex" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <button onClick={() => setActiveTab('dialogue')} className="px-4 py-1.5 text-[13px] font-medium rounded-md transition-all flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <MessageSquare className="w-3.5 h-3.5" /> 对话发单
            </button>
            <button onClick={() => setActiveTab('workbench')} className="px-4 py-1.5 text-[13px] font-medium rounded-md transition-all flex items-center gap-1.5" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-card)' }}>
              <LayoutGrid className="w-3.5 h-3.5" /> 我的工作台
            </button>
          </div>
          <WorkbenchLegacy onSwitchToDialogue={() => setActiveTab('dialogue')} setCurrentPage={setCurrentPage} onNavigateToMyOrders={onNavigateToMyOrders} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-root)' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_ATTACHMENT_TYPES}
        multiple
        className="hidden"
        onChange={(event) => handleSelectAttachments(event.target.files)}
      />
      {/* 顶部 Tab 切换 + 角色切换 */}
      <div className="flex items-center justify-between px-6 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)' }}>
          <button onClick={() => setActiveTab('dialogue')} className="px-4 py-1.5 text-[13px] font-medium rounded-md transition-all flex items-center gap-1.5" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-card)' }}>
            <MessageSquare className="w-3.5 h-3.5" /> 对话发单
          </button>
          <button onClick={() => setActiveTab('workbench')} className="px-4 py-1.5 text-[13px] font-medium rounded-md transition-all flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <LayoutGrid className="w-3.5 h-3.5" /> 我的工作台
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage('order-square')} className="px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors flex items-center gap-1.5" style={{ color: 'var(--brand)', border: '1px solid var(--brand)' }}>
            <LayoutGrid className="w-3.5 h-3.5" /> 浏览订单广场
          </button>
          <div className="relative" ref={roleSwitcherRef}>
            <button onClick={() => setShowRoleSwitcher(!showRoleSwitcher)} className="px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors flex items-center gap-1.5" style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)' }}>
              <span>当前：客户</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showRoleSwitcher && (
              <div className="absolute top-full right-0 mt-1 rounded-lg py-1 z-50 min-w-[160px]" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-dropdown)' }}>
                {[
                  { role: 'first-visit', label: '首次访问（首页）' },
                  { role: 'user', label: '切换为接单方' },
                  { role: 'browse-only', label: '切换为仅浏览' },
                ].map(item => (
                  <button key={item.role} onClick={() => { setUserRole(item.role); setShowRoleSwitcher(false); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-[var(--bg-hover)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 三栏主体 */}
      <div className="flex-1 flex overflow-hidden">
        {/* ═══ 左侧栏 ═══ */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden" style={{ borderRight: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
            >
              {/* 上区：草稿会话 */}
              <div className="flex flex-col overflow-hidden" style={{ flex: '1 1 55%' }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>草稿会话</span>
                  <button onClick={handleNewDraft} className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)]" style={{ color: 'var(--brand)' }} title="新建对话">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto">
                  {drafts.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-disabled)' }} />
                      <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>开始第一次对话 →</p>
                    </div>
                  ) : (
                    drafts.map(draft => (
                      <div
                        key={draft.id}
                        onClick={() => { setActiveDraftId(draft.id); setReadonlyOrder(null); setShowPreview(draft.modules.length > 0); }}
                        className="group px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
                        style={{ backgroundColor: activeDraftId === draft.id ? 'var(--bg-selected)' : 'transparent', borderLeft: activeDraftId === draft.id ? '2px solid var(--brand)' : '2px solid transparent' }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-[13px] font-medium truncate flex-1" style={{ color: 'var(--text-primary)' }}>{draft.title}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteDraft(draft.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                          {draft.status === 'rejected_back' ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: 'var(--danger)', backgroundColor: 'var(--danger-bg)' }}>已打回</span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: 'var(--info)', backgroundColor: 'var(--info-bg)' }}>进行中</span>
                          )}
                          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{formatTime(draft.lastEditTime)}</span>
                        </div>
                        {/* 完整度进度条 */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                            <div className="h-1 rounded-full transition-all" style={{ width: `${draft.completeness}%`, backgroundColor: draft.status === 'rejected_back' ? 'var(--danger)' : 'var(--brand)' }} />
                          </div>
                          <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{draft.completeness}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 下区：历史订单 */}
              <div className="flex flex-col overflow-hidden" style={{ flex: '1 1 45%', borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>历史订单</span>
                  <button onClick={onNavigateToMyOrders} className="text-[11px] font-medium hover:underline" style={{ color: 'var(--brand)' }}>查看全部 →</button>
                </div>
                {/* 筛选 */}
                <div className="flex gap-1 px-3 py-2">
                  {['all', '待审核', '进行中', '已完成'].map(f => (
                    <button key={f} onClick={() => setOrderFilter(f)} className="px-2 py-0.5 text-[10px] rounded-full transition-colors" style={{
                      backgroundColor: orderFilter === f ? 'var(--brand-subtle)' : 'transparent',
                      color: orderFilter === f ? 'var(--brand)' : 'var(--text-tertiary)',
                      border: `1px solid ${orderFilter === f ? 'var(--brand-ring)' : 'var(--border-subtle)'}`,
                    }}>
                      {f === 'all' ? '全部' : f}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-auto">
                  {historyOrders.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>暂无历史订单</p>
                    </div>
                  ) : (
                    historyOrders.map(order => {
                      const cfg = STATUS_CONFIG[order.status] || { color: 'var(--text-secondary)', bg: 'var(--bg-subtle)' };
                      return (
                        <div key={order.id} onClick={() => { setReadonlyOrder(order); setActiveDraftId(null); setShowPreview(true); }} className="group px-4 py-2.5 cursor-pointer transition-colors hover:bg-[var(--bg-hover)]" style={{ backgroundColor: readonlyOrder?.id === order.id ? 'var(--bg-selected)' : 'transparent', borderLeft: readonlyOrder?.id === order.id ? '2px solid var(--text-tertiary)' : '2px solid transparent' }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[12px] font-medium truncate flex-1" style={{ color: 'var(--text-primary)' }}>{order.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ml-2" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{order.status}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{formatTime(order.submitTime)}</span>
                            {order.sourceDialogueTitle && (
                              <span className="text-[10px] flex items-center gap-0.5 cursor-help" style={{ color: 'var(--text-tertiary)' }} title={`来源：${order.sourceDialogueTitle}`}>
                                <Info className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 左栏折叠把手 */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-1 hover:w-1.5 transition-all cursor-pointer flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--border-subtle)' }}
          title={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
        >
          {sidebarCollapsed && <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />}
        </button>

        {/* ═══ 中间对话区 ═══ */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-root)' }}>
          {/* 对话头部栏 */}
          <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-3">
              {readonlyOrder ? (
                <>
                  <FileText className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{readonlyOrder.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-subtle)' }}>只读模式</span>
                  {(() => {
                    const cfg = STATUS_CONFIG[readonlyOrder.status] || { color: 'var(--text-secondary)', bg: 'var(--bg-subtle)' };
                    return <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{readonlyOrder.status}</span>;
                  })()}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                  <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {activeDraft ? activeDraft.title : '新对话'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ color: 'var(--success)', backgroundColor: 'var(--success-bg)' }} title="后台接入全能多模态大模型，支持按配置替换国产模型">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--success)' }} />
                    多模态 AI
                  </span>
                  {activeDraft && activeDraft.messages.length > 0 && (
                    <>
                      {(activeDraft.primaryCategory || activeDraft.taskTypes[0]) && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-subtle)' }}>
                          {activeDraft.primaryCategory || activeDraft.taskTypes[0]}{activeDraft.secondaryCategory ? ` / ${activeDraft.secondaryCategory}` : ''}
                        </span>
                      )}
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)' }}>
                        信息收集 {activeDraft.completeness}%
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
            {/* 进度指示器 */}
            {activeDraft && activeDraft.messages.length > 0 && !readonlyOrder && (
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${activeDraft.completeness}%`, backgroundColor: 'var(--brand)' }} />
                </div>
              </div>
            )}
          </div>

          {/* 打回原因横幅 */}
          {activeDraft?.status === 'rejected_back' && activeDraft.rejectReason && !readonlyOrder && (
            <div className="px-6 py-2.5 flex items-start gap-2" style={{ backgroundColor: 'var(--danger-bg)', borderBottom: '1px solid var(--danger-border)' }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--danger)' }} />
              <div className="flex-1">
                <span className="text-[12px] font-medium" style={{ color: 'var(--danger)' }}>运营打回原因：</span>
                <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{activeDraft.rejectReason}</span>
              </div>
            </div>
          )}

          {/* 对话消息流 */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {readonlyOrder ? (
              /* 只读模式：展示历史订单的对话 */
              readonlyOrder.messages && readonlyOrder.messages.length > 0 ? (
                <div className="max-w-3xl mx-auto space-y-4">
                  {readonlyOrder.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2.5 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: msg.role === 'ai' ? 'var(--brand-subtle)' : 'var(--bg-subtle)' }}>
                          {msg.role === 'ai' ? <Sparkles className="w-4 h-4" style={{ color: 'var(--brand)' }} /> : <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>我</span>}
                        </div>
                        <div className="rounded-lg px-3.5 py-2.5 whitespace-pre-wrap" style={{ backgroundColor: msg.role === 'ai' ? 'var(--bg-surface)' : 'var(--brand)', color: msg.role === 'ai' ? 'var(--text-primary)' : 'var(--text-inverse)', border: msg.role === 'ai' ? '1px solid var(--border-subtle)' : 'none', boxShadow: msg.role === 'ai' ? 'var(--shadow-card)' : 'none' }}>
                          <p className="text-[13px] leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <FileText className="w-10 h-10 mb-3" style={{ color: 'var(--text-disabled)' }} />
                  <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>该订单无对话历史记录</p>
                </div>
              )
            ) : !activeDraft || activeDraft.messages.length === 0 ? (
              /* 新对话初始态：分类选择 + 聚焦输入 */
              <div className="min-h-full flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-[780px] text-left">
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl" style={{ backgroundColor: 'var(--market-brand-subtle)', color: 'var(--market-brand)' }}>
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <span className="text-[12px] font-medium" style={{ color: 'var(--market-brand)' }}>AI 对话发单</span>
                    </div>
                    <h2 className="text-[32px] font-semibold tracking-[-0.035em] mb-3" style={{ color: 'var(--text-primary)' }}>想发布什么任务？</h2>
                    <p className="text-[15px] leading-6 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                      选择任务方向并描述需求，AI 会结合分类逐步完善订单内容。不确定分类也没关系，可以直接开始。
                    </p>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>任务一级分类</span>
                      {selectedPrimary && (
                        <button
                          onClick={() => { setSelectedPrimaryCategory(null); setSelectedSecondaryCategory(null); }}
                          className="text-[11px] hover:underline"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          清除选择
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2" role="listbox" aria-label="任务一级分类">
                      {TASK_CATEGORIES.map(category => {
                        const Icon = category.icon;
                        const selected = selectedPrimaryCategory === category.id;
                        return (
                          <button
                            key={category.id}
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              setSelectedPrimaryCategory(selected ? null : category.id);
                              setSelectedSecondaryCategory(null);
                            }}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all active:scale-[0.98]"
                            style={{
                              color: selected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                              backgroundColor: selected ? 'var(--market-brand)' : 'var(--bg-surface)',
                              border: selected ? '1px solid var(--market-brand)' : '1px solid var(--border-default)',
                              boxShadow: selected ? 'var(--market-shadow-card)' : 'none',
                            }}
                          >
                            <Icon className="w-4 h-4" />
                            {category.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {selectedPrimary && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-5"
                        aria-live="polite"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>细分方向</span>
                          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>可选，不选也能直接开始</span>
                        </div>
                        <div className="flex flex-wrap gap-2" role="listbox" aria-label={`${selectedPrimary.label}细分方向`}>
                          {selectedPrimary.children.map(child => {
                            const selected = selectedSecondaryCategory === child;
                            return (
                              <button
                                key={child}
                                role="option"
                                aria-selected={selected}
                                onClick={() => setSelectedSecondaryCategory(selected ? null : child)}
                                className="px-3 py-1.5 rounded-full text-[12px] transition-all active:scale-[0.98]"
                                style={{
                                  color: selected ? 'var(--market-brand)' : 'var(--text-secondary)',
                                  backgroundColor: selected ? 'var(--market-brand-subtle)' : 'var(--bg-subtle)',
                                  border: selected ? '1px solid var(--market-brand-ring)' : '1px solid transparent',
                                }}
                              >
                                {child}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="rounded-3xl p-3" style={{ border: '1px solid var(--market-brand-ring)', backgroundColor: 'var(--bg-surface)', boxShadow: 'var(--market-shadow-hover)' }}>
                    <PendingAttachmentList attachments={pendingAttachments} onRemove={removePendingAttachment} />
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                          event.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="描述项目目标、交付内容或已有想法……"
                      rows={4}
                      className="w-full resize-none bg-transparent outline-none text-[15px] leading-6 px-2 py-2 placeholder:text-[var(--text-tertiary)]"
                      style={{ color: 'var(--text-primary)', maxHeight: '180px' }}
                    />
                    <div className="flex items-center justify-between gap-3 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)] shrink-0" style={{ color: 'var(--text-tertiary)' }} title="上传图片或文档（最多3个）" aria-label="上传图片或文档">
                          <Paperclip className="w-4 h-4" />
                        </button>
                        {selectedPrimary ? (
                          <div className="flex items-center gap-1.5 min-w-0 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                            <Tag className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{selectedPrimary.label}{selectedSecondaryCategory ? ` / ${selectedSecondaryCategory}` : ''}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                            <CircleHelp className="w-3.5 h-3.5" />
                            AI 将根据描述自动判断分类
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleSend}
                        disabled={(!inputValue.trim() && pendingAttachments.length === 0) || isAIProcessing}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 disabled:opacity-35 enabled:hover:scale-105 active:scale-[0.98]"
                        style={{ backgroundColor: 'var(--market-brand)', color: 'white' }}
                        aria-label="开始对话"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] mt-3 text-center" style={{ color: 'var(--text-tertiary)' }}>
                    支持图片、PDF、Word、文本 · 单个文件不超过 20 MB · Ctrl + Enter 发送
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4">
                {activeDraft.messages.map(msg => (
                  <ChatMessageBubble
                    key={msg.id}
                    message={msg}
                    copied={copiedMessageId === msg.id}
                    onCopy={() => handleCopyMessage(msg)}
                    onDownload={(file) => handleDownloadGeneratedFile(msg, file)}
                  />
                ))}
                {isAIProcessing && (
                  <AIProcessingIndicator
                    hasAttachments={Boolean(activeDraft.messages[activeDraft.messages.length - 1]?.attachments?.length)}
                    activeStage={aiThinkingStage}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* 输入框区 — 初始态使用聚焦输入框，只读模式下隐藏 */}
          {!readonlyOrder && !isNewDialogueState && (
          <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="max-w-3xl mx-auto">
              <div className="rounded-3xl p-3" style={{ border: '1px solid var(--market-brand-ring)', backgroundColor: 'var(--bg-surface)', boxShadow: 'var(--market-shadow-hover)' }}>
                <PendingAttachmentList attachments={pendingAttachments} onRemove={removePendingAttachment} />
                <div className="flex items-end gap-2">
                <button onClick={() => fileInputRef.current?.click()} disabled={pendingAttachments.length >= 3 || isAIProcessing} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)] shrink-0 disabled:opacity-40" style={{ color: 'var(--text-tertiary)' }} title="上传图片或文档（最多3个）">
                  <Paperclip className="w-4 h-4" />
                </button>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSend(); } }}
                  placeholder="描述您的需求，AI 帮您生成订单…（Ctrl+Enter 发送）"
                  rows={1}
                  className="flex-1 resize-none bg-transparent outline-none text-[15px] py-3 placeholder:text-[var(--text-tertiary)]"
                  style={{ color: 'var(--text-primary)', maxHeight: '120px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={(!inputValue.trim() && pendingAttachments.length === 0) || isAIProcessing}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 disabled:opacity-40 enabled:hover:scale-105"
                  style={{ backgroundColor: 'var(--market-brand)', color: 'white' }}
                >
                  {isAIProcessing ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
                </div>
              </div>
              <p className="text-[10px] mt-1.5 text-center" style={{ color: 'var(--text-tertiary)' }}>
                AI 可理解文本、图片和文档，生成内容可能存在偏差，提交订单前请仔细确认。
              </p>
            </div>
          </div>
          )}
        </div>

        {/* ═══ 右侧预览区 ═══ */}
        <AnimatePresence>
          {showPreview && (activeDraft || readonlyOrder) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 460, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col overflow-hidden" style={{ borderLeft: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
            >
              {/* 预览头部 */}
              <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {readonlyOrder ? '订单内容（只读）' : '订单草稿预览'}
                  </span>
                  <button onClick={() => { setShowPreview(false); if (readonlyOrder) setReadonlyOrder(null); }} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {readonlyOrder ? (
                    <>
                      {readonlyOrder.taskTypes?.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: 'var(--type-software)', backgroundColor: 'var(--type-software-bg)' }}>{t}</span>
                      ))}
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>提交于 {formatTime(readonlyOrder.submitTime)}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)' }}>
                        完整度 {activeDraft!.completeness}%
                      </span>
                      {activeDraft!.taskTypes.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: 'var(--type-software)', backgroundColor: 'var(--type-software-bg)' }}>{t}</span>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* 骨架模块卡片列表 */}
              <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
                {readonlyOrder ? (
                  /* 只读模式：展示历史订单的模块快照 */
                  readonlyOrder.modules && readonlyOrder.modules.length > 0 ? (
                    readonlyOrder.modules.map(module => (
                      <DraftModuleCard key={module.id} module={module} isEditing={false} onRegenerate={() => {}} onEdit={() => {}} onSave={() => {}} readonly />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>无草稿快照数据</p>
                    </div>
                  )
                ) : activeDraft!.modules.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>AI 正在生成草稿内容…</p>
                  </div>
                ) : (
                  activeDraft!.modules.map(module => (
                    <DraftModuleCard
                      key={module.id}
                      module={module}
                      isEditing={editingModuleId === module.id}
                      onRegenerate={() => handleRegenerateModule(module.id)}
                      onEdit={() => setEditingModuleId(editingModuleId === module.id ? null : module.id)}
                      onSave={(content) => {
                        setDrafts(prev => prev.map(d => d.id === activeDraft!.id ? { ...d, modules: d.modules.map(m => m.id === module.id ? { ...m, content } : m) } : d));
                        setEditingModuleId(null);
                      }}
                    />
                  ))
                )}
              </div>

              {/* 底部操作区 */}
              <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
                {readonlyOrder ? (
                  /* 只读模式：查看完整订单详情 */
                  <button
                    onClick={onNavigateToMyOrders}
                    className="w-full py-3 rounded-full text-[14px] font-semibold transition-all flex items-center justify-center gap-1.5 hover:-translate-y-px"
                    style={{ backgroundColor: 'var(--market-brand)', color: 'white', boxShadow: 'var(--market-shadow-card)' }}
                  >
                    查看完整订单详情 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    disabled={activeDraft!.completeness < 80}
                    className="w-full py-3 rounded-full text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:-translate-y-px"
                    style={{ backgroundColor: 'var(--market-brand)', color: 'white', boxShadow: 'var(--market-shadow-card)' }}
                  >
                    {activeDraft!.completeness < 80 ? `信息完整度需达到80%（当前${activeDraft!.completeness}%）` : '确认并提交审核'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 提交确认弹窗 */}
      {showSubmitConfirm && activeDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(13,17,23,0.4)' }} onClick={() => setShowSubmitConfirm(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-xl p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: 'var(--bg-surface)', boxShadow: 'var(--shadow-modal)' }}
          >
            <h3 className="text-[16px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>确认提交审核</h3>
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-[13px]">
                <span style={{ color: 'var(--text-tertiary)' }}>订单标题</span>
                <span style={{ color: 'var(--text-primary)' }}>{activeDraft.title}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span style={{ color: 'var(--text-tertiary)' }}>任务类型</span>
                <span style={{ color: 'var(--text-primary)' }}>{activeDraft.taskTypes.join('、') || '待分类'}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span style={{ color: 'var(--text-tertiary)' }}>信息完整度</span>
                <span style={{ color: 'var(--success)' }}>{activeDraft.completeness}%</span>
              </div>
            </div>
            <p className="text-[12px] mb-4" style={{ color: 'var(--text-tertiary)' }}>提交后订单将进入待审核状态，运营人员会尽快审核。审核通过后订单将发布到订单广场。</p>
            <div className="flex gap-2">
              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors" style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>取消</button>
              <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors" style={{ backgroundColor: 'var(--brand)', color: 'white' }}>确认提交</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function PendingAttachmentList({ attachments, onRemove }: { attachments: ChatAttachment[]; onRemove: (id: string) => void }) {
  if (attachments.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 pb-3 mb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      {attachments.map(file => (
        <div key={file.id} className="flex items-center gap-2 p-2 rounded-xl max-w-[240px]" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
          {file.previewUrl ? (
            <img src={file.previewUrl} alt={file.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}>
              <FileText className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{file.size} · 待发送</div>
          </div>
          <button onClick={() => onRemove(file.id)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--bg-hover)] shrink-0" style={{ color: 'var(--text-tertiary)' }} aria-label={`移除${file.name}`}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function MessageAttachmentCard({ attachment }: { attachment: ChatAttachment }) {
  const processing = attachment.status === 'analyzing';
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg mt-2" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
      {attachment.previewUrl ? (
        <img src={attachment.previewUrl} alt={attachment.name} className="w-12 h-12 rounded-md object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--brand-subtle)', color: 'var(--brand)' }}>
          {attachment.type === 'image' ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{attachment.name}</div>
        <div className="text-[10px] flex items-center gap-1" style={{ color: processing ? 'var(--brand)' : 'var(--success)' }}>
          {processing ? <LoaderCircle className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
          {processing ? '正在识别并解析' : `已解析 · ${attachment.size}`}
        </div>
      </div>
    </div>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1600);
    } catch {
      setCopiedCode(null);
    }
  };
  return (
    <div className="text-[13px] leading-relaxed min-w-0">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
          blockquote: ({ children }) => <blockquote className="pl-3 my-2" style={{ borderLeft: '3px solid var(--brand-ring)', color: 'var(--text-secondary)' }}>{children}</blockquote>,
          code: ({ className, children, ...props }) => {
            const code = String(children).replace(/\n$/, '');
            const language = /language-([\w-]+)/.exec(className || '')?.[1];
            const isBlock = Boolean(className) || code.includes('\n');
            if (!isBlock) return <code className="px-1 py-0.5 rounded text-[12px]" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--brand)' }} {...props}>{children}</code>;
            return (
              <div className="my-3 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--code-bg, #16181d)' }}>
                <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-subtle)' }}>
                  <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{language || '代码'}</span>
                  <button onClick={() => copyCode(code)} className="flex items-center gap-1 text-[10px] hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                    {copiedCode === code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copiedCode === code ? '已复制' : '复制代码'}
                  </button>
                </div>
                <pre className="m-0 p-3 overflow-x-auto text-[12px] leading-5 font-mono" style={{ color: '#E6EDF3' }}><code>{code}</code></pre>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function ChatMessageBubble({ message, copied, onCopy, onDownload }: { message: ChatMessage; copied: boolean; onCopy: () => void; onDownload: (file?: GeneratedFile) => void }) {
  const isAI = message.role === 'ai';
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`group flex gap-2.5 max-w-[82%] ${isAI ? '' : 'flex-row-reverse'}`}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: isAI ? 'var(--brand-subtle)' : 'var(--bg-subtle)' }}>
          {isAI ? <Sparkles className="w-4 h-4" style={{ color: 'var(--brand)' }} /> : <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>我</span>}
        </div>
        <div className="min-w-0">
          <div className="rounded-lg px-3.5 py-2.5 whitespace-pre-wrap" style={{ backgroundColor: isAI ? 'var(--bg-surface)' : 'var(--brand)', color: isAI ? 'var(--text-primary)' : 'var(--text-inverse)', border: isAI ? '1px solid var(--border-subtle)' : 'none', boxShadow: isAI ? 'var(--shadow-card)' : 'none' }}>
            {isAI ? <MarkdownMessage content={message.content} /> : <p className="text-[13px] leading-relaxed">{message.content}</p>}
            {message.attachments?.map(file => <MessageAttachmentCard key={file.id} attachment={file} />)}
            {(message.generatedFiles || (message.generatedFile ? [message.generatedFile] : [])).length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>AI 已生成以下文件</div>
                {(message.generatedFiles || [message.generatedFile!]).map(file => (
                  <div key={file.name} className="p-3 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)' }}><FileText className="w-4 h-4" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{file.description} · {file.size}</div>
                    </div>
                    <button onClick={() => onDownload(file)} className="px-2.5 py-1.5 rounded-md text-[11px] font-medium flex items-center gap-1 hover:bg-[var(--bg-hover)]" style={{ color: 'var(--brand)', border: '1px solid var(--brand-ring)' }}>
                      <Download className="w-3.5 h-3.5" /> 下载
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {isAI && (
            <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button onClick={onCopy} className="h-7 px-2 rounded-md flex items-center gap-1 text-[10px] hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied ? '已复制' : '复制'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AIProcessingIndicator({ hasAttachments, activeStage }: { hasAttachments: boolean; activeStage: number }) {
  const stages = hasAttachments
    ? ['识别图片与文档', '提取项目关键信息', '整理为订单草稿']
    : ['理解当前需求', '结合对话上下文', '组织回复与订单信息'];
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start" aria-live="polite">
      <div className="flex gap-2.5 max-w-[86%]">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--brand-subtle)' }}
        >
          <BrainCircuit className="w-4 h-4" style={{ color: 'var(--brand)' }} />
        </motion.div>
        <div className="rounded-xl px-4 py-3.5 min-w-[300px]" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--brand-ring)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>AI 正在思考</span>
              <span className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map(dot => (
                  <motion.span
                    key={dot}
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: 'var(--brand)' }}
                    animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.16 }}
                  />
                ))}
              </span>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>请稍候</span>
          </div>
          <div className="space-y-2">
            {stages.map((stage, index) => {
              const completed = index < activeStage;
              const active = index === activeStage;
              return (
                <div key={stage} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: completed ? 'var(--success-bg)' : active ? 'var(--brand-subtle)' : 'var(--bg-subtle)', color: completed ? 'var(--success)' : active ? 'var(--brand)' : 'var(--text-disabled)' }}>
                    {completed ? <Check className="w-2.5 h-2.5" /> : active ? <LoaderCircle className="w-2.5 h-2.5 animate-spin" /> : <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }} />}
                  </div>
                  <span className="text-[11px] transition-colors" style={{ color: completed ? 'var(--text-tertiary)' : active ? 'var(--text-primary)' : 'var(--text-disabled)' }}>{stage}</span>
                  {active && <span className="text-[10px] ml-auto" style={{ color: 'var(--brand)' }}>处理中</span>}
                </div>
              );
            })}
          </div>
          <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--brand)' }}
              animate={{ width: `${Math.min(92, 28 + activeStage * 30)}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── 骨架模块卡片子组件 ─────────────────────────────────────────────────────────
function DraftModuleCard({ module, isEditing, onRegenerate, onEdit, onSave, readonly }: {
  module: SkeletonModule;
  isEditing: boolean;
  onRegenerate: () => void;
  onEdit: () => void;
  onSave: (content: string) => void;
  readonly?: boolean;
}) {
  const [editContent, setEditContent] = useState(module.content);

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)', backgroundColor: module.filled ? 'var(--bg-surface)' : 'var(--bg-subtle)' }}>
      {/* 卡片头部 */}
      <div className="flex items-center justify-between px-3.5 py-2.5" style={{ borderBottom: module.filled ? '1px solid var(--border-subtle)' : 'none' }}>
        <div className="flex items-center gap-2">
          {module.type === 'structured' ? <Tag className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} /> : <FileText className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />}
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{module.name}</span>
        </div>
        {module.filled && !readonly && (
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }} title="编辑">
              <Edit3 className="w-3 h-3" />
            </button>
            <button onClick={onRegenerate} className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }} title="重新生成">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      {/* 卡片内容 */}
      <div className="px-3.5 py-2.5">
        {module.filled ? (
          isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-[12px] p-2 rounded resize-none outline-none"
                style={{ border: '1px solid var(--brand)', backgroundColor: 'var(--bg-root)', color: 'var(--text-primary)', minHeight: '80px' }}
                autoFocus
              />
              <div className="flex gap-1 mt-1.5">
                <button onClick={() => onSave(editContent)} className="px-2 py-1 text-[11px] rounded" style={{ backgroundColor: 'var(--brand)', color: 'white' }}>保存</button>
                <button onClick={onEdit} className="px-2 py-1 text-[11px] rounded" style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>取消</button>
              </div>
            </div>
          ) : (
            <p className="text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{module.content}</p>
          )
        ) : (
          <p className="text-[12px] italic" style={{ color: 'var(--text-tertiary)' }}>信息待补充</p>
        )}
      </div>
    </div>
  );
}

// ── 旧版工作台（简化复用） ─────────────────────────────────────────────────────
function WorkbenchLegacy({ onSwitchToDialogue, setCurrentPage, onNavigateToMyOrders }: {
  onSwitchToDialogue: () => void;
  setCurrentPage: (page: string) => void;
  onNavigateToMyOrders: () => void;
}) {
  const orderStats = { pending: 1, promoting: 3, active: 2, toVerify: 1 };
  const recentOrders = [
    { id: 1, title: 'AI智能问答系统开发', status: '推广中', bidCount: 5 },
    { id: 2, title: '品牌VI设计', status: '推广中', bidCount: 2 },
    { id: 3, title: '企业管理系统开发', status: '交付中', bidCount: 1 },
    { id: 4, title: '官网界面改版', status: '交付中', bidCount: 1 },
    { id: 5, title: '数据分析平台', status: '已验收', bidCount: 1 },
    { id: 6, title: '电商小程序开发', status: '待审核', bidCount: 0 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>我的工作台</h1>
        <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          您有 {orderStats.pending + orderStats.promoting + orderStats.active + orderStats.toVerify} 个活跃订单
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: '待审核', count: orderStats.pending, color: 'var(--warning)', bg: 'var(--warning-bg)' },
          { label: '推广中', count: orderStats.promoting, color: 'var(--info)', bg: 'var(--info-bg)' },
          { label: '处理中', count: orderStats.active, color: 'var(--brand)', bg: 'var(--brand-subtle)' },
          { label: '待验收', count: orderStats.toVerify, color: 'var(--success)', bg: 'var(--success-bg)' },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div className="text-[24px] font-semibold mb-1" style={{ color: stat.color }}>{stat.count}</div>
            <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>我的订单</h3>
          <button onClick={onNavigateToMyOrders} className="text-[12px] font-medium hover:underline" style={{ color: 'var(--brand)' }}>查看全部 →</button>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {recentOrders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || { color: 'var(--text-secondary)', bg: 'var(--bg-subtle)' };
            return (
              <div key={order.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{order.title}</div>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{order.status}</span>
                </div>
                {order.bidCount > 0 && <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{order.bidCount}人报名</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
