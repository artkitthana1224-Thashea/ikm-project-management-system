import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/src/store/useStore";
import { Card } from "@/src/components/ui/Card";
import { StatusBadge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { CalendarClock, MapPin, Search, Plus, Filter, Database, RefreshCw } from "lucide-react";
import { Avatar } from "@/src/components/ui/Avatar";
import { cn } from "@/src/lib/utils";
import { MetricTile } from "@/src/components/ui/MetricTile";
import { ShieldCheck, Activity, ClipboardList } from "lucide-react";

const dictionary = {
  EN: {
    workRequests: "Work Requests (Supabase DB)",
    workRequestsDesc: "Review and manage incoming work requests synced directly from Supabase.",
    searchPlaceholder: "Search requests by ID, Title, Project...",
    safetyRating: "Safety Score",
    activeCrew: "Active Crew",
    openRequests: "Open Requests",
    all: "All",
    status_pending: "Pending",
    status_assigned: "Assigned",
    status_in_progress: "In Progress",
    status_completed: "Completed",
    noData: "No Requests Found in Supabase",
    createWorkRequest: "New Request",
    connectedSupabase: "Supabase Live Connected",
  },
  TH: {
    workRequests: "คำของาน (ฐานข้อมูล Supabase)",
    workRequestsDesc: "ตรวจสอบและจัดการคำของานที่ซิงค์จาก Supabase แบบเรียลไทม์ 100%",
    searchPlaceholder: "ค้นหาคำของาน...",
    safetyRating: "คะแนนความปลอดภัย",
    activeCrew: "พนักงานปฏิบัติงาน",
    openRequests: "คำขอที่เปิดอยู่",
    all: "ทั้งหมด",
    status_pending: "รอดำเนินการ",
    status_assigned: "มอบหมายแล้ว",
    status_in_progress: "กำลังดำเนินการ",
    status_completed: "เสร็จสิ้น",
    noData: "ไม่พบคำของานใน Supabase",
    createWorkRequest: "สร้างคำของานใหม่",
    connectedSupabase: "เชื่อมต่อ Supabase สำเร็จ",
  },
};

export function Requests() {
  const { language, requests, isLoadingData, initSupabaseData } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const t = (key: keyof typeof dictionary.EN) => dictionary[language][key];

  const pendingCount = requests.filter(w => w.status === "Pending").length;
  const inProgressCount = requests.filter(w => w.status === "In Progress" || w.status === "Active" || w.status === "Assigned").length;
  const completedCount = requests.filter(w => w.status === "Completed" || w.status === "Closed").length;

  const tabs = [
    { key: "all", label: t("all"), count: requests.length },
    { key: "Pending", label: t("status_pending"), count: pendingCount },
    { key: "In Progress", label: t("status_in_progress"), count: inProgressCount },
    { key: "Completed", label: t("status_completed"), count: completedCount },
  ];

  let filteredRequests = tab === "all"
    ? requests
    : requests.filter((w) => {
        if (tab === 'In Progress') return w.status === 'In Progress' || w.status === 'Active' || w.status === 'Assigned';
        if (tab === 'Completed') return w.status === 'Completed' || w.status === 'Closed';
        return w.status === tab;
      });

  if (search.trim() !== "") {
    const q = search.toLowerCase();
    filteredRequests = filteredRequests.filter(
      (wr) =>
        wr.id.toLowerCase().includes(q) ||
        wr.title.toLowerCase().includes(q) ||
        (wr.project && wr.project.toLowerCase().includes(q))
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-24">
      {/* Supabase Status Banner */}
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-xl text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Table: <strong className="font-mono">public.work_requests</strong> · Total: <strong>{requests.length}</strong></span>
        </div>
        <button 
          onClick={() => initSupabaseData()}
          disabled={isLoadingData}
          className="flex items-center gap-1.5 hover:underline text-emerald-700 dark:text-emerald-200 font-bold"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isLoadingData && "animate-spin")} />
          <span>{isLoadingData ? 'Syncing...' : 'Sync Supabase'}</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="hidden md:grid grid-cols-3 gap-3 mb-6 w-full max-w-lg">
            <MetricTile
              title={t("safetyRating")}
              value="98%"
              icon={ShieldCheck}
              accentColor="ikm-green"
            />
            <MetricTile
              title={t("activeCrew")}
              value="84%"
              icon={Activity}
              accentColor="ikm-green"
            />
            <MetricTile
              title={t("openRequests")}
              value={requests.length.toString()}
              icon={ClipboardList}
              accentColor="ikm-orange"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ikm-text">
            {t("workRequests")}
          </h1>
          <p className="text-ikm-text-secondary text-sm">
            {t("workRequestsDesc")}
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            className="flex-1 md:flex-none bg-ikm-orange hover:bg-ikm-orange-dark text-white h-11"
            onClick={() => navigate("/create-request")}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("createWorkRequest")}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-xl border border-ikm-border focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none bg-ikm-card shadow-sm text-sm"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-md text-xs font-bold transition-colors border",
              tab === tb.key
                ? "bg-ikm-text text-white border-ikm-text shadow-sm"
                : "bg-ikm-card text-ikm-text-secondary border-ikm-border hover:bg-ikm-bg",
            )}
          >
            {tb.label}
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px]",
                tab === tb.key
                  ? "bg-white/20 text-white"
                  : "bg-ikm-bg text-ikm-text-secondary",
              )}
            >
              {tb.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-2">
        {filteredRequests.map((req) => (
          <Card
            key={req.id}
            className="overflow-hidden hover:shadow-md transition-shadow bg-ikm-card border-ikm-border flex flex-col justify-between p-4"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold text-ikm-text-secondary">
                    {req.id}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                      req.priority === "Critical"
                        ? "bg-red-100 text-status-red"
                        : req.priority === "High"
                          ? "bg-orange-100 text-orange-700"
                          : req.priority === "Medium"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700",
                    )}
                  >
                    {req.priority}
                  </span>
                </div>
                <StatusBadge status={req.status as any} />
              </div>
              <h3 className="font-bold text-sm text-ikm-text line-clamp-2 mb-3">
                {req.title}
              </h3>
            </div>

            <div className="space-y-1.5 mt-auto pt-3 border-t border-ikm-border">
              <div className="flex items-center text-xs text-ikm-text-secondary gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{req.project || 'P-2026-018'}</span>
              </div>
              <div className="flex items-center text-xs text-ikm-text-secondary gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                <span>{req.dueDate || 'Ongoing'}</span>
              </div>

              {req.requester && (
                <div className="flex items-center text-xs text-ikm-text-secondary gap-1.5 mt-2">
                  <Avatar fallback={req.requester[0]} className="w-5 h-5" />
                  <span className="font-semibold text-ikm-text truncate">
                    {req.requester}
                  </span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card className="p-12 text-center text-sm font-semibold text-ikm-text-secondary bg-ikm-bg border-dashed">
          {t("noData")}
        </Card>
      )}
    </div>
  );
}
