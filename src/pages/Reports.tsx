import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { FileText, Download, BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

export function Reports() {
  const { language } = useStore();

  const monthly = [
    { m: "Apr", requests: 42, completed: 38, score: 84 },
    { m: "May", requests: 51, completed: 47, score: 86 },
    { m: "Jun", requests: 38, completed: 36, score: 88 },
    { m: "Jul", requests: 60, completed: 55, score: 87 },
    { m: "Aug", requests: 47, completed: 44, score: 90 },
    { m: "Sep", requests: 28, completed: 24, score: 92 },
  ];

  const t = {
    EN: {
      title: 'System Reports',
      reqVsComp: 'Requests vs Completed',
      scoreTrend: 'Monthly Score Trend',
      month: 'Month',
      requests: 'Requests',
      completed: 'Completed',
      score: 'Score',
      export: 'Export CSV'
    },
    TH: {
      title: 'รายงานระบบ',
      reqVsComp: 'คำของาน vs เสร็จสิ้น',
      scoreTrend: 'คะแนนผลงานรายเดือน',
      month: 'เดือน',
      requests: 'คำขอ',
      completed: 'เสร็จ',
      score: 'คะแนน',
      export: 'ส่งออก CSV'
    }
  }[language];

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-status-blue/10 text-status-blue flex items-center justify-center shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ikm-text">{t.title}</h1>
            <p className="text-sm text-ikm-text-secondary">Data visualization and exports</p>
          </div>
        </div>
        <button className="h-10 px-4 rounded-lg bg-ikm-card border border-ikm-border text-ikm-text text-sm font-medium flex items-center gap-2 hover:bg-ikm-bg transition-colors shadow-sm">
          <Download className="w-4 h-4 text-ikm-orange" />
          {t.export}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 md:p-6">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-ikm-text">
            <BarChart3 className="w-4 h-4 text-ikm-orange" />
            {t.reqVsComp}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="m" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip cursor={{ fill: 'var(--color-bg-main)' }} contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)' }} />
              <Bar dataKey="requests" fill="var(--color-ikm-orange)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="var(--color-status-green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-ikm-text">
            <TrendingUp className="w-4 h-4 text-status-blue" />
            {t.scoreTrend}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="m" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)' }} />
              <Line type="monotone" dataKey="score" stroke="var(--color-status-blue)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-ikm-bg text-ikm-text-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">{t.month}</th>
                <th className="px-6 py-4 font-semibold text-right">{t.requests}</th>
                <th className="px-6 py-4 font-semibold text-right">{t.completed}</th>
                <th className="px-6 py-4 font-semibold text-right">{t.score}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ikm-border">
              {monthly.map((r) => (
                <tr key={r.m} className="hover:bg-ikm-bg transition-colors">
                  <td className="px-6 py-4 font-medium text-ikm-text">{r.m}</td>
                  <td className="px-6 py-4 text-right tabular-nums">{r.requests}</td>
                  <td className="px-6 py-4 text-right tabular-nums">{r.completed}</td>
                  <td className="px-6 py-4 text-right font-bold text-status-green tabular-nums">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
