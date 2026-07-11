import { X, Award, Briefcase, Clock, ShieldCheck } from 'lucide-react';

// 报名用户信息接口
export interface BidUser {
  id: number;
  name: string;
  avatar?: string;
  creditScore: number; // 信用评分 0-100
  creditLevel: string; // 信用等级：精英/优秀/一般/较差/差
  completedProjects: number; // 完成项目数
  skills: string[]; // 技能标签
  experience: string; // 工作经验
  bidTime: string; // 报名时间
  bidRemark: string; // 报名说明
  proposedBudget?: number; // 期望报价
}

// 信用等级 & 颜色 — P1-03: 精英绿 / 优秀蓝 / 一般灰 / 较差黄 / 差红
const getCreditLevelColor = (level: string): string => {
  const map: Record<string, string> = {
    '精英': '#1e8050',
    '优秀': '#0e82a8',
    '一般': '#999',
    '较差': '#b86010',
    '差': '#cf1322',
  };
  return map[level] || '#999';
};

interface BidSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderTitle: string;
  bidUsers: BidUser[];
  onSelectBidder: (bidderId: number) => void;
}

export function BidSelectionModal({
  isOpen,
  onClose,
  orderId,
  orderTitle,
  bidUsers,
  onSelectBidder
}: BidSelectionModalProps) {
  if (!isOpen) return null;

  const handleSelectBidder = (bidderId: number, bidderName: string) => {
    if (confirm(`确定选择 ${bidderName} 作为订单的接单方吗？\n\n选定后订单将进入协议签署阶段。`)) {
      onSelectBidder(bidderId);
    }
  };

  // 格式化预算
  const formatBudget = (budget?: number) => {
    if (!budget) return '-';
    if (budget >= 10000) {
      return `¥${(budget / 10000).toFixed(1)}万`;
    }
    return `¥${budget.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* 弹窗标题 */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">查看报名用户</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">订单：{orderTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* 统计信息 */}
        <div className="px-8 py-4 bg-[var(--bg-hover)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-[var(--text-secondary)]">
              共 <span className="text-[var(--brand)] font-semibold text-base">{bidUsers.length}</span> 人报名
            </span>
            <span className="text-[var(--text-tertiary)]">
              请仔细查看报名用户的资质和能力，选择最合适的接单方
            </span>
          </div>
        </div>

        {/* 报名用户列表 */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {bidUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-[var(--text-tertiary)] mb-2">暂无报名用户</div>
              <div className="text-sm text-[var(--text-disabled)]">还没有用户报名此订单</div>
            </div>
          ) : (
            <div className="space-y-4">
              {bidUsers.map((bidder, index) => (
                <div
                  key={bidder.id}
                  className="bg-white border border-[var(--border-subtle)] rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* 用户基本信息 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {/* 头像 */}
                      <div className="w-16 h-16 bg-[var(--brand)] text-white rounded-full flex items-center justify-center text-xl font-semibold flex-shrink-0">
                        {bidder.name.charAt(0)}
                      </div>
                      
                      {/* 用户信息 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{bidder.name}</h3>
                          {index === 0 && (
                            <span className="px-2 py-1 bg-[var(--brand-subtle)] text-[var(--brand)] text-xs rounded-full">
                              最早报名
                            </span>
                          )}
                        </div>
                        
                        {/* 信用评分和完成项目数 */}
                        <div className="flex items-center gap-6 mb-3">
                          {/* 信用评分 — ShieldCheck图标 + "92精英"格式，与 MyOrders/PersonalInfo 一致 */}
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: getCreditLevelColor(bidder.creditLevel) }} />
                            <span className="text-sm font-semibold" style={{ color: getCreditLevelColor(bidder.creditLevel) }}>{bidder.creditScore}{bidder.creditLevel}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-[var(--brand)]" />
                            <span className="text-sm font-medium text-[var(--text-primary)]">{bidder.completedProjects}</span>
                            <span className="text-sm text-[var(--text-tertiary)]">完成项目</span>
                          </div>
                        </div>

                        {/* 技能标签 */}
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          {bidder.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-[var(--brand-subtle)] text-[var(--brand)] text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* 工作经验 */}
                        <div className="flex items-start gap-2 mb-3">
                          <Briefcase className="w-4 h-4 text-[var(--text-secondary)] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-[var(--text-secondary)]">{bidder.experience}</span>
                        </div>

                        {/* 报名说明 */}
                        <div className="bg-[var(--bg-hover)] rounded-lg p-4 mb-3">
                          <div className="text-xs text-[var(--text-tertiary)] mb-1">报名说明</div>
                          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{bidder.bidRemark}</p>
                        </div>

                        {/* 报名时间 */}
                        <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                          <Clock className="w-3 h-3" />
                          <span>报名时间：{bidder.bidTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* 选标按钮 */}
                    <button
                      onClick={() => handleSelectBidder(bidder.id, bidder.name)}
                      className="px-6 py-2 bg-[var(--brand)] text-white rounded-full text-sm font-medium hover:bg-[var(--brand-hover)] transition-colors flex-shrink-0"
                    >
                      选择Ta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="border-t border-[var(--border-subtle)] px-8 py-4 bg-[var(--bg-hover)]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--text-secondary)]">
              提示：选定接单方后，订单将进入协议签署阶段
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-sm hover:bg-white transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 模拟报名用户数据生成函数
export function getMockBidUsers(orderId: number): BidUser[] {
  const bidUsersData: Record<number, BidUser[]> = {
    1002: [ // 品牌VI设计 - 8人报名
      {
        id: 1,
        name: '张设计师',
        creditScore: 92, creditLevel: '精英',
        completedProjects: 156,
        skills: ['品牌设计', 'VI设计', 'Adobe Illustrator', 'Photoshop'],
        experience: '8年品牌设计经验，服务过50+企业客户',
        bidTime: '2026-03-05 15:20',
        bidRemark: '我们团队专注品牌VI设计8年，拥有丰富的企业品牌设计经验。可以提供完整的VI系统设计方案，包括logo、名片、信纸、包装等全套应用设计。',
        proposedBudget: 18000
      },
      {
        id: 2,
        name: '李创意工作室',
        creditScore: 88, creditLevel: '优秀',
        completedProjects: 89,
        skills: ['品牌策划', 'VI设计', '平面设计', 'CorelDRAW'],
        experience: '5年设计经验，擅长新创公司品牌打造',
        bidTime: '2026-03-05 16:45',
        bidRemark: '专注于新创公司品牌设计，理解初创企业的需求和预算限制。可以在保证质量的前提下，提供性价比最高的方案。',
        proposedBudget: 16000
      },
      {
        id: 3,
        name: '王视觉设计',
        creditScore: 90, creditLevel: '精英',
        completedProjects: 123,
        skills: ['视觉设计', '品牌设计', 'UI设计', 'Sketch'],
        experience: '6年设计经验，曾服务多家知名品牌',
        bidTime: '2026-03-05 18:30',
        bidRemark: '我们的设计团队由资深设计师组成，擅长将品牌理念转化为视觉语言。承诺提供3套初稿方案供选择。',
        proposedBudget: 20000
      },
      {
        id: 4,
        name: '刘品牌顾问',
        creditScore: 85, creditLevel: '优秀',
        completedProjects: 67,
        skills: ['品牌咨询', 'VI设计', '市场营销'],
        experience: '4年品牌设计与咨询经验',
        bidTime: '2026-03-06 09:15',
        bidRemark: '提供品牌诊断+VI设计一体化服务，确保设计符合品牌战略定位。',
        proposedBudget: 22000
      },
      {
        id: 5,
        name: '陈设计团队',
        creditScore: 82, creditLevel: '优秀',
        completedProjects: 45,
        skills: ['平面设计', '品牌设计', 'InDesign'],
        experience: '3年设计经验，年轻但充满创意',
        bidTime: '2026-03-06 11:20',
        bidRemark: '年轻设计团队，思维活跃，能够为品牌注入新鲜创意。工期灵活，可以加急完成。',
        proposedBudget: 15000
      },
      {
        id: 6,
        name: '赵艺术工作室',
        creditScore: 92, creditLevel: '精英',
        completedProjects: 201,
        skills: ['艺术设计', '品牌设计', '创意策划'],
        experience: '10年设计经验，获多项设计大奖',
        bidTime: '2026-03-06 14:50',
        bidRemark: '我们追求设��的艺术性与商业性的完美结合，曾多次获得国内外设计奖项。可以提供高端定制化设计服务。',
        proposedBudget: 24000
      },
      {
        id: 7,
        name: '孙创意设计',
        creditScore: 78, creditLevel: '一般',
        completedProjects: 38,
        skills: ['创意设计', '品牌设计'],
        experience: '2年设计经验，善于创新',
        bidTime: '2026-03-06 16:30',
        bidRemark: '虽然经验不算最丰富，但我们充满激情和创意，愿意以更优惠的价格提供优质服务。',
        proposedBudget: 14000
      },
      {
        id: 8,
        name: '周品牌设计',
        creditScore: 88, creditLevel: '优秀',
        completedProjects: 112,
        skills: ['品牌设计', 'VI设计', '包装设计'],
        experience: '7年设计经验，擅长全案设计',
        bidTime: '2026-03-07 10:10',
        bidRemark: '提供从品牌策略到VI设计再到应用落地的全流程服务。可提供完整的品牌手册和应用指南。',
        proposedBudget: 19000
      }
    ],
    1008: [ // 产品包装设计 - 11人报名
      {
        id: 9,
        name: '包装设计专家',
        creditScore: 90, creditLevel: '精英',
        completedProjects: 145,
        skills: ['包装设计', '平面设计', '3D建模'],
        experience: '9年包装设计经验',
        bidTime: '2026-03-07 16:20',
        bidRemark: '专注产品包装设计，拥有完整的包装设计流程和供应链资源，可以提供从设计到打样的一站式服务。',
        proposedBudget: 15000
      },
      {
        id: 10,
        name: '创意包装工作室',
        creditScore: 85, creditLevel: '优秀',
        completedProjects: 78,
        skills: ['包装设计', '创意设计', 'Illustrator'],
        experience: '5年包装设计经验',
        bidTime: '2026-03-07 17:45',
        bidRemark: '善于将产品特性融入包装设计，让包装成为最好的销售员。',
        proposedBudget: 13000
      },
      {
        id: 11,
        name: '李包装设计',
        creditScore: 92, creditLevel: '精英',
        completedProjects: 189,
        skills: ['包装设计', '结构设计', '平面设计'],
        experience: '10年包装设计经验，曾获红点设计奖',
        bidTime: '2026-03-07 19:10',
        bidRemark: '提供创意包装设计+结构设计双保障，确保包装既美观又实用。曾为多个知名品牌设计包装。',
        proposedBudget: 17000
      },
      {
        id: 12,
        name: '王包装顾问',
        creditScore: 82, creditLevel: '优秀',
        completedProjects: 56,
        skills: ['包装设计', '品牌设计'],
        experience: '4年包装设计经验',
        bidTime: '2026-03-08 09:30',
        bidRemark: '注重包装的品牌一致性，能够将品牌理念完美融入包装设计。',
        proposedBudget: 14000
      },
      {
        id: 13,
        name: '张设计工作室',
        creditScore: 88, creditLevel: '优秀',
        completedProjects: 98,
        skills: ['包装设计', '印刷设计', 'CorelDRAW'],
        experience: '6年包装与印刷设计经验',
        bidTime: '2026-03-08 10:50',
        bidRemark: '熟悉各种包装材质和印刷工艺，能够确保设计方案的可落地性。',
        proposedBudget: 15500
      },
      {
        id: 14,
        name: '赵创意包装',
        creditScore: 78, creditLevel: '一般',
        completedProjects: 42,
        skills: ['包装设计', '创意设计'],
        experience: '3年包装设计经验',
        bidTime: '2026-03-08 11:20',
        bidRemark: '年轻团队，思维新颖，能够为产品包装带来新鲜创意。价格实惠。',
        proposedBudget: 12000
      },
      {
        id: 15,
        name: '孙包装设计',
        creditScore: 90, creditLevel: '精英',
        completedProjects: 134,
        skills: ['包装设计', '3D设计', '平面设计'],
        experience: '8年包装设计经验',
        bidTime: '2026-03-08 13:40',
        bidRemark: '提供3D效果图预览，让您提前看到包装的实际效果。包含包装盒和说明书设计。',
        proposedBudget: 16000
      },
      {
        id: 16,
        name: '周包装专家',
        creditScore: 85, creditLevel: '优秀',
        completedProjects: 87,
        skills: ['包装设计', '结构工程', 'CAD'],
        experience: '7年包装结构与设计经验',
        bidTime: '2026-03-08 14:15',
        bidRemark: '结合结构工程背景，确保包装设计的实用性和美观性兼顾。',
        proposedBudget: 14500
      },
      {
        id: 17,
        name: '吴包装工作室',
        creditScore: 88, creditLevel: '优秀',
        completedProjects: 105,
        skills: ['包装设计', '品牌设计', '插画设计'],
        experience: '6年设计经验，擅长插画风格包装',
        bidTime: '2026-03-08 15:30',
        bidRemark: '擅长将插画元素融入包装设计，打造独特的视觉风格。',
        proposedBudget: 15000
      },
      {
        id: 18,
        name: '郑包装设计',
        creditScore: 82, creditLevel: '优秀',
        completedProjects: 63,
        skills: ['包装设计', '平面设计'],
        experience: '5年包装设计经验',
        bidTime: '2026-03-08 16:45',
        bidRemark: '注重细节，追求完美。提供多轮修改直到满意为止。',
        proposedBudget: 13500
      },
      {
        id: 19,
        name: '钱创意设计',
        creditScore: 92, creditLevel: '精英',
        completedProjects: 167,
        skills: ['包装设计', '品牌策划', '市场营销'],
        experience: '9年设计品牌经验',
        bidTime: '2026-03-08 17:20',
        bidRemark: '提供包装设计+市场定位分析，确保包装符合目标用户审美和市场定位。',
        proposedBudget: 17500
      }
    ],
    1013: [ // 小程序UI重构 - 9人报名
      {
        id: 20,
        name: '前端UI专家',
        creditScore: 90, creditLevel: '精英',
        completedProjects: 132,
        skills: ['UI设计', '小程序开发', 'Figma', 'Sketch'],
        experience: '7年UI设计经验，擅长小程序界面设计',
        bidTime: '2026-03-08 11:30',
        bidRemark: '专注小程序UI设计，熟悉微信设计规范，能够提升用户体验的同时保证开发的可实现性。',
        proposedBudget: 42000
      },
      {
        id: 21,
        name: '李UI工作室',
        creditScore: 85, creditLevel: '优秀',
        completedProjects: 89,
        skills: ['UI/UX设计', '交互设计', '原型设计'],
        experience: '5年UI设计经验',
        bidTime: '2026-03-08 13:15',
        bidRemark: '提供UI设计+交互设计完整方案，注重用户体验优化。',
        proposedBudget: 38000
      },
      {
        id: 22,
        name: '王小程序设计',
        creditScore: 92, creditLevel: '精英',
        completedProjects: 156,
        skills: ['小程序UI', '用户体验', 'Adobe XD'],
        experience: '8年设计经验，小程序UI专家',
        bidTime: '2026-03-08 14:50',
        bidRemark: '深入研究小程序用户行为，能够通过UI重构显著提升用户留存率和转化率。',
        proposedBudget: 45000
      },
      {
        id: 23,
        name: '张交互设计师',
        creditScore: 82, creditLevel: '优秀',
        completedProjects: 67,
        skills: ['交互设计', 'UI设计', '用户研究'],
        experience: '4年交互与UI设计经验',
        bidTime: '2026-03-08 15:40',
        bidRemark: '基于用户研究进行UI设计，确保改版后的界面更符合用户习惯。',
        proposedBudget: 36000
      },
      {
        id: 24,
        name: '赵设计团队',
        creditScore: 88, creditLevel: '优秀',
        completedProjects: 104,
        skills: ['UI设计', '视觉设计', '小程序'],
        experience: '6年UI设计经验',
        bidTime: '2026-03-08 16:20',
        bidRemark: '提供完整的UI设计规范和组件库，方便后续维护和迭代。',
        proposedBudget: 40000
      },
      {
        id: 25,
        name: '孙用户体验设计',
        creditScore: 90, creditLevel: '精英',
        completedProjects: 128,
        skills: ['UX设计', 'UI设计', '可用性测试'],
        experience: '7年用户体验设计经验',
        bidTime: '2026-03-08 17:10',
        bidRemark: '注重可用性测试，在设计过程中会进行用户测试，确保UI改进的有效性。',
        proposedBudget: 43000
      },
      {
        id: 26,
        name: '周视觉设计',
        creditScore: 78, creditLevel: '一般',
        completedProjects: 52,
        skills: ['视觉设计', 'UI设计'],
        experience: '3年UI设计经验',
        bidTime: '2026-03-08 18:30',
        bidRemark: '年轻设计师，追求时尚简约的设计风格，价格实惠。',
        proposedBudget: 35000
      },
      {
        id: 27,
        name: '吴UI专家',
        creditScore: 92, creditLevel: '精英',
        completedProjects: 178,
        skills: ['UI设计', '品牌设计', '动效设计'],
        experience: '9年设计经验，UI设计专家',
        bidTime: '2026-03-08 19:15',
        bidRemark: '提供UI设计+微动效设计，让小程序界面更加生动有趣，提升用户粘性。',
        proposedBudget: 48000
      },
      {
        id: 28,
        name: '郑小程序UI',
        creditScore: 85, creditLevel: '优秀',
        completedProjects: 93,
        skills: ['小程序UI', 'H5设计', '响应式设计'],
        experience: '6年移动端UI设计经验',
        bidTime: '2026-03-08 20:00',
        bidRemark: '擅长小程序和H5界面设计，能够确保不同端的视觉一致性。',
        proposedBudget: 39000
      }
    ],
    1018: [ // 品牌故事视频拍摄 - 6人报名
      {
        id: 29,
        name: '影视制作团队',
        creditScore: 92, creditLevel: '精英',
        completedProjects: 142,
        skills: ['视频拍摄', '后期制作', '剧本创作', '导演'],
        experience: '10年影视制作经验',
        bidTime: '2026-03-06 12:30',
        bidRemark: '拥有专业的拍摄团队和后期制作团队，可以提供从剧本策划到拍摄制作的全流程服务。曾为多家知名企业拍摄品牌宣传片。',
        proposedBudget: 52000
      },
      {
        id: 30,
        name: '创意影像工作室',
        creditScore: 88, creditLevel: '优秀',
        completedProjects: 87,
        skills: ['视频制作', '创意策划', '摄影'],
        experience: '6年视频制作经验',
        bidTime: '2026-03-06 14:45',
        bidRemark: '善于用镜头讲故事，能够将企业文化和品牌理念转化为打动人心的视频内容。',
        proposedBudget: 48000
      },
      {
        id: 31,
        name: '李导演工作室',
        creditScore: 90, creditLevel: '精英',
        completedProjects: 118,
        skills: ['导演', '编剧', '视频制作'],
        experience: '8年导演经验',
        bidTime: '2026-03-06 16:20',
        bidRemark: '注重故事性和艺术性，能够拍摄出有温度、有深度的品牌故事片。',
        proposedBudget: 55000
      },
      {
        id: 32,
        name: '王视频制作',
        creditScore: 82, creditLevel: '优秀',
        completedProjects: 64,
        skills: ['视频拍摄', '后期剪辑', 'Premiere'],
        experience: '5年视频制作经验',
        bidTime: '2026-03-06 17:50',
        bidRemark: '提供性价比高的视频制作服务，保证质量的同时控制成本。',
        proposedBudget: 45000
      },
      {
        id: 33,
        name: '张影视传媒',
        creditScore: 92, creditLevel: '精英',
        completedProjects: 165,
        skills: ['影视制作', '广告拍摄', '品牌策划'],
        experience: '11年影视传媒经验',
        bidTime: '2026-03-06 19:10',
        bidRemark: '大型影视传媒公司，拥有完整的制作团队和专业设备，可以提供电影级别的拍摄质量。',
        proposedBudget: 58000
      },
      {
        id: 34,
        name: '赵创意视频',
        creditScore: 85, creditLevel: '优秀',
        completedProjects: 79,
        skills: ['创意视频', '短视频', '后期特效'],
        experience: '6年视频创作经验',
        bidTime: '2026-03-06 20:30',
        bidRemark: '擅长创意视频制作，能够用新颖的手法呈现品牌故事，让观众印象深刻。',
        proposedBudget: 50000
      }
    ]
  };

  return bidUsersData[orderId] || [];
}