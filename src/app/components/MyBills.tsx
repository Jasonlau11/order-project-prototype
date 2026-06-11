import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, FileText, Clock, CheckCircle, XCircle, AlertCircle,
  CreditCard, RotateCcw, ChevronRight, X, Upload, Info,
  TrendingUp, DollarSign, Wallet, ReceiptText, BadgeCheck, Search, Calendar
} from 'lucide-react';
import { SkeletonTable } from './Skeleton';
import { EmptyFirstUse } from './EmptyState';

type UserRole = 'first-visit' | 'customer' | 'user' | 'browse-only';

type BillStatus =
  | 'draft'               // 草稿
  | 'pending_confirm'     // 待确认
  | 'pending_payment'     // 待支付
  | 'paid'                // 已支付
  | 'booked'              // 已入账
  | 'refund_pending'      // 待退款
  | 'refund_confirm'      // 退款待客户确认
  | 'written_off'         // 已冲销
  | 'closed';             // 已关闭

type BillType = 'whole' | 'phase' | 'final';

interface AmountChangeLog {
  time: string;
  operator: string;
  from: number;
  to: number;
  reason?: string;
}

interface Bill {
  id: string;
  orderId: string;
  orderTitle: string;
  type: BillType;
  status: BillStatus;
  amount: number | null;
  milestoneLabel?: string;
  payeeAccount?: string;
  isNoFinalPayment?: boolean;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  userName: string;
  settlementChannel: 'offline';
  paymentProofUploaded?: boolean;
  paymentReference?: string;
  refundAmount?: number;
  refundNature?: '合同退款' | '违约金' | '赔偿金';
  refundReason?: string;
  refundRequested?: boolean;
  refundDeclineReason?: string;
  hasAppeal?: boolean;
  appealReason?: string;
  amountLog: AmountChangeLog[];
}

// ── Mock data ──────────────────────────────────────────────────────────────
const mockBills: Bill[] = [
  {
    id: 'BL-2026-0001',
    orderId: 'ORD-1001',
    orderTitle: '企业管理系统开发',
    type: 'phase',
    status: 'paid',
    amount: 40000,
    milestoneLabel: '里程碑 1 - 需求分析与设计',
    payeeAccount: '招商银行 6222**** 张工作室',
    createdAt: '2026-03-10',
    updatedAt: '2026-03-20',
    customerName: '北京科技有限公司',
    userName: '张工作室',
    settlementChannel: 'offline',
    paymentProofUploaded: true,
    paymentReference: 'TXN20260318001',
    amountLog: [
      { time: '2026-03-10 10:00', operator: '张工作室（用户）', from: 0, to: 35000, reason: '初始填价' },
      { time: '2026-03-12 14:30', operator: '北京科技有限公司（客户）', from: 35000, to: 40000, reason: '双方协商调整' },
    ],
  },
  {
    id: 'BL-2026-0002',
    orderId: 'ORD-1001',
    orderTitle: '企业管理系统开发',
    type: 'phase',
    status: 'pending_payment',
    amount: 35000,
    milestoneLabel: '里程碑 2 - 前端页面开发',
    payeeAccount: '招商银行 6222**** 张工作室',
    createdAt: '2026-03-22',
    updatedAt: '2026-03-25',
    customerName: '北京科技有限公司',
    userName: '张工作室',
    settlementChannel: 'offline',
    amountLog: [
      { time: '2026-03-22 09:00', operator: '张工作室（用户）', from: 0, to: 35000, reason: '按合同阶段价格填写' },
    ],
  },
  {
    id: 'BL-2026-0003',
    orderId: 'ORD-1001',
    orderTitle: '企业管理系统开发',
    type: 'phase',
    status: 'draft',
    amount: null,
    milestoneLabel: '里程碑 3 - 后端接口开发',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    customerName: '北京科技有限公司',
    userName: '张工作室',
    settlementChannel: 'offline',
    amountLog: [],
  },
  {
    id: 'BL-2026-0004',
    orderId: 'ORD-2001',
    orderTitle: '品牌VI全案设计',
    type: 'whole',
    status: 'pending_confirm',
    amount: 22000,
    payeeAccount: '工商银行 6228**** 设计工作室',
    createdAt: '2026-03-28',
    updatedAt: '2026-04-02',
    customerName: '上海软件开发公司',
    userName: '设计工作室',
    settlementChannel: 'offline',
    amountLog: [
      { time: '2026-03-28 11:00', operator: '设计工作室（用户）', from: 0, to: 20000 },
      { time: '2026-03-30 16:20', operator: '上海软件开发公司（客户）', from: 20000, to: 22000, reason: '含 LOGO 动效追加费用' },
    ],
  },
  {
    id: 'BL-2026-0005',
    orderId: 'ORD-3001',
    orderTitle: '电商平台后端开发',
    type: 'phase',
    status: 'refund_pending',
    amount: 60000,
    payeeAccount: '建设银行 6217**** 全栈团队',
    createdAt: '2026-02-15',
    updatedAt: '2026-04-05',
    customerName: '深圳创新科技',
    userName: '全栈团队',
    settlementChannel: 'offline',
    refundAmount: 15000,
    refundNature: '合同退款',
    refundReason: '里程碑 2 部分功能未完成，协商退还阶段款项 15000 元',
    amountLog: [
      { time: '2026-02-15 10:00', operator: '全栈团队（用户）', from: 0, to: 60000 },
    ],
  },
  {
    id: 'BL-2026-0006',
    orderId: 'ORD-3001',
    orderTitle: '电商平台后端开发',
    type: 'final',
    status: 'draft',
    amount: null,
    isNoFinalPayment: false,
    createdAt: '2026-04-08',
    updatedAt: '2026-04-08',
    customerName: '深圳创新科技',
    userName: '全栈团队',
    settlementChannel: 'offline',
    amountLog: [],
  },
  {
    id: 'BL-2026-0007',
    orderId: 'ORD-4001',
    orderTitle: '产品宣传视频制作',
    type: 'whole',
    status: 'booked',
    amount: 28000,
    payeeAccount: '中国银行 6013**** 视频工作室',
    createdAt: '2026-01-20',
    updatedAt: '2026-02-28',
    customerName: '广州互联网公司',
    userName: '视频工作室',
    settlementChannel: 'offline',
    paymentProofUploaded: true,
    amountLog: [],
  },
  {
    id: 'BL-2026-0008',
    orderId: 'ORD-5001',
    orderTitle: '数据分析报告撰写',
    type: 'whole',
    status: 'refund_confirm',
    amount: 12000,
    payeeAccount: '农业银行 9559**** 分析师李四',
    createdAt: '2026-02-05',
    updatedAt: '2026-04-07',
    customerName: '成都数字科技',
    userName: '分析师李四',
    settlementChannel: 'offline',
    refundAmount: 4000,
    refundNature: '违约金',
    refundReason: '报告交付延期 7 天，按合同条款支付违约金 4000 元',
    amountLog: [],
  },
  {
    id: 'BL-2026-0009',
    orderId: 'ORD-6001',
    orderTitle: '企业官网 UI 设计',
    type: 'final',
    status: 'closed',
    amount: 0,
    isNoFinalPayment: true,
    createdAt: '2026-03-01',
    updatedAt: '2026-03-15',
    customerName: '北京科技有限公司',
    userName: '设计工作室',
    settlementChannel: 'offline',
    amountLog: [],
  },
];

// ── Status / Type config ────────────────────────────────────────────────────
const statusConfig: Record<BillStatus, { label: string; shortLabel: string; color: string; bg: string; icon: any }> = {
  draft:            { label: '草稿',         shortLabel: '草稿',    color: 'var(--text-tertiary)',  bg: 'var(--bg-hover)',        icon: FileText },
  pending_confirm:  { label: '待确认',       shortLabel: '待确认',  color: 'var(--warning)',       bg: 'var(--warning-bg)',      icon: Clock },
  pending_payment:  { label: '待支付',       shortLabel: '待支付',  color: 'var(--brand)',         bg: 'var(--brand-subtle)',    icon: CreditCard },
  paid:             { label: '已支付',       shortLabel: '已支付',  color: 'var(--success)',       bg: 'var(--success-bg)',      icon: CheckCircle },
  booked:           { label: '已入账',       shortLabel: '已入账',  color: 'var(--success)',       bg: 'var(--success-bg)',      icon: BadgeCheck },
  refund_pending:   { label: '待退款',       shortLabel: '待退款',  color: 'var(--brand)',         bg: 'var(--brand-subtle)',    icon: RotateCcw },
  refund_confirm:   { label: '退款待确认',   shortLabel: '退款确认', color: 'var(--warning)',       bg: 'var(--warning-bg)',      icon: AlertCircle },
  written_off:      { label: '已冲销',       shortLabel: '已冲销',  color: 'var(--danger)',        bg: 'var(--danger-bg)',       icon: XCircle },
  closed:           { label: '已关闭',       shortLabel: '已关闭',  color: 'var(--text-tertiary)',  bg: 'var(--bg-hover)',        icon: XCircle },
};

const typeConfig: Record<BillType, { label: string; color: string; bg: string }> = {
  whole: { label: '整单账单', color: 'var(--brand-hover)', bg: 'var(--brand-subtle)' },
  phase: { label: '阶段账单', color: 'var(--success)',    bg: 'var(--success-bg)' },
  final: { label: '尾款账单', color: 'var(--warning)',    bg: 'var(--warning-bg)' },
};

const ALL_FILTER_TABS: { key: BillStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '草稿' },
  { key: 'pending_confirm', label: '待确认' },
  { key: 'pending_payment', label: '待支付' },
  { key: 'paid', label: '已支付' },
  { key: 'booked', label: '已入账' },
  { key: 'refund_pending', label: '待退款' },
  { key: 'refund_confirm', label: '退款待确认' },
  { key: 'written_off', label: '已冲销' },
  { key: 'closed', label: '已关闭' },
];

const BRAND = 'var(--brand)';

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatAmount(v: number | null, isNoFinalPayment?: boolean) {
  if (isNoFinalPayment) return '无尾款';
  if (v === null) return '—';
  if (v === 0) return '¥0';
  return `¥${v.toLocaleString()}`;
}

function getCountdown(updatedAt: string): { remaining: number; isExpired: boolean } {
  const updated = new Date(updatedAt);
  const deadline = new Date(updated.getTime() + 48 * 60 * 60 * 1000);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) return { remaining: 0, isExpired: true };
  return { remaining: Math.ceil(diff / (60 * 60 * 1000)), isExpired: false };
}

function StatusBadge({ status }: { status: BillStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: BillType }) {
  const cfg = typeConfig[type];
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded text-xs"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

// ── Bill Detail Drawer ───────────────────────────────────────────────────────
function BillDetailDrawer({
  bill,
  role,
  onClose,
  onAction,
}: {
  bill: Bill;
  role: UserRole;
  onClose: () => void;
  onAction: (billId: string, action: string, data?: any) => void;
}) {
  const [showPayModal, setShowPayModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  const [fillAmount, setFillAmount] = useState(bill.amount?.toString() || '');
  const [fillPayeeBank, setFillPayeeBank] = useState('');
  const [fillPayeeCardNo, setFillPayeeCardNo] = useState('');
  const [fillPayeeName, setFillPayeeName] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundNature, setRefundNature] = useState<'合同退款' | '违约金' | '赔偿金'>('合同退款');
  const [refundReason, setRefundReason] = useState('');
  const [payRef, setPayRef] = useState('');
  const [showLog, setShowLog] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');

  // P2: reject refund reason input
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectDeclineReason, setRejectDeclineReason] = useState('');

  // P2: file upload refs
  const payUploadRef = useRef<HTMLInputElement>(null);
  const refundCompleteUploadRef = useRef<HTMLInputElement>(null);
  const appealUploadRef = useRef<HTMLInputElement>(null);
  const [payUploadFile, setPayUploadFile] = useState<string | null>(null);
  const [refundCompleteFile, setRefundCompleteFile] = useState<string | null>(null);
  const [appealUploadFile, setAppealUploadFile] = useState<string | null>(null);

  const cfg = statusConfig[bill.status];
  const isCustomer = role === 'customer';
  const isUser = role === 'user';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/30" onClick={onClose} />
      {/* Drawer */}
      <div className="w-full max-w-lg bg-white shadow-[var(--shadow-modal)] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] sticky top-0 bg-white z-10">
          <div>
            <div className="text-sm text-[var(--text-tertiary)]">账单详情</div>
            <div className="text-base text-[var(--text-primary)] mt-0.5">{bill.id}</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-root)] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="px-6 py-5 flex-1">
          {/* Status */}
          <div className="flex items-center gap-3 mb-5">
            <StatusBadge status={bill.status} />
            <TypeBadge type={bill.type} />
            {bill.isNoFinalPayment && (
              <span className="inline-flex px-2 py-0.5 rounded text-xs text-[var(--text-secondary)] bg-[var(--bg-root)]">无尾款</span>
            )}
          </div>

          {/* Amount */}
          <div className="bg-[var(--brand-subtle)] rounded-md p-5 mb-5">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">当前生效金额</div>
            <div className="text-3xl text-[var(--text-primary)]" style={{ color: bill.amount && bill.amount > 0 ? BRAND : 'var(--text-primary)' }}>
              {formatAmount(bill.amount, bill.isNoFinalPayment)}
            </div>
            {bill.amountLog.length > 1 && (
              <button
                onClick={() => setShowLog(!showLog)}
                className="mt-2 text-xs text-[var(--brand)] hover:underline flex items-center gap-1"
              >
                <Info className="w-3 h-3" />
                {showLog ? '收起改价记录' : `查看 ${bill.amountLog.length} 条改价记录`}
              </button>
            )}
            {showLog && (
              <div className="mt-3 space-y-2">
                {bill.amountLog.map((log, i) => (
                  <div key={i} className="text-xs flex items-start gap-2">
                    <span className="text-[var(--text-tertiary)] whitespace-nowrap">{log.time}</span>
                    <span className="text-[var(--text-secondary)]">
                      {log.operator} 将金额由{' '}
                      <span className="line-through text-[var(--text-disabled)]">¥{log.from.toLocaleString()}</span>
                      {' '}改为{' '}
                      <span className="text-[var(--text-primary)]">¥{log.to.toLocaleString()}</span>
                      {log.reason ? `（${log.reason}）` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-3 mb-5">
            <InfoRow label="关联订单" value={`${bill.orderTitle}（${bill.orderId}）`} />
            {bill.milestoneLabel && <InfoRow label="关联里程碑" value={bill.milestoneLabel} />}
            <InfoRow label="账单类型" value={typeConfig[bill.type].label} />
            <InfoRow label="结算渠道" value="线下结算（线上留痕）" />
            {bill.payeeAccount && <InfoRow label="收款账户" value={bill.payeeAccount} />}
            {isUser ? (
              <InfoRow label="付款客户" value={bill.customerName} />
            ) : (
              <InfoRow label="接单方" value={bill.userName} />
            )}
            <InfoRow label="生成时间" value={bill.createdAt} />
            <InfoRow label="最近更新" value={bill.updatedAt} />
          </div>

          {/* Refund info */}
          {(bill.status === 'refund_pending' || bill.status === 'refund_confirm') && bill.refundAmount && (
            <div className="bg-purple-50 rounded-md p-4 mb-5 border border-purple-100">
              <div className="text-xs text-purple-600 mb-2">退款申请信息</div>
              <div className="space-y-1.5 text-sm">
                <InfoRow label="退款金额" value={`¥${bill.refundAmount.toLocaleString()}`} />
                {bill.refundNature && <InfoRow label="款项性质" value={bill.refundNature} />}
                {bill.refundReason && <InfoRow label="退款说明" value={bill.refundReason} />}
              </div>
            </div>
          )}

          {/* Payment proof */}
          {bill.paymentProofUploaded && (
            <div className="bg-green-50 rounded-md p-4 mb-5 flex items-center gap-3 border border-green-100">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div>
                <div className="text-xs text-green-700">客户已上传支付凭证</div>
                {bill.paymentReference && (
                  <div className="text-xs text-green-600 mt-0.5">流水号：{bill.paymentReference}</div>
                )}
              </div>
            </div>
          )}

          {/* Draft: User fills amount */}
          {bill.status === 'draft' && isUser && !bill.isNoFinalPayment && (
            <div className="bg-[var(--warning-bg)] rounded-md p-4 mb-5 border border-[var(--warning-border)]">
              <div className="text-xs text-amber-700 mb-3">请填写账单金额与收款信息，提交后等待客户确认</div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">结算金额（元）</label>
              <input
                type="number"
                value={fillAmount}
                onChange={e => setFillAmount(e.target.value)}
                placeholder="请输入金额"
                className="w-full px-3 py-2 border border-[var(--warning-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand)] mb-3"
              />
              <label className="text-xs text-[var(--text-secondary)] block mb-1">收款银行</label>
              <input
                type="text"
                value={fillPayeeBank}
                onChange={e => setFillPayeeBank(e.target.value)}
                placeholder="如：招商银行"
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand)] mb-3"
              />
              <label className="text-xs text-[var(--text-secondary)] block mb-1">银行卡号</label>
              <input
                type="text"
                value={fillPayeeCardNo}
                onChange={e => setFillPayeeCardNo(e.target.value)}
                placeholder="请输入银行卡号"
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand)] mb-3"
              />
              <label className="text-xs text-[var(--text-secondary)] block mb-1">开户名 / 户名</label>
              <input
                type="text"
                value={fillPayeeName}
                onChange={e => setFillPayeeName(e.target.value)}
                placeholder="请输入账户户名"
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand)] mb-3"
              />
              <button
                onClick={() => {
                  onAction(bill.id, 'fill_amount', { amount: parseFloat(fillAmount), payeeBank: fillPayeeBank, payeeCardNo: fillPayeeCardNo, payeeName: fillPayeeName });
                }}
                className="w-full py-2 rounded-md text-white text-sm transition-all"
                style={{ backgroundColor: BRAND }}
                disabled={!fillAmount || isNaN(parseFloat(fillAmount))}
              >
                提交金额，等待客户确认
              </button>
              {bill.type === 'final' && (
                <button
                  onClick={() => onAction(bill.id, 'no_final_payment')}
                  className="w-full py-2 rounded-md text-[var(--text-secondary)] text-sm border border-[var(--border-default)] mt-2 hover:bg-[var(--bg-root)] transition-colors"
                >
                  声明无尾款
                </button>
              )}
            </div>
          )}

          {/* Draft: Customer waits */}
          {bill.status === 'draft' && isCustomer && (
            <div className="bg-[var(--bg-root)] rounded-md p-4 mb-5 text-sm text-[var(--text-tertiary)]">
              等待接单方填写账单金额与收款信息，填写完成后将通知您确认。
            </div>
          )}

          {/* Pending confirm: actions */}
          {bill.status === 'pending_confirm' && (
            <div className="space-y-2 mb-5">
              <div className="text-xs text-[var(--text-tertiary)] mb-2">
                {isCustomer ? '请核对金额与收款信息，确认无误后点击确认' : '等待客户确认账单信息'}
              </div>
              {isCustomer && (
                <>
                  <button
                    onClick={() => setShowConfirmModal('confirm_bill')}
                    className="w-full py-2.5 rounded-md text-white text-sm"
                    style={{ backgroundColor: BRAND }}
                  >
                    确认账单，进入待支付
                  </button>
                  <button
                    onClick={() => setShowConfirmModal('close_bill')}
                    className="w-full py-2.5 rounded-md text-sm text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-root)] transition-colors"
                  >
                    申请关闭此账单
                  </button>
                  {/* P0-02: 申诉入口 */}
                  {!bill.hasAppeal && (
                    <button
                      onClick={() => setShowAppealModal(true)}
                      className="w-full py-2.5 rounded-md text-sm text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
                    >
                      申诉
                    </button>
                  )}
                  {bill.hasAppeal && (
                    <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-md p-3">
                      <AlertCircle className="w-4 h-4" />
                      申诉处理中 — 运营将介入审核
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Pending payment: customer declares */}
          {bill.status === 'pending_payment' && isCustomer && (
            <div className="space-y-2 mb-5">
              <button
                onClick={() => setShowPayModal(true)}
                className="w-full py-2.5 rounded-md text-white text-sm"
                style={{ backgroundColor: BRAND }}
              >
                我已线下完成支付
              </button>
              <button
                onClick={() => setShowConfirmModal('close_bill')}
                className="w-full py-2.5 rounded-md text-sm text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-root)] transition-colors"
              >
                申请关闭此账单
              </button>
              {/* P0-02: 申诉入口 */}
              {!bill.hasAppeal && (
                <button
                  onClick={() => setShowAppealModal(true)}
                  className="w-full py-2.5 rounded-md text-sm text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  申诉
                </button>
              )}
              {bill.hasAppeal && (
                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-md p-3">
                  <AlertCircle className="w-4 h-4" />
                  申诉处理中 — 运营将介入审核
                </div>
              )}
            </div>
          )}

          {/* Pending payment: user waits */}
          {bill.status === 'pending_payment' && isUser && (
            <div className="bg-[var(--brand-subtle)] rounded-md p-4 mb-5 text-sm text-[var(--brand-hover)]">
              等待客户完成线下支付并声明，届时将通知您确认收款。
            </div>
          )}

          {/* Paid: user confirms receipt */}
          {bill.status === 'paid' && isUser && !bill.paymentProofUploaded && !bill.refundRequested && (
            <div className="space-y-2 mb-5">
              <div className="text-xs text-[var(--text-tertiary)]">客户已声明完成线下支付，请核对到账后确认</div>
              <button
                onClick={() => setShowConfirmModal('confirm_receipt')}
                className="w-full py-2.5 rounded-md text-white text-sm"
                style={{ backgroundColor: 'var(--success)' }}
              >
                确认收款
              </button>
            </div>
          )}

          {/* Paid: user reviews refund request (P0-01 fix) */}
          {bill.status === 'paid' && isUser && bill.refundRequested && (
            <div className="bg-purple-50 rounded-md p-4 mb-5 border border-purple-200">
              <div className="text-xs text-purple-800 mb-3">
                客户已提交退款申请，请审阅后决定同意或拒绝
              </div>
              <div className="space-y-2 mb-3 bg-white rounded-md p-3 border border-purple-100">
                <InfoRow label="退款金额" value={`¥${bill.refundAmount?.toLocaleString() ?? '—'}`} />
                {bill.refundNature && <InfoRow label="款项性质" value={bill.refundNature} />}
                {bill.refundReason && <InfoRow label="退款说明" value={bill.refundReason} />}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 py-2.5 rounded-md text-sm text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-root)] transition-colors"
                >
                  拒绝退款
                </button>
                <button
                  onClick={() => setShowConfirmModal('approve_refund')}
                  className="flex-1 py-2.5 rounded-md text-white text-sm"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  同意退款
                </button>
              </div>
            </div>
          )}

          {/* Paid: customer can refund (hide if refund already requested) */}
          {bill.status === 'paid' && isCustomer && !bill.refundRequested && (
            <div className="space-y-2 mb-5">
              <button
                onClick={() => setShowRefundModal(true)}
                className="w-full py-2.5 rounded-md text-sm text-purple-700 border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                申请退款
              </button>
              {/* P0-02: 申诉入口 */}
              {!bill.hasAppeal && (
                <button
                  onClick={() => setShowAppealModal(true)}
                  className="w-full py-2.5 rounded-md text-sm text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  申诉
                </button>
              )}
              {bill.hasAppeal && (
                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-md p-3">
                  <AlertCircle className="w-4 h-4" />
                  申诉处理中 — 运营将介入审核
                </div>
              )}
            </div>
          )}

          {/* Paid: customer sees refund request pending */}
          {bill.status === 'paid' && isCustomer && bill.refundRequested && (
            <div className="space-y-2 mb-5">
              <div className="bg-purple-50 rounded-md p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-purple-700">退款申请处理中</span>
                </div>
                <div className="text-xs text-purple-600">
                  等待接单方审阅您的退款申请。接单方同意后将进入待退款，拒绝后可见拒绝原因。
                </div>
              </div>
              {!bill.hasAppeal && (
                <button
                  onClick={() => setShowAppealModal(true)}
                  className="w-full py-2.5 rounded-md text-sm text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  申诉
                </button>
              )}
              {bill.hasAppeal && (
                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-md p-3">
                  <AlertCircle className="w-4 h-4" />
                  申诉处理中 — 运营将介入审核
                </div>
              )}
            </div>
          )}

          {/* Paid: customer sees refund declined */}
          {bill.status === 'paid' && isCustomer && bill.refundDeclineReason !== undefined && bill.refundDeclineReason !== '' && (
            <div className="space-y-2 mb-5">
              <div className="bg-red-50 rounded-md p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-red-700">退款申请已被拒绝</span>
                </div>
                <div className="text-xs text-red-600">{bill.refundDeclineReason || '接单方拒绝了本次退款申请。'}</div>
              </div>
              {!bill.hasAppeal && (
                <button
                  onClick={() => setShowAppealModal(true)}
                  className="w-full py-2.5 rounded-md text-sm text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  申诉
                </button>
              )}
              {bill.hasAppeal && (
                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-md p-3">
                  <AlertCircle className="w-4 h-4" />
                  申诉处理中 — 运营将介入审核
                </div>
              )}
            </div>
          )}

          {/* Refund pending: user completes refund */}
          {bill.status === 'refund_pending' && isUser && (
            <div className="space-y-2 mb-5">
              <div className="text-xs text-[var(--text-tertiary)]">退款申请已获批准，请完成线下退款后声明</div>
              <button
                onClick={() => setShowConfirmModal('complete_refund')}
                  className="w-full py-2.5 rounded-md text-white text-sm"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  已完成退款，上传凭证
              </button>
            </div>
          )}

          {/* Refund confirm: customer confirms */}
          {bill.status === 'refund_confirm' && isCustomer && (
            <div className="space-y-2 mb-5">
              <div className="text-xs text-[var(--text-tertiary)]">接单方已声明退款完成，请确认退款到账</div>
              <button
                onClick={() => setShowConfirmModal('confirm_refund')}
                  className="w-full py-2.5 rounded-md text-white text-sm"
                  style={{ backgroundColor: 'var(--warning)' }}
                >
                  确认退款到账，关闭账单
              </button>
            </div>
          )}
        </div>

        {/* ── Pay declaration modal ─────────────────────────────────────────── */}
        {showPayModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-md shadow-[var(--shadow-modal)] w-full max-w-sm mx-4 p-6">
              <div className="text-base text-[var(--text-primary)] mb-4">声明线下支付</div>
              <div className="text-xs text-[var(--text-tertiary)] mb-3">平台不核验到账，您声明仅作为操作留痕，接单方须确认收款</div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">流水号 / 备注（可选）</label>
              <input
                value={payRef}
                onChange={e => setPayRef(e.target.value)}
                placeholder="填写转账流水号或说明"
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand)] mb-3"
              />
              <div
                onClick={() => payUploadRef.current?.click()}
                className={`flex items-center gap-2 py-2 px-3 border border-dashed rounded-lg text-xs mb-4 cursor-pointer transition-colors ${
                  payUploadFile ? 'border-green-300 bg-green-50 text-green-600' : 'border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--brand)] hover:text-[var(--brand)]'
                }`}
              >
                <Upload className="w-4 h-4" />
                {payUploadFile ? `已选择: ${payUploadFile}` : '上传支付凭证（可选，图片/PDF）'}
              </div>
              <input
                ref={payUploadRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setPayUploadFile(file.name);
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2.5 rounded-md border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-root)] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowPayModal(false);
                    onAction(bill.id, 'declare_payment', { reference: payRef });
                  }}
                  className="flex-1 py-2.5 rounded-md text-white text-sm"
                  style={{ backgroundColor: BRAND }}
                >
                  提交声明
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Refund application modal ──────────────────────────────────────── */}
        {showRefundModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-md shadow-[var(--shadow-modal)] w-full max-w-sm mx-4 p-6">
              <div className="text-base text-[var(--text-primary)] mb-4">申请退款</div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">退款金额（元）</label>
              <input
                type="number"
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
                placeholder="支持部分退款，违约金可超账单金额"
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand)] mb-3"
              />
              <label className="text-xs text-[var(--text-secondary)] block mb-1">款项性质</label>
              <select
                value={refundNature}
                onChange={e => setRefundNature(e.target.value as any)}
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand)] mb-3 bg-white"
              >
                <option value="合同退款">合同退款</option>
                <option value="违约金">违约金</option>
                <option value="赔偿金">赔偿金</option>
              </select>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">退款说明</label>
              <textarea
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                rows={3}
                placeholder="请说明退款原因"
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand)] mb-4 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 py-2.5 rounded-md border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-root)] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    onAction(bill.id, 'request_refund', { amount: parseFloat(refundAmount), nature: refundNature, reason: refundReason });
                  }}
                  className="flex-1 py-2.5 rounded-md text-white text-sm"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  提交退款申请
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Appeal modal (P0-02) ──────────────────────────────────────────── */}
        {showAppealModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-md shadow-[var(--shadow-modal)] w-full max-w-sm mx-4 p-6">
              <div className="text-base text-[var(--text-primary)] mb-4">提交申诉</div>
              <div className="text-xs text-[var(--text-tertiary)] mb-3">
                当对端超时未操作、支付或退款存在异议时，可提交申诉。运营将介入审核处理。
              </div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">申诉原因</label>
              <textarea
                value={appealReason}
                onChange={e => setAppealReason(e.target.value)}
                rows={4}
                placeholder="请详细描述您遇到的问题和申诉原因"
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand)] mb-4 resize-none"
              />
              <div
                onClick={() => appealUploadRef.current?.click()}
                className={`flex items-center gap-2 py-2 px-3 border border-dashed rounded-lg text-xs mb-4 cursor-pointer transition-colors ${
                  appealUploadFile ? 'border-green-300 bg-green-50 text-green-600' : 'border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--brand)] hover:text-[var(--brand)]'
                }`}
              >
                <Upload className="w-4 h-4" />
                {appealUploadFile ? `已选择: ${appealUploadFile}` : '上传凭证（可选，图片/PDF）'}
              </div>
              <input
                ref={appealUploadRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setAppealUploadFile(file.name);
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAppealModal(false); setAppealReason(''); }}
                  className="flex-1 py-2.5 rounded-md border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-root)] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (!appealReason.trim()) return;
                    setShowAppealModal(false);
                    onAction(bill.id, 'file_appeal', { reason: appealReason });
                    setAppealReason('');
                  }}
                  disabled={!appealReason.trim()}
                  className="flex-1 py-2.5 rounded-md text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--warning)' }}
                >
                  提交申诉
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Generic confirm modal ─────────────────────────────────────────── */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-md shadow-[var(--shadow-modal)] w-full max-w-sm mx-4 p-6">
              {showConfirmModal === 'confirm_bill' && (
                <>
                  <div className="text-base text-[var(--text-primary)] mb-2">确认账单</div>
                  <div className="text-sm text-[var(--text-secondary)] mb-5">确认金额 {formatAmount(bill.amount)} 及收款信息无误，账单将进入待支付状态。</div>
                </>
              )}
              {showConfirmModal === 'confirm_receipt' && (
                <>
                  <div className="text-base text-[var(--text-primary)] mb-2">确认收款</div>
                  <div className="text-sm text-[var(--text-secondary)] mb-5">请确认已收到客户款项 {formatAmount(bill.amount)}。确认后账单状态将更新为「已支付」。</div>
                </>
              )}
              {showConfirmModal === 'close_bill' && (
                <>
                  <div className="text-base text-[var(--text-primary)] mb-2">申请关闭账单</div>
                  <div className="text-sm text-[var(--text-secondary)] mb-5">关闭未结账单需对方同意，双方确认后账单将标记为「已关闭」。确认发起申请吗？</div>
                </>
              )}
              {showConfirmModal === 'complete_refund' && (
                <>
                  <div className="text-base text-[var(--text-primary)] mb-2">声明退完成</div>
                  <div className="text-sm text-[var(--text-secondary)] mb-3">声明已完成线下退款，客户确认到账后账单关闭。</div>
                  <div
                    onClick={() => refundCompleteUploadRef.current?.click()}
                    className={`flex items-center gap-2 py-2 px-3 border border-dashed rounded-lg text-xs mb-4 cursor-pointer transition-colors ${
                      refundCompleteFile ? 'border-green-300 bg-green-50 text-green-600' : 'border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--brand-ring)] hover:text-[var(--brand)]'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {refundCompleteFile ? `已选择: ${refundCompleteFile}` : '上传退款凭证（可选）'}
                  </div>
                  <input
                    ref={refundCompleteUploadRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setRefundCompleteFile(file.name);
                    }}
                  />
                </>
              )}
              {showConfirmModal === 'confirm_refund' && (
                <>
                  <div className="text-base text-[var(--text-primary)] mb-2">确认退款到账</div>
                  <div className="text-sm text-[var(--text-secondary)] mb-5">确认退款 ¥{bill.refundAmount?.toLocaleString()} 已到账，账单将关闭。</div>
                </>
              )}
              {showConfirmModal === 'approve_refund' && (
                <>
                  <div className="text-base text-[var(--text-primary)] mb-2">同意退款申请</div>
                  <div className="text-sm text-[var(--text-secondary)] mb-5">
                    确认同意退款 ¥{bill.refundAmount?.toLocaleString() ?? '—'}
                    {bill.refundNature && <>（{bill.refundNature}）</>}
                    。同意后账单将进入「待退款」状态，您需完成线下退款并声明。
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmModal(null)}
                  className="flex-1 py-2.5 rounded-md border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-root)] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    onAction(bill.id, showConfirmModal);
                    setShowConfirmModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-md text-white text-sm"
                  style={{ backgroundColor: showConfirmModal === 'close_bill' ? 'var(--text-tertiary)' : showConfirmModal.includes('refund') ? 'var(--brand)' : BRAND }}
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        )}

        {/* P2: Reject refund reason modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-md shadow-[var(--shadow-modal)] w-full max-w-sm mx-4 p-6">
              <div className="text-base text-[var(--text-primary)] mb-4">拒绝退款</div>
              <div className="text-xs text-[var(--text-tertiary)] mb-3">
                请填写拒绝退款的原因，这将展示给客户查看。
              </div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">拒绝原因</label>
              <textarea
                value={rejectDeclineReason}
                onChange={e => setRejectDeclineReason(e.target.value)}
                rows={3}
                placeholder="请输入拒绝退款的原因..."
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand)] mb-4 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectDeclineReason(''); }}
                  className="flex-1 py-2.5 rounded-md border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-root)] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    const reason = rejectDeclineReason.trim() || '接单方拒绝了本次退款申请。';
                    setShowRejectModal(false);
                    setRejectDeclineReason('');
                    onAction(bill.id, 'reject_refund', { reason });
                  }}
                  className="flex-1 py-2.5 rounded-md text-white text-sm"
                  style={{ backgroundColor: 'var(--danger)' }}
                >
                  确认拒绝
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-[var(--text-tertiary)] w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-[var(--text-primary)] flex-1">{value}</span>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
interface MyBillsProps {
  userRole?: UserRole;
  onBack?: () => void;
  onNavigateToMyOrders?: () => void;
}

export function MyBills({ userRole = 'customer', onBack, onNavigateToMyOrders }: MyBillsProps) {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [activeFilter, setActiveFilter] = useState<BillStatus | 'all'>('all');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // P2: search & date range
  const [searchQuery, setSearchQuery] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const isCustomer = userRole === 'customer';
  const isUser = userRole === 'user';

  // Role-filtered bills (in real app, would filter by customerId / userId)
  const myBills = bills;

  const filteredBills = (() => {
    let result = activeFilter === 'all'
      ? myBills
      : myBills.filter(b => b.status === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(b =>
        b.id.toLowerCase().includes(q) ||
        b.orderId.toLowerCase().includes(q) ||
        b.orderTitle.toLowerCase().includes(q)
      );
    }
    if (dateStart) {
      result = result.filter(b => b.createdAt >= dateStart);
    }
    if (dateEnd) {
      result = result.filter(b => b.createdAt <= dateEnd);
    }
    return result;
  })();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));
  const paginatedBills = filteredBills.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Summary stats
  const paidBills = myBills.filter(b => b.status === 'paid' || b.status === 'booked');
  const totalReceived = paidBills.reduce((s, b) => s + (b.amount || 0), 0);
  const pendingPaymentBills = myBills.filter(b => b.status === 'pending_payment');
  const totalPending = pendingPaymentBills.reduce((s, b) => s + (b.amount || 0), 0);
  const actionNeeded = myBills.filter(b => {
    if (isCustomer) return ['pending_confirm', 'pending_payment', 'refund_confirm'].includes(b.status);
    return ['draft', 'refund_pending', 'paid'].includes(b.status);
  }).length;

  // P2: Toast queue to prevent overlapping
  const [toastQueue, setToastQueue] = useState<string[]>([]);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeToast = toastQueue.length > 0 ? toastQueue[0] : null;

  const showToast = useCallback((msg: string) => {
    setToastQueue(prev => [...prev, msg]);
  }, []);

  useEffect(() => {
    if (activeToast && !toastTimerRef.current) {
      toastTimerRef.current = setTimeout(() => {
        setToastQueue(prev => prev.slice(1));
        toastTimerRef.current = null;
      }, 2800);
    }
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [activeToast]);

  function handleAction(billId: string, action: string, data?: any) {
    setBills(prev => prev.map(b => {
      if (b.id !== billId) return b;
      switch (action) {
        case 'fill_amount':
          return {
            ...b, status: 'pending_confirm' as BillStatus, amount: data.amount,
            payeeAccount: data.payeeBank && data.payeeCardNo ? `${data.payeeBank} ${data.payeeCardNo} ${data.payeeName || ''}`.trim() : b.payeeAccount,
            amountLog: [...b.amountLog, { time: new Date().toLocaleString('zh-CN'), operator: '您（用户）', from: 0, to: data.amount, reason: '初始填价' }],
          };
        case 'no_final_payment':
          return { ...b, isNoFinalPayment: true, status: 'pending_confirm' as BillStatus, amount: 0 };
        case 'confirm_bill':
          return { ...b, status: 'pending_payment' as BillStatus };
        case 'declare_payment':
          return { ...b, status: 'paid' as BillStatus, paymentProofUploaded: !!data.reference, paymentReference: data.reference };
        case 'confirm_receipt':
          return { ...b, status: 'paid' as BillStatus, paymentProofUploaded: true };
        // P0-01 fix: refund request doesn't jump to refund_pending, it stays paid with refundRequested flag
        case 'request_refund':
          return {
            ...b,
            refundAmount: data.amount,
            refundNature: data.nature,
            refundReason: data.reason,
            refundRequested: true,
            // Status stays 'paid' — user must approve first
          };
        // P0-01 fix: user approves refund → move to refund_pending
        case 'approve_refund':
          return { ...b, status: 'refund_pending' as BillStatus, refundRequested: false };
        // P0-01 fix: user rejects refund → stay paid, clear refund request
        case 'reject_refund':
          return {
            ...b,
            refundRequested: false,
            refundDeclineReason: data.reason || '接单方拒绝了本次退款申请。',
            refundAmount: undefined,
            refundNature: undefined,
            refundReason: undefined,
          };
        case 'complete_refund':
          return { ...b, status: 'refund_confirm' as BillStatus };
        case 'confirm_refund':
          return { ...b, status: 'closed' as BillStatus };
        case 'close_bill':
          return { ...b, status: 'closed' as BillStatus };
        // P0-02: file appeal
        case 'file_appeal':
          return { ...b, hasAppeal: true, appealReason: data.reason };
        default:
          return b;
      }
    }));

    const messages: Record<string, string> = {
      fill_amount: '金额已提交，等待客户确认',
      no_final_payment: '已声明无尾款，等待客户确认',
      confirm_bill: '账单已确认，进入待支付状态',
      declare_payment: '支付声明已记录，等待对方确认收款',
      confirm_receipt: '已确认收款，账单状态已更新「已支付」',
      request_refund: '退款申请已提交，等待接单方审阅',
      approve_refund: '已同意退款申请，账单进入待退款状态',
      reject_refund: '已拒绝退款申请',
      complete_refund: '退款声明已提交，等待客户确认到账',
      confirm_refund: '已确认退款到账，账单已关闭',
      close_bill: '关闭申请已发起，等待对方确认',
      file_appeal: '申诉已提交，运营将介入处理',
    };
    showToast(messages[action] || '操作成功');

    // P2: Update drawer content instead of closing it
    setBills(currentBills => {
      setSelectedBill(prev => {
        if (!prev || prev.id !== billId) return prev;
        return currentBills.find(b => b.id === billId) ?? prev;
      });
      return currentBills;
    });
  }

  // Action pill labels for list cards
  function getActionLabel(bill: Bill): string | null {
    if (isUser) {
      if (bill.status === 'draft' && !bill.isNoFinalPayment) return '填写金额';
      if (bill.status === 'paid' && bill.refundRequested) return '审批退款';
      if (bill.status === 'paid' && !bill.paymentProofUploaded) return '确认收款';
      if (bill.status === 'refund_pending') return '完成退款';
    }
    if (isCustomer) {
      if (bill.status === 'pending_confirm') return '确认账单';
      if (bill.status === 'pending_payment') return '声明已付';
      if (bill.status === 'refund_confirm') return '确认到账';
    }
    return null;
  }

  const visibleTabs = ALL_FILTER_TABS.filter(t => t.key === 'all' || myBills.some(b => b.status === t.key));

  return (
    <div className="min-h-screen bg-[var(--bg-root)]">

      {/* ── Mini hero banner — v4.0: clean dark, no decorations ────────────── */}
      <div className="relative" style={{ background: 'var(--bg-hero)' }}>
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1.5 mb-4 text-[13px] font-medium transition-all group" style={{ color: 'var(--text-inverse-muted)', transition: 'all var(--transition-fast)' }}>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              返回
            </button>
          )}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--brand)' }}>
                  <ReceiptText className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-[28px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-inverse)' }}>我的账单</h1>
              </div>
              <p className="text-[13px]" style={{ color: 'var(--text-inverse-muted)' }}>
                {isCustomer ? '我发布的订单 · 应付账单' : '我接单的订单 · 应收账单'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {isUser ? (
            <>
              <div className="bg-white rounded-md p-5 shadow-[var(--shadow-card)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)' }}>
                    <TrendingUp className="w-4 h-4" style={{ color: BRAND }} />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">累计已收款</span>
                </div>
                <div className="text-2xl" style={{ color: BRAND }}>¥{totalReceived.toLocaleString()}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">{paidBills.length} 笔已确认收款</div>
              </div>
              <div className="bg-white rounded-md p-5 shadow-[var(--shadow-card)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[var(--warning-bg)]">
                    <Clock className="w-4 h-4 text-[var(--warning)]" />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">待我处理</span>
                </div>
                <div className="text-2xl text-[var(--warning)]">{actionNeeded}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">账单需要您操作</div>
              </div>
              <div className="bg-white rounded-md p-5 shadow-[var(--shadow-card)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[var(--bg-root)]">
                    <FileText className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">全部账单</span>
                </div>
                <div className="text-2xl text-[var(--text-primary)]">{myBills.length}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">含各状态</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-md p-5 shadow-[var(--shadow-card)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[var(--warning-bg)]">
                    <Clock className="w-4 h-4 text-[var(--warning)]" />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">待我处理</span>
                </div>
                <div className="text-2xl text-[var(--warning)]">{actionNeeded}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">账单需要您操作</div>
              </div>
              <div className="bg-white rounded-md p-5 shadow-[var(--shadow-card)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)' }}>
                    <DollarSign className="w-4 h-4" style={{ color: BRAND }} />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">待支付总额</span>
                </div>
                <div className="text-2xl" style={{ color: BRAND }}>¥{totalPending.toLocaleString()}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">{pendingPaymentBills.length} 笔待完成支付</div>
              </div>
              <div className="bg-white rounded-md p-5 shadow-[var(--shadow-card)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-green-50">
                    <Wallet className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">已支付总额</span>
                </div>
                <div className="text-2xl text-green-600">¥{totalReceived.toLocaleString()}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">{paidBills.length} 笔已完成</div>
              </div>
            </>
          )}
        </div>

        {/* P2: Search bar & date range filter */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-[360px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="搜索订单编号、账单编号或标题..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-md border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:border-[var(--brand)] shadow-[var(--shadow-card)]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm transition-colors"
            style={{
              borderColor: showFilters ? 'var(--brand)' : 'var(--border-subtle)',
              color: showFilters ? 'var(--brand)' : 'var(--text-secondary)',
              backgroundColor: showFilters ? 'var(--brand-subtle)' : '#fff',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Calendar className="w-4 h-4" />
            日期筛选
          </button>
          {(searchQuery || dateStart || dateEnd) && (
            <button
              onClick={() => { setSearchQuery(''); setDateStart(''); setDateEnd(''); setCurrentPage(1); }}
              className="text-xs text-[var(--brand)] hover:underline"
            >
              清除筛选
            </button>
          )}
        </div>
        {showFilters && (
          <div className="flex items-center gap-3 mb-4 bg-white rounded-md px-4 py-3 shadow-[var(--shadow-card)] border border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-secondary)] shrink-0">日期范围：</span>
            <input
              type="date"
              value={dateStart}
              onChange={e => { setDateStart(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 border border-[var(--border-default)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]"
            />
            <span className="text-xs text-[var(--text-tertiary)]">至</span>
            <input
              type="date"
              value={dateEnd}
              onChange={e => { setDateEnd(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 border border-[var(--border-default)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]"
            />
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-white rounded-md px-2 py-2 shadow-[var(--shadow-card)] border border-[var(--border-subtle)] mb-4 overflow-x-auto">
          {visibleTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveFilter(tab.key); setCurrentPage(1); }}
              className="flex-shrink-0 px-4 py-1.5 rounded-md text-sm transition-all"
              style={
                activeFilter === tab.key
                  ? { backgroundColor: BRAND, color: '#fff' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  {myBills.filter(b => b.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bill list */}
        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : filteredBills.length === 0 ? (
          <div className="bg-white rounded-md shadow-[var(--shadow-card)] border border-[var(--border-subtle)]">
            <EmptyFirstUse
              title="暂无账单记录"
              description="完成订单并验收后将生成账单"
              actionLabel="查看进行中的订单"
              onAction={() => onNavigateToMyOrders?.()}
            />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-md shadow-[var(--shadow-card)] border border-[var(--border-subtle)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-root)]">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-tertiary)]" style={{ width: 60 }}>类型</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-tertiary)]">账单信息</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-tertiary)]" style={{ width: 90 }}>状态</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-[var(--text-tertiary)]" style={{ width: 100 }}>金额</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-tertiary)]" style={{ width: 90 }}>日期</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-tertiary)]" style={{ width: 100 }}>对方</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--text-tertiary)]" style={{ width: 100 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBills.map(bill => {
                    const actionLabel = getActionLabel(bill);
                    const cfg = statusConfig[bill.status];
                    return (
                      <tr
                        key={bill.id}
                        className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-root)] cursor-pointer transition-colors"
                        onClick={() => setSelectedBill(bill)}
                      >
                        <td className="px-4" style={{ height: 48 }}>
                          <TypeBadge type={bill.type} />
                        </td>
                        <td className="px-4 min-w-0" style={{ height: 48 }}>
                          <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{bill.id}</div>
                          <div className="text-[13px] text-[var(--text-primary)] truncate" style={{ maxWidth: '300px' }}>{bill.orderTitle}</div>
                        </td>
                        <td className="px-4" style={{ verticalAlign: 'middle' }}>
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={bill.status} />
                            {(bill.status === 'pending_confirm' || bill.status === 'pending_payment') && (() => {
                              const cd = getCountdown(bill.updatedAt);
                              return cd.isExpired ? (
                                <span className="text-[11px] text-red-500 flex items-center gap-0.5">
                                  <AlertCircle className="w-3 h-3" />
                                  已超时，可申诉
                                </span>
                              ) : (
                                <span className="text-[11px] text-[var(--text-tertiary)]">
                                  剩余{cd.remaining}小时
                                </span>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-4 text-right" style={{ height: 48, color: bill.amount && bill.amount > 0 ? BRAND : 'var(--text-tertiary)' }}>
                          <span className="text-[13px]">{formatAmount(bill.amount, bill.isNoFinalPayment)}</span>
                        </td>
                        <td className="px-4" style={{ height: 48 }}>
                          <span className="text-[13px] text-[var(--text-tertiary)]">{bill.createdAt}</span>
                        </td>
                        <td className="px-4" style={{ height: 48 }}>
                          <span className="text-[13px] text-[var(--text-secondary)]">{isUser ? bill.customerName : bill.userName}</span>
                        </td>
                        <td className="px-4" style={{ height: 48 }}>
                          <div className="flex items-center gap-2">
                            {actionLabel && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedBill(bill); }}
                                className="px-2.5 py-1 rounded text-xs text-white transition-colors flex-shrink-0"
                                style={{ backgroundColor: cfg.color }}
                              >
                                {actionLabel}
                              </button>
                            )}
                            <span
                              className="text-xs cursor-pointer hover:underline flex-shrink-0"
                              style={{ color: 'var(--brand)' }}
                              onClick={(e) => { e.stopPropagation(); setSelectedBill(bill); }}
                            >
                              详情→
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* P2: Pagination with page numbers + jump input */}
            <div className="flex items-center justify-center mt-4 gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded text-xs border border-[var(--border-default)] text-[var(--text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--bg-root)] transition-colors"
              >
                上一页
              </button>
              {(() => {
                const pages: (number | string)[] = [];
                const maxVisible = 7;
                if (totalPages <= maxVisible) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage > 3) pages.push('...');
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (currentPage < totalPages - 2) pages.push('...');
                  pages.push(totalPages);
                }
                return pages.map((p, i) =>
                  typeof p === 'string' ? (
                    <span key={`dots-${i}`} className="px-1 text-xs text-[var(--text-disabled)]">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className="w-8 h-8 rounded text-xs transition-colors"
                      style={p === currentPage
                        ? { backgroundColor: BRAND, color: '#fff' }
                        : { color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }
                      }
                    >
                      {p}
                    </button>
                  )
                );
              })()}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded text-xs border border-[var(--border-default)] text-[var(--text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--bg-root)] transition-colors"
              >
                下一页
              </button>
              {totalPages > 7 && (
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-xs text-[var(--text-tertiary)]">跳至</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    className="w-12 px-2 py-1 rounded border border-[var(--border-default)] text-xs text-center focus:outline-none focus:border-[var(--brand)]"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = parseInt((e.target as HTMLInputElement).value, 10);
                        if (val >= 1 && val <= totalPages) setCurrentPage(val);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    placeholder={`${currentPage}`}
                  />
                  <span className="text-xs text-[var(--text-tertiary)]">/ {totalPages} 页</span>
                </div>
              )}
              <span className="text-xs text-[var(--text-tertiary)]">
                共 {filteredBills.length} 条
              </span>
            </div>
          </>
        )}

        {/* One-phase info note */}
        <div className="mt-6 flex items-start gap-2 px-4 py-3 bg-white rounded-md border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
          <Info className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[var(--text-tertiary)] leading-relaxed">
            一期仅支持线下结算（线上留痕）。客户完成线下汇款后声明「已支付」，接单方确认收款后账单关闭。
            二期将接入 CSDN 在线支付。如有异议，可通过消息中心联系运营处理。
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {selectedBill && (
        <BillDetailDrawer
          bill={selectedBill}
          role={userRole}
          onClose={() => setSelectedBill(null)}
          onAction={handleAction}
        />
      )}

      {/* P2: Queued Toast */}
      {activeToast && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-md text-white text-sm shadow-xl"
          style={{ background: 'linear-gradient(135deg, #07091a 0%, #0d0b2e 55%, #12103d 100%)' }}
        >
          {activeToast}
          {toastQueue.length > 1 && (
            <span className="ml-2 text-xs text-gray-400">(+{toastQueue.length - 1}条待显示)</span>
          )}
        </div>
      )}
    </div>
  );
}