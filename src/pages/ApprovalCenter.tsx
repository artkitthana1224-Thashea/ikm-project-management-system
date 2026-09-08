import React from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { ShieldCheck, Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function ApprovalCenter() {
  const { language } = useStore();

  const [approvals, setApprovals] = React.useState([
    { id: 'APP-1001', type: 'Purchase Order', title: 'New safety equipment for Site B', requestedBy: 'Kittipong M.', amount: '฿45,000', status: 'Pending' },
    { id: 'APP-1002', type: 'Overtime', title: 'Weekend maintenance shift', requestedBy: 'Anurak T.', amount: '12h', status: 'Pending' },
    { id: 'APP-1003', type: 'Work Permit', title: 'Hot work permit at Control Room', requestedBy: 'Wichai D.', amount: null, status: 'Pending' },
  ]);

  const t = {
    EN: {
      title: 'Approval Center',
      pending: 'Pending Approvals',
      approve: 'Approve',
      reject: 'Reject',
      noData: 'No pending approvals'
    },
    TH: {
      title: 'ศูนย์อนุมัติ',
      pending: 'รอการอนุมัติ',
      approve: 'อนุมัติ',
      reject: 'ปฏิเสธ',
      noData: 'ไม่มีรายการรออนุมัติ'
    }
  }[language];

  const handleDecision = (id: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-status-green/10 text-status-green flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">{t.title}</h1>
          <p className="text-sm text-ikm-text-secondary">{approvals.length} {t.pending}</p>
        </div>
      </div>

      <div className="space-y-4">
        {approvals.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold text-ikm-text-secondary uppercase tracking-wider mb-1">{a.id} &bull; {a.type}</p>
                <h3 className="text-lg font-semibold text-ikm-text">{a.title}</h3>
                <p className="text-sm text-ikm-text-secondary mt-1">Requested by: {a.requestedBy} {a.amount && <span className="font-semibold text-ikm-orange ml-2">&bull; {a.amount}</span>}</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-none border-status-red text-status-red hover:bg-status-red hover:text-white" onClick={() => handleDecision(a.id)}>
                  <X className="w-4 h-4 mr-2" /> {t.reject}
                </Button>
                <Button className="flex-1 md:flex-none bg-ikm-green hover:bg-ikm-green-secondary" onClick={() => handleDecision(a.id)}>
                  <Check className="w-4 h-4 mr-2" /> {t.approve}
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {approvals.length === 0 && (
          <div className="bg-ikm-card border border-ikm-border p-12 rounded-2xl text-center text-ikm-text-secondary shadow-sm">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>{t.noData}</p>
          </div>
        )}
      </div>
    </div>
  );
}
