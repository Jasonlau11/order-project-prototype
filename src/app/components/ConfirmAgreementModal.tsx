import { X, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface AgreementFile {
  fileName: string;
  fileSize: number;
  uploadTime: string;
  uploadBy: string; // 上传者（客户名称）
}

interface ConfirmAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderTitle: string;
  agreementFile: AgreementFile | null;
  onConfirm: (orderId: number) => void;
  onDownload: (orderId: number) => void;
}

export function ConfirmAgreementModal({
  isOpen,
  onClose,
  orderId,
  orderTitle,
  agreementFile,
  onConfirm,
  onDownload
}: ConfirmAgreementModalProps) {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleConfirm = () => {
    if (!checked) {
      alert('请先阅读协议并勾选确认');
      return;
    }

    if (confirm('确认此协议吗？\n\n确认后协议将提交平台审核，审核通过后订单将进入交付阶段。')) {
      onConfirm(orderId);
      handleClose();
    }
  };

  const handleDownload = () => {
    onDownload(orderId);
  };

  const handleClose = () => {
    setChecked(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* 弹窗标题 */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">确认协议</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">订单：{orderTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="space-y-6">
            {/* 提示信息 */}
            <div className="bg-[var(--brand-subtle)] border-l-4 border-[var(--brand)] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--brand)] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-[var(--text-secondary)]">
                  <p className="font-medium text-[var(--text-primary)] mb-2">重要说明：</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>客户已上传三方协议文件，请下载并仔细阅读协议内容</li>
                    <li>确认协议内容无误后，请勾选确认并提交</li>
                    <li>确认后协议将提交平台审核，审核通过后订单进入交付阶段</li>
                    <li>如有疑问，请联系客户或平台客服</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 协议文件信息 */}
            {agreementFile ? (
              <div className="border border-[var(--border-subtle)] rounded-lg p-6">
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">协议文件</h3>
                
                <div className="bg-[var(--bg-hover)] rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="w-10 h-10 text-[var(--brand)] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] mb-2 break-all">
                          {agreementFile.fileName}
                        </div>
                        <div className="space-y-1 text-xs text-[var(--text-tertiary)]">
                          <div>文件大小：{formatFileSize(agreementFile.fileSize)}</div>
                          <div>上传时间：{agreementFile.uploadTime}</div>
                          <div>上传者：{agreementFile.uploadBy}</div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleDownload}
                      className="ml-4 px-4 py-2 bg-[var(--brand)] text-white rounded-full text-sm hover:bg-[var(--brand-hover)] transition-colors flex items-center gap-2 flex-shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      下载查看
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-[var(--border-subtle)] rounded-lg p-6 text-center text-[var(--text-tertiary)]">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无协议文件</p>
              </div>
            )}

            {/* 确认勾选 */}
            {agreementFile && (
              <div className="bg-[var(--bg-hover)] rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[var(--brand)] border-[var(--text-disabled)] rounded focus:ring-[var(--brand)] cursor-pointer"
                  />
                  <span className="text-sm text-[var(--text-primary)] flex-1">
                    我已下载并仔细阅读协议内容，确认协议条款无误，同意按照协议约定履行相关义务
                  </span>
                </label>
              </div>
            )}

            {/* 流程说明 */}
            <div className="bg-[var(--brand-subtle)] rounded-lg p-4">
              <p className="text-sm font-medium text-[var(--text-primary)] mb-3">协议确认流程：</p>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-5 h-5 text-[#52c41a]" />
                  <span>客户上传协议</span>
                </div>
                <span className="text-[var(--text-disabled)]">→</span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-[var(--brand)] text-white rounded-full flex items-center justify-center text-xs">
                    当前
                  </div>
                  <span className="font-medium text-[var(--brand)]">接单方确认</span>
                </div>
                <span className="text-[var(--text-disabled)]">→</span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 border-2 border-[var(--text-disabled)] text-[var(--text-disabled)] rounded-full flex items-center justify-center text-xs">
                    3
                  </div>
                  <span>平台审核</span>
                </div>
                <span className="text-[var(--text-disabled)]">→</span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 border-2 border-[var(--text-disabled)] text-[var(--text-disabled)] rounded-full flex items-center justify-center text-xs">
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
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--text-secondary)]">
              提示：确认后协议将提交平台审核
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-full text-sm hover:bg-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={!checked || !agreementFile}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  checked && agreementFile
                    ? 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]'
                    : 'bg-[var(--text-disabled)] text-white cursor-not-allowed'
                }`}
              >
                确认协议
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}