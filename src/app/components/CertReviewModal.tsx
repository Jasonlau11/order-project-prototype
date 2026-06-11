import { useState } from 'react';
import {
  X, Building2, UserCheck, BadgeCheck, CheckCircle, XCircle,
  FileText, MapPin, Phone, Mail, User, Calendar, AlertTriangle,
  ChevronDown, ChevronUp, Award, Users, Eye, Download,
} from 'lucide-react';

const BRAND = 'var(--brand)';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
export interface CustomerCertData {
  companyName: string;
  creditCode: string;
  address: string;
  legalRepName: string;
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  contactEmail: string;
  submittedAt: string;
}

export interface UserCertData {
  userName: string;
  isTeam: boolean;
  teamName?: string;
  skills: string[];
  experience: string;
  capabilityIntro: string;
  qualificationCerts: string;
  submittedAt: string;
}

interface CertReviewModalProps {
  type: 'customer' | 'user';
  entityName: string;          // company name or user name
  customerData?: CustomerCertData;
  userData?: UserCertData;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────
// Mock document thumbnails (placeholder UI for file upload review)
// ─────────────────────────────────────────────────────────────────
function DocCard({ label, note, onClick }: { label: string; note?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="border border-dashed border-gray-200 rounded-md p-4 flex flex-col items-center gap-2 bg-[var(--bg-hover)] hover:border-[var(--brand)] transition-colors cursor-pointer group"
    >
      <div className="w-10 h-12 bg-[var(--brand-subtle)] rounded-lg flex items-center justify-center group-hover:bg-[var(--brand)] group-hover:bg-opacity-10 transition-colors">
        <FileText className="w-5 h-5 group-hover:text-[var(--brand)] transition-colors" style={{ color: BRAND }} />
      </div>
      <div className="text-center">
        <div className="text-[12px] text-[var(--text-primary)]">{label}</div>
        {note && <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{note}</div>}
      </div>
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 group-hover:bg-green-100">已上传</span>
      <span className="text-[10px] text-[var(--brand)] opacity-0 group-hover:opacity-100 transition-opacity">点击预览</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Document preview modal
// ─────────────────────────────────────────────────────────────────
function DocPreviewModal({ label, note, onClose }: { label: string; note?: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--brand-subtle)] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4" style={{ color: BRAND }} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">{label}</h3>
              {note && <p className="text-[11px] text-[var(--text-tertiary)]">{note}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 flex flex-col items-center gap-4">
          {/* Preview area */}
          <div className="w-full aspect-[3/4] max-h-[500px] bg-[var(--bg-hover)] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-20 bg-[var(--brand-subtle)] rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8" style={{ color: BRAND }} />
              </div>
              <p className="text-[13px] text-[var(--text-primary)] font-medium mb-1">{label}</p>
              <p className="text-[12px] text-[var(--text-tertiary)] mb-4">
                {note ? `文件类型：${note}` : '文档预览'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-md text-[13px] hover:bg-[var(--brand-hover)] transition-colors">
                  <Eye className="w-4 h-4" />
                  预览文档
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md text-[13px] hover:bg-[var(--bg-hover)] transition-colors">
                  <Download className="w-4 h-4" />
                  下载
                </button>
              </div>
            </div>
          </div>
          <div className="w-full bg-green-50 border border-green-100 rounded-md p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-[12px] text-green-700">此文件已上传并验证，文档格式合规。</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md text-[13px] hover:bg-[var(--bg-hover)] transition-colors"
          >关闭</button>
        </div>
      </div>
    </div>
  );
}

// Info row helper
function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: 'var(--brand-subtle)' }}>
        <Icon className="w-3.5 h-3.5" style={{ color: BRAND }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">{label}</div>
        <div className="text-[13px] text-[var(--text-primary)] break-all">{value}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────
export function CertReviewModal({
  type, entityName, customerData, userData,
  onApprove, onReject, onClose,
}: CertReviewModalProps) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [docsExpanded, setDocsExpanded] = useState(true);
  const [docPreview, setDocPreview] = useState<{ label: string; note?: string } | null>(null);

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) return;
    onReject(rejectReason.trim());
  };

  const isCustomer = type === 'customer';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] w-full max-w-[640px] max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]"
          style={{ background: 'linear-gradient(135deg, #07091a 0%, #0d0b2e 60%, #0a0e28 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center"
              style={{ backgroundColor: 'rgba(82,96,240,0.25)', border: '1px solid rgba(82,96,240,0.35)' }}>
              {isCustomer
                ? <Building2 className="w-4.5 h-4.5" style={{ color: 'var(--brand)' }} />
                : <UserCheck className="w-4.5 h-4.5" style={{ color: 'var(--brand)' }} />}
            </div>
            <div>
              <div className="text-[15px] text-white">
                {isCustomer ? '企业资质认证审核' : '用户能力与资质审核'}
              </div>
              <div className="text-[12px] text-white/45 mt-0.5">{entityName}</div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Submitted-at badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#fff8e1] rounded-lg border border-amber-100">
            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[12px] text-amber-700">
              提交时间：{isCustomer ? customerData?.submittedAt : userData?.submittedAt}
            </span>
            <span className="ml-auto text-[11px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">待审核</span>
          </div>

          {/* ────── Customer cert content ────── */}
          {isCustomer && customerData && (
            <>
              {/* Enterprise info */}
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden">
                <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, var(--brand), #7c3aed)' }} />
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4" style={{ color: BRAND }} />
                    <span className="text-[13px] text-[var(--text-primary)]">企业基本信息</span>
                  </div>
                  <InfoRow icon={Building2} label="企业名称" value={customerData.companyName} />
                  <InfoRow icon={BadgeCheck} label="统一社会信用代码" value={customerData.creditCode} />
                  <InfoRow icon={MapPin} label="注册地址" value={customerData.address} />
                  <InfoRow icon={User} label="法定代表人" value={customerData.legalRepName} />
                </div>
              </div>

              {/* Contact info */}
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden">
                <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #06b6d4, var(--brand))' }} />
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4" style={{ color: 'var(--info)' }} />
                    <span className="text-[13px] text-[var(--text-primary)]">联系人信息</span>
                  </div>
                  <InfoRow icon={User} label="联系人姓名" value={customerData.contactName} />
                  <InfoRow icon={BadgeCheck} label="职务" value={customerData.contactTitle} />
                  <InfoRow icon={Phone} label="联系电话" value={customerData.contactPhone} />
                  <InfoRow icon={Mail} label="联系邮箱" value={customerData.contactEmail} />
                </div>
              </div>

              {/* Uploaded documents */}
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden">
                <button
                  className="w-full h-[3px]"
                  style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }}
                />
                <button
                  onClick={() => setDocsExpanded(!docsExpanded)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[var(--bg-hover)] transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                    <span className="text-[13px] text-[var(--text-primary)]">上传材料</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-green-50 text-green-700">3 份已上传</span>
                  </div>
                  {docsExpanded
                    ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
                    : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />}
                </button>
                {docsExpanded && (
                  <div className="px-5 pb-4 grid grid-cols-3 gap-3">
                    <DocCard label="营业执照" note="JPG · 1.2 MB" onClick={() => setDocPreview({ label: '营业执照', note: 'JPG · 1.2 MB' })} />
                    <DocCard label="法定代表人身份证" note="PDF · 0.8 MB" onClick={() => setDocPreview({ label: '法定代表人身份证', note: 'PDF · 0.8 MB' })} />
                    <DocCard label="补充证明材料" note="PDF · 2.1 MB" onClick={() => setDocPreview({ label: '补充证明材料', note: 'PDF · 2.1 MB' })} />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ────── User cert content ────── */}
          {!isCustomer && userData && (
            <>
              {/* Identity */}
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden">
                <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, var(--brand), #7c3aed)' }} />
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    {userData.isTeam
                      ? <Users className="w-4 h-4" style={{ color: BRAND }} />
                      : <User className="w-4 h-4" style={{ color: BRAND }} />}
                    <span className="text-[13px] text-[var(--text-primary)]">申请身份</span>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[11px]"
                      style={{ backgroundColor: 'var(--brand-subtle)', color: BRAND }}>
                      {userData.isTeam ? `团队认证 · ${userData.teamName || '未命名团队'}` : '个人认证'}
                    </span>
                  </div>
                  <div className="text-[12px] text-[var(--text-tertiary)] mb-1">技能标签</div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {userData.skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-[11px]"
                        style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>{s}</span>
                    ))}
                  </div>
                  <div className="text-[12px] text-[var(--text-tertiary)] mb-1">工作经验</div>
                  <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{userData.experience}</div>
                </div>
              </div>

              {/* Capability intro */}
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden">
                <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }} />
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                    <span className="text-[13px] text-[var(--text-primary)]">能力背景介绍</span>
                  </div>
                  <div className="bg-[#f9f9fb] rounded-lg p-3 text-[13px] text-[var(--text-secondary)] leading-relaxed border border-[var(--border-subtle)]">
                    {userData.capabilityIntro}
                  </div>
                </div>
              </div>

              {/* Qualification certs */}
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden">
                <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #06b6d4, var(--brand))' }} />
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BadgeCheck className="w-4 h-4" style={{ color: 'var(--info)' }} />
                    <span className="text-[13px] text-[var(--text-primary)]">资质证书</span>
                  </div>
                  <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {userData.qualificationCerts}
                  </div>

                  {/* Uploaded docs */}
                  <div className="mt-4">
                    <div className="text-[12px] text-[var(--text-tertiary)] mb-2">上传材料</div>
                    <div className="grid grid-cols-2 gap-3">
                      <DocCard label="资质证书扫描件" note="PDF · 1.4 MB" onClick={() => setDocPreview({ label: '资质证书扫描件', note: 'PDF · 1.4 MB' })} />
                      <DocCard label="项目经历佐证材料" note="ZIP · 3.6 MB" onClick={() => setDocPreview({ label: '项目经历佐证材料', note: 'ZIP · 3.6 MB' })} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Reject reason input ─────────────────────────────── */}
          {showRejectInput && (
            <div className="bg-red-50 border border-red-100 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-[13px] text-red-700">填写驳回原因（将推送给申请方）</span>
              </div>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={4}
                placeholder={
                  isCustomer
                    ? '例如：营业执照图片不清晰，法定代表人身份证信息与营业执照不一致，请重新上传清晰的证件照片...'
                    : '例如：能力介绍过于简单，缺少具体项目案例和可验证的资质证书信息，请补充后重新提交...'
                }
                className="w-full px-3 py-2.5 border border-red-200 rounded-lg text-[13px] text-[var(--text-primary)] bg-white resize-none outline-none focus:border-red-400 transition-colors"
              />
            </div>
          )}
        </div>

        {/* ── Footer actions ──────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-hover)]">
          {showRejectInput ? (
            <div className="flex gap-3">
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[13px] text-white transition-opacity disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--danger) 0%, #b91c1c 100%)' }}
              >
                <XCircle className="w-4 h-4" />
                确认驳回
              </button>
              <button
                onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
                className="px-6 py-2.5 rounded-md border-2 border-gray-200 text-[13px] text-[var(--text-secondary)] hover:bg-white transition-colors"
              >
                取消
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={onApprove}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[13px] text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1e8c58 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}
              >
                <CheckCircle className="w-4 h-4" />
                通过认证
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md border-2 text-[13px] transition-colors hover:bg-red-50"
                style={{ borderColor: '#fca5a5', color: 'var(--danger)' }}
              >
                <XCircle className="w-4 h-4" />
                驳回申请
              </button>
              <button onClick={onClose}
                className="px-5 py-2.5 rounded-md border-2 border-gray-200 text-[13px] text-[var(--text-secondary)] hover:bg-white transition-colors">
                暂缓
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Document Preview Modal ── */}
      {docPreview && (
        <DocPreviewModal
          label={docPreview.label}
          note={docPreview.note}
          onClose={() => setDocPreview(null)}
        />
      )}
    </div>
  );
}
