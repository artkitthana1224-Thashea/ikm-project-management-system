import React from 'react';
import { Card } from '../components/ui/Card';
import { useStore } from '../store/useStore';
import { 
  Briefcase, ListTodo, CalendarDays, Layers, KanbanSquare, 
  Network, Calendar, BarChartHorizontal, Activity, CheckCircle, 
  Star, ClipboardCheck, FileText, Image as ImageIcon, Settings2, 
  Bot, Mic, UserCog, ScrollText, ShieldCheck, PieChart, UsersRound,
  Download, Filter, Search
} from 'lucide-react';

interface ModuleProps {
  title: string;
  icon: React.ElementType;
  description: string;
}

function BaseModule({ title, icon: Icon, description }: ModuleProps) {
  const { language } = useStore();
  
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-ikm-orange-light text-ikm-orange flex items-center justify-center shadow-sm">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">{title}</h1>
          <p className="text-sm text-ikm-text-secondary">{description}</p>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ikm-text-secondary" />
          <input 
            type="text" 
            placeholder={language === 'TH' ? "ค้นหา..." : "Search..."}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-ikm-border bg-ikm-bg text-sm focus:outline-none focus:ring-1 focus:ring-ikm-orange"
          />
        </div>
        <div className="flex gap-2">
          <button className="h-10 px-4 rounded-lg border border-ikm-border bg-ikm-card text-ikm-text text-sm font-medium flex items-center gap-2 hover:bg-ikm-bg transition-colors">
            <Filter className="w-4 h-4" />
            {language === 'TH' ? "ตัวกรอง" : "Filter"}
          </button>
          <button className="h-10 px-4 rounded-lg bg-ikm-green text-white text-sm font-medium flex items-center gap-2 hover:bg-ikm-green-secondary transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            {language === 'TH' ? "ส่งออก" : "Export"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="p-8 md:p-12 flex flex-col items-center justify-center text-center border-dashed border-2 min-h-[400px]">
        <div className="w-20 h-20 rounded-full bg-ikm-bg flex items-center justify-center mb-6 shadow-inner">
          <Icon className="w-10 h-10 text-ikm-orange opacity-50" />
        </div>
        <h2 className="text-xl font-bold text-ikm-text mb-2">
          {language === 'TH' ? `โมดูล ${title} กำลังเชื่อมต่อฐานข้อมูล` : `${title} Module Connecting to Database`}
        </h2>
        <p className="text-ikm-text-secondary max-w-md">
          {language === 'TH' 
            ? "ส่วนนี้กำลังเชื่อมต่อกับ Supabase Database ตามโครงสร้างสถาปัตยกรรมระดับ Enterprise ที่วางไว้" 
            : "This section is currently wiring up to the Supabase Database based on the Enterprise architecture."}
        </p>
      </Card>
    </div>
  );
}

// Projects
export const ProjDashboard = () => <BaseModule title="Project Dashboard" icon={PieChart} description="Overview of all project metrics" />;
export const Portfolio = () => <BaseModule title="Portfolio" icon={Briefcase} description="Manage and track project portfolios" />;
export const ProjList = () => <BaseModule title="Project List" icon={ListTodo} description="Detailed list of all enterprise projects" />;
export const ProjCalendar = () => <BaseModule title="Project Calendar" icon={CalendarDays} description="Project deadlines and milestones" />;
export const TaskMgmt = () => <BaseModule title="Task Management" icon={Layers} description="Manage tasks across all projects" />;
export const ProjBoard = () => <BaseModule title="Project Board" icon={KanbanSquare} description="High-level project workflow board" />;
export const SubProject = () => <BaseModule title="Sub-Project" icon={Network} description="Manage sub-projects and dependencies" />;

// Planning
export const CalendarView = () => <BaseModule title="Calendar" icon={Calendar} description="Global scheduling and availability" />;
export const GanttChart = () => <BaseModule title="Gantt Chart" icon={BarChartHorizontal} description="Timeline and dependency visualization" />;
export const Workload = () => <BaseModule title="Workload" icon={Activity} description="Resource capacity and workload management" />;

// Governance
export const ApprovalCenter = () => <BaseModule title="Approval Center" icon={CheckCircle} description="Centralized hub for all pending approvals" />;
export const PerformanceScore = () => <BaseModule title="Performance Score" icon={Star} description="KPIs and performance tracking" />;
export const ScoreAudit = () => <BaseModule title="Score Audit" icon={ClipboardCheck} description="Audit trail for performance scores" />;

// Reports
export const Reports = () => <BaseModule title="Reports" icon={FileText} description="Standardized system reports" />;
export const PhotoReport = () => <BaseModule title="Photo Report" icon={ImageIcon} description="Visual evidence and photo documentation" />;
export const CustomReport = () => <BaseModule title="Custom Report" icon={Settings2} description="Build and export custom reports" />;

// AI
export const AIAssist = () => <BaseModule title="AI Assistant" icon={Bot} description="AI-powered insights and automation" />;
export { VoiceReport } from './VoiceReport';

// Admin
export const UsersAdmin = () => <BaseModule title="User Management" icon={UserCog} description="Manage users, roles, and permissions" />;
export const AuditLog = () => <BaseModule title="Audit Log" icon={ScrollText} description="System-wide activity logging" />;
export const Security = () => <BaseModule title="Security" icon={ShieldCheck} description="Security policies and access control" />;
