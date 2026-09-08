import React from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { ScrollText, LogIn, FileEdit, ShieldAlert } from 'lucide-react';

export function AuditLog() {
  const { language } = useStore();

  const logs = [
    { id: 'AL-901', time: '10:45 AM', user: 'Admin User', action: 'Updated Role', target: 'Somchai S.', type: 'security' },
    { id: 'AL-902', time: '10:12 AM', user: 'Anurak T.', action: 'Created Request', target: 'REQ-2026-089', type: 'activity' },
    { id: 'AL-903', time: '09:30 AM', user: 'Wichai D.', action: 'Logged In', target: '192.168.1.45', type: 'auth' },
    { id: 'AL-904', time: '08:15 AM', user: 'System', action: 'Automated Backup', target: 'Database', type: 'system' },
    { id: 'AL-905', time: 'Yesterday', user: 'Admin User', action: 'Deleted Project', target: 'P-2026-004', type: 'security' },
  ];

  const t = {
    EN: {
      title: 'Audit Log',
      time: 'Time',
      user: 'User / Actor',
      action: 'Action',
      target: 'Target / Details'
    },
    TH: {
      title: 'บันทึกการตรวจสอบ',
      time: 'เวลา',
      user: 'ผู้ใช้',
      action: 'การกระทำ',
      target: 'รายละเอียด'
    }
  }[language];

  const getIcon = (type: string) => {
    switch(type) {
      case 'security': return <ShieldAlert className="w-4 h-4 text-status-red" />;
      case 'auth': return <LogIn className="w-4 h-4 text-status-blue" />;
      case 'activity': return <FileEdit className="w-4 h-4 text-ikm-orange" />;
      default: return <ScrollText className="w-4 h-4 text-ikm-text-secondary" />;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center shadow-sm">
          <ScrollText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">{t.title}</h1>
          <p className="text-sm text-ikm-text-secondary">Immutable record of system activities</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-ikm-bg text-ikm-text-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold w-12"></th>
                <th className="px-6 py-4 font-semibold">{t.time}</th>
                <th className="px-6 py-4 font-semibold">{t.user}</th>
                <th className="px-6 py-4 font-semibold">{t.action}</th>
                <th className="px-6 py-4 font-semibold">{t.target}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ikm-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-ikm-bg transition-colors font-mono text-xs md:text-sm">
                  <td className="px-6 py-4">
                    <div className="w-8 h-8 rounded-full bg-ikm-bg border border-ikm-border flex items-center justify-center">
                      {getIcon(log.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ikm-text-secondary whitespace-nowrap">{log.time}</td>
                  <td className="px-6 py-4 font-semibold text-ikm-text">{log.user}</td>
                  <td className="px-6 py-4 text-ikm-text">{log.action}</td>
                  <td className="px-6 py-4 text-ikm-text-secondary truncate max-w-xs">{log.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
