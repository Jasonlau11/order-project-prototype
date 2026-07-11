import { X, Upload, FileText, AlertCircle, CheckCircle2, Sparkles, FileStack, Loader2, Download, Edit3 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface UploadAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderTitle: string;
  orderBudgetMin?: number;
  orderBudgetMax?: number;
  orderTaskType?: string;
  orderDescription?: string;
  contractorName?: string;
  customerName?: string;
  onSubmit: (orderId: number, file: File) => void;
}

type AgreementMethod = 'ai' | 'template' | 'upload';

// 模拟协议模板数据
const mockTemplates = [
  {
    id: 1,
    name: '软件开发项目三方协议模板',
    description: '适用于软件开发、系统集成等IT类项目',
    category: '软件开发'
  },
  {
    id: 2,
    name: '设计服务三方协议模板',
    description: '适用于平面设计、UI设计、品牌设计等创意服务',
    category: '平面设计'
  },
  {
    id: 3,
    name: '视频制作三方协议模板',
    description: '适用于视频拍摄、剪辑、后期制作等视频服务',
    category: '视频创作'
  },
  {
    id: 4,
    name: '内容创作三方协议模板',
    description: '适用于文案撰写、文章创作、翻译等文本服务',
    category: '文本创作'
  },
  {
    id: 5,
    name: '营销推广三方协议模板',
    description: '适用于市场推广、运营策划、广告投放等营销服务',
    category: '营销推广'
  },
  {
    id: 6,
    name: '产品评测三方协议模板',
    description: '适用于产品测试、评测报告、用户调研等评测服务',
    category: '产品评测'
  },
  {
    id: 7,
    name: '硬件项目三方协议模板',
    description: '适用于硬件设计、原型制作、设备采购等硬件服务',
    category: '硬件订单'
  },
  {
    id: 8,
    name: '通用服务三方协议模板',
    description: '适用于其他类型的服务项目',
    category: '通用'
  }
];

export function UploadAgreementModal({
  isOpen,
  onClose,
  orderId,
  orderTitle,
  orderBudgetMin = 10000,
  orderBudgetMax = 20000,
  orderTaskType = '软件开发',
  orderDescription = '开发企业内部管理系统',
  contractorName = '接单方名称',
  customerName = '客户企业名称',
  onSubmit
}: UploadAgreementModalProps) {
  const [method, setMethod] = useState<AgreementMethod>('ai');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI生成相关状态
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiContent, setAiContent] = useState('');
  
  // AI生成表单 - 自动填充订单信息,但允许修改
  const [projectDescription, setProjectDescription] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');

  // 模板生成相关状态
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [templateGenerating, setTemplateGenerating] = useState(false);
  const [templateGenerated, setTemplateGenerated] = useState(false);
  const [templateContent, setTemplateContent] = useState('');

  // 自动填充订单信息到AI生成表单
  useEffect(() => {
    if (isOpen && method === 'ai' && !projectDescription) {
      setProjectDescription(orderDescription || '');
      setProjectScope(`本项目为${orderTaskType}类订单，具体范围包括：\n1. 需求分析与方案设计\n2. 功能开发与实现\n3. 测试与优化\n4. 文档交付`);
      setDeliverables(`根据订单要求，本项目需交付以下成果：\n1. 完整的${orderTaskType}成果\n2. 相关技术文档\n3. 培训与支持服务（如需要）`);
      setPaymentTerms(`项目总金额为人民币 ${orderBudgetMin} - ${orderBudgetMax} 元，具体金额以最终协商为准。\n支付方式：按里程碑分期支付\n- 签约时支付 30%\n- 中期验收支付 40%\n- 最终验收支付 30%`);
    }
  }, [isOpen, method, projectDescription, orderTaskType, orderDescription, orderBudgetMin, orderBudgetMax]);

  if (!isOpen) return null;

  // 支持的文件类型
  const acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const acceptedExtensions = ['.pdf', '.doc', '.docx'];

  // 验证文件
  const validateFile = (file: File): boolean => {
    // 检查文件类型
    if (!acceptedTypes.includes(file.type) && !acceptedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setError('仅支持 PDF、Word 格式文件');
      return false;
    }

    // 检查文件大小（最大20MB）
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('文件大小不能超过 20MB');
      return false;
    }

    setError('');
    return true;
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  // 处理拖拽
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  // AI生成协议
  const handleAiGenerate = async () => {
    if (!projectDescription || !projectScope || !deliverables || !paymentTerms) {
      setError('请填写所有必填项');
      return;
    }

    setAiGenerating(true);
    setError('');

    // 模拟AI生成（实际应调用后端API）
    setTimeout(() => {
      const generatedContent = `三方服务协议

甲方（客户）：${customerName}
乙方（接单方）：${contractorName}
丙方（平台）：CSDN

订单编号：${orderId}
订单标题：${orderTitle}
任务类型：${orderTaskType}

一、项目概述
${projectDescription}

二、项目范围
${projectScope}

三、交付物
${deliverables}

四、付款条款
${paymentTerms}

五、知识产权
1. 乙方交付的所有成果物的知识产权归甲方所有。
2. 乙方保证交付物不侵犯任何第三方的知识产权。
3. 甲方有权对交付物进行修改、使用、复制和分发。

六、保密条款
1. 三方应对在项目执行过程中知悉的对方商业秘密、技术信息等保密信息严格保密。
2. 未经对方书面同意，不得向第三方披露、使用或允许第三方使用保密信息。
3. 保密义务在本协议终止后仍继续有效。

七、违约责任
1. 若乙方未按时交付或交付物不符合约定，应承担违约责任。
2. 若甲方未按约定支付款项，应承担违约责任。
3. 丙方作为平台方，负责监督协议执行，协调三方纠纷。

八、争议解决
本协议履行过程中发生的争议，由三方友好协商解决；协商不成的，提交丙方所在地人民法院诉讼解决。

九、其他
1. 本协议自三方签字盖章之日起生效。
2. 本协议一式三份，甲乙丙三方各执一份，具有同等法律效力。

甲方（盖章）：________________    日期：____________
法定代表人/授权代表签字：________________

乙方（盖章）：________________    日期：____________
法定代表人/授权代表签字：________________

丙方（盖章）：CSDN            日期：____________
授权代表签字：________________

【本协议由 CSDN 平台 AI 智能生成，请在本地确认后签署并上传】`;

      setAiContent(generatedContent);
      setAiGenerated(true);
      setAiGenerating(false);
    }, 2000);
  };

  // 基于模板生成协议
  const handleTemplateGenerate = () => {
    if (!selectedTemplate) {
      setError('请选择一个协议模板');
      return;
    }

    setTemplateGenerating(true);
    setError('');

    const template = mockTemplates.find(t => t.id === selectedTemplate);

    // 模拟模板生成（实际应调用后端API）
    setTimeout(() => {
      const generatedContent = `${template?.name}

甲方（客户）：${customerName}
乙方（接单方）：${contractorName}
丙方（平台）：CSDN

订单编号：${orderId}
订单标题：${orderTitle}
服务类别：${template?.category}

【本协议基于平台标准模板生成，以下条款由运营方审核并维护】

一、服务内容
甲方委托乙方提供${template?.category}相关服务，具体服务内容详见订单详情。
订单描述：${orderDescription}

二、服务标准
1. 乙方应按照订单约定的质量标准完成服务。
2. 乙方应在约定的时间节点提交交付物。
3. 乙方提交的交付物应符合行业标准和甲方要求。

三、项目周期
本项目自协议生效之日起开始执行，具体里程碑节点详见订单里程碑设置。

四、费用与支付
1. 本项目费用区间为人民币 ${orderBudgetMin.toLocaleString()} - ${orderBudgetMax.toLocaleString()} 元（详见订单报价）。
2. 支付方式按订单约定的里程碑分期支付。
3. 甲方应在里程碑验收通过后 5 个工作日内支付对应款项。

五、交付与验收
1. 乙方应按里程碑节点要求提交交付物。
2. 甲方应在收到交付物后 3 个工作日内完成验收。
3. 验收不通过的，乙方应在 5 个工作日内修改完善。

六、知识产权
1. 乙方交付的所有成果物的知识产权归甲方所有。
2. 乙方保证交付物不侵犯任何第三方的知识产权。
3. 如因知识产权纠纷给甲方造成损失的，乙方应承担全部赔偿责任。

七、保密义务
1. 三方对在合作过程中知悉的对方商业秘密、技术信息等负有保密义务。
2. 未经对方书面同意，不得向任何第三方披露保密信息。
3. 本保密义务在协议终止后仍继续有效，期限为 3 年。

八、违约责任
1. 任何一方违反本协议约定，应承担违约责任。
2. 因乙方原因导致项目延期的，乙方应支付违约金。
3. 因甲方原因导致项目无法继续的，甲方应补偿乙方已完成工作的费用。

九、丙方权利义务
1. 丙方作为平台方，提供交易撮合、资金托管等服务。
2. 丙方有权按平台规则收取服务费。
3. 丙方负责监督协议执行，协调处理三方纠纷。

十、协议变更与解除
1. 本协议的任何变更须经三方协商一致并以书面形式确认。
2. 协议解除须经三方协商一致，或依法定事由解除。

十一、争议解决
本协议履行过程中发生的争议，应友好协商解决；协商不成的，任何一方均可向丙方所在地有管辖权的人民法院提起诉讼。

十二、生效与终止
1. 本协议自三方签字盖章之日起生效。
2. 本协议在项目完成并结算完毕后终止。
3. 本协议一式三份，甲乙丙三方各执一份，具有同等法律效力。

甲方（盖章）：________________    日期：____________
法定代表人/授权代表签字：________________

乙方（盖章）：________________    日期：____________
法定代表人/授权代表签字：________________

丙方（盖章）：CSDN            日期：____________
授权代表签字：________________

【本协议基于 CSDN 平台${template?.name}生成，请下载后确认签署并上传】`;

      setTemplateContent(generatedContent);
      setTemplateGenerated(true);
      setTemplateGenerating(false);
    }, 1500);
  };

  // 下载生成的协议
  const handleDownloadGenerated = (content: string, type: 'ai' | 'template') => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `三方协议_${type === 'ai' ? 'AI生成' : '模板生成'}_订单${orderId}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('协议已下载！\n\n请在本地确认并完成以下步骤：\n1. 查看协议内容，确认无误\n2. 如需修改，可在本地编辑\n3. 与接单方线下完成签署（签字盖章）\n4. 将签署完成的协议扫描或拍照后上传至平台\n\n完成上传后，协议将进入确认和审核流程。');
  };

  // 提交
  const handleSubmit = () => {
    if (!selectedFile) {
      setError('请先上传协议文件');
      return;
    }

    onSubmit(orderId, selectedFile);
    handleClose();
  };

  // 关闭
  const handleClose = () => {
    setMethod('ai');
    setSelectedFile(null);
    setError('');
    setDragActive(false);
    setAiGenerating(false);
    setAiGenerated(false);
    setAiContent('');
    setProjectDescription('');
    setProjectScope('');
    setDeliverables('');
    setPaymentTerms('');
    setSelectedTemplate(null);
    setTemplateGenerating(false);
    setTemplateGenerated(false);
    setTemplateContent('');
    onClose();
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* 弹窗标题 */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">上传/生成三方协议</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">订单：{orderTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* 方式选择标签 */}
        <div className="border-b border-[var(--border-subtle)] px-8 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMethod('ai')}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-all ${
                method === 'ai'
                  ? 'bg-white text-[var(--brand)] border-l border-r border-t border-[var(--border-subtle)]'
                  : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>AI 智能生成</span>
            </button>
            <button
              onClick={() => setMethod('template')}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-all ${
                method === 'template'
                  ? 'bg-white text-[var(--brand)] border-l border-r border-t border-[var(--border-subtle)]'
                  : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              <FileStack className="w-5 h-5" />
              <span>模板生成</span>
            </button>
            <button
              onClick={() => setMethod('upload')}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-all ${
                method === 'upload'
                  ? 'bg-white text-[var(--brand)] border-l border-r border-t border-[var(--border-subtle)]'
                  : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>上传已签署协议</span>
            </button>
          </div>
        </div>

        {/* 表单内容 */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="space-y-6">
            {/* 提示信息 */}
            <div className="bg-[var(--brand-subtle)] border-l-4 border-[var(--brand)] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--brand)] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-[var(--text-secondary)]">
                  <p className="font-medium text-[var(--text-primary)] mb-2">重要说明：</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>AI生成和模板生成仅提供协议文本的生成与预览能力</li>
                    <li>客户需先下载生成的协议，在本地确认无误后签署（签字盖章）</li>
                    <li>签署完成后，通过"上传已签署协议"功能上传到平台</li>
                    <li>上传后需接单方确认且平台审核通过，订单才能进入交付阶段</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AI 生成协议 */}
            {method === 'ai' && (
              <div className="space-y-4">
                <div className="bg-[#f0f9ff] border border-[#91d5ff] rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-[#1890ff] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0050b3] mb-1">
                        AI 智能生成协议
                      </p>
                      <p className="text-xs text-[#0050b3]">
                        系统已自动填充订单信息，您可以修改或补充内容后生成协议预览
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2">
                    项目描述 <span className="text-[var(--brand)]">*</span>
                    <Edit3 className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <span className="text-xs text-[var(--text-tertiary)]">（可修改）</span>
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="请简要描述项目背景、目标和需求..."
                    className="w-full h-24 px-4 py-3 border border-[var(--border-subtle)] rounded-lg resize-none focus:outline-none focus:border-[var(--brand)] text-sm"
                    disabled={aiGenerated}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2">
                    项目范围 <span className="text-[var(--brand)]">*</span>
                    <Edit3 className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <span className="text-xs text-[var(--text-tertiary)]">（可修改）</span>
                  </label>
                  <textarea
                    value={projectScope}
                    onChange={(e) => setProjectScope(e.target.value)}
                    placeholder="请明确项目包含的工作内容和范围边界..."
                    className="w-full h-24 px-4 py-3 border border-[var(--border-subtle)] rounded-lg resize-none focus:outline-none focus:border-[var(--brand)] text-sm"
                    disabled={aiGenerated}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2">
                    交付物 <span className="text-[var(--brand)]">*</span>
                    <Edit3 className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <span className="text-xs text-[var(--text-tertiary)]">（可修改）</span>
                  </label>
                  <textarea
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    placeholder="请列出项目最终需要交付的成果物..."
                    className="w-full h-24 px-4 py-3 border border-[var(--border-subtle)] rounded-lg resize-none focus:outline-none focus:border-[var(--brand)] text-sm"
                    disabled={aiGenerated}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2">
                    付款条款 <span className="text-[var(--brand)]">*</span>
                    <Edit3 className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <span className="text-xs text-[var(--text-tertiary)]">（可修改）</span>
                  </label>
                  <textarea
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="请说明付款方式、付款节点和付款比例..."
                    className="w-full h-24 px-4 py-3 border border-[var(--border-subtle)] rounded-lg resize-none focus:outline-none focus:border-[var(--brand)] text-sm"
                    disabled={aiGenerated}
                  />
                </div>

                {!aiGenerated ? (
                  <button
                    onClick={handleAiGenerate}
                    disabled={aiGenerating}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      aiGenerating
                        ? 'bg-[var(--text-disabled)] text-white cursor-not-allowed'
                        : 'bg-[#1890ff] text-white hover:bg-[#096dd9]'
                    }`}
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>AI 生成中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>生成协议预览</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-[#f6ffed] border border-[#b7eb8f] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-[#52c41a]" />
                        <span className="text-sm font-medium text-[#389e0d]">协议已生成，请下载后在本地确认并签署</span>
                      </div>
                      <div className="max-h-60 overflow-auto bg-white border border-[#d9d9d9] rounded p-3">
                        <pre className="text-xs text-[var(--text-primary)] whitespace-pre-wrap font-mono">
                          {aiContent}
                        </pre>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDownloadGenerated(aiContent, 'ai')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#52c41a] text-white rounded-lg text-sm hover:bg-[#389e0d] transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        下载协议
                      </button>
                      <button
                        onClick={() => {
                          setAiGenerated(false);
                          setAiContent('');
                        }}
                        className="flex-1 px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg text-sm hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        重新生成
                      </button>
                    </div>
                    <div className="bg-[#fffbe6] border border-[#ffe58f] rounded-lg p-3 text-xs text-[#ad8b00]">
                      ⚠️ 下载后请：1) 仔细审阅内容 2) 与接单方完成签署 3) 扫描或拍照后通过"上传已签署协议"上传
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 模板生成协议 */}
            {method === 'template' && (
              <div className="space-y-4">
                <div className="bg-[#fff7e6] border border-[#ffd591] rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FileStack className="w-5 h-5 text-[#fa8c16] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#ad6800] mb-1">
                        基于协议模板生成
                      </p>
                      <p className="text-xs text-[#ad6800]">
                        从平台提供的标准模板中选择，系统将自动填充订单信息生成协议
                      </p>
                    </div>
                  </div>
                </div>

                {!templateGenerated ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                        选择协议模板 <span className="text-[var(--brand)]">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-auto">
                        {mockTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`text-left p-4 border-2 rounded-lg transition-all ${
                              selectedTemplate === template.id
                                ? 'border-[var(--brand)] bg-[var(--brand-subtle)]'
                                : 'border-[var(--border-subtle)] hover:border-[var(--brand)] hover:bg-[var(--bg-hover)]'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-medium text-[var(--text-primary)] text-sm">
                                {template.name}
                              </div>
                              <span className="px-2 py-1 bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs rounded">
                                {template.category}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)]">{template.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleTemplateGenerate}
                      disabled={templateGenerating || !selectedTemplate}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                        templateGenerating || !selectedTemplate
                          ? 'bg-[var(--text-disabled)] text-white cursor-not-allowed'
                          : 'bg-[#fa8c16] text-white hover:bg-[#d46b08]'
                      }`}
                    >
                      {templateGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>生成中...</span>
                        </>
                      ) : (
                        <>
                          <FileStack className="w-5 h-5" />
                          <span>生成协议预览</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-[#f6ffed] border border-[#b7eb8f] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-[#52c41a]" />
                        <span className="text-sm font-medium text-[#389e0d]">协议已生成，请下载后在本地确认并签署</span>
                      </div>
                      <div className="max-h-60 overflow-auto bg-white border border-[#d9d9d9] rounded p-3">
                        <pre className="text-xs text-[var(--text-primary)] whitespace-pre-wrap font-mono">
                          {templateContent}
                        </pre>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDownloadGenerated(templateContent, 'template')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#52c41a] text-white rounded-lg text-sm hover:bg-[#389e0d] transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        下载协议
                      </button>
                      <button
                        onClick={() => {
                          setTemplateGenerated(false);
                          setTemplateContent('');
                          setSelectedTemplate(null);
                        }}
                        className="flex-1 px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg text-sm hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        重新选择
                      </button>
                    </div>
                    <div className="bg-[#fffbe6] border border-[#ffe58f] rounded-lg p-3 text-xs text-[#ad8b00]">
                      ⚠️ 下载后请：1) 仔细审阅内容 2) 与接单方完成签署 3) 扫描或拍照后通过"上传已签署协议"上传
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 上传已签署协议 */}
            {method === 'upload' && (
              <div className="space-y-4">
                <div className="bg-[#e6f7ff] border border-[#91d5ff] rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Upload className="w-5 h-5 text-[#1890ff] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0050b3] mb-1">
                        上传已签署的三方协议
                      </p>
                      <p className="text-xs text-[#0050b3]">
                        请上传已经完成三方签字盖章的协议文件（PDF或Word格式）
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                    协议文件 <span className="text-[var(--brand)]">*</span>
                  </label>
                  
                  {/* 拖拽上传区域 */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-[var(--brand)] bg-[var(--brand-subtle)]'
                        : selectedFile
                        ? 'border-[#52c41a] bg-[#f6ffed]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-hover)] hover:border-[var(--brand)] hover:bg-[var(--brand-subtle)]'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={acceptedExtensions.join(',')}
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-[#52c41a]" />
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-5 h-5 text-[var(--text-secondary)]" />
                            <span className="text-sm font-medium text-[var(--text-primary)]">{selectedFile.name}</span>
                          </div>
                          <div className="text-xs text-[var(--text-tertiary)]">
                            文件大小：{formatFileSize(selectedFile.size)}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="ml-4 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors"
                        >
                          重新选择
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-[var(--text-disabled)] mx-auto mb-3" />
                        <p className="text-sm text-[var(--text-secondary)] mb-2">
                          将文件拖拽到此处，或
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[var(--brand)] hover:underline mx-1"
                          >
                            点击上传
                          </button>
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          支持 PDF、Word 格式，最大 20MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--bg-hover)] rounded-lg p-4">
                  <p className="text-xs text-[var(--text-secondary)]">
                    <strong>提示：</strong>请确保上传的协议文件已经包含客户、接单方、平台三方的签字盖章。
                    上传后仍需要接单方确认且平台审核通过后才能生效。
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-[var(--brand)] flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* 流程说明 */}
            <div className="bg-[var(--bg-hover)] rounded-lg p-4">
              <p className="text-sm font-medium text-[var(--text-primary)] mb-3">协议生效流程：</p>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-[var(--brand)] text-white rounded-full flex items-center justify-center text-xs">
                    1
                  </div>
                  <span>客户上传协议</span>
                </div>
                <span className="text-[var(--text-disabled)]">→</span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-[var(--brand)] text-white rounded-full flex items-center justify-center text-xs">
                    2
                  </div>
                  <span>接单方确认</span>
                </div>
                <span className="text-[var(--text-disabled)]">→</span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-[#52c41a] text-white rounded-full flex items-center justify-center text-xs">
                    3
                  </div>
                  <span>平台审核通过</span>
                </div>
                <span className="text-[var(--text-disabled)]">→</span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-[#faad14] text-white rounded-full flex items-center justify-center text-xs">
                    4
                  </div>
                  <span>进入交付</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="border-t border-[var(--border-subtle)] px-8 py-4 bg-[var(--bg-hover)]">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-sm hover:bg-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFile
                  ? 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]'
                  : 'bg-[var(--text-disabled)] text-white cursor-not-allowed'
              }`}
            >
              确认提交
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}