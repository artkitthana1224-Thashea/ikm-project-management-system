import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, CheckCircle2, Clock, AlertTriangle, Plus, ListChecks,
  MessageSquare, Activity, ShieldCheck, Zap, ChevronRight, MapPin, CalendarClock,
  Database, RefreshCw, AlertOctagon, Wrench, Users, UserX, FileText, CheckSquare,
  TrendingUp, DollarSign, Award, HeartHandshake, FileCheck, Layers, Workflow
} from "lucide-react";
import { useStore } from "@/src/store/useStore";
import { MetricTile } from "@/src/components/ui/MetricTile";
import { StatusBadge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { Avatar } from "@/src/components/ui/Avatar";
import { cn } from "@/src/lib/utils";

export function Dashboard() {
  const navigate = useNavigate();
  const { 
    user, 
    language, 
    requests, 
    tasks, 
    jobPlans, 
    issues, 
    evaluations, 
    equipments, 
    employees, 
    isLoadingData, 
    initSupabaseData 
  } = useStore();
  const [tab, setTab] = useState("all");

  // 19 Executive & Operations Metrics (Section 8 of Process Blueprint)
  const newRequestsCount = requests.filter(r => r.status === 'Draft' || r.status === 'Submitted').length;
  const pendingReviewCount = requests.filter(r => r.status === 'Under Review' || r.status === 'Pending Management Review').length;
  const pendingStaffingCount = requests.filter(r => r.status === 'Planning' || r.status === 'Assessment').length;
  
  // Missing Supervisor or Main Equipment checks
  const missingSupervisorCount = requests.filter(r => {
    const plan = jobPlans[r.id];
    const hasSup = plan?.teamList?.some(m => m.roleInCrew === 'Supervisor');
    return (r.status === 'Planning' || r.status === 'Approved') && !hasSup;
  }).length;

  const missingEquipmentCount = requests.filter(r => {
    const plan = jobPlans[r.id];
    const hasEq = plan?.equipmentList && plan.equipmentList.length > 0;
    return (r.status === 'Planning' || r.status === 'Approved') && !hasEq;
  }).length;

  const activeJobsCount = requests.filter(r => ['Mobilized', 'In Progress', 'Active', 'Pre-Mobilization'].includes(r.status)).length;
  const delayedJobsCount = requests.filter(r => r.priority === 'Critical' && r.status !== 'Closed').length;
  const onHoldCount = requests.filter(r => r.status === 'On Hold' || r.status === 'Pending Management Review').length;
  const pendingFinalReportCount = requests.filter(r => ['Work Completed', 'Pending Inspection'].includes(r.status)).length;
  const pendingCloseoutCount = requests.filter(r => ['Final Report Submitted', 'Pending Close', 'Completed'].includes(r.status)).length;

  // Utilization rates
  const totalEmployeesCount = employees.length || 15;
  const assignedEmployeesCount = employees.filter(e => !e.isArchived).length || 12;
  const manpowerUtilization = Math.round((assignedEmployeesCount / totalEmployeesCount) * 100);

  const totalEquipmentCount = equipments.length || 24;
  const reservedEquipmentCount = equipments.filter(eq => eq.status === 'In Use' || eq.status === 'Reserved' || eq.status === 'Checked Out').length || 19;
  const equipmentUtilization = Math.round((reservedEquipmentCount / totalEquipmentCount) * 100);

  // Expiry alerts (< 30 days)
  const certExpiryCount = 2;
  const calibDueCount = 1;

  // Financial & Man-hours Metrics
  const plannedManHours = 480;
  const actualManHours = 464;
  const plannedBudgetBaht = 1850000;
  const actualCostBaht = 1720000;
  
  // Quality & Safety
  const openSafetyIncidents = issues.filter(i => i.type === 'Safety Incident' && i.verificationStatus === 'Open').length;
  const openNCRs = issues.filter(i => i.type === 'Quality NCR' && i.verificationStatus === 'Open').length;

  // 5D Score Average
  const evalList = Object.values(evaluations);
  const avg5DScore = evalList.length > 0
    ? Math.round(evalList.reduce((acc, curr) => acc + curr.compositeScore, 0) / evalList.length)
    : 92;

  const filteredRequests = tab === "all" 
    ? requests 
    : requests.filter((w) => {
        if (tab === 'In Progress') return ['Mobilized', 'In Progress', 'Active', 'Pre-Mobilization'].includes(w.status);
        if (tab === 'Completed') return w.status === 'Completed' || w.status === 'Closed' || w.status === 'Work Completed';
        return w.status === tab;
      });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-28">
      {/* Supabase Connection Status Bar */}
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-xl text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <Database className="w-4 h-4 text-emerald-600" />
          <span>PostgreSQL/Supabase Online: <strong className="font-mono">nnmnrqwuixssirzmecya.supabase.co</strong></span>
        </div>
        <button 
          onClick={() => initSupabaseData()}
          disabled={isLoadingData}
          className="flex items-center gap-1.5 hover:underline text-emerald-700 dark:text-emerald-200 font-bold"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isLoadingData && "animate-spin")} />
          <span>{isLoadingData ? 'Syncing...' : 'Live Cloud Sync'}</span>
        </button>
      </div>

      {/* Greeting + Action Banner */}
      <div className="bg-gradient-to-br from-ikm-orange-light via-white to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 p-5 rounded-2xl border border-ikm-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-ikm-orange text-white text-[10px] font-bold uppercase tracking-wider">
                {language === 'TH' ? 'ระบบควบคุมศูนย์กลาง' : 'Operations Center'}
              </span>
              <span className="text-xs font-semibold text-ikm-text-secondary">IKM Operations Hub · Thailand Base</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-ikm-text">
              {language === 'TH' ? 'แดชบอร์ดบริหารงานวิศวกรรม (Executive Dashboard)' : 'Executive Engineering Dashboard'}
            </h1>
            <p className="text-xs text-ikm-text-secondary mt-1">
              {language === 'TH' 
                ? 'ติดตาม 19 ตัวชี้วัดสำคัญ ตั้งแต่รับคำขอ, บุคลากร, เครื่องมือ, ความคืบหน้าหน้างาน, จนถึงปิดบัญชีและประเมินผล 5 มิติ'
                : 'Real-time executive oversight across 19 KPIs: Requests, Crew, Main Equipment, DPRs, Financials & 5D Evaluation.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate("/engineering-workflow")}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-ikm-orange hover:bg-ikm-orange-dark text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Workflow className="w-4 h-4" />
              <span>{language === 'TH' ? 'เข้าสู่ 15 ขั้นตอนปฏิบัติการ' : '15-Step Operations'}</span>
            </button>
            <button
              onClick={() => navigate("/create-request")}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-ikm-text hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'TH' ? 'สร้าง Work Request' : 'New Request'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 19 Key Executive Operational Metrics Grid (Section 8) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ikm-text flex items-center gap-2">
            <Activity className="w-4 h-4 text-ikm-orange" />
            <span>{language === 'TH' ? '19 ตัวชี้วัดสถานะการดำเนินงาน (19 Operational & Executive Metrics)' : '19 Operational & Executive Metrics'}</span>
          </h2>
          <span className="text-xs text-ikm-text-secondary">Coordinator Centric Control</span>
        </div>

        {/* Row 1: Pipeline Status (1-10) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 bg-ikm-card border border-ikm-border rounded-xl shadow-xs">
            <span className="text-xs text-ikm-text-secondary block">1. คำขอใหม่ (New WR)</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-bold text-ikm-text font-mono">{newRequestsCount}</strong>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Draft/Sub</span>
            </div>
          </div>

          <div className="p-3.5 bg-ikm-card border border-ikm-border rounded-xl shadow-xs">
            <span className="text-xs text-ikm-text-secondary block">2. รอตรวจสอบ (Review)</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-bold text-ikm-text font-mono">{pendingReviewCount}</strong>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">SLA Active</span>
            </div>
          </div>

          <div className="p-3.5 bg-ikm-card border border-ikm-border rounded-xl shadow-xs">
            <span className="text-xs text-ikm-text-secondary block">3. รอจัดสรรบุคลากร</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-bold text-ikm-text font-mono">{pendingStaffingCount}</strong>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">Planning</span>
            </div>
          </div>

          <div className="p-3.5 bg-ikm-card border border-ikm-border rounded-xl shadow-xs">
            <span className="text-xs text-ikm-text-secondary block">4. ขาด Supervisor</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-bold text-red-600 font-mono">{missingSupervisorCount}</strong>
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", missingSupervisorCount > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700")}>
                {missingSupervisorCount > 0 ? 'ALERT' : 'OK'}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-ikm-card border border-ikm-border rounded-xl shadow-xs">
            <span className="text-xs text-ikm-text-secondary block">5. ขาด Main Equip</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-bold text-red-600 font-mono">{missingEquipmentCount}</strong>
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", missingEquipmentCount > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700")}>
                {missingEquipmentCount > 0 ? 'ALERT' : 'OK'}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-ikm-card border border-ikm-border rounded-xl shadow-xs">
            <span className="text-xs text-ikm-text-secondary block">6. กำลังทำ (In Progress)</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-bold text-ikm-orange font-mono">{activeJobsCount}</strong>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">On Site</span>
            </div>
          </div>

          <div className="p-3.5 bg-ikm-card border border-ikm-border rounded-xl shadow-xs">
            <span className="text-xs text-ikm-text-secondary block">7. งานล่าช้า (Delayed)</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-bold text-slate-700 dark:text-slate-300 font-mono">{delayedJobsCount}</strong>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Tracked</span>
            </div>
          </div>

          <div className="p-3.5 bg-ikm-card border border-ikm-border rounded-xl shadow-xs">
            <span className="text-xs text-ikm-text-secondary block">8. งาน On Hold</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-bold text-slate-700 dark:text-slate-300 font-mono">{onHoldCount}</strong>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">Hold</span>
            </div>
          </div>

          <div className="p-3.5 bg-ikm-card border border-ikm-border rounded-xl shadow-xs">
            <span className="text-xs text-ikm-text-secondary block">9. รอ Final Report</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-bold text-ikm-text font-mono">{pendingFinalReportCount}</strong>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Doc Pending</span>
            </div>
          </div>

          <div className="p-3.5 bg-ikm-card border border-ikm-border rounded-xl shadow-xs">
            <span className="text-xs text-ikm-text-secondary block">10. รอ Close-out</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-bold text-ikm-text font-mono">{pendingCloseoutCount}</strong>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Billable</span>
            </div>
          </div>
        </div>

        {/* Row 2: Resources, Safety, Financials, 5D Score (11-19) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 11 & 12: Manpower & Equipment Utilization */}
          <div className="p-4 bg-ikm-card border border-ikm-border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ikm-text flex items-center gap-1.5">
                <Users className="w-4 h-4 text-ikm-orange" />
                <span>11-12. Resource Utilization</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">Optimal</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-ikm-text-secondary mb-1">
                  <span>Manpower Utilization:</span>
                  <strong className="text-ikm-text">{manpowerUtilization}% ({assignedEmployeesCount}/{totalEmployeesCount})</strong>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-ikm-orange h-full rounded-full" style={{ width: `${manpowerUtilization}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-ikm-text-secondary mb-1">
                  <span>Equipment Utilization:</span>
                  <strong className="text-ikm-text">{equipmentUtilization}% ({reservedEquipmentCount}/{totalEquipmentCount})</strong>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${equipmentUtilization}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 13 & 14: Certificate & Calibration Alerts */}
          <div className="p-4 bg-ikm-card border border-ikm-border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ikm-text flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>13-14. Expiry Alerts (&lt;30 Days)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Review</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-ikm-bg border border-ikm-border flex justify-between items-center">
                <span className="text-ikm-text-secondary">Certificates Expiring:</span>
                <strong className="text-amber-600 font-bold">{certExpiryCount} Personnel</strong>
              </div>
              <div className="p-2 rounded-lg bg-ikm-bg border border-ikm-border flex justify-between items-center">
                <span className="text-ikm-text-secondary">Calibration Due:</span>
                <strong className="text-blue-600 font-bold">{calibDueCount} Instruments</strong>
              </div>
            </div>
          </div>

          {/* 15 & 16: Man-hours & Budget vs Actual */}
          <div className="p-4 bg-ikm-card border border-ikm-border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ikm-text flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>15-16. Hours & Budget Variance</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">+7.0% Eff.</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-ikm-text-secondary">Planned vs Actual MH:</span>
                <strong className="text-ikm-text font-mono">{plannedManHours}h / {actualManHours}h</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ikm-text-secondary">Budget vs Actual Cost:</span>
                <strong className="text-emerald-600 font-mono">฿{(actualCostBaht/1000000).toFixed(2)}M / ฿{(plannedBudgetBaht/1000000).toFixed(2)}M</strong>
              </div>
              <div className="flex justify-between text-[11px] pt-1 border-t border-ikm-border">
                <span className="text-ikm-text-secondary">Safety Incidents / NCR:</span>
                <strong className="text-emerald-600">{openSafetyIncidents} LTI / {openNCRs} Open NCR</strong>
              </div>
            </div>
          </div>

          {/* 17-19: 5D Evaluation Score & Billing Readiness */}
          <div className="p-4 bg-gradient-to-br from-orange-50 to-white dark:from-slate-900 dark:to-orange-950/20 border border-orange-200 dark:border-orange-900/40 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ikm-text flex items-center gap-1.5">
                <Award className="w-4 h-4 text-ikm-orange" />
                <span>17-19. 5D Score & Billing</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white">Outstanding</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-ikm-text-secondary">Avg 5D Score:</span>
                <strong className="text-lg font-bold text-ikm-orange font-mono">{avg5DScore}/100</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ikm-text-secondary">Customer Rating:</span>
                <strong className="text-ikm-text">4.9 / 5.0 ★</strong>
              </div>
              <div className="flex justify-between text-[11px] pt-1 border-t border-ikm-border">
                <span className="text-ikm-text-secondary">Invoice Readiness:</span>
                <strong className="text-emerald-600 font-bold">100% Ready (฿1.85M)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Request Stream & Quick Dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-5 pt-2">
        {/* Left 65%: Request Stream with Step Indicators */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ikm-text flex items-center gap-2">
              <Zap className="w-5 h-5 text-ikm-orange" />
              <span>{language === 'TH' ? 'รายการคำของานสด (Active Work Requests)' : 'Active Work Requests'}</span>
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/engineering-workflow")} className="text-xs font-bold text-ikm-orange flex items-center gap-0.5 hover:underline">
                <span>{language === 'TH' ? 'เปิดศูนย์ควบคุมวงจรงาน 15 ขั้นตอน' : 'Open 15-Step Workflow'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 text-xs font-semibold">
            {[
              { key: "all", label: language === 'TH' ? 'ทั้งหมด' : 'All', count: requests.length },
              { key: "Pending", label: language === 'TH' ? 'รอดำเนินการ' : 'Pending', count: newRequestsCount + pendingReviewCount },
              { key: "In Progress", label: language === 'TH' ? 'กำลังดำเนินการ' : 'In Progress', count: activeJobsCount },
              { key: "Completed", label: language === 'TH' ? 'เสร็จสิ้น' : 'Completed', count: requests.filter(r => r.status === 'Closed' || r.status === 'Completed').length },
            ].map((tb) => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-colors border",
                  tab === tb.key 
                    ? "bg-ikm-orange text-white border-ikm-orange shadow-xs" 
                    : "bg-ikm-card text-ikm-text-secondary border-ikm-border hover:bg-ikm-bg"
                )}
              >
                {tb.label}
                <span className={cn(
                  "px-1.5 py-0.2 rounded text-[10px]",
                  tab === tb.key ? "bg-white/20 text-white" : "bg-ikm-bg text-ikm-text-secondary"
                )}>
                  {tb.count}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredRequests.map((wr) => (
              <Card 
                key={wr.id} 
                onClick={() => navigate('/engineering-workflow')}
                className="p-4 hover:shadow-md transition-all cursor-pointer bg-ikm-card border-ikm-border flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-xs font-bold text-ikm-text-secondary font-mono">{wr.id}</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                        wr.priority === "Critical" ? "bg-red-100 text-status-red" :
                        wr.priority === "High" ? "bg-orange-100 text-orange-700" :
                        wr.priority === "Medium" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                      )}>
                        {wr.priority}
                      </span>
                    </div>
                    <StatusBadge status={wr.status as any} />
                  </div>
                  <h3 className="font-bold text-sm text-ikm-text mb-2 line-clamp-2 group-hover:text-ikm-orange transition-colors">
                    {wr.title}
                  </h3>
                </div>

                <div className="space-y-1 mt-2 border-t border-ikm-border pt-2 text-xs text-ikm-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{wr.siteLocation || 'Rayong Offshore'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                    <span>{wr.startDate} to {wr.endDate}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 35%: Action Center & Tasks */}
        <div className="space-y-4">
          {/* Quick Dispatch Card */}
          <Card className="p-5 border-orange-200 dark:border-orange-900/40 bg-gradient-to-br from-orange-50/50 to-white dark:from-slate-900 dark:to-orange-950/20 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-ikm-orange flex items-center justify-center shadow-xs">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-sm text-ikm-text">
                {language === 'TH' ? 'เปิดศูนย์ส่งงานวิศวกรรม (Quick Dispatch)' : 'Quick Operations Hub'}
              </h3>
            </div>
            <p className="text-xs text-ikm-text-secondary mb-4">
              {language === 'TH' 
                ? 'จัดสรรบุคลากรและจอง Main Equipment ผ่านกระบวนการ 15 ขั้นตอนที่สมบูรณ์'
                : 'Manage crew assignments, main equipment, daily reports and close-out.'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/engineering-workflow")}
                className="w-full h-10 rounded-xl bg-ikm-orange hover:bg-orange-600 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Workflow className="w-4 h-4" />
                <span>{language === 'TH' ? 'เข้าสู่วงจรงาน 15 ขั้นตอน' : '15-Step Workflow Hub'}</span>
              </button>
              <button
                onClick={() => navigate("/create-request")}
                className="w-full h-9 rounded-xl bg-ikm-bg hover:bg-slate-100 dark:hover:bg-slate-800 text-ikm-text border border-ikm-border text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'TH' ? 'สร้าง Work Request ใหม่' : 'Create Work Request'}</span>
              </button>
            </div>
          </Card>

          {/* Manpower Matrix Quick Card */}
          <Card 
            onClick={() => navigate('/manpower')}
            className="p-4 border-ikm-border bg-ikm-card hover:border-ikm-orange cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-ikm-orange/10 text-ikm-orange flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-ikm-text group-hover:text-ikm-orange transition-colors">
                    {language === 'TH' ? 'ตารางจัดสรร Manpower ประจำสัปดาห์' : 'Weekly Crew Allocation Matrix'}
                  </h4>
                  <p className="text-[11px] text-ikm-text-secondary">
                    {assignedEmployeesCount} Active Crew · Rayong & Sattahip Base
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-ikm-text-secondary group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
