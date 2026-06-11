import { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Upload, Download, ArrowLeft, Search, ToggleLeft, ToggleRight, X, CheckSquare, Square, History, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface AgreementTemplate {
  id: number;
  name: string;
  description: string;
  fileName: string;
  fileSize: number;
  applicableScenarios: string[];
  isEnabled: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
  uploadBy: string;
}

interface VersionHistoryEntry {
  version: string;
  updatedAt: string;
  updatedBy: string;
  fileName: string;
  fileSize: number;
  description: string;
}

interface AgreementTemplateConfigProps {
  onNavigate?: (page: string) => void;
}

export function AgreementTemplateConfig({ onNavigate }: AgreementTemplateConfigProps) {
  const [templates, setTemplates] = useState<AgreementTemplate[]>([
    {
      id: 1,
      name: '标准三方协议模板',
      description: '适用于一般性软件开发订单的标准三方协议',
      fileName: '标准三方协议模板_v1.2.docx',
      fileSize: 65536,
      applicableScenarios: ['软件开发', '平面设计', '视频创作'],
      isEnabled: true,
      version: '1.2',
      createdAt: '2026-01-15 10:30',
      updatedAt: '2026-03-10 14:20',
      uploadBy: '运营管理员'
    },
    {
      id: 2,
      name: '硬件订单专用协议',
      description: '针对硬件类订单的专用三方协议模板，包含硬件质保条款',
      fileName: '硬件订单协议模板_v1.0.docx',
      fileSize: 81920,
      applicableScenarios: ['硬件订单'],
      isEnabled: true,
      version: '1.0',
      createdAt: '2026-02-01 09:00',
      updatedAt: '2026-02-20 16:45',
      uploadBy: '运营管理员'
    },
    {
      id: 3,
      name: '保密协议增强版',
      description: '包含严格保密条款的协议模板，适用于涉密项目',
      fileName: '保密协议增强版_v2.1.docx',
      fileSize: 73728,
      applicableScenarios: ['软件开发', '文本创作'],
      isEnabled: true,
      version: '2.1',
      createdAt: '2026-01-20 11:15',
      updatedAt: '2026-03-05 10:30',
      uploadBy: '法务部'
    },
    {
      id: 4,
      name: '营销推广协议模板',
      description: '适用于营销推广类订单的协议模板',
      fileName: '营销推广协议_v1.0.docx',
      fileSize: 57344,
      applicableScenarios: ['营销推广'],
      isEnabled: false,
      version: '1.0',
      createdAt: '2026-03-01 14:00',
      updatedAt: '2026-03-01 14:00',
      uploadBy: '运营管理员'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AgreementTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    applicableScenarios: [] as string[],
    isEnabled: true
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [versionHistories, setVersionHistories] = useState<Record<number, VersionHistoryEntry[]>>({});
  const [versionBumpType, setVersionBumpType] = useState<'minor' | 'major'>('minor');
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

  const taskTypeOptions = [
    '软件开发',
    '平面设计',
    '视频创作',
    '文本创作',
    '产品评测',
    '营销推广',
    '硬件订单'
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      applicableScenarios: [],
      isEnabled: true
    });
    setUploadedFile(null);
    setShowModal(true);
  };

  const handleEdit = (template: AgreementTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      applicableScenarios: template.applicableScenarios,
      isEnabled: template.isEnabled
    });
    setUploadedFile(null);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除此协议模板吗？删除后客户将无法选择此模板。')) {
      setTemplates(templates.filter(t => t.id !== id));
      toast.success('协议模板已删除');
    }
  };

  const handleToggleEnabled = (id: number) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, isEnabled: !t.isEnabled } : t
    ));
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTemplates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTemplates.map(t => t.id)));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBatchToggle = (enable: boolean) => {
    setTemplates(templates.map(t =>
      selectedIds.has(t.id) ? { ...t, isEnabled: enable } : t
    ));
    setSelectedIds(new Set());
    toast.success(enable ? '已批量启用所选模板' : '已批量停用所选模板');
  };

  const handleBatchDelete = () => {
    if (confirm(`确定要删除所选 ${selectedIds.size} 个协议模板吗？此操作不可恢复。`)) {
      setTemplates(templates.filter(t => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
      toast.success('已批量删除所选模板');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!validTypes.includes(file.type)) {
        toast.error('请上传Word文档格式文件（.doc或.docx）');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('文件大小不能超过5MB');
        return;
      }
      
      setUploadedFile(file);
    }
  };

  const handleScenarioToggle = (scenario: string) => {
    if (formData.applicableScenarios.includes(scenario)) {
      setFormData({
        ...formData,
        applicableScenarios: formData.applicableScenarios.filter(s => s !== scenario)
      });
    } else {
      setFormData({
        ...formData,
        applicableScenarios: [...formData.applicableScenarios, scenario]
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('请输入模板名称');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('请输入模板描述');
      return;
    }
    if (formData.applicableScenarios.length === 0) {
      toast.error('请至少选择一个适用场景');
      return;
    }
    if (!editingTemplate && !uploadedFile) {
      toast.error('请上传协议模板文件');
      return;
    }

    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\//g, '-');

    if (editingTemplate) {
      const currentVersion = parseFloat(editingTemplate.version);
      let newVersion: string;
      if (versionBumpType === 'major') {
        newVersion = (Math.floor(currentVersion) + 1).toFixed(1);
      } else {
        newVersion = (Math.round((currentVersion + 0.1) * 10) / 10).toFixed(1);
      }

      const historyEntry: VersionHistoryEntry = {
        version: editingTemplate.version,
        updatedAt: editingTemplate.updatedAt,
        updatedBy: editingTemplate.uploadBy,
        fileName: editingTemplate.fileName,
        fileSize: editingTemplate.fileSize,
        description: editingTemplate.description
      };

      setVersionHistories(prev => {
        const existing = prev[editingTemplate.id] || [];
        const firstEntry = existing.length > 0 ? existing[0] : null;
        if (firstEntry && firstEntry.version === editingTemplate.version) {
          return prev;
        }
        return {
          ...prev,
          [editingTemplate.id]: [historyEntry, ...existing]
        };
      });

      setTemplates(templates.map(t =>
        t.id === editingTemplate.id
          ? {
              ...t,
              ...formData,
              fileName: uploadedFile ? uploadedFile.name : t.fileName,
              fileSize: uploadedFile ? uploadedFile.size : t.fileSize,
              version: newVersion,
              updatedAt: now
            }
          : t
      ));
      toast.success('协议模板已更新');
      setVersionBumpType('minor');
    } else {
      const newTemplate: AgreementTemplate = {
        id: Math.max(...templates.map(t => t.id)) + 1,
        ...formData,
        fileName: uploadedFile!.name,
        fileSize: uploadedFile!.size,
        version: '1.0',
        createdAt: now,
        updatedAt: now,
        uploadBy: '运营管理员'
      };
      setTemplates([...templates, newTemplate]);
      toast.success('协议模板已创建');
    }

    setShowModal(false);
  };

  const handleDownload = (template: AgreementTemplate) => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const content = [
      `协议模板：${template.name}`,
      `版本：v${template.version}`,
      `描述：${template.description}`,
      `适用场景：${template.applicableScenarios.join('、')}`,
      `文件名称：${template.fileName}`,
      `文件大小：${formatFileSize(template.fileSize)}`,
      `状态：${template.isEnabled ? '已启用' : '已停用'}`,
      `创建时间：${template.createdAt}`,
      `更新时间：${template.updatedAt}`,
      `上传者：${template.uploadBy}`,
      '',
      '--- 协议模板正文占位 ---',
      '（实际协议内容请查看原始 Word 文档）',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name}_${dateStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="w-full h-full bg-[var(--bg-hover)] overflow-auto">
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

          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-[var(--text-primary)] mb-2">协议模板配置</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              管理客户在协议签署阶段可选择的协议模板
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--border-subtle)] p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[300px] max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索模板名称或描述..."
                    className="w-full pl-10 pr-4 py-2 border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  />
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand-hover)] transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">新增模板</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--border-subtle)] overflow-hidden">
            {filteredTemplates.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-[var(--text-disabled)]" />
                <p className="text-[var(--text-tertiary)] mb-2">暂无协议模板</p>
                <p className="text-sm text-[var(--text-disabled)]">
                  {searchQuery ? '没有找到匹配的模板' : '点击「新增模板」创建第一个协议模板'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-6 py-3 bg-[var(--bg-hover)] border-b border-[var(--border-subtle)]">
                  <button
                    onClick={handleSelectAll}
                    className="p-0.5 text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors"
                    title="全选"
                  >
                    {selectedIds.size === filteredTemplates.length && filteredTemplates.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-[var(--brand)]" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <span className="text-xs text-[var(--text-tertiary)] cursor-pointer" onClick={handleSelectAll}>
                    全选
                  </span>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-6 hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => handleSelectOne(template.id)}
                          className="p-0.5 mt-0.5 text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors shrink-0"
                        >
                          {selectedIds.has(template.id) ? (
                            <CheckSquare className="w-5 h-5 text-[var(--brand)]" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {template.name}
                          </h3>
                          {template.isEnabled ? (
                            <span className="px-3 py-1 bg-[var(--success-bg)] text-[var(--success-text)] text-xs rounded-full font-medium">
                              已启用
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-[var(--bg-hover)] text-[var(--text-tertiary)] text-xs rounded-full font-medium">
                              已停用
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-[var(--bg-hover)] text-[var(--text-tertiary)] text-xs rounded font-mono">
                            v{template.version}
                          </span>
                        </div>

                        <p className="text-sm text-[var(--text-secondary)] mb-3">
                          {template.description}
                        </p>

                        <div className="flex items-center gap-2 mb-3 text-sm text-[var(--text-tertiary)]">
                          <FileText className="w-4 h-4" />
                          <span>{template.fileName}</span>
                          <span>·</span>
                          <span>{formatFileSize(template.fileSize)}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="text-xs text-[var(--text-tertiary)]">适用场景：</span>
                          {template.applicableScenarios.map((scenario) => (
                            <span
                              key={scenario}
                              className="px-2 py-1 bg-[#e7f5ff] text-[#0066cc] text-xs rounded"
                            >
                              {scenario}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                          <span>创建时间：{template.createdAt}</span>
                          <span>更新时间：{template.updatedAt}</span>
                          <span>上传者：{template.uploadBy}</span>
                        </div>

                        {(versionHistories[template.id]?.length ?? 0) > 0 && (
                          <div className="mt-3 border-t border-[var(--border-subtle)] pt-3">
                            <button
                              onClick={() =>
                                setExpandedVersion(expandedVersion === template.id ? null : template.id)
                              }
                              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span>历史版本 ({versionHistories[template.id]?.length ?? 0})</span>
                              {expandedVersion === template.id ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {expandedVersion === template.id && (
                              <div className="mt-2 space-y-1.5 max-h-48 overflow-auto">
                                {versionHistories[template.id]?.map((entry, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3 px-3 py-1.5 bg-[var(--bg-hover)] rounded text-xs"
                                  >
                                    <span className="font-mono text-[var(--brand)] font-medium whitespace-nowrap">
                                      v{entry.version}
                                    </span>
                                    <span className="text-[var(--text-tertiary)]">→</span>
                                    <span className="text-[var(--text-secondary)] truncate max-w-[200px]">
                                      {entry.fileName}
                                    </span>
                                    <span className="text-[var(--text-tertiary)] whitespace-nowrap ml-auto">
                                      {entry.updatedAt}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(template)}
                          className="p-2 text-[#0066cc] hover:bg-[#e7f5ff] rounded transition-colors"
                          title="导出模板信息"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleEnabled(template.id)}
                          className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded transition-colors"
                          title={template.isEnabled ? '停用模板' : '启用模板'}
                        >
                          {template.isEnabled ? (
                            <ToggleRight className="w-5 h-5 text-[var(--success-text)]" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(template)}
                          className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded transition-colors"
                          title="编辑模板"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-2 text-[var(--danger-text)] hover:bg-[#ffebee] rounded transition-colors"
                          title="删除模板"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-lg shadow-2xl border border-[var(--border-subtle)] px-6 py-3 flex items-center gap-4 pointer-events-auto">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              已选 {selectedIds.size} 项
            </span>
            <div className="w-px h-6 bg-[var(--border-subtle)]" />
            <button
              onClick={() => handleBatchToggle(true)}
              className="px-3 py-1.5 text-xs font-medium text-[var(--success-text)] bg-[var(--success-bg)] rounded-lg hover:opacity-80 transition-opacity"
            >
              批量启用
            </button>
            <button
              onClick={() => handleBatchToggle(false)}
              className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-hover)] rounded-lg hover:opacity-80 transition-opacity"
            >
              批量停用
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 text-xs font-medium text-[var(--danger-text)] bg-[#ffebee] rounded-lg hover:opacity-80 transition-opacity"
            >
              批量删除
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-[var(--border-subtle)] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                {editingTemplate ? '编辑协议模板' : '新增协议模板'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  模板名称 <span className="text-[var(--brand)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入模板名称"
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  模板描述 <span className="text-[var(--brand)]">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入模板描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  适用场景 <span className="text-[var(--brand)]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {taskTypeOptions.map((scenario) => (
                    <label
                      key={scenario}
                      className="flex items-center gap-2 p-3 border border-[var(--border-subtle)] rounded-lg cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.applicableScenarios.includes(scenario)}
                        onChange={() => handleScenarioToggle(scenario)}
                        className="w-4 h-4 text-[var(--brand)] border-[var(--text-disabled)] rounded focus:ring-[var(--brand)]"
                      />
                      <span className="text-sm text-[var(--text-primary)]">{scenario}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  协议模板文件 {!editingTemplate && <span className="text-[var(--brand)]">*</span>}
                </label>
                <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-lg p-6 text-center hover:border-[var(--brand)] transition-colors">
                  {uploadedFile ? (
                    <div className="space-y-3">
                      <FileText className="w-12 h-12 mx-auto text-[var(--brand)]" />
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{uploadedFile.name}</p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="text-sm text-[var(--danger-text)] hover:underline"
                      >
                        移除文件
                      </button>
                    </div>
                  ) : editingTemplate ? (
                    <div className="space-y-3">
                      <FileText className="w-12 h-12 mx-auto text-[var(--text-tertiary)]" />
                      <div>
                        <p className="text-sm text-[var(--text-secondary)] mb-1">
                          当前文件：{editingTemplate.fileName}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {formatFileSize(editingTemplate.fileSize)}
                        </p>
                      </div>
                      <label className="inline-block px-4 py-2 bg-[var(--bg-hover)] text-[var(--text-secondary)] rounded-lg cursor-pointer hover:bg-[var(--border-subtle)] transition-colors">
                        <input
                          type="file"
                          accept=".doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        更换文件
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 mx-auto text-[var(--text-tertiary)]" />
                      <div>
                        <label className="inline-block px-4 py-2 bg-[var(--brand)] text-white rounded-lg cursor-pointer hover:bg-[var(--brand-hover)] transition-colors">
                          <input
                            type="file"
                            accept=".doc,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          选择文件上传
                        </label>
                        <p className="text-xs text-[var(--text-tertiary)] mt-2">
                          支持.doc或.docx格式，文件大小不超过5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {editingTemplate && (
                <div className="space-y-2 -mt-3">
                  <p className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-hover)] rounded-lg px-3 py-2">
                    修改模板将创建新版本，当前版本 v{editingTemplate.version}
                  </p>
                  <div className="bg-[var(--bg-hover)] rounded-lg px-3 py-3">
                    <label className="block text-xs font-medium text-[var(--text-primary)] mb-2">
                      版本升级类型
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="versionBump"
                          checked={versionBumpType === 'minor'}
                          onChange={() => setVersionBumpType('minor')}
                          className="w-4 h-4 text-[var(--brand)]"
                        />
                        <span className="text-sm text-[var(--text-primary)]">
                          小版本 <span className="text-xs text-[var(--text-tertiary)]">(v{editingTemplate.version} → v{(Math.round((parseFloat(editingTemplate.version) + 0.1) * 10) / 10).toFixed(1)})</span>
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="versionBump"
                          checked={versionBumpType === 'major'}
                          onChange={() => setVersionBumpType('major')}
                          className="w-4 h-4 text-[var(--brand)]"
                        />
                        <span className="text-sm text-[var(--text-primary)]">
                          大版本 <span className="text-xs text-[var(--text-tertiary)]">(v{editingTemplate.version} → v{(Math.floor(parseFloat(editingTemplate.version)) + 1).toFixed(1)})</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="w-4 h-4 text-[var(--brand)] border-[var(--text-disabled)] rounded focus:ring-[var(--brand)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">启用此模板（客户可在协议签署时选择）</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-[var(--border-subtle)] px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand-hover)] transition-colors"
              >
                {editingTemplate ? '保存修改' : '创建模板'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}