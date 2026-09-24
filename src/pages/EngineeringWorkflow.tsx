import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  WorkRequest, TaskStatus, ScopeRiskAssessment, JobPlan, 
  PreMobilizationChecklist, DailyProgressReport, ChangeRequest, 
  IssueIncident, InspectionRecord, FinalReport, CloseoutChecklist, 
  PerformanceEvaluation5D, EquipmentReturnChecklist, CrewMemberAssignment
} from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Workflow, ArrowRight, CheckCircle2, AlertTriangle, Clock, ShieldCheck, 
  Wrench, Users, FileText, Send, XCircle, RotateCcw, Lock, ChevronRight,
  TrendingUp, Layers, CheckSquare, Plus, AlertCircle, FileCheck, DollarSign,
  Star, Award, BookOpen, RefreshCw, MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkflowEngine } from '../lib/workflowEngine';
import { getUserRole } from '../lib/rbac';

export function EngineeringWorkflow() {
  const { 
    language, 
    requests, 
    user, 
    assessments, 
    jobPlans, 
    preMobChecklists, 
    dprs, 
    changeRequests, 
    issues, 
    inspections, 
    finalReports, 
    closeouts, 
    evaluations, 
    equipments, 
    employees, 
    auditLogs,
    executeWorkflowTransition,
    saveAssessment,
    saveJobPlan,
    savePreMobChecklist,
    saveDPR,
    saveChangeRequest,
    saveIssue,
    saveInspection,
    saveFinalReport,
    saveCloseout,
    saveEvaluation,
    updateRequest
  } = useStore();

  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    requests.length > 0 ? requests[0].id : ''
  );
  const [activeStepTab, setActiveStepTab] = useState<
    'overview' | 'review' | 'assessment' | 'planning' | 'jobplan' | 'pre-mob' | 'execution' | 'dpr' | 'change' | 'issues' | 'inspection' | 'return' | 'final-report' | 'closeout' | 'evaluation' | 'audit'
  >('overview');

  const [transitionReason, setTransitionReason] = useState('');
  const [transitionTarget, setTransitionTarget] = useState<TaskStatus | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentRequest = requests.find(r => r.id === selectedRequestId) || requests[0];
  const userRole = getUserRole(user);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  if (!currentRequest) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center">
        <Workflow className="w-12 h-12 text-ikm-text-secondary mx-auto mb-3" />
        <h2 className="text-xl font-bold text-ikm-text">No Work Requests Found</h2>
        <p className="text-sm text-ikm-text-secondary mt-1">Please create a work request first to begin the 22-step workflow.</p>
      </div>
    );
  }

  const currentStatus = currentRequest.status;
  const currentStepNumber = WorkflowEngine.getWorkflowStepNumber(currentStatus);
  const availableActions = WorkflowEngine.getAvailableActions(currentStatus, userRole);

  const handleExecuteTransition = async (target: TaskStatus) => {
    setIsTransitioning(true);
    const res = await executeWorkflowTransition(currentRequest.id, target, transitionReason);
    setIsTransitioning(false);
    if (res.success) {
      showNotification('success', `เปลี่ยนสถานะเป็น '${target}' สำเร็จ`);
      setTransitionTarget(null);
      setTransitionReason('');
    } else {
      showNotification('error', res.message || 'ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  // Associated Data
  const currentAssessment = assessments[currentRequest.id];
  const currentJobPlan = jobPlans[currentRequest.id];
  const currentPreMob = preMobChecklists[currentRequest.id];
  const jobDprs = dprs.filter(d => d.jobId === currentRequest.id);
  const jobCRs = changeRequests.filter(c => c.jobId === currentRequest.id);
  const jobIssues = issues.filter(i => i.jobId === currentRequest.id);
  const currentInspection = inspections[currentRequest.id];
  const currentFinalReport = finalReports[currentRequest.id];
  const currentCloseout = closeouts[currentRequest.id];
  const currentEval = evaluations[currentRequest.id];
  const jobAuditLogs = auditLogs.filter(a => a.recordId === currentRequest.id);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Top Header & Job Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ikm-card p-5 rounded-2xl border border-ikm-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-ikm-orange">
              <Workflow className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-ikm-text">
              {language === 'TH' ? 'ระบบควบคุมวงจรงานวิศวกรรม 22 ขั้นตอน (End-to-End Workflow)' : '22-Step Engineering Operations Hub'}
            </h1>
          </div>
          <p className="text-xs text-ikm-text-secondary">
            {language === 'TH' 
              ? 'ควบคุม Work Request, Manpower, Equipment, Pre-Mob, Daily Progress, QA/QC, Change, Final Report และ Close-out โดยมี Coordinator เป็นศูนย์กลาง'
              : 'Coordinator-driven central control for Work Request, Risk, Manpower, Equipment, DPR, HSE, Final Report & Close-out.'}
          </p>
        </div>

        {/* Request Dropdown Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-ikm-text-secondary whitespace-nowrap">
            {language === 'TH' ? 'เลือกโครงการ/คำขอ:' : 'Active Request:'}
          </label>
          <select
            value={currentRequest.id}
            onChange={(e) => setSelectedRequestId(e.target.value)}
            className="px-3 py-2 bg-ikm-bg border border-ikm-border rounded-xl text-xs font-bold text-ikm-text focus:border-ikm-orange outline-none cursor-pointer max-w-xs"
          >
            {requests.map(r => (
              <option key={r.id} value={r.id}>
                [{r.id}] {r.title} ({r.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={cn(
          "px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md transition-all animate-in fade-in",
          feedbackMsg.type === 'success' ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-red-50 text-red-800 border border-red-300 dark:bg-red-950/50 dark:text-red-300"
        )}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Active State Banner & Action Transitions */}
      <Card className="p-5 bg-gradient-to-r from-orange-50/50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border-orange-200 dark:border-orange-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-ikm-orange text-white shadow-xs">
                Step {currentStepNumber} of 22
              </span>
              <span className="text-sm font-bold text-ikm-text">
                Current State: <strong className="text-ikm-orange underline">{currentStatus}</strong>
              </span>
              <span className="text-xs text-ikm-text-secondary">
                · Customer: <strong>{currentRequest.customer}</strong>
              </span>
            </div>
            <h2 className="text-base font-bold text-ikm-text mt-2">{currentRequest.title}</h2>
          </div>

          {/* Workflow Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {availableActions.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                {language === 'TH' ? 'ไม่มีคำสั่งเปลี่ยนสถานะสำหรับบทบาทปัจจุบัน' : 'No available state transitions for your role'}
              </span>
            ) : (
              availableActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (action.requiresReason) {
                      setTransitionTarget(action.to);
                    } else {
                      handleExecuteTransition(action.to);
                    }
                  }}
                  disabled={isTransitioning}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-ikm-orange hover:bg-orange-600 text-white shadow-xs transition-all active:scale-95"
                >
                  <span>{language === 'TH' ? action.actionNameTH : action.actionName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Reason Modal / Inline Form if required */}
        {transitionTarget && (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-900 dark:text-orange-300">
              <AlertCircle className="w-4 h-4 text-ikm-orange" />
              <span>{language === 'TH' ? `กรุณาระบุเหตุผลในการเปลี่ยนสถานะเป็น '${transitionTarget}':` : `Please provide a reason for transitioning to '${transitionTarget}':`}</span>
            </div>
            <textarea
              value={transitionReason}
              onChange={(e) => setTransitionReason(e.target.value)}
              placeholder="ระบุเหตุผลหรือข้อสังเกตเพิ่มเติม..."
              rows={2}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-ikm-border rounded-lg text-xs outline-none focus:border-ikm-orange"
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setTransitionTarget(null)}>
                {language === 'TH' ? 'ยกเลิก' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={() => handleExecuteTransition(transitionTarget)}>
                {language === 'TH' ? 'ยืนยันเปลี่ยนสถานะ' : 'Confirm Transition'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Sub-Tabs across 22 Workflow Stages */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-ikm-border scrollbar-none text-xs font-semibold">
        {[
          { key: 'overview', label: language === 'TH' ? 'ภาพรวม (Summary)' : 'Overview' },
          { key: 'review', label: language === 'TH' ? '1. Work Request & Review' : '1. WR Review' },
          { key: 'assessment', label: language === 'TH' ? '2. Risk Assessment' : '2. Risk Assess' },
          { key: 'planning', label: language === 'TH' ? '3. Manpower & Equipment' : '3. Resource Plan' },
          { key: 'jobplan', label: language === 'TH' ? '4. Job Plan' : '4. Job Plan' },
          { key: 'pre-mob', label: language === 'TH' ? '5. Pre-Mob Checklist' : '5. Pre-Mob' },
          { key: 'execution', label: language === 'TH' ? '6. Work Execution' : '6. Execution' },
          { key: 'dpr', label: language === 'TH' ? '7. Daily Report (DPR)' : '7. DPR' },
          { key: 'change', label: language === 'TH' ? '8. Change Request' : '8. Change Mgmt' },
          { key: 'issues', label: language === 'TH' ? '9. Issues & NCR' : '9. Issues' },
          { key: 'inspection', label: language === 'TH' ? '10. QA Inspection' : '10. Inspection' },
          { key: 'return', label: language === 'TH' ? '11. Equipment Return' : '11. Equip Return' },
          { key: 'final-report', label: language === 'TH' ? '12. Final Report' : '12. Final Report' },
          { key: 'closeout', label: language === 'TH' ? '13. Close-out' : '13. Close-out' },
          { key: 'evaluation', label: language === 'TH' ? '14. 5D Evaluation' : '14. 5D Eval' },
          { key: 'audit', label: language === 'TH' ? 'Audit Trail' : 'Audit Trail' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveStepTab(tab.key as any)}
            className={cn(
              "px-3 py-2 rounded-lg whitespace-nowrap transition-all",
              activeStepTab === tab.key
                ? "bg-ikm-orange text-white font-bold shadow-xs"
                : "text-ikm-text-secondary hover:text-ikm-text hover:bg-ikm-bg"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeStepTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-6">
            <h3 className="font-bold text-base text-ikm-text flex items-center gap-2">
              <Layers className="w-5 h-5 text-ikm-orange" />
              <span>{language === 'TH' ? 'ข้อมูลสรุปขอบเขตโครงการ (Project Summary)' : 'Project Scope Summary'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-ikm-bg border border-ikm-border text-xs">
              <div>
                <span className="text-ikm-text-secondary block">Work Request No.</span>
                <strong className="text-ikm-text font-mono text-sm">{currentRequest.id}</strong>
              </div>
              <div>
                <span className="text-ikm-text-secondary block">Job No.</span>
                <strong className="text-ikm-text font-mono text-sm">{currentRequest.jobNumber || 'PENDING'}</strong>
              </div>
              <div>
                <span className="text-ikm-text-secondary block">Client</span>
                <strong className="text-ikm-text font-semibold">{currentRequest.customer}</strong>
              </div>
              <div>
                <span className="text-ikm-text-secondary block">Service Category</span>
                <strong className="text-ikm-orange font-semibold">{currentRequest.serviceCategory}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-ikm-text">Scope of Work</label>
              <div className="p-4 rounded-xl bg-ikm-bg text-xs text-ikm-text border border-ikm-border leading-relaxed">
                {currentRequest.scopeOfWork}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
                <span className="font-bold text-ikm-text block">Location & Shift:</span>
                <p className="text-ikm-text-secondary">Site: <strong>{currentRequest.siteLocation}</strong></p>
                <p className="text-ikm-text-secondary">Environment: <strong className={currentRequest.isOffshore ? "text-blue-600" : ""}>{currentRequest.isOffshore ? 'Offshore Rig' : 'Onshore Facility'}</strong></p>
                <p className="text-ikm-text-secondary">Shift: <strong>{currentRequest.shift}</strong></p>
                <p className="text-ikm-text-secondary">Dates: <strong>{currentRequest.startDate} to {currentRequest.endDate}</strong></p>
              </div>

              <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
                <span className="font-bold text-ikm-text block">Key Personnel & Contacts:</span>
                <p className="text-ikm-text-secondary">Requester: <strong>{currentRequest.requester}</strong></p>
                <p className="text-ikm-text-secondary">Coordinator: <strong>{currentRequest.coordinator || 'Unassigned'}</strong></p>
                <p className="text-ikm-text-secondary">Commercial Resp: <strong>{currentRequest.commercialResponsiblePerson}</strong></p>
                <p className="text-ikm-text-secondary">Client Contact: <strong>{currentRequest.customerContact?.name} ({currentRequest.customerContact?.phone})</strong></p>
              </div>
            </div>
          </Card>

          {/* Quick Status Milestones */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-ikm-text flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ikm-orange" />
              <span>{language === 'TH' ? 'สถานะความคืบหน้า 22 ขั้นตอน' : '22-Step Progression Tracker'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { step: '1-3', title: 'Work Request & Review', done: currentStepNumber >= 2 },
                { step: '4-6', title: 'Risk & Resource Planning', done: currentStepNumber >= 4 },
                { step: '7-8', title: 'Job Plan & Approval', done: currentStepNumber >= 7 },
                { step: '9-10', title: 'Pre-Mob & Mobilization', done: currentStepNumber >= 10 },
                { step: '11-13', title: 'Work Execution & DPR', done: currentStepNumber >= 11 },
                { step: '14-16', title: 'Inspection & Client Accept', done: currentStepNumber >= 16 },
                { step: '17-18', title: 'Demob & Final Report', done: currentStepNumber >= 19 },
                { step: '19-22', title: 'Close-out & 5D Evaluation', done: currentStepNumber >= 20 },
              ].map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-ikm-bg border border-ikm-border">
                  <div className="flex items-center gap-2">
                    {m.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={cn("font-semibold", m.done ? "text-ikm-text" : "text-ikm-text-secondary")}>
                      {m.step}. {m.title}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded",
                    m.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  )}>
                    {m.done ? 'DONE' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Work Request Review & Revisions */}
      {activeStepTab === 'review' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-ikm-text">
              {language === 'TH' ? '1. การตรวจสอบคำของาน & Revision Control' : '1. Work Request & Revision Control'}
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 bg-ikm-bg border border-ikm-border rounded-lg text-ikm-orange">
              Revision {currentRequest.currentRevision}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
                <span className="font-bold text-ikm-text block">HSE Requirements</span>
                <ul className="list-disc list-inside space-y-1 text-ikm-text-secondary">
                  {currentRequest.hseRequirements?.map((h, i) => <li key={i}>{h}</li>) || <li>Standard IKM Offshore Safety Protocol</li>}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
                <span className="font-bold text-ikm-text block">QA/QC Requirements</span>
                <ul className="list-disc list-inside space-y-1 text-ikm-text-secondary">
                  {currentRequest.qaQcRequirements?.map((q, i) => <li key={i}>{q}</li>) || <li>ISO 17025 Calibrated Instrumentation</li>}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
                <span className="font-bold text-ikm-text block">Commercial Responsible</span>
                <p className="text-ikm-text">{currentRequest.commercialResponsiblePerson}</p>
                <p className="text-ikm-text-secondary">Project Reference: {currentRequest.projectReferenceNumber || 'N/A'}</p>
              </div>

              <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
                <span className="font-bold text-ikm-text block">Revision History ({currentRequest.revisions?.length || 0})</span>
                {currentRequest.revisions && currentRequest.revisions.length > 0 ? (
                  <div className="space-y-2">
                    {currentRequest.revisions.map((rev, i) => (
                      <div key={i} className="p-2 rounded bg-white dark:bg-slate-900 border border-ikm-border">
                        <span className="font-bold text-ikm-orange">Rev {rev.revisionNo}</span> · {rev.changedBy} ({rev.changedRole})
                        <p className="text-ikm-text-secondary mt-1">{rev.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No previous scope revisions recorded.</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Risk Assessment */}
      {activeStepTab === 'assessment' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? '2. การประเมินความซับซ้อนและความเสี่ยง (Risk & Complexity Assessment)' : '2. Risk & Complexity Assessment'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">กำหนดระดับ Approval Level และมาตรการลดความเสี่ยงก่อนวางแผน</p>
            </div>
            {currentAssessment && (
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                currentAssessment.overallRiskLevel === 'CRITICAL' ? "bg-red-100 text-red-700" :
                currentAssessment.overallRiskLevel === 'HIGH' ? "bg-orange-100 text-orange-700" :
                currentAssessment.overallRiskLevel === 'MEDIUM' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
              )}>
                OVERALL RISK: {currentAssessment.overallRiskLevel}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-ikm-bg border border-ikm-border">
              <span className="text-ikm-text-secondary block">Job Complexity</span>
              <strong className="text-ikm-text">{currentAssessment?.jobComplexity || 'HIGH'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-ikm-bg border border-ikm-border">
              <span className="text-ikm-text-secondary block">Technical Risk</span>
              <strong className="text-ikm-text">{currentAssessment?.technicalRisk || 'HIGH'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-ikm-bg border border-ikm-border">
              <span className="text-ikm-text-secondary block">Safety Risk</span>
              <strong className="text-ikm-text">{currentAssessment?.safetyRisk || 'MEDIUM'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-ikm-bg border border-ikm-border">
              <span className="text-ikm-text-secondary block">Required Approval Level</span>
              <strong className="text-ikm-orange font-bold">{currentAssessment?.requiredApprovalLevel || 'Country Manager'}</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2 text-xs">
            <span className="font-bold text-ikm-text block">Mitigation Plan:</span>
            <p className="text-ikm-text-secondary leading-relaxed">
              {currentAssessment?.mitigationPlan || 'Deploy senior certified supervisor, perform pre-job JSA, verify pressure rating certificates.'}
            </p>
          </div>
        </Card>
      )}

      {/* Tab 4: Resource Planning (Manpower & Equipment) */}
      {activeStepTab === 'planning' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-ikm-text">
              {language === 'TH' ? '3. การจัดสรรกำลังพลและเครื่องมือหลัก (Resource Planning & Conflict Check)' : '3. Manpower & Equipment Resource Allocation'}
            </h3>
            <span className="text-xs font-semibold text-ikm-text-secondary">Crew Template: 1 Supervisor + 2 Technicians</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Manpower Team */}
            <div className="space-y-3">
              <span className="font-bold text-ikm-text flex items-center gap-1.5">
                <Users className="w-4 h-4 text-ikm-orange" />
                <span>Assigned Crew ({currentJobPlan?.teamList?.length || 0})</span>
              </span>
              <div className="space-y-2">
                {currentJobPlan?.teamList?.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-ikm-bg border border-ikm-border flex items-center justify-between">
                    <div>
                      <strong className="text-ikm-text block">{m.employeeName}</strong>
                      <span className="text-ikm-text-secondary">{m.roleInCrew}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      {m.status}
                    </span>
                  </div>
                )) || <p className="text-slate-400 italic">No crew assigned yet.</p>}
              </div>
            </div>

            {/* Equipment List */}
            <div className="space-y-3">
              <span className="font-bold text-ikm-text flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-ikm-orange" />
                <span>Reserved Main Equipment ({currentJobPlan?.equipmentList?.length || 0})</span>
              </span>
              <div className="space-y-2">
                {currentJobPlan?.equipmentList?.map((eq, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-ikm-bg border border-ikm-border flex items-center justify-between">
                    <div>
                      <strong className="text-ikm-text block">{eq.equipmentName}</strong>
                      <span className="text-ikm-text-secondary font-mono">{eq.serialNumber}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {eq.status}
                    </span>
                  </div>
                )) || <p className="text-slate-400 italic">No equipment reserved yet.</p>}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: Job Plan */}
      {activeStepTab === 'jobplan' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-ikm-text">
              {language === 'TH' ? '4. แผนงานโครงการและวิธีการปฏิบัติ (Job Plan & Method Statement)' : '4. Job Plan & Method Statement'}
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg">
              Status: {currentJobPlan?.status || 'Approved'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
              <span className="font-bold text-ikm-text block">Method Statement Reference</span>
              <p className="text-ikm-text-secondary leading-relaxed">
                {currentJobPlan?.methodStatement || 'MS-IKM-HYD-2026-REV2: Standard Offshore Hydrotesting and Flange Management Procedure.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
              <span className="font-bold text-ikm-text block">Mobilization Logistics Plan</span>
              <p className="text-ikm-text-secondary">Depart: {currentJobPlan?.mobilizationPlan?.departLocation} on {currentJobPlan?.mobilizationPlan?.departDate}</p>
              <p className="text-ikm-text-secondary">Transport: {currentJobPlan?.mobilizationPlan?.transportMode}</p>
              <p className="text-ikm-text-secondary">Contact: {currentJobPlan?.mobilizationPlan?.siteContactPerson}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 6: Pre-Mob Checklist */}
      {activeStepTab === 'pre-mob' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-ikm-text">
              {language === 'TH' ? '5. รายการตรวจสอบก่อนเดินทาง (Pre-Mobilization Checklist - 17 Items)' : '5. Pre-Mobilization Checklist'}
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg">
              {currentPreMob?.overallStatus || 'Ready for Mobilization'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {currentPreMob?.items?.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-ikm-bg border border-ikm-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-ikm-text font-semibold">{item.title}</span>
                </div>
                <span className="text-[10px] text-ikm-text-secondary whitespace-nowrap">
                  {item.checkedBy || 'Verified'}
                </span>
              </div>
            )) || <p className="text-slate-400 italic">Checklist pending initialization.</p>}
          </div>
        </Card>
      )}

      {/* Tab 7: Work Execution & DPR */}
      {activeStepTab === 'dpr' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-ikm-text">
              {language === 'TH' ? '7. รายงานความคืบหน้ารายวัน (Daily Progress Report - DPR)' : '7. Daily Progress Report (DPR)'}
            </h3>
            <Button size="sm" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              {language === 'TH' ? 'สร้าง DPR ประจำวัน' : 'New DPR Entry'}
            </Button>
          </div>

          {jobDprs.length > 0 ? (
            <div className="space-y-4 text-xs">
              {jobDprs.map((dpr, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3">
                  <div className="flex items-center justify-between border-b border-ikm-border pb-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-ikm-orange font-bold text-sm">Day {dpr.dayNumber}</strong>
                      <span className="text-ikm-text-secondary">({dpr.reportDate})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>Planned: <strong>{dpr.plannedProgressPercent}%</strong></span>
                      <span>Actual: <strong>{dpr.actualProgressPercent}%</strong></span>
                      <span className={cn(
                        "font-bold px-2 py-0.5 rounded",
                        dpr.variancePercent >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        Variance: {dpr.variancePercent > 0 ? '+' : ''}{dpr.variancePercent}%
                      </span>
                    </div>
                  </div>

                  <p className="text-ikm-text leading-relaxed">{dpr.activitiesPerformed}</p>
                  <p className="text-ikm-text-secondary"><strong>Equipment & HSE:</strong> {dpr.equipmentCondition} · {dpr.hseObservations}</p>
                  <p className="text-ikm-text-secondary"><strong>Next Day Plan:</strong> {dpr.nextDayPlan}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No DPR submitted for this job yet.</p>
          )}
        </Card>
      )}

      {/* Tab 8: Audit Trail */}
      {activeStepTab === 'audit' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-ikm-text flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-ikm-orange" />
            <span>{language === 'TH' ? 'ประวัติการดำเนินการ (Audit Trail & Activity Log)' : 'Audit Trail & Activity Log'}</span>
          </h3>

          <div className="space-y-2 text-xs">
            {jobAuditLogs.map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-ikm-bg border border-ikm-border flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-ikm-text">{log.userName}</strong>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 font-bold">{log.userRole}</span>
                    <span className="font-mono text-ikm-orange">{log.action}</span>
                  </div>
                  <p className="text-ikm-text-secondary mt-1">{log.reason || `Value: ${log.newValue}`}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
