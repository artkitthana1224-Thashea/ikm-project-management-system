import React, { useState, useMemo } from "react";
import { 
  BarChart3, CheckCircle2, Clock, Award, TrendingUp, 
  Search, Filter, Plus, CheckSquare, AlertCircle, AlertTriangle,
  Briefcase, MapPin, Calendar, ChevronRight, X, Edit3, Trash2,
  Sliders, ArrowUpRight, Check
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { useStore } from "../store/useStore";
import { MetricTile } from "../components/ui/MetricTile";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatusBadge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Task, TaskStatus } from "../types";

export function MyDashboard() {
  const { tasks, updateTask, addTask, deleteTask, user, language } = useStore();

  // Somchai's dedicated handled tasks (combining store tasks + specific operations tasks)
  const [myTasks, setMyTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('ikm_somchai_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { 
        id: 'TSK-1001', 
        title: 'Site Safety Walk & HSE Audit Inspection', 
        project: 'P-2026-018', 
        location: 'Zone B - Compressor Unit', 
        dueDate: 'Today', 
        priority: 'High', 
        progress: 75, 
        status: 'In Progress' 
      },
      { 
        id: 'TSK-1002', 
        title: 'Turbine Vibration Diagnostics & Sensor Calibration', 
        project: 'P-2026-019', 
        location: 'Powerhouse Building 2', 
        dueDate: 'Tomorrow', 
        priority: 'Critical', 
        progress: 40, 
        status: 'In Progress' 
      },
      { 
        id: 'TSK-1003', 
        title: 'Substation SCADA Loop Test Verification', 
        project: 'P-2026-010', 
        location: 'Main Control Room', 
        dueDate: '12 Sep 2026', 
        priority: 'High', 
        progress: 90, 
        status: 'Review' 
      },
      { 
        id: 'TSK-1004', 
        title: 'High-Pressure Piping Hydrotest Authorization', 
        project: 'P-2026-018', 
        location: 'Offshore Module 4B', 
        dueDate: '15 Sep 2026', 
        priority: 'Critical', 
        progress: 25, 
        status: 'Assigned' 
      },
      { 
        id: 'TSK-1005', 
        title: 'ISO 9001 Field QA Audit Dossier Compilation', 
        project: 'P-2026-004', 
        location: 'QA Office Room 3', 
        dueDate: '18 Sep 2026', 
        priority: 'Medium', 
        progress: 100, 
        status: 'Completed' 
      },
      { 
        id: 'TSK-1006', 
        title: 'Emergency Fire Siren System Quarterly Overhaul', 
        project: 'P-2026-018', 
        location: 'Assembly Area A', 
        dueDate: '20 Sep 2026', 
        priority: 'Medium', 
        progress: 100, 
        status: 'Completed' 
      }
    ];
  });

  const saveMyTasks = (updated: Task[]) => {
    setMyTasks(updated);
    localStorage.setItem('ikm_somchai_tasks', JSON.stringify(updated));
  };

  // Filter & Search
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'review' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // New Task form state
  const [newTitle, setNewTitle] = useState('');
  const [newProject, setNewProject] = useState('P-2026-018');
  const [newLocation, setNewLocation] = useState('Site A - Workshop');
  const [newDueDate, setNewDueDate] = useState('Today');
  const [newPriority, setNewPriority] = useState<Task['priority']>('High');
  const [newStatus, setNewStatus] = useState<TaskStatus>('In Progress');

  // Stats calculation
  const activeCount = myTasks.filter(t => t.status !== 'Completed' && t.status !== 'Closed').length;
  const completedCount = myTasks.filter(t => t.status === 'Completed' || t.status === 'Closed').length;
  const onTime = 94;
  const score = 89;

  const t = {
    EN: {
      myDashboard: "My Dashboard",
      managerRole: "Site Manager • Operations & Execution",
      activeTasks: "Active Tasks",
      completedMo: "Completed (mo)",
      onTime: "On-time Rate",
      score: "Performance Score",
      weeklyOutput: "Weekly Task Completion",
      categoryScore: "Score by Category",
      myTasksTitle: "Tasks Handled by Me",
      myTasksSubtitle: "Manage, track progress, and update tasks assigned to Somchai S.",
      allTasks: "All Tasks",
      inProgress: "In Progress",
      inReview: "In Review",
      completed: "Completed",
      searchPlaceholder: "Search tasks, project code, or location...",
      addTask: "Add Task",
      taskAndId: "Task & ID",
      projectLocation: "Project & Location",
      dueDate: "Due Date",
      progress: "Progress",
      status: "Status",
      action: "Action",
      noTasksFound: "No tasks found matching your filter.",
      createFirstTask: "Create New Task",
      taskDetails: "Task Details & Progress",
      updateProgress: "Update Progress (%):",
      markCompleted: "Mark as Completed",
      saveChanges: "Save Changes",
      close: "Close",
      deleteTask: "Delete",
      titleLabel: "Task Title",
      projectLabel: "Project",
      locationLabel: "Location",
      dueDateLabel: "Due Date",
      priorityLabel: "Priority",
      statusLabel: "Initial Status"
    },
    TH: {
      myDashboard: "แดชบอร์ดของฉัน",
      managerRole: "ผู้จัดการหน้างาน (Site Manager) • ฝ่ายปฏิบัติการและซ่อมบำรุง",
      activeTasks: "งานที่กำลังทำ",
      completedMo: "เสร็จสิ้นเดือนนี้",
      onTime: "อัตราตรงเวลา",
      score: "คะแนนผลงาน",
      weeklyOutput: "ผลผลิตงานรายสัปดาห์",
      categoryScore: "คะแนนตามหมวดหมู่",
      myTasksTitle: "รายการงานที่ฉันดำเนินการ",
      myTasksSubtitle: "ติดตามความคืบหน้า จัดการ และปรับปรุงสถานะงานของ Somchai S.",
      allTasks: "งานทั้งหมด",
      inProgress: "กำลังดำเนินการ",
      inReview: "รอตรวจสอบ",
      completed: "เสร็จสมบูรณ์",
      searchPlaceholder: "ค้นหาชื่องาน, รหัสโครงการ, หรือสถานที่...",
      addTask: "เพิ่มงานใหม่",
      taskAndId: "ชื่องานและรหัส",
      projectLocation: "โครงการและสถานที่",
      dueDate: "กำหนดส่ง",
      progress: "ความคืบหน้า",
      status: "สถานะ",
      action: "จัดการ",
      noTasksFound: "ไม่พบรายการงานที่ตรงกับเงื่อนไข",
      createFirstTask: "สร้างงานใหม่",
      taskDetails: "รายละเอียดงานและปรับปรุงความคืบหน้า",
      updateProgress: "ปรับระดับความคืบหน้า (%):",
      markCompleted: "บันทึกว่าเสร็จสมบูรณ์",
      saveChanges: "บันทึกการเปลี่ยนแปลง",
      close: "ปิด",
      deleteTask: "ลบงาน",
      titleLabel: "ชื่องาน / รายละเอียด",
      projectLabel: "รหัสโครงการ",
      locationLabel: "สถานที่ / โซน",
      dueDateLabel: "กำหนดส่ง",
      priorityLabel: "ความสำคัญ",
      statusLabel: "สถานะเริ่มต้น"
    }
  }[language];

  const weekData = [
    { day: "M", done: 4, target: 5 },
    { day: "T", done: 6, target: 5 },
    { day: "W", done: 3, target: 5 },
    { day: "T", done: 7, target: 5 },
    { day: "F", done: 5, target: 5 },
    { day: "S", done: 2, target: 3 },
    { day: "S", done: 1, target: 0 },
  ];

  const scoreCategories = [
    { key: 'quality', label: 'Quality', labelTh: 'คุณภาพงาน', max: 25 },
    { key: 'speed', label: 'Speed', labelTh: 'ความรวดเร็ว', max: 25 },
    { key: 'safety', label: 'Safety', labelTh: 'ความปลอดภัย HSE', max: 25 },
    { key: 'teamwork', label: 'Teamwork', labelTh: 'การทำงานร่วมกัน', max: 25 },
  ];

  const scoreData = scoreCategories.map((c) => ({ 
    name: c.key, 
    value: Math.round(c.max * 0.88), 
    fill: "var(--color-ikm-orange)" 
  }));

  // Filtered Task List
  const filteredTasks = useMemo(() => {
    return myTasks.filter(task => {
      // Tab filter
      let matchesTab = true;
      if (activeTab === 'in_progress') {
        matchesTab = task.status === 'In Progress' || task.status === 'Active' || task.status === 'Assigned';
      } else if (activeTab === 'review') {
        matchesTab = task.status === 'Review' || task.status === 'Pending';
      } else if (activeTab === 'completed') {
        matchesTab = task.status === 'Completed' || task.status === 'Closed' || task.status === 'Accepted';
      }

      // Search filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        task.title.toLowerCase().includes(query) ||
        task.id.toLowerCase().includes(query) ||
        task.project.toLowerCase().includes(query) ||
        task.location.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [myTasks, activeTab, searchQuery]);

  // Update Task Progress / Status
  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    const updated = myTasks.map(t => t.id === id ? { ...t, ...updates } : t);
    saveMyTasks(updated);
    updateTask(id, updates);
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    const updated = myTasks.filter(t => t.id !== id);
    saveMyTasks(updated);
    deleteTask(id);
    setSelectedTask(null);
  };

  // Add Task
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle,
      project: newProject,
      location: newLocation,
      dueDate: newDueDate,
      priority: newPriority,
      progress: newStatus === 'Completed' ? 100 : 0,
      status: newStatus
    };

    const updated = [newTask, ...myTasks];
    saveMyTasks(updated);
    addTask(newTask);
    setIsNewTaskModalOpen(false);
    setNewTitle('');
  };

  const getPriorityBadgeClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900';
      case 'High':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  const getDueDateBadge = (dueDate: string) => {
    if (dueDate.toLowerCase().includes('today') || dueDate === 'วันนี้') {
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold';
    }
    if (dueDate.toLowerCase().includes('tomorrow') || dueDate === 'พรุ่งนี้') {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold';
    }
    return 'bg-ikm-bg text-ikm-text-secondary border border-ikm-border';
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ikm-orange to-ikm-orange-dark text-white flex items-center justify-center shadow-md shadow-ikm-orange/20 overflow-hidden shrink-0">
            <img 
              src={user?.avatar || "https://i.pravatar.cc/150?u=somchai"} 
              alt={user?.name || "Somchai S."}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-ikm-text">{t.myDashboard}</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-ikm-orange-light text-ikm-orange-dark border border-ikm-orange/30">
                {user?.name || "Somchai S."}
              </span>
            </div>
            <p className="text-xs md:text-sm text-ikm-text-secondary mt-0.5">{t.managerRole}</p>
          </div>
        </div>

        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ikm-orange hover:bg-ikm-orange-dark text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-xs self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addTask}</span>
        </button>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricTile icon={Clock} title={t.activeTasks} value={activeCount} accentColor="ikm-orange" />
        <MetricTile icon={CheckCircle2} title={t.completedMo} value={completedCount} accentColor="ikm-green" trend={14} />
        <MetricTile icon={TrendingUp} title={t.onTime} value={`${onTime}%`} accentColor="status-blue" />
        <MetricTile icon={Award} title={t.score} value={score} accentColor="status-purple" />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-ikm-card p-4 md:p-5 rounded-2xl border border-ikm-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-ikm-text flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-ikm-orange" />
              <span>{t.weeklyOutput}</span>
            </h3>
            <span className="text-xs text-ikm-text-secondary font-medium">Goal: 5 / day</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={weekData}>
              <XAxis dataKey="day" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }} />
              <Bar dataKey="done" fill="#F58220" radius={[4, 4, 0, 0]} name="Completed" />
              <Bar dataKey="target" fill="rgba(150, 150, 150, 0.2)" radius={[4, 4, 0, 0]} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-ikm-card p-4 md:p-5 rounded-2xl border border-ikm-border shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold mb-2 text-ikm-text flex items-center gap-2">
              <Award className="w-4 h-4 text-status-purple" />
              <span>{t.categoryScore}</span>
            </h3>
            <ResponsiveContainer width="100%" height={170}>
              <RadialBarChart innerRadius="35%" outerRadius="100%" data={scoreData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 25]} tick={false} />
                <RadialBar background={{ fill: 'rgba(150, 150, 150, 0.15)' }} dataKey="value" cornerRadius={6} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-ikm-border">
            {scoreCategories.map((c) => (
              <div key={c.key} className="text-center">
                <div className="text-xs font-bold text-ikm-text">{scoreData.find((s) => s.name === c.key)?.value || 0}/{c.max}</div>
                <div className="text-[10px] text-ikm-text-secondary truncate">{language === 'TH' ? c.labelTh : c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* --- TASKS HANDLED BY ME (รายการงานที่ฉันดำเนินการ ด้านล่างแบบตาราง) --- */}
      {/* ========================================================================= */}
      <Card className="p-4 md:p-6 border-ikm-border bg-ikm-card shadow-xs space-y-4">
        {/* Table Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-ikm-border">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-ikm-orange" />
              <h2 className="text-lg md:text-xl font-bold text-ikm-text">{t.myTasksTitle}</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-ikm-orange text-white">
                {myTasks.length}
              </span>
            </div>
            <p className="text-xs text-ikm-text-secondary mt-0.5">{t.myTasksSubtitle}</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ikm-text-secondary" />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-ikm-bg border border-ikm-border text-xs focus:outline-none focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange text-ikm-text"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ikm-text-secondary hover:text-ikm-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: 'all', label: t.allTasks, count: myTasks.length },
            { id: 'in_progress', label: t.inProgress, count: myTasks.filter(t => t.status === 'In Progress' || t.status === 'Active' || t.status === 'Assigned').length },
            { id: 'review', label: t.inReview, count: myTasks.filter(t => t.status === 'Review' || t.status === 'Pending').length },
            { id: 'completed', label: t.completed, count: myTasks.filter(t => t.status === 'Completed' || t.status === 'Closed' || t.status === 'Accepted').length },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                  isActive 
                    ? 'bg-ikm-orange text-white border-ikm-orange shadow-2xs' 
                    : 'bg-ikm-bg text-ikm-text-secondary hover:text-ikm-text border-ikm-border'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-ikm-card text-ikm-text-secondary'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop Data Table */}
        <div className="hidden md:block overflow-x-auto border border-ikm-border rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ikm-bg/80 border-b border-ikm-border text-[11px] font-bold text-ikm-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">{t.taskAndId}</th>
                <th className="py-3 px-4">{t.projectLocation}</th>
                <th className="py-3 px-3">{t.priorityLabel}</th>
                <th className="py-3 px-3">{t.dueDate}</th>
                <th className="py-3 px-4 min-w-[140px]">{t.progress}</th>
                <th className="py-3 px-4">{t.status}</th>
                <th className="py-3 px-4 text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ikm-border text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ikm-text-secondary">
                    <CheckSquare className="w-8 h-8 mx-auto opacity-30 mb-2" />
                    <p className="font-semibold">{t.noTasksFound}</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr 
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="hover:bg-ikm-orange-light/10 transition-colors cursor-pointer group"
                  >
                    {/* Task Title & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-ikm-orange shrink-0" />
                        <div>
                          <div className="font-bold text-ikm-text group-hover:text-ikm-orange transition-colors flex items-center gap-1.5">
                            <span>{task.title}</span>
                          </div>
                          <span className="text-[10px] text-ikm-text-secondary font-mono">{task.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Project & Location */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold text-ikm-text text-[11px]">
                          <Briefcase className="w-3 h-3 text-ikm-orange shrink-0" />
                          <span>{task.project}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-ikm-text-secondary truncate max-w-[160px]">
                          <MapPin className="w-3 h-3 text-ikm-text-secondary shrink-0" />
                          <span>{task.location}</span>
                        </div>
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-md ${getDueDateBadge(task.dueDate)}`}>
                        {task.dueDate}
                      </span>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-ikm-text">{task.progress}%</span>
                          {task.progress === 100 && <CheckCircle2 className="w-3.5 h-3.5 text-ikm-green" />}
                        </div>
                        <ProgressBar value={task.progress} color={task.progress === 100 ? "bg-ikm-green" : "bg-ikm-orange"} className="h-2" />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={task.status} />
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-ikm-orange hover:bg-ikm-orange-light/30 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <span>{language === 'TH' ? 'ดู/ปรับปรุง' : 'Manage'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards Layout */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-ikm-text-secondary bg-ikm-bg rounded-xl">
              <CheckSquare className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p className="text-xs font-semibold">{t.noTasksFound}</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="p-3.5 rounded-xl border border-ikm-border bg-ikm-bg/50 hover:border-ikm-orange/40 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-ikm-text-secondary">{task.id}</span>
                    <h4 className="text-xs font-bold text-ikm-text line-clamp-2">{task.title}</h4>
                  </div>
                  <StatusBadge status={task.status} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-ikm-text-secondary pt-1 border-t border-ikm-border/60">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-ikm-orange" />
                    <span className="font-semibold">{task.project}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md ${getDueDateBadge(task.dueDate)}`}>
                    {task.dueDate}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-ikm-text">
                    <span>{t.progress}</span>
                    <span>{task.progress}%</span>
                  </div>
                  <ProgressBar value={task.progress} color={task.progress === 100 ? "bg-ikm-green" : "bg-ikm-orange"} className="h-1.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* --- TASK DETAIL & PROGRESS MODAL --- */}
      {/* ========================================================================= */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-ikm-card rounded-2xl shadow-2xl w-full max-w-lg border border-ikm-border overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-ikm-border bg-ikm-bg/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ikm-orange-light text-ikm-orange-dark flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-ikm-text">{t.taskDetails}</h3>
                  <span className="text-xs font-mono text-ikm-text-secondary">{selectedTask.id} • {selectedTask.project}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg text-ikm-text-secondary hover:text-ikm-text hover:bg-ikm-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-ikm-text-secondary uppercase block mb-1">{t.titleLabel}</label>
                <p className="text-sm font-bold text-ikm-text bg-ikm-bg p-3 rounded-xl border border-ikm-border">
                  {selectedTask.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-ikm-bg p-3 rounded-xl border border-ikm-border">
                <div>
                  <span className="text-ikm-text-secondary block font-bold text-[10px]">{t.locationLabel}</span>
                  <span className="font-semibold text-ikm-text">{selectedTask.location}</span>
                </div>
                <div>
                  <span className="text-ikm-text-secondary block font-bold text-[10px]">{t.dueDateLabel}</span>
                  <span className="font-semibold text-ikm-text">{selectedTask.dueDate}</span>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2 bg-ikm-bg p-3.5 rounded-xl border border-ikm-border">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-ikm-text">{t.updateProgress}</label>
                  <span className="text-sm font-bold text-ikm-orange">{selectedTask.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selectedTask.progress}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleUpdateTask(selectedTask.id, { 
                      progress: val,
                      status: val === 100 ? 'Completed' : (selectedTask.status === 'Completed' ? 'In Progress' : selectedTask.status)
                    });
                  }}
                  className="w-full accent-ikm-orange cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-ikm-text-secondary">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100% (Done)</span>
                </div>
              </div>

              {/* Status & Priority Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ikm-text block mb-1">{t.status}</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => {
                      const newSt = e.target.value as TaskStatus;
                      handleUpdateTask(selectedTask.id, { 
                        status: newSt, 
                        progress: newSt === 'Completed' ? 100 : selectedTask.progress 
                      });
                    }}
                    className="w-full h-9 px-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-xs font-bold text-ikm-text focus:outline-none focus:border-ikm-orange"
                  >
                    <option value="In Progress">In Progress (กำลังทำ)</option>
                    <option value="Assigned">Assigned (มอบหมายแล้ว)</option>
                    <option value="Review">Review (รอตรวจ)</option>
                    <option value="Completed">Completed (เสร็จสิ้น)</option>
                    <option value="Pending">Pending (รอดำเนินการ)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ikm-text block mb-1">{t.priorityLabel}</label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => handleUpdateTask(selectedTask.id, { priority: e.target.value as any })}
                    className="w-full h-9 px-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-xs font-bold text-ikm-text focus:outline-none focus:border-ikm-orange"
                  >
                    <option value="Critical">🔴 Critical (วิกฤติ)</option>
                    <option value="High">🟠 High (สูง)</option>
                    <option value="Medium">🔵 Medium (ปานกลาง)</option>
                    <option value="Low">⚪ Low (ต่ำ)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-ikm-border bg-ikm-bg/40 flex items-center justify-between">
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-semibold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.deleteTask}</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedTask.status !== 'Completed' && (
                  <button
                    onClick={() => {
                      handleUpdateTask(selectedTask.id, { progress: 100, status: 'Completed' });
                      setSelectedTask(null);
                    }}
                    className="px-3 py-1.5 bg-ikm-green hover:bg-ikm-green-secondary text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.markCompleted}</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-1.5 rounded-xl bg-ikm-card border border-ikm-border hover:bg-ikm-bg text-xs font-bold text-ikm-text"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- ADD NEW TASK MODAL --- */}
      {/* ========================================================================= */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-ikm-card rounded-2xl shadow-2xl w-full max-w-lg border border-ikm-border overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 md:p-5 border-b border-ikm-border bg-ikm-bg/60 flex items-center justify-between">
              <h3 className="font-bold text-base text-ikm-text flex items-center gap-2">
                <Plus className="w-4 h-4 text-ikm-orange" />
                <span>{t.createFirstTask} (Somchai S.)</span>
              </h3>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="p-1.5 rounded-lg text-ikm-text-secondary hover:text-ikm-text hover:bg-ikm-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-ikm-text block mb-1">{t.titleLabel} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect High-Pressure Relief Valve"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-ikm-bg border border-ikm-border text-xs focus:outline-none focus:border-ikm-orange text-ikm-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ikm-text block mb-1">{t.projectLabel}</label>
                  <input
                    type="text"
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-ikm-bg border border-ikm-border text-xs focus:outline-none focus:border-ikm-orange text-ikm-text"
                  />
                </div>
                <div>
                  <label className="font-bold text-ikm-text block mb-1">{t.locationLabel}</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-ikm-bg border border-ikm-border text-xs focus:outline-none focus:border-ikm-orange text-ikm-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-ikm-text block mb-1">{t.dueDateLabel}</label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-ikm-bg border border-ikm-border text-xs focus:outline-none focus:border-ikm-orange text-ikm-text"
                  />
                </div>
                <div>
                  <label className="font-bold text-ikm-text block mb-1">{t.priorityLabel}</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full h-9 px-2 rounded-xl bg-ikm-bg border border-ikm-border text-xs focus:outline-none focus:border-ikm-orange text-ikm-text"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ikm-text block mb-1">{t.statusLabel}</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full h-9 px-2 rounded-xl bg-ikm-bg border border-ikm-border text-xs focus:outline-none focus:border-ikm-orange text-ikm-text"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-ikm-bg rounded-xl border border-ikm-border text-ikm-text-secondary text-[11px]">
                {language === 'TH' 
                  ? 'งานนี้จะถูกบันทึกและแสดงในตารางงานที่ Somchai S. ดำเนินการโดยอัตโนมัติ' 
                  : 'This task will automatically appear in the task execution list for Somchai S.'}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ikm-border">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-ikm-border text-xs font-bold text-ikm-text hover:bg-ikm-bg"
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-ikm-orange hover:bg-ikm-orange-dark text-white text-xs font-bold transition-all shadow-xs"
                >
                  {t.addTask}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
