import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, Sparkles, Upload, Check, Tag, X, Clock, Save, RefreshCw, Search, Plus, Users } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// 骨架模块模拟数据
const SKELETON_MODULES = [
  { key: 'overview', title: '项目概述' },
  { key: 'requirements', title: '需求说明' },
  { key: 'deliverables', title: '交付物要求' },
  { key: 'schedule', title: '排期与预算' },
  { key: 'contractorReq', title: '接单要求' },
  { key: 'additional', title: '附加信息' },
];

// AI自动分类的模拟类型标签
const AUTO_TAGS = ['软件开发', '产品评测'];

// 时限快捷选项
const TIME_PRESETS = [
  { label: '3 天', value: '3', desc: '紧急项目' },
  { label: '7 天', value: '7', desc: '常规节奏', default: true },
  { label: '15 天', value: '15', desc: '宽松周期' },
  { label: '30 天', value: '30', desc: '大型项目' },
  { label: '自定义', value: 'custom' },
];

interface Message {
  id: number;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

interface CardContent {
  key: string;
  title: string;
  content: string;
}

interface OrderPublishPageProps {
  onBack: () => void;
}

export function OrderPublishPage({ onBack }: OrderPublishPageProps) {
  // 流程阶段: 'dialogue' | 'card_review' | 'publish_config' | 'confirm'
  const [phase, setPhase] = useState<'dialogue' | 'card_review' | 'publish_config' | 'confirm'>('dialogue');

  // 对话
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'ai', content: '您好！我是您的AI订单助手。请描述一下您想要发布的订单需求，我会帮您梳理成完整的订单内容。您可以直接说，也可以上传文档。', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 生成的卡片内容
  const [cards, setCards] = useState<CardContent[]>([]);
  const [orderTags, setOrderTags] = useState<string[]>(AUTO_TAGS);
  const [regeneratingCard, setRegeneratingCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // 结构化字段
  const [settlementMode, setSettlementMode] = useState<'direct_transaction' | 'platform_contract'>('direct_transaction');
  const [budget, setBudget] = useState('');

  // 接单配置
  const [orderNature, setOrderNature] = useState<'public' | 'private'>('public');
  const [acceptMode, setAcceptMode] = useState<'recommended_push' | 'open_bidding' | 'assigned_contractor'>('recommended_push');
  // 超时配置
  const [responseTimeout, setResponseTimeout] = useState('7');
  const [bidTimeout, setBidTimeout] = useState('7');
  const [pushTimeout, setPushTimeout] = useState('3');
  const [responseTimeoutAction, setResponseTimeoutAction] = useState('auto_cancel');
  const [bidTimeoutAction, setBidTimeoutAction] = useState('auto_delist');
  const [pushTimeoutAction, setPushTimeoutAction] = useState('convert_to_public');

  // 模拟推荐用户
  const MOCK_RECOMMENDED_USERS = [
    { id: 1, name: '张工', creditScore: 92, tags: ['React', 'TypeScript', '政务系统'], deliveryRate: '98%' },
    { id: 2, name: '李团队', creditScore: 88, tags: ['React', 'UI设计'], deliveryRate: '95%' },
    { id: 3, name: '王开发', creditScore: 85, tags: ['Python', '数据分析', '政务系统'], deliveryRate: '91%' },
  ];
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // 结构化字段校验错误
  const [structuredErrors, setStructuredErrors] = useState<Record<string, string>>({});

  // 手动搜索添加用户
  const MOCK_ALL_USERS = [
    ...MOCK_RECOMMENDED_USERS,
    { id: 4, name: '赵前端', creditScore: 80, tags: ['Vue', 'JavaScript'], deliveryRate: '88%' },
    { id: 5, name: '孙后端', creditScore: 90, tags: ['Go', '微服务'], deliveryRate: '96%' },
    { id: 6, name: '周测试', creditScore: 75, tags: ['自动化测试', 'Selenium'], deliveryRate: '85%' },
    { id: 7, name: '吴全栈', creditScore: 87, tags: ['Node.js', 'React', 'DevOps'], deliveryRate: '93%' },
    { id: 8, name: '郑设计', creditScore: 82, tags: ['Figma', 'UI/UX'], deliveryRate: '90%' },
  ];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof MOCK_ALL_USERS>([]);
  const [pushedUsers, setPushedUsers] = useState<typeof MOCK_ALL_USERS>([]);
  const [searchActive, setSearchActive] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 手动创建模式
  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualTaskTypes, setManualTaskTypes] = useState<string[]>([]);
  const [manualTaskTypeInput, setManualTaskTypeInput] = useState('');

  // 草稿
  const [draftData, setDraftData] = useState<any>(null);
  const [showDraftRestore, setShowDraftRestore] = useState(false);
  const [draftToast, setDraftToast] = useState<string | null>(null);

  // 文件上传
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI 助手浮动按钮（全局注入点）
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiAssistantMessages, setAiAssistantMessages] = useState<Message[]>([
    { id: 0, role: 'ai', content: '对当前步骤有任何疑问？AI助手帮你调整。请告诉我您遇到了什么问题。', timestamp: new Date() },
  ]);
  const [aiAssistantInput, setAiAssistantInput] = useState('');
  const [aiAssistantProcessing, setAiAssistantProcessing] = useState(false);
  const aiAssistantEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // AI 助手消息自动滚动
  useEffect(() => {
    aiAssistantEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiAssistantMessages]);

  // 草稿恢复检测
  useEffect(() => {
    const saved = localStorage.getItem('orderDraft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.expiry && new Date(parsed.expiry) > new Date()) {
          setDraftData(parsed.state);
          setShowDraftRestore(true);
        } else {
          localStorage.removeItem('orderDraft');
        }
      } catch {}
    }
  }, []);

  // 草稿提示自动关闭
  useEffect(() => {
    if (draftToast) {
      const timer = setTimeout(() => setDraftToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [draftToast]);

  // 通用操作提示自动关闭
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // 模拟AI生成卡片
  const generateCardsFromAI = () => {
    return [
      { key: 'overview', title: '项目概述', content: '客户需要一个电商网站后台管理系统，用于管理商品信息、订单处理、用户管理和数据分析。系统需要支持多角色权限控制，界面简洁易用。' },
      { key: 'requirements', title: '需求说明', content: '**技术栈:** React 18 + TypeScript + Node.js\n**核心功能:**\n- 商品管理：CRUD操作、分类、上下架\n- 订单管理：订单列表、状态流转、退款处理\n- 用户管理：角色权限、操作日志\n- 数据看板：销售统计、趋势分析\n**性能要求:** 页面加载 < 2s，支持500+并发' },
      { key: 'deliverables', title: '交付物要求', content: '1. 完整源代码（含注释）\n2. 数据库设计文档\n3. 部署文档和运维手册\n4. 测试报告（覆盖率 > 80%）' },
      { key: 'schedule', title: '排期与预算', content: '**总工期:** 2-3个月\n**预算范围:** ¥50,000 - ¥80,000\n**交付方式:** 按里程碑分期交付' },
      { key: 'contractorReq', title: '接单要求', content: '- 3年以上React开发经验\n- 有电商或后台系统项目经验\n- 熟悉TypeScript和Node.js\n- 具备良好的沟通能力' },
    ];
  };

  // 需求完整度检测
  const detectCompleteness = (msgs: Message[]) => {
    const userText = msgs.filter(m => m.role === 'user').map(m => m.content).join('');
    const hasType = /(网站|APP|视频|设计|开发|文案|评测|营销|硬件|程序|系统|平台|小程序|接口|数据|测试|部署|运维|安全)/i.test(userText);
    const hasBudget = /(预算|费用|价格|元|万|报价|多少钱)/i.test(userText);
    const hasDeadline = /(天|周|月|完成|交付|截止|时间|工期)/i.test(userText);
    return { hasType, hasBudget, hasDeadline, score: [hasType, hasBudget, hasDeadline].filter(Boolean).length };
  };

  // 处理发送消息
  const handleSend = () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = { id: Date.now(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    // 模拟AI响应——任何输入都触发，2轮后或含关键词立即生成卡片
    const userText = userMsg.content;
    setTimeout(() => {
      const userMsgCount = messages.filter(m => m.role === 'user').length; // 当前消息已加入messages
      const hasTriggerWord = userText.includes('生成订单') || userText.includes('帮我生成') || userText.includes('差不多了');

      if (userMsgCount >= 2 || hasTriggerWord) {
        // 达到2轮或含触发词 → 生成预览
        const aiMsg: Message = { id: Date.now() + 1, role: 'ai', content: '我已了解足够信息，为您生成订单预览。', timestamp: new Date() };
        setMessages(prev => [...prev, aiMsg]);
        setTimeout(() => {
          setCards(generateCardsFromAI());
          setPhase('card_review');
        }, 1000);
        setIsProcessing(false);
        return;
      }

      // 第一轮：引导补充
      const aiResponse = '收到您的需求！让我梳理一下关键信息：\n\n• 项目目标和核心功能\n• 技术栈偏好\n• 交付周期和预算范围\n• 对接单方的特别要求\n\n您可以继续补充细节，或直接说「帮我生成订单」触发预览。';
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: aiResponse, timestamp: new Date() }]);
      setIsProcessing(false);
    }, 1000);
  };

  // 确认卡片，进入结构化字段填写
  const handleCardsConfirmed = () => {
    setPhase('publish_config');
  };

  // 返回对话阶段
  const handleBackToDialogue = () => {
    setPhase('dialogue');
  };

  // 返回卡片确认阶段
  const handleBackToCardReview = () => {
    setPhase('card_review');
  };

  // 发布配置确认 → 直接提交
  const handlePublishConfigConfirmed = () => {
    const errors: Record<string, string> = {};
    if (!settlementMode) errors.settlementMode = '请选择结算模式';
    if (!budget || parseFloat(budget) <= 0) errors.budget = '请填写有效的订单预算';
    if (Object.keys(errors).length > 0) {
      setStructuredErrors(errors);
      setToastMsg('请完善必填项后继续');
      return;
    }
    setStructuredErrors({});
    handleSubmit();
  };

  // 最终提交
  const handleSubmit = () => {
    setPhase('confirm');
    setTimeout(() => {
      alert('订单已提交审核！运营方审核通过后将按照您设置的方式发布。');
      onBack();
    }, 500);
  };

  // ======== 草稿功能 ========
  const getCurrentFormState = () => ({
    messages,
    cards,
    orderTags,
    settlementMode,
    budget,
    orderNature,
    acceptMode,
    responseTimeout,
    bidTimeout,
    pushTimeout,
    responseTimeoutAction,
    bidTimeoutAction,
    pushTimeoutAction,
    phase,
    manualMode,
    manualTitle,
    manualDescription,
    manualTaskTypes,
  });

  const handleSaveDraft = () => {
    const state = getCurrentFormState();
    const draft = {
      state,
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    localStorage.setItem('orderDraft', JSON.stringify(draft));
    setDraftData(state);
    setDraftToast('草稿已保存（7天内有效）');
  };

  const handleRestoreDraft = () => {
    if (!draftData) return;
    setMessages(draftData.messages || []);
    setCards(draftData.cards || []);
    setOrderTags(draftData.orderTags || AUTO_TAGS);
    setSettlementMode(draftData.settlementMode || 'direct_transaction');
    setBudget(draftData.budget || '');
    setOrderNature(draftData.orderNature || 'public');
    setAcceptMode(draftData.acceptMode || 'recommended_push');
    setResponseTimeout(draftData.responseTimeout || '7');
    setBidTimeout(draftData.bidTimeout || '7');
    setPushTimeout(draftData.pushTimeout || '3');
    setResponseTimeoutAction(draftData.responseTimeoutAction || 'auto_cancel');
    setBidTimeoutAction(draftData.bidTimeoutAction || 'auto_delist');
    setPushTimeoutAction(draftData.pushTimeoutAction || 'convert_to_public');
    setPhase(draftData.phase || 'dialogue');
    setManualMode(draftData.manualMode || false);
    setManualTitle(draftData.manualTitle || '');
    setManualDescription(draftData.manualDescription || '');
    setManualTaskTypes(draftData.manualTaskTypes || []);
    setShowDraftRestore(false);
    setDraftToast('草稿已恢复');
  };

  const handleDismissDraft = () => {
    localStorage.removeItem('orderDraft');
    setDraftData(null);
    setShowDraftRestore(false);
  };

  // 重新生成单个卡片内容
  const handleRegenerateCard = (cardKey: string) => {
    setRegeneratingCard(cardKey);
    setToastMsg('AI正在重新生成该模块...');
    setTimeout(() => {
      // 模拟AI重新生成该模块内容
      const regeneratedContents: Record<string, string> = {
        overview: '经AI重新分析，项目核心目标是构建一个面向电商运营的智能化后台管理系统，重点关注商品生命周期管理、多维度订单追踪、精细化用户权限体系以及数据驱动的运营决策支持。',
        requirements: '**重新梳理技术栈:** React 18 + TypeScript + Node.js (NestJS)\n**核心功能模块:**\n- 商品管理：SKU管理、批量操作、库存预警\n- 订单管理：全链路追踪、异常订单处理、自动分账\n- 用户管理：RBAC权限模型、审计日志、SSO集成\n- 数据看板：实时大屏、自定义报表、智能预警\n**非功能需求:** P99延迟 < 500ms，支持水平扩展',
        deliverables: '1. 完整源代码（含单元测试 + E2E测试）\n2. 技术方案设计文档\n3. 部署运维手册（含CI/CD配置）\n4. API接口文档（Swagger）\n5. 用户操作手册',
        schedule: '**优化后的排期:**\n- 第一阶段（4周）：核心架构搭建 + 商品管理\n- 第二阶段（4周）：订单管理 + 用户管理\n- 第三阶段（3周）：数据看板 + 联调测试\n- **更新预算:** ¥60,000 - ¥90,000',
        contractorReq: '- 5年以上全栈开发经验\n- 有大型电商系统架构经验\n- 熟悉React生态和NestJS框架\n- 具备团队协作和项目管理能力\n- 有DevOps和CI/CD实践经验优先',
        additional: '客户额外要求支持多语言国际化，系统和第三方物流服务商API对接，移动端适配（H5）。',
      };
      setCards(prev =>
        prev.map(card =>
          card.key === cardKey
            ? { ...card, content: regeneratedContents[cardKey] || card.content }
            : card
        )
      );
      setRegeneratingCard(null);
      setToastMsg(`${cards.find(c => c.key === cardKey)?.title || ''}已重新生成`);
    }, 1500);
  };

  // 编辑卡片内容
  const handleStartEdit = (cardKey: string, content: string) => {
    setEditingCard(cardKey);
    setEditingContent(content);
  };

  const handleSaveEdit = () => {
    if (!editingCard) return;
    setCards(prev => prev.map(c => c.key === editingCard ? { ...c, content: editingContent } : c));
    setEditingCard(null);
    setEditingContent('');
    setToastMsg('模块内容已保存');
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditingContent('');
  };

  // 搜索用户
  const handleSearchUser = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchActive(false);
      return;
    }
    const query = searchQuery.trim().toLowerCase();
    const results = MOCK_ALL_USERS.filter(
      u => u.name.toLowerCase().includes(query) ||
           u.tags.some(t => t.toLowerCase().includes(query))
    );
    setSearchResults(results);
    setSearchActive(true);
  };

  // 添加推送用户
  const handleAddPushedUser = (user: typeof MOCK_ALL_USERS[number]) => {
    if (pushedUsers.some(u => u.id === user.id)) {
      setToastMsg(`用户「${user.name}」已在推送列表中`);
      return;
    }
    setPushedUsers(prev => [...prev, user]);
    setSearchResults(prev => prev.filter(r => r.id !== user.id));
    setToastMsg(`已添加「${user.name}」到推送列表`);
  };

  // 移除推送用户
  const handleRemovePushedUser = (userId: number) => {
    setPushedUsers(prev => prev.filter(u => u.id !== userId));
  };
  const ALLOWED_EXTENSIONS = ['.txt', '.md', '.mdx', '.docx', '.doc', '.pdf'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验文件类型
    const fileName = file.name.toLowerCase();
    const ext = fileName.slice(fileName.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setToastMsg('不支持的文件类型，仅支持 .txt、.md、.mdx、.docx、.doc、.pdf 格式');
      // 重置 input 以便重新选择同一文件
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 校验文件大小
    if (file.size > MAX_FILE_SIZE) {
      setToastMsg('文件大小不能超过 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadedFileName(file.name);
    setIsUploading(true);
    setTimeout(() => {
      setCards(generateCardsFromAI());
      setIsUploading(false);
      const sysMsg: Message = { id: Date.now(), role: 'system', content: `文档 "${file.name}" 已解析，请确认以下内容。`, timestamp: new Date() };
      setMessages(prev => [...prev, sysMsg]);
      setPhase('card_review');
    }, 1500);
  };

  // ======== 手动创建功能 ========
  const handleStartManual = () => {
    setManualMode(true);
  };

  const handleAddManualTaskType = () => {
    if (manualTaskTypeInput.trim() && !manualTaskTypes.includes(manualTaskTypeInput.trim())) {
      setManualTaskTypes(prev => [...prev, manualTaskTypeInput.trim()]);
      setManualTaskTypeInput('');
    }
  };

  const handleRemoveManualTaskType = (type: string) => {
    setManualTaskTypes(prev => prev.filter(t => t !== type));
  };

  const handleManualToStructured = () => {
    if (!manualTitle.trim()) return;
    setOrderTags(manualTaskTypes.length > 0 ? manualTaskTypes : ['未分类']);
    setPhase('publish_config');
  };

  const handleExitManualMode = () => {
    setManualMode(false);
    setManualTitle('');
    setManualDescription('');
    setManualTaskTypes([]);
    setManualTaskTypeInput('');
  };

  // ======== AI 助手对话 ========
  const handleAIAssistantSend = () => {
    if (!aiAssistantInput.trim() || aiAssistantProcessing) return;
    const userMsg: Message = { id: Date.now(), role: 'user', content: aiAssistantInput, timestamp: new Date() };
    setAiAssistantMessages(prev => [...prev, userMsg]);
    setAiAssistantInput('');
    setAiAssistantProcessing(true);

    setTimeout(() => {
      let response = '根据您当前所处的阶段，我来帮您解答。';
      if (phase === 'card_review') {
        response = '您正在确认AI生成的订单预览卡片。如果对某模块内容不满意，可以点击卡片上的「编辑」按钮进行修改。确认所有模块无误后，点击底部「确认内容」按钮继续。您也可以点击「上一步」回到对话阶段补充更多需求。';
      } else if (phase === 'publish_config') {
        response = '您正在配置订单发布信息：\n\n1. **基本配置**：选择结算模式（直接交易或平台承包转包）并确认预算\n2. **接单设置**：选择订单性质（公开/私密）和接单方式\n3. **时限与超时配置**：设置响应时限和超时后的处理方式\n\n填写完毕后点击「提交审核」即可发布。';
      } else {
        response = '您正在手工创建订单。请填写订单标题、描述和任务类型，完成后可继续填写结构化信息。如有任何疑问，随时向我提问。';
      }
      setAiAssistantMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: response, timestamp: new Date() }]);
      setAiAssistantProcessing(false);
    }, 800);
  };

  const handleOpenAIAssistant = () => {
    // 每次打开时重置消息为初始提示
    setAiAssistantMessages([
      { id: Date.now(), role: 'ai', content: '对当前步骤有任何疑问？AI助手帮你调整。请告诉我您遇到了什么问题。', timestamp: new Date() },
    ]);
    setShowAIAssistant(true);
  };

  const handleCloseAIAssistant = () => {
    setShowAIAssistant(false);
    setAiAssistantInput('');
  };

  // 渲染对话阶段
  const renderDialoguePhase = () => {
    // 手动创建模式
    if (manualMode) {
      return (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#222]">手工创建订单</h2>
              <button onClick={handleExitManualMode} className="text-sm text-[#999] hover:text-[var(--brand)] transition-colors">返回AI对话</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">订单标题 <span className="text-[var(--brand)]">*</span></label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={e => setManualTitle(e.target.value)}
                  placeholder="请输入订单标题"
                  className="w-full px-3 py-2 border border-[#eee] rounded-lg text-sm outline-none focus:border-[var(--brand)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">订单描述</label>
                <textarea
                  value={manualDescription}
                  onChange={e => setManualDescription(e.target.value)}
                  placeholder="请描述订单需求、技术栈、交付要求等"
                  className="w-full h-32 px-3 py-2 border border-[#eee] rounded-lg text-sm outline-none focus:border-[var(--brand)] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">任务类型</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={manualTaskTypeInput}
                    onChange={e => setManualTaskTypeInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddManualTaskType(); } }}
                    placeholder="输入类型后按回车"
                    className="flex-1 px-3 py-2 border border-[#eee] rounded-lg text-sm outline-none focus:border-[var(--brand)]"
                  />
                  <button onClick={handleAddManualTaskType} className="px-4 py-2 bg-[var(--brand)] text-white text-sm rounded-lg hover:opacity-90">添加</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {manualTaskTypes.map(type => (
                    <span key={type} className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--brand)] text-white text-xs rounded-full">
                      {type}
                      <button onClick={() => handleRemoveManualTaskType(type)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-[#999] p-3 bg-[#f5f6fa] rounded-lg">
                结算模式、报价等将在下一步设置
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <button onClick={handleSaveDraft} className="px-8 py-2.5 rounded-full text-sm font-medium text-[var(--brand)] border border-[var(--brand)] hover:bg-[var(--brand-bg)] transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  保存草稿
                </button>
                <button onClick={handleExitManualMode} className="px-8 py-2.5 rounded-full text-sm font-medium text-[var(--text-secondary)] border border-[#eee] hover:bg-[#f5f6fa] transition-colors">
                  取消
                </button>
                <button
                  onClick={handleManualToStructured}
                  disabled={!manualTitle.trim()}
                  className="px-8 py-2.5 rounded-full text-sm font-medium text-white disabled:opacity-50 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))' }}
                >
                  继续填写结构化信息
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // fallback 处理函数
    const switchToDocumentUpload = () => fileInputRef.current?.click();
    const switchToManualForm = () => handleStartManual();
    const continueChat = () => {}; // 仅关闭 fallback，继续对话

    return (
    <div className="flex-1 flex flex-col">

      {/* 消息列表 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'text-white rounded-br-md'
                    : 'bg-[#f5f6fa] text-[#333] rounded-bl-md'
                }`}
                style={msg.role === 'user' ? { background: 'linear-gradient(135deg, var(--brand), var(--brand))' } : {}}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[var(--brand-bg)] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[var(--brand)]" />
                </div>
              )}
            </div>
          ))}

          {/* AI 主动检测：需求完整度达标时显示引导卡片 */}
          {(() => {
            const completeness = detectCompleteness(messages);
            return messages.length > 4 && completeness.score >= 2 && phase === 'dialogue' && (
              <div className="bg-[var(--brand-subtle)] border border-[var(--brand-ring)] rounded-md p-3 my-2">
                <p className="text-[12px] text-[var(--brand)] mb-2">
                  我已了解您的需求（{completeness.hasType ? '类型 ✓' : ''} {completeness.hasBudget ? '预算 ✓' : ''} {completeness.hasDeadline ? '时间 ✓' : ''}），还差 {3 - completeness.score} 个信息
                </p>
                <button onClick={() => setPhase('card_review')} className="text-[12px] text-white bg-[var(--brand)] px-3 py-1.5 rounded">
                  进入卡片确认 →
                </button>
              </div>
            );
          })()}

          {/* AI 失败 fallback：多轮对话仍未收集到足够信息 */}
          {(() => {
            const completeness = detectCompleteness(messages);
            return messages.length > 10 && completeness.score < 2 && phase === 'dialogue' && (
              <div className="bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-lg p-4">
                <p className="text-[13px] text-[var(--warning)] mb-3">
                  看起来您的需求比较复杂，让我换个方式帮您整理：
                </p>
                <div className="flex gap-2">
                  <button onClick={switchToDocumentUpload} className="text-[12px] bg-white border border-[var(--border-default)] px-3 py-1.5 rounded">
                    上传需求文档
                  </button>
                  <button onClick={switchToManualForm} className="text-[12px] bg-white border border-[var(--border-default)] px-3 py-1.5 rounded">
                    改用表单填写
                  </button>
                  <button onClick={continueChat} className="text-[12px] text-[var(--text-tertiary)] px-3 py-1.5">
                    继续对话
                  </button>
                </div>
              </div>
            );
          })()}

          {isProcessing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))' }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-lg bg-[#f5f6fa] rounded-bl-md">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区 */}
      <div className="border-t border-[#eee] p-4">
        <div className="max-w-3xl mx-auto">
          {/* 文件上传中状态 */}
          {isUploading && (
            <div className="mb-3 p-3 bg-[#f8f9ff] border border-[#e8eaff] rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
              <div>
                <div className="text-sm text-[#333] font-medium">{uploadedFileName}</div>
                <div className="text-xs text-[#999]">AI正在解析文档...</div>
              </div>
            </div>
          )}
          {!isUploading && uploadedFileName && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-sm text-[#333] font-medium">{uploadedFileName}</div>
                <div className="text-xs text-green-600">文档已解析，请确认以下内容</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.mdx,.docx,.doc,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex-1 relative">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--brand)] transition-colors"
                title="上传文档（支持 .txt .md .docx .pdf，最大 5MB）"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="描述需求，或上传文档让AI帮您整理..."
                disabled={isProcessing}
                className="w-full pl-10 pr-12 py-2.5 border border-[#eee] rounded-lg text-sm focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand-ring)] disabled:opacity-50 transition-shadow"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white disabled:opacity-30 transition-all hover:scale-105"
                style={{ background: input.trim() ? 'linear-gradient(135deg, var(--brand), var(--brand))' : 'var(--text-disabled)' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2.5 border border-[var(--brand)] text-[var(--brand)] rounded-lg text-sm font-medium hover:bg-[var(--brand-bg)] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Save className="w-4 h-4" />
              保存草稿
            </button>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] text-center max-w-3xl mx-auto">
            AI 将自动分析需求并匹配合适的订单类型
          </p>
          <p className="text-xs text-center mt-1 max-w-3xl mx-auto">
            <button onClick={handleStartManual} className="text-[var(--brand)] hover:underline">偏好表单？切换到手工填写</button>
          </p>
        </div>
      </div>
    </div>
    );
  };

  // 渲染卡片确认阶段
  const renderCardReviewPhase = () => (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-[var(--brand)]" />
          <h2 className="text-lg font-semibold text-[#222]">AI已为您生成订单预览</h2>
        </div>

        {/* 类型标签 */}
        <div className="mb-6 p-4 bg-[#f8f9ff] rounded-md border border-[#e8eaff]">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-[var(--brand)]" />
            <span className="text-sm text-[#666]">AI自动识别的订单类型（可调整）：</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {orderTags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--brand)] text-white text-xs rounded-full">
                {tag}
                <button onClick={() => setOrderTags(prev => prev.filter(t => t !== tag))} className="hover:opacity-70"><X className="w-3 h-3" /></button>
              </span>
            ))}
            <button
              onClick={() => setOrderTags(prev => [...prev, '新增类型'])}
              className="px-3 py-1 border border-dashed border-[var(--brand)] text-[var(--brand)] text-xs rounded-full hover:bg-[var(--brand-bg)]"
            >
              + 添加类型
            </button>
          </div>
        </div>

        {/* 模块卡片 */}
        <div className="space-y-4">
          {cards.map((card) => (
            <div key={card.key} className={`border rounded-md overflow-hidden ${editingCard === card.key ? 'border-[var(--brand)] ring-1 ring-[var(--brand-ring)]' : 'border-[#eee]'}`}>
              <div className="flex items-center justify-between px-5 py-3 bg-[#fafbfc] border-b border-[#eee]">
                <div className="flex items-center gap-2">
                  {editingCard === card.key ? (
                    <span className="w-4 h-4 rounded-full border-2 border-[var(--brand)]" />
                  ) : (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-sm font-medium text-[#333]">{card.title}</span>
                </div>
                {editingCard !== card.key && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRegenerateCard(card.key)}
                      disabled={regeneratingCard === card.key}
                      className="text-xs text-[#7c5cf0] hover:text-[#6a4ce0] disabled:opacity-50 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${regeneratingCard === card.key ? 'animate-spin' : ''}`} />
                      重新生成
                    </button>
                    <button
                      onClick={() => handleStartEdit(card.key, card.content)}
                      className="text-xs text-[var(--brand)] hover:underline"
                    >
                      编辑
                    </button>
                  </div>
                )}
              </div>
              {/* 编辑模式 */}
              {editingCard === card.key ? (
                <div className="p-4 space-y-3">
                  <textarea
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    className="w-full h-40 px-3 py-2.5 border border-[#eee] rounded-lg text-sm leading-relaxed font-mono outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand-ring)] resize-y"
                    placeholder="使用 Markdown 格式编辑内容..."
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-1.5 text-xs text-[var(--text-secondary)] border border-[#eee] rounded-md hover:bg-[#f5f6fa] transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={!editingContent.trim()}
                      className="px-4 py-1.5 text-xs text-white rounded-md disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1.5"
                      style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))' }}
                    >
                      <Save className="w-3 h-3" />
                      保存修改
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 text-sm text-[#555] leading-relaxed prose prose-sm max-w-none
                  [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-[#222] [&_h1]:mt-4 [&_h1]:mb-2
                  [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:text-[#333] [&_h2]:mt-3 [&_h2]:mb-1.5
                  [&_h3]:text-[14px] [&_h3]:font-medium [&_h3]:text-[#444] [&_h3]:mt-2 [&_h3]:mb-1
                  [&_p]:my-1.5 [&_p]:text-[#555]
                  [&_strong]:font-semibold [&_strong]:text-[#333]
                  [&_ul]:my-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-0.5
                  [&_ol]:my-1.5 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-0.5
                  [&_li]:text-[#555]
                  [&_code]:px-1 [&_code]:py-0.5 [&_code]:bg-[#f5f6fa] [&_code]:text-[#7c5cf0] [&_code]:rounded [&_code]:text-[12px]
                  [&_pre]:bg-[#f5f6fa] [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:text-[12px] [&_pre]:overflow-x-auto [&_pre]:my-2
                  [&_hr]:my-3 [&_hr]:border-[#eee]
                  [&_em]:text-[#888]
                  [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--brand)] [&_blockquote]:pl-3 [&_blockquote]:my-2 [&_blockquote]:text-[#666] [&_blockquote]:italic
                ">
                  <ReactMarkdown>{card.content}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={handleBackToDialogue}
            className="px-8 py-2.5 rounded-full text-sm font-medium text-[var(--text-secondary)] border border-[#eee] transition-colors hover:bg-[#f5f6fa]"
          >
            上一步
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-6 py-2.5 rounded-full text-sm font-medium text-[var(--brand)] border border-[var(--brand)] transition-colors hover:bg-[var(--brand-bg)] flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            保存草稿
          </button>
          <button
            onClick={handleCardsConfirmed}
            className="px-8 py-2.5 rounded-full text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))', boxShadow: '0 4px 14px rgba(82,96,240,0.35)' }}
          >
            确认内容，继续填写结构化信息
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染发布配置阶段（合并原结构化字段 + 接单配置）
  const renderPublishConfigPhase = () => (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-[#222] mb-6">发布配置</h2>
        <div className="space-y-6">
          {/* ═══ 基本配置 ═══ */}
          <div>
            <div className="text-xs font-medium text-[var(--text-tertiary)] mb-3 uppercase tracking-wide">基本配置</div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">结算模式 <span className="text-[var(--brand)]">*</span></label>
                <div className={`space-y-2 ${structuredErrors.settlementMode ? 'p-2 border border-red-300 rounded-lg bg-red-50' : ''}`}>
                  {[
                    { value: 'direct_transaction', title: '直接交易', desc: '您与接单方直接交易，线下自行结算。里程碑和结算由您定义，平台提供流程监管。' },
                    { value: 'platform_contract', title: '平台承包转包', desc: '提交后由平台评估是否承接。承接后平台转包给用户，运营方定义里程碑和结算。' },
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${settlementMode === opt.value ? 'border-[var(--brand)] bg-[var(--brand-bg)]' : 'border-[#eee] bg-white'}`}>
                      <input type="radio" name="settlement" value={opt.value} checked={settlementMode === opt.value} onChange={(e) => { setSettlementMode(e.target.value as any); setStructuredErrors(prev => { const n = { ...prev }; delete n.settlementMode; return n; }); }} className="mt-0.5" />
                      <div><div className="text-sm font-medium text-[#222]">{opt.title}</div><div className="text-xs text-[#888] mt-0.5">{opt.desc}</div></div>
                    </label>
                  ))}
                </div>
                {structuredErrors.settlementMode && <p className="text-xs text-[#e74c3c] mt-1">{structuredErrors.settlementMode}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">订单预算 <span className="text-[var(--brand)]">*</span></label>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-[#fafbfc]" style={{ borderColor: structuredErrors.budget ? '#e74c3c' : 'var(--border-default)' }}>
                  <span className="text-sm text-[var(--text-tertiary)]">¥</span>
                  <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="AI已从需求中解析，可手动修改" className="flex-1 outline-none text-sm bg-transparent" min="0" />
                </div>
                {structuredErrors.budget && <p className="text-xs text-[#e74c3c] mt-1">{structuredErrors.budget}</p>}
                <p className="text-xs text-[var(--text-tertiary)] mt-1">AI 已根据您描述的需求预填了预算金额，如需调整可直接修改</p>
              </div>
            </div>
          </div>

          {/* ═══ 接单设置 ═══ */}
          <div className="border-t border-[#eee] pt-5">
            <div className="text-xs font-medium text-[var(--text-tertiary)] mb-3 uppercase tracking-wide">接单设置</div>
            <label className="block text-sm font-medium text-[#333] mb-3">订单性质</label>
            <div className="flex gap-3">
              {[{ value: 'public', title: '公开订单', desc: '在订单广场展示' }, { value: 'private', title: '私密订单', desc: '不在广场公开' }].map(opt => (
                <label key={opt.value} className={`flex-1 flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${orderNature === opt.value ? 'border-[var(--brand)] bg-[var(--brand-bg)]' : 'border-[#eee]'}`}>
                  <input type="radio" name="nature" value={opt.value} checked={orderNature === opt.value} onChange={e => setOrderNature(e.target.value as any)} />
                  <div><div className="text-sm font-medium">{opt.title}</div><div className="text-xs text-[#888]">{opt.desc}</div></div>
                </label>
              ))}
            </div>
          </div>

          {orderNature === 'public' && (
            <div>
              <label className="block text-sm font-medium text-[#333] mb-3">接单方式</label>
              <div className="space-y-2">
                {[
                  { value: 'recommended_push', title: '推荐 + 推送', desc: '从AI匹配的优质用户中勾选，也可手动搜索添加用户一并推送', icon: Sparkles, highlight: true },
                  { value: 'open_bidding', title: '公开抢单', desc: '在订单广场展示，供用户报名' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer ${acceptMode === opt.value ? (opt.highlight ? 'border-[#7c5cf0] bg-[#f8f6ff]' : 'border-[var(--brand)] bg-[var(--brand-bg)]') : 'border-[#eee]'}`}>
                    <input type="radio" name="accept" value={opt.value} checked={acceptMode === opt.value} onChange={e => setAcceptMode(e.target.value as any)} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#222]">{opt.title}</span>
                        {opt.highlight && <span className="px-1.5 py-0.5 bg-[#7c5cf0] text-white text-xs rounded">推荐</span>}
                      </div>
                      <div className="text-xs text-[#888] mt-0.5">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* 推荐推送：AI匹配用户列表 + 手动搜索添加 */}
              {acceptMode === 'recommended_push' && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-[#f8f9ff] rounded-md border border-[#e8eaff]">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-[#7c5cf0]" />
                      <span className="text-sm font-medium text-[#333]">AI 匹配的优质用户</span>
                      <span className="text-xs text-[var(--text-tertiary)]">基于订单标签智能匹配</span>
                    </div>
                    <div className="space-y-2">
                      {MOCK_RECOMMENDED_USERS.map(user => (
                        <label key={user.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${selectedUsers.includes(user.id) ? 'bg-[var(--brand-bg)] border border-[var(--brand)]' : 'bg-white border border-[#eee]'}`}>
                          <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => setSelectedUsers(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])} className="w-4 h-4" />
                          <div className="flex-1"><div className="flex items-center gap-2"><span className="text-sm font-medium">{user.name}</span><span className="text-xs text-[var(--brand)]">信用 {user.creditScore}</span></div><div className="flex gap-1 mt-1">{user.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-[var(--border-subtle)] text-[#888] text-xs rounded">{t}</span>)}<span className="text-xs text-[var(--text-tertiary)]">{user.deliveryRate}</span></div></div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-md border border-dashed border-[var(--bg-subtle)]">
                    <div className="flex items-center gap-2 mb-2"><span className="text-sm text-[#666]">搜索并添加指定用户</span><span className="text-xs text-[var(--text-tertiary)]">如您已有中意的接单方</span></div>
                    <div className="flex gap-2">
                      <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSearchActive(false); }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchUser(); } }} placeholder="输入用户名搜索..." className="flex-1 px-3 py-2 border border-[#eee] rounded-lg text-sm outline-none focus:border-[var(--brand)]" />
                      <button onClick={handleSearchUser} className="px-4 py-2 bg-[var(--brand)] text-white text-sm rounded-lg hover:opacity-90 flex items-center gap-1"><Search className="w-3.5 h-3.5" />搜索</button>
                    </div>
                    {searchActive && searchResults.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs text-[var(--text-tertiary)]">找到 {searchResults.length} 个匹配用户：</div>
                        {searchResults.map(user => (
                          <div key={user.id} className="flex items-center justify-between p-2.5 bg-[#f8f9ff] rounded-lg border border-[#e8eaff]">
                            <div className="flex-1"><div className="flex items-center gap-2"><span className="text-sm font-medium">{user.name}</span><span className="text-xs text-[var(--brand)]">信用 {user.creditScore}</span></div><div className="flex gap-1 mt-1">{user.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-[var(--border-subtle)] text-[#888] text-xs rounded">{t}</span>)}<span className="text-xs text-[var(--text-tertiary)]">{user.deliveryRate}</span></div></div>
                            <button onClick={() => handleAddPushedUser(user)} className="px-3 py-1.5 bg-[var(--brand)] text-white text-xs rounded-md hover:opacity-90 flex items-center gap-1"><Plus className="w-3 h-3" />添加</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {pushedUsers.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-[var(--brand)]" /><span className="text-sm font-medium text-[#333]">待推送用户</span><span className="text-xs text-[var(--text-tertiary)]">({pushedUsers.length}人)</span></div>
                        <div className="space-y-1.5">
                          {pushedUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between px-3 py-2 bg-[var(--brand-bg)] rounded-lg border border-[#e8eaff]"><div className="flex-1"><div className="flex items-center gap-2"><span className="text-sm text-[#333]">{user.name}</span><span className="text-xs text-[var(--brand)]">信用 {user.creditScore}</span></div><div className="flex gap-1 mt-1">{user.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-[var(--border-subtle)] text-[#888] text-xs rounded">{t}</span>)}</div></div><button onClick={() => handleRemovePushedUser(user.id)} className="text-[#999] hover:text-[#e74c3c] transition-colors shrink-0 ml-2"><X className="w-3.5 h-3.5" /></button></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {orderNature === 'private' && (
            <div>
              <label className="block text-sm font-medium text-[#333] mb-3">接单方式</label>
              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer ${acceptMode === 'assigned_contractor' ? 'border-[var(--brand)] bg-[var(--brand-bg)]' : 'border-[#eee]'}`}>
                  <input type="radio" name="acceptPriv" value="assigned_contractor" checked={acceptMode === 'assigned_contractor'} onChange={e => setAcceptMode(e.target.value as any)} />
                  <div><div className="text-sm font-medium text-[#222]">指定接单方</div><div className="text-xs text-[#888] mt-0.5">搜索平台用户，直接指派订单</div></div>
                </label>
              </div>
              {acceptMode === 'assigned_contractor' && (
                <div className="mt-4 p-4 bg-white rounded-md border border-dashed border-[var(--bg-subtle)]">
                  <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-[var(--brand)]" /><span className="text-sm font-medium text-[#333]">搜索指派用户</span></div>
                  <div className="flex gap-2">
                    <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSearchActive(false); }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchUser(); } }} placeholder="输入用户名或技能关键词搜索..." className="flex-1 px-3 py-2 border border-[#eee] rounded-lg text-sm outline-none focus:border-[var(--brand)]" />
                    <button onClick={handleSearchUser} className="px-4 py-2 bg-[var(--brand)] text-white text-sm rounded-lg hover:opacity-90 flex items-center gap-1"><Search className="w-3.5 h-3.5" />搜索</button>
                  </div>
                  {searchActive && searchResults.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {searchResults.map(user => (
                        <div key={user.id} className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer border ${selectedUsers.includes(user.id) ? 'bg-[var(--brand-bg)] border-[var(--brand)]' : 'bg-[#fafbfc] border-[#eee] hover:border-[var(--brand)]'}`} onClick={() => setSelectedUsers(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])}>
                          <div className="flex-1"><div className="flex items-center gap-2"><span className="text-sm font-medium text-[#333]">{user.name}</span><span className="text-xs text-[var(--brand)]">信用 {user.creditScore}</span><span className="text-xs text-[var(--text-tertiary)]">准时率 {user.deliveryRate}</span></div><div className="flex gap-1 mt-1">{user.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-[var(--border-subtle)] text-[#888] text-xs rounded">{t}</span>)}</div></div>
                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2" style={{ borderColor: selectedUsers.includes(user.id) ? 'var(--brand)' : '#ccc', backgroundColor: selectedUsers.includes(user.id) ? 'var(--brand)' : 'transparent' }}>{selectedUsers.includes(user.id) && <Check className="w-3 h-3 text-white" />}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 时限与超时配置 — 指定接单方 */}
          {acceptMode === 'assigned_contractor' && (
            <div className="border-t border-[#eee] pt-5 mt-5">
              <h3 className="text-base font-semibold text-[#222] mb-4">时限与超时配置</h3>
              <div className="p-4 bg-[#fafbfc] rounded-lg border border-[#eee] space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">响应时限</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_PRESETS.map(preset => (
                      <button
                        key={preset.value}
                        onClick={() => setResponseTimeout(preset.value)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${responseTimeout === preset.value ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'bg-white text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--brand)] hover:text-[var(--brand)]'}`}
                        title={preset.desc}
                      >
                        {preset.label}
                        {preset.default && <span className="ml-0.5 opacity-60">·推荐</span>}
                      </button>
                    ))}
                  </div>
                  {responseTimeout === 'custom' && (
                    <div className="mt-2 flex items-center gap-2">
                      <input type="number" min="1" placeholder="输入天数" className="w-24 px-3 py-2 border border-[#eee] rounded-lg text-sm outline-none focus:border-[var(--brand)]" />
                      <span className="text-sm text-[var(--text-tertiary)]">天</span>
                    </div>
                  )}
                  <p className="text-xs text-[var(--text-tertiary)] mt-1.5">指定接单方须在此时间内确认接单或拒绝</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666] mb-2">超时行为</label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { value: 'auto_cancel', label: '自动取消订单' },
                      { value: 'convert_to_public', label: '自动转为公开抢单' },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="responseTimeoutAction" value={opt.value} checked={responseTimeoutAction === opt.value} onChange={e => setResponseTimeoutAction(e.target.value)} className="w-4 h-4" />
                        <span className="text-sm text-[#555]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 时限与超时配置 — 公开抢单 */}
          {acceptMode === 'open_bidding' && (
            <div className="border-t border-[#eee] pt-5 mt-5">
              <h3 className="text-base font-semibold text-[#222] mb-4">时限与超时配置</h3>
              <div className="p-4 bg-[#fafbfc] rounded-lg border border-[#eee] space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">招标时限</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_PRESETS.map(preset => (
                      <button
                        key={preset.value}
                        onClick={() => setBidTimeout(preset.value)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${bidTimeout === preset.value ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'bg-white text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--brand)] hover:text-[var(--brand)]'}`}
                        title={preset.desc}
                      >
                        {preset.label}
                        {preset.default && <span className="ml-0.5 opacity-60">·推荐</span>}
                      </button>
                    ))}
                  </div>
                  {bidTimeout === 'custom' && (
                    <div className="mt-2 flex items-center gap-2">
                      <input type="number" min="1" placeholder="输入天数" className="w-24 px-3 py-2 border border-[#eee] rounded-lg text-sm outline-none focus:border-[var(--brand)]" />
                      <span className="text-sm text-[var(--text-tertiary)]">天</span>
                    </div>
                  )}
                  <p className="text-xs text-[var(--text-tertiary)] mt-1.5">公开抢单在此时间内接受用户报名</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666] mb-2">超时行为</label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { value: 'auto_delist', label: '自动截止，不再接受报名' },
                      { value: 'auto_hide', label: '自动隐藏（广场不再展示）' },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="bidTimeoutAction" value={opt.value} checked={bidTimeoutAction === opt.value} onChange={e => setBidTimeoutAction(e.target.value)} className="w-4 h-4" />
                        <span className="text-sm text-[#555]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 时限与超时配置 — 推荐推送 */}
          {acceptMode === 'recommended_push' && (
            <div className="border-t border-[#eee] pt-5 mt-5">
              <h3 className="text-base font-semibold text-[#222] mb-4">时限与超时配置</h3>
              <div className="p-4 bg-[#fafbfc] rounded-lg border border-[#eee] space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">推送时限</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_PRESETS.map(preset => (
                      <button
                        key={preset.value}
                        onClick={() => setPushTimeout(preset.value)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${pushTimeout === preset.value ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'bg-white text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--brand)] hover:text-[var(--brand)]'}`}
                        title={preset.desc}
                      >
                        {preset.label}
                        {preset.default && <span className="ml-0.5 opacity-60">·推荐</span>}
                      </button>
                    ))}
                  </div>
                  {pushTimeout === 'custom' && (
                    <div className="mt-2 flex items-center gap-2">
                      <input type="number" min="1" placeholder="输入天数" className="w-24 px-3 py-2 border border-[#eee] rounded-lg text-sm outline-none focus:border-[var(--brand)]" />
                      <span className="text-sm text-[var(--text-tertiary)]">天</span>
                    </div>
                  )}
                  <p className="text-xs text-[var(--text-tertiary)] mt-1.5">推荐推送在此时间内有效</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666] mb-2">超时行为</label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { value: 'convert_to_public', label: '自动转为公开抢单' },
                      { value: 'auto_cancel', label: '自动取消推送' },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="pushTimeoutAction" value={opt.value} checked={pushTimeoutAction === opt.value} onChange={e => setPushTimeoutAction(e.target.value)} className="w-4 h-4" />
                        <span className="text-sm text-[#555]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-8">
            <button onClick={handleBackToCardReview} className="px-8 py-2.5 rounded-full text-sm font-medium text-[var(--text-secondary)] border border-[#eee] transition-colors hover:bg-[#f5f6fa]">
              上一步
            </button>
            <button
              onClick={handleSaveDraft}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-[var(--brand)] border border-[var(--brand)] transition-colors hover:bg-[var(--brand-bg)] flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              保存草稿
            </button>
            <button onClick={handlePublishConfigConfirmed} className="px-8 py-2.5 rounded-full text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))', boxShadow: '0 4px 14px rgba(82,96,240,0.35)' }}>
              提交审核
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* 顶部栏 */}
      <div className="border-b border-[#eee] px-8 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-[#666] hover:text-[var(--brand)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回订单广场</span>
          </button>
          <div className="w-px h-6 bg-[#eee]" />
          <h1 className="text-lg font-semibold text-[#222]">发布订单</h1>
          <div className="flex items-center gap-1.5 ml-auto">
            {['dialogue', 'card_review', 'publish_config'].map((p, i) => (
              <div key={p} className={`w-2 h-2 rounded-full transition-all ${phase === p ? 'w-5 bg-[var(--brand)]' : 'bg-[#ddd]'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* 草稿恢复横幅 */}
      {showDraftRestore && (
        <div className="px-8 py-3 bg-[#f8f9ff] border-b border-[#e8eaff]">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--brand)]" />
              <div>
                <span className="text-sm text-[#333] font-medium">检测到未完成的草稿</span>
                <span className="text-xs text-[#999] ml-2">该草稿7天内有效</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDismissDraft}
                className="px-4 py-1.5 text-sm text-[#999] border border-[#eee] rounded-md hover:bg-[#f5f6fa] transition-colors"
              >
                忽略
              </button>
              <button
                onClick={handleRestoreDraft}
                className="px-4 py-1.5 text-sm text-white rounded-md transition-colors hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))' }}
              >
                恢复草稿
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 草稿保存提示 Toast */}
      {draftToast && (
        <div className="fixed top-20 right-8 z-50 px-5 py-3 bg-white rounded-lg border border-[#e8eaff] shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm text-[#333]">{draftToast}</span>
          </div>
        </div>
      )}

      {/* 通用操作提示 Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 px-5 py-3 bg-white rounded-lg border border-[#e8eaff] shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7c5cf0]" />
            <span className="text-sm text-[#333]">{toastMsg}</span>
          </div>
        </div>
      )}

      {/* 阶段内容 */}
      {phase === 'dialogue' && renderDialoguePhase()}
      {phase === 'card_review' && renderCardReviewPhase()}
      {phase === 'publish_config' && renderPublishConfigPhase()}

      {/* AI 助手全局注入点：浮动按钮 + 侧边对话面板 */}
      {(phase === 'card_review' || phase === 'publish_config' || (phase === 'dialogue' && manualMode)) && (
        <>
          {/* 浮动按钮（收起状态） */}
          {!showAIAssistant && (
            <button
              onClick={handleOpenAIAssistant}
              className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))', boxShadow: '0 4px 20px rgba(82,96,240,0.45)' }}
              title="AI 助手"
            >
              <Bot className="w-6 h-6 text-white" />
            </button>
          )}

          {/* 侧边对话面板（展开状态） */}
          {showAIAssistant && (
            <div className="fixed right-0 top-0 bottom-0 z-50 w-[380px] bg-white border-l border-[#eee] shadow-xl flex flex-col animate-fade-in">
              {/* 面板头部 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#eee] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))' }}>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-[#222]">AI 助手</span>
                </div>
                <button
                  onClick={handleCloseAIAssistant}
                  className="p-1.5 rounded-md text-[#999] hover:text-[#333] hover:bg-[#f5f6fa] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 消息列表 */}
              <div className="flex-1 overflow-auto px-4 py-4">
                <div className="space-y-3">
                  {aiAssistantMessages.map(msg => (
                    <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role !== 'user' && (
                        <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))' }}>
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-3.5 py-2.5 rounded-lg text-xs leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'text-white rounded-br-sm'
                            : 'bg-[#f5f6fa] text-[#333] rounded-bl-sm'
                        }`}
                        style={msg.role === 'user' ? { background: 'linear-gradient(135deg, var(--brand), var(--brand))' } : {}}
                      >
                        {msg.content}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-[var(--brand-bg)] flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3 h-3 text-[var(--brand)]" />
                        </div>
                      )}
                    </div>
                  ))}
                  {aiAssistantProcessing && (
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand))' }}>
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="px-3.5 py-2.5 rounded-lg bg-[#f5f6fa] rounded-bl-sm">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={aiAssistantEndRef} />
                </div>
              </div>

              {/* 输入区 */}
              <div className="border-t border-[#eee] p-4 shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={aiAssistantInput}
                    onChange={e => setAiAssistantInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAIAssistantSend()}
                    placeholder="输入问题..."
                    disabled={aiAssistantProcessing}
                    className="flex-1 px-3 py-2 border border-[#eee] rounded-lg text-xs outline-none focus:border-[var(--brand)] disabled:opacity-50"
                  />
                  <button
                    onClick={handleAIAssistantSend}
                    disabled={!aiAssistantInput.trim() || aiAssistantProcessing}
                    className="p-2 rounded-lg text-white disabled:opacity-30 transition-opacity shrink-0"
                    style={{ background: aiAssistantInput.trim() ? 'linear-gradient(135deg, var(--brand), var(--brand))' : 'var(--bg-subtle)' }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
