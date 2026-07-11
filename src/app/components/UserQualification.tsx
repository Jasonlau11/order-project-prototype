import { useState } from 'react';
import {
  CheckCircle, Clock, AlertCircle, BadgeCheck, Award,
  ArrowLeft, Users, ChevronDown, ChevronUp, Building2, Upload, X,
} from 'lucide-react';

const BRAND = 'var(--brand)';

type CertStatus = 'draft' | 'pending' | 'approved' | 'rejected';

interface MockFile { name: string; size: string; }

interface UserQualificationData {
  isTeam?: boolean;
  teamName?: string;
  capabilityIntro?: string;
  qualificationCerts?: string;
}

interface UserQualificationProps {
  /** 首次认证完成回调 */
  onComplete?: () => void;
  /** 关闭/取消（弹窗模式下用） */
  onCancel?: () => void;
  /** 返回按钮（页面模式下用） */
  onBack?: () => void;
  /** 初始认证状态（用于回显审核结果） */
  initialCertStatus?: CertStatus;
  /** 预填表单数据（回显上次填写内容） */
  initialData?: UserQualificationData;
  /** 审核拒绝原因 */
  rejectReason?: string;
  /** 状态变更回调（提交后通知父组件） */
  onCertStatusChange?: (status: CertStatus) => void;
}

export function UserQualification({
  onComplete,
  onCancel,
  onBack,
  initialCertStatus = 'draft',
  initialData,
  rejectReason: rejectReasonProp,
  onCertStatusChange,
}: UserQualificationProps) {
  const isPageMode = !!onBack;

  const [certStatus, setCertStatus] = useState<CertStatus>(initialCertStatus);
  const [rejectReason] = useState(
    rejectReasonProp ??
    '您的资质信息未通过审核，请根据反馈完善后重新提交。'
  );

  // 主体类型
  const [contractorType, setContractorType] = useState<'individual' | 'company'>('individual');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [creditCode, setCreditCode] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [legalRepName, setLegalRepName] = useState('');
  const [legalRepPhone, setLegalRepPhone] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [companyIntro, setCompanyIntro] = useState('');
  const [certificationFiles, setCertificationFiles] = useState<MockFile[]>([]);

  const [isTeam, setIsTeam] = useState(initialData?.isTeam ?? false);
  const [teamName, setTeamName] = useState(initialData?.teamName ?? '');
  const [capabilityIntro, setCapabilityIntro] = useState(initialData?.capabilityIntro ?? '');
  const [qualificationCerts, setQualificationCerts] = useState(initialData?.qualificationCerts ?? '');
  const [showDemoControl, setShowDemoControl] = useState(certStatus !== 'draft');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditable = certStatus === 'draft' || certStatus === 'rejected';

  const handleSubmit = () => {
    const e: Record<string, string> = {};

    if (contractorType === 'company') {
      if (!companyName.trim()) e.companyName = '请填写公司名称';
      if (!industry.trim()) e.industry = '请选择所属行业';
      if (!creditCode.trim()) e.creditCode = '请填写统一社会信用代码';
      if (!legalRepName.trim()) e.legalRepName = '请填写法定代表人姓名';
      if (certificationFiles.length === 0) e.certificationFiles = '请上传资质证书';
    }

    if (contractorType === 'individual' && isTeam && !teamName.trim()) {
      e.teamName = '请填写团队名称';
    }

    if (!capabilityIntro.trim()) {
      e.capabilityIntro = '请填写能力背景介绍';
    }

    if (Object.keys(e).length > 0) {
      setErrors(e);
      const el = document.getElementById('user-qual-form-top');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setErrors({});
    const newStatus: CertStatus = 'pending';
    setCertStatus(newStatus);
    setShowDemoControl(true);
    onCertStatusChange?.(newStatus);
    if (onComplete) onComplete();
  };

  // ── Status banner ───────────────────────────────────────────────────────────
  const renderStatusBanner = () => {
    if (certStatus === 'draft') return null;

    if (certStatus === 'pending') return (
      <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden mb-5">
        <div className="h-[3px]" style={{ backgroundColor: 'var(--warning)' }} />
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--warning-bg)] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" style={{ color: 'var(--warning)' }} />
          </div>
          <div className="flex-1">
            <div className="text-[15px] text-[#222] mb-1">资质材料审核中</div>
            <p className="text-sm text-[#888] leading-relaxed">
              您提交的资质信息正在人工审核中，预计 1～3 个工作日完成。审核通过后您将收到通知，届时即可报名承接订单。
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--warning-bg)] rounded-full text-xs" style={{ color: 'var(--warning)' }}>
              <Clock className="w-3 h-3" /> 待审核
            </div>
          </div>
        </div>
      </div>
    );

    if (certStatus === 'approved') return (
      <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden mb-5">
        <div className="h-[3px]" style={{ backgroundColor: 'var(--success)' }} />
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#e4f5ec] flex items-center justify-center shrink-0">
            <BadgeCheck className="w-5 h-5" style={{ color: 'var(--success)' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[15px] text-[#222]">资质认证已通过</span>
              <span className="px-2 py-0.5 bg-[#e4f5ec] text-xs rounded-full" style={{ color: 'var(--success)' }}>已通过</span>
            </div>
            <p className="text-sm text-[#888] leading-relaxed">
              恭喜！您的能力与资质认证已审核通过，现在可以在订单广场自由报名承接订单。
            </p>
            <div className="mt-4 p-4 bg-[#f8f9fc] rounded-lg text-sm space-y-2">
              <div><span className="text-[#aaa] text-xs">认证身份</span>
                <div className="text-[#333] mt-0.5">
                  {contractorType === 'company' ? `公司：${companyName || '已认证企业'}` : (isTeam ? `团队：${teamName}` : '个人接单方')}
                </div>
              </div>
              {capabilityIntro && (
                <div><span className="text-[#aaa] text-xs">能力简介</span>
                  <div className="text-[#555] mt-0.5 text-xs leading-relaxed line-clamp-2">{capabilityIntro}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );

    if (certStatus === 'rejected') return (
      <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden mb-5">
        <div className="h-[3px] bg-red-400" />
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[15px] text-[#222]">认证审核未通过</span>
              <span className="px-2 py-0.5 bg-red-50 text-red-500 text-xs rounded-full">已拒绝</span>
            </div>
            <p className="text-sm text-[#888] mb-3">请根据以下审核意见修改信息后重新提交：</p>
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 leading-relaxed">
              {rejectReason}
            </div>
            <p className="mt-3 text-xs text-[#aaa]">请在下方修改或补充能力信息，然后点击「重新提交资质审核」。</p>
          </div>
        </div>
      </div>
    );

    return null;
  };

  // ── Demo controls ───────────────────────────────────────────────────────────
  const renderDemoControls = () => {
    if (!showDemoControl) return null;
    return (
      <div className="bg-white rounded-md border border-dashed border-[var(--border-default)] px-5 py-3 mb-5">
        <p className="text-xs text-[#aaa] mb-2">🛠 演示控制（模拟运营审核结果）</p>
        <div className="flex items-center gap-2">
          {(['pending', 'approved', 'rejected'] as CertStatus[]).map(s => (
            <button key={s} onClick={() => setCertStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs border transition-colors ${certStatus === s
                ? s === 'approved' ? 'bg-[#e4f5ec] border-[#1e8050] text-[#1e8050]'
                : s === 'rejected' ? 'bg-red-50 border-red-300 text-red-500'
                : 'bg-[var(--warning-bg)] border-[var(--warning)] text-[var(--warning)]'
                : 'border-[var(--border-default)] text-[#999] hover:bg-gray-50'
              }`}>
              {s === 'pending' ? '待审核' : s === 'approved' ? '模拟通过' : '模拟拒绝'}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ── Form body ───────────────────────────────────────────────────────────────
  const renderForm = () => (
    <div className="space-y-5">
      {/* 主体类型选择 */}
      <div id="user-qual-form-top" className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
        <div className="h-[3px]" style={{ backgroundColor: BRAND }} />
        <div className="p-5">
          <div className="text-sm text-[#222] mb-3">认证主体类型</div>
          <div className="flex gap-3">
            {[
              { value: 'individual' as const, title: '个人', desc: '以个人或小团队身份接单' },
              { value: 'company' as const, title: '公司', desc: '以企业主体接单，需上传营业执照等材料' },
            ].map(opt => (
              <button key={opt.value} onClick={() => setContractorType(opt.value)}
                className={`flex-1 p-4 border-2 rounded-md text-left transition-all ${
                  contractorType === opt.value ? 'border-[var(--brand)] bg-[var(--brand-subtle)]' : 'border-[#eee] bg-white'
                }`}>
                <div className="text-sm font-medium text-[#222]">{opt.title}</div>
                <div className="text-xs text-[#888] mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 公司认证表单 */}
      {contractorType === 'company' && (
        <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
          <div className="h-[3px]" style={{ backgroundColor: 'var(--warning)' }} />
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4" style={{ color: 'var(--warning)' }} />
              <span className="text-sm font-medium text-[#333]">公司资质信息</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#555] mb-1.5">公司名称 <span className="text-red-500">*</span></label>
                <input type="text" value={companyName} onChange={e => { setCompanyName(e.target.value); setErrors(prev => { const next = { ...prev }; delete next.companyName; return next; }); }} placeholder="与营业执照一致的公司全称" className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${errors.companyName ? 'border-red-300 focus:border-red-400' : 'border-[var(--border-default)] focus:border-[var(--brand)]'}`} />
                {errors.companyName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.companyName}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#555] mb-1.5">所属行业 <span className="text-red-500">*</span></label>
                <select value={industry} onChange={e => { setIndustry(e.target.value); setErrors(prev => { const next = { ...prev }; delete next.industry; return next; }); }} className={`w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white transition-colors ${errors.industry ? 'border-red-300 focus:border-red-400' : 'border-[var(--border-default)] focus:border-[var(--brand)]'}`}>
                  <option value="">请选择所属行业</option>
                  {['软件开发', '设计创意', '营销推广', '硬件开发', '音视频制作', '其他'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.industry && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.industry}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#555] mb-1.5">统一社会信用代码 <span className="text-red-500">*</span></label>
                <input type="text" value={creditCode} onChange={e => { setCreditCode(e.target.value); setErrors(prev => { const next = { ...prev }; delete next.creditCode; return next; }); }} placeholder="18 位统一社会信用代码" maxLength={18} className={`w-full px-3 py-2 border rounded-lg text-sm outline-none font-mono transition-colors ${errors.creditCode ? 'border-red-300 focus:border-red-400' : 'border-[var(--border-default)] focus:border-[var(--brand)]'}`} />
                {errors.creditCode && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.creditCode}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[#555] mb-1.5">注册地址</label>
                <input type="text" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="与营业执照住所一致" className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm outline-none focus:border-[var(--brand)]" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm text-[#555] mb-1.5">法定代表人姓名 <span className="text-red-500">*</span></label>
                <input type="text" value={legalRepName} onChange={e => { setLegalRepName(e.target.value); setErrors(prev => { const next = { ...prev }; delete next.legalRepName; return next; }); }} placeholder="与营业执照法定代表人一致" className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${errors.legalRepName ? 'border-red-300 focus:border-red-400' : 'border-[var(--border-default)] focus:border-[var(--brand)]'}`} />
                {errors.legalRepName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.legalRepName}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#555] mb-1.5">法定代表人手机号</label>
                <input type="text" value={legalRepPhone} onChange={e => setLegalRepPhone(e.target.value)} placeholder="选填，用于紧急联系" maxLength={11} className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm outline-none focus:border-[var(--brand)]" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#555] mb-1.5">营业执照 <span className="text-red-500">*</span></label>
              <div className="border-2 border-dashed border-[#ddd] rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 text-[#ccc] mx-auto mb-2" />
                <p className="text-xs text-[#999]">点击上传营业执照扫描件</p>
                <p className="text-xs text-[#ccc] mt-1">支持 JPG、PNG、PDF，不超过10MB</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#555] mb-1.5">公司简介</label>
              <textarea value={companyIntro} onChange={e => setCompanyIntro(e.target.value)} placeholder="简要描述公司主营业务和核心能力" className="w-full h-20 px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm outline-none focus:border-[var(--brand)] resize-none" />
            </div>
            {/* 资质证书上传 */}
            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <label className="block text-sm text-[#555] mb-1.5">
                资质证书 <span className="text-red-500">*</span>
                <span className="text-xs text-[#999] ml-1">（必填）</span>
              </label>
              <p className="text-xs text-[#999] mb-2">上传公司相关资质证书，如行业许可证、专业资质等</p>
              <div className="space-y-2">
                {certificationFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 bg-[#f8f9fc] border border-[var(--border-default)] rounded-lg group">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} />
                      <div>
                        <div className="text-sm text-[#333]">{f.name}</div>
                        <div className="text-xs text-[#aaa]">{f.size}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCertificationFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5 text-[#999]" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => { setCertificationFiles(prev => [...prev, { name: `资质证书_${Date.now()}.pdf`, size: '2.8 MB' }]); setErrors(prev => { const next = { ...prev }; delete next.certificationFiles; return next; }); }}
                className={`w-full border-2 border-dashed rounded-lg py-5 flex flex-col items-center gap-1.5 transition-all bg-gray-50 mt-2 ${errors.certificationFiles ? 'border-red-300 hover:border-red-400 bg-red-50' : 'border-[var(--border-default)] hover:border-[var(--brand)] hover:bg-[#f5f6ff]'}`}
              >
                <Upload className={`w-5 h-5 ${errors.certificationFiles ? 'text-red-300' : 'text-[#ccc]'}`} />
                <span className="text-xs text-[#aaa]">点击或拖拽上传资质证书</span>
                <span className="text-xs text-[#ccc]">支持 JPG、PNG、PDF 等格式，可上传多个</span>
              </button>
              {errors.certificationFiles && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.certificationFiles}</p>}
            </div>
          </div>
        </div>
      )}

      {/* 团队开关 —— 仅个人时显示 */}
      {contractorType === 'individual' && (
      <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
        <div className="h-[3px]" style={{ backgroundColor: BRAND }} />
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#222] mb-0.5">团队模式</div>
              <p className="text-xs text-[#888]">开启后，您将以团队身份接单，需填写团队名称</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isTeam} onChange={e => setIsTeam(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-[var(--text-disabled)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand)]" />
            </label>
          </div>

          {isTeam && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <label className="block text-sm text-[#555] mb-1.5">
                团队名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={e => { setTeamName(e.target.value); setErrors(prev => { const next = { ...prev }; delete next.teamName; return next; }); }}
                placeholder="请输入团队名称"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${errors.teamName ? 'border-red-300 focus:border-red-400' : 'border-[var(--border-default)] focus:border-[var(--brand)]'}`}
              />
              {errors.teamName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.teamName}</p>}
              <p className="mt-1 text-xs text-[#999]">团队名称将在报名列表和订单详情中展示给客户</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* 能力介绍 */}
      <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
        <div className="h-[3px]" style={{ backgroundColor: 'var(--warning)' }} />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--warning-bg)' }}>
              <Award className="w-4 h-4" style={{ color: 'var(--warning)' }} />
            </div>
            <span className="text-sm text-[#222]">
              {contractorType === 'company' ? '公司介绍' : (isTeam ? '团队能力背景介绍' : '个人能力背景介绍')}
            </span>
          </div>
          <textarea
            value={capabilityIntro}
            onChange={e => { setCapabilityIntro(e.target.value); setErrors(prev => { const next = { ...prev }; delete next.capabilityIntro; return next; }); }}
            placeholder={contractorType === 'company'
              ? '请描述公司的业务领域、技术实力、成功案例等，如：专注于软件开发领域，拥有50+人技术团队，已交付100+项目...'
              : isTeam
                ? '请描述团队的技术栈、项目经验、核心优势等，如：擅长前后端开发，有多个大型项目经验...'
                : '请描述您的技术栈、项目经验、核心优势等，如：5年前端开发经验，擅长React和Vue...'}
            rows={5}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors resize-none ${errors.capabilityIntro ? 'border-red-300 focus:border-red-400' : 'border-[var(--border-default)] focus:border-[var(--brand)]'}`}
          />
          {errors.capabilityIntro && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.capabilityIntro}</p>}
          <p className="mt-1 text-xs text-[#999]">建议填写详细的能力描述，有助于提升被客户选中的概率</p>
        </div>
      </div>

      {/* 资质证书 */}
      <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
        <div className="h-[3px]" style={{ backgroundColor: 'var(--info)' }} />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#e3f5fb]">
              <CheckCircle className="w-4 h-4 text-[var(--info)]" />
            </div>
            <span className="text-sm text-[#222]">资质证书信息</span>
          </div>
          <textarea
            value={qualificationCerts}
            onChange={e => setQualificationCerts(e.target.value)}
            placeholder="请填写您获得的相关资质证书、认证等，如：阿里云开发者认证、PMP项目管理认证等"
            rows={3}
            className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm outline-none focus:border-[var(--brand)] transition-colors resize-none"
          />
          <p className="mt-1 text-xs text-[#999]">可选填写，有助于客户了解您的专业能力</p>
        </div>
      </div>

      {/* 填写建议 */}
      <div className="bg-[#f5f9ff] border border-[#e0ebff] rounded-md p-4">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-[#4a90e2] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-[#666]">
            <p className="text-sm text-[#222] mb-1">填写建议</p>
            <ul className="space-y-1 list-disc list-inside text-xs text-[#888]">
              <li>详细描述您的技术能力和项目经验</li>
              <li>突出您在相关领域的优势和特长</li>
              <li>提供具体的成功案例或作品链接</li>
              <li>如实填写资质证书，提升可信度</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Page mode (from PersonalInfo navigation) ────────────────────────────────
  if (isPageMode) {
    return (
      <div className="min-h-full bg-[var(--bg-root)] flex flex-col">

        {/* Aurora hero */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #100B09 0%, #1A100D 55%, #27130D 100%)' }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(255,106,61,0.42) 0%, transparent 70%)' }} />
            <div className="absolute -top-8 -left-12 w-52 h-52 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(255,139,92,0.34) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-8 right-1/3 w-40 h-40 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(184,108,16,0.18) 0%, transparent 70%)' }} />
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
            }} />
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-[var(--bg-root)]" />
          </div>

          <div className="relative max-w-3xl mx-auto px-6 pt-6 pb-10">
            <button onClick={onBack} className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors mb-5 text-sm">
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-md flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--warning), var(--warning))', boxShadow: '0 0 16px rgba(184,108,16,0.4)' }}>
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-white mb-0.5">个人 / 团队能力与资质</h1>
                <p className="text-sm text-white/45">填写能力信息，审核通过后即可报名承接订单</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="mt-6 flex items-center gap-0">
              {[
                { label: '填写信息', done: certStatus !== 'draft' },
                { label: '等待审核', done: certStatus === 'approved' },
                { label: '认证完成', done: certStatus === 'approved' },
              ].map((s, i, arr) => (
                <div key={s.label} className="flex items-center">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                      s.done ? 'bg-[var(--brand)] border-[var(--brand)] text-white' :
                      i === 0 && certStatus === 'draft' ? 'bg-white border-white text-[#222]' :
                      i === 1 && certStatus === 'pending' ? 'bg-white border-white text-[#222]' :
                      'border-white/30 text-white/30'
                    }`}>{s.done ? '✓' : i + 1}</div>
                    <span className={`text-xs ${s.done || (i === 0 && certStatus === 'draft') || (i === 1 && certStatus === 'pending') ? 'text-white' : 'text-white/30'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && <div className="w-8 h-px mx-2 bg-white/20" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto w-full px-6 py-6">
          {renderStatusBanner()}
          {renderDemoControls()}
          {isEditable && renderForm()}
          {Object.keys(errors).length > 0 && (
            <div className="mt-5 bg-red-50 border border-red-200 rounded-md px-5 py-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 mb-1">请完善以下必填项后重新提交：</p>
                <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                  {Object.values(errors).map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {isEditable && (
            <div className="mt-5">
              <button
                onClick={handleSubmit}
                className="w-full py-3 text-white rounded-md text-sm transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)', boxShadow: '0 4px 14px rgba(255,106,61,0.35)' }}
              >
                {certStatus === 'rejected' ? '重新提交资质审核' : '提交资质认证申请'}
              </button>
            </div>
          )}
          {certStatus === 'approved' && (
            <div className="bg-white rounded-md border border-[var(--border-subtle)] px-5 py-5 text-center">
              <p className="text-sm text-[#aaa]">如需更新资质信息，请联系平台运营人员。</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Modal / embed mode (from OrderSquareDetail first-time fill) ─────────────
  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--surface-hover)] overflow-auto">
      <div className="bg-white rounded-lg p-8 max-w-3xl w-full mx-4 my-8 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--warning), var(--warning))', boxShadow: '0 0 12px rgba(184,108,16,0.35)' }}>
            <Award className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl text-[#222]">个人/团队能力与资质</h2>
        </div>
        <p className="text-sm text-[#888] mb-6 ml-[52px]">
          请填写您的个人或团队能力背景、资质证书等信息，以便客户了解您的能力。
        </p>

        {renderStatusBanner()}
        {isEditable && renderForm()}

        {Object.keys(errors).length > 0 && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-md px-5 py-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 mb-1">请完善以下必填项后重新提交：</p>
              <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                {Object.values(errors).map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 text-white py-3 rounded-md transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)', boxShadow: '0 4px 14px rgba(255,106,61,0.35)' }}
          >
            {certStatus === 'rejected' ? '重新提交资质审核' : '提交资质认证申请'}
          </button>
          <button
            onClick={onCancel}
            className="px-8 border-2 border-[var(--border-default)] text-[#666] py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            暂时跳过
          </button>
        </div>

        <p className="mt-4 text-xs text-[#999] text-center">
          资质信息将在报名列表和订单详情中展示给客户，完成后可在订单广场承接订单
        </p>
      </div>
    </div>
  );
}