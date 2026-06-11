import { X, AlertCircle, Upload, FileText } from 'lucide-react';
import { useState } from 'react';

interface BidApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderTitle: string;
  onSubmit: (orderId: number, bidRemark: string, attachmentName?: string) => void;
}

export function BidApplicationModal({
  isOpen,
  onClose,
  orderId,
  orderTitle,
  onSubmit
}: BidApplicationModalProps) {
  const [bidRemark, setBidRemark] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    // 验证报名说明
    if (!bidRemark.trim()) {
      setError('请填写报名说明');
      return;
    }

    if (bidRemark.trim().length < 20) {
      setError('报名说明至少需要20个字符，建议详细说明您的优势和经验');
      return;
    }

    // 提交报名
    onSubmit(orderId, bidRemark, attachmentName || undefined);
    
    // 重置状态
    setBidRemark('');
    setAttachmentName('');
    setError('');
  };

  const handleClose = () => {
    setBidRemark('');
    setAttachmentName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* 弹窗标题 */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">报名订单</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">订单：{orderTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="space-y-6">
            {/* 提示信息 */}
            <div className="bg-[var(--brand-bg)] border-l-4 border-[var(--brand)] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--brand)] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-[var(--text-secondary)]">
                  <p className="font-medium text-[var(--text-primary)] mb-1">填写要求：</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>请真实、详细地说明您或您的团队承接此订单的优势</li>
                    <li>建议包含：相关经验、技能特长、成功案例、交付承诺等</li>
                    <li>建议字数在200字以上，让客户更全面地了解您</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 报名说明输入框 */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                报名说明 <span className="text-[var(--brand)]">*</span>
              </label>
              <textarea
                value={bidRemark}
                onChange={(e) => {
                  setBidRemark(e.target.value);
                  setError(''); // 清除错误提示
                }}
                placeholder="请简要说明您或您的团队承接此订单的优势，例如：&#10;&#10;1. 相关经验：我们团队在xxx领域有x年经验，成功完成过xx个类似项目...&#10;&#10;2. 技能特长：我们擅长xxx技术/工具，能够高质量完成xxx...&#10;&#10;3. 成功案例：曾为xxx客户提供过xxx服务，获得了xxx评价...&#10;&#10;4. 交付承诺：我们承诺在x天内完成xxx，保证xxx质量标准...&#10;&#10;（建议详细描述，让客户更好地了解您的能力）"
                rows={12}
                className={`w-full px-4 py-3 border ${
                  error ? 'border-[var(--brand)]' : 'border-[var(--border-subtle)]'
                } rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent text-sm text-[var(--text-primary)] leading-relaxed`}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-[var(--text-tertiary)]">
                  已输入 {bidRemark.length} 字符
                  {bidRemark.length < 200 && (
                    <span className="text-[var(--brand)] ml-2">（建议至少200字）</span>
                  )}
                </div>
                {error && (
                  <span className="text-xs text-[var(--brand)]">{error}</span>
                )}
              </div>
            </div>

            {/* 附件上传 */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                附件上传 <span className="text-xs text-[var(--text-tertiary)]">（选填）</span>
              </label>
              <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-lg p-6 text-center hover:border-[var(--brand)] hover:bg-[var(--brand-bg)] transition-colors cursor-pointer"
                onClick={() => {
                  // 模拟文件上传
                  const mockName = `作品方案_${Date.now()}.pdf`;
                  setAttachmentName(mockName);
                }}
              >
                {attachmentName ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--brand)]" />
                    <span className="text-sm text-[var(--brand)] font-medium">{attachmentName}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachmentName('');
                      }}
                      className="ml-2 p-1 hover:bg-[var(--surface-hover)] rounded-full"
                    >
                      <X className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-[var(--text-tertiary)] mx-auto" />
                    <p className="text-sm text-[var(--text-tertiary)]">点击上传作品/方案（可选）</p>
                    <p className="text-xs text-[var(--text-tertiary)]">支持 PDF、Word、图片等格式</p>
                  </div>
                )}
              </div>
            </div>

            {/* 温馨提示 */}
            <div className="bg-[var(--brand-bg)] rounded-lg p-4">
              <p className="text-sm text-[var(--text-secondary)]">
                <span className="font-medium text-[var(--brand)]">温馨提示：</span>
                报名后，客户将看到您的报名信息。详细的报名说明有助于提高被选中的概率。
              </p>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="border-t border-[var(--border-subtle)] px-8 py-4 bg-[var(--surface-hover)]">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-sm hover:bg-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-[var(--brand)] text-white rounded-full text-sm font-medium hover:bg-[var(--brand-hover)] transition-colors"
            >
              提交报名
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}