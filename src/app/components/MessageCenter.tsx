import { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Bell, Users, CheckCircle, XCircle, Clock,
  Package, FileText, Trophy, Target, BadgeCheck, AlertCircle,
  CheckCheck, ArrowRight, ClipboardCheck, RefreshCcw,
  CreditCard, Gavel, RefreshCw, Shield, Trash2,
  type LucideIcon,
} from 'lucide-react';
import { EmptyState } from './EmptyState';

const BRAND = 'var(--brand)';
const BRAND_LIGHT_BG = 'var(--brand-bg)';

type UserRole = 'first-visit' | 'customer' | 'user' | 'browse-only';
type MsgAudience = 'customer' | 'user';

type MsgType =
  | 'bid'            // 收到报名
  | 'audit_pass'     // 审核通过
  | 'audit_reject'   // 审核拒绝
  | 'milestone_todo' // 里程碑待提交（user 视角）
  | 'milestone_verify' // 里程碑待验收（customer 视角）
  | 'milestone_accept' // 里程碑验收通过（user 视角）
  | 'milestone_reject' // 里程碑验收驳回（user 视角）
  | 'milestone_deadline' // 里程碑即将到期
  | 'milestone_overdue' // 里程碑已超期
  | 'acceptance_submitted' // 提交最终验收
  | 'acceptance_approved' // 最终验收通过
  | 'acceptance_rejected' // 最终验收未通过
  | 'bill_status'    // 账单状态更新
  | 'bill_refund'    // 退款通知
  | 'agreement'      // 协议待签署
  | 'selected'       // 报名中标
  | 'rejected_bid'   // 报名未中标
  | 'assigned'       // 指定接单待确认
  | 'cert_pass'      // 资质认证通过
  | 'cert_reject'    // 资质认证拒绝
  | 'bill_generated' // 账单已生成
  | 'bill_pending'   // 账单待确认
  | 'bill_paid'      // 账单已支付
  | 'bill_booked'    // 账单已入账
  | 'bill_appeal'    // 账单申诉已处理
  | 'bill_overdue'   // 账单逾期提醒
  | 'bill_dispute'   // 账单争议通知
  | 'bill_closed'    // 账单已关闭
  | 'arbitration_completed'; // 仲裁完成

interface Message {
  id: number;
  type: MsgType;
  audience: MsgAudience;
  title: string;
  summary: string;
  timeAgo: string;
  timestamp: number;
  read: boolean;
  targetPage?: string; // 跳转目标（演示用）
  billId?: string;      // 账单编号
  amount?: string;      // 账单金额
  orderTitle?: string;  // 关联订单标题
  billStatus?: string;  // 账单状态文本
}

// ── 客户消息 Mock ─────────────────────────────────────────────────────────────
const customerMessages: Message[] = [
  {
    id: 108,
    type: 'cert_reject',
    audience: 'customer',
    title: '企业资质认证审核未通过',
    summary: '您提交的企业资质材料审核未通过。原因：营业执照图片不清晰，法定代表人身份证上的姓名与营业执照登记信息不一致，请根据审核意见修改材料后重新提交。',
    timeAgo: '1 小时前',
    timestamp: Date.now() - 60 * 60 * 1000,
    read: false,
    targetPage: 'customerQualification',
  },
  {
    id: 101,
    type: 'bid',
    audience: 'customer',
    title: '「企业管理系统开发」收到新的报名',
    summary: '张工作室 报名了您发布的「企业管理系统开发」订单，请前往查看报名信息并决定是否选标。',
    timeAgo: '30 分钟前',
    timestamp: Date.now() - 30 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 102,
    type: 'milestone_verify',
    audience: 'customer',
    title: '「AI写作工具开发」里程碑 #2 待您验收',
    summary: '接单方已提交第 2 阶段（需求分析与原型）的交付物，请在约定时间内完成验收。',
    timeAgo: '2 小时前',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 103,
    type: 'agreement',
    audience: 'customer',
    title: '「企业管理系统开发」三方协议待您签署',
    summary: '运营方已完成协议初稿，请进入订单详情页查看并完成协议确认，以推进订单进入交付阶段。',
    timeAgo: '1 小时前',
    timestamp: Date.now() - 60 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 104,
    type: 'cert_pass',
    audience: 'customer',
    title: '您的企业资质认证已审核通过',
    summary: '恭喜！您提交的企业资质材料已由运营人员审核通过，现在可以在订单广场发布订单了。',
    timeAgo: '昨天 14:32',
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    read: false,
    targetPage: 'order',
  },
  {
    id: 105,
    type: 'bid',
    audience: 'customer',
    title: '「品牌VI设计」收到 3 条新报名',
    summary: '在过去 24 小时内，您发布的「品牌VI设计」订单共收到 3 条新报名，请及时查看。',
    timeAgo: '2 天前',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    read: true,
    targetPage: 'myOrders',
  },
  {
    id: 106,
    type: 'audit_pass',
    audience: 'customer',
    title: '「品牌VI设计」订单已通过运营审核',
    summary: '您发布的「品牌VI设计」订单已通过运营审核，现已在订单广场正式上线，接单方可以看到并报名。',
    timeAgo: '3 天前',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    read: true,
    targetPage: 'order',
  },
  {
    id: 107,
    type: 'audit_reject',
    audience: 'customer',
    title: '「营销策划方案」订单被运营退回',
    summary: '您发布的「营销策划方案」订单因描述不够详细被退回，请根据运营反馈修改后重新提交审核。',
    timeAgo: '5 天前',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    read: true,
    targetPage: 'myOrders',
  },
  {
    id: 109,
    type: 'milestone_deadline',
    audience: 'customer',
    title: '「企业管理系统开发」里程碑将于明天到期',
    summary: '您发布的「企业管理系统开发」订单的里程碑 #4（系统集成与测试）将于明天到期，请及时关注交付进度。',
    timeAgo: '3 小时前',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 110,
    type: 'milestone_overdue',
    audience: 'customer',
    title: '「AI写作工具开发」里程碑已超期3天',
    summary: '「AI写作工具开发」订单的里程碑 #3 已超期3天未交付，建议与接单方沟通确认进展情况。',
    timeAgo: '1 天前',
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 111,
    type: 'acceptance_submitted',
    audience: 'customer',
    title: '「企业管理系统开发」已提交最终验收',
    summary: '接单方已提交「企业管理系统开发」订单的最终验收材料，请您在 7 个工作日内完成验收确认。',
    timeAgo: '昨天 16:20',
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 112,
    type: 'bill_status',
    audience: 'customer',
    title: '「品牌VI设计」账单状态已更新为【待支付】',
    summary: '运营方已生成「品牌VI设计」订单的账单，当前状态为【待支付】，请及时处理以确保项目顺利推进。',
    timeAgo: '4 天前',
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    read: true,
    targetPage: 'myOrders',
  },
  {
    id: 113,
    type: 'bill_refund',
    audience: 'customer',
    title: '「营销策划方案」退款申请已提交',
    summary: '您对「营销策划方案」订单的退款申请已成功提交，运营方将在 3-5 个工作日内处理，请耐心等待。',
    timeAgo: '6 天前',
    timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
    read: true,
    targetPage: 'myOrders',
  },
  // ── 账单通知 Mock ──────────────────────────────────────────────────────────
  {
    id: 301, type: 'bill_generated', audience: 'customer',
    title: '账单已生成',
    summary: '「企业管理系统开发」订单的账单已生成，账单编号 BL-2026-0001，金额 ¥40,000，请及时查看并确认。',
    timeAgo: '10 分钟前', timestamp: Date.now() - 10 * 60 * 1000, read: false,
    billId: 'BL-2026-0001', amount: '¥40,000', orderTitle: '企业管理系统开发', billStatus: '已生成',
    targetPage: 'myOrders',
  },
  {
    id: 302, type: 'bill_pending', audience: 'customer',
    title: '账单待确认',
    summary: '「品牌VI全案设计」订单的账单已下达，账单编号 BL-2026-0004，金额 ¥22,000，请尽快确认账单信息。',
    timeAgo: '1 小时前', timestamp: Date.now() - 60 * 60 * 1000, read: false,
    billId: 'BL-2026-0004', amount: '¥22,000', orderTitle: '品牌VI全案设计', billStatus: '待确认',
    targetPage: 'myOrders',
  },
  {
    id: 303, type: 'bill_paid', audience: 'customer',
    title: '账单已支付',
    summary: '您已成功支付「企业管理系统开发」的账单（BL-2026-0001），系统将自动进入后续结算流程。',
    timeAgo: '3 小时前', timestamp: Date.now() - 3 * 60 * 60 * 1000, read: false,
    billId: 'BL-2026-0001', amount: '¥40,000', orderTitle: '企业管理系统开发', billStatus: '已支付',
    targetPage: 'myOrders',
  },
  {
    id: 304, type: 'bill_booked', audience: 'customer',
    title: '账单已入账',
    summary: '运营方已完成账单 BL-2026-0007 的入账操作，金额 ¥28,000 已确认入账，可查看账单详情。',
    timeAgo: '5 小时前', timestamp: Date.now() - 5 * 60 * 60 * 1000, read: false,
    billId: 'BL-2026-0007', amount: '¥28,000', orderTitle: '数据可视化看板开发', billStatus: '已入账',
    targetPage: 'myOrders',
  },
  {
    id: 305, type: 'bill_appeal', audience: 'customer',
    title: '账单申诉已处理',
    summary: '您对账单 BL-2026-0005 的申诉已由运营方处理完毕，请在账单详情中查看处理结果。',
    timeAgo: '昨天 15:30', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, read: false,
    billId: 'BL-2026-0005', amount: '¥15,000', orderTitle: '小程序开发与部署', billStatus: '申诉已处理',
    targetPage: 'myOrders',
  },
  {
    id: 306, type: 'bill_closed', audience: 'customer',
    title: '账单已关闭',
    summary: '账单 BL-2026-0009 已被运营方关闭，关闭原因为订单已终止，如需查看详情请联系运营方。',
    timeAgo: '2 天前', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, read: true,
    billId: 'BL-2026-0009', amount: '¥12,000', orderTitle: 'SEO优化服务', billStatus: '已关闭',
    targetPage: 'myOrders',
  },
  {
    id: 114, type: 'arbitration_completed', audience: 'customer',
    title: '「企业管理系统开发」仲裁已结案',
    summary: '运营方已完成「企业管理系统开发」订单的仲裁裁决，结论为部分支持。请登录平台查看仲裁结论及后续订单/验收/账单状态。',
    timeAgo: '6 小时前', timestamp: Date.now() - 6 * 60 * 60 * 1000, read: false,
    targetPage: 'myOrders',
  },
  // ── 账单逾期 & 争议 Mock ──────────────────────────────────────────────────
  {
    id: 200, type: 'bill_overdue', audience: 'customer',
    title: '账单逾期提醒',
    summary: '订单「品牌VI设计」账单已逾期3天，请尽快处理。',
    timeAgo: '3天前', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, read: false,
    orderTitle: '品牌VI设计', billStatus: '已逾期',
    targetPage: 'myOrders',
  },
  {
    id: 201, type: 'bill_dispute', audience: 'customer',
    title: '账单争议通知',
    summary: '订单「数据分析平台」账单发生争议，运营已介入处理。',
    timeAgo: '1周前', timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, read: true,
    orderTitle: '数据分析平台', billStatus: '争议中',
    targetPage: 'myOrders',
  },
];

// ── 用户（接单方）消息 Mock ────────────────────────────────────────────────────
const userMessages: Message[] = [
  {
    id: 207,
    type: 'cert_reject',
    audience: 'user',
    title: '个人能力与资质认证审核未通过',
    summary: '您提交的能力与资质材料审核未通过。原因：能力背景介绍过于简单，仅描述了技术方向但未提供具体项目经验。请补充至少 3 个完整项目案例（含项目规模、技术栈、您的角色及成果），并提供可验证的资质证书信息后重新提交。',
    timeAgo: '2 小时前',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    read: false,
    targetPage: 'userQualification',
  },
  {
    id: 201,
    type: 'milestone_todo',
    audience: 'user',
    title: '「企业管理系统开发」里程碑 #4 待您提交',
    summary: '当前里程碑（系统集成与测试）需要您提交交付物，请尽快在「我的订单」中完成提交，避免影响结算。',
    timeAgo: '1 小时前',
    timestamp: Date.now() - 60 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 202,
    type: 'assigned',
    audience: 'user',
    title: '有一个指定订单待您确认接单',
    summary: '客户「某科技有限公司」发布的「AI智能问答系统开发」订单已指定您承接，请在 48 小时内确认是否接单。',
    timeAgo: '3 小时前',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 203,
    type: 'milestone_accept',
    audience: 'user',
    title: '「企业管理系统开发」里程碑 #3 已验收通过',
    summary: '客户已确认验收您提交的第 3 阶段（前端页面开发）交付物，对应里程碑费用将按约定时间结算。',
    timeAgo: '昨天 10:15',
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 204,
    type: 'selected',
    audience: 'user',
    title: '恭喜！您已被选为「品牌VI设计」的接单方',
    summary: '客户选择您承接「品牌VI设计」订单，请尽快进入订单详情查看合同与交付要求，并推进协议签署流程。',
    timeAgo: '2 天前',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 205,
    type: 'milestone_reject',
    audience: 'user',
    title: '「AI写作工具开发」里程碑 #1 验收被驳回',
    summary: '客户驳回了里程碑 #1 的交付物，原因：功能描述文档不够详细，缺少用例说明。请修改后重新提交。',
    timeAgo: '4 天前',
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    read: true,
    targetPage: 'myOrders',
  },
  {
    id: 206,
    type: 'rejected_bid',
    audience: 'user',
    title: '「营销策划方案」报名未中标',
    summary: '很遗憾，客户未选择您承接「营销策划方案」订单。可继续浏览订单广场寻找更合适的机会。',
    timeAgo: '6 天前',
    timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
    read: true,
    targetPage: 'order',
  },
  {
    id: 208,
    type: 'milestone_deadline',
    audience: 'user',
    title: '「企业管理系统开发」里程碑将于明天到期',
    summary: '您承接的「企业管理系统开发」订单的里程碑 #4（系统集成与测试）将于明天到期，请尽快完成交付。',
    timeAgo: '4 小时前',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 209,
    type: 'milestone_overdue',
    audience: 'user',
    title: '「AI写作工具开发」里程碑已超期3天',
    summary: '「AI写作工具开发」订单的里程碑 #2 已超期3天未提交，超期可能影响信用评分及结算，请尽快处理。',
    timeAgo: '2 天前',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 210,
    type: 'acceptance_approved',
    audience: 'user',
    title: '「企业管理系统开发」最终验收已通过',
    summary: '客户已确认通过「企业管理系统开发」订单的最终验收，恭喜您顺利完成项目！尾款将按约定时间结算。',
    timeAgo: '3 天前',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    read: false,
    targetPage: 'myOrders',
  },
  {
    id: 211,
    type: 'acceptance_rejected',
    audience: 'user',
    title: '「品牌VI设计」最终验收未通过',
    summary: '客户认为「品牌VI设计」订单的最终交付物存在部分问题未解决，请查看验收反馈并修改后重新提交。',
    timeAgo: '5 天前',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    read: true,
    targetPage: 'myOrders',
  },
  {
    id: 212,
    type: 'bill_status',
    audience: 'user',
    title: '「AI写作工具开发」账单状态已更新为【已结算】',
    summary: '运营方已完成「AI写作工具开发」订单里程碑 #1 的结算，对应费用已进入支付流程，预计 3-5 个工作日到账。',
    timeAgo: '7 天前',
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    read: true,
    targetPage: 'myOrders',
  },
  {
    id: 213, type: 'arbitration_completed', audience: 'user',
    title: '「品牌VI设计」仲裁已结案',
    summary: '运营方已完成「品牌VI设计」订单的仲裁裁决，结论为支持接单方。请登录平台查看仲裁结论及后续订单/验收/账单状态。',
    timeAgo: '8 小时前', timestamp: Date.now() - 8 * 60 * 60 * 1000, read: false,
    targetPage: 'myOrders',
  },
];

// ── 消息类型 → 图标/颜色配置 ─────────────────────────────────────────────────
const typeConfig: Record<MsgType, { icon: LucideIcon; color: string; bg: string; label: string }> = {
  bid:              { icon: Users,          color: 'var(--info)', bg: 'var(--info-bg)', label: '新报名' },
  audit_pass:       { icon: CheckCircle,    color: 'var(--success)', bg: 'var(--success-bg)', label: '审核通过' },
  audit_reject:     { icon: XCircle,        color: 'var(--danger)', bg: 'var(--danger-bg)', label: '审核退回' },
  milestone_todo:   { icon: Clock,          color: 'var(--warning)', bg: 'var(--warning-bg)', label: '里程碑待提交' },
  milestone_verify: { icon: Package,        color: 'var(--warning)', bg: 'var(--warning-bg)', label: '里程碑待验收' },
  milestone_accept: { icon: CheckCircle,    color: 'var(--success)', bg: 'var(--success-bg)', label: '里程碑验收通过' },
  milestone_reject: { icon: AlertCircle,    color: 'var(--danger)', bg: 'var(--danger-bg)', label: '里程碑验收驳回' },
  agreement:        { icon: FileText,       color: BRAND,     bg: BRAND_LIGHT_BG, label: '协议待签署' },
  selected:         { icon: Trophy,         color: 'var(--warning)', bg: 'var(--warning-bg)', label: '报名中标' },
  rejected_bid:     { icon: XCircle,        color: 'var(--text-tertiary)',    bg: 'var(--surface-hover)', label: '报名未中标' },
  assigned:         { icon: Target,         color: 'var(--brand)', bg: 'var(--brand-subtle)', label: '指定接单' },
  cert_pass:        { icon: BadgeCheck,     color: 'var(--success)', bg: 'var(--success-bg)', label: '资质认证通过' },
  cert_reject:      { icon: AlertCircle,    color: 'var(--danger)', bg: 'var(--danger-bg)', label: '资质认证拒绝' },
  milestone_deadline: { icon: Clock,         color: 'var(--danger)', bg: 'var(--warning-bg)', label: '里程碑到期提醒' },
  milestone_overdue:  { icon: AlertCircle,   color: 'var(--danger)', bg: 'var(--danger-bg)', label: '里程碑已超期' },
  acceptance_submitted: { icon: ClipboardCheck, color: BRAND, bg: BRAND_LIGHT_BG, label: '提交最终验收' },
  acceptance_approved:  { icon: CheckCircle, color: 'var(--success)', bg: 'var(--success-bg)', label: '最终验收已通过' },
  acceptance_rejected:  { icon: XCircle,    color: 'var(--danger)', bg: 'var(--danger-bg)', label: '最终验收未通过' },
  bill_status:      { icon: FileText,       color: 'var(--warning)', bg: 'var(--warning-bg)', label: '账单状态更新' },
  bill_refund:      { icon: RefreshCcw,     color: 'var(--info)', bg: 'var(--info-bg)', label: '退款通知' },
  bill_generated:   { icon: CreditCard,     color: BRAND,     bg: BRAND_LIGHT_BG, label: '账单已生成' },
  bill_pending:     { icon: CreditCard,     color: 'var(--warning)', bg: 'var(--warning-bg)', label: '账单待确认' },
  bill_paid:        { icon: CheckCircle,    color: 'var(--success)', bg: 'var(--success-bg)', label: '账单已支付' },
  bill_booked:      { icon: CheckCheck,     color: 'var(--info)', bg: 'var(--info-bg)', label: '账单已入账' },
  bill_appeal:      { icon: AlertCircle,    color: 'var(--danger)', bg: 'var(--warning-bg)', label: '申诉已处理' },
  bill_overdue:     { icon: AlertCircle,    color: 'var(--danger)',  bg: 'var(--danger-bg)',  label: '账单逾期提醒' },
  bill_dispute:     { icon: Shield,         color: 'var(--warning)', bg: 'var(--warning-bg)', label: '账单争议通知' },
  bill_closed:      { icon: XCircle,        color: 'var(--text-tertiary)', bg: 'var(--surface-hover)', label: '账单已关闭' },
  arbitration_completed: { icon: Gavel, color: 'var(--brand)', bg: 'var(--brand-subtle)', label: '仲裁完成' },
};

interface MessageCenterProps {
  userRole: UserRole;
  onBack?: () => void;
  onNavigateTo?: (page: string) => void;
  onUnreadChange?: (count: number) => void;
}

export function MessageCenter({ userRole, onBack, onNavigateTo, onUnreadChange }: MessageCenterProps) {
  const rawMessages = userRole === 'customer' ? customerMessages : userMessages;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'bill'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  // P1-04: 删除功能
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single'; id: number } | { type: 'batch'; count: number } | null>(null);
  // 视图切换
  const [messageView, setMessageView] = useState<'list' | 'grouped'>('list');

  // ── 消息视觉分层 ─────────────────────────────────────────────────────────────
  const getMessageStyle = (message: Message) => {
    const actionTypes: MsgType[] = ['selected', 'assigned', 'milestone_deadline', 'milestone_overdue'];
    const urgentTypes: MsgType[] = ['cert_reject', 'acceptance_rejected', 'milestone_reject'];
    if (actionTypes.includes(message.type)) {
      return {
        borderLeft: '3px solid var(--brand)',
        bg: 'var(--bg-subtle)',
      };
    }
    if (urgentTypes.includes(message.type)) {
      return {
        borderLeft: '3px solid var(--danger)',
        bg: 'var(--danger-bg)',
      };
    }
    return {
      borderLeft: '3px solid var(--border-subtle)',
      bg: 'var(--bg-surface)',
    };
  };

  const loadMessages = () => {
    setLoading(true);
    setError(false);
    // 模拟异步数据加载
    const timer = setTimeout(() => {
      try {
        setMessages(rawMessages.map(m => ({ ...m })));
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  };

  // 初始加载及角色切换时重新加载
  useEffect(() => {
    const cleanup = loadMessages();
    return cleanup;
  }, [userRole]);

  const billTypes: MsgType[] = ['bill_generated', 'bill_pending', 'bill_paid', 'bill_booked', 'bill_appeal', 'bill_overdue', 'bill_dispute', 'bill_closed'];
  const isBillType = (type: MsgType) => billTypes.includes(type);

  const unreadCount = messages.filter(m => !m.read).length;
  const readCount = messages.filter(m => m.read).length;

  const billCount = messages.filter(m => isBillType(m.type)).length;

  // Notify parent whenever unread count changes
  useEffect(() => {
    onUnreadChange?.(unreadCount);
  }, [unreadCount]);

  const displayed =
    filter === 'bill' ? messages.filter(m => isBillType(m.type)) :
    filter === 'unread' ? messages.filter(m => !m.read) :
    filter === 'read' ? messages.filter(m => m.read) :
    messages;

  const totalPages = Math.ceil(displayed.length / pageSize);
  const paginatedMessages = displayed.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const markRead = (id: number) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const markAllRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
  };

  // P1-04: 选择/取消选择消息
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllCurrent = () => {
    setSelectedIds(new Set(paginatedMessages.map(m => m.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // P1-04: 打开删除确认
  const openDeleteSingle = (id: number) => {
    setDeleteTarget({ type: 'single', id });
    setShowDeleteConfirm(true);
  };

  const openDeleteBatch = () => {
    setDeleteTarget({ type: 'batch', count: selectedIds.size });
    setShowDeleteConfirm(true);
  };

  // P1-04: 确认删除
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'single') {
      setMessages(prev => prev.filter(m => m.id !== deleteTarget.id));
      setSelectedIds(prev => { const next = new Set(prev); next.delete(deleteTarget.id); return next; });
    } else {
      setMessages(prev => prev.filter(m => !selectedIds.has(m.id)));
      setSelectedIds(new Set());
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const handleClick = (msg: Message) => {
    markRead(msg.id);
    if (msg.targetPage && onNavigateTo) {
      onNavigateTo(msg.targetPage);
    }
  };

  return (
    <div className="min-h-full bg-[var(--bg-root)] flex flex-col">

      {/* ── Hero banner — upgrade to aurora style ─────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #100B09 0%, #1A100D 55%, #27130D 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(255,106,61,0.42) 0%, transparent 70%)' }} />
          <div className="absolute -top-8 -left-16 w-60 h-60 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(255,139,92,0.34) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-12 right-1/3 w-48 h-48 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(255,184,140,0.18) 0%, transparent 70%)' }} />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-[var(--bg-root)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-8">
          {/* Back link */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-white/50 hover:text-white/90 text-sm mb-4 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              返回订单广场
            </button>
          )}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(255,106,61,0.25)' }}>
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-white mb-0.5">消息中心</h1>
                <p className="text-sm text-white/45">
                  {unreadCount > 0 ? `${unreadCount} 条未读消息` : '暂无未读消息'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 bg-white/10  border border-white/20 text-white text-sm px-5 py-2.5 rounded-md hover:bg-white/20 transition-all"
              >
                <CheckCheck className="w-4 h-4" />
                全部已读
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[var(--border-subtle)] sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-6">
            {[
              { key: 'all' as const, label: '全部消息', count: messages.length },
              { key: 'bill' as const, label: '账单通知', count: billCount },
              { key: 'unread' as const, label: '未读', count: unreadCount },
              { key: 'read' as const, label: '已读', count: readCount },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setFilter(tab.key); setCurrentPage(1); }}
                className={`relative py-4 flex items-center gap-2 text-sm transition-colors ${
                  filter === tab.key ? 'text-[var(--brand)]' : 'text-[#666] hover:text-[#333]'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs leading-none"
                    style={filter === tab.key
                      ? { backgroundColor: BRAND, color: '#fff' }
                      : { backgroundColor: 'var(--border-subtle)', color: 'var(--text-tertiary)' }}
                  >
                    {tab.count}
                  </span>
                )}
                {filter === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: BRAND }} />
                )}
              </button>
            ))}
            {/* 视图切换 */}
            <div className="flex items-center gap-1 p-0.5 rounded-md ml-auto" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <button
                onClick={() => setMessageView('list')}
                className="px-3 py-1.5 text-[12px] rounded transition-colors"
                style={{
                  backgroundColor: messageView === 'list' ? 'var(--bg-surface)' : 'transparent',
                  color: messageView === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: messageView === 'list' ? 'var(--shadow-card)' : 'none',
                }}
              >
                列表
              </button>
              <button
                onClick={() => setMessageView('grouped')}
                className="px-3 py-1.5 text-[12px] rounded transition-colors"
                style={{
                  backgroundColor: messageView === 'grouped' ? 'var(--bg-surface)' : 'transparent',
                  color: messageView === 'grouped' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: messageView === 'grouped' ? 'var(--shadow-card)' : 'none',
                }}
              >
                按订单
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Message list ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-8 py-6 w-full">
        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-md border border-[var(--border-subtle)] py-24 flex flex-col items-center justify-center text-center">
            <div
              className="w-10 h-10 border-4 rounded-full animate-spin mb-4"
              style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--brand)' }}
            />
            <div className="text-sm text-[var(--text-tertiary)]">正在加载消息...</div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="bg-white rounded-md border border-[var(--border-subtle)] py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--danger-bg)' }}>
              <AlertCircle className="w-8 h-8" style={{ color: 'var(--danger)' }} />
            </div>
            <div className="text-[#999] mb-1">加载失败，请稍后重试</div>
            <div className="text-sm text-[#ccc] mb-6">请检查网络连接后重试</div>
            <button
              onClick={() => loadMessages()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md text-white text-sm font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <RefreshCw className="w-4 h-4" />
              重新加载
            </button>
          </div>
        )}

        {/* Content state */}
        {!loading && !error && (
          <>
            {displayed.length === 0 ? (
              <div className="bg-white rounded-md border border-[var(--border-subtle)]">
                <EmptyState
                  title={emptyMessages[filter].title}
                  description={emptyMessages[filter].desc}
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-[var(--text-tertiary)]">
                    共 {displayed.length} 条消息，第 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, displayed.length)} 条
                  </span>
                </div>
                <div className="space-y-3">
                  {paginatedMessages.map(msg => (
                    <MessageCard
                      key={msg.id}
                      msg={msg}
                      onClick={() => handleClick(msg)}
                      onMarkRead={() => markRead(msg.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium transition-all"
                      style={currentPage === 1 ? { color: 'var(--text-disabled)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', cursor: 'not-allowed' } : { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
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
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium transition-all"
                      style={currentPage === totalPages ? { color: 'var(--text-disabled)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', cursor: 'not-allowed' } : { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                      下一页 <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Message Card ──────────────────────────────────────────────────────────────
function MessageCard({
  msg,
  onClick,
  onMarkRead,
}: {
  msg: Message;
  onClick: () => void;
  onMarkRead: () => void;
}) {
  const cfg = typeConfig[msg.type];
  const Icon = cfg.icon;
  const isCertReject = msg.type === 'cert_reject';
  const isBill = !!(msg.billId || msg.amount || msg.orderTitle);

  // 视觉分层
  const actionTypes: MsgType[] = ['selected', 'assigned', 'milestone_deadline', 'milestone_overdue'];
  const urgentTypes: MsgType[] = ['cert_reject', 'acceptance_rejected', 'milestone_reject'];
  const msgStyle = actionTypes.includes(msg.type)
    ? { borderLeft: '3px solid var(--brand)', bg: 'var(--bg-subtle)' }
    : urgentTypes.includes(msg.type)
      ? { borderLeft: '3px solid var(--danger)', bg: 'var(--danger-bg)' }
      : { borderLeft: '3px solid var(--border-subtle)', bg: 'var(--bg-surface)' };

  const isActionable = actionTypes.includes(msg.type);

  return (
    <div
      className={`group rounded-md border overflow-hidden transition-all duration-200 cursor-pointer
        ${msg.read
          ? 'border-[var(--border-subtle)] hover:border-[var(--brand)]/20 hover:shadow-sm'
          : isCertReject
            ? 'border-red-200 hover:border-red-300 hover:shadow-md shadow-sm'
            : 'border-[var(--brand)]/15 hover:border-[var(--brand)]/30 hover:shadow-md shadow-sm'
        }`}
      style={{
        borderLeft: msgStyle.borderLeft,
        backgroundColor: msgStyle.bg,
      }}
      onClick={onClick}
    >
      {/* Accent top strip */}
      {!msg.read && <div className="h-[3px]" style={{ backgroundColor: cfg.color }} />}

      <div className="px-5 py-4 flex items-start gap-4">
        {/* Type icon */}
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: cfg.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: cfg.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {!msg.read && (
                <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor: isCertReject ? 'var(--danger)' : BRAND }} />
              )}
              <span className={`text-sm leading-snug ${msg.read ? 'text-[#555]' : 'text-[#111]'}`}>
                {msg.title}
              </span>
              <span
                className="px-2 py-0.5 rounded-md text-xs shrink-0"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}
              >
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#bbb] whitespace-nowrap">{msg.timeAgo}</span>
            </div>
          </div>

          <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${msg.read ? 'text-[#aaa]' : 'text-[#777]'}`}>
            {msg.summary}
          </p>

          {/* Bill info strip */}
          {isBill && (
            <div className="mt-2.5 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#aaa]">订单</span>
                <span className="text-xs text-[#555]">{msg.orderTitle}</span>
                <span className="text-[11px] text-[#ccc]">|</span>
                <span className="text-xs text-[var(--text-tertiary)]">{msg.billId}</span>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-xs text-[var(--text-tertiary)]">金额</span>
                <span className="text-sm font-semibold" style={{ color: BRAND }}>{msg.amount}</span>
              </div>
            </div>
          )}

          {/* actionable types → 操作按钮 */}
          {(msg.type === 'selected' || msg.type === 'assigned') && !msg.read && (
            <div className="flex gap-2 mt-2">
              <button
                className="px-3 py-1.5 text-[12px] rounded"
                style={{ backgroundColor: 'var(--brand)', color: 'white' }}
                onClick={e => { e.stopPropagation(); }}
              >
                确认接单
              </button>
              <button
                className="px-3 py-1.5 text-[12px] rounded"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                onClick={e => { e.stopPropagation(); }}
              >
                拒绝
              </button>
              <button
                className="px-3 py-1.5 text-[12px]"
                style={{ color: 'var(--text-tertiary)' }}
                onClick={e => { e.stopPropagation(); onClick(); }}
              >
                查看详情
              </button>
            </div>
          )}
          {(msg.type === 'milestone_deadline' || msg.type === 'milestone_overdue' || msg.type === 'milestone_todo') && !msg.read && (
            <div className="flex gap-2 mt-2">
              <button
                className="px-3 py-1.5 text-[12px] rounded"
                style={{ backgroundColor: 'var(--brand)', color: 'white' }}
                onClick={e => { e.stopPropagation(); }}
              >
                提交交付物
              </button>
              <button
                className="px-3 py-1.5 text-[12px]"
                style={{ color: 'var(--brand)' }}
                onClick={e => { e.stopPropagation(); }}
              >
                申请延期
              </button>
            </div>
          )}

          {/* cert_reject → prominent action strip */}
          {isCertReject && !msg.read && (
            <div
              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
              style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}
            >
              <span className="text-red-600">请点击此处前往补充认证信息并重新提交</span>
              <ArrowRight className="w-3 h-3 text-red-500 ml-auto shrink-0" />
            </div>
          )}

          {!isCertReject && !isActionable && (
            <div className="flex items-center justify-between mt-2">
              <div />
              <button
                className={`flex items-center gap-1 text-xs transition-opacity ${isBill ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                style={{ color: BRAND }}
                onClick={e => { e.stopPropagation(); onClick(); }}
              >
                查看详情
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty state messages ──────────────────────────────────────────────────────
const emptyMessages: Record<string, { title: string; desc: string }> = {
  bill: { title: '暂无账单通知', desc: '账单生成、确认、支付、入账等账单相关事件会在此展示' },
  unread: { title: '暂无未读消息', desc: '所有消息均已读，您可以切换到「全部消息」查看历史' },
  read: { title: '暂无已读消息', desc: '暂无已读消息' },
  all: { title: '暂无消息', desc: '当订单状态变化时，您将收到通知' },
};