import { useState } from 'react';
import {
  ArrowLeft, Upload, X, CheckCircle, Clock, AlertCircle,
  Building2, FileText, User, Users, BadgeCheck, RefreshCw,
  ChevronDown, ChevronUp, Plus,
} from 'lucide-react';

const BRAND = 'var(--brand)';

type CertStatus = 'draft' | 'pending' | 'approved' | 'rejected';

interface MockFile { name: string; size: string; }

// ── Sub-component: file upload zone ─────────────────────────────────────────
function UploadZone({
  label, hint, file, onUpload, onRemove, error, required = false, multiple = false,
}: {
  label: string; hint?: string; file: MockFile | null;
  onUpload: () => void; onRemove: () => void;
  error?: string; required?: boolean; multiple?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-sm text-[#333]">{label}</span>
        {required && <span className="text-red-500 text-xs ml-0.5">*</span>}
      </div>
      {file ? (
        <div className="flex items-center justify-between px-4 py-3 bg-[#f8f9fc] border border-[var(--border-default)] rounded-lg group">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} />
            <div>
              <div className="text-sm text-[#333]">{file.name}</div>
              <div className="text-xs text-[#aaa]">{file.size}</div>
            </div>
          </div>
          <button onClick={onRemove} className="p-1 hover:bg-gray-200 rounded-full transition-colors opacity-0 group-hover:opacity-100">
            <X className="w-3.5 h-3.5 text-[#999]" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onUpload}
          className={`w-full border-2 border-dashed rounded-lg py-5 flex flex-col items-center gap-1.5 transition-all hover:border-[var(--brand)] hover:bg-[#f5f6ff] ${
            error ? 'border-red-300 bg-red-50' : 'border-[var(--border-default)] bg-gray-50'
          }`}
        >
          <Upload className={`w-5 h-5 ${error ? 'text-red-300' : 'text-[#ccc]'}`} />
          <span className="text-xs text-[#aaa]">点击上传{multiple ? '（可多个）' : ''}</span>
          {hint && <span className="text-xs text-[#ccc]">{hint}</span>}
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

// ── Sub-component: multi-file upload zone ────────────────────────────────────
function MultiUploadZone({
  label, hint, files, onAdd, onRemove, required = false,
}: {
  label: string; hint?: string; files: MockFile[];
  onAdd: () => void; onRemove: (i: number) => void; required?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-sm text-[#333]">{label}</span>
        {required && <span className="text-red-500 text-xs ml-0.5">*</span>}
      </div>
      <div className="space-y-2">
        {files.map((f, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 bg-[#f8f9fc] border border-[var(--border-default)] rounded-lg group">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} />
              <div>
                <div className="text-sm text-[#333]">{f.name}</div>
                <div className="text-xs text-[#aaa]">{f.size}</div>
              </div>
            </div>
            <button onClick={() => onRemove(i)} className="p-1 hover:bg-gray-200 rounded-full transition-colors opacity-0 group-hover:opacity-100">
              <X className="w-3.5 h-3.5 text-[#999]" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="w-full border-2 border-dashed border-[var(--border-default)] bg-gray-50 rounded-lg py-4 flex items-center justify-center gap-2 text-xs text-[#aaa] hover:border-[var(--brand)] hover:bg-[#f5f6ff] transition-all"
        >
          <Plus className="w-4 h-4" /> 添加文件{hint ? `（${hint}）` : ''}
        </button>
      </div>
    </div>
  );
}

// ── Sub-component: section card ──────────────────────────────────────────────
function SectionCard({
  title, icon: Icon, stripColor = BRAND, children,
}: {
  title: string; icon: React.ComponentType<{ className?: string }>;
  stripColor?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
      <div className="h-[3px]" style={{ backgroundColor: stripColor }} />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: stripColor + '20' }}>
            <Icon className="w-4 h-4" style={{ color: stripColor } as React.CSSProperties} />
          </div>
          <span className="text-sm text-[#222]">{title}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Field component ─────────────────────────────────────────────────────────
function Field({
  label, required = false, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-[#555] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${
    err ? 'border-red-300 focus:border-red-400' : 'border-[var(--border-default)] focus:border-[var(--brand)]'
  }`;

// ── Mock file generator ──────────────────────────────────────────────────────
let fileCounter = 0;
function mockFile(baseName: string): MockFile {
  fileCounter += 1;
  const extensions = ['.jpg', '.pdf', '.png'];
  const ext = extensions[fileCounter % extensions.length];
  return { name: baseName + ext, size: `${(Math.random() * 4 + 0.3).toFixed(1)} MB` };
}

// ── Main component ───────────────────────────────────────────────────────────
export function CustomerQualification({
  onComplete,
  onBack,
  initialCertStatus,
  initialData,
  rejectReason: rejectReasonProp,
  onCertStatusChange,
  verifiedPhone,
  verifiedEmail,
}: {
  onComplete?: () => void;
  onBack?: () => void;
  initialCertStatus?: CertStatus;
  initialData?: {
    companyName?: string; creditCode?: string; address?: string;
    legalRepName?: string; contactName?: string; contactTitle?: string;
    contactPhone?: string; contactEmail?: string;
  };
  rejectReason?: string;
  onCertStatusChange?: (status: CertStatus) => void;
  verifiedPhone?: string;
  verifiedEmail?: string;
}) {
  // ── Status ─────────────────────────────────────────────────────────────────
  const [certStatus, setCertStatus] = useState<CertStatus>(initialCertStatus ?? 'draft');
  const [rejectReason] = useState(
    rejectReasonProp ??
    '营业执照图片不清晰，法定代表人身份证上的姓名与营业执照登记信息不一致，请重新上传清晰的证件照片并核对信息后重新提交。'
  );

  // ── Form fields — pre-fill from initialData ────────────────────────────────
  const [companyName, setCompanyName] = useState(initialData?.companyName ?? '');
  const [creditCode, setCreditCode] = useState(initialData?.creditCode ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [legalRepName, setLegalRepName] = useState(initialData?.legalRepName ?? '');
  const [contactName, setContactName] = useState(initialData?.contactName ?? '');
  const [contactTitle, setContactTitle] = useState(initialData?.contactTitle ?? '');
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone ?? '');
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail ?? '');

  // ── Toggle flags ───────────────────────────────────────────────────────────
  const [isAgent, setIsAgent] = useState(false);       // 非法人本人办理
  const [hasIndustry, setHasIndustry] = useState(false); // 涉及特殊行业

  // ── Files ──────────────────────────────────────────────────────────────────
  const [bizLicense, setBizLicense] = useState<MockFile | null>(null);
  const [legalIdFront, setLegalIdFront] = useState<MockFile | null>(null);
  const [legalIdBack, setLegalIdBack] = useState<MockFile | null>(null);
  const [agentIdFront, setAgentIdFront] = useState<MockFile | null>(null);
  const [agentIdBack, setAgentIdBack] = useState<MockFile | null>(null);
  const [authLetter, setAuthLetter] = useState<MockFile | null>(null);
  const [bankProof, setBankProof] = useState<MockFile | null>(null);
  const [industryFiles, setIndustryFiles] = useState<MockFile[]>([]);
  const [extraFiles, setExtraFiles] = useState<MockFile[]>([]);

  // ── Certificate expiry dates ──────────────────────────────────────────────
  const [bizLicenseExpiry, setBizLicenseExpiry] = useState('');
  const [legalIdExpiry, setLegalIdExpiry] = useState('');

  // ── Errors & warnings ─────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [certWarnings, setCertWarnings] = useState<string[]>([]);

  // ── Validation & submit ────────────────────────────────────────────────────
  const handleSubmit = () => {
    const e: Record<string, string> = {};
    if (!companyName.trim()) e.companyName = '请填写企业全称';
    if (!creditCode.trim()) e.creditCode = '请填写统一社会信用代码';
    else if (creditCode.trim().length !== 18) e.creditCode = '统一社会信用代码应为 18 位';
    if (!address.trim()) e.address = '请填写注册地址';
    if (!legalRepName.trim()) e.legalRepName = '请填写法定代表人姓名';
    if (!contactName.trim()) e.contactName = '请填写联系人姓名';
    if (!contactPhone.trim()) e.contactPhone = '请填写联系人电话';
    // YH §2.10.1: 联系人电话或邮箱至少一项与账号已验证手机/邮箱可触达
    if (contactPhone.trim() || contactEmail.trim()) {
      const phoneMatch = verifiedPhone && contactPhone.trim() === verifiedPhone;
      const emailMatch = verifiedEmail && contactEmail.trim() === verifiedEmail;
      if (!phoneMatch && !emailMatch) {
        e.contactPhone = '联系人电话或邮箱至少一项需与账号已绑定信息一致';
        e.contactEmail = '联系人电话或邮箱至少一项需与账号已绑定信息一致';
      }
    }
    if (!bizLicense) e.bizLicense = '请上传营业执照';
    if (!legalIdFront) e.legalIdFront = '请上传法定代表人身份证正面';
    if (!legalIdBack) e.legalIdBack = '请上传法定代表人身份证背面';
    if (isAgent && !agentIdFront) e.agentIdFront = '请上传经办人身份证正面';
    if (isAgent && !agentIdBack) e.agentIdBack = '请上传经办人身份证背面';
    if (isAgent && !authLetter) e.authLetter = '请上传授权委托书';
    if (!bankProof) e.bankProof = '请上传对公账户证明材料';
    if (!bizLicenseExpiry.trim()) e.bizLicenseExpiry = '请填写营业执照有效期';
    if (!legalIdExpiry.trim()) e.legalIdExpiry = '请填写法人身份证有效期';

    // Expired cert warnings (don't block submission)
    const warnings: string[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (bizLicenseExpiry.trim()) {
      const d = new Date(bizLicenseExpiry);
      if (!isNaN(d.getTime()) && d < now) {
        warnings.push('营业执照有效期已过期，请确认后再提交');
      }
    }
    if (legalIdExpiry.trim()) {
      const d = new Date(legalIdExpiry);
      if (!isNaN(d.getTime()) && d < now) {
        warnings.push('法人身份证有效期已过期，请确认后再提交');
      }
    }
    setCertWarnings(warnings);

    if (Object.keys(e).length > 0) {
      setErrors(e);
      const el = document.getElementById('cert-form-top');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors({});
    const newStatus: CertStatus = 'pending';
    setCertStatus(newStatus);
    onCertStatusChange?.(newStatus);
    if (onComplete) onComplete();
  };

  // ── Render: status banner ──────────────────────────────────────────────────
  const renderStatusBanner = () => {
    if (certStatus === 'draft') return null;

    if (certStatus === 'pending') return (
      <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
        <div className="h-[3px]" style={{ backgroundColor: 'var(--warning)' }} />
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#fff8e1] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" style={{ color: 'var(--warning)' }} />
          </div>
          <div className="flex-1">
            <div className="text-[15px] text-[#222] mb-1">认证材料审核中</div>
            <p className="text-sm text-[#888] leading-relaxed">
              您提交的企业资质认证材料正在人工审核中，预计 1～3 个工作日完成。审核通过后您将收到通知，届时即可发布订单。
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#fff8e1] rounded-full text-xs" style={{ color: 'var(--warning)' }}>
              <Clock className="w-3 h-3" /> 待审核
            </div>
          </div>
        </div>
      </div>
    );

    if (certStatus === 'approved') return (
      <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
        <div className="h-[3px]" style={{ backgroundColor: 'var(--success)' }} />
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#e4f5ec] flex items-center justify-center shrink-0">
            <BadgeCheck className="w-5 h-5" style={{ color: 'var(--success)' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[15px] text-[#222]">企业资质已认证</span>
              <span className="px-2 py-0.5 bg-[#e4f5ec] text-xs rounded-full" style={{ color: 'var(--success)' }}>已通过</span>
            </div>
            <p className="text-sm text-[#888] leading-relaxed">
              您的企业资质认证已审核通过，统一客户档案已生效，现在您可以在订单广场发布订单。
            </p>
            <div className="mt-4 p-4 bg-[#f8f9fc] rounded-lg grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-[#aaa] text-xs">企业名称</span><div className="text-[#333] mt-0.5">{companyName || '示例科技有限公司'}</div></div>
              <div><span className="text-[#aaa] text-xs">法定代表人</span><div className="text-[#333] mt-0.5">{legalRepName || '张三'}</div></div>
              <div className="col-span-2"><span className="text-[#aaa] text-xs">统一社会信用代码</span><div className="text-[#333] mt-0.5 font-mono text-xs">{creditCode || '91110108MA01XXXXXX'}</div></div>
            </div>
          </div>
        </div>
      </div>
    );

    if (certStatus === 'rejected') return (
      <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
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
            <p className="text-sm text-[#888] mb-3">请根据以下审核意见修改材料后重新提交：</p>
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 leading-relaxed">
              {rejectReason}
            </div>
            <p className="mt-3 text-xs text-[#aaa]">请在下方修改或补充材料，然后点击「重新提交资质审核」。</p>
          </div>
        </div>
      </div>
    );

    return null;
  };

  // ── Render: editable form ─────────────────────────────────────────────────
  const isEditable = certStatus === 'draft' || certStatus === 'rejected';

  return (
    <div className="min-h-full bg-[var(--bg-root)] flex flex-col">

      {/* ── Mini hero banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #07091a 0%, #0d0b2e 55%, #12103d 100%)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(82,96,240,0.42) 0%, transparent 70%)' }} />
          <div className="absolute -top-8 -left-16 w-60 h-60 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.34) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-12 right-1/3 w-48 h-48 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)' }} />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-[var(--bg-root)]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 pt-6 pb-10">
          {(onBack) && (
            <button onClick={onBack}
              className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors mb-5 text-sm">
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
          )}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(82,96,240,0.25)' }}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-white mb-0.5">企业资质认证</h1>
              <p className="text-sm text-white/45">提交企业证照与信息，审核通过后即可发布订单</p>
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
                {i < arr.length - 1 && (
                  <div className="w-8 h-px mx-2 bg-white/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div id="cert-form-top" className="max-w-3xl mx-auto w-full px-6 py-6 space-y-4">

        {/* Status banner */}
        {renderStatusBanner()}

        {/* ── Demo controls (small, discreet) ──────────────────────────── */}
        {certStatus !== 'draft' && (
          <div className="bg-white rounded-md border border-dashed border-[var(--border-default)] px-5 py-3">
            <p className="text-xs text-[#aaa] mb-2">🛠 演示控制（模拟运营审核结果）</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCertStatus('pending')}
                className={`px-3 py-1 rounded-lg text-xs border transition-colors ${certStatus === 'pending' ? 'bg-[#fff8e1] border-[var(--warning)] text-[var(--warning)]' : 'border-[var(--border-default)] text-[#999] hover:bg-gray-50'}`}>
                待审核
              </button>
              <button onClick={() => setCertStatus('approved')}
                className={`px-3 py-1 rounded-lg text-xs border transition-colors ${certStatus === 'approved' ? 'bg-[#e4f5ec] border-[#1e8050] text-[#1e8050]' : 'border-[var(--border-default)] text-[#999] hover:bg-gray-50'}`}>
                模拟审核通过
              </button>
              <button onClick={() => setCertStatus('rejected')}
                className={`px-3 py-1 rounded-lg text-xs border transition-colors ${certStatus === 'rejected' ? 'bg-red-50 border-red-300 text-red-500' : 'border-[var(--border-default)] text-[#999] hover:bg-gray-50'}`}>
                模拟审核拒绝
              </button>
            </div>
          </div>
        )}

        {/* ── Section 1: 企业基本信息 ──────────────────────────────────── */}
        {isEditable && (
          <SectionCard title="企业基本信息" icon={Building2} stripColor={BRAND}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="企业名称" required error={errors.companyName}>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                    placeholder="请填写与营业执照一致的企业全称"
                    className={inputCls(errors.companyName)} />
                </Field>
              </div>
              <Field label="统一社会信用代码" required error={errors.creditCode}>
                <input value={creditCode} onChange={e => setCreditCode(e.target.value)}
                  placeholder="18 位统一社会信用代码"
                  maxLength={18}
                  className={inputCls(errors.creditCode) + ' font-mono tracking-wider'} />
              </Field>
              <Field label="法定代表人姓名" required error={errors.legalRepName}>
                <input value={legalRepName} onChange={e => setLegalRepName(e.target.value)}
                  placeholder="与营业执照及法人证件一致"
                  className={inputCls(errors.legalRepName)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="注册地址" required error={errors.address}>
                  <input value={address} onChange={e => setAddress(e.target.value)}
                    placeholder="与营业执照住所一致"
                    className={inputCls(errors.address)} />
                </Field>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Section 2: 联系人信息 ─────────────────────────────────────── */}
        {isEditable && (
          <SectionCard title="业务联系人信息" icon={User} stripColor="#1e8c58">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="联系人姓名" required error={errors.contactName}>
                <input value={contactName} onChange={e => setContactName(e.target.value)}
                  placeholder="业务对接联系人"
                  className={inputCls(errors.contactName)} />
              </Field>
              <Field label="联系人职务">
                <input value={contactTitle} onChange={e => setContactTitle(e.target.value)}
                  placeholder="如：市场总监、技术负责人"
                  className={inputCls()} />
              </Field>
              <Field label="联系人电话" required error={errors.contactPhone}>
                <input value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                  placeholder="用于审核沟通"
                  className={inputCls(errors.contactPhone)} />
              </Field>
              <Field label="联系人邮箱" error={errors.contactEmail}>
                <input value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                  placeholder="选填"
                  className={inputCls(errors.contactEmail)} />
              </Field>
            </div>
          </SectionCard>
        )}

        {/* ── Section 3: 证照材料上传 ─────────────────────────────────── */}
        {isEditable && (
          <SectionCard title="证照材料上传" icon={FileText} stripColor="#0e82a8">
            <div className="space-y-5">
              {/* 营业执照 */}
              <UploadZone
                label="营业执照（副本）"
                hint="JPG / PNG / PDF，不超过 10 MB，四角完整可读"
                file={bizLicense}
                onUpload={() => setBizLicense(mockFile('营业执照'))}
                onRemove={() => setBizLicense(null)}
                error={errors.bizLicense}
                required
              />

              {/* 营业执照有效期 */}
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="text-sm text-[#333]">有效期至</span>
                  <span className="text-red-500 text-xs ml-0.5">*</span>
                </div>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={bizLicenseExpiry}
                  onChange={e => setBizLicenseExpiry(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-[13px] outline-none transition-colors ${errors.bizLicenseExpiry ? 'border-red-300 focus:border-red-400' : 'border-[var(--border-default)] focus:border-[var(--brand)]'}`}
                />
                {errors.bizLicenseExpiry && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.bizLicenseExpiry}</p>}
              </div>

              {/* 法定代表人身份证 */}
              <div>
                <p className="text-sm text-[#333] mb-2">
                  法定代表人身份证（正反面）<span className="text-red-500 ml-0.5">*</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <UploadZone label="正面（人像面）" hint="清晰可读，未遮挡"
                    file={legalIdFront}
                    onUpload={() => setLegalIdFront(mockFile('法人身份证_正面'))}
                    onRemove={() => setLegalIdFront(null)}
                    error={errors.legalIdFront} required />
                  <UploadZone label="背面（国徽面）" hint="确保有效期在期内"
                    file={legalIdBack}
                    onUpload={() => setLegalIdBack(mockFile('法人身份证_背面'))}
                    onRemove={() => setLegalIdBack(null)}
                    error={errors.legalIdBack} required />
                </div>

                {/* 法人身份证有效期 */}
                <div className="mt-3">
                  <div className="flex items-center gap-1 mb-1.5">
                    <span className="text-sm text-[#333]">有效期至</span>
                    <span className="text-red-500 text-xs ml-0.5">*</span>
                  </div>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={legalIdExpiry}
                    onChange={e => setLegalIdExpiry(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md text-[13px] outline-none transition-colors ${errors.legalIdExpiry ? 'border-red-300 focus:border-red-400' : 'border-[var(--border-default)] focus:border-[var(--brand)]'}`}
                  />
                  {errors.legalIdExpiry && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.legalIdExpiry}</p>}
                </div>
              </div>

              {/* 对公账户证明 */}
              <UploadZone
                label="对公账户证明"
                hint="可提供：开户许可证 / 银行开户证明 / 开户回单，户名须与营业执照企业名称一致"
                file={bankProof}
                onUpload={() => setBankProof(mockFile('对公账户证明'))}
                onRemove={() => setBankProof(null)}
                error={errors.bankProof}
                required
              />

              {/* 是否由经办人（非法人）办理 */}
              <div className="border border-[var(--border-subtle)] rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsAgent(!isAgent)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fc] hover:bg-gray-50 transition-colors text-sm text-[#333]"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#aaa]" />
                    <span>本次认证由经办人（非法定代表人本人）办理</span>
                    <span className="text-xs text-[#aaa]">（需上传经办人证件及授权委托书）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-4 rounded-full transition-colors ${isAgent ? 'bg-[var(--brand)]' : 'bg-gray-200'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-transform ${isAgent ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    {isAgent ? <ChevronUp className="w-4 h-4 text-[#aaa]" /> : <ChevronDown className="w-4 h-4 text-[#aaa]" />}
                  </div>
                </button>
                {isAgent && (
                  <div className="px-4 py-4 border-t border-[var(--border-subtle)] space-y-4 bg-white">
                    <div>
                      <p className="text-sm text-[#333] mb-2">
                        经办人身份证（正反面）<span className="text-red-500 ml-0.5">*</span>
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <UploadZone label="正面（人像面）"
                          file={agentIdFront}
                          onUpload={() => setAgentIdFront(mockFile('经办人身份证_正面'))}
                          onRemove={() => setAgentIdFront(null)}
                          error={errors.agentIdFront} required />
                        <UploadZone label="背面（国徽面）"
                          file={agentIdBack}
                          onUpload={() => setAgentIdBack(mockFile('经办人身份证_背面'))}
                          onRemove={() => setAgentIdBack(null)}
                          error={errors.agentIdBack} required />
                      </div>
                    </div>
                    <UploadZone
                      label="授权委托书"
                      hint="加盖企业公章，授权范围须覆盖「在本平台办理企业认证及发单」"
                      file={authLetter}
                      onUpload={() => setAuthLetter(mockFile('授权委托书'))}
                      onRemove={() => setAuthLetter(null)}
                      error={errors.authLetter}
                      required
                    />
                  </div>
                )}
              </div>

              {/* 行业资质（可选） */}
              <div className="border border-[var(--border-subtle)] rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setHasIndustry(!hasIndustry)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fc] hover:bg-gray-50 transition-colors text-sm text-[#333]"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#aaa]" />
                    <span>涉及特殊行业（如增值电信、人力资源许可证等）</span>
                    <span className="text-xs text-[#aaa]">（选填）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-4 rounded-full transition-colors ${hasIndustry ? 'bg-[var(--brand)]' : 'bg-gray-200'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-transform ${hasIndustry ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    {hasIndustry ? <ChevronUp className="w-4 h-4 text-[#aaa]" /> : <ChevronDown className="w-4 h-4 text-[#aaa]" />}
                  </div>
                </button>
                {hasIndustry && (
                  <div className="px-4 py-4 border-t border-[var(--border-subtle)] bg-white">
                    <MultiUploadZone
                      label="行业资质或许可证"
                      hint="可多个"
                      files={industryFiles}
                      onAdd={() => setIndustryFiles(prev => [...prev, mockFile('行业资质证书')])}
                      onRemove={i => setIndustryFiles(prev => prev.filter((_, idx) => idx !== i))}
                    />
                  </div>
                )}
              </div>

              {/* 其他补充材料 */}
              <MultiUploadZone
                label="其他补充材料"
                hint="选填，如企业更名证明、分支机构授权等"
                files={extraFiles}
                onAdd={() => setExtraFiles(prev => [...prev, mockFile('补充材料')])}
                onRemove={i => setExtraFiles(prev => prev.filter((_, idx) => idx !== i))}
              />
            </div>
          </SectionCard>
        )}

        {/* ── Validation error summary ──────────────────────────────────── */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md px-5 py-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 mb-1">请完善以下必填项后重新提交：</p>
              <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                {Array.from(new Set(Object.values(errors))).map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Expired cert warnings (non-blocking) ─────────────────── */}
        {certWarnings.length > 0 && Object.keys(errors).length === 0 && (
          <div className="bg-[#fff8e1] border border-[#f0d472] rounded-md px-5 py-4 flex items-start gap-3">
            <Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
            <div>
              <p className="text-sm text-[var(--warning)] mb-1">证件有效期提醒：</p>
              <ul className="text-xs text-[var(--warning)] space-y-0.5 list-disc list-inside">
                {certWarnings.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
              <p className="text-xs text-[#aaa] mt-2">您仍可继续提交，平台管理员将在审核时确认。</p>
            </div>
          </div>
        )}

        {/* ── Submit / resubmit button ──────────────────────────────────── */}
        {isEditable && (
          <div className="bg-white rounded-md border border-[var(--border-subtle)] p-5">
            <button
              onClick={handleSubmit}
              className="w-full py-3 text-white rounded-md text-sm transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #7c5cf0 100%)', boxShadow: '0 4px 14px rgba(82,96,240,0.35)' }}
            >
              {certStatus === 'rejected' ? '重新提交资质审核' : '提交资质认证申请'}
            </button>
          </div>
        )}

        {/* ── Approved: no form, just info ──────────────────────────────── */}
        {certStatus === 'approved' && (
          <div className="bg-white rounded-md border border-[var(--border-subtle)] px-5 py-5 text-center">
            <p className="text-sm text-[#aaa]">如需更新企业信息，请联系平台运营人员。</p>
          </div>
        )}

        {/* ── Pending: compact material list ───────────────────────────── */}
        {certStatus === 'pending' && (
          <div className="bg-white rounded-md border border-[var(--border-subtle)] overflow-hidden">
            <div className="h-[3px] bg-[var(--warning)]" />
            <div className="p-5">
              <p className="text-sm text-[#555] mb-3">已提交材料概览</p>
              <div className="space-y-2 text-xs text-[#888]">
                {[
                  { label: '企业名称', value: companyName || '（已填写）' },
                  { label: '统一社会信用代码', value: creditCode || '（已填写）', mono: true },
                  { label: '法定代表人', value: legalRepName || '（已填写）' },
                  { label: '联系人', value: contactName || '（已填写）' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-[#aaa]">{r.label}</span>
                    <span className={`text-[#333] ${r.mono ? 'font-mono' : ''}`}>{r.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-[#aaa]">上传材料</span>
                  <span className="text-[#1e8050]">
                    {[bizLicense, legalIdFront, legalIdBack, bankProof].filter(Boolean).length + industryFiles.length + extraFiles.length} 个文件
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}