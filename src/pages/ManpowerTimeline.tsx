import React from "react";
import { Clock } from "lucide-react";
import { useStore } from "@/src/store/useStore";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ManpowerTimeline() {
  const { employees, language } = useStore();
  const depts = [...new Set(employees.map((e) => e.department))];

  const t = {
    EN: {
      title: "Manpower Timeline",
      department: "Department",
      full: "Full",
      moderate: "Moderate",
      low: "Low",
      crew: "crew"
    },
    TH: {
      title: "ไทม์ไลน์กำลังคน",
      department: "แผนก",
      full: "เต็มกำลัง",
      moderate: "ปานกลาง",
      low: "น้อย",
      crew: "คน"
    }
  }[language];

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-100 text-status-purple flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">{t.title}</h1>
          <p className="text-sm text-ikm-text-secondary">{employees.length} {t.crew}</p>
        </div>
      </div>

      <div className="bg-ikm-card border border-ikm-border rounded-xl p-4 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header row */}
          <div className="grid grid-cols-[120px_repeat(7,1fr)] gap-1 mb-2">
            <div className="text-xs font-semibold text-ikm-text-secondary flex items-center">{t.department}</div>
            {days.map((d) => (
              <div key={d} className="text-center text-xs font-bold text-ikm-text-secondary">{d}</div>
            ))}
          </div>
          
          {depts.map((dept) => {
            const team = employees.filter((e) => e.department === dept);
            return (
              <div key={dept} className="mb-3">
                <div className="grid grid-cols-[120px_repeat(7,1fr)] gap-1 items-center">
                  <div className="pr-2">
                    <div className="text-sm font-semibold text-ikm-text truncate">{dept}</div>
                    <div className="text-[10px] text-ikm-text-secondary">{team.length} {t.crew}</div>
                  </div>
                  {days.map((d, di) => {
                    const onDuty = team.filter((_, i) => (i + di) % 3 !== 0).length;
                    const pct = Math.round((onDuty / team.length) * 100);
                    const intensity = pct > 70 ? "bg-ikm-orange" : pct > 40 ? "bg-status-blue" : "bg-gray-200";
                    return (
                      <div key={d} className="h-10 rounded-lg bg-ikm-bg flex flex-col items-center justify-center p-0.5">
                        <div className={`w-full h-full rounded-md ${intensity} opacity-90 flex items-center justify-center transition-all hover:opacity-100`}>
                          <span className="text-xs font-bold text-white drop-shadow-sm">{onDuty}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs font-medium text-ikm-text-secondary">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-ikm-orange" />{t.full}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-status-blue" />{t.moderate}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-200" />{t.low}</span>
      </div>
    </div>
  );
}
