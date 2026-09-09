import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, CheckCircle2, Clock, AlertTriangle, Plus, ListChecks,
  MessageSquare, Activity, ShieldCheck, Zap, ChevronRight, MapPin, CalendarClock,
  Database, RefreshCw
} from "lucide-react";
import { useStore } from "@/src/store/useStore";
import { MetricTile } from "@/src/components/ui/MetricTile";
import { StatusBadge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { Avatar } from "@/src/components/ui/Avatar";
import { cn } from "@/src/lib/utils";

const mockThreads = [
  { id: "1", name: "Engineer Somchai", time: "10:30", message: "On site now. Starting pre-job safety briefing. Confirmed permit with Supabase." },
  { id: "2", name: "Manop Songsuk", time: "10:15", message: "Work request synced to Supabase database. Moving to Compressor Yard." },
  { id: "3", name: "Pipob Suksan", time: "09:45", message: "Annual pressure vessel certification dossier uploaded." },
  { id: "4", name: "Chala Inthara", time: "09:10", message: "Scaffold inspection complete at Tower C-4." },
];

const dictionary = {
  EN: {
    goodMorning: "Good Morning",
    goodAfternoon: "Good Afternoon",
    goodEvening: "Good Evening",
    operationalStatus: "Operational Status",
    createWorkRequest: "Create Work Request",
    openRequests: "Open Requests",
    activeCrew: "Active Crew",
    safetyRating: "Safety Score",
    workRequestStream: "Live Supabase Request Stream",
    all: "All",
    status_pending: "Pending",
    status_in_progress: "In Progress",
    status_review: "Review",
    status_completed: "Completed",
    quickDispatch: "Quick Dispatch",
    quickDispatchDesc: "Create and assign a work request directly to Supabase.",
    myTasksReview: "Live Supabase Tasks",
    chatDispatchAlerts: "Chat Alerts",
    noData: "No Data Found in Supabase",
    connectedSupabase: "Supabase 100% Connected",
  },
  TH: {
    goodMorning: "สวัสดีตอนเช้า",
    goodAfternoon: "สวัสดีตอนบ่าย",
    goodEvening: "สวัสดีตอนเย็น",
    operationalStatus: "สถานะการปฏิบัติงาน",
    createWorkRequest: "สร้างคำของาน (Supabase)",
    openRequests: "คำขอที่เปิดอยู่",
    activeCrew: "พนักงานปฏิบัติงาน",
    safetyRating: "คะแนนความปลอดภัย",
    workRequestStream: "สตรีมคำของานสดจาก Supabase",
    all: "ทั้งหมด",
    status_pending: "รอดำเนินการ",
    status_in_progress: "กำลังดำเนินการ",
    status_review: "รอตรวจสอบ",
    status_completed: "เสร็จสิ้น",
    quickDispatch: "ส่งงานด่วน (Supabase)",
    quickDispatchDesc: "สร้างและมอบหมายงานตรงเข้าฐานข้อมูล Supabase ทันที",
    myTasksReview: "รายการงานสดจาก Supabase",
    chatDispatchAlerts: "การแจ้งเตือนแชท",
    noData: "ไม่พบข้อมูลใน Supabase",
    connectedSupabase: "เชื่อมต่อ Supabase 100% แล้ว",
  }
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "goodMorning";
  if (h < 17) return "goodAfternoon";
  return "goodEvening";
};

// Sub-components
const WorkRequestCard: React.FC<{ wr: any; t: any }> = ({ wr, t }) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow bg-ikm-card border-ikm-border flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2 items-center">
            <span className="text-xs font-bold text-ikm-text-secondary">{wr.id}</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
              wr.priority === "Critical" ? "bg-red-100 text-status-red" :
              wr.priority === "High" ? "bg-orange-100 text-orange-700" :
              wr.priority === "Medium" ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-700"
            )}>
              {wr.priority}
            </span>
          </div>
          <StatusBadge status={wr.status as any} />
        </div>
        <h3 className="font-bold text-sm text-ikm-text mb-3 line-clamp-2">{wr.title}</h3>
      </div>
      <div className="space-y-1 mt-2 border-t border-ikm-border pt-2">
        <div className="flex items-center text-xs text-ikm-text-secondary gap-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{wr.project || 'P-2026-018'}</span>
        </div>
        <div className="flex items-center text-xs text-ikm-text-secondary gap-1.5">
          <CalendarClock className="w-3.5 h-3.5 shrink-0" />
          <span>{wr.dueDate || 'Ongoing'}</span>
        </div>
        {wr.requester && (
          <div className="flex items-center text-xs text-ikm-text-secondary gap-1.5 mt-1">
            <Avatar fallback={wr.requester[0]} className="w-4 h-4" />
            <span className="font-semibold text-ikm-text">{wr.requester}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

const ChatPreview: React.FC<{ thread: any }> = ({ thread }) => {
  return (
    <div className="py-3 flex gap-3 hover:bg-ikm-bg px-2 -mx-2 rounded-lg cursor-pointer transition-colors">
      <Avatar fallback={thread.name.charAt(0)} className="w-8 h-8 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className="font-bold text-sm text-ikm-text truncate">{thread.name}</h4>
          <span className="text-[10px] text-ikm-text-secondary shrink-0 ml-2">{thread.time}</span>
        </div>
        <p className="text-xs text-ikm-text-secondary line-clamp-2 leading-relaxed">
          {thread.message}
        </p>
      </div>
    </div>
  );
};

export function Dashboard() {
  const navigate = useNavigate();
  const { user, language, requests, tasks, isLoadingData, initSupabaseData, isSupabaseConnected } = useStore();
  const [tab, setTab] = useState("all");

  const t = (key: keyof typeof dictionary.EN) => dictionary[language][key];

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const inProgressCount = requests.filter(r => r.status === 'In Progress' || r.status === 'Active').length;
  const completedCount = requests.filter(r => r.status === 'Completed' || r.status === 'Closed').length;

  const tabs = [
    { key: "all", label: t("all"), count: requests.length },
    { key: "Pending", label: t("status_pending"), count: pendingCount },
    { key: "In Progress", label: t("status_in_progress"), count: inProgressCount },
    { key: "Completed", label: t("status_completed"), count: completedCount },
  ];

  const filteredRequests = tab === "all" 
    ? requests 
    : requests.filter((w) => {
        if (tab === 'In Progress') return w.status === 'In Progress' || w.status === 'Active';
        if (tab === 'Completed') return w.status === 'Completed' || w.status === 'Closed';
        return w.status === tab;
      });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-24">
      {/* Supabase Live Status Bar */}
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-xl text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <Database className="w-4 h-4 text-emerald-600" />
          <span>{t("connectedSupabase")}: <strong className="font-mono">nnmnrqwuixssirzmecya.supabase.co</strong></span>
        </div>
        <button 
          onClick={() => initSupabaseData()}
          disabled={isLoadingData}
          className="flex items-center gap-1.5 hover:underline text-emerald-700 dark:text-emerald-200 font-bold"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isLoadingData && "animate-spin")} />
          <span>{isLoadingData ? 'Syncing...' : 'Live Sync'}</span>
        </button>
      </div>

      {/* Greeting + operational status */}
      <div className="bg-gradient-to-br from-ikm-orange-light to-white dark:to-ikm-card p-4 sm:p-5 rounded-xl border border-ikm-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-ikm-orange uppercase tracking-wider mb-1">{t("operationalStatus")}</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-ikm-text mb-1">{t(getGreeting())}, {user?.name.split(" ")[0]}</h1>
            <p className="text-sm text-ikm-text-secondary font-medium">{user?.role} · Bangkok HQ</p>
          </div>
          <button
            onClick={() => navigate("/create-request")}
            className="flex items-center justify-center gap-2 h-11 md:h-12 px-6 rounded-lg bg-ikm-orange hover:bg-ikm-orange-dark text-white font-bold shadow-md shadow-ikm-orange/20 active:scale-95 transition-all w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            {t("createWorkRequest")}
          </button>
        </div>
      </div>

      {/* KPI bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricTile title={t("safetyRating")} value="98%" icon={ShieldCheck} trend={1} accentColor="ikm-green" />
        <MetricTile title={t("activeCrew")} value="84%" icon={Activity} trend={3} accentColor="ikm-green" />
        <MetricTile title={t("openRequests")} value={requests.length.toString()} icon={ClipboardList} trend={-8} accentColor="ikm-orange" />
        <MetricTile title="Supabase Tasks" value={tasks.length.toString()} icon={AlertTriangle} accentColor="status-purple" />
      </div>

      {/* Manpower Quick Banner */}
      <div 
        onClick={() => navigate('/manpower')} 
        className="p-3.5 md:p-4 rounded-xl bg-gradient-to-r from-ikm-orange/10 via-amber-500/5 to-transparent border border-ikm-orange/30 hover:border-ikm-orange flex items-center justify-between cursor-pointer transition-all shadow-sm group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ikm-orange text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            76
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-ikm-orange/10 text-ikm-orange">
                {language === 'TH' ? 'รายงานสด' : 'Live Report'}
              </span>
              <span className="text-xs font-semibold text-ikm-text-secondary">IKM-TH RY & LKU Base</span>
            </div>
            <h3 className="text-sm font-bold text-ikm-text group-hover:text-ikm-orange transition-colors">
              {language === 'TH' ? 'สรุปรายงาน Manpower ประจำสัปดาห์ของแต่ละ Job (28 Aug - 3 Sep 2026)' : 'Weekly Manpower Allocation Matrix by Job (28 Aug - 3 Sep 2026)'}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-ikm-orange">
          <span>{language === 'TH' ? 'ดูตารางสรุป' : 'View Matrix'}</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Main bento: 65/35 on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-5">
        
        {/* Left 65%: Work Request Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ikm-text flex items-center gap-2">
              <Zap className="w-5 h-5 text-ikm-orange" />
              {t("workRequestStream")}
            </h2>
            <button onClick={() => navigate("/requests")} className="text-xs font-bold text-ikm-orange flex items-center gap-0.5 hover:underline">
              {t("all")} ({requests.length}) <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {tabs.map((tb) => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-md text-xs font-bold transition-colors border",
                  tab === tb.key 
                    ? "bg-ikm-text text-white border-ikm-text shadow-sm" 
                    : "bg-ikm-card text-ikm-text-secondary border-ikm-border hover:bg-ikm-bg"
                )}
              >
                {tb.label}
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px]",
                  tab === tb.key ? "bg-white/20 text-white" : "bg-ikm-bg text-ikm-text-secondary"
                )}>
                  {tb.count}
                </span>
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredRequests.map((wr) => (
              <WorkRequestCard key={wr.id} wr={wr} t={t} />
            ))}
          </div>
          {filteredRequests.length === 0 && (
            <Card className="p-8 text-center text-sm font-semibold text-ikm-text-secondary bg-ikm-bg border-dashed">
              {t("noData")}
            </Card>
          )}
        </div>

        {/* Right 35%: Quick Dispatch, My Tasks, Chat alerts */}
        <div className="space-y-4">
          
          {/* Quick Dispatch trigger card */}
          <Card className="p-4 md:p-5 border-ikm-orange/30 bg-ikm-orange-light shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-ikm-orange flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-sm text-ikm-orange-dark">{t("quickDispatch")}</h3>
            </div>
            <p className="text-xs text-ikm-orange-dark/80 mb-4 font-medium">{t("quickDispatchDesc")}</p>
            <button
              onClick={() => navigate("/create-request")}
              className="w-full h-10 rounded-lg bg-ikm-orange hover:bg-ikm-orange-dark text-white text-sm font-bold shadow-sm active:scale-95 transition-all"
            >
              {t("createWorkRequest")}
            </button>
          </Card>

          {/* My Tasks review list */}
          <Card className="p-4 md:p-5 shadow-sm border-ikm-border bg-ikm-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-ikm-text flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-ikm-green" />
                {t("myTasksReview")}
              </h3>
              <button onClick={() => navigate("/tasks")} className="text-xs font-bold text-ikm-green flex items-center hover:underline">
                {t("all")} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {tasks.slice(0, 5).map((task) => (
                <button
                  key={task.id}
                  onClick={() => navigate(`/tasks`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-ikm-bg text-left transition-colors border border-transparent hover:border-ikm-border"
                >
                  <div className="w-1 h-9 rounded-full bg-ikm-orange shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-ikm-text truncate mb-0.5">{task.title}</p>
                    <p className="text-[10px] font-semibold text-ikm-text-secondary">{task.id} · {task.dueDate}</p>
                  </div>
                  <StatusBadge status={task.status as any} />
                </button>
              ))}
              {tasks.length === 0 && (
                <p className="text-xs text-ikm-text-secondary text-center py-4">{t("noData")}</p>
              )}
            </div>
          </Card>

          {/* Chat dispatch alerts */}
          <Card className="p-4 md:p-5 shadow-sm border-ikm-border bg-ikm-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-ikm-text flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-status-purple" />
                {t("chatDispatchAlerts")}
              </h3>
              <button onClick={() => navigate("/chat")} className="text-xs font-bold text-status-purple flex items-center hover:underline">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-ikm-border">
              {mockThreads.map((thread) => (
                <ChatPreview key={thread.id} thread={thread} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
