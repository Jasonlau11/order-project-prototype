import { OrderStatus } from '../types/order';

/** 订单状态展示配置 — 单一真相源，使用 CSS 变量替代硬编码色值 */
export const orderStatusConfig: Record<OrderStatus, { label: string; textVar: string; bgVar: string }> = {
  [OrderStatus.New]:               { label: '新建',       textVar: 'var(--info)',      bgVar: 'var(--info-bg)' },
  [OrderStatus.PendingReview]:     { label: '待审核',     textVar: 'var(--warning)',   bgVar: 'var(--warning-bg)' },
  [OrderStatus.Rejected]:          { label: '已打回',     textVar: 'var(--danger)',    bgVar: 'var(--danger-bg)' },
  [OrderStatus.Promoting]:         { label: '推广中',     textVar: 'var(--info)',      bgVar: 'var(--info-bg)' },
  [OrderStatus.AgreementPending]:  { label: '协议签署中', textVar: 'var(--warning)',   bgVar: 'var(--warning-bg)' },
  [OrderStatus.InDelivery]:        { label: '交付中',     textVar: 'var(--info)',      bgVar: 'var(--info-bg)' },
  [OrderStatus.Accepted]:          { label: '已验收',     textVar: 'var(--success)',   bgVar: 'var(--success-bg)' },
  [OrderStatus.PendingSettlement]:  { label: '待结算',     textVar: 'var(--brand)',     bgVar: 'var(--brand-subtle)' },
  [OrderStatus.Settled]:           { label: '已结算',     textVar: 'var(--success)',   bgVar: 'var(--success-bg)' },
  [OrderStatus.Cancelled]:         { label: '已取消',     textVar: 'var(--text-disabled)', bgVar: 'var(--bg-subtle)' },
  [OrderStatus.Terminated]:        { label: '已终止',     textVar: 'var(--danger)',    bgVar: 'var(--danger-bg)' },
  [OrderStatus.Closed]:            { label: '已关闭',     textVar: 'var(--text-disabled)', bgVar: 'var(--bg-subtle)' },
};
