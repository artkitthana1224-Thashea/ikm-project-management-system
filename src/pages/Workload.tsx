import React from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { MetricTile } from '../components/ui/MetricTile';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

export function Workload() {
  const { language, employees } = useStore();
  
  const team = employees.slice(0, 10);
  const data = team.map((e) => ({ name: e.name.split(' ')[0], util: e.utilization }));
  
  const avg = Math.round(team.reduce((s, e) => s + e.utilization, 0) / team.length);
  const over = team.filter((e) => e.utilization > 85).length;
  const avail = team.filter((e) => e.utilization < 60).length;

  const t = {
    EN: {
      title: 'Workload & Capacity',
      avg: 'Avg Utilization',
      over: 'Overloaded',
      avail: 'Available',
      chartTitle: 'Individual Workload'
    },
    TH: {
      title: 'ภาระงานและความสามารถ',
      avg: 'ใช้งานเฉลี่ย',
      over: 'เกินกำลัง',
      avail: 'พร้อมใช้งาน',
      chartTitle: 'ภาระงานรายบุคคล'
    }
  }[language];

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-status-blue/10 text-status-blue flex items-center justify-center shadow-sm">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">{t.title}</h1>
          <p className="text-sm text-ikm-text-secondary">Monitor team capacity and prevent burnout</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <MetricTile icon={BarChart3} title={t.avg} value={`${avg}%`} accentColor="ikm-orange" />
        <MetricTile icon={AlertTriangle} title={t.over} value={over} accentColor="status-red" />
        <MetricTile icon={BarChart3} title={t.avail} value={avail} accentColor="ikm-green" />
      </div>

      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-bold mb-6 text-ikm-text">{t.chartTitle}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)' }} cursor={{ fill: 'var(--color-bg-main)' }} />
            <ReferenceLine x={85} stroke="var(--color-status-red)" strokeDasharray="4 4" />
            <Bar dataKey="util" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.util > 85 ? "var(--color-status-red)" : d.util > 60 ? "var(--color-ikm-orange)" : "var(--color-status-green)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center gap-4 text-xs text-ikm-text-secondary">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-status-red" /> Overloaded (&gt;85%)</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-ikm-orange" /> Optimal (60-85%)</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-status-green" /> Available (&lt;60%)</div>
        </div>
      </Card>
    </div>
  );
}
