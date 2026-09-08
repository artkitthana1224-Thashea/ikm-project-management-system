import React, { useState, useMemo } from "react";
import { Users, Search, Database, RefreshCw } from "lucide-react";
import { useStore } from "@/src/store/useStore";
import { cn } from "@/src/lib/utils";

const availMeta = {
  available: { label: "Available", labelTh: "ว่าง", dot: "bg-status-green", text: "text-status-green" },
  busy: { label: "Busy", labelTh: "ไม่ว่าง", dot: "bg-ikm-orange", text: "text-ikm-orange" },
  "on-leave": { label: "On Leave", labelTh: "ลา", dot: "bg-status-red", text: "text-status-red" },
  "off-shift": { label: "Off-shift", labelTh: "นอกเวร", dot: "bg-status-gray", text: "text-status-gray" },
};

export function Availability() {
  const { employees, language, updateEmployee, initSupabaseData, isLoadingData } = useStore();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [dept, setDept] = useState("all");
  const [avail, setAvail] = useState("all");

  const t = {
    EN: {
      title: "Member Availability (Supabase Live)",
      search: "Search members by name or ID...",
      role: "Role",
      department: "Department",
      all: "All",
      noData: "No members found in Supabase roster.",
      sync: "Sync Supabase",
      syncing: "Syncing...",
    },
    TH: {
      title: "สถานะความพร้อมพนักงาน (Supabase Live)",
      search: "ค้นหาพนักงานด้วยชื่อ หรือ รหัส...",
      role: "ตำแหน่ง",
      department: "แผนก",
      all: "ทั้งหมด",
      noData: "ไม่พบพนักงานในฐานข้อมูล Supabase",
      sync: "ซิงค์ Supabase",
      syncing: "กำลังซิงค์...",
    }
  }[language];

  const roles = [...new Set(employees.map(e => e.role))];
  const departments = [...new Set(employees.map(e => e.department))];

  const filtered = useMemo(() => employees.filter((e) => {
    const okQ = !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.id.toLowerCase().includes(q.toLowerCase());
    const okR = role === "all" || e.role === role;
    const okD = dept === "all" || e.department === dept;
    const okA = avail === "all" || e.availability === avail;
    return okQ && okR && okD && okA;
  }), [q, role, dept, avail, employees]);

  const counts = {
    available: employees.filter((e) => e.availability === "available").length,
    busy: employees.filter((e) => e.availability === "busy").length,
    "on-leave": employees.filter((e) => e.availability === "on-leave").length,
    "off-shift": employees.filter((e) => e.availability === "off-shift").length,
  };

  const handleToggleAvailability = (id: string, currentAvail: string) => {
    const sequence: ('available' | 'busy' | 'on-leave' | 'off-shift')[] = ['available', 'busy', 'on-leave', 'off-shift'];
    const currentIndex = sequence.indexOf(currentAvail as any);
    const nextAvail = sequence[(currentIndex + 1) % sequence.length];
    updateEmployee(id, { availability: nextAvail });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-4 max-w-7xl mx-auto pb-24">
      {/* Supabase status header */}
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Source: <strong className="font-mono">Supabase user_profiles &amp; departments</strong> · Active Crew: <strong>{employees.length}</strong></span>
        </div>
        <button 
          onClick={() => initSupabaseData()}
          disabled={isLoadingData}
          className="flex items-center gap-1.5 hover:underline text-emerald-700 dark:text-emerald-200 font-bold"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isLoadingData && "animate-spin")} />
          <span>{isLoadingData ? t.syncing : t.sync}</span>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-blue-100 text-status-blue flex items-center justify-center shadow-sm">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">{t.title}</h1>
          <p className="text-sm text-ikm-text-secondary">{filtered.length} / {employees.length} Members Loaded</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.entries(availMeta).map(([k, m]) => (
          <button 
            key={k} 
            onClick={() => setAvail(avail === k ? "all" : k)} 
            className={`bg-ikm-card border border-ikm-border rounded-xl p-2.5 text-center transition-all ${avail === k ? "ring-2 ring-ikm-orange shadow-sm" : "hover:bg-ikm-bg"}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${m.dot} mx-auto mb-1`} />
            <div className="text-base font-bold text-ikm-text tabular-nums">{counts[k as keyof typeof counts]}</div>
            <div className="text-[10px] text-ikm-text-secondary">{language === "TH" ? m.labelTh : m.label}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-col sm:flex-row mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ikm-text-secondary" />
          <input 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder={t.search} 
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-ikm-border bg-ikm-card text-sm text-ikm-text focus:outline-none focus:ring-1 focus:ring-ikm-orange shadow-sm" 
          />
        </div>
        <div className="flex gap-2">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-ikm-border bg-ikm-card text-sm outline-none focus:ring-1 focus:ring-ikm-orange text-ikm-text shadow-sm">
            <option value="all">{t.role}: {t.all}</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-ikm-border bg-ikm-card text-sm outline-none focus:ring-1 focus:ring-ikm-orange text-ikm-text shadow-sm">
            <option value="all">{t.department}: {t.all}</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((e) => {
          const m = availMeta[e.availability];
          return (
            <div 
              key={e.id} 
              className="bg-ikm-card border border-ikm-border rounded-xl p-3 flex items-center gap-3 hover:border-ikm-orange transition-all shadow-sm group"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm" style={{ background: e.avatarColor || '#F58220' }}>
                {e.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ikm-text truncate">{e.name}</p>
                <p className="text-[11px] text-ikm-text-secondary truncate">{e.role} · {e.department}</p>
              </div>
              <div className="text-right shrink-0">
                <button
                  onClick={() => handleToggleAvailability(e.id, e.availability)}
                  title="Click to toggle availability"
                  className="flex items-center gap-1.5 justify-end px-2 py-1 rounded-md hover:bg-ikm-bg transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                  <span className={`text-[11px] font-bold ${m.text}`}>{language === "TH" ? m.labelTh : m.label}</span>
                </button>
                <div className="text-[10px] text-ikm-text-secondary mt-0.5">{e.utilization}% util · Score {e.score}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filtered.length === 0 && (
        <div className="bg-ikm-card border border-ikm-border p-12 rounded-xl text-center text-sm font-medium text-ikm-text-secondary">
          {t.noData}
        </div>
      )}
    </div>
  );
}
