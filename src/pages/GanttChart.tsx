import React from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { BarChart3, AlertTriangle, CalendarDays } from 'lucide-react';
import { MetricTile } from '../components/ui/MetricTile';

export function GanttChart() {
  const { language } = useStore();
  
  const projects = [
    { id: 'P1', name: 'Site A Expansion', start: 0, span: 4, status: 'on-track', progress: 75 },
    { id: 'P2', name: 'Annual Maintenance', start: 2, span: 3, status: 'delayed', progress: 40 },
    { id: 'P3', name: 'Emergency Repairs', start: 1, span: 1, status: 'on-track', progress: 90 },
    { id: 'P4', name: 'System Upgrade', start: 3, span: 5, status: 'at-risk', progress: 15 },
    { id: 'P5', name: 'New Control Room', start: 5, span: 3, status: 'completed', progress: 100 },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

  const t = {
    EN: {
      title: 'Gantt Chart',
      project: 'Project',
      onTrack: 'On track',
      atRisk: 'At risk',
      delayed: 'Delayed'
    },
    TH: {
      title: 'แผนภูมิแกนต์',
      project: 'โครงการ',
      onTrack: 'ตามแผน',
      atRisk: 'เสี่ยง',
      delayed: 'ล่าช้า'
    }
  }[language];

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-status-blue/10 text-status-blue flex items-center justify-center shadow-sm">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">{t.title}</h1>
          <p className="text-sm text-ikm-text-secondary">Visual project timeline</p>
        </div>
      </div>

      <Card className="p-4 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[200px_repeat(10,1fr)] gap-px mb-2">
            <div className="text-xs font-bold text-ikm-text-secondary">{t.project}</div>
            {months.map((m) => <div key={m} className="text-center text-[11px] font-semibold text-ikm-text-secondary uppercase">{m}</div>)}
          </div>
          
          <div className="space-y-3 relative">
            {/* Background grid lines */}
            <div className="absolute inset-0 grid grid-cols-[200px_repeat(10,1fr)] gap-px pointer-events-none">
              <div />
              {months.map((_, i) => <div key={i} className="border-l border-ikm-border/50 h-full" />)}
            </div>

            {projects.map((p) => {
              const bg = p.status === 'on-track' ? 'bg-status-green' : 
                         p.status === 'delayed' ? 'bg-status-red' : 
                         p.status === 'completed' ? 'bg-status-gray' : 'bg-status-yellow';
              
              return (
                <div key={p.id} className="grid grid-cols-[200px_1fr] items-center py-1">
                  <div className="text-xs font-semibold text-ikm-text pr-4 truncate">{p.name}</div>
                  <div className="relative h-8 bg-ikm-bg rounded-md">
                    <div 
                      className={`absolute top-1 bottom-1 rounded-md ${bg} opacity-90 flex items-center px-2 transition-all hover:opacity-100 cursor-pointer shadow-sm`}
                      style={{ 
                        left: `${(p.start / 10) * 100}%`, 
                        width: `${(p.span / 10) * 100}%` 
                      }}
                    >
                      <span className="text-[10px] font-bold text-white drop-shadow-sm">{p.progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-4 mt-4 text-xs font-medium text-ikm-text-secondary">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-status-green" /> {t.onTrack}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-status-yellow" /> {t.atRisk}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-status-red" /> {t.delayed}</span>
      </div>
    </div>
  );
}
