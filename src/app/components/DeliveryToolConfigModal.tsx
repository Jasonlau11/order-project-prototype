import { useState } from 'react';
import { X, Save, AlertCircle, CheckCircle, Wrench } from 'lucide-react';

// 工具分类枚举
type ToolCategory = '文档工具' | '文档创作工具' | '原型设计工具' | '音视频生成工具' | '开发工具' | '其他';

// 工具数据结构
interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
}

// 预设工具列表（与DevToolConfig保持一致）
const availableTools: Tool[] = [
  // 开发工具
  { id: 'cursor', name: 'Cursor', category: '开发工具' },
  { id: 'trae', name: 'Trae', category: '开发工具' },
  { id: 'vscode', name: 'VS Code', category: '开发工具' },
  { id: 'webstorm', name: 'WebStorm', category: '开发工具' },
  { id: 'github-copilot', name: 'GitHub Copilot', category: '开发工具' },
  
  // 文档工具
  { id: 'notion', name: 'Notion', category: '文档工具' },
  { id: 'confluence', name: 'Confluence', category: '文档工具' },
  { id: 'feishu-doc', name: '飞书文档', category: '文档工具' },
  
  // 文档创作工具
  { id: 'typora', name: 'Typora', category: '文档创作工具' },
  { id: 'markdown-editor', name: 'Markdown编辑器', category: '文档创作工具' },
  { id: 'latex', name: 'LaTeX', category: '文档创作工具' },
  
  // 原型设计工具
  { id: 'figma', name: 'Figma', category: '原型设计工具' },
  { id: 'sketch', name: 'Sketch', category: '原型设计工具' },
  { id: 'axure', name: 'Axure RP', category: '原型设计工具' },
  { id: 'xd', name: 'Adobe XD', category: '原型设计工具' },
  
  // 音视频生成工具
  { id: 'premiere', name: 'Adobe Premiere', category: '音视频生成工具' },
  { id: 'final-cut', name: 'Final Cut Pro', category: '音视频生成工具' },
  { id: 'davinci', name: 'DaVinci Resolve', category: '音视频生成工具' },
  { id: '剪映', name: '剪映', category: '音视频生成工具' },
];

interface DeliveryToolConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderTitle?: string;
  selectedTools?: string[];
  onSave: (selectedTools: string[]) => void;
}

export function DeliveryToolConfigModal({
  isOpen,
  onClose,
  orderId,
  orderTitle,
  selectedTools: initialSelectedTools = [],
  onSave
}: DeliveryToolConfigModalProps) {
  // 模拟运营配置的可选工具列表和必选工具（根据订单或任务类型）
  const [optionalToolIds] = useState<string[]>(['cursor', 'trae', 'vscode', 'webstorm', 'github-copilot', 'notion', 'confluence', 'feishu-doc', 'typora', 'markdown-editor', 'latex', 'figma', 'sketch', 'axure', 'xd', 'premiere', 'final-cut', 'davinci', '剪映']);
  const [requiredToolIds] = useState<string[]>(['trae']); // Trae为必选
  
  const [selectedTools, setSelectedTools] = useState<string[]>(initialSelectedTools);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 获取可选工具列表
  const optionalTools = availableTools.filter(tool => optionalToolIds.includes(tool.id));
  
  // 按分类分组
  const toolsByCategory = optionalTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<ToolCategory, Tool[]>);

  // 切换工具选择
  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  // 获取工具名称
  const getToolName = (toolId: string) => {
    return availableTools.find(t => t.id === toolId)?.name || toolId;
  };

  // 保存配置
  const handleSave = () => {
    // 校验必选工具
    const missingRequired = requiredToolIds.filter(
      toolId => !selectedTools.includes(toolId)
    );

    if (missingRequired.length > 0) {
      const missingNames = missingRequired.map(getToolName).join('、');
      setSaveMessage({ 
        type: 'error', 
        text: `请至少选择必选工具：${missingNames}` 
      });
      setTimeout(() => setSaveMessage(null), 5000);
      return;
    }

    if (selectedTools.length === 0) {
      setSaveMessage({ type: 'error', text: '请至少选择一个工具' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    // 保存成功
    setSaveMessage({ type: 'success', text: '交付工具已保存！' });
    setTimeout(() => {
      setSaveMessage(null);
      onSave(selectedTools);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--brand-subtle)] rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[var(--brand)]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">配置交付工具</h2>
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
          {/* 提示信息 */}
          <div className="mb-6 p-4 bg-[#e7f5ff] border-l-4 border-[#0066cc] rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#0066cc] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[var(--text-primary)]">
                <p className="mb-2">请从下方可选工具列表中选择本订单采用的交付工具。</p>
                <p className="text-[var(--text-secondary)]">
                  <span className="text-[var(--brand)] font-medium">必选工具</span> 必须勾选，
                  您可以选择多个工具协同交付（如 Cursor + Trae）。
                </p>
              </div>
            </div>
          </div>

          {/* 已选工具统计 */}
          <div className="mb-6 p-4 bg-[var(--bg-hover)] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-secondary)]">已选工具</span>
              <span className="text-lg font-semibold text-[var(--brand)]">
                {selectedTools.length} / {optionalToolIds.length}
              </span>
            </div>
            {selectedTools.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {selectedTools.map(toolId => (
                  <span 
                    key={toolId}
                    className="px-3 py-1 bg-white border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-primary)]"
                  >
                    {getToolName(toolId)}
                    {requiredToolIds.includes(toolId) && (
                      <span className="ml-1 text-[var(--brand)]">*</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 工具列表（按分类） */}
          {optionalToolIds.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-tertiary)]">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[var(--text-disabled)]" />
              <p>暂无可选交付工具，请联系运营配置</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(toolsByCategory).map(([category, tools]) => {
                if (tools.length === 0) return null;
                
                return (
                  <div key={category} className="border border-[var(--border-subtle)] rounded-lg p-4">
                    <div className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                      {category}
                    </div>
                    <div className="space-y-2">
                      {tools.map(tool => {
                        const isSelected = selectedTools.includes(tool.id);
                        const isRequired = requiredToolIds.includes(tool.id);
                        
                        return (
                          <label 
                            key={tool.id}
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-[var(--brand)] bg-[var(--brand-subtle)]' 
                                : 'border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleTool(tool.id)}
                                className="w-5 h-5 text-[var(--brand)] border-[var(--text-disabled)] rounded focus:ring-[var(--brand)]"
                              />
                              <span className={`text-sm ${isSelected ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                                {tool.name}
                              </span>
                            </div>
                            
                            {isRequired && (
                              <span className="px-2 py-1 bg-[var(--brand)] text-white text-xs rounded-full">
                                必选
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 保存消息 */}
          {saveMessage && (
            <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
              saveMessage.type === 'success' 
                ? 'bg-[var(--success-bg)] border-l-4 border-[var(--success)]'
                : 'bg-[#ffebee] border-l-4 border-[#c62828]'
            }`}>
              {saveMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#c62828] flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-sm ${
                saveMessage.type === 'success' ? 'text-[var(--success)]' : 'text-[#c62828]'
              }`}>
                {saveMessage.text}
              </span>
            </div>
          )}
        </div>

        {/* 弹窗底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-hover)]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg hover:bg-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand-hover)] transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>保存配置</span>
          </button>
        </div>
      </div>
    </div>
  );
}