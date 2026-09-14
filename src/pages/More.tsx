import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LogoutConfirmModal } from '../components/ui/LogoutConfirmModal';
import { 
  LayoutDashboard, ClipboardList, MessageSquare, CheckSquare, 
  Users, Clock, PieChart, Briefcase, UsersRound, ListTodo, 
  CalendarDays, Layers, KanbanSquare, Network, Calendar, 
  BarChartHorizontal, Activity, CheckCircle, Star, ClipboardCheck, 
  FileText, Image as ImageIcon, Settings2, Bot, Mic, UserCog, ScrollText, ShieldCheck,
  BookOpen, Wrench, LogOut, User as UserIcon
} from 'lucide-react';

const menuGroups = [
  {
    title: 'ส่วนตัว & การปฏิบัติการ (Personal & Ops)',
    items: [
      { id: 'my-dashboard', label: 'แดชบอร์ดของฉัน\n(My Dashboard)', icon: LayoutDashboard, color: 'from-blue-400 to-blue-600' },
      { id: 'requests', label: 'คำของาน\n(Requests)', icon: ClipboardList, color: 'from-ikm-orange to-ikm-orange-dark' },
      { id: 'chat', label: 'แชท\n(Chat)', icon: MessageSquare, color: 'from-green-400 to-green-600' },
      { id: 'tasks', label: 'งานของฉัน\n(My Tasks)', icon: CheckSquare, color: 'from-ikm-green to-ikm-green-secondary' },
    ]
  },
  {
    title: 'บุคลากร & เครื่องมือ (Personnel & Equipment)',
    items: [
      { id: 'manpower', label: 'รายงาน Manpower\n(Job Report)', icon: FileText, color: 'from-ikm-orange to-ikm-orange-dark' },
      { id: 'equipment', label: 'เครื่องมือหลัก\n(Equipment)', icon: Wrench, color: 'from-amber-500 to-orange-600' },
      { id: 'employee-availability', label: 'สถานะพนักงาน\n(Availability)', icon: Users, color: 'from-indigo-400 to-indigo-600' },
      { id: 'manpower-timeline', label: 'ไทม์ไลน์กำลังคน\n(Timeline)', icon: Clock, color: 'from-purple-400 to-purple-600' },
    ]
  },
  {
    title: 'โครงการ (Projects)',
    items: [
      { id: 'proj-dashboard', label: 'แดชบอร์ดโครงการ\n(Proj Dashboard)', icon: PieChart, color: 'from-rose-400 to-rose-600' },
      { id: 'portfolio', label: 'พอร์ตโฟลิโอ\n(Portfolio)', icon: Briefcase, color: 'from-pink-400 to-pink-600' },
      { id: 'team-dashboard', label: 'แดชบอร์ดทีม\n(Team Dashboard)', icon: UsersRound, color: 'from-orange-400 to-orange-600' },
      { id: 'proj-list', label: 'รายการโครงการ\n(Project List)', icon: ListTodo, color: 'from-teal-400 to-teal-600' },
      { id: 'proj-calendar', label: 'ปฏิทินโครงการ\n(Proj Calendar)', icon: CalendarDays, color: 'from-blue-400 to-blue-600' },
      { id: 'task-mgmt', label: 'การจัดการงาน\n(Task Mgmt)', icon: Layers, color: 'from-indigo-400 to-indigo-600' },
      { id: 'proj-board', label: 'บอร์ดโครงการ\n(Project Board)', icon: KanbanSquare, color: 'from-purple-400 to-purple-600' },
      { id: 'sub-project', label: 'โครงการย่อย\n(Sub-Project)', icon: Network, color: 'from-gray-400 to-gray-600' },
    ]
  },
  {
    title: 'การวางแผน (Planning)',
    items: [
      { id: 'kanban', label: 'บอร์ดคัมบัง\n(Kanban)', icon: KanbanSquare, color: 'from-cyan-400 to-cyan-600' },
      { id: 'calendar', label: 'ปฏิทิน\n(Calendar)', icon: Calendar, color: 'from-blue-400 to-blue-600' },
      { id: 'gantt', label: 'แผนภูมิแกนต์\n(Gantt)', icon: BarChartHorizontal, color: 'from-ikm-green to-ikm-green-secondary' },
      { id: 'workload', label: 'ภาระงาน\n(Workload)', icon: Activity, color: 'from-rose-400 to-rose-600' },
    ]
  },
  {
    title: 'กำกับดูแล (Governance)',
    items: [
      { id: 'approval', label: 'ศูนย์อนุมัติ\n(Approvals)', icon: CheckCircle, color: 'from-green-400 to-green-600' },
      { id: 'performance', label: 'คะแนนผลงาน\n(Performance)', icon: Star, color: 'from-yellow-400 to-yellow-600' },
      { id: 'score-audit', label: 'ตรวจสอบคะแนน\n(Score Audit)', icon: ClipboardCheck, color: 'from-orange-400 to-orange-600' },
    ]
  },
  {
    title: 'รายงาน (Reports)',
    items: [
      { id: 'reports', label: 'รายงาน\n(Reports)', icon: FileText, color: 'from-blue-400 to-blue-600' },
      { id: 'photo-report', label: 'รายงานภาพ\n(Photo Report)', icon: ImageIcon, color: 'from-indigo-400 to-indigo-600' },
      { id: 'custom-report', label: 'กำหนดเอง\n(Custom)', icon: Settings2, color: 'from-gray-400 to-gray-600' },
    ]
  },
  {
    title: 'ปัญญาประดิษฐ์ (AI)',
    items: [
      { id: 'ai-assist', label: 'ผู้ช่วย AI\n(AI Assist)', icon: Bot, color: 'from-purple-500 to-fuchsia-600' },
      { id: 'ai-voice', label: 'รายงานด้วยเสียง\n(Voice Report)', icon: Mic, color: 'from-pink-500 to-rose-600' },
    ]
  },
  {
    title: 'ผู้ดูแลระบบ & คู่มือ (Admin & User Manual)',
    items: [
      { id: 'users', label: 'จัดการผู้ใช้\n(Users)', icon: UserCog, color: 'from-slate-500 to-slate-700' },
      { id: 'audit-log', label: 'บันทึกตรวจสอบ\n(Audit Log)', icon: ScrollText, color: 'from-gray-500 to-gray-700' },
      { id: 'security', label: 'ความปลอดภัย\n(Security)', icon: ShieldCheck, color: 'from-red-500 to-red-700' },
      { id: 'manual', label: 'คู่มือรูปเล่ม\n(User Manual)', icon: BookOpen, color: 'from-ikm-orange to-ikm-orange-dark' },
    ]
  }
];

export function More() {
  const navigate = useNavigate();
  const { user, language } = useStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isTH = language === 'TH';

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto pb-24 animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">
            {isTH ? 'เมนูเพิ่มเติม (More Options)' : 'More Options & Tools'}
          </h1>
          <p className="text-sm text-ikm-text-secondary">
            {isTH ? 'รวมฟังก์ชันการทำงานทั้งหมดของระบบ IKM Project Management' : 'Comprehensive directory of all system modules and tools'}
          </p>
        </div>

        {/* Quick Logout Button on Top Header */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 dark:bg-red-950/40 dark:hover:bg-red-600 border border-red-200 dark:border-red-900/60 transition-all shadow-sm group"
        >
          <LogOut className="w-4 h-4 text-red-500 group-hover:text-white transition-colors" />
          <span>{isTH ? 'ออกจากระบบ (Logout)' : 'Sign Out'}</span>
        </button>
      </div>

      <div className="space-y-8">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="bg-ikm-card rounded-2xl p-4 md:p-6 shadow-sm border border-ikm-border">
            <h2 className="text-sm font-semibold text-ikm-text-secondary mb-4 uppercase tracking-wider">{group.title}</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-2">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/${item.id}`)}
                  className="flex flex-col items-center gap-2 group transition-all"
                >
                  <div className={`
                    w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${item.color} 
                    flex items-center justify-center text-white shadow-md
                    transition-transform duration-200 ease-out
                    group-hover:scale-110 group-hover:shadow-lg
                    group-active:scale-95 group-active:shadow-sm
                  `}>
                    <item.icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] md:text-xs text-ikm-text font-medium text-center leading-tight whitespace-pre-line px-1">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Account & Session Control Section */}
        {user && (
          <div className="bg-gradient-to-r from-red-50/50 via-ikm-card to-orange-50/50 dark:from-red-950/20 dark:via-ikm-card dark:to-orange-950/20 rounded-2xl p-5 md:p-6 border border-red-200/60 dark:border-red-900/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ikm-orange to-amber-500 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-ikm-text">{user.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ikm-orange/15 text-ikm-orange border border-ikm-orange/30">
                    {user.userLevel || user.role}
                  </span>
                </div>
                <p className="text-xs text-ikm-text-secondary mt-0.5">
                  {user.department || 'Operations'} • {user.email || 'somchai.s@ikm-ops.com'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-ikm-border">
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 active:scale-98 transition-all shadow-md shadow-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>{isTH ? 'ออกจากระบบ (Logout)' : 'Sign Out / Logout'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
