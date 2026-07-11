import { X, Phone, Mail, MessageSquare } from 'lucide-react';

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderTitle: string;
  customerName: string;
}

export function ContactInfoModal({
  isOpen,
  onClose,
  orderId,
  orderTitle,
  customerName
}: ContactInfoModalProps) {
  if (!isOpen) return null;

  // 模拟客户联系方式数据
  const contactInfo = {
    company: customerName,
    contact: '张经理',
    phone: '138****8888',
    email: 'contact@example.com',
    wechat: 'customer_wechat',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-[var(--shadow-modal)] w-full max-w-md">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">联系发单客户</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-6">
          {/* 订单信息 */}
          <div className="mb-6 p-4 bg-[var(--bg-hover)] rounded-lg">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">订单信息</div>
            <div className="text-sm text-[var(--text-primary)] font-medium">{orderTitle}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">订单编号：#{orderId}</div>
          </div>

          {/* 客户联系方式 */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-[var(--text-primary)] mb-3">客户联系方式</div>

            {/* 公司名称 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand)] to-[#FF9D7E] flex items-center justify-center text-white font-medium flex-shrink-0">
                {contactInfo.company.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)]">{contactInfo.company}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">联系人：{contactInfo.contact}</div>
              </div>
            </div>

            {/* 联系方式列表 */}
            <div className="space-y-3 pt-2">
              {/* 电话 */}
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-hover)] rounded-lg hover:bg-[var(--border-subtle)] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-[var(--brand)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--text-tertiary)]">联系电话</div>
                  <div className="text-sm text-[var(--text-primary)] font-medium">{contactInfo.phone}</div>
                </div>
                <button
                  onClick={() => alert('拨打电话：' + contactInfo.phone)}
                  className="text-xs text-[var(--brand)] hover:underline flex-shrink-0"
                >
                  拨打
                </button>
              </div>

              {/* 邮箱 */}
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-hover)] rounded-lg hover:bg-[var(--border-subtle)] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-[var(--brand)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--text-tertiary)]">电子邮箱</div>
                  <div className="text-sm text-[var(--text-primary)] font-medium truncate">{contactInfo.email}</div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(contactInfo.email);
                    alert('邮箱已复制到剪贴板');
                  }}
                  className="text-xs text-[var(--brand)] hover:underline flex-shrink-0"
                >
                  复制
                </button>
              </div>

              {/* 微信 */}
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-hover)] rounded-lg hover:bg-[var(--border-subtle)] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-[var(--brand)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--text-tertiary)]">微信号</div>
                  <div className="text-sm text-[var(--text-primary)] font-medium">{contactInfo.wechat}</div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(contactInfo.wechat);
                    alert('微信号已复制到剪贴板');
                  }}
                  className="text-xs text-[var(--brand)] hover:underline flex-shrink-0"
                >
                  复制
                </button>
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="mt-6 p-3 bg-[var(--brand-subtle)] border border-[var(--brand)]/20 rounded-lg">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              <span className="text-[var(--brand)] font-medium">温馨提示：</span>
              请在确认接单前与客户充分沟通订单细节、交付标准、时间安排等重要事项，确保双方达成一致。
            </p>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg text-sm hover:bg-[var(--bg-hover)] transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
