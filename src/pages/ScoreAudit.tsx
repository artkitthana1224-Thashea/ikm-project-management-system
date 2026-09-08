import React from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { ClipboardCheck, History } from 'lucide-react';

export function ScoreAudit() {
  const { language } = useStore();

  const audits = [
    { id: 'SA-11', user: 'Anurak T.', old: 85, new: 89, reason: 'Excellent site safety management', auditor: 'Somchai S.', date: 'Oct 12' },
    { id: 'SA-10', user: 'Wichai D.', old: 72, new: 75, reason: 'Completed advanced training', auditor: 'System', date: 'Oct 10' },
    { id: 'SA-09', user: 'Kittipong M.', old: 92, new: 90, reason: 'Delayed project milestone', auditor: 'Admin', date: 'Oct 05' },
    { id: 'SA-08', user: 'Siriwan P.', old: 88, new: 92, reason: 'Perfect quarterly review', auditor: 'Somchai S.', date: 'Oct 01' },
  ];

  const t = {
    EN: {
      title: 'Score Audit',
      user: 'Employee',
      score: 'Score Change',
      reason: 'Reason',
      auditor: 'Auditor',
      date: 'Date'
    },
    TH: {
      title: 'ตรวจสอบคะแนน',
      user: 'พนักงาน',
      score: 'การเปลี่ยนแปลง',
      reason: 'เหตุผล',
      auditor: 'ผู้ประเมิน',
      date: 'วันที่'
    }
  }[language];

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-status-purple/10 text-status-purple flex items-center justify-center shadow-sm">
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">{t.title}</h1>
          <p className="text-sm text-ikm-text-secondary">Historical logs of performance score adjustments</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-ikm-bg text-ikm-text-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">{t.date}</th>
                <th className="px-6 py-4 font-semibold">{t.user}</th>
                <th className="px-6 py-4 font-semibold">{t.score}</th>
                <th className="px-6 py-4 font-semibold">{t.reason}</th>
                <th className="px-6 py-4 font-semibold">{t.auditor}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ikm-border">
              {audits.map((a) => (
                <tr key={a.id} className="hover:bg-ikm-bg transition-colors">
                  <td className="px-6 py-4 text-ikm-text-secondary whitespace-nowrap">{a.date}</td>
                  <td className="px-6 py-4 font-semibold text-ikm-text whitespace-nowrap">{a.user}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-bold tabular-nums">
                      <span className="text-ikm-text-secondary line-through">{a.old}</span>
                      <span className="text-ikm-border">→</span>
                      <span className={a.new > a.old ? 'text-status-green' : 'text-status-red'}>{a.new}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ikm-text max-w-xs">{a.reason}</td>
                  <td className="px-6 py-4 text-ikm-text-secondary">
                    <span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> {a.auditor}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
