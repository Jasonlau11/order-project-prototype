import { useState, useMemo } from 'react';
import {
  ArrowLeft, Settings, Save, Plus, Edit2, Trash2, Search,
  ChevronRight, ChevronDown, ToggleLeft, ToggleRight, X,
  FolderTree, Tag, FileText, Layers, MessageSquare, GripVertical,
  UserPlus, Shield, Clock, AlertTriangle, CheckCircle,
} from 'lucide-react';

// ===== Types / Data Model =====
interface TaskSubType {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  recognitionFeatures: string;
  skeletonModules: string[];
  aiGuidance: string;
  requiredStructuredFields: string[];
  createdAt: string;
}

interface TaskType {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  clientVisible: boolean;
  recognitionFeatures: string;
  skeletonModules: string[];
  aiGuidance: string;
  requiredStructuredFields: string[];
  children: TaskSubType[];
  createdAt: string;
}

const SKELETON_MODULES = [
  '项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '附加信息', '订单标签', '里程碑进度'
];

const INITIAL_BADGE_TYPES = ['平台建设方', '官方推荐服务商', '金牌合作伙伴', '行业专家'];

// ===== Initial mock data with parent-child hierarchy =====
const INITIAL_TASK_TYPES: TaskType[] = [
  {
    id: 'parent-1', name: '软件开发', code: 'software_dev', enabled: true, clientVisible: true, createdAt: '2025-06-01',
    recognitionFeatures: '编程、系统开发、API接口、数据库设计、前后端分离、架构设计、代码交付',
    skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '订单标签', '里程碑进度'],
    aiGuidance: '请重点关注技术栈、架构方案、接口规范和性能要求',
    requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'],
    children: [
      { id: 'child-1-1', name: 'Web应用', code: 'web_app', enabled: true, createdAt: '2025-08-15', recognitionFeatures: '前端、React、Vue、响应式、SPA', skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '订单标签'], aiGuidance: '关注前端框架选型、浏览器兼容性、响应式设计', requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'] },
      { id: 'child-1-2', name: '微信小程序', code: 'miniapp', enabled: true, createdAt: '2025-09-01', recognitionFeatures: '小程序、微信生态、WXML、云开发', skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '订单标签'], aiGuidance: '关注小程序审核规范、微信支付对接、云开发方案', requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'] },
      { id: 'child-1-3', name: '移动APP', code: 'mobile_app', enabled: true, createdAt: '2025-10-10', recognitionFeatures: 'iOS、Android、Flutter、React Native、原生开发', skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '订单标签'], aiGuidance: '关注平台兼容性、推送通知、应用商店上架要求', requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'] },
      { id: 'child-1-4', name: '后端服务', code: 'backend', enabled: false, createdAt: '2025-11-01', recognitionFeatures: 'Node.js、Java、Python、Go、微服务、数据库', skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '订单标签', '里程碑进度'], aiGuidance: '关注并发处理、数据安全、API设计规范', requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'] },
    ],
  },
  {
    id: 'parent-2', name: '平面设计', code: 'graphic_design', enabled: true, clientVisible: true, createdAt: '2025-06-01',
    recognitionFeatures: '视觉设计、UI设计、Logo、海报、品牌VI、设计稿交付',
    skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '附加信息', '订单标签', '里程碑进度'],
    aiGuidance: '请重点关注设计风格、品牌规范、交付格式和参考素材',
    requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'],
    children: [
      { id: 'child-2-1', name: 'UI/UX设计', code: 'ui_ux', enabled: true, createdAt: '2025-08-20', recognitionFeatures: 'UI、UX、交互设计、Figma、Sketch', skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '订单标签'], aiGuidance: '关注交互流程、原型设计、设计系统一致性', requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'] },
      { id: 'child-2-2', name: '品牌VI', code: 'brand_vi', enabled: true, createdAt: '2025-09-05', recognitionFeatures: '品牌、VI、Logo、色彩体系、字体', skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '附加信息', '订单标签'], aiGuidance: '关注品牌定位、行业属性、应用场景', requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'] },
    ],
  },
  {
    id: 'parent-3', name: '视频创作', code: 'video_creation', enabled: true, clientVisible: true, createdAt: '2025-06-01',
    recognitionFeatures: '拍摄、剪辑、动画、特效、视频制作',
    skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '订单标签', '里程碑进度'],
    aiGuidance: '请重点关注视频类型、时长、分辨率、风格参考和使用场景',
    requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'],
    children: [],
  },
  {
    id: 'parent-4', name: '文本创作', code: 'text_creation', enabled: true, clientVisible: true, createdAt: '2025-06-01',
    recognitionFeatures: '写作、文案、翻译、润色、内容创作',
    skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '附加信息', '订单标签'],
    aiGuidance: '请重点关注文体、字数、风格、受众和交付格式',
    requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'],
    children: [
      { id: 'child-4-1', name: '技术文档', code: 'tech_doc', enabled: true, createdAt: '2025-10-01', recognitionFeatures: 'API文档、用户手册、技术白皮书', skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '订单标签'], aiGuidance: '关注技术准确性、示例代码、版本管理', requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'] },
    ],
  },
  {
    id: 'parent-5', name: '产品评测', code: 'product_review', enabled: true, clientVisible: true, createdAt: '2025-06-01',
    recognitionFeatures: '性能测试、对比评测、报告、体验评测',
    skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '订单标签'],
    aiGuidance: '请重点关注评测维度、对比对象、数据采集方法和报告格式',
    requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'],
    children: [],
  },
  {
    id: 'parent-6', name: '营销推广', code: 'marketing', enabled: true, clientVisible: true, createdAt: '2025-06-01',
    recognitionFeatures: '广告投放、SEO、活动策划、社媒运营',
    skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '附加信息', '订单标签', '里程碑进度'],
    aiGuidance: '请重点关注目标受众、投放渠道、KPI指标和预算分配',
    requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'],
    children: [],
  },
  {
    id: 'parent-7', name: '硬件订单', code: 'hardware_order', enabled: true, clientVisible: true, createdAt: '2025-06-01',
    recognitionFeatures: '规格参数、数量、交付、质保、硬件开发',
    skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '订单标签', '里程碑进度'],
    aiGuidance: '请重点关注规格参数、数量、交付地点和质保要求',
    requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'],
    children: [],
  },
  {
    id: 'parent-8', name: '模版创建', code: 'template_creation', enabled: true, clientVisible: false, createdAt: '2025-06-01',
    recognitionFeatures: '内部自用、运营专用',
    skeletonModules: ['项目概述', '需求说明', '交付物要求', '排期与预算'],
    aiGuidance: '仅运营端使用，不走里程碑与结算',
    requiredStructuredFields: ['结算模式', '订单报价', '交付模式', '时限'],
    children: [],
  },
];

// Flatten all types (parents + children) for the list view
interface FlatType {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  clientVisible: boolean;
  parentName: string | null;
  parentId: string | null;
  recognitionFeatures: string;
  skeletonModules: string[];
  aiGuidance: string;
  requiredStructuredFields: string[];
  createdAt: string;
  isParent: boolean;
}

function flattenTypes(types: TaskType[]): FlatType[] {
  const result: FlatType[] = [];
  types.forEach(t => {
    result.push({
      id: t.id, name: t.name, code: t.code, enabled: t.enabled, clientVisible: t.clientVisible,
      parentName: null, parentId: null,
      recognitionFeatures: t.recognitionFeatures,
      skeletonModules: t.skeletonModules,
      aiGuidance: t.aiGuidance,
      requiredStructuredFields: t.requiredStructuredFields,
      createdAt: t.createdAt, isParent: true,
    });
    t.children.forEach(c => {
      result.push({
        id: c.id, name: c.name, code: c.code, enabled: c.enabled,
        parentName: t.name, parentId: t.id,
        recognitionFeatures: c.recognitionFeatures,
        skeletonModules: c.skeletonModules,
        aiGuidance: c.aiGuidance,
        requiredStructuredFields: c.requiredStructuredFields,
        createdAt: c.createdAt, isParent: false,
      });
    });
  });
  return result;
}

// ===== Task Type Editor Modal =====
function TypeEditorModal({
  type,
  isNew,
  parentTypes,
  onSave,
  onClose,
}: {
  type: Partial<FlatType> & { isParent?: boolean };
  isNew: boolean;
  parentTypes: TaskType[];
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(type.name || '');
  const [code, setCode] = useState(type.code || '');
  const [parentId, setParentId] = useState(type.parentId || '');
  const [isParentType, setIsParentType] = useState(type.isParent ?? true);
  const [recognitionFeatures, setRecognitionFeatures] = useState(type.recognitionFeatures || '');
  const [skeletonModules, setSkeletonModules] = useState<string[]>(type.skeletonModules || []);
  const [aiGuidance, setAiGuidance] = useState(type.aiGuidance || '');

  const toggleModule = (mod: string) => {
    setSkeletonModules(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" style={{ background: 'rgba(13,17,23,0.25)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-md w-full max-w-lg mx-4" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-modal)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>
            {isNew ? (isParentType ? '新增父类任务类型' : '新增子类任务类型') : `编辑：${type.name}`}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md transition-all hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Type hierarchy — only for new types */}
          {isNew && (
            <div className="flex items-center gap-3 p-3 rounded-md" style={{ backgroundColor: 'var(--bg-root)', border: '1px solid var(--border-subtle)' }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={isParentType} onChange={() => setIsParentType(true)} className="w-4 h-4 accent-[var(--brand)]" />
                <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>作为父类</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!isParentType} onChange={() => setIsParentType(false)} className="w-4 h-4 accent-[var(--brand)]" />
                <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>作为子类</span>
              </label>
            </div>
          )}

          {/* Parent selector — for sub-types */}
          {(!isParentType) && (
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>所属父类</label>
              <select value={parentId} onChange={e => setParentId(e.target.value)}
                className="w-full px-3 py-2 rounded-md text-[13px] outline-none transition-all bg-white"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)', transition: 'all var(--transition-fast)' }}>
                <option value="">请选择父类</option>
                {parentTypes.filter(p => p.id !== type.id).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Name + Code */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>类型名称</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="如：Web应用"
                className="w-full px-3 py-2 rounded-md text-[13px] outline-none transition-all bg-white"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)', transition: 'all var(--transition-fast)' }} />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>类型编码</label>
              <input value={code} onChange={e => setCode(e.target.value)} placeholder="如：web_app"
                className="w-full px-3 py-2 rounded-md text-[13px] outline-none transition-all bg-white font-mono"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)', transition: 'all var(--transition-fast)' }} />
            </div>
          </div>

          {/* Recognition Features */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Tag className="w-[14px] h-[14px]" style={{ color: 'var(--text-tertiary)' }} />
              <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>类型识别特征</label>
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>（AI自动分类匹配依据）</span>
            </div>
            <textarea value={recognitionFeatures} onChange={e => setRecognitionFeatures(e.target.value)}
              placeholder="关键词或短语，逗号分隔。如：前端、React、Vue、响应式、SPA"
              rows={2}
              className="w-full px-3 py-2 rounded-md text-[13px] outline-none transition-all bg-white resize-none"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)', transition: 'all var(--transition-fast)' }} />
          </div>

          {/* Skeleton Modules */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Layers className="w-[14px] h-[14px]" style={{ color: 'var(--text-tertiary)' }} />
              <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>骨架模块</label>
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>（勾选该类型订单详情页展示的模块）</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SKELETON_MODULES.map(mod => {
                const checked = skeletonModules.includes(mod);
                return (
                  <label key={mod}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-all"
                    style={checked
                      ? { color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)', border: '1px solid var(--brand-ring)' }
                      : { color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', transition: 'all var(--transition-fast)' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleModule(mod)} className="w-3 h-3 accent-[var(--brand)]" />
                    {mod}
                  </label>
                );
              })}
            </div>
          </div>

          {/* AI Guidance */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-[14px] h-[14px]" style={{ color: 'var(--text-tertiary)' }} />
              <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>AI对话指引</label>
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>（可选，不超过200字）</span>
            </div>
            <textarea value={aiGuidance} onChange={e => setAiGuidance(e.target.value)}
              placeholder="引导AI在对话创建时重点关注的内容，如：关注技术栈选型、安全规范..."
              rows={2}
              className="w-full px-3 py-2 rounded-md text-[13px] outline-none transition-all bg-white resize-none"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)', transition: 'all var(--transition-fast)' }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-md text-[13px] font-medium transition-all"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
            取消
          </button>
          <button
            onClick={() => onSave({ name, code, parentId, isParentType, recognitionFeatures, skeletonModules, aiGuidance, requiredStructuredFields: ['结算模式', '订单预算'] })}
            className="px-4 py-2 rounded-md text-[13px] font-semibold text-white transition-all"
            style={{ backgroundColor: 'var(--brand)', transition: 'all var(--transition-fast)' }}>
            {isNew ? '创建类型' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Main render: Task Type Config =====
function TaskTypeManager() {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(INITIAL_TASK_TYPES);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const [editorType, setEditorType] = useState<Partial<FlatType> | null>(null);
  const [editorIsNew, setEditorIsNew] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set(taskTypes.map(t => t.id)));
  const [expandedTypeId, setExpandedTypeId] = useState<string | null>(null);
  const [dragModuleIndex, setDragModuleIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [inlineDrafts, setInlineDrafts] = useState<Record<string, { name: string; code: string; features: string; aiGuidance: string }>>({});
  const [customModuleEditor, setCustomModuleEditor] = useState<{ typeId: string; originalName?: string } | null>(null);
  const [customModuleName, setCustomModuleName] = useState('');
  const [moduleSaveFeedback, setModuleSaveFeedback] = useState<string | null>(null);
  const pageSize = 15;

  const flatTypes = useMemo(() => flattenTypes(taskTypes), [taskTypes]);

  // Filter by selected parent + search
  const filteredTypes = useMemo(() => {
    let result = flatTypes;
    if (selectedParentId) {
      result = result.filter(t => t.parentId === selectedParentId || t.id === selectedParentId);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.recognitionFeatures.toLowerCase().includes(q)
      );
    }
    return result;
  }, [flatTypes, selectedParentId, searchQuery]);

  const totalPages = Math.ceil(filteredTypes.length / pageSize);
  const paginatedTypes = filteredTypes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleParentExpand = (id: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleEnable = (id: string) => {
    setTaskTypes(prev => prev.map(t => ({
      ...t,
      enabled: t.id === id ? !t.enabled : t.enabled,
      children: t.children.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c),
    })));
  };

  const toggleClientVisible = (id: string) => {
    setTaskTypes(prev => prev.map(t => ({
      ...t,
      clientVisible: t.id === id ? !t.clientVisible : t.clientVisible,
    })));
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (!deleteTargetId) return;
    setTaskTypes(prev => {
      // Check if it's a parent
      const parent = prev.find(t => t.id === deleteTargetId);
      if (parent) return prev.filter(t => t.id !== deleteTargetId);
      // It's a child
      return prev.map(t => ({
        ...t,
        children: t.children.filter(c => c.id !== deleteTargetId),
      }));
    });
    if (selectedParentId === deleteTargetId) setSelectedParentId(null);
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  const updateTypeModules = (typeId: string, modules: string[]) => {
    setTaskTypes(prev => prev.map(t => {
      if (t.id === typeId) return { ...t, skeletonModules: modules };
      return { ...t, children: t.children.map(c => c.id === typeId ? { ...c, skeletonModules: modules } : c) };
    }));
  };

  const updateTypeAiGuidance = (typeId: string, guidance: string) => {
    setTaskTypes(prev => prev.map(t => {
      if (t.id === typeId) return { ...t, aiGuidance: guidance };
      return { ...t, children: t.children.map(c => c.id === typeId ? { ...c, aiGuidance: guidance } : c) };
    }));
  };

  const updateTypeName = (typeId: string, name: string) => {
    setTaskTypes(prev => prev.map(t => {
      if (t.id === typeId) return { ...t, name };
      return { ...t, children: t.children.map(c => c.id === typeId ? { ...c, name } : c) };
    }));
  };

  const updateTypeCode = (typeId: string, code: string) => {
    setTaskTypes(prev => prev.map(t => {
      if (t.id === typeId) return { ...t, code };
      return { ...t, children: t.children.map(c => c.id === typeId ? { ...c, code } : c) };
    }));
  };

  const updateTypeFeatures = (typeId: string, features: string) => {
    setTaskTypes(prev => prev.map(t => {
      if (t.id === typeId) return { ...t, recognitionFeatures: features };
      return { ...t, children: t.children.map(c => c.id === typeId ? { ...c, recognitionFeatures: features } : c) };
    }));
  };

  const addModule = (typeId: string, mod: string) => {
    const type = flatTypes.find(t => t.id === typeId);
    if (!type) return;
    updateTypeModules(typeId, [...type.skeletonModules, mod]);
  };

  const removeModule = (typeId: string, mod: string) => {
    const type = flatTypes.find(t => t.id === typeId);
    if (!type) return;
    updateTypeModules(typeId, type.skeletonModules.filter(m => m !== mod));
  };

  const showModuleFeedback = (message: string) => {
    setModuleSaveFeedback(message);
    window.setTimeout(() => setModuleSaveFeedback(null), 1800);
  };

  const openCustomModuleEditor = (typeId: string, originalName?: string) => {
    setCustomModuleEditor({ typeId, originalName });
    setCustomModuleName(originalName || '');
  };

  const saveCustomModule = () => {
    if (!customModuleEditor) return;
    const name = customModuleName.trim();
    const type = flatTypes.find(t => t.id === customModuleEditor.typeId);
    if (!name || !type) return;
    const duplicate = type.skeletonModules.some(mod => mod === name && mod !== customModuleEditor.originalName);
    if (duplicate) return;

    if (customModuleEditor.originalName) {
      updateTypeModules(customModuleEditor.typeId, type.skeletonModules.map(mod => mod === customModuleEditor.originalName ? name : mod));
      showModuleFeedback(`自定义模块“${name}”已更新`);
    } else {
      updateTypeModules(customModuleEditor.typeId, [...type.skeletonModules, name]);
      showModuleFeedback(`自定义模块“${name}”已添加`);
    }
    setCustomModuleEditor(null);
    setCustomModuleName('');
  };

  const removeCustomModule = (typeId: string, mod: string) => {
    removeModule(typeId, mod);
    showModuleFeedback(`自定义模块“${mod}”已移除`);
  };

  const handleSkeletonDragStart = (e: React.DragEvent, moduleIndex: number) => {
    e.dataTransfer.setData('text/plain', String(moduleIndex));
    e.dataTransfer.effectAllowed = 'move';
    setDragModuleIndex(moduleIndex);
  };

  const handleSkeletonDragEnd = () => {
    setDragModuleIndex(null);
    setDropTargetIndex(null);
  };

  const handleSkeletonDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSkeletonDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragModuleIndex(null);
    setDropTargetIndex(null);
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw || !expandedTypeId) return;
    const sourceIndex = parseInt(raw, 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;
    const type = flatTypes.find(t => t.id === expandedTypeId);
    if (!type) return;
    const modules = [...type.skeletonModules];
    const [moved] = modules.splice(sourceIndex, 1);
    modules.splice(targetIndex, 0, moved);
    updateTypeModules(expandedTypeId, modules);
  };

  const handleExpandType = (typeId: string) => {
    if (expandedTypeId === typeId) {
      setExpandedTypeId(null);
      setInlineDrafts(prev => { const next = {...prev}; delete next[typeId]; return next; });
    } else {
      const type = flatTypes.find(t => t.id === typeId);
      if (type) {
        setInlineDrafts(prev => ({
          ...prev,
          [typeId]: { name: type.name, code: type.code, features: type.recognitionFeatures, aiGuidance: type.aiGuidance }
        }));
      }
      setExpandedTypeId(typeId);
    }
  };

  const handleSaveInlineEdits = (typeId: string) => {
    const draft = inlineDrafts[typeId];
    if (!draft) return;
    updateTypeName(typeId, draft.name);
    updateTypeCode(typeId, draft.code);
    updateTypeFeatures(typeId, draft.features);
    updateTypeAiGuidance(typeId, draft.aiGuidance);
    setInlineDrafts(prev => { const next = {...prev}; delete next[typeId]; return next; });
    setExpandedTypeId(null);
  };

  const handleCancelInlineEdits = (typeId: string) => {
    setInlineDrafts(prev => { const next = {...prev}; delete next[typeId]; return next; });
    setExpandedTypeId(null);
  };

  const openNewType = (isParent: boolean) => {
    setEditorType({ isParent: isParent, skeletonModules: isParent ? ['项目概述', '需求说明', '交付物要求', '排期与预算', '接单要求', '订单标签', '里程碑进度'] : [] });
    setEditorIsNew(true);
    setShowEditor(true);
  };

  const openEditType = (type: FlatType) => {
    setEditorType(type);
    setEditorIsNew(false);
    setShowEditor(true);
  };

  const handleSaveType = (data: any) => {
    if (editorIsNew) {
      const id = `type-${Date.now()}`;
      if (data.isParentType) {
        const newParent: TaskType = {
          id, name: data.name, code: data.code, enabled: true, clientVisible: true, createdAt: new Date().toISOString().slice(0, 10),
          recognitionFeatures: data.recognitionFeatures,
          skeletonModules: data.skeletonModules,
          aiGuidance: data.aiGuidance,
          requiredStructuredFields: data.requiredStructuredFields || [],
          children: [],
        };
        setTaskTypes(prev => [...prev, newParent]);
      } else {
        const childId = `child-${Date.now()}`;
        const newChild: TaskSubType = {
          id: childId, name: data.name, code: data.code, enabled: true, createdAt: new Date().toISOString().slice(0, 10),
          recognitionFeatures: data.recognitionFeatures,
          skeletonModules: data.skeletonModules,
          aiGuidance: data.aiGuidance,
          requiredStructuredFields: data.requiredStructuredFields || [],
        };
        setTaskTypes(prev => prev.map(t =>
          t.id === data.parentId ? { ...t, children: [...t.children, newChild] } : t
        ));
      }
    } else {
      // Edit existing
      setTaskTypes(prev => prev.map(t => {
        if (t.id === editorType?.id) {
          return {
            ...t,
            name: data.name,
            code: data.code,
            recognitionFeatures: data.recognitionFeatures,
            skeletonModules: data.skeletonModules,
            aiGuidance: data.aiGuidance,
            requiredStructuredFields: data.requiredStructuredFields || [],
          };
        }
        return {
          ...t,
          children: t.children.map(c => c.id === editorType?.id
            ? { ...c, name: data.name, code: data.code, recognitionFeatures: data.recognitionFeatures, skeletonModules: data.skeletonModules, aiGuidance: data.aiGuidance, requiredStructuredFields: data.requiredStructuredFields || [] }
            : c),
        };
      }));
    }
    setShowEditor(false);
    setEditorType(null);
  };

  const selectedParent = selectedParentId ? taskTypes.find(t => t.id === selectedParentId) : null;

  // Delete confirmation info
  const deleteTargetInfo = deleteTargetId ? flatTypes.find(t => t.id === deleteTargetId) : null;
  const isDeletingParent = deleteTargetInfo?.isParent ?? false;
  const deleteChildCount = deleteTargetId
    ? (taskTypes.find(t => t.id === deleteTargetId)?.children?.length ?? 0)
    : 0;

  return (
    <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
      {/* Left: Type Tree */}
      <div className="w-[240px] shrink-0 bg-white overflow-y-auto" style={{ borderRight: '1px solid var(--border-subtle)' }}>
        <div className="p-4">
          <h3 className="flex items-center gap-2 text-[12px] font-semibold mb-3" style={{ color: 'var(--text-tertiary)' }}>
            <FolderTree className="w-[14px] h-[14px]" /> 任务类型树
          </h3>

          {/* All types */}
          <button
            onClick={() => { setSelectedParentId(null); setCurrentPage(1); }}
            className="w-full text-left px-3 py-2 rounded-md text-[13px] font-medium transition-all mb-1"
            style={!selectedParentId ? { color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)' } : { color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
            全部类型
            <span className="float-right text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{flatTypes.length}</span>
          </button>

          {/* Parent nodes */}
          {taskTypes.map(parent => {
            const isExpanded = expandedParents.has(parent.id);
            const isSelected = selectedParentId === parent.id;
            const childCount = parent.children.length;
            return (
              <div key={parent.id}>
                <button
                  onClick={() => { setSelectedParentId(parent.id); setCurrentPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-[13px] transition-all mb-0.5 flex items-center gap-1.5 ${isSelected ? 'font-semibold' : 'font-medium'}`}
                  style={isSelected ? { color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)' } : { color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
                  <span onClick={e => { e.stopPropagation(); toggleParentExpand(parent.id); }} className="cursor-pointer shrink-0">
                    {isExpanded ? <ChevronDown className="w-[14px] h-[14px]" /> : <ChevronRight className="w-[14px] h-[14px]" />}
                  </span>
                  <span className="flex-1 truncate">{parent.name}</span>
                  {!parent.enabled && <span className="text-[10px] px-1 py-0.5 rounded-sm" style={{ color: 'var(--danger)', backgroundColor: 'var(--danger-bg)' }}>停用</span>}
                  <span className="text-[11px] shrink-0" style={{ color: 'var(--text-tertiary)' }}>{childCount}</span>
                </button>
                {/* Children */}
                {isExpanded && parent.children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => { /* show child detail in right panel via filter reset */ }}
                    className="w-full text-left pl-9 pr-3 py-1.5 rounded-md text-[12px] transition-all flex items-center gap-1.5"
                    style={{ color: child.enabled ? 'var(--text-secondary)' : 'var(--text-disabled)', transition: 'all var(--transition-fast)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: child.enabled ? 'var(--brand)' : 'var(--text-disabled)' }} />
                    <span className="flex-1 truncate">{child.name}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white px-6 py-3 flex items-center justify-between gap-4 flex-wrap shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ backgroundColor: 'var(--bg-root)', border: '1px solid var(--border-subtle)' }}>
              <Search className="w-[14px] h-[14px]" style={{ color: 'var(--text-tertiary)' }} />
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="搜索类型名称、编码、特征..."
                className="bg-transparent border-none outline-none text-[13px] w-[200px]"
                style={{ color: 'var(--text-primary)' }}
              />
              {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-[14px] h-[14px]" style={{ color: 'var(--text-tertiary)' }} /></button>}
            </div>
            {selectedParent && (
              <span className="text-[12px] flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                <span className="w-px h-3" style={{ backgroundColor: 'var(--border-default)' }} />
                当前查看：<span style={{ color: 'var(--text-primary)' }}>{selectedParent.name}</span>
                {selectedParent.children.length > 0 && <span className="text-[11px]">（{selectedParent.children.length} 个子类）</span>}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => openNewType(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
              <Plus className="w-[14px] h-[14px]" /> 新增父类
            </button>
            <button onClick={() => openNewType(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold text-white transition-all"
              style={{ backgroundColor: 'var(--brand)', transition: 'all var(--transition-fast)' }}>
              <Plus className="w-[14px] h-[14px]" /> 新增子类
            </button>
          </div>
        </div>

        {/* List / Table */}
        <div className="flex-1 overflow-auto p-6">
          {paginatedTypes.length === 0 ? (
            <div className="bg-white rounded-md py-16 flex flex-col items-center justify-center text-center" style={{ border: '1px solid var(--border-subtle)' }}>
              <FolderTree className="w-10 h-10 mb-3" style={{ color: 'var(--text-disabled)' }} />
              <div className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>暂无匹配的任务类型</div>
              <div className="text-[13px] mt-1" style={{ color: 'var(--text-disabled)' }}>调整筛选条件或新增类型</div>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedTypes.map(type => {
                const isExpanded = expandedTypeId === type.id;
                const unselectedModules = SKELETON_MODULES.filter(m => !type.skeletonModules.includes(m));
                return (
                <div key={type.id}
                  className="bg-white rounded-md overflow-hidden transition-all cursor-pointer"
                  style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', transition: 'all var(--transition-fast)' }}
                  onClick={() => handleExpandType(type.id)}>
                  {/* Type header bar */}
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    {/* Expand chevron */}
                    <ChevronRight className={`w-5 h-5 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} style={{ color: 'var(--text-tertiary)' }} />
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{type.name}</span>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-sm" style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-hover)' }}>{type.code}</span>
                        {type.parentName && (
                          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                            · 属于 <span style={{ color: 'var(--text-secondary)' }}>{type.parentName}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                        <span className="flex items-center gap-1"><Tag className="w-[12px] h-[12px]" />{type.recognitionFeatures.slice(0, 40)}{type.recognitionFeatures.length > 40 ? '...' : ''}</span>
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      <span className="flex items-center gap-1"><Layers className="w-[12px] h-[12px]" />共 {type.skeletonModules.length} 个模块</span>
                      <span className="text-[11px]">{type.createdAt}</span>
                    </div>
                    {/* Toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleEnable(type.id); }}
                      className="transition-all"
                      title={type.enabled ? '点击停用' : '点击启用'}
                      style={{ color: type.enabled ? 'var(--success)' : 'var(--text-disabled)', transition: 'all var(--transition-fast)' }}>
                      {type.enabled ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                    </button>
                    {/* Client visibility toggle */}
                    {type.isParent && (
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        {type.code === 'template_creation' ? (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-medium" style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-hover)' }}>
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--text-disabled)' }} />仅运营
                          </span>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleClientVisible(type.id); }}
                            title={type.clientVisible ? '点击隐藏' : '点击可见'}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-medium transition-all"
                            style={{
                              color: type.clientVisible ? 'var(--success)' : 'var(--text-tertiary)',
                              backgroundColor: type.clientVisible ? 'var(--success-bg)' : 'var(--bg-hover)',
                              transition: 'all var(--transition-fast)',
                            }}>
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: type.clientVisible ? 'var(--success)' : 'var(--text-disabled)' }} />
                            {type.clientVisible ? '可见' : '仅运营'}
                          </button>
                        )}
                      </div>
                    )}
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(type.id); }}
                        className="p-1.5 rounded-md transition-all hover:bg-[var(--danger-bg)]" style={{ color: 'var(--text-tertiary)', transition: 'all var(--transition-fast)' }}
                        title="删除">
                        <Trash2 className="w-[15px] h-[15px]" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded inline editor — all fields editable */}
                  {isExpanded && (
                    <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }} onClick={e => e.stopPropagation()}>
                      {/* Name + Code — inline editable */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>类型名称</label>
                          <input
                            defaultValue={type.name}
                            onBlur={(e) => { if (e.target.value.trim()) updateTypeName(type.id, e.target.value.trim()); }}
                            className="w-full px-2.5 py-1.5 rounded text-[13px] outline-none transition-all bg-white"
                            style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>类型编码</label>
                          <input
                            defaultValue={type.code}
                            onBlur={(e) => { if (e.target.value.trim()) updateTypeCode(type.id, e.target.value.trim()); }}
                            className="w-full px-2.5 py-1.5 rounded text-[13px] font-mono outline-none transition-all bg-white"
                            style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                          />
                        </div>
                      </div>

                      {/* Recognition features — inline editable */}
                      <div className="mb-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Tag className="w-[12px] h-[12px]" style={{ color: 'var(--text-tertiary)' }} />
                          <label className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>识别特征</label>
                          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>（AI自动分类匹配依据，逗号分隔）</span>
                        </div>
                        <textarea
                          defaultValue={type.recognitionFeatures}
                          onBlur={(e) => updateTypeFeatures(type.id, e.target.value)}
                          rows={2}
                          className="w-full px-2.5 py-1.5 rounded text-[12px] outline-none transition-all bg-white resize-none"
                          style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                        />
                      </div>

                      {/* Skeleton modules - drag to reorder */}
                      <div className="mb-1">
                        <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>骨架模块（拖拽排序）：</span>
                      </div>
                      {type.skeletonModules.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {type.skeletonModules.map((mod, idx) => {
                            const isDragging = dragModuleIndex === idx;
                            const isDropTarget = dropTargetIndex === idx;
                            const isCustomModule = !SKELETON_MODULES.includes(mod);
                            return (
                              <div
                                key={`${type.id}-${mod}`}
                                draggable
                                onDragStart={(e) => { e.stopPropagation(); handleSkeletonDragStart(e, idx); }}
                                onDragEnd={(e) => { e.stopPropagation(); handleSkeletonDragEnd(); }}
                                onDragOver={(e) => { e.stopPropagation(); handleSkeletonDragOver(e); setDropTargetIndex(idx); }}
                                onDragLeave={() => setDropTargetIndex(null)}
                                onDrop={(e) => { e.stopPropagation(); handleSkeletonDrop(e, idx); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium cursor-move transition-all select-none"
                                style={{
                                  color: 'var(--brand)',
                                  backgroundColor: 'var(--brand-subtle)',
                                  border: isDropTarget ? '2px dashed var(--brand)' : '1px solid var(--brand-ring)',
                                  opacity: isDragging ? 0.4 : 1,
                                  transition: 'all var(--transition-fast)',
                                }}>
                                <GripVertical className="w-3 h-3 shrink-0" style={{ color: 'var(--text-disabled)' }} />
                                {!isCustomModule && (
                                  <input
                                    type="checkbox"
                                    checked
                                    onChange={(e) => { e.stopPropagation(); removeModule(type.id, mod); }}
                                    className="w-3 h-3 accent-[var(--brand)]"
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isCustomModule) openCustomModuleEditor(type.id, mod);
                                  }}
                                  className={isCustomModule ? 'cursor-text' : 'cursor-move'}
                                  title={isCustomModule ? '点击修改模块名称' : undefined}>
                                  {mod}
                                </button>
                                {isCustomModule && (
                                  <>
                                    <span className="text-[9px] font-medium" style={{ color: 'var(--brand)' }}>自定义</span>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); removeCustomModule(type.id, mod); }}
                                      className="ml-0.5 rounded-sm transition-all hover:bg-[var(--danger-bg)]"
                                      title="移除自定义模块">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-[12px] mb-2" style={{ color: 'var(--text-disabled)' }}>暂未选择模块</div>
                      )}

                      {/* Unselected + custom modules */}
                      <div className="mb-3 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] shrink-0" style={{ color: 'var(--text-tertiary)' }}>可添加：</span>
                        {unselectedModules.map(mod => (
                          <button
                            key={`add-${type.id}-${mod}`}
                            onClick={(e) => { e.stopPropagation(); addModule(type.id, mod); }}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium cursor-pointer transition-all"
                            style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
                            <Plus className="w-2.5 h-2.5" />
                            {mod}
                          </button>
                        ))}
                        <button
                          onClick={(e) => { e.stopPropagation(); openCustomModuleEditor(type.id); }}
                          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium cursor-pointer transition-all"
                          style={{ color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)', border: '1px dashed var(--brand-ring)' }}>
                          <Plus className="w-2.5 h-2.5" />
                          自定义模块
                        </button>
                        {moduleSaveFeedback && expandedTypeId === type.id && (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--success)' }}>
                            <CheckCircle className="w-3 h-3" />{moduleSaveFeedback}
                          </span>
                        )}
                      </div>

                      {/* AI guidance — inline editable */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <MessageSquare className="w-[12px] h-[12px]" style={{ color: 'var(--text-tertiary)' }} />
                          <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>AI对话指引：</span>
                        </div>
                        <textarea
                          defaultValue={type.aiGuidance}
                          onBlur={(e) => { e.stopPropagation(); updateTypeAiGuidance(type.id, e.target.value); }}
                          placeholder="引导AI在对话创建时重点关注的内容…"
                          rows={2}
                          className="w-full px-3 py-2 rounded-md text-[12px] outline-none transition-all bg-white resize-none"
                          style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  )}
                </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all border"
                    style={currentPage === 1 ? { color: 'var(--text-disabled)', borderColor: 'var(--border-subtle)' } : { color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}>
                    上一页
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)}
                      className="w-8 h-8 rounded-md text-[12px] font-medium transition-all"
                      style={p === currentPage ? { backgroundColor: 'var(--brand)', color: '#fff' } : { color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all border"
                    style={currentPage === totalPages ? { color: 'var(--text-disabled)', borderColor: 'var(--border-subtle)' } : { color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}>
                    下一页
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Type Editor Modal */}
      {showEditor && (
        <TypeEditorModal
          type={editorType!}
          isNew={editorIsNew}
          parentTypes={taskTypes}
          onSave={handleSaveType}
          onClose={() => { setShowEditor(false); setEditorType(null); }}
        />
      )}

      {/* Custom Module Editor */}
      {customModuleEditor && (() => {
        const targetType = flatTypes.find(t => t.id === customModuleEditor.typeId);
        const normalizedName = customModuleName.trim();
        const hasDuplicate = Boolean(targetType?.skeletonModules.some(mod => mod === normalizedName && mod !== customModuleEditor.originalName));
        const canSave = normalizedName.length > 0 && normalizedName.length <= 20 && !hasDuplicate;
        return (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]" style={{ background: 'rgba(13,17,23,0.25)', backdropFilter: 'blur(4px)' }} onClick={() => setCustomModuleEditor(null)}>
            <div className="bg-white rounded-md w-full max-w-sm mx-4" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-modal)' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {customModuleEditor.originalName ? '编辑自定义模块' : '新增自定义模块'}
                  </h2>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>当前任务类型：{targetType?.name}</p>
                </div>
                <button onClick={() => setCustomModuleEditor(null)} className="p-1 rounded-md hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-5 py-4">
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>模块名称</label>
                <input
                  autoFocus
                  value={customModuleName}
                  maxLength={20}
                  onChange={e => setCustomModuleName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && canSave) saveCustomModule();
                    if (e.key === 'Escape') setCustomModuleEditor(null);
                  }}
                  placeholder="如：技术方案要求"
                  className="w-full px-3 py-2 rounded-md text-[13px] outline-none bg-white"
                  style={{ border: `1px solid ${hasDuplicate ? 'var(--danger)' : 'var(--border-default)'}`, color: 'var(--text-primary)' }}
                />
                <div className="flex items-center justify-between mt-1.5 text-[10px]">
                  <span style={{ color: hasDuplicate ? 'var(--danger)' : 'var(--text-tertiary)' }}>
                    {hasDuplicate ? '当前骨架中已存在同名模块' : '添加后可继续拖拽调整展示顺序'}
                  </span>
                  <span style={{ color: 'var(--text-disabled)' }}>{customModuleName.length}/20</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button onClick={() => setCustomModuleEditor(null)}
                  className="px-4 py-2 rounded-md text-[13px] font-medium"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  取消
                </button>
                <button onClick={saveCustomModule} disabled={!canSave}
                  className="px-4 py-2 rounded-md text-[13px] font-semibold text-white transition-all"
                  style={{ backgroundColor: canSave ? 'var(--brand)' : 'var(--text-disabled)', cursor: canSave ? 'pointer' : 'not-allowed' }}>
                  {customModuleEditor.originalName ? '保存修改' : '添加模块'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTargetInfo && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" style={{ background: 'rgba(13,17,23,0.25)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-md w-full max-w-md mx-4" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-modal)' }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <AlertTriangle className="w-6 h-6 shrink-0" style={{ color: 'var(--danger)' }} />
              <h2 className="text-[17px] font-semibold" style={{ color: 'var(--text-primary)' }}>确认删除</h2>
            </div>
            <div className="px-5 py-4">
              <div className="p-4 rounded-md" style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger)' }}>
                <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  确定要删除 <span style={{ color: 'var(--danger)' }}>「{deleteTargetInfo.name}」</span>
                  {isDeletingParent ? '（父类）' : ''} 吗？
                </p>
                {isDeletingParent && deleteChildCount > 0 && (
                  <p className="text-[13px] mt-2" style={{ color: 'var(--danger)' }}>
                    删除父类将同时删除其下
                    <span className="font-bold"> {deleteChildCount} 个子类</span>
                    ，包括：
                    <span className="font-medium">{
                      taskTypes.find(t => t.id === deleteTargetId)?.children.map(c => c.name).join('、')
                    }</span>
                  </p>
                )}
                <p className="text-[13px] mt-3 font-semibold" style={{ color: 'var(--danger)' }}>
                  此操作不可恢复
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); }}
                className="px-4 py-2 rounded-md text-[13px] font-medium"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                取消
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 rounded-md text-[13px] font-semibold text-white transition-all"
                style={{ backgroundColor: 'var(--danger)' }}>
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ===== Badge Grant/Revoke Types =====
interface BadgeRecord {
  id: string;
  username: string;
  badge: string;
  grantedAt: string;
  reason: string;
}

interface TagRequest {
  id: string;
  username: string;
  requestedBadge: string;
  reason: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const MOCK_USERS = [
  '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
  'CSDN官方账号', '代码大师', '前端艺术家', '设计工匠', '视频达人',
];

const INITIAL_BADGE_RECORDS: BadgeRecord[] = [
  { id: 'br-1', username: '张三', badge: '平台建设方', grantedAt: '2026-03-15', reason: '参与CSDN核心平台开发' },
  { id: 'br-2', username: '李四', badge: '官方推荐服务商', grantedAt: '2026-04-20', reason: '企业级服务能力优秀' },
  { id: 'br-3', username: '代码大师', badge: '行业专家', grantedAt: '2026-05-10', reason: 'AI领域权威认证' },
  { id: 'br-4', username: '前端艺术家', badge: '金牌合作伙伴', grantedAt: '2026-05-22', reason: '长期稳定合作超3年' },
  { id: 'br-5', username: '王五', badge: '平台建设方', grantedAt: '2026-05-28', reason: '参与平台运营工具建设' },
];

const INITIAL_TAG_REQUESTS: TagRequest[] = [
  { id: 'tr-1', username: '张工作室', requestedBadge: '金牌合作伙伴', reason: '已完成15个订单，按时交付率96%', requestedAt: '2026-06-05', status: 'pending' },
  { id: 'tr-2', username: '李开发者', requestedBadge: '行业专家', reason: '拥有10年全栈开发经验', requestedAt: '2026-06-06', status: 'pending' },
];

function BadgeConfig() {
  const [badgeTypes, setBadgeTypes] = useState<string[]>(INITIAL_BADGE_TYPES);
  const [records, setRecords] = useState<BadgeRecord[]>(INITIAL_BADGE_RECORDS);
  const [tagRequests, setTagRequests] = useState<TagRequest[]>(INITIAL_TAG_REQUESTS);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showAddBadgeModal, setShowAddBadgeModal] = useState(false);
  const [showEditBadgeModal, setShowEditBadgeModal] = useState(false);
  const [editBadgeTarget, setEditBadgeTarget] = useState('');
  const [newBadgeName, setNewBadgeName] = useState('');
  const [editBadgeName, setEditBadgeName] = useState('');
  const [revokeTarget, setRevokeTarget] = useState<BadgeRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Grant form state
  const [grantUserSearch, setGrantUserSearch] = useState('');
  const [grantUser, setGrantUser] = useState('');
  const [grantBadge, setGrantBadge] = useState('');
  const [grantReason, setGrantReason] = useState('');

  // Revoke form state
  const [revokeReason, setRevokeReason] = useState('');

  const filteredUsers = MOCK_USERS.filter(u =>
    u.toLowerCase().includes(grantUserSearch.toLowerCase()) &&
    !records.some(r => r.username === u && r.badge === grantBadge)
  );

  const badgeCounts = badgeTypes.map(badge => ({
    name: badge,
    count: records.filter(r => r.badge === badge).length,
  }));

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddBadgeType = () => {
    if (!newBadgeName.trim()) { showToast('error', '请输入标签名称'); return; }
    if (badgeTypes.includes(newBadgeName.trim())) { showToast('error', '该标签类型已存在'); return; }
    setBadgeTypes(prev => [...prev, newBadgeName.trim()]);
    setNewBadgeName('');
    setShowAddBadgeModal(false);
    showToast('success', `已新增标签类型「${newBadgeName.trim()}」`);
  };

  const handleEditBadgeType = () => {
    if (!editBadgeName.trim()) { showToast('error', '请输入标签名称'); return; }
    if (badgeTypes.includes(editBadgeName.trim()) && editBadgeName.trim() !== editBadgeTarget) { showToast('error', '该标签类型已存在'); return; }
    setBadgeTypes(prev => prev.map(b => b === editBadgeTarget ? editBadgeName.trim() : b));
    // Also update existing records and requests
    setRecords(prev => prev.map(r => r.badge === editBadgeTarget ? { ...r, badge: editBadgeName.trim() } : r));
    setTagRequests(prev => prev.map(r => r.requestedBadge === editBadgeTarget ? { ...r, requestedBadge: editBadgeName.trim() } : r));
    setEditBadgeTarget('');
    setEditBadgeName('');
    setShowEditBadgeModal(false);
    showToast('success', `标签类型已更新为「${editBadgeName.trim()}」`);
  };

  const handleDeleteBadgeType = (badge: string) => {
    if (records.some(r => r.badge === badge)) { showToast('error', `标签「${badge}」下仍有持有用户，无法删除`); return; }
    setBadgeTypes(prev => prev.filter(b => b !== badge));
    setTagRequests(prev => prev.filter(r => r.requestedBadge !== badge));
    showToast('success', `已删除标签类型「${badge}」`);
  };

  const handleApproveRequest = (req: TagRequest) => {
    const newRecord: BadgeRecord = {
      id: `br-${Date.now()}`,
      username: req.username,
      badge: req.requestedBadge,
      grantedAt: new Date().toISOString().slice(0, 10),
      reason: req.reason,
    };
    setRecords(prev => [newRecord, ...prev]);
    setTagRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' as const } : r));
    showToast('success', `已通过「${req.username}」的「${req.requestedBadge}」申请`);
  };

  const handleRejectRequest = (req: TagRequest) => {
    setTagRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' as const } : r));
    showToast('success', `已拒绝「${req.username}」的「${req.requestedBadge}」申请`);
  };

  const handleGrant = () => {
    if (!grantUser) { showToast('error', '请选择目标用户'); return; }
    if (!grantBadge) { showToast('error', '请选择标签类型'); return; }
    if (!grantReason.trim()) { showToast('error', '请填写发放原因'); return; }
    const exists = records.some(r => r.username === grantUser && r.badge === grantBadge);
    if (exists) { showToast('error', '该用户已持有此标签'); return; }

    const newRecord: BadgeRecord = {
      id: `br-${Date.now()}`,
      username: grantUser,
      badge: grantBadge,
      grantedAt: new Date().toISOString().slice(0, 10),
      reason: grantReason.trim(),
    };
    setRecords(prev => [newRecord, ...prev]);
    setShowGrantModal(false);
    setGrantUser(''); setGrantBadge(''); setGrantReason(''); setGrantUserSearch('');
    showToast('success', `已向「${grantUser}」发放「${grantBadge}」标签`);
  };

  const openRevoke = (record: BadgeRecord) => {
    setRevokeTarget(record);
    setRevokeReason('');
    setShowRevokeModal(true);
  };

  const handleRevoke = () => {
    if (!revokeTarget) return;
    if (!revokeReason.trim()) { showToast('error', '请填写撤销原因'); return; }
    setRecords(prev => prev.filter(r => r.id !== revokeTarget.id));
    setShowRevokeModal(false);
    setRevokeTarget(null);
    setRevokeReason('');
    showToast('success', `已撤销「${revokeTarget.username}」的「${revokeTarget.badge}」标签`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[60] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in" style={{
          backgroundColor: toastMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
          border: `1px solid ${toastMsg.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
        }}>
          {toastMsg.type === 'success'
            ? <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
            : <AlertTriangle className="w-4 h-4" style={{ color: 'var(--danger)' }} />
          }
          <span className="text-[13px] font-medium" style={{ color: toastMsg.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>{toastMsg.text}</span>
        </div>
      )}

      <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>管理可由运营端人工发放的官方认证标签，支持新增/编辑/删除标签类型。用户可在个人中心申请标签，运营端审批通过后自动发放。</p>

      {/* Badge Type Management Header */}
      <div className="flex items-center justify-between mt-3 mb-3">
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          标签类型
          <span className="text-[12px] ml-2 font-normal" style={{ color: 'var(--text-tertiary)' }}>共 {badgeTypes.length} 种</span>
        </h3>
        <button
          onClick={() => { setNewBadgeName(''); setShowAddBadgeModal(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all"
          style={{ backgroundColor: 'var(--brand)', color: '#fff' }}>
          <Plus className="w-3.5 h-3.5" />
          新增标签类型
        </button>
      </div>

      {/* Badge Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {badgeCounts.map(({ name, count }) => (
          <div key={name} className="bg-white rounded-md p-4 relative group" style={{ border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--warning-bg)', border: '2px solid var(--warning-border)' }}>
                  <Shield className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</div>
                  <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>金色边框 · 官方认证图标</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[22px] font-bold" style={{ color: 'var(--brand)' }}>{count}</div>
                <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>持有用户</div>
              </div>
            </div>
            {/* Edit/Delete hover controls */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => { setEditBadgeTarget(name); setEditBadgeName(name); setShowEditBadgeModal(true); }}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--bg-hover)] transition-colors"
                style={{ color: 'var(--text-tertiary)' }}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button
                onClick={() => { if (window.confirm(`确认删除标签类型「${name}」？`)) handleDeleteBadgeType(name); }}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--danger-bg)] transition-colors"
                style={{ color: 'var(--text-tertiary)' }}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Grant Button + Holder List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          标签持有者列表
          <span className="text-[12px] ml-2 font-normal" style={{ color: 'var(--text-tertiary)' }}>共 {records.length} 条记录</span>
        </h3>
        <button
          onClick={() => { setShowGrantModal(true); setGrantUser(''); setGrantBadge(''); setGrantReason(''); setGrantUserSearch(''); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-semibold text-white transition-all"
          style={{ backgroundColor: 'var(--brand)' }}>
          <UserPlus className="w-4 h-4" />
          发放标签
        </button>
      </div>

      {/* Badge Holder Table */}
      <div className="bg-white rounded-md overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-hover)' }}>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>用户名</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>标签类型</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>发放时间</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>发放原因</th>
                <th className="text-right px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-disabled)' }} />
                    <div className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>暂无标签持有记录</div>
                    <div className="text-[12px] mt-1" style={{ color: 'var(--text-disabled)' }}>点击上方「发放标签」为用户授予官方认证</div>
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="transition-all" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white" style={{ backgroundColor: 'var(--brand)' }}>
                          {record.username[0]}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{record.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium" style={{ color: 'var(--warning)', backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }}>
                        <Shield className="w-3 h-3" />
                        {record.badge}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                        <Clock className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                        {record.grantedAt}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-[240px]">
                      <span className="text-[12px] truncate block" style={{ color: 'var(--text-tertiary)' }}>{record.reason}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openRevoke(record)}
                        className="px-3 py-1 rounded-md text-[12px] font-medium transition-all hover:bg-[var(--danger-bg)]"
                        style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                        撤销
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Tag Requests */}
      {tagRequests.length > 0 && (
        <>
          <h3 className="text-[14px] font-semibold mt-8 mb-3" style={{ color: 'var(--text-primary)' }}>
            用户标签申请
            <span className="text-[12px] ml-2 font-normal" style={{ color: 'var(--text-tertiary)' }}>
              共 {tagRequests.length} 条 · 待处理 {tagRequests.filter(r => r.status === 'pending').length} 条
            </span>
          </h3>
          <div className="bg-white rounded-md overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-hover)' }}>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>申请人</th>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>申请标签</th>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>申请原因</th>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>申请时间</th>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>状态</th>
                    <th className="text-right px-5 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {tagRequests.map(req => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--text-primary)' }}>{req.username}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>{req.requestedBadge}</span>
                      </td>
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <span className="text-[12px] truncate block" style={{ color: 'var(--text-tertiary)' }}>{req.reason}</span>
                      </td>
                      <td className="px-5 py-3.5"><span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{req.requestedAt}</span></td>
                      <td className="px-5 py-3.5">
                        {req.status === 'pending' && <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>待审核</span>}
                        {req.status === 'approved' && <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>已通过</span>}
                        {req.status === 'rejected' && <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>已拒绝</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {req.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleApproveRequest(req)} className="px-3 py-1 rounded-md text-[11px] font-medium text-white" style={{ backgroundColor: 'var(--success)' }}>通过</button>
                            <button onClick={() => handleRejectRequest(req)} className="px-3 py-1 rounded-md text-[11px] font-medium text-white" style={{ backgroundColor: 'var(--danger)' }}>拒绝</button>
                          </div>
                        )}
                        {req.status !== 'pending' && (
                          <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Grant Badge Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" style={{ background: 'rgba(13,17,23,0.25)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-md w-full max-w-md mx-4" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-modal)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="text-[17px] font-semibold" style={{ color: 'var(--text-primary)' }}>发放认证标签</h2>
              <button onClick={() => setShowGrantModal(false)} className="p-1 rounded-md hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Target User */}
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>目标用户</label>
                <div className="relative">
                  <input
                    value={grantUserSearch}
                    onChange={e => setGrantUserSearch(e.target.value)}
                    placeholder="搜索用户名..."
                    className="w-full px-3 py-2 rounded-md text-[13px] outline-none bg-white"
                    style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                    onFocus={() => { if (!grantUser) setGrantUserSearch(''); }}
                  />
                  {grantUserSearch && filteredUsers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md z-10 max-h-[180px] overflow-y-auto" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
                      {filteredUsers.map(user => (
                        <button
                          key={user}
                          onClick={() => { setGrantUser(user); setGrantUserSearch(user); }}
                          className="w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--bg-hover)] transition-colors"
                          style={{ color: 'var(--text-primary)' }}>
                          {user}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {grantUser && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium" style={{ color: 'var(--brand)', backgroundColor: 'var(--brand-subtle)' }}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {grantUser}
                  </div>
                )}
              </div>

              {/* Badge Type */}
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>标签类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {badgeTypes.map(badge => {
                    const selected = grantBadge === badge;
                    return (
                      <button
                        key={badge}
                        onClick={() => setGrantBadge(badge)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-md text-[13px] text-left transition-all"
                        style={selected
                          ? { color: 'var(--warning)', backgroundColor: 'var(--warning-bg)', border: '2px solid var(--warning-border)' }
                          : { color: 'var(--text-secondary)', border: '1px solid var(--border-default)', transition: 'all var(--transition-fast)' }}>
                        <Shield className="w-4 h-4 shrink-0" style={{ color: selected ? 'var(--warning)' : 'var(--text-tertiary)' }} />
                        {badge}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  发放原因
                  <span className="text-[10px] ml-1" style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  value={grantReason}
                  onChange={e => setGrantReason(e.target.value)}
                  placeholder="请填写标签发放的具体原因和依据..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md text-[13px] outline-none bg-white resize-none"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setShowGrantModal(false)}
                className="px-4 py-2 rounded-md text-[13px] font-medium"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                取消
              </button>
              <button onClick={handleGrant}
                className="px-4 py-2 rounded-md text-[13px] font-semibold text-white transition-all"
                style={{ backgroundColor: 'var(--brand)' }}>
                确认发放
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Badge Modal */}
      {showRevokeModal && revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" style={{ background: 'rgba(13,17,23,0.25)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-md w-full max-w-md mx-4" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-modal)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="flex items-center gap-2 text-[17px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: 'var(--danger)' }} />
                撤销认证标签
              </h2>
              <button onClick={() => setShowRevokeModal(false)} className="p-1 rounded-md hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger)' }}>
                <div className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
                  将撤销 <span className="font-semibold" style={{ color: 'var(--danger)' }}>{revokeTarget.username}</span> 的
                  <span className="font-semibold ml-1" style={{ color: 'var(--warning)' }}>{revokeTarget.badge}</span> 标签
                </div>
                <div className="text-[12px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  原发放原因：{revokeTarget.reason} · {revokeTarget.grantedAt}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  撤销原因
                  <span className="text-[10px] ml-1" style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  value={revokeReason}
                  onChange={e => setRevokeReason(e.target.value)}
                  placeholder="请填写撤销标签的具体原因..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md text-[13px] outline-none bg-white resize-none"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setShowRevokeModal(false)}
                className="px-4 py-2 rounded-md text-[13px] font-medium"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                取消
              </button>
              <button onClick={handleRevoke}
                className="px-4 py-2 rounded-md text-[13px] font-semibold text-white transition-all"
                style={{ backgroundColor: 'var(--danger)' }}>
                确认撤销
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Badge Type Modal */}
      {showAddBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" style={{ background: 'rgba(13,17,23,0.25)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-md w-full max-w-md mx-4" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-modal)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="text-[17px] font-semibold" style={{ color: 'var(--text-primary)' }}>新增标签类型</h2>
              <button onClick={() => { setShowAddBadgeModal(false); setNewBadgeName(''); }} className="p-1 rounded-md hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  标签名称<span className="text-[10px] ml-1" style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input type="text" value={newBadgeName} onChange={e => setNewBadgeName(e.target.value)} placeholder="例如：技术领军、行业标杆..."
                  className="w-full px-3 py-2 rounded-md text-[13px] outline-none bg-white"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowAddBadgeModal(false); setNewBadgeName(''); }}
                  className="flex-1 px-4 py-2 rounded-md text-[13px] font-medium"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>取消</button>
                <button onClick={handleAddBadgeType}
                  className="flex-1 px-4 py-2 rounded-md text-[13px] font-semibold text-white" style={{ backgroundColor: 'var(--brand)' }}>确认新增</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Badge Type Modal */}
      {showEditBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" style={{ background: 'rgba(13,17,23,0.25)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-md w-full max-w-md mx-4" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-modal)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="text-[17px] font-semibold" style={{ color: 'var(--text-primary)' }}>编辑标签类型</h2>
              <button onClick={() => { setShowEditBadgeModal(false); setEditBadgeName(''); setEditBadgeTarget(''); }} className="p-1 rounded-md hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-tertiary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  标签名称<span className="text-[10px] ml-1" style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input type="text" value={editBadgeName} onChange={e => setEditBadgeName(e.target.value)} placeholder="编辑标签名称..."
                  className="w-full px-3 py-2 rounded-md text-[13px] outline-none bg-white"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>重命名将同步更新所有持有该标签的用户记录和待审核申请</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowEditBadgeModal(false); setEditBadgeName(''); setEditBadgeTarget(''); }}
                  className="flex-1 px-4 py-2 rounded-md text-[13px] font-medium"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>取消</button>
                <button onClick={handleEditBadgeType}
                  className="flex-1 px-4 py-2 rounded-md text-[13px] font-semibold text-white" style={{ backgroundColor: 'var(--brand)' }}>确认修改</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OtherConfig() {
  return (
    <div className="bg-white rounded-md p-12 text-center" style={{ border: '1px solid var(--border-subtle)' }}>
      <Settings className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-disabled)' }} />
      <p className="text-[18px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>即将上线</p>
      <p className="text-[13px] mt-2" style={{ color: 'var(--text-disabled)' }}>其他运营配置项将在后续版本中逐步开放</p>
      <p className="text-[12px] mt-1" style={{ color: 'var(--text-disabled)' }}>包括：字段级校验规则配置、模板版本管理等</p>
    </div>
  );
}

// ===== Main Page Component =====
interface OperationConfigPageProps {
  pageTitle: string;
  onBack: () => void;
}

export function OperationConfigPage({ pageTitle, onBack }: OperationConfigPageProps) {
  const renderContent = () => {
    if (pageTitle === '任务类型管理') return <TaskTypeManager />;
    if (pageTitle === '认证标签管理') return <BadgeConfig />;
    return <OtherConfig />;
  };

  const isTaskTypePage = pageTitle === '任务类型管理';

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-root)' }}>
      {/* Header bar */}
      <div className="bg-white px-6 py-3.5 shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-[13px] font-medium transition-all" style={{ color: 'var(--text-secondary)', transition: 'all var(--transition-fast)' }}>
            <ArrowLeft className="w-4 h-4" />
            返回运营看板
          </button>
          <span className="w-px h-5" style={{ backgroundColor: 'var(--border-default)' }} />
          <h1 className="text-[17px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>{pageTitle}</h1>
        </div>
      </div>

      {/* Content area */}
      {isTaskTypePage ? (
        renderContent()
      ) : (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-[800px] mx-auto">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
}
