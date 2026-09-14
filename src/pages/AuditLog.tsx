import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  ScrollText, LogIn, FileEdit, ShieldAlert, Download, 
  Lock, CheckCircle2, Filter, Search, ShieldCheck, Database
} from 'lucide-react';
import { cn } from '../lib/utils';
import { canExportReports, getUserRole } from '../lib/rbac';

export function AuditLog() {
  const { language, user: currentUser, approvalRecords, tasks, requests } = useStore();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const userRole = getUserRole(currentUser);
  const canExport = canExportReports(currentUser);

  // Dynamic audit logs combined with baseline events
  const dynamicLogs = [
    ...approvalRecords.map((app, idx) => ({
      id: `AL-APP-${idx + 100}`,
      time: new Date(app.approvedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      user: `${app.approverName} (${app.approverRole})`,
      action: `Decision: ${app.decision} (Rev #${app.revision})`,
      target: `${app.requestTitle} [${app.requestId}]`,
      type: app.decision === 'Approved' ? 'approval' : 'security',
    })),
    { id: 'AL-901', time: '10:45 AM', user: 'Admin System', action: 'Archive Staff Audit Trigger', target: 'Soft-delete record preserved', type: 'security' },
    { id: 'AL-902', time: '10:12 AM', user: 'Somchai W. (Manager)', action: 'Equipment Status Transition', target: 'IKM-HT-001 -> In Use', type: 'activity' },
    { id: 'AL-903', time: '09:30 AM', user: 'Anurak T. (Supervisor)', action: 'Progress Checklist Evidence Upload', target: 'TASK-2026-001', type: 'activity' },
    { id: 'AL-904', time: '08:15 AM', user: 'System Worker', action: 'Automated Supabase Snapshot', target: 'ikm_user_profiles & tasks', type: 'system' },
    { id: 'AL-905', time: '07:30 AM', user: 'Somchai W.', action: 'Authenticated Session (RBAC)', target: 'Manager Portal Login', type: 'auth' },
  ];

  const filteredLogs = dynamicLogs.filter(log => {
    const matchesSearch = !search ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || log.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'security': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'auth': return <LogIn className="w-4 h-4 text-blue-500" />;
      case 'approval': return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'activity': return <FileEdit className="w-4 h-4 text-[#F58220]" />;
      default: return <ScrollText className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleExport = () => {
    if (!canExport) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Log ID,Timestamp,User / Actor,Action,Target"].join(",") + "\n"
      + filteredLogs.map(l => `"${l.id}","${l.time}","${l.user}","${l.action}","${l.target}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IKM_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ดาวน์โหลดรายงาน Audit Log CSV สำเร็จ');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-6 max-w-6xl mx-auto">
      
      {/* Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium border bg-ikm-orange text-white border-orange-600 shadow-orange-500/25 backdrop-blur-md animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md flex-shrink-0 mt-0.5">
            <ScrollText className="w-6 h-6 text-[#F58220]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-ikm-text">
                บันทึกการตรวจสอบระบบ (Audit Log)
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>ห้ามแก้ไข (Read-Only)</span>
              </span>
            </div>
            <p className="text-xs md:text-sm text-ikm-text-secondary mt-1">
              บันทึกกิจกรรมความปลอดภัย, ผลการอนุมัติ, และการเข้าใช้งานแบบถาวร (Immutable System Audit Trail)
            </p>
          </div>
        </div>

        {/* Export Report (RBAC: Manager and above only) */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExport}
            disabled={!canExport}
            title={!canExport ? 'การ Export รายงานจำกัดเฉพาะระดับ Manager, Country Manager และ Admin เท่านั้น' : undefined}
            className={cn(
              "bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm",
              !canExport && "opacity-40 cursor-not-allowed"
            )}
          >
            <Download className="w-4 h-4 text-[#F58220]" />
            <span>Export รายงาน (CSV)</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ikm-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา Log ด้วยชื่อผู้ใช้, กิจกรรม, หรือรหัสอ้างอิง..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-ikm-card border border-ikm-border text-ikm-text text-sm focus:outline-none focus:ring-2 focus:ring-[#F58220]/40 focus:border-[#F58220] transition-all shadow-sm"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-ikm-card border border-ikm-border text-ikm-text text-sm focus:outline-none focus:ring-2 focus:ring-[#F58220]/40 focus:border-[#F58220] transition-all shadow-sm"
          >
            <option value="all">ทุกประเภทกิจกรรม</option>
            <option value="approval">การอนุมัติ (Approval Decisions)</option>
            <option value="security">ความปลอดภัย (Security / Role / Archive)</option>
            <option value="activity">กิจกรรมหน้างาน (Site Activities)</option>
            <option value="auth">การเข้าสู่ระบบ (Authentication)</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden border border-ikm-border rounded-2xl shadow-sm bg-ikm-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/40 text-ikm-text-secondary text-xs uppercase tracking-wider border-b border-ikm-border select-none">
              <tr>
                <th className="px-5 py-3.5 font-semibold w-12 text-center">ประเภท</th>
                <th className="px-5 py-3.5 font-semibold">เวลา</th>
                <th className="px-5 py-3.5 font-semibold">ผู้ดำเนินการ (User / Actor)</th>
                <th className="px-5 py-3.5 font-semibold">การกระทำ (Action)</th>
                <th className="px-5 py-3.5 font-semibold">รายละเอียด / เป้าหมาย (Target)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ikm-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors text-xs font-mono">
                  <td className="px-5 py-3.5 text-center">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                      {getIcon(log.type)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ikm-text-secondary whitespace-nowrap">{log.time}</td>
                  <td className="px-5 py-3.5 font-bold text-ikm-text">{log.user}</td>
                  <td className="px-5 py-3.5 text-ikm-text">{log.action}</td>
                  <td className="px-5 py-3.5 text-ikm-text-secondary truncate max-w-xs">{log.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
