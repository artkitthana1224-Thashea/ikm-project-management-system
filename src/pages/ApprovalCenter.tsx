import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { WorkRequest, ApprovalRecord, UserRole } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  ShieldCheck, Check, X, Clock, FileText, User, 
  Calendar, CheckCircle2, XCircle, AlertCircle, 
  History, Eye, MessageSquare, ArrowRight, ShieldAlert, 
  Building, UserCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { canApproveRequest, getUserRole } from '../lib/rbac';

export function ApprovalCenter() {
  const { 
    language, 
    requests, 
    user: currentUser, 
    approvalRecords, 
    submitApproval 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedReq, setSelectedReq] = useState<WorkRequest | null>(null);
  const [decisionModal, setDecisionModal] = useState<{
    request: WorkRequest;
    decision: 'Approved' | 'Rejected';
  } | null>(null);
  const [reasonNote, setReasonNote] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const userRole = getUserRole(currentUser);

  const t = {
    EN: {
      title: 'Enterprise Approval Center',
      subtitle: 'Multi-level authorization workflow tracking approver ID, name, role, decision, reason, timestamp, and revisions',
      pending: 'Pending Approvals',
      history: 'Approval Audit History',
      approve: 'Approve',
      reject: 'Reject',
      viewDetails: 'View Details',
      noPending: 'No work requests awaiting your approval at this time.',
      noHistory: 'No approval decisions recorded yet.',
      approverName: 'Approver Name',
      decision: 'Decision',
      reason: 'Reason / Note',
      revision: 'Revision No.',
      date: 'Timestamp',
      confirmDecision: 'Confirm Approval Decision',
      roleNotice: 'Only Country Manager, Project Manager, and authorized Coordinators can execute approval decisions.',
    },
    TH: {
      title: 'ศูนย์อนุมัติงานและคำขอ (Approval Center)',
      subtitle: 'ระบบอนุมัติตามลำดับขั้น RBAC บันทึกผู้อนุมัติ, วันเวลา, เหตุผล, บทบาท และ Revision อย่างโปร่งใส',
      pending: 'รายการรอการอนุมัติ',
      history: 'ประวัติและ Audit Trail การอนุมัติ',
      approve: 'อนุมัติ (Approve)',
      reject: 'ปฏิเสธ (Reject)',
      viewDetails: 'ดูรายละเอียด',
      noPending: 'ไม่มีคำขอที่รอการอนุมัติในขอบเขตของคุณในขณะนี้',
      noHistory: 'ยังไม่มีประวัติการบันทึกผลการอนุมัติ',
      approverName: 'ชื่อผู้อนุมัติ',
      decision: 'ผลการพิจารณา',
      reason: 'เหตุผล / หมายเหตุ',
      revision: 'เลข Revision',
      date: 'วันเวลาที่อนุมัติ',
      confirmDecision: 'ยืนยันผลการพิจารณาอนุมัติ',
      roleNotice: 'เฉพาะ Country Manager, Manager, และ Coordinator ที่ได้รับมอบหมายเท่านั้นที่มีสิทธิ์กดอนุมัติ/ปฏิเสธคำขอ',
    }
  }[language];

  // Filter requests that are pending approval
  const pendingRequests = requests.filter(r => {
    if (r.isArchived) return false;
    // Status pending or review
    return r.status === 'Pending' || r.status === 'Review' || (!r.approvals || r.approvals.length === 0);
  });

  const handleConfirmDecision = async () => {
    if (!decisionModal || !currentUser) return;

    const currentRev = decisionModal.request.currentRevision || 1;

    const approvalData: Omit<ApprovalRecord, 'id' | 'approvedAt'> = {
      requestId: decisionModal.request.id,
      requestTitle: decisionModal.request.title,
      approverId: currentUser.id,
      approverName: currentUser.name,
      approverRole: (currentUser.userLevel || userRole) as UserRole,
      decision: decisionModal.decision,
      reason: reasonNote.trim() || (decisionModal.decision === 'Approved' ? 'Approved according to operational feasibility and safety standards.' : 'Rejected due to incomplete documentation or resource constraints.'),
      revision: currentRev + 1,
    };

    await submitApproval(approvalData);
    setDecisionModal(null);
    setReasonNote('');
    showToast(`บันทึกผลการพิจารณา: ${decisionModal.decision === 'Approved' ? 'อนุมัติเรียบร้อยแล้ว' : 'ปฏิเสธคำขอเรียบร้อยแล้ว'}`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 max-w-6xl mx-auto space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium border bg-ikm-orange text-white border-orange-600 shadow-orange-500/25 backdrop-blur-md animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-ikm-text tracking-tight flex items-center gap-2">
              {t.title}
            </h1>
            <p className="text-xs md:text-sm text-ikm-text-secondary mt-1">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Current user role indicator badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-ikm-border text-xs text-ikm-text">
          <UserCheck className="w-4 h-4 text-[#F58220]" />
          <span>ระดับสิทธิ์ปัจจุบัน: <strong className="text-[#F58220]">{currentUser?.userLevel || userRole}</strong></span>
        </div>
      </div>

      {/* Tabs Switcher: Pending Approvals vs Audit Trail History */}
      <div className="flex gap-2 border-b border-ikm-border pb-0.5">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2",
            activeTab === 'pending'
              ? "border-[#F58220] text-[#F58220] bg-[#F58220]/5"
              : "border-transparent text-ikm-text-secondary hover:text-ikm-text"
          )}
        >
          <Clock className="w-4 h-4" />
          <span>{t.pending}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-bold">
            {pendingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2",
            activeTab === 'history'
              ? "border-[#F58220] text-[#F58220] bg-[#F58220]/5"
              : "border-transparent text-ikm-text-secondary hover:text-ikm-text"
          )}
        >
          <History className="w-4 h-4" />
          <span>{t.history}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-ikm-text">
            {approvalRecords.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PENDING APPROVALS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingRequests.map((req) => {
            const canApproveThis = canApproveRequest(currentUser, req);

            return (
              <Card 
                key={req.id} 
                className="p-5 border border-ikm-border rounded-2xl bg-ikm-card hover:border-[#F58220]/40 transition-all shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-ikm-text">
                        {req.id}
                      </span>
                      <span className={cn(
                        "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                        req.priority === 'Critical' ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300" :
                        req.priority === 'High' ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300" :
                        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
                      )}>
                        {req.priority || 'Medium'} Priority
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                        Revision #{req.currentRevision || 1}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-ikm-text hover:text-[#F58220] transition-colors">
                      {req.title}
                    </h3>

                    <p className="text-xs text-ikm-text-secondary leading-relaxed">
                      {req.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-ikm-text-secondary pt-1">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#F58220]" />
                        <span>ผู้ยื่นคำขอ: <strong className="text-ikm-text">{req.requester}</strong></span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-ikm-text-secondary/70" />
                        <span>Base: {req.baseLocation || 'IKM Rayong Base'}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-ikm-text-secondary/70" />
                        <span>กำหนดส่ง: {req.dueDate || '2026-03-31'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2 min-w-[200px] justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-ikm-border">
                    <Button
                      onClick={() => setDecisionModal({ request: req, decision: 'Approved' })}
                      disabled={!canApproveThis}
                      title={!canApproveThis ? 'คุณไม่มีสิทธิ์อนุมัติคำขอนี้ตามขอบเขต RBAC' : undefined}
                      className={cn(
                        "bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm",
                        !canApproveThis && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <Check className="w-4 h-4" />
                      <span>{t.approve}</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setDecisionModal({ request: req, decision: 'Rejected' })}
                      disabled={!canApproveThis}
                      title={!canApproveThis ? 'คุณไม่มีสิทธิ์ปฏิเสธคำขอนี้ตามขอบเขต RBAC' : undefined}
                      className={cn(
                        "border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5",
                        !canApproveThis && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <X className="w-4 h-4" />
                      <span>{t.reject}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {pendingRequests.length === 0 && (
            <div className="bg-ikm-card border border-ikm-border p-12 rounded-2xl text-center text-ikm-text-secondary shadow-sm">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-60" />
              <p className="text-sm font-semibold text-ikm-text">{t.noPending}</p>
              <p className="text-xs text-ikm-text-secondary mt-1">คำขอทั้งหมดได้รับการพิจารณาครบถ้วนแล้ว</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL HISTORY */}
      {activeTab === 'history' && (
        <Card className="overflow-hidden border border-ikm-border rounded-2xl shadow-sm bg-ikm-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-ikm-border bg-slate-50/70 dark:bg-slate-900/40 text-ikm-text-secondary text-xs font-semibold select-none">
                  <th className="py-3.5 px-5 font-semibold">รหัสคำขอ & ชื่องาน</th>
                  <th className="py-3.5 px-5 font-semibold">{t.approverName}</th>
                  <th className="py-3.5 px-5 font-semibold">บทบาท (Role)</th>
                  <th className="py-3.5 px-5 font-semibold">{t.decision}</th>
                  <th className="py-3.5 px-5 font-semibold">{t.reason}</th>
                  <th className="py-3.5 px-5 font-semibold">{t.revision}</th>
                  <th className="py-3.5 px-5 font-semibold">{t.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ikm-border">
                {approvalRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5 align-middle">
                      <p className="font-bold text-ikm-text text-xs">{rec.requestTitle || rec.requestId}</p>
                      <p className="text-[11px] font-mono text-ikm-text-secondary mt-0.5">{rec.requestId}</p>
                    </td>

                    <td className="py-4 px-5 align-middle font-medium text-ikm-text text-xs">
                      {rec.approverName}
                    </td>

                    <td className="py-4 px-5 align-middle">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-ikm-text">
                        {rec.approverRole}
                      </span>
                    </td>

                    <td className="py-4 px-5 align-middle">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full",
                        rec.decision === 'Approved' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                        "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      )}>
                        {rec.decision === 'Approved' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        <span>{rec.decision}</span>
                      </span>
                    </td>

                    <td className="py-4 px-5 align-middle text-xs text-ikm-text-secondary max-w-xs truncate">
                      {rec.reason}
                    </td>

                    <td className="py-4 px-5 align-middle font-mono font-bold text-xs text-[#F58220]">
                      Rev #{rec.revision}
                    </td>

                    <td className="py-4 px-5 align-middle text-xs text-ikm-text-secondary font-mono">
                      {new Date(rec.approvedAt).toLocaleString('th-TH')}
                    </td>
                  </tr>
                ))}

                {approvalRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ikm-text-secondary">
                      <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">{t.noHistory}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* DECISION MODAL: Capture Approver Metadata, Reason, and Revision           */}
      {/* ========================================================================= */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-ikm-card border border-ikm-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className={cn(
              "p-6 text-white flex items-center justify-between",
              decisionModal.decision === 'Approved' ? "bg-emerald-600" : "bg-red-600"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {decisionModal.decision === 'Approved' ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t.confirmDecision}</h3>
                  <p className="text-xs text-white/80">
                    {decisionModal.decision === 'Approved' ? 'อนุมัติการดำเนินงาน' : 'ปฏิเสธคำขอการดำเนินงาน'}
                  </p>
                </div>
              </div>
              <button onClick={() => setDecisionModal(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-ikm-border space-y-1 text-xs">
                <p><span className="text-ikm-text-secondary">ชื่องาน:</span> <strong className="text-ikm-text">{decisionModal.request.title}</strong></p>
                <p><span className="text-ikm-text-secondary">ผู้ยื่นคำขอ:</span> <strong className="text-ikm-text">{decisionModal.request.requester}</strong></p>
                <p><span className="text-ikm-text-secondary">ผู้อนุมัติ:</span> <strong className="text-[#F58220]">{currentUser?.name} ({currentUser?.userLevel || userRole})</strong></p>
                <p><span className="text-ikm-text-secondary">Revision ที่จะบันทึก:</span> <strong className="font-mono">Rev #{(decisionModal.request.currentRevision || 1) + 1}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ikm-text mb-1.5">
                  ระบุเหตุผลหรือคำแนะนำประกอบการพิจารณา (Reason / Note) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  placeholder={decisionModal.decision === 'Approved' ? "เช่น อนุมัติตามแบบแผนความปลอดภัยและทรัพยากรพร้อมปฏิบัติการ" : "เช่น เอกสารสเปกไม่ครบถ้วน หรือเครื่องมือกำลังอยู่ระหว่างซ่อมบำรุง"}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ikm-bg border border-ikm-border text-ikm-text focus:outline-none focus:ring-2 focus:ring-ikm-orange text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-ikm-border">
                <Button variant="outline" onClick={() => setDecisionModal(null)}>
                  ยกเลิก
                </Button>
                <Button 
                  onClick={handleConfirmDecision}
                  className={cn(
                    "text-white",
                    decisionModal.decision === 'Approved' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  บันทึกผลการอนุมัติ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
