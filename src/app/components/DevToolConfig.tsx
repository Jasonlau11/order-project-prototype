import { useState } from 'react';
import { Plus, Save, Trash2, AlertCircle, CheckCircle, ArrowLeft, Copy, Info, Edit2, Search, X } from 'lucide-react';

// 工具分类枚举
type ToolCategory = '文档工具' | '文档创作工具' | '原型设计工具' | '音视频生成工具' | '开发工具' | '其他';

// 配置层级
type ConfigScope = 'task-type' | 'order';

// 工具数据结构
interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
}

// 配置数据结构
interface ToolConfig {
  id: string;
  scope: ConfigScope;
  scopeRefId: string;
  scopeRefName: string;
  optionalTools: string[];
  requiredTools: string[];
  allowMultiSelect: boolean;
}

// 预设工具列表
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

// 模拟任务类型数据
const taskTypes = [
  { id: 'dev-1', name: '软件开发' },
  { id: 'design-1', name: '平面设计' },
  { id: 'video-1', name: '视频创作' },
  { id: 'hardware-1', name: '硬件订单' },
  { id: 'text-1', name: '文本创作' },
  { id: 'test-1', name: '产品评测' },
  { id: 'marketing-1', name: '营销推广' },
];

// 模拟订单数据
const orders = [
  { id: 'order-1', title: 'AI智能问答系统开发', taskType: '软件开发' },
  { id: 'order-2', title: '企业官网UI设计', taskType: '平面设计' },
  { id: 'order-3', title: '产品宣传视频制作', taskType: '视频创作' },
];

export function DevToolConfig({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [configScope, setConfigScope] = useState<ConfigScope>('task-type');
  const [selectedScopeRef, setSelectedScopeRef] = useState('');
  const [selectedOptionalTools, setSelectedOptionalTools] = useState<string[]>([]);
  const [selectedRequiredTools, setSelectedRequiredTools] = useState<string[]>([]);
  const [allowMultiSelect, setAllowMultiSelect] = useState(true);
  const [filterCategory, setFilterCategory] = useState<ToolCategory | ''>('');
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [overriddenOrders, setOverriddenOrders] = useState<Set<string>>(new Set());
  const [highlightedConfigId, setHighlightedConfigId] = useState<string | null>(null);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);

  // 模拟已保存的配置
  const [savedConfigs, setSavedConfigs] = useState<ToolConfig[]>([
    {
      id: 'config-1',
      scope: 'task-type',
      scopeRefId: 'dev-1',
      scopeRefName: '软件开发',
      optionalTools: ['cursor', 'trae', 'vscode', 'github-copilot', 'notion'],
      requiredTools: ['trae'],
      allowMultiSelect: true
    }
  ]);

  const categories: ToolCategory[] = ['开发工具', '文档工具', '文档创作工具', '原型设计工具', '音视频生成工具', '其他'];

  // 获取分类后的工具
  const getToolsByCategory = () => {
    const toolsByCategory: Record<ToolCategory, Tool[]> = {
      '开发工具': [],
      '文档工具': [],
      '文档创作工具': [],
      '原型设计工具': [],
      '音视频生成工具': [],
      '其他': []
    };
    
    availableTools.forEach(tool => {
      const matchesCategory = !filterCategory || tool.category === filterCategory;
      const matchesSearch = !toolSearchQuery || tool.name.toLowerCase().includes(toolSearchQuery.toLowerCase());
      if (matchesCategory && matchesSearch) {
        toolsByCategory[tool.category].push(tool);
      }
    });
    
    return toolsByCategory;
  };

  // 切换可选工具
  const toggleOptionalTool = (toolId: string) => {
    setSelectedOptionalTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  // 切换必选工具
  const toggleRequiredTool = (toolId: string) => {
    setSelectedRequiredTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  // 全选/取消全选分类工具
  const handleSelectAllInCategory = (category: ToolCategory, toolsInCategory: Tool[]) => {
    const toolIds = toolsInCategory.map(t => t.id);
    const allSelected = toolIds.every(id => selectedOptionalTools.includes(id));
    if (allSelected) {
      setSelectedOptionalTools(prev => prev.filter(id => !toolIds.includes(id)));
    } else {
      setSelectedOptionalTools(prev => [...new Set([...prev, ...toolIds])]);
    }
  };

  // 保存配置
  const handleSave = () => {
    // 校验
    if (!selectedScopeRef) {
      setSaveMessage({ type: 'error', text: '请选择配置对象（任务类型或订单）' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    if (selectedOptionalTools.length === 0) {
      setSaveMessage({ type: 'error', text: '请至少选择一个可选工具' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    // 校验必选工具必须在可选工具列表中
    const invalidRequired = selectedRequiredTools.filter(
      toolId => !selectedOptionalTools.includes(toolId)
    );

    if (invalidRequired.length > 0) {
      const invalidNames = invalidRequired.map(
        id => availableTools.find(t => t.id === id)?.name
      ).join('、');
      setSaveMessage({ 
        type: 'error', 
        text: `必选工具须包含在可选工具列表中，请调整配置：${invalidNames}` 
      });
      setTimeout(() => setSaveMessage(null), 5000);
      return;
    }

    // 获取对象名称
    let scopeRefName = '';
    if (configScope === 'task-type') {
      scopeRefName = taskTypes.find(t => t.id === selectedScopeRef)?.name || '';
    } else {
      scopeRefName = orders.find(o => o.id === selectedScopeRef)?.title || '';
    }

    // 保存
    const newConfig: ToolConfig = {
      id: editingConfigId || `config-${Date.now()}`,
      scope: configScope,
      scopeRefId: selectedScopeRef,
      scopeRefName,
      optionalTools: selectedOptionalTools,
      requiredTools: selectedRequiredTools,
      allowMultiSelect
    };

    if (editingConfigId) {
      setSavedConfigs(prev => prev.map(c => c.id === editingConfigId ? newConfig : c));
      setEditingConfigId(null);
      setSaveMessage({ type: 'success', text: '配置已更新！' });
    } else {
      setSavedConfigs(prev => [...prev, newConfig]);
      setSaveMessage({ type: 'success', text: '配置已保存！' });
    }
    
    // 保留表单状态，高亮条目
    setHighlightedConfigId(newConfig.id);
    setTimeout(() => setHighlightedConfigId(null), 3000);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // 编辑已有配置
  const handleEditConfig = (config: ToolConfig) => {
    setConfigScope(config.scope);
    setSelectedScopeRef(config.scopeRefId);
    setSelectedOptionalTools([...config.optionalTools]);
    setSelectedRequiredTools([...config.requiredTools]);
    setAllowMultiSelect(config.allowMultiSelect);
    setEditingConfigId(config.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 删除配置
  const handleDeleteConfig = (configId: string) => {
    setSavedConfigs(prev => prev.filter(c => c.id !== configId));
    setSaveMessage({ type: 'success', text: '配置已删除' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingConfigId(null);
    setSelectedScopeRef('');
    setSelectedOptionalTools([]);
    setSelectedRequiredTools([]);
    setAllowMultiSelect(true);
  };

  // 获取订单对应的任务类型
  const getOrderTaskType = (orderId: string): string => {
    const order = orders.find(o => o.id === orderId);
    const orderConfig = savedConfigs.find(c => c.scope === 'order' && c.scopeRefId === orderId);
    return orderConfig?.scopeRefName || order?.taskType || '';
  };

  // 获取任务类型对应的配置
  const getConfigForTaskType = (taskTypeName: string): ToolConfig | undefined => {
    return savedConfigs.find(c => c.scope === 'task-type' && c.scopeRefName === taskTypeName);
  };

  // 判断订单是否继承自任务类型配置
  const isOrderInheriting = (orderId: string): boolean => {
    if (overriddenOrders.has(orderId)) return false;
    const taskType = getOrderTaskType(orderId);
    return !!getConfigForTaskType(taskType);
  };

  // 获取继承的任务类型名称
  const getInheritedTaskTypeName = (orderId: string): string => {
    const taskType = getOrderTaskType(orderId);
    return taskType;
  };

  // 覆盖按钮：基于任务类型默认配置创建订单级配置
  const handleOverride = (orderId: string) => {
    const taskType = getOrderTaskType(orderId);
    const taskTypeConfig = getConfigForTaskType(taskType);
    if (!taskTypeConfig) return;

    const order = orders.find(o => o.id === orderId);
    const newConfig: ToolConfig = {
      id: `config-${Date.now()}`,
      scope: 'order',
      scopeRefId: orderId,
      scopeRefName: order?.title || '',
      optionalTools: [...taskTypeConfig.optionalTools],
      requiredTools: [...taskTypeConfig.requiredTools],
      allowMultiSelect: taskTypeConfig.allowMultiSelect
    };

    setSavedConfigs(prev => [...prev, newConfig]);
    setOverriddenOrders(prev => new Set([...prev, orderId]));
    setSaveMessage({ type: 'success', text: `已为「${order?.title || orderId}」创建独立的订单级配置` });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // 获取被订单级配置覆盖的任务类型名称列表
  const getOverriddenTaskTypes = (): Set<string> => {
    const overridden: Set<string> = new Set();
    savedConfigs.forEach(config => {
      if (config.scope === 'order') {
        const order = orders.find(o => o.id === config.scopeRefId);
        if (order && getConfigForTaskType(order.taskType)) {
          overridden.add(order.taskType);
        }
      }
    });
    return overridden;
  };

  // 获取工具名称
  const getToolName = (toolId: string) => {
    return availableTools.find(t => t.id === toolId)?.name || toolId;
  };

  return (
    <div className="w-full h-full bg-[var(--bg-hover)] overflow-auto">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* 返回按钮 */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('operation-dashboard')}
              className="flex items-center gap-2 px-4 py-2 mb-6 text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">返回运营看板</span>
            </button>
          )}

          {/* 页面标题 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold text-[var(--text-primary)]">开发工具配置</h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                configScope === 'task-type'
                  ? 'bg-[var(--brand-subtle)] text-[var(--brand)] border border-[var(--brand-ring)]'
                  : 'bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)]'
              }`}>
                {configScope === 'task-type' ? '任务类型级' : '订单级'}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">配置订单可选工具列表与必选工具</p>
          </div>

          {/* 配置优先级横幅 — 仅在订单级配置时显示 */}
          {configScope === 'order' && (
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3 bg-[#ebf5fb] border border-[#2980b9] border-l-4">
              <Info className="w-5 h-5 text-[#2980b9] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-[#2c3e50]">配置优先级：订单级 &gt; 任务类型级</div>
                <div className="text-xs text-[#7f8c8d] mt-1">
                  订单级配置会覆盖对应任务类型的默认配置，仅对当前订单生效
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：新建配置表单 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-[var(--border-subtle)] p-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
                  {editingConfigId ? '编辑配置' : '新建配置'}
                </h2>

                {/* 配置层级选择 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">配置层级</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setConfigScope('task-type');
                        setSelectedScopeRef('');
                      }}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg text-sm transition-all ${
                        configScope === 'task-type'
                          ? 'border-[var(--brand)] bg-[var(--brand-subtle)] text-[var(--brand)] font-medium'
                          : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-disabled)]'
                      }`}
                    >
                      按任务类型
                    </button>
                    <button
                      onClick={() => {
                        setConfigScope('order');
                        setSelectedScopeRef('');
                      }}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg text-sm transition-all ${
                        configScope === 'order'
                          ? 'border-[var(--brand)] bg-[var(--brand-subtle)] text-[var(--brand)] font-medium'
                          : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-disabled)]'
                      }`}
                    >
                      按订单
                    </button>
                  </div>
                </div>

                {/* 选择对象 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                    {configScope === 'task-type' ? '选择任务类型' : '选择订单'}
                  </label>
                  <select
                    value={selectedScopeRef}
                    onChange={(e) => setSelectedScopeRef(e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none"
                  >
                    <option value="">请选择</option>
                    {configScope === 'task-type' 
                      ? taskTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))
                      : orders.map(order => (
                          <option key={order.id} value={order.id}>
                            {order.title} ({order.taskType})
                          </option>
                        ))
                    }
                  </select>
                </div>

                {/* 配置继承信息 — 订单级且正在继承时显示 */}
                {configScope === 'order' && selectedScopeRef && isOrderInheriting(selectedScopeRef) && (
                  <div className="mb-6 p-4 rounded-lg flex items-center justify-between bg-[var(--bg-hover)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2">
                      <Copy className="w-4 h-4 text-[var(--text-tertiary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        当前使用<span className="text-[var(--brand)] font-medium">【{getInheritedTaskTypeName(selectedScopeRef)}】</span>的默认配置
                      </span>
                    </div>
                    <button
                      onClick={() => handleOverride(selectedScopeRef)}
                      className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 hover:bg-[var(--warning)] hover:text-white"
                      style={{
                        color: 'var(--warning)',
                        backgroundColor: 'var(--warning-bg)',
                        border: '1px solid var(--warning)',
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      覆盖
                    </button>
                  </div>
                )}

                {/* 是否允许多选 */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowMultiSelect}
                      onChange={(e) => setAllowMultiSelect(e.target.checked)}
                      className="w-5 h-5 text-[var(--brand)] border-[var(--text-disabled)] rounded focus:ring-[var(--brand)]"
                    />
                    <span className="text-sm text-[var(--text-secondary)]">允许用户多选工具</span>
                  </label>
                </div>

                {/* 分类筛选 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">工具分类筛选</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setFilterCategory('')}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        filterCategory === ''
                          ? 'bg-[var(--brand)] text-white'
                          : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
                      }`}
                    >
                      全部
                    </button>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setFilterCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                          filterCategory === category
                            ? 'bg-[var(--brand)] text-white'
                            : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 工具名称搜索 */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      value={toolSearchQuery}
                      onChange={(e) => setToolSearchQuery(e.target.value)}
                      placeholder="搜索工具名称..."
                      className="w-full pl-10 pr-4 py-2 border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                    />
                    {toolSearchQuery && (
                      <button
                        onClick={() => setToolSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 工具选择 */}
                <div className="mb-6">
                  <div className="border border-[var(--border-subtle)] rounded-lg p-4 max-h-96 overflow-auto">
                    {Object.entries(getToolsByCategory()).map(([category, tools]) => {
                      if (tools.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-4 last:mb-0">
                          <div className="text-sm font-medium text-[var(--text-primary)] mb-3 sticky top-0 bg-white py-2 flex items-center justify-between">
                            <span>{category}</span>
                            <button
                              onClick={() => handleSelectAllInCategory(category as ToolCategory, tools)}
                              className="text-xs text-[var(--brand)] hover:text-[var(--brand-hover)] font-normal"
                            >
                              {tools.every(t => selectedOptionalTools.includes(t.id)) ? '取消全选' : '全选'}
                            </button>
                          </div>
                          <div className="space-y-2">
                            {tools.map(tool => {
                              const isOptional = selectedOptionalTools.includes(tool.id);
                              const isRequired = selectedRequiredTools.includes(tool.id);
                              
                              return (
                                <div key={tool.id} className="flex items-center justify-between p-3 border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                                  <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isOptional}
                                        onChange={() => toggleOptionalTool(tool.id)}
                                        className="w-4 h-4 text-[var(--brand)] border-[var(--text-disabled)] rounded focus:ring-[var(--brand)]"
                                      />
                                      <span className="text-sm text-[var(--text-primary)]">{tool.name}</span>
                                    </label>
                                  </div>
                                  
                                  {isOptional && (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isRequired}
                                        onChange={() => toggleRequiredTool(tool.id)}
                                        className="w-4 h-4 text-[var(--brand)] border-[var(--text-disabled)] rounded focus:ring-[var(--brand)]"
                                      />
                                      <span className="text-xs text-[var(--brand)] font-medium">必选</span>
                                    </label>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 已选工具统计 */}
                <div className="mb-6 p-4 bg-[var(--bg-hover)] rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] mb-1">可选工具</div>
                      <div className="text-lg font-semibold text-[var(--brand)]">
                        {selectedOptionalTools.length} 个
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] mb-1">必选工具</div>
                      <div className="text-lg font-semibold text-[var(--warning)]">
                        {selectedRequiredTools.length} 个
                      </div>
                    </div>
                  </div>
                  {/* 分类维度统计 */}
                  <div className="border-t border-[var(--border-subtle)] pt-2">
                    <div className="text-[11px] text-[var(--text-tertiary)] mb-1.5">分类维度</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {categories.map(cat => {
                        const count = selectedOptionalTools.filter(id => availableTools.find(t => t.id === id)?.category === cat).length;
                        if (count === 0) return null;
                        return (
                          <span key={cat} className="text-xs">
                            <span className="text-[var(--text-tertiary)]">{cat}：</span>
                            <span className="text-[var(--brand)] font-medium">{count}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 保存消息 */}
                {saveMessage && (
                  <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                    saveMessage.type === 'success' 
                      ? 'bg-[var(--success-bg)] border-l-4 border-[var(--success-text)]'
                      : 'bg-[#ffebee] border-l-4 border-[var(--danger-text)]'
                  }`}>
                    {saveMessage.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-[var(--success-text)] flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-[var(--danger-text)] flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${
                      saveMessage.type === 'success' ? 'text-[var(--success-text)]' : 'text-[var(--danger-text)]'
                    }`}>
                      {saveMessage.text}
                    </span>
                  </div>
                )}

                {/* 保存/更新按钮 */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand-hover)] transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingConfigId ? '更新配置' : '保存配置'}</span>
                  </button>
                  {editingConfigId && (
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-3 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      取消编辑
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧：已保存的配置 */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-[var(--border-subtle)] p-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">已保存配置</h2>
                
                {savedConfigs.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">
                    暂无配置
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedConfigs.map(config => {
                      let isOverride = false;
                      if (config.scope === 'order') {
                        const order = orders.find(o => o.id === config.scopeRefId);
                        if (order) {
                          isOverride = !!getConfigForTaskType(order.taskType);
                        }
                      }

                      const overriddenTaskTypes = getOverriddenTaskTypes();
                      const isOverriddenTaskType = config.scope === 'task-type' && overriddenTaskTypes.has(config.scopeRefName);
                      
                      return (
                      <div key={config.id}
                        onClick={() => handleEditConfig(config)}
                        className={`border rounded-lg p-4 transition-all duration-300 cursor-pointer ${
                          highlightedConfigId === config.id
                            ? 'border-[var(--brand)] bg-[var(--brand-subtle)] shadow-[0_0_0_3px_var(--brand-ring)]'
                            : editingConfigId === config.id
                            ? 'border-[var(--brand)] bg-[var(--brand-subtle)]'
                            : 'border-[var(--border-subtle)] hover:border-[var(--brand)] hover:shadow-sm'
                        }`}>
                        {/* Override badge — 订单级覆盖 */}
                        {isOverride && (
                          <div className="mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--warning-bg)] text-[var(--warning)] text-xs rounded font-medium">
                              已覆盖默认配置
                            </span>
                          </div>
                        )}

                        {/* 已被覆盖 badge — 任务类型配置被订单级覆盖 */}
                        {isOverriddenTaskType && (
                          <div className="mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ffebee] text-[var(--danger-text)] text-xs rounded font-medium">
                              已被覆盖
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-1">
                              {config.scopeRefName}
                            </div>
                            <div className="text-xs text-[var(--text-tertiary)]">
                              {config.scope === 'task-type' ? '任务类型' : '订单'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEditConfig(config)}
                              className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--brand)] hover:bg-[var(--brand-subtle)] rounded transition-colors"
                              title="编辑配置"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfig(config.id)}
                              className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--danger-text)] hover:bg-[#ffebee] rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-[var(--text-tertiary)]">可选工具：</span>
                            <span className="text-[var(--text-primary)]">
                              {config.optionalTools.map(id => getToolName(id)).join('、')}
                            </span>
                          </div>
                          
                          {config.requiredTools.length > 0 && (
                            <div>
                              <span className="text-[var(--text-tertiary)]">必选工具：</span>
                              <span className="text-[var(--brand)] font-medium">
                                {config.requiredTools.map(id => getToolName(id)).join('、')}
                              </span>
                            </div>
                          )}

                          <div>
                            <span className="text-[var(--text-tertiary)]">允许多选：</span>
                            <span className={config.allowMultiSelect ? 'text-[var(--success-text)]' : 'text-[var(--text-secondary)]'}>
                              {config.allowMultiSelect ? '是' : '否'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}