import React from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Briefcase, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { MetricTile } from '../components/ui/MetricTile';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

export function Portfolio() {
  const { language } = useStore();

  const pieData = [
    { name: 'Engineering', value: 45 },
    { name: 'Maintenance', value: 30 },
    { name: 'Construction', value: 15 },
    { name: 'Consulting', value: 10 },
  ];
  const colors = ['#F58220', '#16794B', '#3B82F6', '#8B5CF6'];
  const trend = [
    { q: 'Q1', value: 60 }, { q: 'Q2', value: 68 }, { q: 'Q3', value: 65 }, { q: 'Q4', value: 75 },
    { q: 'Q1', value: 85 }, { q: 'Q2', value: 92 }
  ];

  const t = {
    EN: {
      title: 'Portfolio Dashboard',
      portfolios: 'Portfolios',
      roi: 'ROI',
      projects: 'Projects',
      risk: 'Overall Risk',
      dist: 'Budget Distribution',
      trend: 'Portfolio Trend'
    },
    TH: {
      title: 'แดชบอร์ดพอร์ตโฟลิโอ',
      portfolios: 'พอร์ตโฟลิโอ',
      roi: 'ผลตอบแทน (ROI)',
      projects: 'โครงการ',
      risk: 'ความเสี่ยงรวม',
      dist: 'การกระจายงบประมาณ',
      trend: 'แนวโน้มพอร์ตโฟลิโอ'
    }
  }[language];

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-ikm-green-light text-ikm-green flex items-center justify-center shadow-sm">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">{t.title}</h1>
          <p className="text-sm text-ikm-text-secondary">Strategic overview and financial tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MetricTile icon={Briefcase} title={t.portfolios} value="4" accentColor="ikm-green" />
        <MetricTile icon={TrendingUp} title={t.roi} value="18%" accentColor="status-blue" trend={4} />
        <MetricTile icon={PieIcon} title={t.projects} value="12" accentColor="ikm-orange" />
        <MetricTile icon={AlertTriangleIcon} title={t.risk} value="Low" accentColor="status-purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 md:p-6">
          <h3 className="text-sm font-bold mb-4 text-ikm-text">{t.dist}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                {pieData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-ikm-text-secondary">
                <span className="w-3 h-3 rounded-sm" style={{ background: colors[i] }} />
                {d.name} ({d.value}%)
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="text-sm font-bold mb-4 text-ikm-text">{t.trend}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F58220" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F58220" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="q" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
              <Tooltip contentStyle={{ borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#F58220" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function AlertTriangleIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
}
