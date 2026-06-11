import { useState, useEffect, useMemo } from 'react';
import {
  Search, Plus, ArrowUpDown, ChevronLeft, ChevronRight, ChevronDown, X,
  FileText, Clock, Users, TrendingUp, Sparkles, Tag,
  SlidersHorizontal, ArrowRight, Flame, BadgeCheck,
  Building2, Code2, Eye, ShieldCheck, Info,
} from 'lucide-react';
import { OrderPublishPage } from './OrderPublishPage';
import { OrderSquareDetail } from './OrderSquareDetail';
import { CustomerQualification } from './CustomerQualification';
import { UserQualification } from './UserQualification';
import { SkeletonCardGrid } from './Skeleton';
import { EmptySearch } from './EmptyState';

type UserRole = 'first-visit' | 'customer' | 'user' | 'browse-only';
type SortField = 'publishTime' | 'budget' | 'bidCount';
type SortOrder = 'asc' | 'desc';
type PageView = 'list' | 'publish' | 'detail';

interface CreditDimensions {
  onTimeDeliveryRate: string;  // 按时交付率
  oneTimePassRate: string;     // 一次通过率
  repurchaseRate: string;      // 复购率
  overdueRate: string;         // 超期率
  responseSpeed: string;       // 响应速度
}

// 订单状态类型（11种状态）
type OrderStatus =
  | 'new'                // 新建
  | 'pending_review'     // 待审核
  | 'promoting'          // 推广中
  | 'agreement_pending'  // 协议签署中
  | 'in_delivery'        // 交付中
  | 'accepted'           // 已验收
  | 'pending_settlement' // 待结算
  | 'settled'            // 已结算
  | 'cancelled'          // 已取消
  | 'terminated'         // 已终止
  | 'closed';            // 已关闭

interface Order {
  id: number;
  title: string;
  taskType: string;
  budgetMin: number;
  budgetMax: number;
  bidCount: number;
  publishTime: string;
  publishTimestamp: number;
  description: string;
  creditScore?: number;
  creditDimensions?: CreditDimensions;
  deliveryRate?: string;
  deliveryMode?: 'online' | 'offline' | 'hybrid';
  aiTags?: string[];
  bidDeadline?: string;
  pushInfo?: {
    pushType: 'customer' | 'skill_match';
    pushExpireAt: number;
    matchTags: string[];
    tagMatchCount?: number;
  };
  // 详情字段（可选 — 仅部分订单有完整详情数据）
  status?: OrderStatus;
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

const mockOrders: Order[] = [
  {
    id: 1, title: 'AI智能问答系统开发', taskType: '软件开发', budgetMin: 50000, budgetMax: 80000, bidCount: 12,
    publishTime: '2026-03-09', publishTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    bidDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    description: `需要开发一个基于GPT的智能问答系统，支持多轮对话和上下文理解。

**核心目标**：系统需要具备良好的用户体验，响应速度快，支持高并发访问。

### 技术要点
- 基于大语言模型的多轮对话能力
- 支持上下文记忆和知识库检索`,
    creditScore: 92, deliveryRate: '98%', deliveryMode: 'online', aiTags: ['React', 'TypeScript', 'GPT API'],
    status: 'promoting', publisher: '某某科技有限公司', deadline: '2026-04-15',
    requirements: [
      '熟悉GPT API接口调用，参考文档: [OpenAI API Reference](https://platform.openai.com/docs)',
      '掌握React 18 + TypeScript + Node.js技术栈，需提供技术方案',
      '有AI对话系统开发经验，附过往案例',
      '具备良好的代码质量意识，参考规范: [CSDN代码规范](https://spec.csdn.net)',
      '交付物需包含: 架构设计图、接口文档、测试报告'
    ],
    deliverables: [
      '完整的系统源代码（Git仓库）',
      '系统部署文档（PDF + 在线链接）',
      '用户使用手册（支持Markdown格式）',
      '技术架构文档（含架构图）',
      '性能测试报告（附测试数据和截图）'
    ],
    scheduleInfo: {
      totalDuration: '预计 45-60 个工作日',
      settlementMode: '按里程碑分期结算（3期）：\n\n1. **第一期（30%）**：需求确认并完成原型设计后\n2. **第二期（40%）**：核心功能开发完成并通过测试\n3. **第三期（30%）**：系统上线并验收合格后',
      priceRange: '¥50,000 - ¥80,000（可协商）'
    },
    contractorReq: {
      skills: ['精通 **React 18** + TypeScript 前端开发', '熟悉 **Node.js** 后端开发，有 Express/Koa 项目经验', '熟练使用 **GPT API / OpenAI SDK** 进行对话系统开发', '掌握 **MongoDB / PostgreSQL** 数据库设计与优化'],
      experience: ['3年以上全栈开发经验', '至少完成过 **1个** AI相关商业项目', '有高并发系统设计经验（QPS > 1000）'],
      qualification: ['企业或团队需提供营业执照/资质证明', '个人开发者需完成平台**实名认证**', '需签署**保密协议**（NDA）']
    },
    additionalInfo: {
      remarks: ['本项目为公司内部使用的生产力工具，上线后需提供 **3个月** 运维支持', '欢迎提出创新性技术方案，优秀方案可获额外加分', '外地团队可远程协作，但关键节点需驻场沟通（差旅报销）'],
      references: [{ title: 'OpenAI 官方文档', url: 'https://platform.openai.com/docs' }, { title: 'CSDN 代码规范指南', url: 'https://spec.csdn.net' }]
    }
  },
  { id: 2, title: '企业官网UI设计', taskType: '平面设计', budgetMin: 8000, budgetMax: 15000, bidCount: 23, publishTime: '1天前', publishTimestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), description: '为科技公司设计现代化官网UI，需要包含首页、产品页、关于我们等页面', creditScore: 88, deliveryRate: '95%', deliveryMode: 'online', aiTags: ['Figma', 'UI/UX', '组件设计'], status: 'new' },
  { id: 3, title: '产品宣传视频制作', taskType: '视频创作', budgetMin: 12000, budgetMax: 20000, bidCount: 8, publishTime: '3天前', publishTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), description: '制作3分钟产品宣传视频，需要包含脚本、拍摄、后期制作', creditScore: 85, deliveryRate: '92%', deliveryMode: 'hybrid', aiTags: ['剪辑', '调色', '特效'], status: 'in_delivery' },
  { id: 4, title: '智能手环硬件开发', taskType: '硬件订单', budgetMin: 100000, budgetMax: 150000, bidCount: 5, publishTime: '5天前', publishTimestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), description: '开发一款运动智能手环，包含心率监测、步数统计等功能', creditScore: 95, deliveryRate: '99%', deliveryMode: 'offline', aiTags: ['嵌入式', '传感器', 'PCB'], status: 'pending_review' },
  { id: 5, title: '技术博客文章撰写', taskType: '文本创作', budgetMin: 500, budgetMax: 1000, bidCount: 31, publishTime: '6小时前', publishTimestamp: Date.now() - 6 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), description: '撰写10篇关于前端技术的深度文章，每篇2000字以上', creditScore: 78, deliveryRate: '88%', deliveryMode: 'online', aiTags: ['Markdown', 'SEO'] },
  { id: 6, title: '移动APP性能评测', taskType: '产品评测', budgetMin: 3000, budgetMax: 5000, bidCount: 15, publishTime: '4天前', publishTimestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), description: '对我们的移动APP进行全面性能评测，包括启动速度、内存占用等指标', creditScore: 90, deliveryRate: '96%', deliveryMode: 'online', aiTags: ['性能测试', '自动化', '报告'] },
  { id: 7, title: '社交媒体营销推广方案', taskType: '营销推广', budgetMin: 10000, budgetMax: 20000, bidCount: 19, publishTime: '1天前', publishTimestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), description: '制定并执行为期3个月的社交媒体营销方案，提升品牌知名度', creditScore: 83, deliveryRate: '90%', deliveryMode: 'hybrid', aiTags: ['社交媒体', '数据分析', '投放'] },
  { id: 8, title: '电商平台后端开发', taskType: '软件开发', budgetMin: 80000, budgetMax: 120000, bidCount: 7, publishTime: '2天前', publishTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), description: '开发电商平台后端系统，包括商品管理、订单处理、支付对接等功能', creditScore: 87, deliveryRate: '94%', deliveryMode: 'offline', aiTags: ['Node.js', 'MySQL', 'Redis'], status: 'accepted' },
  { id: 9, title: '品牌LOGO设计', taskType: '平面设计', budgetMin: 5000, budgetMax: 10000, bidCount: 42, publishTime: '12小时前', publishTimestamp: Date.now() - 12 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), description: '为新创公司设计品牌LOGO，需要提供多个方案供选择', creditScore: 76, deliveryRate: '85%', deliveryMode: 'online', aiTags: ['品牌设计', '矢量图', 'Vi规范'] },
  { id: 10, title: '产品开箱视频拍摄', taskType: '视频创作', budgetMin: 2000, budgetMax: 4000, bidCount: 28, publishTime: '3天前', publishTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), description: '拍摄5款产品的开箱评测视频，每个视频5-8分钟', creditScore: 91, deliveryRate: '97%', deliveryMode: 'offline', aiTags: ['拍摄', '脚本', '剪辑'] },
  { id: 11, title: '微信小程序开发', taskType: '软件开发', budgetMin: 15000, budgetMax: 25000, bidCount: 16, publishTime: '6天前', publishTimestamp: Date.now() - 6 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), description: '开发一个商城类微信小程序，包含商品展示、购物车、支付等功能', creditScore: 82, deliveryRate: '89%', deliveryMode: 'online', aiTags: ['小程序', 'Vue.js', '云开发'] },
  { id: 12, title: '用户手册撰写', taskType: '文本创作', budgetMin: 3000, budgetMax: 6000, bidCount: 11, publishTime: '5天前', publishTimestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), description: '为软件产品撰写详细的用户手册，包含操作指南、常见问题等', creditScore: 80, deliveryRate: '87%', deliveryMode: 'online', aiTags: ['文档', 'Markdown', '翻译'] },
  { id: 13, title: '智能音箱硬件测试', taskType: '硬件订单', budgetMin: 8000, budgetMax: 12000, bidCount: 4, publishTime: '7天前', publishTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), description: '对智能音箱进行全面硬件测试，包括音质、唤醒率、续航等', creditScore: 94, deliveryRate: '98%', deliveryMode: 'offline', aiTags: ['声学测试', '功耗', '可靠性'] },
  { id: 14, title: 'SEO优化服务', taskType: '营销推广', budgetMin: 6000, budgetMax: 10000, bidCount: 22, publishTime: '2天前', publishTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), description: '为企业官网提供SEO优化服务，提升搜索引擎排名', creditScore: 79, deliveryRate: '86%', deliveryMode: 'online', aiTags: ['SEO', '关键词', '外链'] },
  { id: 15, title: '数据库性能评测报告', taskType: '产品评测', budgetMin: 4000, budgetMax: 7000, bidCount: 9, publishTime: '4天前', publishTimestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), description: '对新开发的数据库系统进行性能评测，出具专业评测报告', creditScore: 86, deliveryRate: '93%', deliveryMode: 'online', aiTags: ['数据库', '基准测试', '报告'] },
  { id: 16, title: '海报设计', taskType: '平面设计', budgetMin: 1500, budgetMax: 3000, bidCount: 35, publishTime: '18小时前', publishTimestamp: Date.now() - 18 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), description: '设计10张活动宣传海报，格现代简约', creditScore: 75, deliveryRate: '84%', deliveryMode: 'online', aiTags: ['平面', '板式', '印刷'] },
  { id: 17, title: 'Python爬虫开发', taskType: '软件开发', budgetMin: 8000, budgetMax: 15000, bidCount: 20, publishTime: '3天前', publishTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), description: '开发数据采集爬虫，需处理反爬和数据清洗', creditScore: 89, deliveryRate: '95%', deliveryMode: 'online', aiTags: ['Python', 'Scrapy', '数据分析'] },
  { id: 18, title: '教学视频录制', taskType: '视频创作', budgetMin: 5000, budgetMax: 8000, bidCount: 13, publishTime: '5天前', publishTimestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), description: '录制20节编程教学视频，每节15-20分钟', creditScore: 84, deliveryRate: '91%', deliveryMode: 'offline', aiTags: ['录屏', '课程设计', '动画'] },
  { id: 19, title: '行业研究报告撰写', taskType: '文本创作', budgetMin: 10000, budgetMax: 15000, bidCount: 6, publishTime: '6天前', publishTimestamp: Date.now() - 6 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), description: '撰写AI行业深度研究报告，3万字以上', creditScore: 93, deliveryRate: '97%', deliveryMode: 'online', aiTags: ['研究', '数据', '写作'] },
  { id: 20, title: '线上活动策划执行', taskType: '营销推广', budgetMin: 15000, budgetMax: 25000, bidCount: 14, publishTime: '1天前', publishTimestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, bidDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), description: '策划并执行一场线上发布会活动，预计参与人数1000+', creditScore: 77, deliveryRate: '83%', deliveryMode: 'hybrid', aiTags: ['活动策划', '直播', '社群'] },
  { id: 21, title: 'IoT设备原型开发', taskType: '硬件订单', budgetMin: 50000, budgetMax: 80000, bidCount: 0, publishTime: '10小时前', publishTimestamp: Date.now() - 10 * 60 * 60 * 1000, description: '开发智能家居IoT设备原型，包含硬件设计和固件开发', creditScore: 96, deliveryRate: '99%', deliveryMode: 'hybrid', aiTags: ['IoT', '固件', 'WiFi'] },
  { id: 22, title: '攻视制', taskType: '创作', budgetMin: 3000, budgetMax: 6000, bidCount: 0, publishTime: '8小时前', publishTimestamp: Date.now() - 8 * 60 * 60 * 1000, description: '制作5个游戏攻略教程视频，每个10-15分钟', creditScore: 72, deliveryRate: '80%', deliveryMode: 'online', aiTags: ['游戏', '录屏', '解说'] },
  // Push orders
  { id: 101, title: '电商小程序开发', taskType: '软件开发', budgetMin: 50000, budgetMax: 80000, bidCount: 2, publishTime: '4小时前', publishTimestamp: Date.now() - 4 * 60 * 60 * 1000, description: 'React技术栈，含商品展示、购物车、支付对接', creditScore: 91, pushInfo: { pushType: 'customer', pushExpireAt: Date.now() + 2 * 24 * 60 * 60 * 1000, matchTags: ['React', 'TypeScript'] }, deliveryMode: 'online', aiTags: ['React', 'TypeScript', '支付'] },
  { id: 102, title: '企业官网改版', taskType: '平面设计', budgetMin: 8000, budgetMax: 15000, bidCount: 5, publishTime: '6小时前', publishTimestamp: Date.now() - 6 * 60 * 60 * 1000, description: '现代化UI设计，包含首页、产品页等页面', creditScore: 88, pushInfo: { pushType: 'skill_match', pushExpireAt: Date.now() + 1 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000, matchTags: ['React', 'UI设计', 'TypeScript', 'Figma'], tagMatchCount: 4 }, deliveryMode: 'online', aiTags: ['Figma', '组件库', '响应式'] },
  { id: 103, title: 'API网关性能优化', taskType: '软件开发', budgetMin: 30000, budgetMax: 50000, bidCount: 1, publishTime: '2小时前', publishTimestamp: Date.now() - 2 * 60 * 60 * 1000, description: '优化现有API网关架构，提升并发处理能力', creditScore: 94, pushInfo: { pushType: 'customer', pushExpireAt: Date.now() + 3 * 24 * 60 * 60 * 1000, matchTags: ['Node.js', 'Kafka', '微服务'] }, deliveryMode: 'offline', aiTags: ['Node.js', 'Kafka', '微服务'] },
  { id: 104, title: '移动端监控面板', taskType: '软件开发', budgetMin: 40000, budgetMax: 60000, bidCount: 0, publishTime: '4天前', publishTimestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, description: '实时数据监控仪表盘，Flutter开发', creditScore: 81, pushInfo: { pushType: 'customer', pushExpireAt: Date.now() - 1 * 24 * 60 * 60 * 1000, matchTags: ['Flutter', 'Dart'] }, deliveryMode: 'online', aiTags: ['Flutter', 'Dart', 'WebSocket'] },
];

// Task type config — v4.0: using design system type color tokens
const taskTypeConfig: Record<string, { textColor: string; bgColor: string; borderColor: string }> = {
  '软件开发': { textColor: 'var(--type-software)', bgColor: 'var(--type-software-bg)', borderColor: 'var(--type-software)' },
  '平面设计': { textColor: 'var(--type-design)', bgColor: 'var(--type-design-bg)', borderColor: 'var(--type-design)' },
  '视频创作': { textColor: 'var(--type-video)', bgColor: 'var(--type-video-bg)', borderColor: 'var(--type-video)' },
  '文本创作': { textColor: 'var(--type-writing)', bgColor: 'var(--type-writing-bg)', borderColor: 'var(--type-writing)' },
  '产品评测': { textColor: 'var(--type-review)', bgColor: 'var(--type-review-bg)', borderColor: 'var(--type-review)' },
  '营销推广': { textColor: 'var(--type-marketing)', bgColor: 'var(--type-marketing-bg)', borderColor: 'var(--type-marketing)' },
  '硬件订单': { textColor: 'var(--type-hardware)', bgColor: 'var(--type-hardware-bg)', borderColor: 'var(--type-hardware)' },
};

// 订单状态配置（P2-04）
const orderStatusConfig: Record<string, { label: string; textVar: string; bgVar: string }> = {
  'new':              { label: '新建',       textVar: 'var(--info)', bgVar: 'var(--info-bg)' },
  'pending_review':   { label: '待审核',     textVar: 'var(--warning)', bgVar: 'var(--warning-bg)' },
  'promoting':        { label: '推广中',     textVar: 'var(--info)', bgVar: 'var(--info-bg)' },
  'agreement_pending':{ label: '协议签署中', textVar: 'var(--warning)', bgVar: 'var(--warning-bg)' },
  'in_delivery':      { label: '交付中',     textVar: 'var(--info)', bgVar: 'var(--info-bg)' },
  'accepted':         { label: '已验收',     textVar: 'var(--success)', bgVar: 'var(--success-bg)' },
  'pending_settlement':{ label:'待结算',     textVar: 'var(--brand)', bgVar: 'var(--brand-subtle)' },
  'settled':          { label: '已结算',     textVar: 'var(--success)', bgVar: 'var(--success-bg)' },
  'cancelled':        { label: '已取消',     textVar: 'var(--danger)', bgVar: 'var(--danger-bg)' },
  'terminated':       { label: '已终止',     textVar: 'var(--danger)', bgVar: 'var(--danger-bg)' },
  'closed':           { label: '已关闭',     textVar: 'var(--text-disabled)', bgVar: 'var(--bg-subtle)' },
};

// Delivery mode config
const deliveryModeConfig: Record<string, { label: string; textVar: string; bgVar: string }> = {
  'online': { label: '线上', textVar: 'var(--success)', bgVar: 'var(--success-bg)' },
  'offline': { label: '线下', textVar: 'var(--info)', bgVar: 'var(--info-bg)' },
  'hybrid': { label: '混合', textVar: 'var(--type-design)', bgVar: 'var(--type-design-bg)' },
};


// ===== Role Selection Modal — v4.0 =====
function RoleSelectionModal({ onSelect }: { onSelect: (role: 'customer' | 'user' | 'browse-only') => void }) {
  const roles = [
    { role: 'customer' as const, title: '客户（发单方）', desc: '发布订单，寻找合适的承接方完成任务', icon: Building2, hoverBorder: '#f97316', iconColor: '#f97316' },
    { role: 'user' as const, title: '用户（接单方）', desc: '承接订单，通过完成任务获得收益', icon: Code2, hoverBorder: 'var(--brand)', iconColor: 'var(--brand)' },
    { role: 'browse-only' as const, title: '仅浏览', desc: '查看订单信息，暂不发布或承接订单', icon: Eye, hoverBorder: '#6B7280', iconColor: '#6B7280' },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(13,17,23,0.25)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-modal)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          </div>
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>欢迎加入 OPC Order</h2>
        </div>
        <p className="text-[13px] mb-5 ml-11" style={{ color: 'var(--text-tertiary)' }}>
          请选择您的身份，解锁对应功能
        </p>

        <div className="space-y-2">
          {roles.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.role}
                onClick={() => onSelect(item.role)}
                className="w-full p-3.5 border rounded-md transition-all text-left group transition-colors duration-150 hover:border-[var(--border-default)]"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', transition: 'all var(--transition-fast)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: item.iconColor + '15' }}>
                    <Icon className="w-4 h-4" style={{ color: item.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--text-tertiary)', transition: 'transform var(--transition-fast)' }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== Credit tier helper — module-level, used by both OrderCard and push orders =====
function getCreditTier(score: number) {
  if (score >= 90) return { label: '精英', color: 'var(--credit-elite)', bg: 'var(--credit-elite-bg)' };
  if (score >= 80) return { label: '优秀', color: 'var(--credit-excellent)', bg: 'var(--credit-excellent-bg)' };
  if (score >= 70) return { label: '一般', color: 'var(--credit-fair)', bg: 'var(--credit-fair-bg)' };
  if (score >= 60) return { label: '较差', color: 'var(--credit-poor)', bg: 'var(--credit-poor-bg)' };
  return { label: '差', color: 'var(--credit-bad)', bg: 'var(--credit-bad-bg)' };
}

// Credit dimensions helper — ZH §6.7b.7: customer credit score 5 dimensions
// Credit dimensions helper — ZH §6.7b.2: user credit score 5 dimensions
function deriveCreditDimensions(creditScore: number): CreditDimensions {
  const s = creditScore / 100;
  const jitter = (base: number, range: number) => Math.min(100, Math.max(0, Math.round(base * 100 + (Math.random() - 0.5) * range))) + '%';
  const responseSpeed = creditScore >= 85 ? '快' : creditScore >= 60 ? '中等' : '慢';
  return {
    onTimeDeliveryRate: jitter(s, 10),
    oneTimePassRate: jitter(s * 0.95, 12),
    repurchaseRate: jitter(s * 0.85, 20),
    overdueRate: jitter((1 - s) * 0.5, 6),
    responseSpeed,
  };
}

// ===== Credit Tooltip — ZH §6.7b.2: 5-dimension detail with tree structure =====
function CreditTooltip({ creditScore, tierLabel, dimensions }: { creditScore: number; tierLabel: string; dimensions: CreditDimensions }) {
  const items: { label: string; value: string; isText?: boolean }[] = [
    { label: '按时交付率', value: dimensions.onTimeDeliveryRate },
    { label: '一次通过率', value: dimensions.oneTimePassRate },
    { label: '复购率', value: dimensions.repurchaseRate },
    { label: '超期率', value: dimensions.overdueRate },
    { label: '响应速度', value: dimensions.responseSpeed, isText: true },
  ];

  return (
    <div className="absolute top-full left-0 mt-2 z-50 w-48 rounded-md p-3 pointer-events-none"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-dropdown)' }}>
      <div className="text-[12px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        信用评分：{creditScore}
        <span className="ml-1 text-[10px] inline-flex items-center px-1 py-0.5 rounded-sm font-semibold leading-none"
          style={{ color: getCreditTier(creditScore).color, backgroundColor: getCreditTier(creditScore).bg }}>
          {tierLabel}
        </span>
      </div>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const prefix = isLast ? '└' : '├';
        return (
          <div key={item.label} className="flex items-center gap-1 text-[11px] mb-0.5" style={{ color: 'var(--text-secondary)' }}>
            <span className="shrink-0" style={{ color: 'var(--text-disabled)', fontFamily: 'monospace' }}>{prefix}</span>
            <span>{item.label}：</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
          </div>
        );
      })}
      <div className="mt-2 pt-2 text-[9px] leading-relaxed" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-disabled)' }}>
        数据来源：系统日志自动计算，每周更新
      </div>
    </div>
  );
}

// ===== Order Card — v4.0: Precision Trust 核心组件 =====
function OrderCard({ order, onView, userRole }: { order: Order; onView: () => void; userRole: UserRole }) {
  const typeConfig = taskTypeConfig[order.taskType] || { textColor: 'var(--text-secondary)', bgColor: 'var(--bg-hover)', borderColor: 'var(--text-tertiary)' };
  const isNew = Date.now() - order.publishTimestamp < 24 * 60 * 60 * 1000;
  const isHot = order.bidCount >= 20;
  const [showCreditTooltip, setShowCreditTooltip] = useState(false);

  const formatBudget = (value: number) => {
    return value >= 10000 ? '¥' + (value / 10000).toFixed(value % 10000 === 0 ? 0 : 1) + '万' : '¥' + value.toLocaleString();
  };

  // Bid deadline countdown
  const deadlineInfo = useMemo(() => {
    if (!order.bidDeadline) return null;
    const now = Date.now();
    const deadline = new Date(order.bidDeadline).getTime();
    const daysRemaining = Math.ceil((deadline - now) / (24 * 60 * 60 * 1000));
    if (daysRemaining <= 0) return null;
    let color: string;
    let bold: boolean;
    if (daysRemaining < 1) { color = 'var(--danger)'; bold = true; }
    else if (daysRemaining < 3) { color = 'var(--warning)'; bold = false; }
    else { color = 'var(--text-tertiary)'; bold = false; }
    const text = daysRemaining < 1 ? '今日截止' : `剩余 ${daysRemaining} 天`;
    return { text, color, bold };
  }, [order.bidDeadline]);

  return (
    <div
      className="relative bg-white rounded-md overflow-hidden cursor-pointer group transition-all duration-150 border border-[var(--border-subtle)] shadow-[var(--shadow-card)] hover:border-[var(--brand-ring)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-px"
      style={{
        transition: 'all var(--transition-fast)',
        padding: '16px',
      }}
      onClick={onView}
    >
      {/* Left type color bar — 3px, keep from old design (accessible via title) */}
      <div className="absolute top-0 left-0 bottom-0" style={{ width: '3px', backgroundColor: typeConfig.borderColor }} title={order.taskType} />

      {/* Row 1: Type badge + Credit score */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-1 flex-wrap min-w-0">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-medium shrink-0" style={{ color: typeConfig.textColor, backgroundColor: typeConfig.bgColor }}>
            <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: typeConfig.textColor, opacity: 0.7 }} />
            {order.taskType}
          </span>
          {isNew && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-medium shrink-0" style={{ color: 'var(--success)', backgroundColor: 'var(--success-bg)' }}>
              <Sparkles className="w-2.5 h-2.5" /> 新发布
            </span>
          )}
          {isHot && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-medium shrink-0" style={{ color: 'var(--warning)', backgroundColor: 'var(--warning-bg)' }}>
              <Flame className="w-2.5 h-2.5" /> 热门
            </span>
          )}
          {/* P2-04: 订单状态标签展示 */}
          {order.status && orderStatusConfig[order.status] && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium shrink-0"
              style={{ color: orderStatusConfig[order.status].textVar, backgroundColor: orderStatusConfig[order.status].bgVar }}>
              {orderStatusConfig[order.status].label}
            </span>
          )}
        </div>

        {/* Credit score — amber gold, right-aligned, shows user credit (order publisher) */}
        {order.creditScore && userRole !== 'customer' && (
          <div className="relative flex items-center gap-1 shrink-0">
            <ShieldCheck className="w-[13px] h-[13px]" style={{ color: 'var(--trust)' }} />
            <span className="text-[12px] font-semibold" style={{ color: 'var(--trust)', fontVariantNumeric: 'tabular-nums' }}>
              {order.creditScore}
            </span>
            {order.creditScore && (
              <span className="inline-flex items-center px-1 py-0.5 rounded-sm text-[10px] font-semibold leading-none"
                style={{ color: getCreditTier(order.creditScore).color, backgroundColor: getCreditTier(order.creditScore).bg }}>
                {getCreditTier(order.creditScore).label}
              </span>
            )}
            <span
              className="relative inline-flex cursor-help"
              onMouseEnter={() => order.creditDimensions && setShowCreditTooltip(true)}
              onMouseLeave={() => setShowCreditTooltip(false)}
            >
              <Info className="w-[11px] h-[11px]" style={{ color: 'var(--text-disabled)' }} />
              {showCreditTooltip && order.creditDimensions && (
                <CreditTooltip creditScore={order.creditScore} tierLabel={getCreditTier(order.creditScore).label} dimensions={order.creditDimensions} />
              )}
            </span>
          </div>
        )}
      </div>

      {/* Title — 14px, semibold */}
      <h3 className="text-[14px] font-semibold leading-snug line-clamp-1 mb-1.5 tracking-[-0.01em] transition-colors group-hover:text-[var(--brand)]" style={{ color: 'var(--text-primary)', transition: 'color var(--transition-fast)' }}>
        {order.title}
      </h3>

      {/* Description — 12px, 2-line clamp */}
      <p className="text-[12px] line-clamp-2 mb-2.5 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
        {order.description}
      </p>

      {/* AI tags — compact row below description */}
      {order.aiTags && order.aiTags.length > 0 && (
        <div className="flex items-center gap-1 mb-2.5 flex-wrap">
          {order.aiTags.map(tag => (
            <span key={tag}
              className="inline-flex items-center px-1.5 rounded-sm text-[10px] font-medium"
              style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-hover)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="mb-2.5" style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Bottom bar: Price + Stats + CTA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[14px] font-semibold" style={{ color: 'var(--brand)', fontVariantNumeric: 'tabular-nums' }}>
            {formatBudget(order.budgetMax)}
          </span>
          {order.deliveryMode && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium shrink-0"
              style={{ color: deliveryModeConfig[order.deliveryMode].textVar, backgroundColor: deliveryModeConfig[order.deliveryMode].bgVar }}>
              {deliveryModeConfig[order.deliveryMode].label}
            </span>
          )}
          <span className="w-px h-3" style={{ backgroundColor: 'var(--border-default)' }} />
          <div className="flex items-center gap-1">
            <Users className="w-[13px] h-[13px]" style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{order.bidCount} 人</span>
          </div>
          {deadlineInfo && (
            <div className="flex items-center gap-1">
              <span className="text-[11px]" style={{ color: deadlineInfo.color, fontWeight: deadlineInfo.bold ? '700' : '400' }}>{deadlineInfo.text}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-[13px] h-[13px]" style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{order.publishTime}</span>
          </div>
        </div>
        {/* CTA — subtle arrow */}
        <div className="flex items-center gap-0.5 text-[12px] font-medium transition-all group-hover:text-[var(--brand)] shrink-0" style={{ color: 'var(--text-tertiary)', transition: 'color var(--transition-fast)' }}>
          查看 <ArrowRight className="w-[13px] h-[13px] transition-transform group-hover:translate-x-0.5" style={{ transition: 'transform var(--transition-fast)' }} />
        </div>
      </div>
    </div>
  );
}

// ===== Stats bar — v4.0: dynamic from filteredOrders =====
function StatsBar({ filteredOrders, totalOrders }: { filteredOrders: Order[]; totalOrders: Order[] }) {
  const activeOrders = filteredOrders.length;
  const totalBudget = totalOrders.reduce((sum, o) => sum + (o.budgetMin + o.budgetMax) / 2, 0);
  const formatBudgetTotal = (n: number) => {
    if (n >= 10000) return '¥' + (n / 10000).toFixed(n % 10000 === 0 ? 0 : 1) + '万';
    return '¥' + n.toLocaleString();
  };
  const stats = [
    { label: '活跃订单', value: String(activeOrders), icon: FileText, iconColor: 'var(--type-software)' },
    { label: '累计成交额', value: formatBudgetTotal(totalBudget), icon: TrendingUp, iconColor: 'var(--brand)' },
    { label: '注册用户', value: '8,500+', icon: Users, iconColor: 'var(--type-design)' },
    { label: '成功交付', value: '3,200+', icon: BadgeCheck, iconColor: 'var(--success)' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 bg-white rounded-md mb-5 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
      {stats.map(s => (
        <div key={s.label} className="flex items-center gap-3 px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: s.iconColor + '15' }}>
            <s.icon className="w-4 h-4" style={{ color: s.iconColor }} />
          </div>
          <div>
            <div className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Main OrderSquare Component =====
export function OrderSquare({
  userRole, setUserRole, onNavigateToMyOrders, isLoggedIn, requireLogin,
}: {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onNavigateToMyOrders: () => void;
  isLoggedIn?: boolean;
  requireLogin?: (action: () => void) => void;
}) {
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showQualification, setShowQualification] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'user' | null>(null);
  const [sortField, setSortField] = useState<SortField>('publishTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [pageView, setPageView] = useState<PageView>('list');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCreditId, setHoveredCreditId] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const formatCountdown = (expireAt: number): string => {
    const diff = expireAt - now;
    if (diff <= 0) return '已到期';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (d > 0) return `剩余 ${d} 天 ${h} 小时`;
    if (h > 0) return `剩余 ${h} 小时 ${m} 分钟`;
    return `剩余 ${m} 分钟`;
  };

  // Enrich mock orders with credit dimensions
  const enrichedOrders = useMemo(() =>
    mockOrders.map(o => ({
      ...o,
      creditDimensions: o.creditDimensions || (o.creditScore ? deriveCreditDimensions(o.creditScore) : undefined),
    })),
    []
  );

  // AI tag categories — dynamically extracted from mockOrders (P0-03)
  const aiTagCategories = useMemo(() => {
    const allTags = new Set<string>();
    enrichedOrders.forEach(o => o.aiTags?.forEach(t => allTags.add(t)));

    // Classification keyword maps
    const skillKeywords = ['React', 'TypeScript', 'Figma', 'Node.js', 'Python', 'Scrapy', 'Flutter', 'Dart', 'Vue.js', 'MySQL', 'Redis', 'Kafka', 'Markdown', '小程序', '嵌入式', '传感器', 'PCB', '固件', 'WiFi'];
    const industryKeywords = ['API', 'UI/UX', 'SEO', '社交媒体', '数据分析', 'IoT', '游戏', '数据库', '支付', '云开发', '微服务', 'WebSocket'];
    const featureKeywords = ['组件设计', '剪辑', '调色', '特效', '性能测试', '自动化', '报告', '品牌设计', '矢量图', 'Vi规范', '拍摄', '脚本', '投放', '声学测试', '功耗', '可靠性', '基准测试', '翻译', '关键词', '外链', '平面', '板式', '印刷', '录屏', '课程设计', '动画', '写作', '研究', '数据', '活动策划', '直播', '社群', '解说', '组件库', '响应式'];

    const skillTags = new Set<string>();
    const industryTags = new Set<string>();
    const featureTags = new Set<string>();

    allTags.forEach(t => {
      if (skillKeywords.includes(t)) skillTags.add(t);
      else if (industryKeywords.includes(t)) industryTags.add(t);
      else if (featureKeywords.includes(t)) featureTags.add(t);
      else featureTags.add(t); // fallback — uncategorized tags
    });

    return [
      { key: 'skill', label: '技能标签', color: 'var(--tag-skill)', bg: 'var(--tag-skill-bg)', tags: skillTags },
      { key: 'industry', label: '行业标签', color: 'var(--tag-industry)', bg: 'var(--tag-industry-bg)', tags: industryTags },
      { key: 'feature', label: '交付特征', color: 'var(--tag-feature)', bg: 'var(--tag-feature-bg)', tags: featureTags },
    ];
  }, [enrichedOrders]);

  const pushOrders = useMemo(() =>
    userRole === 'user' ? enrichedOrders.filter(o => o.pushInfo && o.pushInfo.pushExpireAt > now) : [],
    [userRole, now, enrichedOrders]
  );

  const normalOrders = useMemo(() =>
    enrichedOrders.filter(o => !o.pushInfo || o.pushInfo.pushExpireAt <= now),
    [now, enrichedOrders]
  );

  const [keyword, setKeyword] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState<Set<string>>(new Set());
  const [budgetRangeFilter, setBudgetRangeFilter] = useState('');
  const [hasContractorFilter, setHasContractorFilter] = useState('');
  const [newOrderDaysFilter, setNewOrderDaysFilter] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [aiTagsFilter, setAiTagsFilter] = useState<Set<string>>(new Set());
  const [deliveryModeFilter, setDeliveryModeFilter] = useState('');

  useEffect(() => { if (userRole === 'first-visit') setShowRoleSelection(true); }, [userRole]);

  const handleRoleSelect = (role: 'customer' | 'user' | 'browse-only') => {
    if (role === 'browse-only') { setUserRole(role); setShowRoleSelection(false); }
    else { setSelectedRole(role); setShowRoleSelection(false); setShowQualification(true); }
  };

  const handleQualificationComplete = () => { if (selectedRole) { setUserRole(selectedRole); setShowQualification(false); } };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
    setCurrentPage(1);
  };

  const clearAllFilters = () => { setKeyword(''); setTaskTypeFilter(new Set()); setBudgetRangeFilter(''); setHasContractorFilter(''); setNewOrderDaysFilter(''); setAiTagsFilter(new Set()); setDeliveryModeFilter(''); setCurrentPage(1); };

  const filteredOrders = normalOrders.filter(order => {
    if (keyword) { const kw = keyword.toLowerCase(); if (!order.title.toLowerCase().includes(kw) && !order.description.toLowerCase().includes(kw)) return false; }
    if (taskTypeFilter.size > 0 && !taskTypeFilter.has(order.taskType)) return false;
    if (budgetRangeFilter) {
      const avg = (order.budgetMin + order.budgetMax) / 2;
      if (budgetRangeFilter === '0-5000' && avg > 5000) return false;
      if (budgetRangeFilter === '5000-20000' && (avg < 5000 || avg > 20000)) return false;
      if (budgetRangeFilter === '20000-50000' && (avg < 20000 || avg > 50000)) return false;
      if (budgetRangeFilter === '50000+' && avg < 50000) return false;
    }
    if (hasContractorFilter === 'no-contractor' && order.bidCount > 0) return false;
    if (hasContractorFilter === 'has-contractor' && order.bidCount === 0) return false;
    if (newOrderDaysFilter) { const days = parseInt(newOrderDaysFilter); if (Date.now() - order.publishTimestamp > days * 24 * 60 * 60 * 1000) return false; }
    if (aiTagsFilter.size > 0) {
      if (!order.aiTags || !order.aiTags.some(tag => aiTagsFilter.has(tag))) return false;
    }
    if (deliveryModeFilter && order.deliveryMode !== deliveryModeFilter) return false;
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aVal = 0, bVal = 0;
    if (sortField === 'publishTime') { aVal = a.publishTimestamp; bVal = b.publishTimestamp; }
    else if (sortField === 'budget') { aVal = (a.budgetMin + a.budgetMax) / 2; bVal = (b.budgetMin + b.budgetMax) / 2; }
    else if (sortField === 'bidCount') { aVal = a.bidCount; bVal = b.bidCount; }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const totalPages = Math.ceil(sortedOrders.length / pageSize);
  const paginatedOrders = sortedOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFiltersCount = (taskTypeFilter.size > 0 ? 1 : 0) + [budgetRangeFilter, hasContractorFilter, newOrderDaysFilter].filter(Boolean).length + (aiTagsFilter.size > 0 ? 1 : 0) + (deliveryModeFilter ? 1 : 0);

  // Task type tree (parent-child hierarchy for the filter dropdown)
  interface TypeTreeNode { name: string; children?: string[]; }
  const typeTree: TypeTreeNode[] = [
    { name: '软件开发', children: ['Web应用', '微信小程序', '移动APP', '后端服务'] },
    { name: '平面设计', children: ['UI/UX设计', '品牌VI'] },
    { name: '视频创作', children: ['宣传片', '教学视频', '开箱评测', '动画制作'] },
    { name: '文本创作', children: ['技术文档'] },
    { name: '产品评测' },
    { name: '营销推广' },
    { name: '硬件订单', children: ['嵌入式开发', 'PCB设计', '硬件测试', '固件开发'] },
  ];

  const toggleTypeFilter = (type: string) => {
    setTaskTypeFilter(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
    setCurrentPage(1);
  };

  const selectOnlyType = (type: string) => {
    setTaskTypeFilter(new Set([type]));
    setCurrentPage(1);
  };

  // Count of all leaf types in the tree
  const allTypeNames = typeTree.flatMap(n => n.children ? [n.name, ...n.children] : [n.name]);

  if (showQualification && selectedRole) return selectedRole === 'customer' ? <CustomerQualification onComplete={handleQualificationComplete} /> : <UserQualification onComplete={handleQualificationComplete} />;
  if (pageView === 'publish') return <OrderPublishPage onBack={() => setPageView('list')} />;
  if (pageView === 'detail' && selectedOrderId !== null) {
    const foundOrder = mockOrders.find(o => o.id === selectedOrderId);
    return <OrderSquareDetail isOpen={true} onClose={() => setPageView('list')} userRole={userRole === 'first-visit' ? 'browse-only' : userRole} orderData={foundOrder || null} />;
  }

  return (
    <div className="min-h-full" style={{ backgroundColor: 'var(--bg-root)' }}>
      {showRoleSelection && <RoleSelectionModal onSelect={handleRoleSelect} />}

      {/* Hero — v4.0: dark clean, simple */}
      <div className="relative" style={{ background: 'var(--bg-hero)' }}>
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 text-[11px] font-medium rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--text-inverse-muted)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  {normalOrders.length} 个订单正在招募中
                </span>
              </div>
              <h1 className="text-[28px] font-semibold tracking-[-0.01em] mb-2" style={{ color: 'var(--text-inverse)' }}>
                发现优质技术订单
              </h1>
              <p className="text-[13px] max-w-lg leading-relaxed" style={{ color: 'var(--text-inverse-muted)' }}>
                汇聚软件开发、设计创作、营销推广等各类优质项目，精准匹配客户与服务提供方
              </p>

              {/* Search bar */}
              <div className="mt-4 flex items-center gap-2.5 max-w-xl">
                <div className="flex-1 flex items-center gap-2 rounded-md px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-inverse-muted)' }} />
                  <input type="text" placeholder="搜索订单标题、描述..." value={keyword}
                    onChange={e => { setKeyword(e.target.value); setCurrentPage(1); }}
                    className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-white/30"
                  />
                  {keyword && <button onClick={() => setKeyword('')}><X className="w-4 h-4 text-white/40 hover:text-white" /></button>}
                </div>
                <button className="px-4 py-2 text-white text-[13px] font-semibold rounded-md transition-all hover:bg-[var(--brand-hover)]"
                  style={{ backgroundColor: 'var(--brand)', transition: 'background-color var(--transition-fast)' }}>
                  搜索
                </button>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col gap-2.5 shrink-0">
              {userRole === 'customer' && (
                <button onClick={() => setPageView('publish')}
                  className="flex items-center gap-2 text-white px-5 py-2.5 rounded-md transition-all text-[13px] font-semibold hover:bg-[var(--brand-hover)]"
                  style={{ backgroundColor: 'var(--brand)', transition: 'background-color var(--transition-fast)' }}>
                  <Plus className="w-4 h-4" /> 发布订单
                </button>
              )}
              <button onClick={onNavigateToMyOrders}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md text-[13px] font-medium transition-all hover:bg-white/15"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--text-inverse)', border: '1px solid rgba(255,255,255,0.12)', transition: 'background-color var(--transition-fast)' }}>
                <FileText className="w-4 h-4" /> 我的订单
              </button>
              {(userRole === 'first-visit' || userRole === 'browse-only') && (
                <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--text-inverse-muted)' }}>
                  <Tag className="w-3.5 h-3.5" />
                  <span>当前身份：{userRole === 'first-visit' ? '首次访问' : '仅浏览'}</span>
                </div>
              )}
              {/* Role switcher */}
              <div className="flex items-center gap-0.5 rounded-md p-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}>
                {(['first-visit', 'customer', 'user', 'browse-only', 'admin'] as UserRole[]).map(role => {
                  const labels: Record<UserRole, string> = { 'first-visit': '首访', 'customer': '客户', 'user': '用户', 'browse-only': '浏览', 'admin': '运营' };
                  return (
                    <button key={role} onClick={() => setUserRole(role)}
                      className="px-3 py-1 rounded-sm text-[12px] font-medium transition-all"
                      style={userRole === role ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' } : { color: 'var(--text-inverse-muted)', transition: 'all var(--transition-fast)' }}>
                      {labels[role]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-5">
        <StatsBar filteredOrders={filteredOrders} totalOrders={normalOrders} />

        {/* Filters bar */}
        <div className="rounded-md px-4 py-3 mb-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Type filter dropdown — tree multi-select */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all border"
                style={taskTypeFilter.size > 0
                  ? { color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)', borderColor: 'var(--brand-ring)' }
                  : { color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}>
                订单类型
                {taskTypeFilter.size > 0 && (
                  <span className="px-1.5 py-0.5 text-white text-[10px] rounded-full font-semibold leading-none" style={{ backgroundColor: 'var(--brand)' }}>{taskTypeFilter.size}</span>
                )}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showTypeDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowTypeDropdown(false)} />
                  <div className="absolute top-full left-0 mt-1 z-50 w-56 bg-white rounded-md shadow-[var(--shadow-dropdown)] border border-[var(--border-subtle)] py-1.5 max-h-72 overflow-y-auto">
                    {/* All */}
                    <button
                      onClick={() => { setTaskTypeFilter(new Set()); setCurrentPage(1); setShowTypeDropdown(false); }}
                      className="w-full text-left px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-[var(--bg-hover)]"
                      style={{ color: taskTypeFilter.size === 0 ? 'var(--brand)' : 'var(--text-secondary)' }}>
                      全部类型
                    </button>
                    <div className="mx-3 my-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />
                    {typeTree.map(parent => {
                      const children = parent.children || [];
                      const isParentChecked = taskTypeFilter.has(parent.name);
                      const childCheckedCount = children.filter(c => taskTypeFilter.has(c)).length;
                      const isExpanded = expandedParents.has(parent.name);
                      const allChecked = isParentChecked && children.every(c => taskTypeFilter.has(c));
                      return (
                        <div key={parent.name}>
                          {/* Parent row */}
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] cursor-pointer transition-colors hover:bg-[var(--bg-hover)] ${allChecked ? 'font-medium' : ''}`}
                            style={{ color: allChecked ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                            onClick={(e) => { e.stopPropagation(); }}>
                            {/* Checkbox */}
                            <span
                              className="w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 cursor-pointer transition-all"
                              style={{
                                borderColor: allChecked ? 'var(--brand)' : childCheckedCount > 0 ? 'var(--brand)' : 'var(--border-default)',
                                backgroundColor: allChecked ? 'var(--brand)' : childCheckedCount > 0 ? 'var(--brand-subtle)' : 'transparent',
                              }}
                              onClick={() => {
                                const next = new Set(taskTypeFilter);
                                const nextChecked = !allChecked;
                                nextChecked ? next.add(parent.name) : next.delete(parent.name);
                                children.forEach(c => nextChecked ? next.add(c) : next.delete(c));
                                setTaskTypeFilter(next);
                                setCurrentPage(1);
                              }}>
                              {allChecked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              {!allChecked && childCheckedCount > 0 && <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: 'var(--brand)' }} />}
                            </span>
                            {/* Expand/Collapse */}
                            {children.length > 0 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedParents(prev => {
                                    const next = new Set(prev);
                                    next.has(parent.name) ? next.delete(parent.name) : next.add(parent.name);
                                    return next;
                                  });
                                }}
                                className="p-0.5 rounded transition-colors hover:bg-[var(--bg-hover)]"
                                style={{ color: 'var(--text-tertiary)' }}>
                                <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                              </button>
                            ) : (
                              <span className="w-[18px]" />
                            )}
                            {/* Label */}
                            <span
                              className="flex-1 cursor-pointer"
                              onClick={() => { selectOnlyType(parent.name); setShowTypeDropdown(false); }}>
                              {parent.name}
                            </span>
                            {childCheckedCount > 0 && !allChecked && (
                              <span className="text-[10px]" style={{ color: 'var(--brand)' }}>{childCheckedCount}/{children.length}</span>
                            )}
                          </div>
                          {/* Children */}
                          {children.length > 0 && isExpanded && children.map(child => {
                            const isChecked = taskTypeFilter.has(child);
                            return (
                              <div
                                key={child}
                                className={`flex items-center gap-1.5 pl-10 pr-3 py-1 text-[12px] cursor-pointer transition-colors hover:bg-[var(--bg-hover)] ${isChecked ? 'font-medium' : ''}`}
                                style={{ color: isChecked ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
                                onClick={() => { toggleTypeFilter(child); }}>
                                <span
                                  className="w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-all"
                                  style={{ borderColor: isChecked ? 'var(--brand)' : 'var(--border-default)', backgroundColor: isChecked ? 'var(--brand)' : 'transparent' }}
                                  onClick={(e) => { e.stopPropagation(); toggleTypeFilter(child); }}>
                                  {isChecked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </span>
                                {child}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Search in filter bar — linked to Hero search (P1-10) */}
            <div className="flex-1 min-w-[200px] max-w-sm flex items-center gap-2 rounded-md px-3 py-1.5 bg-white border" style={{ borderColor: 'var(--border-default)' }}>
              <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
              <input type="text" placeholder="搜索订单标题、描述..." value={keyword}
                onChange={e => { setKeyword(e.target.value); setCurrentPage(1); }}
                className="flex-1 bg-transparent border-none outline-none text-[12px]" style={{ color: 'var(--text-primary)' }}
              />
              {keyword && <button onClick={() => { setKeyword(''); setCurrentPage(1); }}><X className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} /></button>}
            </div>

            {/* Sort + Filter */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <div className="flex items-center gap-0 rounded-md overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
                {[{ field: 'publishTime' as SortField, label: '最新' }, { field: 'budget' as SortField, label: '预算' }, { field: 'bidCount' as SortField, label: '热度' }].map(s => (
                  <button key={s.field} onClick={() => handleSort(s.field)}
                    className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium transition-all"
                    style={sortField === s.field ? { backgroundColor: 'var(--brand)', color: '#fff' } : { color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
                    {s.label} <ArrowUpDown className="w-3 h-3" />
                  </button>
                ))}
              </div>
              <button onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all border"
                style={showFilterPanel || activeFiltersCount > 0 ? { color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)', borderColor: 'var(--brand-ring)' } : { color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}>
                <SlidersHorizontal className="w-3.5 h-3.5" /> 筛选
                {activeFiltersCount > 0 && <span className="px-1.5 py-0.5 text-white text-[10px] rounded-full font-semibold leading-none" style={{ backgroundColor: 'var(--brand)' }}>{activeFiltersCount}</span>}
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilterPanel && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><div className="flex items-center justify-between mb-1.5"><label className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>预算区间</label>{budgetRangeFilter && <button onClick={() => { setBudgetRangeFilter(''); setCurrentPage(1); }} className="hover:opacity-70" title="重置此项"><X className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} /></button>}</div>
                  <select value={budgetRangeFilter} onChange={e => { setBudgetRangeFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 rounded-md text-[13px] outline-none transition-all bg-white" style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
                    <option value="">全部预算</option>
                    <option value="0-5000">5千以下</option><option value="5000-20000">5千 - 2万</option><option value="20000-50000">2万 - 5万</option><option value="50000+">5万以上</option>
                  </select>
                </div>
                <div><div className="flex items-center justify-between mb-1.5"><label className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>报名状态</label>{hasContractorFilter && <button onClick={() => { setHasContractorFilter(''); setCurrentPage(1); }} className="hover:opacity-70" title="重置此项"><X className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} /></button>}</div>
                  <select value={hasContractorFilter} onChange={e => { setHasContractorFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 rounded-md text-[13px] outline-none transition-all bg-white" style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
                    <option value="">全部状态</option><option value="no-contractor">无人报名</option><option value="has-contractor">已有报名</option>
                  </select>
                </div>
                <div><div className="flex items-center justify-between mb-1.5"><label className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>发布时间</label>{newOrderDaysFilter && <button onClick={() => { setNewOrderDaysFilter(''); setCurrentPage(1); }} className="hover:opacity-70" title="重置此项"><X className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} /></button>}</div>
                  <select value={newOrderDaysFilter} onChange={e => { setNewOrderDaysFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 rounded-md text-[13px] outline-none transition-all bg-white" style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
                    <option value="">全部时间</option><option value="1">最近1天</option><option value="3">最近3天</option><option value="7">最近7天</option><option value="15">最近15天</option>
                  </select>
                </div>
                <div><div className="flex items-center justify-between mb-1.5"><label className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>交付模式</label>{deliveryModeFilter && <button onClick={() => { setDeliveryModeFilter(''); setCurrentPage(1); }} className="hover:opacity-70" title="重置此项"><X className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} /></button>}</div>
                  <select value={deliveryModeFilter} onChange={e => { setDeliveryModeFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 rounded-md text-[13px] outline-none transition-all bg-white" style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
                    <option value="">全部模式</option>
                    <option value="online">线上</option>
                    <option value="offline">线下</option>
                    <option value="hybrid">混合</option>
                  </select>
                </div>
                {activeFiltersCount > 0 && (
                  <div className="flex items-end">
                    <button onClick={clearAllFilters} className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-md transition-all w-full justify-center" style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-default)', transition: 'all var(--transition-fast)' }}>
                      <X className="w-4 h-4" /> 清空筛选
                    </button>
                  </div>
                )}
              </div>
              {/* AI Tags filter row */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <label className="block text-[11px] font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>AI 标签</label>
                <div className="flex flex-wrap gap-3">
                  {aiTagCategories.map(cat => {
                    const catTags = Array.from(cat.tags).sort();
                    const selectedCount = catTags.filter(t => aiTagsFilter.has(t)).length;
                    return (
                      <div key={cat.key} className="flex-1 min-w-[160px]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-[11px] font-medium" style={{ color: cat.color }}>{cat.label}</span>
                          {selectedCount > 0 && (
                            <span className="text-[10px] px-1 py-0.5 rounded-full font-medium leading-none"
                              style={{ color: cat.color, backgroundColor: cat.bg }}>{selectedCount}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {catTags.map(tag => {
                            const isSelected = aiTagsFilter.has(tag);
                            return (
                              <button key={tag} onClick={() => {
                                const next = new Set(aiTagsFilter);
                                isSelected ? next.delete(tag) : next.add(tag);
                                setAiTagsFilter(next);
                                setCurrentPage(1);
                              }}
                                className="px-1.5 py-0.5 rounded-sm text-[10px] leading-none font-medium transition-all border"
                                style={isSelected
                                  ? { color: cat.color, backgroundColor: cat.bg, borderColor: cat.color }
                                  : { color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {isLoading && <SkeletonCardGrid count={6} />}

        {/* Results info */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              共找到 <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{sortedOrders.length}</span> 个订单
              {keyword && <span>（关键词：{keyword}）</span>}
            </span>
          </div>
        )}

        {/* Push orders section — v4.0: refined styling */}
        {!isLoading && userRole === 'user' && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-[15px] h-[15px]" style={{ color: 'var(--brand)' }} />
              <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>推荐给你</span>
              <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>基于您的技能标签和客户推送</span>
            </div>
            {pushOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pushOrders.map(order => {
                  const isCustomerPush = order.pushInfo!.pushType === 'customer';
                  const countdown = formatCountdown(order.pushInfo!.pushExpireAt);
                  const isExpiringSoon = order.pushInfo!.pushExpireAt - now < 6 * 60 * 60 * 1000;
                  return (
                    <div key={order.id} className="rounded-md p-4 cursor-pointer transition-all hover:shadow-[var(--shadow-card-hover)]"
                      style={{
                        border: `2px solid ${isCustomerPush ? 'var(--brand)' : 'var(--border-subtle)'}`,
                        backgroundColor: 'var(--bg-surface)',
                        boxShadow: isCustomerPush ? 'var(--shadow-card)' : 'none',
                        transition: 'all var(--transition-fast)',
                      }}
                      onClick={() => { setSelectedOrderId(order.id); setPageView('detail'); }}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-sm"
                            style={isCustomerPush ? { color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)' } : { color: 'var(--success)', backgroundColor: 'var(--success-bg)' }}>
                            {isCustomerPush ? '客户推荐' : '技能匹配'}
                          </span>
                          <span className="text-[11px] font-medium" style={{ color: isExpiringSoon ? 'var(--danger)' : 'var(--warning)' }}>{countdown}</span>
                          {isExpiringSoon && countdown !== '已到期' && (
                            <span className="text-[10px] px-1 py-0.5 rounded-sm font-semibold" style={{ color: 'var(--danger)', backgroundColor: 'var(--danger-bg)' }}>即将到期</span>
                          )}
                        </div>
                        {order.creditScore && userRole !== 'customer' && (
                          <div
                            className="relative flex items-center gap-1 shrink-0 cursor-help"
                            onMouseEnter={() => order.creditDimensions && setHoveredCreditId(order.id)}
                            onMouseLeave={() => setHoveredCreditId(null)}
                          >
                            <ShieldCheck className="w-[13px] h-[13px]" style={{ color: 'var(--trust)' }} />
                            <span className="text-[12px] font-semibold" style={{ color: 'var(--trust)' }}>{order.creditScore}</span>
                            <span className="inline-flex items-center px-1 py-0.5 rounded-sm text-[10px] font-semibold leading-none"
                              style={{ color: getCreditTier(order.creditScore).color, backgroundColor: getCreditTier(order.creditScore).bg }}>
                              {getCreditTier(order.creditScore).label}
                            </span>
                            {hoveredCreditId === order.id && order.creditDimensions && (
                              <CreditTooltip dimensions={order.creditDimensions} />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-[14px] font-semibold mb-1 line-clamp-1" style={{ color: 'var(--text-primary)' }}>{order.title}</div>
                      <div className="text-[12px] mb-2 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>{order.description}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold" style={{ color: 'var(--brand)', fontVariantNumeric: 'tabular-nums' }}>
                          ¥{(order.budgetMax / 10000).toFixed(order.budgetMax % 10000 === 0 ? 0 : 1)}万
                        </span>
                        <div className="flex flex-wrap gap-1 ml-auto">
                          {order.pushInfo!.matchTags.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 text-[10px] font-medium rounded-sm" style={{ color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)' }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                      {!isCustomerPush && order.pushInfo!.tagMatchCount && (
                        <div className="mt-2 pt-2 flex items-center gap-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <Tag className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>标签重合 {order.pushInfo!.tagMatchCount}/{order.pushInfo!.matchTags.length}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md py-10 flex flex-col items-center justify-center text-center" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="w-12 h-12 rounded-md flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-hover)' }}>
                  <Sparkles className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 500 }}>暂无推荐订单</div>
                <div className="text-[13px] mt-1 mb-4" style={{ color: 'var(--text-disabled)' }}>去看看全部订单吧，那里有更多选择</div>
                <button
                  onClick={() => {
                    const allOrdersSection = document.querySelector('.all-orders-section');
                    allOrdersSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 text-[13px] font-medium rounded-md transition-all"
                  style={{ color: '#fff', backgroundColor: 'var(--brand)' }}>
                  查看全部订单
                </button>
              </div>
            )}
          </div>
        )}

        {/* All orders grid */}
        {!isLoading && (paginatedOrders.length === 0 ? (
          <div className="rounded-md" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <EmptySearch query={keyword} onClear={clearAllFilters} />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3 all-orders-section">
              <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>全部订单</span>
              <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>共 {filteredOrders.length} 条</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedOrders.map(order => (
                <OrderCard key={order.id} order={order} userRole={userRole}
                  onView={() => { setSelectedOrderId(order.id); setPageView('detail'); }} />
              ))}
            </div>
          </>
        ))}

        {/* Pagination */}
        {!isLoading && paginatedOrders.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium transition-all" style={currentPage === 1 ? { color: 'var(--text-disabled)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', cursor: 'not-allowed' } : { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', transition: 'all var(--transition-fast)' }}>
              <ChevronLeft className="w-4 h-4" /> 上一页
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 rounded-md text-[13px] font-medium transition-all"
                  style={page === currentPage ? { backgroundColor: 'var(--brand)', color: '#fff' } : { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                  {page}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium transition-all" style={currentPage === totalPages ? { color: 'var(--text-disabled)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', cursor: 'not-allowed' } : { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              下一页 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
