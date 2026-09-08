import React from "react";
import { Users, UserCheck, Clock, Award } from "lucide-react";
import { useStore } from "@/src/store/useStore";
import { MetricTile } from "@/src/components/ui/MetricTile";

export function TeamDashboard() {
  const { employees, language } = useStore();
  const team = employees.slice(0, 12);
  const avgUtil = Math.round(team.reduce((s, e) => s + e.utilization, 0) / team.length) || 0;
  const avgScore = Math.round(team.reduce((s, e) => s + e.score, 0) / team.length) || 0;
  const available = team.filter((e) => e.availability === "available").length;

  const t = {
    EN: {
      teamDashboard: "Team Dashboard",
      teamMembers: "Team Members",
      available: "Available",
      avgUtil: "Avg Util",
      avgScore: "Avg Score",
      utilization: "Util"
    },
    TH: {
      teamDashboard: "แดชบอร์ดทีม",
      teamMembers: "สมาชิกทีม",
      available: "ว่าง",
      avgUtil: "ใช้งานเฉลี่ย",
      avgScore: "คะแนนเฉลี่ย",
      utilization: "ใช้งาน"
    }
  }[language];

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-ikm-green-light text-ikm-green flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">{t.teamDashboard}</h1>
          <p className="text-sm text-ikm-text-secondary">{team.length} {t.teamMembers}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricTile icon={Users} title={t.teamMembers} value={team.length} accentColor="ikm-green" />
        <MetricTile icon={UserCheck} title={t.available} value={available} accentColor="status-blue" />
        <MetricTile icon={Clock} title={t.avgUtil} value={`${avgUtil}%`} accentColor="ikm-orange" />
        <MetricTile icon={Award} title={t.avgScore} value={avgScore} accentColor="status-purple" />
      </div>

      <div className="bg-ikm-card p-4 md:p-6 rounded-xl border border-ikm-border mt-4 shadow-sm">
        <h3 className="text-sm font-bold mb-4 text-ikm-text">{t.teamMembers}</h3>
        <div className="space-y-2">
          {team.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-ikm-border hover:bg-ikm-bg transition-colors">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm" style={{ background: e.avatarColor }}>
                {e.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ikm-text truncate">{e.name}</p>
                <p className="text-[11px] text-ikm-text-secondary truncate">{e.role} · {e.skills.join(", ")}</p>
              </div>
              <div className="w-24 md:w-32 h-2 rounded-full bg-ikm-bg overflow-hidden shrink-0 border border-ikm-border">
                <div 
                  className={`h-full rounded-full ${e.utilization > 80 ? "bg-ikm-orange" : "bg-ikm-green"}`} 
                  style={{ width: `${e.utilization}%` }} 
                />
              </div>
              <span className="text-xs font-semibold text-ikm-text tabular-nums w-12 text-right">
                {e.utilization}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
