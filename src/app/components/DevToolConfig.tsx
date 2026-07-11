import { useState } from 'react';
import {
  Plus,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Copy,
  Info,
  Edit2,
  Search,
  X,
  KeyRound,
  Database,
  Settings2,
  ShieldCheck,
  LockKeyhole,
} from 'lucide-react';

type ToolCategory = '文档工具' | '文档创作工具' | '原型设计工具' | '音视频生成工具' | '开发工具' | '其他';
type ConfigScope = 'task-type' | 'order';
type ResourceMode = 'none' | 'api-key' | 'account-password' | 'activation-code' | 'external-auth' | 'manual';
type ToolStatus = 'enabled' | 'disabled';
type ResourceType = 'api-key' | 'account-password' | 'activation-code' | 'external-auth' | 'other';
type ResourceStatus = 'available' | 'assigned' | 'expired' | 'disabled';

interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  resourceMode: ResourceMode;
  supportUsageStats: boolean;
  needRecycle: boolean;
  status: ToolStatus;
}

interface ToolResource {
  id: string;
  toolId: string;
  type: ResourceType;
  name: string;
  identifier: string;
  secret: string;
  status: ResourceStatus;
  assignedOrderId?: string;
  assignedUser?: string;
  expireAt?: string;
  remark?: string;
}

interface ToolConfig {
  id: string;
  scope: ConfigScope;
  scopeRefId: string;
  scopeRefName: string;
  optionalTools: string[];
  requiredTools: string[];
  allowMultiSelect: boolean;
}

const categories: ToolCategory[] = ['开发工具', '文档工具', '文档创作工具', '原型设计工具', '音视频生成工具', '其他'];

const resourceModeLabels: Record<ResourceMode, string> = {
  none: '无需发放',
  'api-key': 'API Key',
  'account-password': '账号密码',
  'activation-code': '激活码',
  'external-auth': '外部授权',
  manual: '人工发放',
};

const resourceTypeLabels: Record<ResourceType, string> = {
  'api-key': 'API Key',
  'account-password': '账号密码',
  'activation-code': '激活码',
  'external-auth': '外部授权',
  other: '其他',
};

const resourceStatusLabels: Record<ResourceStatus, string> = {
  available: '可用',
  assigned: '已分配',
  expired: '已失效',
  disabled: '已停用',
};

const resourceStatusClasses: Record<ResourceStatus, string> = {
  available: 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-text)]',
  assigned: 'bg-[var(--brand-subtle)] text-[var(--brand)] border-[var(--brand-ring)]',
  expired: 'bg-[#ffebee] text-[var(--danger-text)] border-[var(--danger-text)]',
  disabled: 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] border-[var(--border-subtle)]',
};

const INITIAL_AVAILABLE_TOOLS: Tool[] = [
  { id: 'cursor', name: 'Cursor', category: '开发工具', resourceMode: 'account-password', supportUsageStats: true, needRecycle: true, status: 'enabled' },
  { id: 'trae', name: 'Trae', category: '开发工具', resourceMode: 'activation-code', supportUsageStats: true, needRecycle: false, status: 'enabled' },
  { id: 'vscode', name: 'VS Code', category: '开发工具', resourceMode: 'none', supportUsageStats: false, needRecycle: false, status: 'enabled' },
  { id: 'webstorm', name: 'WebStorm', category: '开发工具', resourceMode: 'activation-code', supportUsageStats: false, needRecycle: false, status: 'enabled' },
  { id: 'github-copilot', name: 'GitHub Copilot', category: '开发工具', resourceMode: 'account-password', supportUsageStats: true, needRecycle: true, status: 'enabled' },
  { id: 'notion', name: 'Notion', category: '文档工具', resourceMode: 'external-auth', supportUsageStats: false, needRecycle: true, status: 'enabled' },
  { id: 'confluence', name: 'Confluence', category: '文档工具', resourceMode: 'account-password', supportUsageStats: false, needRecycle: true, status: 'enabled' },
  { id: 'feishu-doc', name: '飞书文档', category: '文档工具', resourceMode: 'external-auth', supportUsageStats: false, needRecycle: true, status: 'enabled' },
  { id: 'typora', name: 'Typora', category: '文档创作工具', resourceMode: 'activation-code', supportUsageStats: false, needRecycle: false, status: 'enabled' },
  { id: 'markdown-editor', name: 'Markdown编辑器', category: '文档创作工具', resourceMode: 'none', supportUsageStats: false, needRecycle: false, status: 'enabled' },
  { id: 'latex', name: 'LaTeX', category: '文档创作工具', resourceMode: 'none', supportUsageStats: false, needRecycle: false, status: 'enabled' },
  { id: 'figma', name: 'Figma', category: '原型设计工具', resourceMode: 'account-password', supportUsageStats: false, needRecycle: true, status: 'enabled' },
  { id: 'sketch', name: 'Sketch', category: '原型设计工具', resourceMode: 'activation-code', supportUsageStats: false, needRecycle: false, status: 'enabled' },
  { id: 'axure', name: 'Axure RP', category: '原型设计工具', resourceMode: 'activation-code', supportUsageStats: false, needRecycle: false, status: 'enabled' },
  { id: 'xd', name: 'Adobe XD', category: '原型设计工具', resourceMode: 'account-password', supportUsageStats: false, needRecycle: true, status: 'enabled' },
  { id: 'premiere', name: 'Adobe Premiere', category: '音视频生成工具', resourceMode: 'activation-code', supportUsageStats: false, needRecycle: false, status: 'enabled' },
  { id: 'final-cut', name: 'Final Cut Pro', category: '音视频生成工具', resourceMode: 'activation-code', supportUsageStats: false, needRecycle: false, status: 'enabled' },
  { id: 'davinci', name: 'DaVinci Resolve', category: '音视频生成工具', resourceMode: 'activation-code', supportUsageStats: false, needRecycle: false, status: 'enabled' },
  { id: 'jianying', name: '剪映', category: '音视频生成工具', resourceMode: 'account-password', supportUsageStats: false, needRecycle: true, status: 'enabled' },
];

const INITIAL_RESOURCES: ToolResource[] = [
  { id: 'res-1', toolId: 'cursor', type: 'account-password', name: 'Cursor 企业账号 01', identifier: 'cursor_team_001', secret: 'cursor_team_001 / Csdn@2026', status: 'available', expireAt: '2026-12-31', remark: '企业池账号，订单结束后回收' },
  { id: 'res-2', toolId: 'trae', type: 'activation-code', name: 'Trae 激活码 01', identifier: 'TRAE-****-0001', secret: 'TRAE-2026-ORDER-0001', status: 'available', expireAt: '2026-09-30' },
  { id: 'res-3', toolId: 'github-copilot', type: 'account-password', name: 'Copilot 席位 01', identifier: 'copilot_seat_01', secret: 'copilot_seat_01 / Github@2026', status: 'assigned', assignedOrderId: 'order-1', assignedUser: '李明', expireAt: '2026-10-31' },
  { id: 'res-4', toolId: 'figma', type: 'account-password', name: 'Figma 协作账号 01', identifier: 'figma_team_001', secret: 'figma_team_001 / Design@2026', status: 'available', expireAt: '2026-12-31' },
];

const taskTypes = [
  { id: 'dev-1', name: '软件开发' },
  { id: 'design-1', name: '平面设计' },
  { id: 'video-1', name: '视频创作' },
  { id: 'hardware-1', name: '硬件订单' },
  { id: 'text-1', name: '文本创作' },
  { id: 'test-1', name: '产品评测' },
  { id: 'marketing-1', name: '营销推广' },
];

const orders = [
  { id: 'order-1', title: 'AI智能问答系统开发', taskType: '软件开发' },
  { id: 'order-2', title: '企业官网UI设计', taskType: '平面设计' },
  { id: 'order-3', title: '产品宣传视频制作', taskType: '视频创作' },
];

const emptyToolForm = (): Tool => ({
  id: '',
  name: '',
  category: '开发工具',
  resourceMode: 'none',
  supportUsageStats: false,
  needRecycle: false,
  status: 'enabled',
});

const emptyResourceForm = (): Omit<ToolResource, 'id'> => ({
  toolId: '',
  type: 'api-key',
  name: '',
  identifier: '',
  secret: '',
  status: 'available',
  assignedOrderId: '',
  assignedUser: '',
  expireAt: '',
  remark: '',
});

export function DevToolConfig({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'resources' | 'config'>('catalog');
  const [availableTools, setAvailableTools] = useState<Tool[]>(INITIAL_AVAILABLE_TOOLS);
  const [resources, setResources] = useState<ToolResource[]>(INITIAL_RESOURCES);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [toolForm, setToolForm] = useState<Tool>(emptyToolForm());
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState<Omit<ToolResource, 'id'>>(emptyResourceForm());
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogFilterCategory, setCatalogFilterCategory] = useState<ToolCategory | ''>('');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [resourceToolFilter, setResourceToolFilter] = useState('');
  const [resourceStatusFilter, setResourceStatusFilter] = useState<ResourceStatus | ''>('');
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

  const [savedConfigs, setSavedConfigs] = useState<ToolConfig[]>([
    {
      id: 'config-1',
      scope: 'task-type',
      scopeRefId: 'dev-1',
      scopeRefName: '软件开发',
      optionalTools: ['cursor', 'trae', 'vscode', 'github-copilot', 'notion'],
      requiredTools: ['trae'],
      allowMultiSelect: true,
    },
  ]);

  const showMessage = (type: 'success' | 'error', text: string, duration = 3000) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), duration);
  };

  const slugifyToolId = (value: string) => value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const maskSecret = (value: string) => {
    if (!value) return '未填写';
    if (value.length <= 8) return '****';
    return `${value.slice(0, 3)}****${value.slice(-4)}`;
  };

  const getToolName = (toolId: string) => availableTools.find(t => t.id === toolId)?.name || toolId;
  const getTool = (toolId: string) => availableTools.find(t => t.id === toolId);

  const filteredCatalogTools = availableTools.filter(tool => {
    const matchesCategory = !catalogFilterCategory || tool.category === catalogFilterCategory;
    const query = catalogSearchQuery.trim().toLowerCase();
    const matchesSearch = !query || tool.name.toLowerCase().includes(query) || tool.id.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const filteredResources = resources.filter(resource => {
    const tool = getTool(resource.toolId);
    const query = resourceSearchQuery.trim().toLowerCase();
    const matchesSearch = !query
      || resource.name.toLowerCase().includes(query)
      || resource.identifier.toLowerCase().includes(query)
      || getToolName(resource.toolId).toLowerCase().includes(query);
    const matchesTool = !resourceToolFilter || resource.toolId === resourceToolFilter;
    const matchesStatus = !resourceStatusFilter || resource.status === resourceStatusFilter;
    return matchesSearch && matchesTool && matchesStatus && tool;
  });

  const resetToolForm = () => {
    setEditingToolId(null);
    setToolForm(emptyToolForm());
  };

  const resetResourceForm = () => {
    setEditingResourceId(null);
    setResourceForm(emptyResourceForm());
  };

  const handleEditTool = (tool: Tool) => {
    setEditingToolId(tool.id);
    setToolForm({ ...tool });
    setActiveTab('catalog');
  };

  const handleSaveTool = () => {
    const nextId = slugifyToolId(toolForm.id || toolForm.name);
    const nextName = toolForm.name.trim();

    if (!nextName) {
      showMessage('error', '请填写工具名称');
      return;
    }

    if (!nextId) {
      showMessage('error', '请填写有效的工具编码');
      return;
    }

    const duplicated = availableTools.some(tool => tool.id === nextId && tool.id !== editingToolId);
    if (duplicated) {
      showMessage('error', '工具编码已存在，请调整后再保存');
      return;
    }

    const nextTool: Tool = { ...toolForm, id: nextId, name: nextName };

    if (editingToolId) {
      setAvailableTools(prev => prev.map(tool => tool.id === editingToolId ? nextTool : tool));
      if (editingToolId !== nextId) {
        setSelectedOptionalTools(prev => prev.map(id => id === editingToolId ? nextId : id));
        setSelectedRequiredTools(prev => prev.map(id => id === editingToolId ? nextId : id));
        setSavedConfigs(prev => prev.map(config => ({
          ...config,
          optionalTools: config.optionalTools.map(id => id === editingToolId ? nextId : id),
          requiredTools: config.requiredTools.map(id => id === editingToolId ? nextId : id),
        })));
        setResources(prev => prev.map(resource => resource.toolId === editingToolId ? { ...resource, toolId: nextId } : resource));
      }
      showMessage('success', '工具已更新');
    } else {
      setAvailableTools(prev => [...prev, nextTool]);
      showMessage('success', '工具已添加，可在资源池和适用配置中使用');
    }

    resetToolForm();
  };

  const handleDeleteTool = (toolId: string) => {
    const isUsedByConfig = savedConfigs.some(config => config.optionalTools.includes(toolId) || config.requiredTools.includes(toolId));
    const hasResources = resources.some(resource => resource.toolId === toolId);
    if (isUsedByConfig || hasResources) {
      showMessage('error', '该工具已被配置或资源池引用，请先清理引用后再删除', 4000);
      return;
    }

    setAvailableTools(prev => prev.filter(tool => tool.id !== toolId));
    setSelectedOptionalTools(prev => prev.filter(id => id !== toolId));
    setSelectedRequiredTools(prev => prev.filter(id => id !== toolId));
    if (editingToolId === toolId) resetToolForm();
    showMessage('success', '工具已删除');
  };

  const handleEditResource = (resource: ToolResource) => {
    setEditingResourceId(resource.id);
    setResourceForm({
      toolId: resource.toolId,
      type: resource.type,
      name: resource.name,
      identifier: resource.identifier,
      secret: resource.secret,
      status: resource.status,
      assignedOrderId: resource.assignedOrderId || '',
      assignedUser: resource.assignedUser || '',
      expireAt: resource.expireAt || '',
      remark: resource.remark || '',
    });
    setActiveTab('resources');
  };

  const handleSaveResource = () => {
    if (!resourceForm.toolId) {
      showMessage('error', '请选择所属工具');
      return;
    }
    if (!resourceForm.name.trim()) {
      showMessage('error', '请填写资源名称');
      return;
    }
    if (!resourceForm.identifier.trim()) {
      showMessage('error', '请填写资源标识');
      return;
    }
    if (!resourceForm.secret.trim()) {
      showMessage('error', '请填写可发放的资源内容');
      return;
    }

    const nextResource: ToolResource = {
      id: editingResourceId || `res-${Date.now()}`,
      toolId: resourceForm.toolId,
      type: resourceForm.type,
      name: resourceForm.name.trim(),
      identifier: resourceForm.identifier.trim(),
      secret: resourceForm.secret.trim(),
      status: resourceForm.status,
      assignedOrderId: resourceForm.status === 'assigned' ? resourceForm.assignedOrderId || undefined : undefined,
      assignedUser: resourceForm.status === 'assigned' ? resourceForm.assignedUser || undefined : undefined,
      expireAt: resourceForm.expireAt || undefined,
      remark: resourceForm.remark || undefined,
    };

    if (editingResourceId) {
      setResources(prev => prev.map(resource => resource.id === editingResourceId ? nextResource : resource));
      showMessage('success', '资源已更新');
    } else {
      setResources(prev => [...prev, nextResource]);
      showMessage('success', '资源已加入资源池');
    }
    resetResourceForm();
  };

  const handleDeleteResource = (resourceId: string) => {
    const resource = resources.find(item => item.id === resourceId);
    if (resource?.status === 'assigned') {
      showMessage('error', '已分配资源不能直接删除，请先回收或置为失效', 4000);
      return;
    }
    setResources(prev => prev.filter(item => item.id !== resourceId));
    if (editingResourceId === resourceId) resetResourceForm();
    showMessage('success', '资源已删除');
  };

  const getToolsByCategory = () => {
    const toolsByCategory: Record<ToolCategory, Tool[]> = {
      '开发工具': [],
      '文档工具': [],
      '文档创作工具': [],
      '原型设计工具': [],
      '音视频生成工具': [],
      '其他': [],
    };

    availableTools.forEach(tool => {
      const matchesCategory = !filterCategory || tool.category === filterCategory;
      const matchesSearch = !toolSearchQuery || tool.name.toLowerCase().includes(toolSearchQuery.toLowerCase());
      if (matchesCategory && matchesSearch && tool.status === 'enabled') {
        toolsByCategory[tool.category].push(tool);
      }
    });

    return toolsByCategory;
  };

  const toggleOptionalTool = (toolId: string) => {
    setSelectedOptionalTools(prev => {
      if (prev.includes(toolId)) {
        setSelectedRequiredTools(current => current.filter(id => id !== toolId));
        return prev.filter(id => id !== toolId);
      }
      return [...prev, toolId];
    });
  };

  const toggleRequiredTool = (toolId: string) => {
    setSelectedRequiredTools(prev => prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]);
  };

  const handleSelectAllInCategory = (toolsInCategory: Tool[]) => {
    const toolIds = toolsInCategory.map(t => t.id);
    const allSelected = toolIds.every(id => selectedOptionalTools.includes(id));
    if (allSelected) {
      setSelectedOptionalTools(prev => prev.filter(id => !toolIds.includes(id)));
      setSelectedRequiredTools(prev => prev.filter(id => !toolIds.includes(id)));
    } else {
      setSelectedOptionalTools(prev => [...new Set([...prev, ...toolIds])]);
    }
  };

  const handleSave = () => {
    if (!selectedScopeRef) {
      showMessage('error', '请选择配置对象（任务类型或订单）');
      return;
    }

    if (selectedOptionalTools.length === 0) {
      showMessage('error', '请至少选择一个可选工具');
      return;
    }

    const invalidRequired = selectedRequiredTools.filter(toolId => !selectedOptionalTools.includes(toolId));
    if (invalidRequired.length > 0) {
      const invalidNames = invalidRequired.map(id => getToolName(id)).join('、');
      showMessage('error', `必选工具须包含在可选工具列表中，请调整配置：${invalidNames}`, 5000);
      return;
    }

    const scopeRefName = configScope === 'task-type'
      ? taskTypes.find(t => t.id === selectedScopeRef)?.name || ''
      : orders.find(o => o.id === selectedScopeRef)?.title || '';

    const newConfig: ToolConfig = {
      id: editingConfigId || `config-${Date.now()}`,
      scope: configScope,
      scopeRefId: selectedScopeRef,
      scopeRefName,
      optionalTools: selectedOptionalTools,
      requiredTools: selectedRequiredTools,
      allowMultiSelect,
    };

    if (editingConfigId) {
      setSavedConfigs(prev => prev.map(c => c.id === editingConfigId ? newConfig : c));
      setEditingConfigId(null);
      showMessage('success', '配置已更新');
    } else {
      setSavedConfigs(prev => [...prev, newConfig]);
      showMessage('success', '配置已保存');
    }

    setHighlightedConfigId(newConfig.id);
    setTimeout(() => setHighlightedConfigId(null), 3000);
  };

  const handleEditConfig = (config: ToolConfig) => {
    setConfigScope(config.scope);
    setSelectedScopeRef(config.scopeRefId);
    setSelectedOptionalTools([...config.optionalTools]);
    setSelectedRequiredTools([...config.requiredTools]);
    setAllowMultiSelect(config.allowMultiSelect);
    setEditingConfigId(config.id);
    setActiveTab('config');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfig = (configId: string) => {
    setSavedConfigs(prev => prev.filter(c => c.id !== configId));
    showMessage('success', '配置已删除');
  };

  const handleCancelEdit = () => {
    setEditingConfigId(null);
    setSelectedScopeRef('');
    setSelectedOptionalTools([]);
    setSelectedRequiredTools([]);
    setAllowMultiSelect(true);
  };

  const getOrderTaskType = (orderId: string): string => {
    const order = orders.find(o => o.id === orderId);
    const orderConfig = savedConfigs.find(c => c.scope === 'order' && c.scopeRefId === orderId);
    return orderConfig?.scopeRefName || order?.taskType || '';
  };

  const getConfigForTaskType = (taskTypeName: string): ToolConfig | undefined => savedConfigs.find(c => c.scope === 'task-type' && c.scopeRefName === taskTypeName);

  const isOrderInheriting = (orderId: string): boolean => {
    if (overriddenOrders.has(orderId)) return false;
    const taskType = getOrderTaskType(orderId);
    return !!getConfigForTaskType(taskType);
  };

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
      allowMultiSelect: taskTypeConfig.allowMultiSelect,
    };

    setSavedConfigs(prev => [...prev, newConfig]);
    setOverriddenOrders(prev => new Set([...prev, orderId]));
    showMessage('success', `已为「${order?.title || orderId}」创建独立的订单级配置`);
  };

  const getOverriddenTaskTypes = (): Set<string> => {
    const overridden: Set<string> = new Set();
    savedConfigs.forEach(config => {
      if (config.scope === 'order') {
        const order = orders.find(o => o.id === config.scopeRefId);
        if (order && getConfigForTaskType(order.taskType)) overridden.add(order.taskType);
      }
    });
    return overridden;
  };

  const resourceStats = {
    total: resources.length,
    available: resources.filter(item => item.status === 'available').length,
    assigned: resources.filter(item => item.status === 'assigned').length,
    risky: resources.filter(item => item.status === 'expired' || item.status === 'disabled').length,
  };

  const selectedToolsWithResource = selectedOptionalTools.filter(id => getTool(id)?.resourceMode !== 'none').length;

  return (
    <div className="w-full h-full bg-[var(--surface-page)] overflow-auto">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {onNavigate && (
            <button
              onClick={() => onNavigate('operation-dashboard')}
              className="flex items-center gap-2 px-4 py-2 mb-6 text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">返回运营看板</span>
            </button>
          )}

          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-semibold text-[var(--text-primary)]">开发工具配置</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--brand-subtle)] text-[var(--brand)] border border-[var(--brand-ring)]">
                  资源闭环
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">先维护工具目录，再维护可发放资源，最后按任务类型或订单配置适用范围。</p>
            </div>

            <div className="grid grid-cols-3 gap-3 min-w-[360px]">
              <div className="rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3">
                <div className="text-xs text-[var(--text-tertiary)]">工具</div>
                <div className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{availableTools.length}</div>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3">
                <div className="text-xs text-[var(--text-tertiary)]">可用资源</div>
                <div className="mt-1 text-xl font-semibold text-[var(--success-text)]">{resourceStats.available}</div>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3">
                <div className="text-xs text-[var(--text-tertiary)]">已分配</div>
                <div className="mt-1 text-xl font-semibold text-[var(--brand)]">{resourceStats.assigned}</div>
              </div>
            </div>
          </div>

          <div className="mb-6 inline-flex rounded-lg border border-[var(--border-subtle)] bg-white p-1 shadow-sm">
            {[
              { key: 'catalog', label: '工具目录', icon: Database },
              { key: 'resources', label: '资源池', icon: KeyRound },
              { key: 'config', label: '适用配置', icon: Settings2 },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as 'catalog' | 'resources' | 'config')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.key
                      ? 'bg-[var(--brand)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

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
              <span className={`text-sm ${saveMessage.type === 'success' ? 'text-[var(--success-text)]' : 'text-[var(--danger-text)]'}`}>{saveMessage.text}</span>
            </div>
          )}

          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-[var(--border-subtle)] p-6 sticky top-6">
                  <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">{editingToolId ? '编辑工具' : '新增工具'}</h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">定义工具本身及其资源发放规则。</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">工具名称</label>
                      <input value={toolForm.name} onChange={(e) => setToolForm(prev => ({ ...prev, name: e.target.value }))} placeholder="如 通义灵码" className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">工具编码</label>
                      <input value={toolForm.id} onChange={(e) => setToolForm(prev => ({ ...prev, id: e.target.value }))} placeholder="如 tongyi-lingma" className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">工具分类</label>
                      <select value={toolForm.category} onChange={(e) => setToolForm(prev => ({ ...prev, category: e.target.value as ToolCategory }))} className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none">
                        {categories.map(category => <option key={category} value={category}>{category}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">资源发放方式</label>
                      <select value={toolForm.resourceMode} onChange={(e) => setToolForm(prev => ({ ...prev, resourceMode: e.target.value as ResourceMode }))} className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none">
                        {Object.entries(resourceModeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-3 cursor-pointer hover:bg-[var(--bg-hover)]">
                        <input type="checkbox" checked={toolForm.supportUsageStats} onChange={(e) => setToolForm(prev => ({ ...prev, supportUsageStats: e.target.checked }))} className="w-4 h-4 text-[var(--brand)]" />
                        <span className="text-sm text-[var(--text-secondary)]">用量统计</span>
                      </label>
                      <label className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-3 cursor-pointer hover:bg-[var(--bg-hover)]">
                        <input type="checkbox" checked={toolForm.needRecycle} onChange={(e) => setToolForm(prev => ({ ...prev, needRecycle: e.target.checked }))} className="w-4 h-4 text-[var(--brand)]" />
                        <span className="text-sm text-[var(--text-secondary)]">需要回收</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">状态</label>
                      <select value={toolForm.status} onChange={(e) => setToolForm(prev => ({ ...prev, status: e.target.value as ToolStatus }))} className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none">
                        <option value="enabled">启用</option>
                        <option value="disabled">停用</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <button onClick={handleSaveTool} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand-hover)] transition-colors">
                      <Save className="w-4 h-4" />
                      <span>{editingToolId ? '更新工具' : '添加工具'}</span>
                    </button>
                    {editingToolId && <button onClick={resetToolForm} className="px-4 py-3 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors">取消</button>}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-[var(--border-subtle)] p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--text-primary)]">工具目录</h2>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">维护可选工具候选项和资源发放规则。</p>
                    </div>
                    <div className="text-sm text-[var(--text-tertiary)]">共 {availableTools.length} 个工具</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3 mb-5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                      <input value={catalogSearchQuery} onChange={(e) => setCatalogSearchQuery(e.target.value)} placeholder="搜索工具名称或编码..." className="w-full pl-10 pr-4 py-2.5 border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
                    </div>
                    <select value={catalogFilterCategory} onChange={(e) => setCatalogFilterCategory(e.target.value as ToolCategory | '')} className="px-4 py-2.5 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none">
                      <option value="">全部分类</option>
                      {categories.map(category => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    {filteredCatalogTools.map(tool => {
                      const isUsedByConfig = savedConfigs.some(config => config.optionalTools.includes(tool.id) || config.requiredTools.includes(tool.id));
                      const resourceCount = resources.filter(resource => resource.toolId === tool.id).length;
                      return (
                        <div key={tool.id} className="rounded-lg border border-[var(--border-subtle)] p-4 hover:border-[var(--brand-ring)] transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="text-sm font-medium text-[var(--text-primary)]">{tool.name}</div>
                                <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--brand-subtle)] text-[var(--brand)]">{tool.category}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${tool.status === 'enabled' ? 'bg-[var(--success-bg)] text-[var(--success-text)]' : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]'}`}>{tool.status === 'enabled' ? '启用' : '停用'}</span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-tertiary)]">
                                <span className="font-mono">{tool.id}</span>
                                <span>发放方式：{resourceModeLabels[tool.resourceMode]}</span>
                                <span>资源：{resourceCount} 个</span>
                                <span>用量统计：{tool.supportUsageStats ? '支持' : '不支持'}</span>
                                <span>回收：{tool.needRecycle ? '需要' : '不需要'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => handleEditTool(tool)} className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--brand)] hover:bg-[var(--brand-subtle)] rounded transition-colors" title="编辑工具"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteTool(tool.id)} disabled={isUsedByConfig || resourceCount > 0} className={`p-1.5 rounded transition-colors ${(isUsedByConfig || resourceCount > 0) ? 'text-[var(--text-disabled)] cursor-not-allowed' : 'text-[var(--text-tertiary)] hover:text-[var(--danger-text)] hover:bg-[#ffebee]'}`} title="删除工具"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredCatalogTools.length === 0 && <div className="text-center py-12 text-[var(--text-tertiary)] text-sm border border-dashed border-[var(--border-subtle)] rounded-lg">暂无匹配工具，可在左侧新增</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-[var(--border-subtle)] p-6 sticky top-6">
                  <div className="flex items-center gap-2 mb-1">
                    <LockKeyhole className="w-5 h-5 text-[var(--brand)]" />
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">{editingResourceId ? '编辑资源' : '新增资源'}</h2>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">维护可实际发放给开发者的 Key、账号、激活码或授权记录。</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">所属工具</label>
                      <select value={resourceForm.toolId} onChange={(e) => {
                        const tool = getTool(e.target.value);
                        setResourceForm(prev => ({ ...prev, toolId: e.target.value, type: (tool?.resourceMode && tool.resourceMode !== 'none' && tool.resourceMode !== 'manual' ? tool.resourceMode : prev.type) as ResourceType }));
                      }} className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none">
                        <option value="">请选择工具</option>
                        {availableTools.filter(tool => tool.resourceMode !== 'none').map(tool => <option key={tool.id} value={tool.id}>{tool.name} · {resourceModeLabels[tool.resourceMode]}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">资源类型</label>
                        <select value={resourceForm.type} onChange={(e) => setResourceForm(prev => ({ ...prev, type: e.target.value as ResourceType }))} className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none">
                          {Object.entries(resourceTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">状态</label>
                        <select value={resourceForm.status} onChange={(e) => setResourceForm(prev => ({ ...prev, status: e.target.value as ResourceStatus }))} className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none">
                          {Object.entries(resourceStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">资源名称</label>
                      <input value={resourceForm.name} onChange={(e) => setResourceForm(prev => ({ ...prev, name: e.target.value }))} placeholder="如 Cursor 企业账号 02" className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">资源标识</label>
                      <input value={resourceForm.identifier} onChange={(e) => setResourceForm(prev => ({ ...prev, identifier: e.target.value }))} placeholder="如 sk-****-8F3A / cursor_team_002" className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">敏感内容</label>
                      <textarea value={resourceForm.secret} onChange={(e) => setResourceForm(prev => ({ ...prev, secret: e.target.value }))} placeholder="API Key、账号密码、激活码或授权说明。列表默认脱敏展示。" rows={3} className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none resize-none" />
                    </div>
                    {resourceForm.status === 'assigned' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">绑定订单</label>
                          <select value={resourceForm.assignedOrderId || ''} onChange={(e) => setResourceForm(prev => ({ ...prev, assignedOrderId: e.target.value }))} className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none">
                            <option value="">请选择订单</option>
                            {orders.map(order => <option key={order.id} value={order.id}>{order.title}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">使用人</label>
                          <input value={resourceForm.assignedUser || ''} onChange={(e) => setResourceForm(prev => ({ ...prev, assignedUser: e.target.value }))} placeholder="如 李明" className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none" />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">到期时间</label>
                      <input type="date" value={resourceForm.expireAt || ''} onChange={(e) => setResourceForm(prev => ({ ...prev, expireAt: e.target.value }))} className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">备注</label>
                      <textarea value={resourceForm.remark || ''} onChange={(e) => setResourceForm(prev => ({ ...prev, remark: e.target.value }))} rows={2} className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none resize-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <button onClick={handleSaveResource} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand-hover)] transition-colors"><Save className="w-4 h-4" />{editingResourceId ? '更新资源' : '加入资源池'}</button>
                    {editingResourceId && <button onClick={resetResourceForm} className="px-4 py-3 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors">取消</button>}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-2 space-y-6">
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-white p-4"><div className="text-xs text-[var(--text-tertiary)]">资源总数</div><div className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{resourceStats.total}</div></div>
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-white p-4"><div className="text-xs text-[var(--text-tertiary)]">可用</div><div className="mt-1 text-xl font-semibold text-[var(--success-text)]">{resourceStats.available}</div></div>
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-white p-4"><div className="text-xs text-[var(--text-tertiary)]">已分配</div><div className="mt-1 text-xl font-semibold text-[var(--brand)]">{resourceStats.assigned}</div></div>
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-white p-4"><div className="text-xs text-[var(--text-tertiary)]">异常</div><div className="mt-1 text-xl font-semibold text-[var(--danger-text)]">{resourceStats.risky}</div></div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-[var(--border-subtle)] p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--text-primary)]">资源池</h2>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">敏感内容默认脱敏展示，查看和复制在正式系统中应记录审计日志。</p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs text-[var(--warning)] bg-[var(--warning-bg)] border border-[var(--warning)] rounded-full px-3 py-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      敏感资源需审计
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_170px_140px] gap-3 mb-5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                      <input value={resourceSearchQuery} onChange={(e) => setResourceSearchQuery(e.target.value)} placeholder="搜索资源、标识或工具..." className="w-full pl-10 pr-4 py-2.5 border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
                    </div>
                    <select value={resourceToolFilter} onChange={(e) => setResourceToolFilter(e.target.value)} className="px-4 py-2.5 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none">
                      <option value="">全部工具</option>
                      {availableTools.map(tool => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
                    </select>
                    <select value={resourceStatusFilter} onChange={(e) => setResourceStatusFilter(e.target.value as ResourceStatus | '')} className="px-4 py-2.5 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none">
                      <option value="">全部状态</option>
                      {Object.entries(resourceStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    {filteredResources.map(resource => (
                      <div key={resource.id} className="rounded-lg border border-[var(--border-subtle)] p-4 hover:border-[var(--brand-ring)] transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="text-sm font-medium text-[var(--text-primary)]">{resource.name}</div>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--bg-hover)] text-[var(--text-secondary)]">{getToolName(resource.toolId)}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs border ${resourceStatusClasses[resource.status]}`}>{resourceStatusLabels[resource.status]}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[var(--text-tertiary)]">
                              <span>类型：{resourceTypeLabels[resource.type]}</span>
                              <span>标识：{resource.identifier}</span>
                              <span>敏感值：{maskSecret(resource.secret)}</span>
                              <span>到期：{resource.expireAt || '未设置'}</span>
                              {resource.status === 'assigned' && <span>绑定：{orders.find(order => order.id === resource.assignedOrderId)?.title || resource.assignedOrderId || '未绑定订单'}</span>}
                              {resource.status === 'assigned' && <span>使用人：{resource.assignedUser || '未填写'}</span>}
                            </div>
                            {resource.remark && <div className="mt-2 text-xs text-[var(--text-secondary)]">备注：{resource.remark}</div>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handleEditResource(resource)} className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--brand)] hover:bg-[var(--brand-subtle)] rounded transition-colors" title="编辑资源"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteResource(resource.id)} disabled={resource.status === 'assigned'} className={`p-1.5 rounded transition-colors ${resource.status === 'assigned' ? 'text-[var(--text-disabled)] cursor-not-allowed' : 'text-[var(--text-tertiary)] hover:text-[var(--danger-text)] hover:bg-[#ffebee]'}`} title="删除资源"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredResources.length === 0 && <div className="text-center py-12 text-[var(--text-tertiary)] text-sm border border-dashed border-[var(--border-subtle)] rounded-lg">暂无匹配资源，可在左侧新增</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                  { title: '选择配置对象', desc: configScope === 'task-type' ? '当前按任务类型生效' : '当前按单独订单覆盖', active: !!selectedScopeRef },
                  { title: '勾选可选工具', desc: `${selectedOptionalTools.length} 个工具可被选择`, active: selectedOptionalTools.length > 0 },
                  { title: '设置必选与资源', desc: `${selectedRequiredTools.length} 个必选，${selectedToolsWithResource} 个需发放资源`, active: selectedRequiredTools.length > 0 || selectedToolsWithResource > 0 },
                ].map((step, index) => (
                  <div key={step.title} className={`rounded-lg border p-4 bg-white ${step.active ? 'border-[var(--brand-ring)]' : 'border-[var(--border-subtle)]'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step.active ? 'bg-[var(--brand)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]'}`}>{index + 1}</div>
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)]">{step.title}</div>
                        <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{step.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {configScope === 'order' && (
                <div className="p-4 rounded-lg flex items-start gap-3 bg-[var(--brand-subtle)] border border-[var(--brand-ring)] border-l-4">
                  <Info className="w-5 h-5 text-[var(--brand)] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-[#2c3e50]">配置优先级：订单级 &gt; 任务类型级</div>
                    <div className="text-xs text-[#7f8c8d] mt-1">订单级配置会覆盖对应任务类型的默认配置，仅对当前订单生效。</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-[var(--border-subtle)] p-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{editingConfigId ? '编辑适用配置' : '新建适用配置'}</h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">决定任务类型或具体订单可以使用哪些工具，实际 Key 和账号从资源池发放。</p>
                      </div>
                      {editingConfigId && <span className="px-2.5 py-1 rounded-full text-xs bg-[var(--brand-subtle)] text-[var(--brand)]">编辑中</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">配置层级</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => { setConfigScope('task-type'); setSelectedScopeRef(''); }} className={`px-4 py-3 border rounded-lg text-sm transition-all ${configScope === 'task-type' ? 'border-[var(--brand)] bg-[var(--brand-subtle)] text-[var(--brand)] font-medium' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-disabled)]'}`}>按任务类型</button>
                          <button onClick={() => { setConfigScope('order'); setSelectedScopeRef(''); }} className={`px-4 py-3 border rounded-lg text-sm transition-all ${configScope === 'order' ? 'border-[var(--brand)] bg-[var(--brand-subtle)] text-[var(--brand)] font-medium' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-disabled)]'}`}>按订单</button>
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">{configScope === 'task-type' ? '选择任务类型' : '选择订单'}</label>
                        <select value={selectedScopeRef} onChange={(e) => setSelectedScopeRef(e.target.value)} className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none">
                          <option value="">请选择</option>
                          {configScope === 'task-type'
                            ? taskTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)
                            : orders.map(order => <option key={order.id} value={order.id}>{order.title} ({order.taskType})</option>)}
                        </select>
                      </div>
                    </div>

                    {configScope === 'order' && selectedScopeRef && isOrderInheriting(selectedScopeRef) && (
                      <div className="mb-6 p-4 rounded-lg flex items-center justify-between bg-[var(--bg-hover)] border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2">
                          <Copy className="w-4 h-4 text-[var(--text-tertiary)]" />
                          <span className="text-sm text-[var(--text-secondary)]">当前继承<span className="text-[var(--brand)] font-medium">【{getOrderTaskType(selectedScopeRef)}】</span>默认配置</span>
                        </div>
                        <button onClick={() => handleOverride(selectedScopeRef)} className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 hover:bg-[var(--warning)] hover:text-white" style={{ color: 'var(--warning)', backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning)' }}><Plus className="w-3.5 h-3.5" />覆盖</button>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-3 mb-5">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                        <input type="text" value={toolSearchQuery} onChange={(e) => setToolSearchQuery(e.target.value)} placeholder="搜索工具名称..." className="w-full pl-10 pr-10 py-2.5 border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
                        {toolSearchQuery && <button onClick={() => setToolSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><X className="w-4 h-4" /></button>}
                      </div>
                      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as ToolCategory | '')} className="px-4 py-2.5 border border-[var(--border-subtle)] rounded-lg text-sm focus:border-[var(--brand)] focus:outline-none">
                        <option value="">全部分类</option>
                        {categories.map(category => <option key={category} value={category}>{category}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(getToolsByCategory()).map(([category, tools]) => {
                        if (tools.length === 0) return null;
                        return (
                          <div key={category} className="rounded-lg border border-[var(--border-subtle)] overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-hover)] border-b border-[var(--border-subtle)]">
                              <div className="text-sm font-medium text-[var(--text-primary)]">{category}</div>
                              <button onClick={() => handleSelectAllInCategory(tools)} className="text-xs text-[var(--brand)] hover:text-[var(--brand-hover)]">
                                {tools.every(t => selectedOptionalTools.includes(t.id)) ? '取消全选' : '全选'}
                              </button>
                            </div>
                            <div className="divide-y divide-[var(--border-subtle)]">
                              {tools.map(tool => {
                                const isOptional = selectedOptionalTools.includes(tool.id);
                                const isRequired = selectedRequiredTools.includes(tool.id);
                                const resourceCount = resources.filter(resource => resource.toolId === tool.id && resource.status === 'available').length;
                                const needsResource = tool.resourceMode !== 'none';
                                return (
                                  <div key={tool.id} className={`p-4 transition-colors ${isOptional ? 'bg-[var(--brand-subtle)]' : 'bg-white hover:bg-[var(--bg-hover)]'}`}>
                                    <div className="flex items-start justify-between gap-4">
                                      <label className="flex items-start gap-3 cursor-pointer flex-1">
                                        <input type="checkbox" checked={isOptional} onChange={() => toggleOptionalTool(tool.id)} className="w-4 h-4 mt-1 text-[var(--brand)] border-[var(--text-disabled)] rounded focus:ring-[var(--brand)]" />
                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-[var(--text-primary)]">{tool.name}</span>
                                            {needsResource && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--warning-bg)] text-[var(--warning)]">{resourceModeLabels[tool.resourceMode]}</span>}
                                            {!needsResource && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--bg-hover)] text-[var(--text-tertiary)]">无需资源</span>}
                                          </div>
                                          <div className="mt-1 text-xs text-[var(--text-tertiary)]">
                                            可用资源 {resourceCount} 个 · 用量统计 {tool.supportUsageStats ? '支持' : '不支持'} · 回收 {tool.needRecycle ? '需要' : '不需要'}
                                          </div>
                                        </div>
                                      </label>
                                      {isOptional && (
                                        <label className="flex items-center gap-2 cursor-pointer shrink-0 rounded-full border border-[var(--brand-ring)] bg-white px-3 py-1.5">
                                          <input type="checkbox" checked={isRequired} onChange={() => toggleRequiredTool(tool.id)} className="w-4 h-4 text-[var(--brand)] border-[var(--text-disabled)] rounded focus:ring-[var(--brand)]" />
                                          <span className="text-xs text-[var(--brand)] font-medium">设为必选</span>
                                        </label>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand-hover)] transition-colors">
                        <Save className="w-5 h-5" />
                        <span>{editingConfigId ? '更新配置' : '保存配置'}</span>
                      </button>
                      {editingConfigId && <button onClick={handleCancelEdit} className="px-6 py-3 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors">取消编辑</button>}
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-1 space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-[var(--border-subtle)] p-6">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">配置摘要</h2>
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="rounded-lg bg-[var(--bg-hover)] p-3"><div className="text-xs text-[var(--text-tertiary)]">可选</div><div className="mt-1 text-lg font-semibold text-[var(--brand)]">{selectedOptionalTools.length}</div></div>
                      <div className="rounded-lg bg-[var(--bg-hover)] p-3"><div className="text-xs text-[var(--text-tertiary)]">必选</div><div className="mt-1 text-lg font-semibold text-[var(--warning)]">{selectedRequiredTools.length}</div></div>
                      <div className="rounded-lg bg-[var(--bg-hover)] p-3"><div className="text-xs text-[var(--text-tertiary)]">需资源</div><div className="mt-1 text-lg font-semibold text-[var(--success-text)]">{selectedToolsWithResource}</div></div>
                    </div>
                    <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] px-4 py-3 cursor-pointer hover:bg-[var(--bg-hover)]">
                      <span className="text-sm text-[var(--text-secondary)]">允许用户多选工具</span>
                      <input type="checkbox" checked={allowMultiSelect} onChange={(e) => setAllowMultiSelect(e.target.checked)} className="w-5 h-5 text-[var(--brand)] border-[var(--text-disabled)] rounded focus:ring-[var(--brand)]" />
                    </label>
                    <div className="mt-5 space-y-2">
                      {selectedOptionalTools.length === 0 ? (
                        <div className="text-sm text-[var(--text-tertiary)] py-4 text-center border border-dashed border-[var(--border-subtle)] rounded-lg">尚未选择工具</div>
                      ) : selectedOptionalTools.map(toolId => {
                        const tool = getTool(toolId);
                        if (!tool) return null;
                        return (
                          <div key={toolId} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-2">
                            <div>
                              <div className="text-sm text-[var(--text-primary)]">{tool.name}</div>
                              <div className="text-xs text-[var(--text-tertiary)]">{resourceModeLabels[tool.resourceMode]}</div>
                            </div>
                            {selectedRequiredTools.includes(toolId) && <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--brand)] text-white">必选</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-[var(--border-subtle)] p-6">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">已保存配置</h2>
                    {savedConfigs.length === 0 ? (
                      <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">暂无配置</div>
                    ) : (
                      <div className="space-y-3">
                        {savedConfigs.map(config => {
                          let isOverride = false;
                          if (config.scope === 'order') {
                            const order = orders.find(o => o.id === config.scopeRefId);
                            if (order) isOverride = !!getConfigForTaskType(order.taskType);
                          }
                          const overriddenTaskTypes = getOverriddenTaskTypes();
                          const isOverriddenTaskType = config.scope === 'task-type' && overriddenTaskTypes.has(config.scopeRefName);
                          return (
                            <div key={config.id} onClick={() => handleEditConfig(config)} className={`border rounded-lg p-4 transition-all duration-300 cursor-pointer ${highlightedConfigId === config.id || editingConfigId === config.id ? 'border-[var(--brand)] bg-[var(--brand-subtle)]' : 'border-[var(--border-subtle)] hover:border-[var(--brand-ring)] hover:bg-[var(--bg-hover)]'}`}>
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-[var(--text-primary)]">{config.scopeRefName}</span>
                                    {isOverride && <span className="px-2 py-0.5 bg-[var(--warning-bg)] text-[var(--warning)] text-xs rounded-full">覆盖默认</span>}
                                    {isOverriddenTaskType && <span className="px-2 py-0.5 bg-[#ffebee] text-[var(--danger-text)] text-xs rounded-full">已被覆盖</span>}
                                  </div>
                                  <div className="text-xs text-[var(--text-tertiary)] mt-1">{config.scope === 'task-type' ? '任务类型' : '订单'} · 可选 {config.optionalTools.length} · 必选 {config.requiredTools.length}</div>
                                </div>
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => handleEditConfig(config)} className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--brand)] hover:bg-[var(--brand-subtle)] rounded transition-colors" title="编辑配置"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteConfig(config.id)} className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--danger-text)] hover:bg-[#ffebee] rounded transition-colors" title="删除配置"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {config.optionalTools.slice(0, 6).map(id => <span key={id} className="px-2 py-0.5 rounded-full text-xs bg-white border border-[var(--border-subtle)] text-[var(--text-secondary)]">{getToolName(id)}</span>)}
                                {config.optionalTools.length > 6 && <span className="px-2 py-0.5 rounded-full text-xs bg-white border border-[var(--border-subtle)] text-[var(--text-tertiary)]">+{config.optionalTools.length - 6}</span>}
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
          )}
        </div>
      </div>
    </div>
  );
}
