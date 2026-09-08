import React from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { FolderKanban, CheckCircle2, AlertTriangle, Users, ChevronRight } from 'lucide-react';
import { MetricTile } from '../components/ui/MetricTile';

export function ProjectDashboard() {
  const { language } = useStore();
  
  const projects = [
    { id: 'P-2026-018', name: 'Site A Expansion', site: 'Rayong', manager: 'Somchai S.', crew: 12, progress: 75, status: 'on-track', spent: 1.2, budget: 1.5 },
    { id: 'P-2026-019', name: 'Annual Maintenance', site: 'Chonburi', manager: 'Kittipong M.', crew: 8, progress: 40, status: 'delayed', spent: 0.8, budget: 1.0 },
    { id: 'P-2026-020', name: 'Emergency Repairs', site: 'Bangkok', manager: 'Siriwan P.', crew: 4, progress: 90, status: 'on-track', spent: 0.2, budget: 0.3 },
    { id: 'P-2026-021', name: 'System Upgrade Phase 1', site: 'Rayong', manager: 'Anurak T.', crew: 6, progress: 15, status: 'at-risk', spent: 0.5, budget: 2.0 },
  ];

  const t = {
    EN: {
      title: 'Project Dashboard',
      projects: 'Projects',
      totalCrew: 'Total Crew',
      budget: 'Budget',
      spent: 'Spent',
      progress: 'Progress',
      details: 'Details'
    },
    TH: {
      title: 'แดชบอร์ดโครงการ',
      projects: 'โครงการ',
      totalCrew: 'พนักงานรวม',
      budget: 'งบประมาณ',
      spent: 'ใช้ไป',
      progress: 'ความคืบหน้า',
      details: 'รายละเอียด'
    }
  }[language];

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-ikm-orange-light text-ikm-orange flex items-center justify-center shadow-sm">
          <FolderKanban className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">{t.title}</h1>
          <p className="text-sm text-ikm-text-secondary">Overview of all active projects</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MetricTile icon={FolderKanban} title={t.projects} value={projects.length} accentColor="ikm-orange" />
        <MetricTile icon={Users} title={t.totalCrew} value={30} accentColor="ikm-green" />
        <MetricTile icon={CheckCircle2} title={t.budget} value="4.8M" accentColor="ikm-green" />
        <MetricTile icon={AlertTriangle} title={t.spent} value="2.7M" accentColor="status-purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Card key={p.id} className="p-4 hover:border-ikm-orange transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-bold text-ikm-text-secondary">{p.id}</p>
                <h3 className="font-semibold text-ikm-text text-lg">{p.name}</h3>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider
                ${p.status === 'on-track' ? 'bg-ikm-green-light text-ikm-green' : 
                  p.status === 'delayed' ? 'bg-red-100 text-status-red' : 
                  'bg-yellow-100 text-status-yellow'}`}
              >
                {p.status.replace('-', ' ')}
              </span>
            </div>
            
            <div className="flex gap-2 text-xs text-ikm-text-secondary mb-3">
              <span>{p.site}</span> &bull; <span>{p.manager}</span> &bull; <span>{p.crew} crew</span>
            </div>

            <div className="mb-1 flex justify-between text-xs">
              <span className="text-ikm-text-secondary">{t.progress}</span>
              <span className="font-bold text-ikm-text">{p.progress}%</span>
            </div>
            <div className="h-2 w-full bg-ikm-bg rounded-full overflow-hidden mb-3">
              <div 
                className={`h-full rounded-full ${p.status === 'delayed' ? 'bg-status-red' : 'bg-ikm-orange'}`}
                style={{ width: `${p.progress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-3 border-t border-ikm-border">
              <span className="text-ikm-text-secondary">{t.budget}: ฿{p.spent}M / {p.budget}M</span>
              <span className="text-ikm-orange font-semibold flex items-center group-hover:underline">
                {t.details} <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
