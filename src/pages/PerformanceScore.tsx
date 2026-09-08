import React from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Award, Star } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export function PerformanceScore() {
  const { language, employees } = useStore();
  
  const ranked = [...employees].sort((a, b) => b.score - a.score).slice(0, 10);
  const top = ranked[0];

  const categories = [
    { key: 'Quality', val: 23, max: 25 },
    { key: 'Speed', val: 21, max: 25 },
    { key: 'Safety', val: 25, max: 25 },
    { key: 'Teamwork', val: 23, max: 25 },
  ];

  const t = {
    EN: {
      title: 'Performance Score',
      top: 'Top Performer',
      scoreByCat: 'Score by Category',
      leaderboard: 'Leaderboard',
      max: 'max'
    },
    TH: {
      title: 'คะแนนผลงาน',
      top: 'อันดับ 1',
      scoreByCat: 'คะแนนรายหมวด',
      leaderboard: 'อันดับผู้ทำผลงาน',
      max: 'เต็ม'
    }
  }[language];

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-status-yellow/20 text-status-yellow flex items-center justify-center shadow-sm">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">{t.title}</h1>
          <p className="text-sm text-ikm-text-secondary">Employee performance metrics and leaderboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 flex items-center gap-6">
          <div className="relative w-32 h-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: top.score, fill: "var(--color-status-yellow)" }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: 'var(--color-bg-main)' }} dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-ikm-text">{top.score}</span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1 bg-status-yellow/10 text-status-yellow px-2 py-1 rounded-md w-fit">
              <Star className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t.top}</span>
            </div>
            <h2 className="font-bold text-xl text-ikm-text truncate mt-2">{top.name}</h2>
            <p className="text-sm text-ikm-text-secondary">{top.role} &bull; {top.department}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-bold mb-4 text-ikm-text">{t.scoreByCat}</h3>
          <div className="space-y-4">
            {categories.map((c) => (
              <div key={c.key}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-ikm-text">{c.key}</span>
                  <span className="font-bold text-ikm-text">{c.val}<span className="text-ikm-text-secondary font-normal ml-1">/ {c.max}</span></span>
                </div>
                <div className="h-2 rounded-full bg-ikm-bg overflow-hidden">
                  <div className="h-full rounded-full bg-ikm-orange" style={{ width: `${(c.val / c.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-4">
        <h3 className="text-sm font-bold mb-4 text-ikm-text">{t.leaderboard}</h3>
        <div className="space-y-2">
          {ranked.map((e, i) => (
            <div key={e.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-ikm-bg transition-colors border border-transparent hover:border-ikm-border">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm
                ${i === 0 ? "bg-yellow-400 text-yellow-900" : 
                  i === 1 ? "bg-slate-300 text-slate-800" : 
                  i === 2 ? "bg-amber-600 text-white" : 
                  "bg-ikm-card text-ikm-text-secondary border border-ikm-border"}`}>
                {i + 1}
              </span>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm" style={{ background: e.avatarColor }}>
                {e.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ikm-text truncate">{e.name}</p>
                <p className="text-[11px] text-ikm-text-secondary">{e.role}</p>
              </div>
              <div className="text-xl font-bold text-ikm-text tabular-nums">{e.score}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
