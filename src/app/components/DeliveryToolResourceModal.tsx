import { useState } from 'react';
import { X, Copy, Check, Key, AlertCircle } from 'lucide-react';

// 工具资源数据结构
interface ToolResource {
  toolId: string;
  toolName: string;
  resourceText: string; // 直接存储完整的资源文本
}

interface DeliveryToolResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderTitle: string;
  selectedTools: string[]; // 已配置的工具ID列表
}

export function DeliveryToolResourceModal({
  isOpen,
  onClose,
  orderId,
  orderTitle,
  selectedTools
}: DeliveryToolResourceModalProps) {
  // 模拟每个工具的资源数据（运营端配置的任意格式文本）
  const mockResources: Record<string, ToolResource> = {
    cursor: {
      toolId: 'cursor',
      toolName: 'Cursor',
      resourceText: `Cursor 开发工具资源
================================

API Key: cur_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Workspace ID: workspace_abc123456789

有效期：2026-06-11
当前用量：125/1000 次调用

使用说明：
1. 此 API Key 仅用于本订单，请妥善保管
2. 不要泄露给第三方
3. 如有问题请联系运营人员`
    },
    trae: {
      toolId: 'trae',
      toolName: 'Trae',
      resourceText: `Trae 协同开发平台
================================

登录地址：https://app.trae.ai/login
账号：user_order_1001@trae.ai
密码：Tr@e2026Pass!@#$

有效期：2026-06-11
当前用量：38/200 小时

重要提示：
- 首次登录后请修改密码
- 账号在订单结束后将自动失效
- 请勿分享账号给他人`
    },
    vscode: {
      toolId: 'vscode',
      toolName: 'VS Code',
      resourceText: `VS Code Premium 扩展包
================================

激活码：VSCODE-2026-ABCD-1234-EFGH-5678

有效期：2026-12-31

说明：
VS Code 本身免费，此激活码用于激活 Premium 扩展包
在扩展设置中输入激活码即可使用`
    },
    'github-copilot': {
      toolId: 'github-copilot',
      toolName: 'GitHub Copilot',
      resourceText: `GitHub Copilot 访问令牌
================================

Access Token: ghp_a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8
Organization: csdn-order-1001

有效期：2026-06-11
当前用量：1250/10000 行代码

使用方式：
在 IDE 中配置 GitHub Copilot 时输入此 Token
Token 具有只读权限，仅可用于代码补全功能`
    },
    notion: {
      toolId: 'notion',
      toolName: 'Notion',
      resourceText: `Notion 工作空间账号
================================

邮箱账号：order1001.notion@csdn-orders.com
密码：Notion@2026#Order1001
Workspace：CSDN订单1001工作空间

有效期：2026-06-11

注意事项：
- 登录后可访问共享工作空间
- 请勿删除或修改已有页面结构
- 可自由创建新页面用于协作`
    }
  };

  // 复制状态管理
  const [copiedTools, setCopiedTools] = useState<Set<string>>(new Set());

  // 获取当前选中工具的资源
  const currentResources = selectedTools
    .map(toolId => mockResources[toolId])
    .filter(Boolean);

  // 复制到剪贴板
  const copyToClipboard = (text: string, toolId: string) => {
    // 使用备用方案：创建临时textarea元素
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      setCopiedTools(new Set([...copiedTools, toolId]));
      setTimeout(() => {
        setCopiedTools(prev => {
          const newSet = new Set(prev);
          newSet.delete(toolId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('复制失败:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e3f2fd] rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-[#1976d2]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">开发资源获取</h2>
              <p className="text-sm text-[var(--text-tertiary)]">订单 #{orderId} - {orderTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* 弹窗内容 */}
        <div className="flex-1 overflow-auto p-6">
          {/* 安全提示 */}
          <div className="mb-6 p-4 bg-[#fff8e1] border-l-4 border-[#f57c00] rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#f57c00] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[var(--text-primary)]">
                <p className="font-medium mb-1">安全提示</p>
                <p className="text-[var(--text-secondary)]">
                  以下资源仅供本订单使用，请妥善保管，不要分享给他人。所有资源在订单结束后将自动失效。
                </p>
              </div>
            </div>
          </div>

          {/* 工具资源列表 */}
          {currentResources.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-tertiary)]">
              <Key className="w-12 h-12 mx-auto mb-4 text-[var(--text-disabled)]" />
              <p>暂无可用资源</p>
              <p className="text-sm mt-2">请先配置交付工具</p>
            </div>
          ) : (
            <div className="space-y-5">
              {currentResources.map((resource) => {
                const isCopied = copiedTools.has(resource.toolId);
                
                return (
                  <div 
                    key={resource.toolId} 
                    className="border border-[var(--border-subtle)] rounded-lg overflow-hidden"
                  >
                    {/* 工具标题 */}
                    <div className="bg-[var(--bg-hover)] px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-[var(--brand)]" />
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">
                          {resource.toolName}
                        </h3>
                      </div>
                      
                      <button
                        onClick={() => copyToClipboard(resource.resourceText, resource.toolId)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-white border border-[var(--border-subtle)] rounded-full text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] hover:border-[var(--brand)] transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 text-[#52c41a]" />
                            <span className="text-[#52c41a]">已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>复制全部</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 资源文本框 */}
                    <div className="p-5">
                      <textarea
                        readOnly
                        value={resource.resourceText}
                        className="w-full h-64 px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-lg font-mono text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:bg-white"
                        onClick={(e) => e.currentTarget.select()}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 弹窗底部 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-hover)]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand-hover)] transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}