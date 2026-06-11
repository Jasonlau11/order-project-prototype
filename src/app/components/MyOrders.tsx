import { useState, useEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Filter, ArrowUpDown, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Users, Eye, Calendar, DollarSign, MessageCircle, Shield, Star, AlertCircle } from 'lucide-react';
import { BidSelectionModal, getMockBidUsers } from './BidSelectionModal';
import { BidApplicationModal } from './BidApplicationModal';
import { UploadAgreementModal } from './UploadAgreementModal';
import { ConfirmAgreementModal } from './ConfirmAgreementModal';
import { OrderDetail } from './OrderDetail';
import { ContactInfoModal } from './ContactInfoModal';
import { SkeletonTable, SkeletonFilterBar } from './Skeleton';
import { EmptyState } from './EmptyState';

type UserRole = 'first-visit' | 'customer' | 'user' | 'browse-only';
type TabKey = 'assigned' | 'followed' | 'accepted' | 'inDelivery' | 'completed';

type OrderStatus = 'new' | 'pending' | 'rejected' | 'promoting' | 'signing' | 'inProgress' | 'accepted' | 'waitingSettlement' | 'settled' | 'cancelled' | 'terminated';

interface Order {
  id: number;
  title: string;
  taskType: string;
  budgetMin: number;
  budgetMax: number;
  status: OrderStatus;
  publishTime: string;
  publishTimestamp: number;
  description: string;
  acceptMode?: '指定接单方' | '运营方接单' | '公开抢单';
  contractor?: string;
  bidCount?: number;
  milestoneProgress?: {
    current: number;
    total: number;
  };
  settlementStatus?: 'pending' | 'settled';
  responseDeadline?: string;
  isApplied?: boolean; // 用户是否已报名（仅用于已关注订单）
  customerName?: string; // 发单客户名称
  creditScore?: number; // 信用分（仅用户视角展示，0-100）
}

// 客户视角：我发布的订单
const initialCustomerOrders: Order[] = [
  {
    id: 1001,
    title: '企业管理系统开发',
    taskType: '软件开发',
    budgetMin: 100000,
    budgetMax: 150000,
    status: 'inProgress',
    publishTime: '2026-02-15 10:00',
    publishTimestamp: Date.now() - 22 * 24 * 60 * 60 * 1000,
    description: '开发企业内部管理系统，包含人事、财务、项目管理等模块',
    acceptMode: '公开抢单',
    contractor: '张工作室',
    bidCount: 15,
    milestoneProgress: {
      current: 3,
      total: 5
    }
  },
  {
    id: 1002,
    title: '品牌VI设计',
    taskType: '平面设计',
    budgetMin: 15000,
    budgetMax: 25000,
    status: 'promoting',
    publishTime: '2026-03-05 14:30',
    publishTimestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    description: '为新创公司设计完整的品牌VI系统',
    acceptMode: '公开抢单',
    bidCount: 8
  },
  {
    id: 1003,
    title: '产品宣传视频制作',
    taskType: '视频创作',
    budgetMin: 20000,
    budgetMax: 30000,
    status: 'signing',
    publishTime: '2026-02-28 09:15',
    publishTimestamp: Date.now() - 9 * 24 * 60 * 60 * 1000,
    description: '制作5分钟产品宣传片，包含脚本、拍摄、后期制作',
    acceptMode: '指定接单方',
    contractor: '创意影像团队'
  },
  {
    id: 1004,
    title: '官网前端优化',
    taskType: '软件开发',
    budgetMin: 25000,
    budgetMax: 35000,
    status: 'settled',
    publishTime: '2026-01-10 11:20',
    publishTimestamp: Date.now() - 58 * 24 * 60 * 60 * 1000,
    description: '优化企业官网前端性能，提升加载速度',
    acceptMode: '公开抢单',
    contractor: '前端专家',
    milestoneProgress: {
      current: 4,
      total: 4
    }
  },
  {
    id: 1005,
    title: '市场调研报告',
    taskType: '文本创作',
    budgetMin: 8000,
    budgetMax: 12000,
    status: 'cancelled',
    publishTime: '2026-02-20 16:40',
    publishTimestamp: Date.now() - 17 * 24 * 60 * 60 * 1000,
    description: '撰写行业市场调研报告，分析竞争对手',
    acceptMode: '公开抢单',
    bidCount: 3
  },
  {
    id: 1006,
    title: 'APP功能开发',
    taskType: '软件开发',
    budgetMin: 50000,
    budgetMax: 80000,
    status: 'waitingSettlement',
    publishTime: '2026-01-25 10:00',
    publishTimestamp: Date.now() - 43 * 24 * 60 * 60 * 1000,
    description: '为移动APP添加新功能模块',
    acceptMode: '指定接单方',
    contractor: '李开发',
    milestoneProgress: {
      current: 3,
      total: 3
    }
  },
  {
    id: 1007,
    title: '数据分析平台开发',
    taskType: '软件开发',
    budgetMin: 80000,
    budgetMax: 120000,
    status: 'inProgress',
    publishTime: '2026-02-10 09:30',
    publishTimestamp: Date.now() - 27 * 24 * 60 * 60 * 1000,
    description: '开发企业数据分析平台，支持多维度数据展示和分析',
    acceptMode: '公开抢单',
    contractor: '数据科技团队',
    bidCount: 22,
    milestoneProgress: {
      current: 2,
      total: 6
    }
  },
  {
    id: 1008,
    title: '产品包装设计',
    taskType: '平面设计',
    budgetMin: 12000,
    budgetMax: 18000,
    status: 'promoting',
    publishTime: '2026-03-07 15:45',
    publishTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    description: '为新产品设计包装盒、说明书等物料',
    acceptMode: '公开抢单',
    bidCount: 11
  },
  {
    id: 1009,
    title: '智能硬件原型设计',
    taskType: '硬件订单',
    budgetMin: 150000,
    budgetMax: 200000,
    status: 'signing',
    publishTime: '2026-02-25 10:20',
    publishTimestamp: Date.now() - 12 * 24 * 60 * 60 * 1000,
    description: '设计智能家居设备原型，包含电路设计和外观设计',
    acceptMode: '指定接单方',
    contractor: '硬件创新实验室'
  },
  {
    id: 1010,
    title: '公众号运营推广',
    taskType: '营销推广',
    budgetMin: 20000,
    budgetMax: 30000,
    status: 'inProgress',
    publishTime: '2026-02-18 14:15',
    publishTimestamp: Date.now() - 19 * 24 * 60 * 60 * 1000,
    description: '负责企业公众号3个月的内容运营和推广',
    acceptMode: '公开抢单',
    contractor: '新媒体运营团队',
    bidCount: 18,
    milestoneProgress: {
      current: 1,
      total: 3
    }
  },
  {
    id: 1011,
    title: '产品评测报告',
    taskType: '产品评测',
    budgetMin: 5000,
    budgetMax: 8000,
    status: 'settled',
    publishTime: '2026-01-28 11:00',
    publishTimestamp: Date.now() - 40 * 24 * 60 * 60 * 1000,
    description: '对竞品进行全面评测分析，输出详细报告',
    acceptMode: '公开抢单',
    contractor: '评测达人',
    milestoneProgress: {
      current: 1,
      total: 1
    }
  },
  {
    id: 1012,
    title: '企业宣传册设计',
    taskType: '平面设计',
    budgetMin: 10000,
    budgetMax: 15000,
    status: 'waitingSettlement',
    publishTime: '2026-02-05 16:30',
    publishTimestamp: Date.now() - 32 * 24 * 60 * 60 * 1000,
    description: '设计公司宣传册，20页左右',
    acceptMode: '公开抢单',
    contractor: '视觉设计工作室',
    bidCount: 14,
    milestoneProgress: {
      current: 2,
      total: 2
    }
  },
  {
    id: 1013,
    title: '小程序UI重构',
    taskType: '软件开发',
    budgetMin: 35000,
    budgetMax: 50000,
    status: 'promoting',
    publishTime: '2026-03-08 10:00',
    publishTimestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    description: '重构现有小程序UI，提升用户体验',
    acceptMode: '公开抢单',
    bidCount: 9
  },
  {
    id: 1014,
    title: '直播带货活动策划',
    taskType: '营销推广',
    budgetMin: 25000,
    budgetMax: 40000,
    status: 'terminated',
    publishTime: '2026-02-12 09:45',
    publishTimestamp: Date.now() - 25 * 24 * 60 * 60 * 1000,
    description: '策划并执行一场直播带货活动',
    acceptMode: '公开抢单',
    contractor: '营销策划公司',
    bidCount: 7
  },
  {
    id: 1015,
    title: '数据库性能优化',
    taskType: '软件开发',
    budgetMin: 30000,
    budgetMax: 45000,
    status: 'inProgress',
    publishTime: '2026-02-22 13:20',
    publishTimestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
    description: '优化现有数据库性能，提升查询效率',
    acceptMode: '指定接单方',
    contractor: '数据库专家',
    milestoneProgress: {
      current: 2,
      total: 4
    }
  },
  {
    id: 1016,
    title: '三维产品建模',
    taskType: '平面设计',
    budgetMin: 18000,
    budgetMax: 28000,
    status: 'settled',
    publishTime: '2026-01-18 15:10',
    publishTimestamp: Date.now() - 50 * 24 * 60 * 60 * 1000,
    description: '为新产品制作高精度三维模型',
    acceptMode: '公开抢单',
    contractor: '3D建模师',
    bidCount: 12,
    milestoneProgress: {
      current: 3,
      total: 3
    }
  },
  {
    id: 1017,
    title: '微服务架构改造',
    taskType: '软件开发',
    budgetMin: 120000,
    budgetMax: 180000,
    status: 'signing',
    publishTime: '2026-03-01 10:30',
    publishTimestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
    description: '将现有单体应用改造为微服务架构',
    acceptMode: '运营方接单',
    contractor: '技术服务团队'
  },
  {
    id: 1018,
    title: '品牌故事视频拍摄',
    taskType: '视频创作',
    budgetMin: 40000,
    budgetMax: 60000,
    status: 'promoting',
    publishTime: '2026-03-06 11:45',
    publishTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    description: '拍摄企业品牌故事宣传片，10分钟左右',
    acceptMode: '公开抢单',
    bidCount: 6
  },
  {
    id: 1019,
    title: '技术文档翻译',
    taskType: '文本创作',
    budgetMin: 6000,
    budgetMax: 10000,
    status: 'cancelled',
    publishTime: '2026-02-16 14:00',
    publishTimestamp: Date.now() - 21 * 24 * 60 * 60 * 1000,
    description: '将技术文档从英文翻译为中文，约5万字',
    acceptMode: '公开抢单',
    bidCount: 5
  },
  {
    id: 1020,
    title: 'SEO优化服务',
    taskType: '营销推广',
    budgetMin: 15000,
    budgetMax: 25000,
    status: 'waitingSettlement',
    publishTime: '2026-01-22 09:30',
    publishTimestamp: Date.now() - 46 * 24 * 60 * 60 * 1000,
    description: '对企业官网进行SEO优化，提升搜索排名',
    acceptMode: '公开抢单',
    contractor: 'SEO专家',
    bidCount: 16,
    milestoneProgress: {
      current: 4,
      total: 4
    }
  }
];

// 用户视角：指定给我的订单
const mockAssignedOrders: Order[] = [
  {
    id: 101,
    title: '企业官网后端API开发',
    taskType: '软件开发',
    budgetMin: 30000,
    budgetMax: 50000,
    status: 'new',
    publishTime: '2026-03-08 10:30',
    publishTimestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    description: '需要开发企业官网的后端API，包括用户管理、内容管理等模块',
    responseDeadline: '2026-03-15',
    customerName: '某某科技有限公司',
    creditScore: 92
  },
  {
    id: 102,
    title: '移动应用UI设计优化',
    taskType: '平面设计',
    budgetMin: 8000,
    budgetMax: 12000,
    status: 'pending',
    publishTime: '2026-03-07 14:20',
    publishTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    description: '对现有移动应用进行UI优化，提升用户体验',
    responseDeadline: '2026-03-12',
    customerName: '创新联网公司',
    creditScore: 78
  },
  {
    id: 103,
    title: 'CRM系统定制开发',
    taskType: '软件开发',
    budgetMin: 60000,
    budgetMax: 90000,
    status: 'promoting',
    publishTime: '2026-03-06 09:00',
    publishTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    description: '根据企业需求定制CRM客户关系管理系统',
    responseDeadline: '2026-03-13',
    customerName: '商业管理集团',
    creditScore: 85
  },
  {
    id: 104,
    title: '产品宣传海报设计',
    taskType: '平面设计',
    budgetMin: 5000,
    budgetMax: 8000,
    status: 'promoting',
    publishTime: '2026-03-08 15:30',
    publishTimestamp: Date.now() - 0.5 * 24 * 60 * 60 * 1000,
    description: '设计一套产品宣传海报，包含线上线下版本',
    responseDeadline: '2026-03-14',
    customerName: '品牌策划公司',
    creditScore: 95
  },
  {
    id: 105,
    title: '智能客服机器人开发',
    taskType: '软件开发',
    budgetMin: 45000,
    budgetMax: 70000,
    status: 'pending',
    publishTime: '2026-03-05 11:20',
    publishTimestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    description: '开发基于AI的智能客服机器人系统',
    responseDeadline: '2026-03-11',
    customerName: '智慧服务平台',
    creditScore: 88
  },
  {
    id: 106,
    title: '企业宣传片剪辑',
    taskType: '视频创作',
    budgetMin: 12000,
    budgetMax: 18000,
    status: 'promoting',
    publishTime: '2026-03-07 16:45',
    publishTimestamp: Date.now() - 1.5 * 24 * 60 * 60 * 1000,
    description: '对已拍摄素材进行剪辑，制作3分钟企业宣传片',
    responseDeadline: '2026-03-13',
    customerName: '影视传媒公司',
    creditScore: 72
  },
  {
    id: 107,
    title: 'APP性能优化',
    taskType: '软件开发',
    budgetMin: 20000,
    budgetMax: 35000,
    status: 'promoting',
    publishTime: '2026-03-04 10:15',
    publishTimestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    description: '优化移动APP性能，降低卡顿和崩溃率',
    responseDeadline: '2026-03-10',
    customerName: '移动应用开发商',
    creditScore: 64
  },
  {
    id: 108,
    title: '电商运营方案策划',
    taskType: '营销推广',
    budgetMin: 15000,
    budgetMax: 25000,
    status: 'promoting',
    publishTime: '2026-03-06 14:00',
    publishTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    description: '策划季度电商运营方案，包含活动策划和推广计划',
    responseDeadline: '2026-03-12',
    customerName: '电商企业',
    creditScore: 81
  },
  {
    id: 109,
    title: '数据可视化大屏开发',
    taskType: '软件开发',
    budgetMin: 40000,
    budgetMax: 60000,
    status: 'promoting',
    publishTime: '2026-03-05 09:30',
    publishTimestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    description: '开发企业数据可视化大屏系统',
    responseDeadline: '2026-03-11',
    customerName: '大数据分析公司',
    creditScore: 93
  },
  {
    id: 110,
    title: '产品说明书设计',
    taskType: '平面设计',
    budgetMin: 6000,
    budgetMax: 10000,
    status: 'promoting',
    publishTime: '2026-03-08 13:15',
    publishTimestamp: Date.now() - 0.8 * 24 * 60 * 60 * 1000,
    description: '设计产品说明书，包含中英文版本',
    responseDeadline: '2026-03-14',
    customerName: '制造企业',
    creditScore: 76
  },
  {
    id: 111,
    title: '云服务迁移方案',
    taskType: '软件开发',
    budgetMin: 80000,
    budgetMax: 120000,
    status: 'promoting',
    publishTime: '2026-03-03 10:45',
    publishTimestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
    description: '制定并执行云服务迁移方案，从阿里云迁移到AWS',
    responseDeadline: '2026-03-09',
    customerName: '云计算服务商',
    creditScore: 90
  }
];

// 用户视角：已关注的订单
const mockFollowedOrders: Order[] = [
  {
    id: 201,
    title: 'AI智能推荐系统开发',
    taskType: '软件开发',
    budgetMin: 80000,
    budgetMax: 120000,
    status: 'signing',
    publishTime: '2026-03-06 09:15',
    publishTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    description: '开发基于机器学习的智能推荐系统',
    bidCount: 12,
    isApplied: true, // 已报名
    creditScore: 87
  },
  {
    id: 202,
    title: '区块溯源系统开发',
    taskType: '软件开发',
    budgetMin: 150000,
    budgetMax: 200000,
    status: 'inProgress',
    publishTime: '2026-03-04 14:30',
    publishTimestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    description: '基于区块链技术开发产品溯源系统',
    bidCount: 8,
    isApplied: false, // 未报名
    creditScore: 74
  },
  {
    id: 203,
    title: '动态图表组件库开发',
    taskType: '软件开发',
    budgetMin: 40000,
    budgetMax: 60000,
    status: 'pending',
    publishTime: '2026-03-05 10:20',
    publishTimestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    description: '开发React动态图表组件库',
    bidCount: 15,
    isApplied: false, // 未报名
    creditScore: 91
  },
  {
    id: 204,
    title: '品牌视觉升级设计',
    taskType: '平面设计',
    budgetMin: 30000,
    budgetMax: 50000,
    status: 'promoting',
    publishTime: '2026-03-03 11:45',
    publishTimestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
    description: '对现有品牌进行全面视觉升级',
    bidCount: 18,
    isApplied: true, // 已报名
    creditScore: 96
  },
  {
    id: 205,
    title: '智慧城市解决案',
    taskType: '软件开发',
    budgetMin: 200000,
    budgetMax: 300000,
    status: 'promoting',
    publishTime: '2026-03-01 09:00',
    publishTimestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
    description: '设计智慧城市整体技术解决方案',
    bidCount: 5,
    isApplied: false, // 未报名
    creditScore: 69
  },
  {
    id: 206,
    title: '产品推广短视频制作',
    taskType: '视频创作',
    budgetMin: 15000,
    budgetMax: 25000,
    status: 'promoting',
    publishTime: '2026-03-06 15:30',
    publishTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    description: '制作10条抖音推广短视频',
    bidCount: 22,
    isApplied: false, // 未报名
    creditScore: 83
  },
  {
    id: 207,
    title: 'IoT设备管理平台',
    taskType: '软件开发',
    budgetMin: 100000,
    budgetMax: 150000,
    status: 'promoting',
    publishTime: '2026-03-02 10:15',
    publishTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    description: '开发物联网设备统一管理平台',
    bidCount: 9,
    isApplied: false, // 未报名
    creditScore: 79
  },
  {
    id: 208,
    title: '企业文化手册设计',
    taskType: '平面设计',
    budgetMin: 12000,
    budgetMax: 20000,
    status: 'promoting',
    publishTime: '2026-03-07 09:30',
    publishTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    description: '设计企业文化手册，约50页',
    bidCount: 11,
    isApplied: true, // 已报名
    creditScore: 88
  }
];

// 用户视角：已接订单（统一数据源）
// 「已接订单」Tab 展示全部已承接订单；「交付中的订单」Tab 展示其中 status 为 inProgress 的订单
const allUserAcceptedOrders: Order[] = [
  {
    id: 301,
    title: '电商平台小程序开发',
    taskType: '软件开发',
    budgetMin: 40000,
    budgetMax: 60000,
    status: 'inProgress',
    publishTime: '2026-02-28 16:40',
    publishTimestamp: Date.now() - 9 * 24 * 60 * 60 * 1000,
    description: '开发电商平台微信小程序，包含商品展示、购物车、支付等功能',
    creditScore: 75
  },
  {
    id: 302,
    title: '品牌VI设计',
    taskType: '平面设计',
    budgetMin: 15000,
    budgetMax: 25000,
    status: 'signing',
    publishTime: '2026-03-01 11:20',
    publishTimestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
    description: '为新创公司设计完整的品牌VI系统',
    creditScore: 63
  },
  {
    id: 401,
    title: '企业管理系统开发',
    taskType: '软件开发',
    budgetMin: 100000,
    budgetMax: 150000,
    status: 'inProgress',
    publishTime: '2026-02-15 10:00',
    publishTimestamp: Date.now() - 22 * 24 * 60 * 60 * 1000,
    description: '开发企业内部管理系统，包含人事、财务、项目管理等模块',
    milestoneProgress: {
      current: 3,
      total: 5
    },
    creditScore: 89
  },
  {
    id: 402,
    title: '产品宣传片制作',
    taskType: '视频创作',
    budgetMin: 20000,
    budgetMax: 30000,
    status: 'inProgress',
    publishTime: '2026-02-20 14:30',
    publishTimestamp: Date.now() - 17 * 24 * 60 * 60 * 1000,
    description: '制作5分钟产品宣传片，包含脚本、拍摄、后期制作',
    milestoneProgress: {
      current: 2,
      total: 4
    },
    creditScore: 71
  }
];

// 用户视角：已验收订单
const mockCompletedOrders: Order[] = [
  {
    id: 501,
    title: '官网前端开发',
    taskType: '软件开发',
    budgetMin: 25000,
    budgetMax: 35000,
    status: 'waitingSettlement',
    publishTime: '2026-01-15 09:00',
    publishTimestamp: Date.now() - 53 * 24 * 60 * 60 * 1000,
    description: '开发企业官网前端页面，响应式设计',
    settlementStatus: 'pending',
    creditScore: 82
  },
  {
    id: 502,
    title: '品牌LOGO设计',
    taskType: '平面设计',
    budgetMin: 5000,
    budgetMax: 8000,
    status: 'settled',
    publishTime: '2026-01-20 15:30',
    publishTimestamp: Date.now() - 48 * 24 * 60 * 60 * 1000,
    description: '为新品牌设计LOGO及基础应用',
    settlementStatus: 'settled',
    creditScore: 94
  },
  {
    id: 503,
    title: '产品评测报撰写',
    taskType: '文本创作',
    budgetMin: 3000,
    budgetMax: 5000,
    status: 'settled',
    publishTime: '2026-02-01 11:00',
    publishTimestamp: Date.now() - 36 * 24 * 60 * 60 * 1000,
    description: '撰写智能手表产品评测报告',
    settlementStatus: 'settled',
    creditScore: 88
  }
];

// ── Design tokens ──────────────────────────────────────────────────────────
const BRAND = 'var(--brand)';

// ── SkeletonTabs — tab-strip loading placeholder ──────────────────────────
function SkeletonTabs() {
  return (
    <div className="bg-white animate-pulse" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-6 py-3">
        {[120, 110, 90, 110, 100].map((w, i) => (
          <div key={i} className="h-5 rounded" style={{ width: w, backgroundColor: 'var(--bg-hover)' }} />
        ))}
      </div>
    </div>
  );
}

// ── CountdownTimer — 实时倒计时组件 ──────────────────────────────────────
function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateRemaining(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateRemaining(deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-1 font-medium" style={{ color: 'var(--danger)' }}>
        <Clock className="w-3 h-3" />
        已超期
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" style={{ color: 'var(--danger-text)' }}>
      <Clock className="w-3 h-3" />
      剩余 {timeLeft.days}天 {timeLeft.hours}小时
    </div>
  );
}

// ── calculateRemaining — 计算截止日期的剩余时间 ────────────────────────────
function calculateRemaining(deadline: string): { days: number; hours: number; expired: boolean } {
  const deadlineDate = new Date(deadline + 'T23:59:59');
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, expired: true };
  }

  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  return { days, hours, expired: false };
}

export function MyOrders({ 
  userRole, 
  setUserRole,
  onBack,
}: { 
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('assigned');
  const [currentPage, setCurrentPage] = useState(1);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  
  // 客户视角筛选状态
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // 用户视角筛选状态
  const [showUserFilterPanel, setShowUserFilterPanel] = useState(false);
  const [userFilterStatus, setUserFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [userFilterTaskType, setUserFilterTaskType] = useState<string>('all');
  
  const [completedSubTab, setCompletedSubTab] = useState<'all' | 'pending' | 'settled'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showUploadAgreementModal, setShowUploadAgreementModal] = useState(false);
  const [showConfirmAgreementModal, setShowConfirmAgreementModal] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<Order[]>(initialCustomerOrders);
  const pageSize = 15;
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // ── 终止订单状态 ──────────────────────────────────────────────────────────
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminateTarget, setTerminateTarget] = useState<any>(null);
  const [terminateReason, setTerminateReason] = useState('');
  const [terminateConfirmText, setTerminateConfirmText] = useState('');

  // ── 今日待办计算 ─────────────────────────────────────────────────────────

  // ── 视图模式切换 ─────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'列表' | '按状态' | '按时间'>('列表');

  // ── 高级筛选折叠 ─────────────────────────────────────────────────────────
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // ── Tab 计数辅助函数 ──────────────────────────────────────────────────────
  const getTabCount = (tabKey: string): number => {
    switch (tabKey) {
      case 'assigned': return mockAssignedOrders.length;
      case 'followed': return mockFollowedOrders.length;
      case 'accepted': return allUserAcceptedOrders.length;
      case 'inDelivery': return allUserAcceptedOrders.filter(o => o.status === 'inProgress').length;
      case 'completed': return mockCompletedOrders.length;
      default: return 0;
    }
  };

  const getPendingCount = (tabKey: string): number => {
    switch (tabKey) {
      case 'assigned':
        return mockAssignedOrders.filter(o =>
          o.responseDeadline && new Date(o.responseDeadline + 'T23:59:59').getTime() < Date.now()
        ).length;
      case 'inDelivery':
        return allUserAcceptedOrders.filter(o =>
          o.status === 'inProgress' && o.milestoneProgress && o.milestoneProgress.current < o.milestoneProgress.total
        ).length;
      default: return 0;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const shouldError = Math.random() < 0.12; // ~12% chance to demo error state
      if (shouldError) {
        setLoadError(true);
      }
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoadError(false);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  // 终止订单回调
  const handleTerminateOrder = () => {
    if (!terminateTarget || !terminateReason || terminateConfirmText !== '确认终止') return;
    setCustomerOrders(prev =>
      prev.map(order =>
        order.id === terminateTarget.id
          ? { ...order, status: 'terminated' as OrderStatus, terminatedAt: new Date().toISOString(), terminateReason }
          : order
      )
    );
    
    // P1-03 success feedback
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 z-[60] px-5 py-3 rounded-lg text-[13px] font-medium shadow-lg animate-pulse-once';
    msg.style.cssText = 'background:var(--danger);color:#fff;box-shadow:var(--shadow-modal);';
    msg.textContent = `订单「${terminateTarget.title}」已终止`;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
    
    setShowTerminateModal(false);
    setTerminateTarget(null);
    setTerminateReason('');
    setTerminateConfirmText('');
  };

  // 获取客户订单数据（支持过滤）
  const getCustomerOrders = (): Order[] => {
    let filtered = customerOrders;
    
    // 仅看有效订单过滤
    if (showActiveOnly) {
      filtered = filtered.filter(order => order.status !== 'cancelled' && order.status !== 'terminated');
    }
    
    // 订单状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }
    
    // 任务类型筛选
    if (selectedTaskType !== 'all') {
      filtered = filtered.filter(order => order.taskType === selectedTaskType);
    }
    
    // 时间范围筛选
    if (selectedTimeRange !== 'all') {
      const now = Date.now();
      filtered = filtered.filter(order => {
        const daysDiff = Math.floor((now - order.publishTimestamp) / (1000 * 60 * 60 * 24));
        switch (selectedTimeRange) {
          case '7days':
            return daysDiff <= 7;
          case '30days':
            return daysDiff <= 30;
          case '90days':
            return daysDiff <= 90;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  };

  // 获取用户视角当前页签的订单数据
  const getUserTabOrders = (): Order[] => {
    let orders: Order[] = [];
    switch (activeTab) {
      case 'assigned':
        orders = mockAssignedOrders;
        break;
      case 'followed':
        orders = mockFollowedOrders;
        break;
      case 'accepted':
        orders = allUserAcceptedOrders;
        break;
      case 'inDelivery':
        orders = allUserAcceptedOrders.filter(o => o.status === 'inProgress');
        break;
      case 'completed':
        if (completedSubTab === 'pending') {
          orders = mockCompletedOrders.filter(o => o.settlementStatus === 'pending');
        } else if (completedSubTab === 'settled') {
          orders = mockCompletedOrders.filter(o => o.settlementStatus === 'settled');
        } else {
          orders = mockCompletedOrders;
        }
        break;
    }
    
    // 应用用户视角筛选
    if (userFilterStatus !== 'all') {
      orders = orders.filter(o => o.status === userFilterStatus);
    }
    if (userFilterTaskType !== 'all') {
      orders = orders.filter(o => o.taskType === userFilterTaskType);
    }
    
    return orders;
  };

  const currentOrders = userRole === 'customer' ? getCustomerOrders() : getUserTabOrders();
  const totalPages = Math.ceil(currentOrders.length / pageSize);
  const paginatedOrders = currentOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 格式化预算
  const formatBudget = (value: number) => {
    if (value >= 10000) return '¥' + (value / 10000).toFixed(1) + '万';
    return '¥' + value.toLocaleString();
  };

  // 信用分等级 & 颜色 — P1-03: 精英绿 / 优秀蓝 / 一般灰 / 较差黄 / 差红
  const getCreditLevel = (score: number): { level: string; color: string } => {
    if (score >= 90) return { level: '精英', color: 'var(--credit-elite)' };
    if (score >= 80) return { level: '优秀', color: 'var(--credit-excellent)' };
    if (score >= 70) return { level: '一般', color: 'var(--credit-fair)' };
    if (score >= 60) return { level: '较差', color: 'var(--credit-poor)' };
    return { level: '差', color: 'var(--danger-text)' };
  };

  // P1-03: 紧凑一行 — 小盾牌图标 + 分数 + 等级文字（如"92精英"），仅 user 角色可见
  const renderCreditScore = (score: number) => {
    const { level, color } = getCreditLevel(score);
    return (
      <div className="flex items-center gap-1">
        <Shield className="w-3 h-3 shrink-0" style={{ color }} />
        <span className="text-[12px] font-medium whitespace-nowrap" style={{ color }}>{score}{level}</span>
      </div>
    );
  };

  // 获取状态标签
  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig: Record<OrderStatus, { text: string; color: string }> = {
      new:               { text: '新建',      color: 'bg-[var(--surface-hover)] text-[#666]' },
      pending:           { text: '待审核',    color: 'bg-[#fff8e1] text-[#b86010]' },
      rejected:          { text: '已打回',    color: 'bg-[#ffebee] text-[var(--danger-text)]' },
      promoting:         { text: '推广中',    color: 'bg-[#e8f3fd] text-[#1d6db5]' },
      signing:           { text: '协议签署中', color: 'bg-[#fff8e1] text-[#b86010]' },
      inProgress:        { text: '交付中',    color: 'bg-[#e3f5fb] text-[#0e82a8]' },
      accepted:          { text: '已验收',    color: 'bg-[#e4f5ec] text-[#1e8050]' },
      waitingSettlement: { text: '待结算',    color: 'bg-[var(--brand-bg)] text-[var(--brand)]' },
      settled:           { text: '已结算',    color: 'bg-[#e4f5ec] text-[#1e8050]' },
      cancelled:         { text: '已取消',    color: 'bg-[var(--surface-hover)] text-[#999]' },
      terminated:        { text: '已终止',    color: 'bg-[#ffebee] text-[var(--danger-text)]' },
    };
    const config = statusConfig[status];
    return (
      <span className={`px-2.5 py-0.5 rounded-md text-xs ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // 处理接单
  const handleAcceptOrder = (orderId: number) => {
    alert(`接单成功！订单 #${orderId} 已移至"已接订单"`);
  };

  // 处理拒绝
  const handleRejectOrder = (orderId: number) => {
    if (confirm('确定要拒绝此订单吗？')) {
      alert(`已拒绝订单 #${orderId}`);
    }
  };

  // 处理报名 - 打开报名弹窗
  const handleApplyOrder = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowApplyModal(true);
  };

  // 提交报名申请
  const handleSubmitBidApplication = (orderId: number, bidRemark: string, attachmentName?: string) => {
    const message = [
      `报名成功！`,
      ``,
      `订单 #${orderId}`,
      `报名说明：${bidRemark.substring(0, 50)}...`,
      attachmentName ? `附件：${attachmentName}` : '',
    ].filter(Boolean).join('\n');
    alert(message);
    // 实际应用中这里会调用API提交报名并将订单的isApplied状态更新为true
    setShowApplyModal(false);
    setSelectedOrderId(null);
  };

  // 查看订单详情
  const handleViewDetail = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowOrderDetail(true);
  };

  // 查看报名列表
  const handleViewBids = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowBidModal(true);
  };

  // 关闭报名弹窗
  const handleCloseBidModal = () => {
    setShowBidModal(false);
    setSelectedOrderId(null);
  };

  // 选标（选择接单方）
  const handleSelectBidder = (bidderId: number) => {
    if (selectedOrderId) {
      alert(`选标成功！\n\n订单 #${selectedOrderId} 已确定接单方（用户ID: ${bidderId}）\n订单状态已变更为"协议签署中"`);
      // 实际应用中这里会调用API更新订单状态
      handleCloseBidModal();
    }
  };

  // 获取当前选中订单的信息
  const selectedOrder = selectedOrderId 
    ? currentOrders.find(order => order.id === selectedOrderId)
    : null;

  // 处理上传协议
  const handleUploadAgreement = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowUploadAgreementModal(true);
  };

  // 提交上传协议
  const handleSubmitUploadAgreement = (orderId: number, file: File) => {
    alert(`协议上传成功！\n\n订单 #${orderId}\n文件名：${file.name}\n文件大小：${(file.size / 1024).toFixed(2)} KB\n\n接单方需确认后，平台审核通过订单才能进入交付阶段`);
    // 实际应用中这里会调用API上传文件
    setShowUploadAgreementModal(false);
    setSelectedOrderId(null);
  };

  // 处理确认协议
  const handleConfirmAgreement = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowConfirmAgreementModal(true);
  };

  // 提交确认协议
  const handleSubmitConfirmAgreement = (orderId: number) => {
    alert(`协议确认成功！\n\n订单 #${orderId}\n\n已提交平台审核，审核通过后订单将进入交付阶段`);
    // 实际应用中这里会调用API确认协议
    setShowConfirmAgreementModal(false);
    setSelectedOrderId(null);
  };

  // 处理下载协议
  const handleDownloadAgreement = (orderId: number) => {
    alert(`开始下载协议文件...\n\n订单 #${orderId}`);
    // 实际应用中这里会调用API下协议文件
  };

  // 模拟协议文件数据
  const getMockAgreementFile = (orderId: number) => {
    return {
      fileName: `三方协议_订单${orderId}.pdf`,
      fileSize: 2048576, // 2MB
      uploadTime: '2026-03-09 14:30',
      uploadBy: '某某科技有限公司'
    };
  };

  // 用户视角页签
  const userTabs = [
    { key: 'assigned' as TabKey, label: '指定给我的订单', count: mockAssignedOrders.length },
    { key: 'followed' as TabKey, label: '已关注的订单', count: mockFollowedOrders.length },
    { key: 'accepted' as TabKey, label: '已接订单', count: allUserAcceptedOrders.length },
    { key: 'inDelivery' as TabKey, label: '交付中的订单', count: allUserAcceptedOrders.filter(o => o.status === 'inProgress').length },
    { key: 'completed' as TabKey, label: '已验收订单', count: mockCompletedOrders.length }
  ];

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-root)' }}>

      {/* ── Mini hero banner — v4.0: clean dark, no decorations ────────────── */}
      <div className="relative" style={{ background: 'var(--bg-hero)' }}>
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          {/* Back link */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-white/50 hover:text-white/90 text-[13px] mb-4 transition-all group"
              style={{ transition: 'all var(--transition-fast)' }}
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              返回订单广场
            </button>
          )}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[28px] font-semibold tracking-[-0.01em] mb-1" style={{ color: 'var(--text-inverse)' }}>我的订单</h1>
              <p className="text-[13px]" style={{ color: 'var(--text-inverse-muted)' }}>管理您发布或承接的所有订单</p>
            </div>
            <div className="flex items-center gap-0.5 rounded-md p-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}>
              {(['customer', 'user'] as const).map(role => {
                const labels: Record<string, string> = { customer: '客户视角', user: '用户视角' };
                return (
                  <button
                    key={role}
                    onClick={() => { setUserRole(role as UserRole); setCurrentPage(1); }}
                    className="px-4 py-1.5 rounded-sm text-[13px] font-medium transition-all"
                    style={userRole === role ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' } : { color: 'var(--text-inverse-muted)', transition: 'all var(--transition-fast)' }}
                  >
                    {labels[role]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 今日待办提醒 ──────────────────────────────────────────────────────── */}
      {/* ── Income Summary (user role only) ────────────────────────────────────── */}
      {!isLoading && userRole === 'user' && (
        <div className="max-w-[1200px] mx-auto px-6 pt-4">
          <div className="rounded-lg p-4 mb-4 flex items-center gap-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div>
              <div className="text-[11px] mb-0.5" style={{ color: 'var(--text-tertiary)' }}>近6个月收入</div>
              <div className="text-[20px] font-semibold" style={{ color: 'var(--brand)' }}>¥128,500</div>
            </div>
            <div className="flex-1 h-8 flex items-end gap-0.5">
              {[40, 55, 35, 70, 45, 85].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i === 5 ? 'var(--brand)' : 'var(--bg-subtle)' }} />
              ))}
            </div>
            <div className="text-right">
              <div className="text-[11px] mb-0.5" style={{ color: 'var(--text-tertiary)' }}>本月</div>
              <div className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>¥22,000</div>
            </div>
          </div>
        </div>
      )}

      {/* ── User-role tab strip ───────────────────────────────────────────────── */}
      {isLoading && userRole === 'user' && <SkeletonTabs />}
      {!isLoading && userRole === 'user' && (
        <div className="bg-white" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="max-w-[1200px] mx-auto px-6 flex items-center overflow-x-auto">
            {userTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); setCompletedSubTab('all'); }}
                className="relative py-3.5 pr-6 text-[13px] font-medium transition-all whitespace-nowrap shrink-0"
                style={activeTab === tab.key ? { color: 'var(--brand)' } : { color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
              >
                <span className="flex items-center gap-1.5">
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold"
                      style={activeTab === tab.key
                        ? { backgroundColor: 'var(--brand)', color: '#fff' }
                        : { backgroundColor: 'var(--bg-hover)', color: 'var(--text-tertiary)' }}
                    >
                      {getTabCount(tab.key)}
                    </span>
                  )}
                  {getPendingCount(tab.key) > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--danger)' }} />
                  )}
                </span>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-6 h-[2px] rounded-full" style={{ backgroundColor: 'var(--brand)' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Completed sub-tabs ────────────────────────────────────────────────── */}
      {userRole === 'user' && activeTab === 'completed' && (
        <div className="bg-white border-b border-[var(--border-subtle)]">
          <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-6">
            {([
              { key: 'all' as const, label: '全部', count: mockCompletedOrders.length },
              { key: 'pending' as const, label: '待结算', count: mockCompletedOrders.filter(o => o.settlementStatus === 'pending').length },
              { key: 'settled' as const, label: '已结算', count: mockCompletedOrders.filter(o => o.settlementStatus === 'settled').length },
            ]).map(subTab => (
              <button
                key={subTab.key}
                onClick={() => { setCompletedSubTab(subTab.key); setCurrentPage(1); }}
                className="relative py-2.5 text-[13px] font-medium transition-all"
                style={completedSubTab === subTab.key ? { color: 'var(--brand)' } : { color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
              >
                {subTab.label}
                {subTab.count > 0 && (
                  <span
                    className="ml-1.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold"
                    style={completedSubTab === subTab.key
                      ? { backgroundColor: 'var(--brand)', color: '#fff' }
                      : { backgroundColor: 'var(--bg-hover)', color: 'var(--text-tertiary)' }}
                  >
                    {subTab.count}
                  </span>
                )}
                {completedSubTab === subTab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ backgroundColor: 'var(--brand)' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter bar ───────────────────────────────────────────────────────── */}
      {isLoading && <SkeletonFilterBar />}
      {!isLoading && (
      <div className="max-w-[1200px] mx-auto w-full px-6 pt-5 pb-3">
        <div className="bg-white rounded-md px-5 py-3.5" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {userRole === 'customer' && (
                <select
                  value={selectedStatus}
                  onChange={e => { setSelectedStatus(e.target.value as OrderStatus | 'all'); setCurrentPage(1); }}
                  className="px-3 py-2 rounded-md text-[13px] bg-white outline-none transition-all"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
                >
                  <option value="all">全部状态</option>
                  <option value="new">新建</option>
                  <option value="pending">待审核</option>
                  <option value="rejected">已打回</option>
                  <option value="promoting">推广中</option>
                  <option value="signing">协议签署中</option>
                  <option value="inProgress">交付中</option>
                  <option value="accepted">已验收</option>
                  <option value="waitingSettlement">待结算</option>
                  <option value="settled">已结算</option>
                  <option value="cancelled">已取消</option>
                  <option value="terminated">已终止</option>
                </select>
              )}
              {userRole === 'user' && (
                <Popover open={showUserFilterPanel} onOpenChange={setShowUserFilterPanel}>
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-all"
                      style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
                      <Filter className="w-4 h-4" />
                      筛选
                      {(userFilterStatus !== 'all' || userFilterTaskType !== 'all') && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: 'var(--brand)' }}>
                          {[userFilterStatus !== 'all' ? 1 : 0, userFilterTaskType !== 'all' ? 1 : 0].filter(Boolean).length}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <select
                        value={userFilterStatus}
                        onChange={e => { setUserFilterStatus(e.target.value as OrderStatus | 'all'); setCurrentPage(1); }}
                        className="px-3 py-2 rounded-md text-[13px] bg-white outline-none transition-all"
                        style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
                      >
                        <option value="all">全部状态</option>
                        <option value="inProgress">进行中</option>
                        <option value="accepted">已完成</option>
                        <option value="cancelled">已取消</option>
                        <option value="terminated">已终止</option>
                      </select>
                      <select
                        value={userFilterTaskType}
                        onChange={e => { setUserFilterTaskType(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 rounded-md text-[13px] bg-white outline-none transition-all"
                        style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
                      >
                        <option value="all">全部类型</option>
                        <option value="文本创作">文本创作</option>
                        <option value="视频创作">视频创作</option>
                        <option value="软件开发">软件开发</option>
                        <option value="产品评测">产品评测</option>
                        <option value="营销推广">营销推广</option>
                        <option value="平面设计">平面设计</option>
                        <option value="硬件订单">硬件订单</option>
                      </select>
                      <button
                        onClick={() => {
                          setUserFilterStatus('all');
                          setUserFilterTaskType('all');
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 rounded-md text-[13px] font-medium transition-all"
                        style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
                      >
                        重置
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {/* ── 分组视图切换 ────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-1 p-0.5 rounded-md" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              {(['列表', '按状态', '按时间'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setViewMode(view)}
                  className="px-3 py-1.5 text-[12px] rounded transition-colors"
                  style={{
                    backgroundColor: viewMode === view ? 'var(--bg-surface)' : 'transparent',
                    color: viewMode === view ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: viewMode === view ? 'var(--shadow-card)' : 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {view}
                </button>
              ))}
            </div>
            {/* 高级筛选折叠按钮 */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-md transition-all"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
            >
              <Filter className="w-3.5 h-3.5" />
              {showAdvancedFilters ? '收起高级筛选' : '高级筛选'}
            </button>
          </div>

          {/* ── 高级筛选区域 ────────────────────────────────────────────────── */}
          {showAdvancedFilters && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {userRole === 'customer' && (
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={selectedTaskType}
                    onChange={e => { setSelectedTaskType(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 rounded-md text-[13px] bg-white outline-none transition-all"
                    style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
                  >
                    <option value="all">全部类型</option>
                    <option value="文本创作">文本创作</option>
                    <option value="视频创作">视频创作</option>
                    <option value="软件开发">软件开发</option>
                    <option value="产品评测">产品评测</option>
                    <option value="营销推广">营销推广</option>
                    <option value="平面设计">平面设计</option>
                    <option value="硬件订单">硬件订单</option>
                  </select>
                  <select
                    value={selectedTimeRange}
                    onChange={e => { setSelectedTimeRange(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 rounded-md text-[13px] bg-white outline-none transition-all"
                    style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}
                  >
                    <option value="all">全部时间</option>
                    <option value="7days">近7天</option>
                    <option value="30days">近30天</option>
                    <option value="90days">近90天</option>
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showActiveOnly}
                      onChange={e => { setShowActiveOnly(e.target.checked); setCurrentPage(1); }}
                      className="w-4 h-4 rounded accent-[var(--brand)]"
                    />
                    <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>仅看有效订单</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* ── Order list ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1200px] mx-auto px-6 pb-6">
          {/* Loading / Error / Content */}
          {loadError ? (
            <div className="bg-white rounded-md overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 mb-4" style={{ color: 'var(--danger)' }} />
                <p className="text-[15px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>加载失败</p>
                <p className="text-[13px] mb-6" style={{ color: 'var(--text-tertiary)' }}>订单数据加载失败，请检查网络连接后重试</p>
                <button
                  onClick={handleRetry}
                  className="px-6 py-2 text-white rounded-md text-[14px] font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--brand)' }}>
                  重新加载
                </button>
              </div>
            </div>
          ) : (
          <div>
          {isLoading && <SkeletonTable rows={5} />}

          {!isLoading && (paginatedOrders.length === 0 ? (
            <div className="bg-white rounded-md overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <EmptyState
                title="暂无订单"
                description={
                  userRole === 'customer' ? '您还没有发布任何订单' :
                  userRole === 'user' && activeTab === 'assigned' ? '还没有客户指定给您的订单' :
                  userRole === 'user' && activeTab === 'followed' ? '您还没有关注任何订单' :
                  userRole === 'user' && activeTab === 'accepted' ? '您还没有承接任何订单' :
                  userRole === 'user' && activeTab === 'inDelivery' ? '暂无交付中的订单' :
                  userRole === 'user' && activeTab === 'completed' ? '暂无已验收的订单' :
                  '暂无订单'
                }
              />
            </div>
          ) : (
            <div className="bg-white rounded-md overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-root)' }}>
                    {userRole === 'customer' ? (
                      <>
                        <th className="py-3 px-4 text-left text-[13px] font-medium" style={{ width: 80, color: 'var(--text-secondary)' }}>类型</th>
                        <th className="py-3 px-4 text-left text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>标题</th>
                        <th className="py-3 px-4 text-left text-[13px] font-medium" style={{ width: 90, color: 'var(--text-secondary)' }}>状态</th>
                        <th className="py-3 px-4 text-right text-[13px] font-medium" style={{ width: 100, color: 'var(--text-secondary)' }}>预算</th>
                        <th className="py-3 px-4 text-left text-[13px] font-medium" style={{ width: 120, color: 'var(--text-secondary)' }}>日期</th>
                        <th className="py-3 px-4 text-right text-[13px] font-medium" style={{ width: 240, color: 'var(--text-secondary)' }}>操作</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3 px-4 text-left text-[13px] font-medium" style={{ width: 80, color: 'var(--text-secondary)' }}>类型</th>
                        <th className="py-3 px-4 text-left text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>标题</th>
                        <th className="py-3 px-4 text-left text-[13px] font-medium" style={{ width: 90, color: 'var(--text-secondary)' }}>状态</th>
                        <th className="py-3 px-4 text-right text-[13px] font-medium" style={{ width: 100, color: 'var(--text-secondary)' }}>预算</th>
                        <th className="py-3 px-4 text-left text-[13px] font-medium" style={{ width: 75, color: 'var(--text-secondary)' }}>信用分</th>
                        <th className="py-3 px-4 text-left text-[13px] font-medium" style={{ width: 140, color: 'var(--text-secondary)' }}>发单时间</th>
                        <th className="py-3 px-4 text-right text-[13px] font-medium" style={{ width: 240, color: 'var(--text-secondary)' }}>操作</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map(order => {
                    return (
                      <tr
                        key={order.id}
                        className="transition-all hover:bg-[var(--bg-hover)] transition-colors duration-150"
                        style={{ borderBottom: '1px solid var(--border-subtle)', height: 48, transition: 'all var(--transition-fast)' }}
                      >
                        <td className="py-0 px-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {order.taskType}
                        </td>
                        <td className="py-0 px-4">
                          <button
                            onClick={() => handleViewDetail(order.id)}
                            className="text-[14px] text-left hover:text-[var(--brand)] transition-colors leading-snug block truncate"
                            style={{ color: 'var(--text-primary)', maxWidth: 400 }}
                          >
                            {order.title}
                          </button>
                        </td>
                        <td className="py-0 px-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-0 px-4 text-right text-[13px] font-medium" style={{ color: BRAND }}>
                          {formatBudget(order.budgetMax)}
                        </td>
                        {userRole === 'user' && (
                          <td className="py-0 px-4">
                            {order.creditScore !== undefined && renderCreditScore(order.creditScore)}
                          </td>
                        )}
                        <td className="py-0 px-4 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                          {order.publishTime}
                        </td>
                        <td className="py-0 px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {userRole === 'customer' && (
                              <>
                                {/* Slot 1 — 查看详情（始终显示） */}
                                <div style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
                                  <button onClick={() => handleViewDetail(order.id)}
                                    className="px-3 py-1 text-[13px] font-medium rounded-md transition-all whitespace-nowrap"
                                    style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
                                    查看详情
                                  </button>
                                </div>
                                {/* Slot 2 — 查看报名 / 上传协议（条件显示，空时占位） */}
                                <div style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
                                  {order.status === 'promoting' && order.acceptMode === '公开抢单' && order.bidCount && order.bidCount > 0 ? (
                                    <button onClick={() => handleViewBids(order.id)}
                                      className="px-3 py-1 text-white rounded-md text-[13px] hover:opacity-90 transition-opacity whitespace-nowrap"
                                      style={{ backgroundColor: BRAND }}>
                                      查看报名
                                    </button>
                                  ) : order.status === 'signing' ? (
                                    <button onClick={() => handleUploadAgreement(order.id)}
                                      className="px-3 py-1 text-white rounded-md text-[13px] hover:opacity-90 transition-opacity whitespace-nowrap"
                                      style={{ backgroundColor: BRAND }}>
                                      上传协议
                                    </button>
                                  ) : null}
                                </div>
                                {/* Slot 3 — 终止订单（条件显示，空时占位） */}
                                <div style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
                                  {(order.status === 'promoting' || order.status === 'inProgress') ? (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setTerminateTarget(order); setShowTerminateModal(true); }}
                                      className="px-3 py-1 text-[13px] rounded-md transition-colors hover:bg-[var(--danger-bg)] whitespace-nowrap"
                                      style={{ color: 'var(--danger)' }}
                                    >
                                      终止订单
                                    </button>
                                  ) : null}
                                </div>
                              </>
                            )}
                            {userRole === 'user' && (
                              <>
                                {activeTab === 'assigned' && (
                                  <>
                                    {/* Slot 1 — 沟通 */}
                                    <div style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
                                      <button onClick={() => { setSelectedOrderId(order.id); setShowMessageModal(true); }}
                                        className="flex items-center gap-1 px-3 py-1 rounded-md text-[13px] font-medium transition-all whitespace-nowrap"
                                        style={{ borderColor: 'var(--brand)', color: 'var(--brand)', border: '1px solid var(--brand)', transition: 'all var(--transition-fast)' }}>
                                        <MessageCircle className="w-3.5 h-3.5" /> 沟通
                                      </button>
                                    </div>
                                    {/* Slot 2 — 拒绝 */}
                                    <div style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
                                      <button onClick={() => handleRejectOrder(order.id)}
                                        className="px-3 py-1 text-[13px] font-medium rounded-md transition-all whitespace-nowrap"
                                        style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
                                        拒绝
                                      </button>
                                    </div>
                                    {/* Slot 3 — 确认接单 */}
                                    <div style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
                                      <button onClick={() => handleAcceptOrder(order.id)}
                                        className="px-3 py-1 text-white rounded-md text-[13px] hover:opacity-90 transition-opacity whitespace-nowrap"
                                        style={{ backgroundColor: BRAND }}>
                                        确认接单
                                      </button>
                                    </div>
                                  </>
                                )}
                                {activeTab === 'followed' && (
                                  <>
                                    {/* Slot 1 — 取消关注 */}
                                    <div style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
                                      <button className="px-3 py-1 text-[13px] font-medium rounded-md transition-all whitespace-nowrap"
                                        style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
                                        取消关注
                                      </button>
                                    </div>
                                    {/* Slot 2 — 报名 / 已报名 */}
                                    <div style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
                                      {order.isApplied ? (
                                        <button disabled className="px-3 py-1 rounded-md text-[13px] cursor-not-allowed whitespace-nowrap"
                                          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-disabled)' }}>已报名</button>
                                      ) : (
                                        <button onClick={() => handleApplyOrder(order.id)}
                                          className="px-3 py-1 text-white rounded-md text-[13px] hover:opacity-90 transition-opacity whitespace-nowrap"
                                          style={{ backgroundColor: BRAND }}>
                                          报名
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                                {(activeTab === 'accepted' || activeTab === 'inDelivery') && (
                                  <>
                                    {/* Slot 1 — 查看详情 */}
                                    <div style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
                                      <button onClick={() => handleViewDetail(order.id)}
                                        className="px-3 py-1 text-[13px] font-medium rounded-md transition-all whitespace-nowrap"
                                        style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
                                        查看详情
                                      </button>
                                    </div>
                                    {/* Slot 2 — 确认协议（条件显示，空时占位） */}
                                    <div style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
                                      {order.status === 'signing' && activeTab === 'accepted' ? (
                                        <button onClick={() => handleConfirmAgreement(order.id)}
                                          className="px-3 py-1 text-white rounded-md text-[13px] hover:opacity-90 transition-opacity whitespace-nowrap"
                                          style={{ backgroundColor: BRAND }}>
                                          确认协议
                                        </button>
                                      ) : null}
                                    </div>
                                  </>
                                )}
                                {activeTab === 'completed' && (
                                  <div style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
                                    <button onClick={() => handleViewDetail(order.id)}
                                      className="px-3 py-1 text-[13px] font-medium rounded-md transition-all whitespace-nowrap"
                                      style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
                                      查看详情
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
          </div>
          )}
        </div>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      {!isLoading && paginatedOrders.length > 0 && totalPages > 1 && (
        <div className="bg-white px-6 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium transition-all border"
              style={currentPage === 1
                ? { color: 'var(--text-disabled)', borderColor: 'var(--border-subtle)', cursor: 'not-allowed' }
                : { color: 'var(--text-secondary)', borderColor: 'var(--border-default)', transition: 'all var(--transition-fast)' }}>
              <ChevronLeft className="w-4 h-4" /> 上一页
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className="w-9 h-9 rounded-md text-[13px] font-medium transition-all border"
                  style={page === currentPage
                    ? { backgroundColor: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' }
                    : { color: 'var(--text-secondary)', borderColor: 'var(--border-default)', transition: 'all var(--transition-fast)' }}>
                  {page}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium transition-all border"
              style={currentPage === totalPages
                ? { color: 'var(--text-disabled)', borderColor: 'var(--border-subtle)', cursor: 'not-allowed' }
                : { color: 'var(--text-secondary)', borderColor: 'var(--border-default)', transition: 'all var(--transition-fast)' }}>
              下一页 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {selectedOrder && (
        <BidSelectionModal
          isOpen={showBidModal}
          onClose={handleCloseBidModal}
          orderId={selectedOrder.id}
          orderTitle={selectedOrder.title}
          bidUsers={getMockBidUsers(selectedOrder.id)}
          onSelectBidder={handleSelectBidder}
        />
      )}

      {/* 报名申请弹窗 */}
      {selectedOrder && (
        <BidApplicationModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          orderId={selectedOrder.id}
          orderTitle={selectedOrder.title}
          onSubmit={handleSubmitBidApplication}
        />
      )}

      {/* 上传协议弹窗 */}
      {selectedOrder && (
        <UploadAgreementModal
          isOpen={showUploadAgreementModal}
          onClose={() => setShowUploadAgreementModal(false)}
          orderId={selectedOrder.id}
          orderTitle={selectedOrder.title}
          onSubmit={handleSubmitUploadAgreement}
        />
      )}

      {/* 确认协议弹窗 */}
      {selectedOrder && (
        <ConfirmAgreementModal
          isOpen={showConfirmAgreementModal}
          onClose={() => setShowConfirmAgreementModal(false)}
          orderId={selectedOrder.id}
          orderTitle={selectedOrder.title}
          agreementFile={getMockAgreementFile(selectedOrder.id)}
          onConfirm={handleSubmitConfirmAgreement}
          onDownload={handleDownloadAgreement}
        />
      )}

      {/* 订单详情弹窗 */}
      {selectedOrderId && (
        <OrderDetail
          isOpen={showOrderDetail}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrderId(null);
          }}
          userRole={userRole}
          orderId={selectedOrderId}
          onTerminateOrder={handleTerminateOrder}
        />
      )}

      {/* 联系信息弹窗 */}
      {selectedOrderId && selectedOrder && (
        <ContactInfoModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
          orderTitle={selectedOrder.title}
          customerName={selectedOrder.customerName || '发单客户'}
        />
      )}

      {/* ── 终止订单确认弹窗 ──────────────────────────────────────────────── */}
      {showTerminateModal && terminateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div
            className="rounded-xl p-6 w-full max-w-md mx-4"
            style={{ backgroundColor: 'var(--bg-surface)', boxShadow: 'var(--shadow-modal)' }}
          >
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>终止订单</h3>
            <p className="text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>
              确认终止订单「{terminateTarget.title}」？此操作不可撤销。
            </p>

            <div className="mb-4">
              <label className="block text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>终止原因</label>
              <div className="space-y-2">
                {['需求变更', '预算问题', '质量不符预期', '沟通困难', '其他原因'].map(reason => (
                  <label key={reason} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="terminate_reason"
                      checked={terminateReason === reason}
                      onChange={() => setTerminateReason(reason)}
                      className="w-4 h-4"
                      style={{ accentColor: 'var(--brand)' }}
                    />
                    <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                请输入 <span className="font-semibold">确认终止</span> 以继续
              </label>
              <input
                type="text"
                value={terminateConfirmText}
                onChange={(e) => setTerminateConfirmText(e.target.value)}
                placeholder="确认终止"
                className="w-full px-3 py-2 rounded-md text-[13px] outline-none"
                style={{
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-root)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowTerminateModal(false); setTerminateTarget(null); setTerminateReason(''); setTerminateConfirmText(''); }}
                className="flex-1 py-2 rounded-md text-[13px] font-medium transition-colors"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              >
                取消
              </button>
              <button
                disabled={!terminateReason || terminateConfirmText !== '确认终止'}
                onClick={handleTerminateOrder}
                className="flex-1 py-2 rounded-md text-[13px] font-medium transition-opacity"
                style={{
                  backgroundColor: terminateReason && terminateConfirmText === '确认终止' ? 'var(--danger)' : 'var(--bg-subtle)',
                  color: terminateReason && terminateConfirmText === '确认终止' ? '#fff' : 'var(--text-disabled)',
                  opacity: terminateReason && terminateConfirmText === '确认终止' ? 1 : 0.5,
                }}
              >
                确认终止
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}