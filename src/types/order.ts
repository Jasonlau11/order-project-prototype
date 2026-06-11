/** 
 * 订单状态 — 单一真相源，后端 API 字段名
 * 统一了 OrderSquare.tsx 和 MyOrders.tsx 的 6 种命名不一致
 */
export enum OrderStatus {
  New = 'new',
  PendingReview = 'pending_review',
  Rejected = 'rejected',
  Promoting = 'promoting',
  AgreementPending = 'agreement_pending',
  InDelivery = 'in_delivery',
  Accepted = 'accepted',
  PendingSettlement = 'pending_settlement',
  Settled = 'settled',
  Cancelled = 'cancelled',
  Terminated = 'terminated',
  Closed = 'closed',
}

export interface Order {
  id: number;
  title: string;
  taskType: string;
  budgetMin: number;
  budgetMax: number;
  bidCount: number;
  publishTime: string;
  publishTimestamp: number;
  description: string;
  status: OrderStatus;
  creditScore?: number;
  collectionId?: string;
  isNew?: boolean;
  isHot?: boolean;
  deliveryMode?: 'online' | 'offline' | 'hybrid';
  aiTags?: string[];
  bidDeadline?: string;
  acceptMode?: '指定接单方' | '运营方接单' | '公开抢单';
  contractor?: string;
  milestoneProgress?: { current: number; total: number };
  settlementStatus?: 'pending' | 'settled';
  responseDeadline?: string;
  isApplied?: boolean;
  customerName?: string;
  // 弱结构化详情字段
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
  pushInfo?: {
    pushType: 'customer' | 'skill_match';
    pushExpireAt: number;
    matchTags: string[];
    tagMatchCount?: number;
  };
  creditDimensions?: CreditDimensions;
}

export interface CreditDimensions {
  onTimeDeliveryRate: string;
  oneTimePassRate: string;
  repurchaseRate: string;
  overdueRate: string;
  responseSpeed: string;
}
