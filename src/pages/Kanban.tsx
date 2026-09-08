import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { 
  MoreHorizontal, Plus, Clock, MessageSquare, Paperclip, X, 
  Send, Download, Trash2, Edit3, CheckCircle2, ArrowRight, 
  ArrowLeft, Search, Filter, AlertCircle, Calendar, User, 
  Tag, UploadCloud, ChevronRight, ChevronDown, FileText, Check,
  Maximize2, Minimize2, Eye
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface KanbanColumn {
  id: string;
  title: string;
  titleTh: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

const columns: KanbanColumn[] = [
  { 
    id: 'todo', 
    title: 'To Do', 
    titleTh: 'รอดำเนินการ',
    color: 'bg-slate-100 dark:bg-slate-800/60',
    badgeBg: 'bg-slate-200 dark:bg-slate-700',
    badgeText: 'text-slate-700 dark:text-slate-200',
    borderColor: 'border-slate-300 dark:border-slate-700'
  },
  { 
    id: 'in-progress', 
    title: 'In Progress', 
    titleTh: 'กำลังดำเนินการ',
    color: 'bg-blue-50/70 dark:bg-blue-950/20',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
    badgeText: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-900/40'
  },
  { 
    id: 'review', 
    title: 'In Review', 
    titleTh: 'รอตรวจสอบ',
    color: 'bg-amber-50/70 dark:bg-amber-950/20',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
    badgeText: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-900/40'
  },
  { 
    id: 'done', 
    title: 'Done', 
    titleTh: 'เสร็จสิ้น',
    color: 'bg-emerald-50/70 dark:bg-emerald-950/20',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-900/40'
  },
];

const priorityConfig: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
  'Critical': { label: 'Critical', badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50', dotClass: 'bg-rose-500' },
  'High': { label: 'High', badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50', dotClass: 'bg-orange-500' },
  'Medium': { label: 'Medium', badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50', dotClass: 'bg-blue-500' },
  'Low': { label: 'Low', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700', dotClass: 'bg-slate-400' },
};

export function Kanban() {
  const { user, employees, language } = useStore();
  
  // State
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('All');
  
  // Expanded Cards State (Map of taskId -> boolean)
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});
  
  // Comments and Attachments cache per task
  const [taskCommentsCache, setTaskCommentsCache] = useState<Record<string, any[]>>({});
  const [taskAttachmentsCache, setTaskAttachmentsCache] = useState<Record<string, any[]>>({});
  const [cardCommentInputs, setCardCommentInputs] = useState<Record<string, string>>({});

  // Modals & Active task
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialColumn, setCreateInitialColumn] = useState('todo');
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    column: 'todo',
    projectId: 'P-2026-018',
    priority: 'Medium',
    dueDate: '',
    assigneeId: ''
  });
  
  // Comments & Attachments for Modal
  const [comments, setComments] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments'>('details');
  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // --- API Fetchers ---
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error('Error fetching tasks:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommentsForTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setTaskCommentsCache(prev => ({ ...prev, [taskId]: data }));
        if (selectedTask?.id === taskId) setComments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAttachmentsForTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments`);
      if (res.ok) {
        const data = await res.json();
        setTaskAttachmentsCache(prev => ({ ...prev, [taskId]: data }));
        if (selectedTask?.id === taskId) setAttachments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Toggle card expansion on click
  const toggleCardExpansion = (taskId: string) => {
    setExpandedTaskIds(prev => {
      const isExpanded = !prev[taskId];
      if (isExpanded) {
        // Fetch comments and attachments when expanding
        fetchCommentsForTask(taskId);
        fetchAttachmentsForTask(taskId);
      }
      return { ...prev, [taskId]: isExpanded };
    });
  };

  // --- Task CRUD Operations ---
  const handleOpenCreateModal = (columnId = 'todo') => {
    setCreateInitialColumn(columnId);
    setTaskFormData({
      title: '',
      description: '',
      column: columnId,
      projectId: 'P-2026-018',
      priority: 'Medium',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      assigneeId: employees[0]?.id || ''
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskFormData)
      });
      if (res.ok) {
        const created = await res.json();
        setTasks(prev => [created, ...prev]);
        setIsCreateModalOpen(false);
      }
    } catch (e) {
      console.error('Failed to create task:', e);
    }
  };

  const handleStartEdit = (task: any) => {
    setIsEditing(true);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      column: task.column || 'todo',
      projectId: task.projectId || 'P-2026-018',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      assigneeId: task.assigneeId || ''
    });
  };

  const handleSaveEditTask = async () => {
    if (!selectedTask || !taskFormData.title.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskFormData)
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
        setSelectedTask(updated);
        setIsEditing(false);
      }
    } catch (e) {
      console.error('Failed to update task:', e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const isConfirmed = window.confirm(
      language === 'TH' ? 'คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?' : 'Are you sure you want to delete this task?'
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        if (selectedTask?.id === taskId) {
          setSelectedTask(null);
        }
      }
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  };

  const handleMoveColumn = async (taskId: string, targetColumn: string) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, column: targetColumn } : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev: any) => ({ ...prev, column: targetColumn }));
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}/column`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column: targetColumn })
      });
      if (!res.ok) {
        fetchTasks(); // Revert on error
      }
    } catch (e) {
      console.error('Failed to move task:', e);
      fetchTasks();
    }
  };

  // --- Step progression helper ---
  const getNextColumn = (currentCol: string) => {
    const idx = columns.findIndex(c => c.id === currentCol);
    if (idx >= 0 && idx < columns.length - 1) return columns[idx + 1].id;
    return null;
  };

  const getPrevColumn = (currentCol: string) => {
    const idx = columns.findIndex(c => c.id === currentCol);
    if (idx > 0) return columns[idx - 1].id;
    return null;
  };

  // --- Comments & Attachments Handlers ---
  const handleSendCardComment = async (taskId: string) => {
    const text = cardCommentInputs[taskId];
    if (!text?.trim() || !user) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          content: text
        })
      });
      if (res.ok) {
        setCardCommentInputs(prev => ({ ...prev, [taskId]: '' }));
        fetchCommentsForTask(taskId);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, commentsCount: (t.commentsCount || 0) + 1 } : t));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCardComment = async (taskId: string, commentId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCommentsForTask(taskId);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, commentsCount: Math.max(0, (t.commentsCount || 1) - 1) } : t));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCardFileUpload = async (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const formattedSize = Number(sizeInMB) >= 1 ? `${sizeInMB} MB` : `${(file.size / 1024).toFixed(0)} KB`;
    const extension = file.name.split('.').pop()?.toLowerCase() || 'file';

    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fileName: file.name,
          fileType: extension,
          fileSize: formattedSize
        })
      });
      if (res.ok) {
        fetchAttachmentsForTask(taskId);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, attachmentsCount: (t.attachmentsCount || 0) + 1 } : t));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCardAttachment = async (taskId: string, attachmentId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments/${attachmentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchAttachmentsForTask(taskId);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, attachmentsCount: Math.max(0, (t.attachmentsCount || 1) - 1) } : t));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openTaskModal = (task: any) => {
    setSelectedTask(task);
    setIsEditing(false);
    setActiveTab('details');
    fetchCommentsForTask(task.id);
    fetchAttachmentsForTask(task.id);
  };

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      handleMoveColumn(taskId, columnId);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.projectId && task.projectId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPriority = selectedPriorityFilter === 'All' || task.priority === selectedPriorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-ikm-bg animate-in fade-in duration-200 select-none">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:px-6 md:py-4 border-b border-ikm-border bg-ikm-card shrink-0 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-ikm-text">
              {language === 'TH' ? 'กระดานจัดการงาน (Kanban Board)' : 'Kanban Board'}
            </h1>
            <span className="text-xs bg-ikm-orange-light text-ikm-orange-dark font-semibold px-2 py-0.5 rounded-full border border-ikm-orange/20">
              Database Sync Active
            </span>
          </div>
          <p className="text-xs md:text-sm text-ikm-text-secondary mt-0.5">
            {language === 'TH' ? 'คลิกการ์ดเพื่อขยายดูไฟล์แนบและกระดานสนทนา บันทึกข้อมูลและสถานะงานเรียลไทม์' : 'Click any card to expand description, attachments, and discussion without leaving the board.'}
          </p>
        </div>
        
        {/* Search, Filter & Action */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-48 md:w-56">
            <Search className="w-4 h-4 text-ikm-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder={language === 'TH' ? 'ค้นหางาน...' : 'Search tasks...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ikm-text-secondary hover:text-ikm-text">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <select 
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="text-xs md:text-sm py-1.5 px-3 rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
          >
            <option value="All">{language === 'TH' ? 'ความสำคัญทั้งหมด' : 'All Priorities'}</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* New Task Button */}
          <button 
            onClick={() => handleOpenCreateModal('todo')}
            className="h-9 px-4 bg-ikm-orange hover:bg-ikm-orange-dark text-white text-xs md:text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'TH' ? 'เพิ่มงานใหม่' : 'New Task'}</span>
          </button>
        </div>
      </div>

      {/* Board Columns Area */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6">
        <div className="flex gap-4 md:gap-6 h-full min-w-max pb-4">
          
          {columns.map((col) => {
            const colTasks = filteredTasks.filter(t => t.column === col.id);
            const isColumnDropTarget = dragOverColumn === col.id;

            return (
              <div 
                key={col.id} 
                className={cn(
                  "w-80 md:w-96 flex flex-col max-h-full rounded-2xl p-3 border transition-all duration-200",
                  col.color,
                  col.borderColor,
                  isColumnDropTarget && "ring-2 ring-ikm-orange bg-ikm-orange-light/20"
                )}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-ikm-text">
                      {language === 'TH' ? col.titleTh : col.title}
                    </span>
                    <span className={cn("flex items-center justify-center h-5 px-2 rounded-full text-xs font-bold", col.badgeBg, col.badgeText)}>
                      {colTasks.length}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleOpenCreateModal(col.id)}
                    className="p-1 rounded-lg text-ikm-text-secondary hover:text-ikm-orange hover:bg-ikm-card transition-colors"
                    title={language === 'TH' ? `เพิ่มงานใน ${col.titleTh}` : `Add task to ${col.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pb-2 pr-1 custom-scrollbar">
                  {colTasks.map(card => {
                    const assignee = employees.find(e => e.id === card.assigneeId);
                    const prevCol = getPrevColumn(card.column);
                    const nextCol = getNextColumn(card.column);
                    const pConf = priorityConfig[card.priority] || priorityConfig['Medium'];
                    const isExpanded = !!expandedTaskIds[card.id];
                    const cardComments = taskCommentsCache[card.id] || [];
                    const cardAttachments = taskAttachmentsCache[card.id] || card.attachments || [];

                    return (
                      <div 
                        key={card.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id)}
                        className={cn(
                          "bg-ikm-card border border-ikm-border rounded-xl p-3.5 transition-all group relative cursor-pointer shadow-xs",
                          isExpanded ? "border-ikm-orange shadow-md ring-1 ring-ikm-orange/30" : "hover:border-ikm-orange/70 hover:shadow-sm",
                          draggedTaskId === card.id && "opacity-50 border-dashed border-ikm-orange"
                        )}
                        onClick={() => toggleCardExpansion(card.id)}
                      >
                        {/* Top Metadata */}
                        <div className="flex justify-between items-start mb-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1", pConf.badgeClass)}>
                              <span className={cn("w-1.5 h-1.5 rounded-full", pConf.dotClass)} />
                              {card.priority}
                            </span>
                            <span className="font-medium bg-ikm-bg px-2 py-0.5 rounded border border-ikm-border text-[10px] text-ikm-text-secondary">
                              {card.projectId || 'General'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Move Left Button */}
                            {prevCol && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMoveColumn(card.id, prevCol); }}
                                className="p-1 text-ikm-text-secondary hover:text-ikm-orange hover:bg-ikm-bg rounded transition-colors"
                                title={language === 'TH' ? 'ย้อนกลับขั้นตอน' : 'Move to Previous Stage'}
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Move Right Button */}
                            {nextCol && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMoveColumn(card.id, nextCol); }}
                                className="p-1 text-ikm-text-secondary hover:text-ikm-orange hover:bg-ikm-bg rounded transition-colors"
                                title={language === 'TH' ? 'ไปยังขั้นตอนถัดไป' : 'Move to Next Stage'}
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Expand Indicator Icon */}
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleCardExpansion(card.id); }}
                              className="p-1 text-ikm-text-secondary hover:text-ikm-orange hover:bg-ikm-bg rounded transition-colors"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-ikm-orange" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            {/* Quick Delete */}
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteTask(card.id); }}
                              className="p-1 text-ikm-text-secondary hover:text-status-red hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
                              title={language === 'TH' ? 'ลบงาน' : 'Delete Task'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h4 className="font-semibold text-ikm-text text-sm mb-1 leading-snug">
                          {card.title}
                        </h4>

                        {/* Collapsed view brief description */}
                        {!isExpanded && card.description && (
                          <p className="text-xs text-ikm-text-secondary line-clamp-2 mb-2.5">
                            {card.description}
                          </p>
                        )}

                        {/* Bottom Info: Due Date, Assignee & Counts (when collapsed) */}
                        {!isExpanded && (
                          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-ikm-border text-xs text-ikm-text-secondary">
                            <div className="flex items-center gap-2">
                              {card.dueDate && (
                                <span className="flex items-center gap-1 text-[11px]">
                                  <Clock className="w-3 h-3 text-ikm-orange" />
                                  {format(new Date(card.dueDate), 'd MMM')}
                                </span>
                              )}
                              {card.commentsCount > 0 && (
                                <span className="flex items-center gap-0.5 text-[11px] text-ikm-text-secondary">
                                  <MessageSquare className="w-3 h-3 text-blue-500" />
                                  {card.commentsCount}
                                </span>
                              )}
                              {card.attachmentsCount > 0 && (
                                <span className="flex items-center gap-0.5 text-[11px] text-ikm-text-secondary">
                                  <Paperclip className="w-3 h-3 text-emerald-500" />
                                  {card.attachmentsCount}
                                </span>
                              )}
                            </div>
                            
                            {/* Assignee Avatar */}
                            <div className="flex items-center">
                              {assignee ? (
                                <div className="flex items-center gap-1.5" title={assignee.name}>
                                  <Avatar 
                                    fallback={assignee.name.charAt(0)} 
                                    src={`https://i.pravatar.cc/150?u=${assignee.id}`} 
                                    className="w-6 h-6 ring-1 ring-ikm-border" 
                                  />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-ikm-bg border border-dashed border-ikm-border flex items-center justify-center text-[10px] text-ikm-text-secondary">
                                  ?
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* --- EXPANDED VIEW INLINE WITHIN CARD --- */}
                        {isExpanded && (
                          <div 
                            className="mt-3 pt-3 border-t border-ikm-border space-y-3 animate-in fade-in duration-150"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Full Description Area */}
                            <div className="bg-ikm-bg/70 p-2.5 rounded-lg border border-ikm-border/70">
                              <span className="text-[11px] font-bold text-ikm-text-secondary uppercase tracking-wider block mb-1">
                                {language === 'TH' ? 'รายละเอียดงาน (Description)' : 'Description'}
                              </span>
                              <p className="text-xs text-ikm-text whitespace-pre-wrap leading-relaxed">
                                {card.description || (language === 'TH' ? 'ไม่มีรายละเอียดเพิ่มเติม' : 'No description provided.')}
                              </p>
                            </div>

                            {/* Assignee & Due Date Meta */}
                            <div className="flex items-center justify-between text-xs bg-ikm-bg/50 p-2 rounded-lg border border-ikm-border/60">
                              <div className="flex items-center gap-2">
                                <span className="text-ikm-text-secondary text-[11px]">{language === 'TH' ? 'ผู้รับผิดชอบ:' : 'Assignee:'}</span>
                                {assignee ? (
                                  <div className="flex items-center gap-1.5">
                                    <Avatar 
                                      fallback={assignee.name.charAt(0)} 
                                      src={`https://i.pravatar.cc/150?u=${assignee.id}`} 
                                      className="w-5 h-5" 
                                    />
                                    <span className="font-semibold text-ikm-text text-xs">{assignee.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-ikm-text-secondary italic text-[11px]">{language === 'TH' ? 'ไม่ระบุ' : 'Unassigned'}</span>
                                )}
                              </div>
                              {card.dueDate && (
                                <div className="flex items-center gap-1 text-[11px] text-ikm-text">
                                  <Clock className="w-3.5 h-3.5 text-ikm-orange" />
                                  <span>{format(new Date(card.dueDate), 'd MMM yyyy')}</span>
                                </div>
                              )}
                            </div>

                            {/* Attachments Section (from task_attachments table) */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-ikm-text flex items-center gap-1.5">
                                  <Paperclip className="w-3.5 h-3.5 text-emerald-500" />
                                  {language === 'TH' ? 'ไฟล์แนบ (Attachments)' : 'Attachments'} ({cardAttachments.length})
                                </span>
                                
                                <label className="cursor-pointer text-[11px] font-semibold text-ikm-orange hover:text-ikm-orange-dark flex items-center gap-1">
                                  <UploadCloud className="w-3.5 h-3.5" />
                                  <span>{language === 'TH' ? 'อัปโหลด' : 'Upload'}</span>
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => handleCardFileUpload(card.id, e)} 
                                  />
                                </label>
                              </div>

                              {cardAttachments.length === 0 ? (
                                <div className="text-[11px] text-ikm-text-secondary bg-ikm-bg/40 p-2 rounded text-center border border-dashed border-ikm-border">
                                  {language === 'TH' ? 'ยังไม่มีไฟล์แนบ' : 'No attachments attached yet'}
                                </div>
                              ) : (
                                <div className="space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
                                  {cardAttachments.map((att: any) => (
                                    <div key={att.id} className="flex items-center justify-between p-1.5 bg-ikm-bg rounded border border-ikm-border text-xs group/att">
                                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                        <FileText className="w-3.5 h-3.5 text-ikm-orange shrink-0" />
                                        <span className="truncate text-[11px] font-medium text-ikm-text" title={att.fileName}>
                                          {att.fileName}
                                        </span>
                                        <span className="text-[10px] text-ikm-text-secondary shrink-0">({att.fileSize})</span>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button 
                                          onClick={() => alert(`Simulating download for ${att.fileName}`)}
                                          className="p-1 text-ikm-text-secondary hover:text-ikm-orange rounded"
                                          title="Download"
                                        >
                                          <Download className="w-3 h-3" />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteCardAttachment(card.id, att.id)}
                                          className="p-1 text-ikm-text-secondary hover:text-status-red rounded"
                                          title="Delete attachment"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Local Discussion Thread Area (from task_comments table) */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-ikm-text flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                                {language === 'TH' ? 'กระดานสนทนาภายในงาน (Discussion)' : 'Discussion Thread'} ({cardComments.length})
                              </span>

                              {/* Comments stream */}
                              <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar bg-ikm-bg/40 p-2 rounded-lg border border-ikm-border">
                                {cardComments.length === 0 ? (
                                  <div className="text-[11px] text-ikm-text-secondary text-center py-2">
                                    {language === 'TH' ? 'ยังไม่มีความคิดเห็น เริ่มการสนทนาได้ด้านล่าง' : 'No comments yet. Start the thread below.'}
                                  </div>
                                ) : (
                                  cardComments.map((cmt: any) => {
                                    const author = employees.find(e => e.id === cmt.userId) || (cmt.userId === user?.id ? user : null);
                                    return (
                                      <div key={cmt.id} className="bg-ikm-card p-2 rounded-md border border-ikm-border text-xs space-y-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <Avatar 
                                              fallback={author?.name?.charAt(0) || 'U'} 
                                              src={`https://i.pravatar.cc/150?u=${cmt.userId}`} 
                                              className="w-4 h-4" 
                                            />
                                            <span className="font-bold text-[11px] text-ikm-text">{author?.name || cmt.userId}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-ikm-text-secondary">
                                              {cmt.createdAt ? format(new Date(cmt.createdAt), 'hh:mm a') : ''}
                                            </span>
                                            {cmt.userId === user?.id && (
                                              <button 
                                                onClick={() => handleDeleteCardComment(card.id, cmt.id)}
                                                className="text-ikm-text-secondary hover:text-status-red p-0.5"
                                                title="Delete comment"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <p className="text-[11px] text-ikm-text pl-5">{cmt.content}</p>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {/* Quick Comment Input */}
                              <div className="flex items-center gap-1.5 pt-1">
                                <input 
                                  type="text"
                                  placeholder={language === 'TH' ? 'พิมพ์ความคิดเห็นหรืออัปเดต...' : 'Write a comment or update...'}
                                  value={cardCommentInputs[card.id] || ''}
                                  onChange={(e) => setCardCommentInputs({ ...cardCommentInputs, [card.id]: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSendCardComment(card.id);
                                    }
                                  }}
                                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
                                />
                                <button 
                                  onClick={() => handleSendCardComment(card.id)}
                                  disabled={!cardCommentInputs[card.id]?.trim()}
                                  className="p-1.5 bg-ikm-orange hover:bg-ikm-orange-dark disabled:opacity-50 text-white rounded-lg transition-colors shrink-0"
                                  title="Send"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-ikm-border">
                              <button 
                                onClick={() => openTaskModal(card)}
                                className="text-xs font-semibold text-ikm-orange hover:underline flex items-center gap-1"
                              >
                                <Maximize2 className="w-3 h-3" />
                                <span>{language === 'TH' ? 'เปิดดูแบบเต็ม (Modal)' : 'Full Details'}</span>
                              </button>

                              <button 
                                onClick={() => {
                                  openTaskModal(card);
                                  handleStartEdit(card);
                                }}
                                className="text-xs font-medium text-ikm-text-secondary hover:text-ikm-text flex items-center gap-1 bg-ikm-bg px-2 py-1 rounded border border-ikm-border"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>{language === 'TH' ? 'แก้ไขงาน' : 'Edit Task'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Empty state per column */}
                  {colTasks.length === 0 && (
                    <div className="border border-dashed border-ikm-border/80 rounded-xl p-6 text-center text-xs text-ikm-text-secondary bg-ikm-card/30">
                      {language === 'TH' ? 'ไม่มีงานในขั้นตอนนี้' : 'No tasks in this column'}
                    </div>
                  )}

                  {/* Add Card Quick Button */}
                  <button 
                    onClick={() => handleOpenCreateModal(col.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-ikm-border text-ikm-text-secondary hover:text-ikm-orange hover:border-ikm-orange hover:bg-ikm-card transition-all text-xs font-medium"
                  >
                    <Plus className="w-4 h-4" /> 
                    <span>{language === 'TH' ? `เพิ่มงานใหม่` : 'Add Task'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- CREATE NEW TASK MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-ikm-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-ikm-border animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-ikm-border flex justify-between items-center bg-ikm-bg/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-ikm-orange-light text-ikm-orange-dark">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ikm-text">
                    {language === 'TH' ? 'เพิ่มงานใหม่ (New Task)' : 'Create New Task'}
                  </h3>
                  <p className="text-xs text-ikm-text-secondary">
                    {language === 'TH' ? 'บันทึกข้อมูลลงฐานข้อมูล Cloud SQL' : 'Saves directly to Database'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-1.5 text-ikm-text-secondary hover:text-ikm-text rounded-lg hover:bg-ikm-bg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveNewTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-ikm-text mb-1">
                  {language === 'TH' ? 'ชื่องาน (Task Title) *' : 'Task Title *'}
                </label>
                <input 
                  type="text"
                  required
                  placeholder={language === 'TH' ? 'เช่น ตรวจสอบระบบปั๊มน้ำ, ซ่อมบำรุงท่อส่ง' : 'e.g., Pump Calibration, Electrical Inspection'}
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ikm-text mb-1">
                    {language === 'TH' ? 'ขั้นตอน (Process Column)' : 'Process Column'}
                  </label>
                  <select 
                    value={taskFormData.column}
                    onChange={(e) => setTaskFormData({ ...taskFormData, column: e.target.value })}
                    className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
                  >
                    {columns.map(c => (
                      <option key={c.id} value={c.id}>
                        {language === 'TH' ? c.titleTh : c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ikm-text mb-1">
                    {language === 'TH' ? 'ความสำคัญ (Priority)' : 'Priority'}
                  </label>
                  <select 
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ikm-text mb-1">
                    {language === 'TH' ? 'โครงการ (Project)' : 'Project'}
                  </label>
                  <input 
                    type="text"
                    value={taskFormData.projectId}
                    onChange={(e) => setTaskFormData({ ...taskFormData, projectId: e.target.value })}
                    className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
                    placeholder="P-2026-018"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ikm-text mb-1">
                    {language === 'TH' ? 'ผู้รับผิดชอบ (Assignee)' : 'Assignee'}
                  </label>
                  <select 
                    value={taskFormData.assigneeId}
                    onChange={(e) => setTaskFormData({ ...taskFormData, assigneeId: e.target.value })}
                    className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
                  >
                    <option value="">{language === 'TH' ? '-- ไม่ระบุผู้รับผิดชอบ --' : '-- Unassigned --'}</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ikm-text mb-1">
                  {language === 'TH' ? 'กำหนดส่ง (Due Date)' : 'Due Date'}
                </label>
                <input 
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ikm-text mb-1">
                  {language === 'TH' ? 'รายละเอียดงาน (Description)' : 'Description'}
                </label>
                <textarea 
                  rows={3}
                  placeholder={language === 'TH' ? 'ระบุรายละเอียด ขอบเขตงาน หรือข้อควรระวัง...' : 'Provide details or scope for this task...'}
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-ikm-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs md:text-sm font-semibold text-ikm-text-secondary hover:text-ikm-text hover:bg-ikm-bg rounded-lg transition-colors"
                >
                  {language === 'TH' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs md:text-sm font-semibold bg-ikm-orange hover:bg-ikm-orange-dark text-white rounded-lg shadow-sm transition-all"
                >
                  {language === 'TH' ? 'สร้างงาน' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TASK DETAILS & EDIT MODAL --- */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-ikm-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-ikm-border animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-ikm-border flex justify-between items-center bg-ikm-bg/50 shrink-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                  priorityConfig[selectedTask.priority]?.badgeClass || priorityConfig['Medium'].badgeClass
                )}>
                  {selectedTask.priority}
                </span>
                <span className="font-semibold text-xs text-ikm-text-secondary bg-ikm-card px-2 py-0.5 rounded border border-ikm-border">
                  {selectedTask.projectId || 'General'}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {!isEditing && (
                  <button 
                    onClick={() => handleStartEdit(selectedTask)}
                    className="p-1.5 text-ikm-text-secondary hover:text-ikm-orange rounded-lg hover:bg-ikm-bg flex items-center gap-1 text-xs font-semibold"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{language === 'TH' ? 'แก้ไข' : 'Edit'}</span>
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="p-1.5 text-ikm-text-secondary hover:text-status-red rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1 text-xs font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{language === 'TH' ? 'ลบ' : 'Delete'}</span>
                </button>
                <button 
                  onClick={() => setSelectedTask(null)} 
                  className="p-1.5 text-ikm-text-secondary hover:text-ikm-text rounded-lg hover:bg-ikm-bg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-ikm-text mb-1">
                      {language === 'TH' ? 'ชื่องาน' : 'Task Title'}
                    </label>
                    <input 
                      type="text"
                      value={taskFormData.title}
                      onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ikm-text mb-1">
                        {language === 'TH' ? 'ขั้นตอน' : 'Column'}
                      </label>
                      <select 
                        value={taskFormData.column}
                        onChange={(e) => setTaskFormData({ ...taskFormData, column: e.target.value })}
                        className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
                      >
                        {columns.map(c => (
                          <option key={c.id} value={c.id}>{language === 'TH' ? c.titleTh : c.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ikm-text mb-1">
                        {language === 'TH' ? 'ความสำคัญ' : 'Priority'}
                      </label>
                      <select 
                        value={taskFormData.priority}
                        onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                        className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ikm-text mb-1">
                        {language === 'TH' ? 'ผู้รับผิดชอบ' : 'Assignee'}
                      </label>
                      <select 
                        value={taskFormData.assigneeId}
                        onChange={(e) => setTaskFormData({ ...taskFormData, assigneeId: e.target.value })}
                        className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
                      >
                        <option value="">{language === 'TH' ? '-- ไม่ระบุ --' : '-- Unassigned --'}</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ikm-text mb-1">
                        {language === 'TH' ? 'กำหนดส่ง' : 'Due Date'}
                      </label>
                      <input 
                        type="date"
                        value={taskFormData.dueDate}
                        onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ikm-text mb-1">
                      {language === 'TH' ? 'รายละเอียดงาน' : 'Description'}
                    </label>
                    <textarea 
                      rows={4}
                      value={taskFormData.description}
                      onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-xs md:text-sm font-semibold text-ikm-text-secondary hover:bg-ikm-bg rounded-lg"
                    >
                      {language === 'TH' ? 'ยกเลิก' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleSaveEditTask}
                      className="px-5 py-2 text-xs md:text-sm font-semibold bg-ikm-orange text-white rounded-lg hover:bg-ikm-orange-dark shadow-sm"
                    >
                      {language === 'TH' ? 'บันทึกการแก้ไข' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                /* View Details Mode */
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-ikm-text mb-2">
                      {selectedTask.title}
                    </h2>
                    <p className="text-sm text-ikm-text-secondary whitespace-pre-wrap bg-ikm-bg/40 p-3 rounded-xl border border-ikm-border">
                      {selectedTask.description || (language === 'TH' ? 'ไม่มีรายละเอียด' : 'No description provided.')}
                    </p>
                  </div>

                  {/* Stage Progress Bar in Modal */}
                  <div className="bg-ikm-bg p-3.5 rounded-xl border border-ikm-border space-y-2">
                    <span className="text-xs font-bold text-ikm-text block">
                      {language === 'TH' ? 'สถานะขั้นตอนการทำงาน (Workflow Stage)' : 'Workflow Stage'}
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {columns.map((c) => {
                        const isCurrent = selectedTask.column === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => handleMoveColumn(selectedTask.id, c.id)}
                            className={cn(
                              "py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center",
                              isCurrent
                                ? "bg-ikm-orange text-white border-ikm-orange shadow-xs"
                                : "bg-ikm-card text-ikm-text-secondary border-ikm-border hover:text-ikm-text hover:border-ikm-orange/50"
                            )}
                          >
                            {language === 'TH' ? c.titleTh : c.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tabs: Comments & Attachments */}
                  <div className="border-t border-ikm-border pt-4">
                    <div className="flex gap-4 border-b border-ikm-border pb-2 text-sm font-bold">
                      <button 
                        onClick={() => setActiveTab('details')}
                        className={cn("pb-2 border-b-2 transition-all", activeTab === 'details' ? "border-ikm-orange text-ikm-orange" : "border-transparent text-ikm-text-secondary hover:text-ikm-text")}
                      >
                        {language === 'TH' ? 'ข้อมูลสรุป' : 'Overview'}
                      </button>
                      <button 
                        onClick={() => setActiveTab('comments')}
                        className={cn("pb-2 border-b-2 transition-all flex items-center gap-1.5", activeTab === 'comments' ? "border-ikm-orange text-ikm-orange" : "border-transparent text-ikm-text-secondary hover:text-ikm-text")}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{language === 'TH' ? 'ความคิดเห็น' : 'Comments'} ({taskCommentsCache[selectedTask.id]?.length || 0})</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('attachments')}
                        className={cn("pb-2 border-b-2 transition-all flex items-center gap-1.5", activeTab === 'attachments' ? "border-ikm-orange text-ikm-orange" : "border-transparent text-ikm-text-secondary hover:text-ikm-text")}
                      >
                        <Paperclip className="w-4 h-4" />
                        <span>{language === 'TH' ? 'ไฟล์แนบ' : 'Attachments'} ({taskAttachmentsCache[selectedTask.id]?.length || 0})</span>
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="pt-4">
                      {activeTab === 'details' && (
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="bg-ikm-bg p-3 rounded-lg border border-ikm-border">
                            <span className="text-ikm-text-secondary block mb-1 font-semibold">{language === 'TH' ? 'ผู้รับผิดชอบ' : 'Assignee'}</span>
                            <span className="font-bold text-ikm-text">
                              {employees.find(e => e.id === selectedTask.assigneeId)?.name || (language === 'TH' ? 'ไม่ระบุ' : 'Unassigned')}
                            </span>
                          </div>
                          <div className="bg-ikm-bg p-3 rounded-lg border border-ikm-border">
                            <span className="text-ikm-text-secondary block mb-1 font-semibold">{language === 'TH' ? 'กำหนดส่ง' : 'Due Date'}</span>
                            <span className="font-bold text-ikm-text">
                              {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'd MMMM yyyy') : (language === 'TH' ? 'ไม่มีกำหนด' : 'No due date')}
                            </span>
                          </div>
                        </div>
                      )}

                      {activeTab === 'comments' && (
                        <div className="space-y-3">
                          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                            {(taskCommentsCache[selectedTask.id] || []).map((cmt: any) => {
                              const author = employees.find(e => e.id === cmt.userId) || (cmt.userId === user?.id ? user : null);
                              return (
                                <div key={cmt.id} className="bg-ikm-bg p-3 rounded-xl border border-ikm-border space-y-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Avatar fallback={author?.name?.charAt(0) || 'U'} src={`https://i.pravatar.cc/150?u=${cmt.userId}`} className="w-5 h-5" />
                                      <span className="font-bold text-xs text-ikm-text">{author?.name || cmt.userId}</span>
                                    </div>
                                    <span className="text-[10px] text-ikm-text-secondary">
                                      {cmt.createdAt ? format(new Date(cmt.createdAt), 'hh:mm a') : ''}
                                    </span>
                                  </div>
                                  <p className="text-xs text-ikm-text pl-7">{cmt.content}</p>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <input 
                              type="text"
                              placeholder={language === 'TH' ? 'เขียนความคิดเห็น...' : 'Add a comment...'}
                              value={cardCommentInputs[selectedTask.id] || ''}
                              onChange={(e) => setCardCommentInputs({ ...cardCommentInputs, [selectedTask.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSendCardComment(selectedTask.id);
                                }
                              }}
                              className="flex-1 px-3.5 py-2 text-xs md:text-sm rounded-lg border border-ikm-border bg-ikm-bg text-ikm-text focus:outline-none focus:border-ikm-orange"
                            />
                            <button 
                              onClick={() => handleSendCardComment(selectedTask.id)}
                              disabled={!cardCommentInputs[selectedTask.id]?.trim()}
                              className="px-4 py-2 bg-ikm-orange hover:bg-ikm-orange-dark disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{language === 'TH' ? 'ส่ง' : 'Send'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {activeTab === 'attachments' && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-ikm-text-secondary">{language === 'TH' ? 'ไฟล์ที่เกี่ยวข้องกับงานนี้' : 'Files attached to this task'}</span>
                            <label className="cursor-pointer px-3 py-1.5 bg-ikm-orange hover:bg-ikm-orange-dark text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                              <UploadCloud className="w-4 h-4" />
                              <span>{language === 'TH' ? 'อัปโหลดไฟล์' : 'Upload File'}</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => handleCardFileUpload(selectedTask.id, e)} 
                              />
                            </label>
                          </div>

                          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                            {(taskAttachmentsCache[selectedTask.id] || []).map((att: any) => (
                              <div key={att.id} className="flex items-center justify-between p-2.5 bg-ikm-bg rounded-xl border border-ikm-border text-xs">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-ikm-orange" />
                                  <div>
                                    <div className="font-semibold text-ikm-text">{att.fileName}</div>
                                    <div className="text-[10px] text-ikm-text-secondary">{att.fileSize}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => alert(`Downloading ${att.fileName}`)}
                                    className="p-1.5 text-ikm-text-secondary hover:text-ikm-orange rounded hover:bg-ikm-card"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteCardAttachment(selectedTask.id, att.id)}
                                    className="p-1.5 text-ikm-text-secondary hover:text-status-red rounded hover:bg-rose-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
